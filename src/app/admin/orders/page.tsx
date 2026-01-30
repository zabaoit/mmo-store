"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  MoreHorizontal,
  Eye,
  Check,
  X,
  Upload
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Lỗi khi tải đơn hàng: " + error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const cleanupExpiredOrders = async () => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("status", "PENDING_PAYMENT")
        .lt("expires_at", now);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error cleaning up expired orders:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await cleanupExpiredOrders();
      await fetchOrders();
    };
    init();
  }, []);

  const handleApprove = async (id: string) => {
    const approve = async () => {
      const { error } = await supabase.rpc("approve_order", { p_order_id: id });
      if (error) throw error;
      fetchOrders();
    };

    toast.promise(approve(), {
      loading: 'Đang duyệt đơn hàng...',
      success: 'Đã duyệt đơn hàng thành công!',
      error: (err) => `Lỗi khi duyệt đơn: ${err.message}`,
    });
  };

  const submitReject = async () => {
    if (!rejectId || !rejectReason) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "REJECTED", admin_note: rejectReason })
        .eq("id", rejectId);
      
      if (error) throw error;
      toast.success("Đã từ chối đơn hàng.");
      setRejectId(null);
      setRejectReason("");
      fetchOrders();
    } catch (error: any) {
      toast.error("Lỗi khi từ chối đơn: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-bold">Hoàn thành</Badge>;
      case "WAITING_APPROVAL":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold">Chờ duyệt</Badge>;
      case "PENDING_PAYMENT":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold">Chờ t.toán</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold font-outfit">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-1">Duyệt thanh toán và kiểm tra lịch sử giao dịch.</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm mã đơn, email..." className="pl-10 bg-secondary/30 border-none" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-4 cursor-pointer hover:bg-secondary">Tất cả</Badge>
            <Badge variant="outline" className="h-10 px-4 cursor-pointer hover:bg-secondary border-blue-500/50 text-blue-500 bg-blue-500/5">Chờ duyệt</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Minh chứng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="hover:bg-secondary/10">
                  <TableCell className="font-mono font-bold text-primary">{o.order_code}</TableCell>
                  <TableCell className="text-sm">{(o as any).profiles?.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString('vi-VN')}</TableCell>
                  <TableCell className="font-outfit font-bold">{parseFloat(o.total_amount).toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>
                    {o.payment_proof_url ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-8">
                            <Eye className="w-3.5 h-3.5" /> Xem bill
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Minh chứng thanh toán - {o.order_code}</DialogTitle>
                          </DialogHeader>
                          <div className="aspect-[3/4] bg-secondary/50 rounded-xl flex items-center justify-center border-2 border-dashed border-border group overflow-hidden">
                             <img 
                               src={o.payment_proof_url} 
                               alt="Payment Proof" 
                               className="w-full h-full object-contain"
                             />
                          </div>
                          <DialogFooter className="gap-2">
                             <Button 
                              variant="outline" 
                              className="text-red-500 border-red-500/50 hover:bg-red-500/5 flex-1 h-12"
                              onClick={() => setRejectId(o.id)}
                             >
                               <X className="w-4 h-4 mr-2" /> Từ chối
                             </Button>
                             <Button 
                              className="bg-green-600 hover:bg-green-700 text-white flex-1 h-12"
                              onClick={() => handleApprove(o.id)}
                              disabled={loading}
                             >
                               <Check className="w-4 h-4 mr-2" /> {loading ? "Đang xử lý..." : "Duyệt đơn"}
                             </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(o.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <ExternalLink className="w-4 h-4" /> Chi tiết đơn hàng
                        </DropdownMenuItem>
                        {o.status === 'WAITING_APPROVAL' && (
                          <>
                            <DropdownMenuItem 
                              className="gap-2 text-green-500 focus:text-green-500 cursor-pointer"
                              onClick={() => handleApprove(o.id)}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Phê duyệt đơn
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                              onClick={() => setRejectId(o.id)}
                            >
                              <XCircle className="w-4 h-4" /> Từ chối đơn
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && !loading && (
            <div className="text-center py-20 text-muted-foreground">
              Không tìm thấy đơn hàng nào.
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do để khách hàng có thể biết vì sao đơn hàng bị từ chối.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Ví dụ: Nội dung chuyển khoản không chính xác..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-secondary/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={submitReject} disabled={loading || !rejectReason}>
              {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

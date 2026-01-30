"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Download, 
  Clock, 
  ChevronRight, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Lỗi khi tải đơn hàng: " + error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getProductName = (items: any[]) => {
    if (!items || items.length === 0) return "Sản phẩm không xác định";
    const firstName = items[0].products?.name || "Sản phẩm";
    if (items.length > 1) {
      return `${firstName} và ${items.length - 1} sản phẩm khác`;
    }
    return firstName;
  };

  const handleDownload = async (orderId: string, orderCode: string) => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("content")
        .eq("order_id", orderId);

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("Không tìm thấy dữ liệu tài khoản cho đơn hàng này.");
        return;
      }

      const content = data.map(item => item.content).join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderCode}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Đã tải về danh sách tài khoản cho đơn ${orderCode}`);
    } catch (error: any) {
      toast.error("Lỗi khi tải file: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành</Badge>;
      case "WAITING_APPROVAL":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Chờ thanh toán</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-outfit font-bold text-4xl mb-2">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các đơn hàng bạn đã mua</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm mã đơn hàng..." className="pl-10 h-11 bg-secondary/30" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">Đang tải đơn hàng...</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-6 rounded-2xl bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background/50 rounded-xl flex items-center justify-center border border-border/50 shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg font-mono">{order.order_code}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('vi-VN')} • {getProductName(order.order_items)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-12">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Tổng tiền</p>
                    <p className="font-bold text-lg">{parseFloat(order.total_amount).toLocaleString('vi-VN')} VNĐ</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "COMPLETED" ? (
                      <Button 
                        variant="outline" 
                        className="h-11 font-bold border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => handleDownload(order.id, order.order_code)}
                      >
                        <Download className="w-4 h-4 mr-2" /> Tải về
                      </Button>
                    ) : order.status === "REJECTED" ? (
                      <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>{order.admin_note || "Nội dung chuyển khoản không hợp lệ"}</span>
                      </div>
                    ) : null}
                    
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-lg">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-32 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          <Link href="/">
             <Button className="mt-4">Mua ngay sản phẩm đầu tiên</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { use, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Package, 
  Download, 
  Copy, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      // 1. Fetch order with items
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            subtotal,
            products (
              name
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Lỗi khi tải chi tiết đơn hàng: " + error.message);
      } else {
        setOrder(data);
        
        // 2. If completed, fetch delivered items
        if (data.status === "COMPLETED") {
          const { data: items, error: itemsError } = await supabase
            .from("inventory")
            .select("*")
            .eq("order_id", id);
          
          if (!itemsError) {
            setAccounts(items || []);
          }
        }
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [id]);

  const copyAll = () => {
    const text = accounts.map(a => a.content).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép toàn bộ tài khoản!");
  };

  const handleDownload = () => {
    if (accounts.length === 0) return;
    const text = accounts.map(a => a.content).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${order.order_code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file tài khoản!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Hoàn thành</Badge>;
      case "WAITING_APPROVAL":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1"><Clock className="w-4 h-4 mr-1.5" /> Chờ duyệt</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1"><XCircle className="w-4 h-4 mr-1.5" /> Bị từ chối</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1">Chờ thanh toán</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary/50 rounded w-1/4 mx-auto"></div>
          <div className="h-8 bg-secondary/50 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
        <Link href="/orders">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại lịch sử mua hàng</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-mono uppercase">{order.order_code}</h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-muted-foreground">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        {order.status === "COMPLETED" && (
           <div className="flex items-center gap-3">
             <Button onClick={handleDownload} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
               <Download className="w-4 h-4" /> Tải về (.txt)
             </Button>
             <Button onClick={copyAll} className="gap-2 shadow-lg shadow-primary/20">
               <Copy className="w-4 h-4" /> Sao chép tất cả
             </Button>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Order Content */}
          {order.status === "COMPLETED" ? (
            <div className="space-y-4">
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-green-500" /> 
                 Thông tin tài khoản đã bàn giao
               </h3>
               <div className="rounded-xl overflow-hidden border border-border/50 bg-secondary/10">
                 <div className="p-4 bg-secondary/20 border-b border-border/50 flex justify-between items-center">
                   <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nội dung tài khoản</span>
                   <span className="text-xs font-bold text-primary">{accounts.length} sản phẩm</span>
                 </div>
                 <div className="p-0">
                   <pre className="p-6 font-mono text-xs leading-loose overflow-x-auto bg-black/20">
                     {accounts.length > 0 
                       ? accounts.map(a => a.content).join("\n")
                       : "Đang trích xuất dữ liệu..."}
                   </pre>
                 </div>
               </div>
               <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-primary mb-1 uppercase tracking-tight">Lưu ý bảo mật:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vui lòng kiểm tra tài khoản ngay sau khi nhận.</li>
                      <li>Đổi mật khẩu và thông tin bảo mật để đảm bảo quyền sở hữu.</li>
                      <li>Dữ liệu này sẽ được lưu trữ trong vòng 48 giờ.</li>
                    </ul>
                  </div>
               </div>
            </div>
          ) : order.status === "REJECTED" ? (
             <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Đơn hàng bị từ chối</h3>
                <p className="text-muted-foreground mb-4">Lý do: {order.admin_note || "Nội dung thanh toán không hợp lệ hoặc không tìm thấy giao dịch."}</p>
                <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/5">Liên hệ hỗ trợ</Button>
             </div>
          ) : order.status === "WAITING_APPROVAL" ? (
             <div className="p-12 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center">
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Đang chờ hệ thống xử lý</h3>
                <p className="text-muted-foreground">Admin đang kiểm tra giao dịch của bạn. Vui lòng quay lại sau vài phút.</p>
             </div>
          ) : (
             <div className="p-12 rounded-3xl bg-secondary/20 border border-border/50 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold mb-4">Đơn hàng chưa hoàn tất thanh toán</h3>
                <Link href="/checkout">
                  <Button className="font-bold">Tiếp tục thanh toán</Button>
                </Link>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h3 className="font-bold mb-4 pb-4 border-b">Chi tiết đơn hàng</h3>
            <div className="space-y-4">
              {order.order_items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.products?.name}</p>
                    <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{parseFloat(item.subtotal).toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
              <div className="pt-4 border-t flex justify-between items-center font-bold">
                <span>Tổng tiền:</span>
                <span className="text-xl text-primary font-outfit">{parseFloat(order.total_amount).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Hỗ trợ khách hàng</h4>
             <div className="space-y-3">
               <Button variant="ghost" className="w-full justify-start h-12 gap-3 bg-background/30 border border-border/50">
                 <ExternalLink className="w-4 h-4" /> Fanpage hỗ trợ
               </Button>
               <Button variant="ghost" className="w-full justify-start h-12 gap-3 bg-background/30 border border-border/50">
                 <AlertCircle className="w-4 h-4" /> Báo lỗi/Khiếu nại
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

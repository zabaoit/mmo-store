"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyPaymentAction } from "@/app/actions/payment";

export default function CheckoutPage() {
  const { getTotalPrice, items, clearCart } = useCartStore();
  const [step, setStep] = useState(1); // 1: Confirmation, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login?redirect=/checkout");
        return;
      }
      setUser(user);
    };
    fetchUser();
    // Generate order code once
    setOrderCode("MMO-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  }, []);

  const totalPrice = getTotalPrice();

  const handleCreateOrder = async () => {
    if (!user) return;
    setLoading(true);
    // Generate/Regenerate order code to avoid 409 Conflict on retries
    const newOrderCode = "MMO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderCode(newOrderCode);

    try {
      // 1. Create the main order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          order_code: newOrderCode,
          status: "PENDING_PAYMENT",
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id.includes("MOCK-ID-") ? 1 : parseInt(item.id),
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(order.id);
      toast.success("Đơn hàng đã được khởi tạo");
      setStep(2);
    } catch (error: any) {
      toast.error("Lỗi khi tạo đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      // 1. Verify payment via Server Action (avoids CORS)
      const verification = await verifyPaymentAction(orderCode, totalPrice);
      
      if (!verification.success) {
        toast.error(verification.message);
        setLoading(false);
        return;
      }

      // 2. If verified, update status to WAITING_APPROVAL
      const { error } = await supabase
        .from("orders")
        .update({ status: "WAITING_APPROVAL" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Thanh toán đã được xác nhận thành công!");
      clearCart();
      setStep(3);
    } catch (error: any) {
      toast.error("Lỗi khi xác nhận thanh toán: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào bộ nhớ tạm");
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng đã thanh toán hoặc trống</h1>
        <Link href="/">
          <Button className="mt-4">Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
           <div className="flex items-center gap-2 text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors group">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             <Link href="/cart" className="text-sm font-medium">Quay lại giỏ hàng</Link>
          </div>
          <h1 className="text-4xl font-bold font-outfit">Xác nhận đơn hàng</h1>
          <div className="bg-secondary/20 border border-border/50 rounded-3xl p-8 space-y-6">
            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t flex justify-between items-end">
              <span className="text-xl font-bold">Tổng thanh toán:</span>
              <span className="text-3xl font-bold text-primary font-outfit">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="w-full h-14 font-bold text-lg"
            onClick={handleCreateOrder}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
          <h1 className="text-4xl font-bold font-outfit text-center">Thanh toán chuyển khoản</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* QR Code Column */}
            <div className="bg-white p-6 rounded-3xl flex flex-col items-center shadow-2xl">
              <div className="w-full aspect-square bg-slate-100 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                 <img 
                   src={`https://img.vietqr.io/image/970436-9383198407-compact.png?amount=${totalPrice}&addInfo=${orderCode}&accountName=LE%20QUY%20BAO`} 
                   alt="VietQR"
                   className="w-full h-full object-contain"
                 />
              </div>
              <p className="text-slate-500 text-sm font-medium">Quét mã QR để thanh toán nhanh</p>
            </div>

            {/* Details Column */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ngân hàng</label>
                  <p className="font-bold text-lg">MB BANK</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Số tài khoản</label>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg">173005200</p>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('173005200')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nội dung chuyển khoản</label>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="font-bold text-primary text-xl font-mono">{orderCode}</p>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20" onClick={() => copyToClipboard(orderCode)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-500 leading-relaxed">
                  Vui lòng chuyển <b>chính xác số tiền</b> và <b>nội dung chuyển khoản</b> để hệ thống tự động duyệt đơn trong 1-3 phút.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-14 font-bold text-lg shadow-xl shadow-primary/20"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? "Đang xác nhận..." : "Xác nhận đã chuyển khoản"}
                </Button>
                <div className="flex items-center gap-2">
                   <Input type="file" id="bill" className="hidden" />
                   <Button variant="outline" className="w-full h-12" onClick={() => document.getElementById('bill')?.click()}>
                     <Upload className="w-4 h-4 mr-2" /> Tải lên hóa đơn (Tùy chọn)
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold font-outfit">Đơn hàng đã được ghi nhận!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Mã đơn hàng: <span className="font-bold text-foreground">{orderCode}</span>. 
            Vui lòng chờ Admin duyệt trong giây lát. Bạn có thể theo dõi tại Lịch sử đơn hàng.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button size="lg" className="h-14 px-8 font-bold">Xem đơn hàng</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="h-14 px-8 font-bold">Về trang chủ</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

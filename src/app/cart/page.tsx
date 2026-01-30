"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-8">Hãy chọn cho mình bộ tài khoản ưng ý nhất nhé!</p>
        <Link href="/">
          <Button size="lg" className="font-bold">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-muted-foreground mb-8 cursor-pointer hover:text-primary transition-colors group">
         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <Link href="/" className="text-sm font-medium">Tiếp tục chọn hàng</Link>
      </div>

      <h1 className="text-4xl font-bold font-outfit mb-10">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl bg-secondary/20 border border-border/50 flex flex-col md:flex-row items-center gap-6 group hover:bg-secondary/30 transition-all">
              <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Badge className="bg-primary/20 text-primary border-none text-[10px]">{item.category}</Badge>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">Đơn giá: {item.price.toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg bg-background/50 overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-none"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-none"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="w-32 text-right hidden md:block">
                  <p className="font-bold text-primary">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</p>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 sticky top-28">
            <h2 className="text-xl font-bold mb-6">Tổng đơn hàng</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Số lượng sản phẩm:</span>
                <span className="font-bold text-foreground">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính:</span>
                <span className="font-bold text-foreground">{getTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-end">
                <span className="font-bold">Tổng cộng:</span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary font-outfit">{getTotalPrice().toLocaleString('vi-VN')}</p>
                  <p className="text-xs text-muted-foreground font-bold">VNĐ</p>
                </div>
              </div>
            </div>

            <Link href="/checkout">
              <Button size="lg" className="w-full h-14 font-bold text-lg shadow-xl shadow-primary/20">
                Thanh toán ngay <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

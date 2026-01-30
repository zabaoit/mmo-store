"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowLeft, 
  Minus, 
  Plus, 
  ShoppingCart,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    name: "Gmail Legacy Account - Verified 2020",
    price: 25000,
    stock: 157,
    category: "Gmail",
    description: "Tài khoản Gmail cổ reg từ năm 2020, đã trust cao, phù hợp để chạy quảng cáo, seeding hoặc làm tài khoản chính. Đã được check live 100%.",
    warranty: "Bảo hành 1 đổi 1 trong vòng 24h nếu lỗi login hoặc sai pass.",
    rules: [
      "Không bảo hành nếu vi phạm chính sách Google.",
      "Vui lòng đổi mật khẩu sau khi nhận hàng.",
      "Check live trước khi sử dụng số lượng lớn."
    ]
  };

  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleQuantity = (val: number) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: "MOCK-ID-" + slug, // Using slug as part of ID for mock
      name: product.name,
      price: product.price,
      quantity: quantity,
      category: product.category,
      slug: slug,
      stock: product.stock
    });
    toast.success("Đã thêm vào giỏ hàng!", {
      action: {
        label: "Xem giỏ hàng",
        onClick: () => router.push("/cart")
      }
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: "MOCK-ID-" + slug,
      name: product.name,
      price: product.price,
      quantity: quantity,
      category: product.category,
      slug: slug,
      stock: product.stock
    });
    router.push("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại cửa hàng</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Info & Meta */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-none">{product.category}</Badge>
              <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/5">Còn hàng</Badge>
            </div>
            <h1 className="font-outfit font-bold text-4xl md:text-5xl mb-6">{product.name}</h1>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                <ShieldCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Bảo hành</p>
                <p className="text-xs font-bold font-outfit">24 GIỜ</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Giao hàng</p>
                <p className="text-xs font-bold font-outfit">TỰ ĐỘNG</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Thời gian</p>
                <p className="text-xs font-bold font-outfit">TỨC THÌ</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-bold mb-3">Mô tả sản phẩm</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
              
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 mb-8">
                <h4 className="flex items-center gap-2 text-primary font-bold mb-3">
                  <ShieldCheck className="w-4 h-4" /> Chính sách bảo hành
                </h4>
                <p className="text-sm text-muted-foreground">{product.warranty}</p>
              </div>

              <h3 className="text-lg font-bold mb-3">Quy định sử dụng</h3>
              <ul className="space-y-2 list-none p-0">
                {product.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Right: Purchase Box */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 p-8 rounded-3xl bg-secondary/30 border border-border/50 shadow-2xl">
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">Đơn giá</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold font-outfit text-primary">
                  {product.price.toLocaleString('vi-VN')}
                </span>
                <span className="text-xl font-bold text-muted-foreground">VNĐ</span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Số lượng mua</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-xl bg-background/50 overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 rounded-none hover:bg-secondary"
                      onClick={() => handleQuantity(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input 
                      className="w-16 h-11 border-none bg-transparent text-center font-bold text-lg focus-visible:ring-0"
                      value={quantity}
                      readOnly
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 rounded-none hover:bg-secondary"
                      onClick={() => handleQuantity(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">Kho: <span className="font-bold text-foreground">{product.stock}</span></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-dashed border-border/50">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-primary">{(product.price * quantity).toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                size="lg" 
                className="h-14 font-bold text-lg shadow-xl shadow-primary/20"
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="h-14 font-bold text-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Thêm vào giỏ
              </Button>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Liên hệ hỗ trợ nếu cần tư vấn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

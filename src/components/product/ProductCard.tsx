"use client";

import { ShoppingCart, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  slug: string;
}

export default function ProductCard({ id, name, price, stock, category, slug }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleBuyNow = () => {
    addItem({
      id,
      name,
      price,
      quantity: 1,
      category,
      slug,
      stock
    });
    router.push("/checkout");
  };

  return (
    <Card className="group overflow-hidden border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-foreground border-none">
            {category}
          </Badge>
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
             <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span>Bảo hành 24h</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>Tự động</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold font-outfit text-primary">
              {price.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-muted-foreground ml-1 font-medium">VNĐ</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Kho hàng</p>
            <p className={`text-sm font-bold ${stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock > 0 ? stock : 'Hết hàng'}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-2">
        <Link href={`/product/${slug}`} className="flex-1">
          <Button variant="outline" className="w-full font-bold">Chi tiết</Button>
        </Link>
        <Button 
          className="font-bold flex-1" 
          disabled={stock === 0}
          onClick={handleBuyNow}
        >
          Mua ngay
        </Button>
      </CardFooter>
    </Card>
  );
}

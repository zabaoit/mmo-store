"use client";

import { use } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  
  // Mock data for products
  const products = [
    { id: "1", name: `${slug.toUpperCase()} Legacy Account`, price: 15000, stock: 150, category: slug, slug: "legacy-acc" },
    { id: "2", name: `${slug.toUpperCase()} Verified 2023`, price: 45000, stock: 42, category: slug, slug: "verified-2023" },
    { id: "3", name: `${slug.toUpperCase()} High Trust Score`, price: 85000, stock: 12, category: slug, slug: "high-trust" },
    { id: "4", name: `${slug.toUpperCase()} Bulk Package (x10)`, price: 120000, stock: 5, category: slug, slug: "bulk-10" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại trang chủ</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-outfit font-bold text-4xl mb-2 capitalize">{slug} Accounts</h1>
          <p className="text-muted-foreground">Khám phá danh sách tài khoản {slug} chất lượng cao nhất</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm trong danh mục..." className="pl-10 h-11 bg-secondary/30" />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Empty State (Optional) */}
      {products.length === 0 && (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">Hiện chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      )}
    </div>
  );
}

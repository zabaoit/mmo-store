"use client";

import { use, useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get category info
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .single();

        if (catError) throw catError;
        setCategory(catData);

        // 2. Get products in this category with real inventory count
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select(`
            *,
            categories(name),
            inventory(count)
          `)
          .eq("category_id", catData.id)
          .eq("is_active", true);

        if (prodError) throw prodError;

        // Custom formatting to match ProductCardProps
        const formattedProducts = prodData.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: parseFloat(p.price),
          stock: p.inventory?.[0]?.count || 0,
          category: p.categories?.name || "",
          slug: p.slug
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs / Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại trang chủ</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-outfit font-bold text-4xl mb-2 capitalize">{category?.name || slug}</h1>
          <p className="text-muted-foreground">{category?.description || `Khám phá danh sách tài khoản ${slug} chất lượng cao nhất`}</p>
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

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">Hiện chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      )}
    </div>
  );
}

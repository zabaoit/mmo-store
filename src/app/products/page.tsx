"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ProductCard from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, Package } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");

  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*, categories(name)")
          .eq("is_active", true);

        if (searchTerm) {
          query = query.ilike("name", `%${searchTerm}%`);
        }

        if (selectedCategory !== "all") {
          // Find category ID from slug/name if needed, or query by join
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", selectedCategory)
            .single();
          
          if (cat) {
            query = query.eq("category_id", cat.id);
          }
        }

        if (sortBy === "price-low") {
          query = query.order("price", { ascending: true });
        } else if (sortBy === "price-high") {
          query = query.order("price", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        // Fetch stock for each product
        const productsWithStock = await Promise.all((data || []).map(async (p) => {
          const { count } = await supabase
            .from("inventory")
            .select("*", { count: 'exact', head: true })
            .eq("product_id", p.id)
            .eq("status", "AVAILABLE");
          
          return {
            ...p,
            category_name: p.categories?.name || "Uncategorized",
            stock: count || 0
          };
        }));

        setProducts(productsWithStock);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold font-outfit mb-2">Tất cả sản phẩm</h1>
          <p className="text-muted-foreground">Khám phá và tìm kiếm các loại tài khoản phù hợp với nhu cầu của bạn</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm tên sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/30 border-border/50 h-11 rounded-xl"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50 z-10" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-4 h-11 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none min-w-[160px]"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50 z-10" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-4 h-11 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none min-w-[160px]"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-secondary/20 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id.toString()}
              name={product.name}
              price={product.price}
              stock={product.stock}
              category={product.category_name}
              slug={product.slug}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border/50 mr-2">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm nào</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa "{searchTerm}". 
            Thử thay đổi bộ lọc hoặc tìm kiếm tên khác xem sao.
          </p>
          <Button 
            variant="outline" 
            className="mt-8"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-secondary/20 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-secondary/20 animate-pulse border border-border/50" />
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

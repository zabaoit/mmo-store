"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";

interface CategorySearchProps {
  initialProducts: any[];
}

export default function CategorySearch({ initialProducts }: CategorySearchProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3 justify-end -mt-20 relative z-20">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm trong danh mục..." 
            className="pl-10 h-11 bg-secondary/30" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">Hiện chưa có sản phẩm nào khớp với tìm kiếm.</p>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSideClient } from "@/lib/supabase-server";
import CategorySearch from "./CategorySearch";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createServerSideClient();

  // 1. Get category info
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  if (catError || !catData) {
    console.error("DEBUG - Category fetch error on server:", catError);
    return notFound();
  }

  // 2. Get products in this category
  const { data: prodData, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", catData.id)
    .eq("is_active", true);

  if (prodError) {
    console.error("DEBUG - Products fetch error on server:", prodError);
    // Continue with empty products if needed, or throw
  }

  // 3. Fetch AVAILABLE stock for each product
  const formattedProducts = await Promise.all((prodData || []).map(async (p) => {
    const { count: availableStock } = await supabase
      .from("inventory")
      .select("*", { count: 'exact', head: true })
      .eq("product_id", p.id)
      .eq("status", "AVAILABLE");

    return {
      id: p.id.toString(),
      name: p.name,
      price: parseFloat(p.price),
      stock: availableStock || 0,
      category: catData.name,
      slug: p.slug
    };
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs / Back */}
      <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại danh sách</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-outfit font-bold text-4xl mb-2 capitalize">{catData.name}</h1>
          <p className="text-muted-foreground">{catData.description || `Khám phá danh sách tài khoản ${catData.name} chất lượng cao nhất`}</p>
        </div>
      </div>

      <CategorySearch initialProducts={formattedProducts} />
    </div>
  );
}

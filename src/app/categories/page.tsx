"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { 
  Monitor,
  Mail,
  Facebook,
  Smartphone,
  Globe,
  CircleEllipsis,
  ArrowRight
} from "lucide-react";

const IconMap: Record<string, any> = {
  "Mail": Mail,
  "Facebook": Facebook,
  "Smartphone": Smartphone,
  "Monitor": Monitor,
  "Globe": Globe,
  "CircleEllipsis": CircleEllipsis,
};

const ColorMap: Record<string, { color: string, bg: string }> = {
  "Gmail / Email": { color: "text-red-500", bg: "bg-red-500/10" },
  "Facebook Accounts": { color: "text-blue-500", bg: "bg-blue-500/10" },
  "TikTok / Social": { color: "text-pink-500", bg: "bg-pink-500/10" },
  "Software / Tools": { color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*, products(id)");

        if (catError) throw catError;

        const formattedCategories = catData.map(cat => {
          const styles = ColorMap[cat.name] || { color: "text-primary", bg: "bg-primary/10" };
          return {
            ...cat,
            count: cat.products?.length || 0,
            icon: IconMap[cat.icon_name] || CircleEllipsis,
            ...styles
          };
        });

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-outfit mb-4">Danh mục tài khoản</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chúng tôi cung cấp đa dạng các loại tài khoản MMO, mạng xã hội và công cụ hỗ trợ công việc trực tuyến của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-secondary/20 animate-pulse border border-border/50" />
          ))
        ) : (
          categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div className="group p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-500 h-full flex flex-col items-center text-center">
                <div className={`w-20 h-20 ${cat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <cat.icon className={`w-10 h-10 ${cat.color}`} />
                </div>
                <h3 className="font-bold text-2xl mb-2">{cat.name}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{cat.description || `Khám phá các sản phẩm thuộc nhóm ${cat.name}`}</p>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span>{cat.count} sản phẩm</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight,
  Monitor,
  Mail,
  Facebook,
  Smartphone,
  Globe,
  CircleEllipsis
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

// Icon mapping from database string to Lucide component
const IconMap: Record<string, any> = {
  "Mail": Mail,
  "Facebook": Facebook,
  "Smartphone": Smartphone,
  "Monitor": Monitor,
  "Globe": Globe,
  "CircleEllipsis": CircleEllipsis,
};

// Default styling mapping for categories
const ColorMap: Record<string, { color: string, bg: string }> = {
  "Gmail / Email": { color: "text-red-500", bg: "bg-red-500/10" },
  "Facebook Accounts": { color: "text-blue-500", bg: "bg-blue-500/10" },
  "TikTok / Social": { color: "text-pink-500", bg: "bg-pink-500/10" },
  "Software / Tools": { color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories and their products count
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

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
           
            <h1 className="font-outfit font-bold text-5xl md:text-7xl mb-6 tracking-tight leading-tight">
              Hệ sinh thái tài khoản <span className="text-primary">MMO Enterprise</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Cung cấp nền tảng bán tài khoản mạng xã hội dạng số chất lượng cao. Giao hàng tự động, bảo mật tuyệt đối và hỗ trợ 24/7.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#categories">
                <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/30">
                  Mua ngay <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#categories">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-border/50 hover:bg-secondary/50">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>Bảo mật tuyệt đối</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Giao hàng tức thì</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
      </section>

      {/* Categories Grid */}
      <section id="categories" className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-outfit font-bold text-3xl mb-2">Danh mục hàng hóa</h2>
            <p className="text-muted-foreground">Lựa chọn loại tài khoản phù hợp với nhu cầu của bạn</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex group">
            Xem tất cả <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton loader
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/20 animate-pulse border border-border/50" />
            ))
          ) : (
            categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <div className="group p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300">
                  <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} sản phẩm có sẵn</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-secondary/20 py-20 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold font-outfit text-primary mb-2">10k+</div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Khách hàng tin tưởng</p>
            </div>
            <div>
              <div className="text-4xl font-bold font-outfit text-primary mb-2">1.5M+</div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Tài khoản đã bán</p>
            </div>
            <div>
              <div className="text-4xl font-bold font-outfit text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Tỷ lệ hài lòng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

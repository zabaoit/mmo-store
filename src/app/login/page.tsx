"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-outfit mb-2">Đăng nhập tài khoản</h1>
          <p className="text-muted-foreground">Chào mừng bạn quay trở lại với MMO Store</p>
        </div>

        <form 
          className="p-8 rounded-3xl bg-secondary/30 border border-border/50 shadow-2xl space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="pl-10 h-12 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type={showPassword ? "text" : "password"} 
                className="pl-10 pr-10 h-12 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right">
              <Link href="/forgot-password" title="Quên mật khẩu" className="text-xs text-primary font-bold hover:underline">Quên mật khẩu?</Link>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 font-bold text-lg shadow-xl shadow-primary/20" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-muted-foreground">Hoặc tiếp tục với</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" className="h-12 border-border/50 hover:bg-secondary/50">Google</Button>
            <Button type="button" variant="outline" className="h-12 border-border/50 hover:bg-secondary/50">Facebook</Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link href="/register" className="text-primary font-bold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

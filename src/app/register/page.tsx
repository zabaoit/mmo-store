"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  User
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
      router.push("/login");
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-outfit mb-2">Tạo tài khoản mới</h1>
          <p className="text-muted-foreground">Tham gia cùng hàng nghìn Sellers MMO khác</p>
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
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Tên đăng nhập / Email</label>
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type={showPassword ? "text" : "password"} 
                className="pl-10 h-12 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 mb-4">
             <input type="checkbox" id="terms" className="mt-1 accent-primary" required />
             <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
               Tôi đồng ý với các <Link href="/terms" className="text-primary hover:underline">Điều khoản dịch vụ</Link> và <Link href="/policy" className="text-primary hover:underline">Chính sách bảo mật</Link> của MMO Store.
             </label>
          </div>

          <Button type="submit" className="w-full h-12 font-bold text-lg shadow-xl shadow-primary/20" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo tài khoản"} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Đã có tài khoản? <Link href="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

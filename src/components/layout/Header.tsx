"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  History 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (!error) {
      setProfile(data);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    };
    checkUser();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            M
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight hidden sm:block">
            MMO<span className="text-primary text-2xl">.</span>STORE
          </span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm tài khoản..." 
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        {/* Nav Actions */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center text-primary-foreground">
                {mounted ? totalItems : 0}
              </span>
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2 ml-2">
            {mounted && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-primary/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold truncate max-w-[100px]">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {profile?.role || 'Khách hàng'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-border/50">
                  <DropdownMenuLabel className="font-outfit font-bold">Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/orders">
                    <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <span>Lịch sử đơn hàng</span>
                    </DropdownMenuItem>
                  </Link>
                  {(profile?.role === 'admin' || profile?.role === 'staff') && (
                    <Link href="/admin">
                      <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 text-primary focus:text-primary">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="font-bold">Trang quản trị</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer py-2.5 text-red-500 focus:text-red-500 focus:bg-red-500/5"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button className="shadow-lg shadow-primary/20">Bắt đầu ngay</Button>
                </Link>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="sm:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}

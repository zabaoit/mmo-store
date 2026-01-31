"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  Bell,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    getUser();
  }, [supabase]);

  // Total unread messages listener
  useEffect(() => {
    const fetchUnreadTotal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from("chat_messages")
        .select("*", { count: 'exact', head: true })
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (!error) setUnreadTotal(count || 0);
    };

    fetchUnreadTotal();

    const channel = supabase
      .channel("admin_global_unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => fetchUnreadTotal()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    useCartStore.getState().clearCart();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
    { label: "Đơn hàng", icon: ShoppingCart, href: "/admin/orders" },
    { label: "Sản phẩm", icon: Package, href: "/admin/products" },
    { label: "Danh mục", icon: LayoutDashboard, href: "/admin/categories" },
    { label: "Kho hàng", icon: Package, href: "/admin/inventory" },
    { label: "Khách hàng", icon: Users, href: "/admin/users" },
    { label: "Chat hỗ trợ", icon: MessageSquare, href: "/admin/chat" },
  ];

  const checkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">M</div>
              <span className="font-outfit font-bold text-lg tracking-tight">ADMIN PANEL</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = checkActive(item.href);
              return (
                <Link key={item.label} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    className={`w-full justify-start gap-3 h-11 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.label === "Chat hỗ trợ" && unreadTotal > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] rounded-full flex items-center justify-center px-1 text-[10px] font-bold">
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                      </Badge>
                    )}
                    {isActive && item.label !== "Chat hỗ trợ" && <ChevronRight className="ml-auto w-4 h-4" />}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 h-11"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{profile ? profile.email.split('@')[0] : "Admin"}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize font-medium">{profile?.role || "Đang tải..."}</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-primary uppercase text-sm">
                {profile ? profile.email[0] : "A"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

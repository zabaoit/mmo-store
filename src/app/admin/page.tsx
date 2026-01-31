"use client";

import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch Stats
        // Get total revenue (Completed orders)
        const { data: revenueData } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "COMPLETED");
        
        const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

        // Get total orders
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: 'exact', head: true });

        // Get total users
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        // Get low stock products (stock < 5)
        const { data: productsData } = await supabase
          .from("products")
          .select("id")
          .eq("is_active", true);
        
        const { data: availableInventory } = await supabase
          .from("inventory")
          .select("product_id")
          .eq("status", "AVAILABLE");

        let lowStockCount = 0;
        if (productsData && availableInventory) {
          productsData.forEach(p => {
            const stock = availableInventory.filter(i => i.product_id === p.id).length;
            if (stock < 5) lowStockCount++;
          });
        }

        setStats([
          { label: "Tổng doanh thu", value: `${totalRevenue.toLocaleString('vi-VN')}đ`, icon: TrendingUp, trend: "Lũy kế", color: "text-green-500" },
          { label: "Tổng đơn hàng", value: orderCount?.toString() || "0", icon: ShoppingCart, trend: "Tất cả", color: "text-blue-500" },
          { label: "Người dùng", value: userCount?.toString() || "0", icon: Users, trend: "Thành viên", color: "text-purple-500" },
          { label: "Kho hàng thấp", value: `${lowStockCount} sản phẩm`, icon: Package, trend: "Cần nhập", color: "text-yellow-500" },
        ]);

        // 2. Fetch Recent Orders
        const { data: orders } = await supabase
          .from("orders")
          .select(`
            *,
            profiles(email)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentOrders(orders || []);

        // 3. Real Chart Data Aggregation (Past 7 days)
        const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: chartOrders } = await supabase
          .from("orders")
          .select("total_amount, created_at")
          .eq("status", "COMPLETED")
          .gte("created_at", sevenDaysAgo.toISOString());

        const aggregatedData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayLabel = dayLabels[(date.getDay() + 6) % 7];
          
          const dailyRevenue = chartOrders?.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate.toDateString() === date.toDateString();
          }).reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

          aggregatedData.push({ name: dayLabel, revenue: dailyRevenue });
        }
        setChartData(aggregatedData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground mt-1">Dữ liệu được cập nhật theo thời gian thực từ cơ sở dữ liệu.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-secondary text-muted-foreground uppercase">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 font-outfit">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Biểu đồ doanh thu tuần</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs text-muted-foreground font-medium">Doanh thu dự tính (VNĐ)</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 12}}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px'}}
                  cursor={{stroke: 'var(--primary)', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6">Đơn hàng mới nhất</h3>
          <div className="space-y-6 flex-1">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">Chưa có đơn hàng nào.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-sm text-primary">
                      {order.profiles?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{order.profiles?.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{order.order_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{Number(order.total_amount).toLocaleString('vi-VN')}đ</p>
                    <span className={`text-[10px] font-bold uppercase ${
                      order.status === 'COMPLETED' ? 'text-green-500' :
                      order.status === 'WAITING_APPROVAL' ? 'text-blue-500' : 
                      order.status === 'REJECTED' ? 'text-red-500' : 
                      order.status === 'CANCELLED' ? 'text-gray-500' : 'text-yellow-500'
                    }`}>
                      {order.status === 'COMPLETED' ? 'Hoàn tất' : 
                       order.status === 'WAITING_APPROVAL' ? 'Chờ duyệt' :
                       order.status === 'REJECTED' ? 'Từ chối' :
                       order.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ TT'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full mt-8 border-border/50">Xem tất cả đơn hàng</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

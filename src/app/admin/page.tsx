"use client";

import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3000, orders: 18 },
  { name: "Wed", revenue: 5000, orders: 32 },
  { name: "Thu", revenue: 4500, orders: 28 },
  { name: "Fri", revenue: 6000, orders: 45 },
  { name: "Sat", revenue: 8000, orders: 58 },
  { name: "Sun", revenue: 7000, orders: 52 },
];

export default function AdminDashboard() {
  const stats = [
    { label: "Doanh thu ngày", value: "2,450,000đ", icon: TrendingUp, trend: "+12.5%", color: "text-green-500" },
    { label: "Đơn hàng mới", value: "48", icon: ShoppingCart, trend: "+5.2%", color: "text-blue-500" },
    { label: "Khách hàng mới", value: "12", icon: Users, trend: "-2.1%", color: "text-red-500" },
    { label: "Tồn kho thấp", value: "5 sản phẩm", icon: Package, trend: "Cảnh báo", color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground mt-1">Chào buổi sáng, Admin! Dưới đây là thống kê hôm nay.</p>
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
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 
                stat.trend.startsWith('-') ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 font-outfit">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Biểu đồ doanh thu tuần</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs text-muted-foreground font-medium">Doanh thu (VNĐ)</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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

        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Đơn hàng mới nhất</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-bold text-xs">U{i}</div>
                  <div>
                    <p className="text-sm font-bold">customer{i}@email.com</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">MMO-ABC{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">25,000đ</p>
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Chờ duyệt</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-8 border-border/50">Xem tất cả đơn hàng</Button>
        </div>
      </div>
    </div>
  );
}

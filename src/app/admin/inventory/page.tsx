"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Plus, 
  Trash2, 
  Search,
  Database,
  Hash,
  ShoppingBag,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        *,
        products (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Lỗi khi tải kho hàng: " + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Có sẵn</Badge>;
      case "DELIVERED":
        return <Badge variant="secondary">Đã bán</Badge>;
      case "RESERVED":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Đã đặt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Quản lý kho hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý chi tiết từng tài khoản trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="gap-2 shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4" /> Thêm tài khoản lẻ
           </Button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm theo nội dung tài khoản..." className="pl-10 bg-secondary/30 border-none" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-4">Tất cả sản phẩm</Badge>
            <Badge variant="outline" className="h-10 px-4">Tất cả trạng thái</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Nội dung tài khoản</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Kho hàng trống.</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/10">
                    <TableCell className="font-mono text-xs opacity-50">{item.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-bold">{item.products?.name}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{item.content}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-red-500">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

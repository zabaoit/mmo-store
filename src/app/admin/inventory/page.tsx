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
  AlertTriangle,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ productId: "", content: "" });
  
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Inventory
      const { data: invData, error: invError } = await supabase
        .from("inventory")
        .select(`
          *,
          products (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (invError) throw invError;
      setItems(invData || []);

      // Fetch Products for selection
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("id, name")
        .order("name");
      
      if (prodError) throw prodError;
      setProducts(prodData || []);

    } catch (error: any) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.productId || !newItem.content) {
      toast.error("Vui lòng chọn sản phẩm và nhập nội dung tài khoản");
      return;
    }

    try {
      const { error } = await supabase
        .from("inventory")
        .insert([{
          product_id: newItem.productId,
          content: newItem.content,
          status: "AVAILABLE"
        }]);

      if (error) throw error;

      toast.success("Đã thêm tài khoản mới!");
      setIsAddOpen(false);
      setNewItem({ productId: "", content: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi thêm tài khoản: " + error.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi kho?")) return;

    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã xóa khỏi kho");
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
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
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Thêm tài khoản lẻ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm tài khoản lẻ</DialogTitle>
                  <DialogDescription>Nhập thông tin tài khoản đơn lẻ vào kho.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Chọn sản phẩm</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newItem.productId}
                      onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                    >
                      <option value="">Chọn sản phẩm...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Nội dung tài khoản</label>
                    <Input 
                      placeholder="user|pass|2fa" 
                      value={newItem.content}
                      onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                  <Button onClick={handleAddItem}>Thêm vào kho</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <TableCell colSpan={6} className="text-center py-20">
                     <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
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
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeleteItem(item.id)}
                       >
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

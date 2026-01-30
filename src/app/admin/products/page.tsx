"use client";

import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  Database,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [importData, setImportData] = useState({ productId: "", content: "" });
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    category_id: "", 
    slug: "", 
    description: "", 
    warranty_info: "",
    is_active: true 
  });
  
  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select(`
          *,
          categories(name),
          inventory(count)
        `)
        .order("created_at", { ascending: false });

      if (prodError) throw prodError;

      const formatted = prodData.map(p => ({
        ...p,
        price: parseFloat(p.price),
        category: p.categories?.name || "N/A",
        stock: p.inventory?.[0]?.count || 0
      }));

      setProducts(formatted);

      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (catError) throw catError;
      setCategories(catData || []);

    } catch (error: any) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id || !newProduct.slug) {
      toast.error("Vui lòng nhập đầy đủ thông tin cơ bản");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .insert([{
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category_id: newProduct.category_id,
          slug: newProduct.slug,
          description: newProduct.description,
          warranty_info: newProduct.warranty_info,
          is_active: newProduct.is_active
        }]);

      if (error) throw error;

      toast.success("Đã thêm sản phẩm mới!");
      setIsAddProductOpen(false);
      setNewProduct({ name: "", price: "", category_id: "", slug: "", description: "", warranty_info: "", is_active: true });
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi thêm sản phẩm: " + error.message);
    }
  };

  const handleImportInventory = async () => {
    if (!importData.productId || !importData.content) {
      toast.error("Vui lòng chọn sản phẩm và nhập nội dung tài khoản");
      return;
    }

    const accounts = importData.content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (accounts.length === 0) {
      toast.error("Không tìm thấy tài khoản nào để nhập");
      return;
    }

    try {
      const inserts = accounts.map(content => ({
        product_id: importData.productId,
        content: content,
        status: "AVAILABLE"
      }));

      const { error } = await supabase
        .from("inventory")
        .insert(inserts);

      if (error) throw error;

      toast.success(`Đã nhập thành công ${accounts.length} tài khoản!`);
      setIsImportOpen(false);
      setImportData({ productId: "", content: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi nhập kho: " + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã xóa sản phẩm");
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Dữ liệu sản phẩm thực tế từ hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                <Database className="w-4 h-4" /> Import kho hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nhập tài khoản số lượng lớn</DialogTitle>
                <DialogDescription>
                  Chọn sản phẩm và dán danh sách tài khoản (định dạng: user|pass|2fa...)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Sản phẩm</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={importData.productId}
                    onChange={(e) => setImportData({ ...importData, productId: e.target.value })}
                  >
                    <option value="">Chọn sản phẩm...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Danh sách tài khoản</label>
                  <div className="text-[10px] text-muted-foreground mb-1 italic">Mỗi dòng là một tài khoản</div>
                  <Textarea 
                    className="min-h-[200px] font-mono text-xs" 
                    placeholder="username1|password1|2faKey1&#10;username2|password2|2faKey2" 
                    value={importData.content}
                    onChange={(e) => setImportData({ ...importData, content: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsImportOpen(false)}>Hủy</Button>
                <Button onClick={handleImportInventory}>Bắt đầu Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Add Product Dialog */}
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Thêm sản phẩm mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Tạo sản phẩm mới</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tên sản phẩm</label>
                  <Input 
                    placeholder="Ví dụ: Gmail Verified 2020" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Slug (URL)</label>
                  <Input 
                    placeholder="ví-du-gmail-2020" 
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Giá bán (VNĐ)</label>
                  <Input 
                    type="number" 
                    placeholder="25000" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Danh mục</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold">Mô tả sản phẩm</label>
                  <Textarea 
                    placeholder="Thông tin chi tiết về sản phẩm..." 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold">Thông tin bảo hành</label>
                  <Input 
                    placeholder="Bảo hành 1 đổi 1 trong 24h..." 
                    value={newProduct.warranty_info}
                    onChange={(e) => setNewProduct({ ...newProduct, warranty_info: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddProductOpen(false)}>Hủy</Button>
                <Button onClick={handleAddProduct}>Tạo sản phẩm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10 bg-secondary/30 border-none" />
          </div>
          <Badge variant="outline" className="h-10 px-4 gap-2">Tất cả danh mục</Badge>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-[300px]">Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Chưa có sản phẩm nào được tạo.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-secondary/10">
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="ghost" className="bg-secondary">{p.category}</Badge>
                    </TableCell>
                    <TableCell className="font-outfit font-bold">{p.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang bán
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Tạm dừng
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Pencil className="w-4 h-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

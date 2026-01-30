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
  Database
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
import { useState } from "react";

export default function AdminProductsPage() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  const products = [
    { id: 1, name: "Gmail Verified 2020", price: 25000, category: "Gmail", stock: 157, status: "ACTIVE" },
    { id: 2, name: "Facebook Ads Account", price: 225000, category: "Facebook", stock: 12, status: "ACTIVE" },
    { id: 3, name: "TikTok Aged Account", price: 25000, category: "TikTok", stock: 0, status: "INACTIVE" },
    { id: 4, name: "Verified Proxy IPv4", price: 15000, category: "Proxy", stock: 500, status: "ACTIVE" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Thêm, sửa và quản lý kho hàng của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                <Database className="w-4 h-4" /> Import kho hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Mnhập tài khoản số lượng lớn</DialogTitle>
                <DialogDescription>
                  Chọn sản phẩm và dán danh sách tài khoản (định dạng: user|pass|2fa...)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Sản phẩm</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>Gmail Verified 2020</option>
                    <option>Facebook Ads Account</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Danh sách tài khoản</label>
                  <Textarea className="min-h-[200px] font-mono text-xs" placeholder="username1|password1|2faKey1&#10;username2|password2|2faKey2" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsImportOpen(false)}>Hủy</Button>
                <Button onClick={() => setIsImportOpen(false)}>Bắt đầu Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Thêm sản phẩm mới
          </Button>
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
              {products.map((p) => (
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
                    {p.status === "ACTIVE" ? (
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
                        <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

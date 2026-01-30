"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Search,
  User,
  Mail,
  Shield,
  ShieldAlert,
  Calendar,
  MoreHorizontal
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Lỗi khi tải danh sách người dùng: " + error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1"><ShieldAlert className="w-3 h-3" /> Admin</Badge>;
      case "staff":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><Shield className="w-3 h-3" /> Staff</Badge>;
      default:
        return <Badge variant="outline">Customer</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Quản lý khách hàng</h1>
          <p className="text-muted-foreground mt-1">Xem danh sách và phân quyền người dùng trong hệ thống.</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm email..." className="pl-10 bg-secondary/30 border-none" />
          </div>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Không có người dùng nào.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-secondary/10">
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center font-bold text-xs">
                           {user.email.substring(0, 1).toUpperCase()}
                         </div>
                         <div>
                           <p className="font-bold text-sm leading-tight">{user.email}</p>
                           <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">Chi tiết</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Phân quyền</DropdownMenuItem>
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

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
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

  const fetchUserDetails = async (user: any) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    setIsDetailsOpen(true);
    
    try {
      // Get order stats for this user
      const { data: stats, error: statsError } = await supabase
        .from("orders")
        .select("total_amount, status")
        .eq("user_id", user.id);

      if (statsError) throw statsError;

      const successfulOrders = stats.filter(o => o.status === 'COMPLETED');
      const totalSpent = successfulOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      setUserDetails({
        totalOrders: stats.length,
        completedOrders: successfulOrders.length,
        totalSpent
      });
    } catch (error: any) {
      toast.error("Lỗi khi tải chi tiết: " + error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", selectedUser.id);

    if (error) {
      toast.error("Lỗi khi cập nhật phân quyền: " + error.message);
    } else {
      toast.success(`Đã cập nhật vai trò cho ${selectedUser.email} thành ${newRole}`);
      setIsPermissionsOpen(false);
      fetchUsers();
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
            <Input 
              placeholder="Tìm kiếm email..." 
              className="pl-10 bg-secondary/30 border-none" 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
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
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Không có người dùng nào khớp với tìm kiếm.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
                          <DropdownMenuItem className="cursor-pointer" onClick={() => fetchUserDetails(user)}>
                            Chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setIsPermissionsOpen(true);
                          }}>
                            Phân quyền
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

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  {selectedUser.email.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold truncate max-w-[250px]">{selectedUser.email}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{selectedUser.id}</p>
                </div>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/50 bg-card">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold font-outfit">{userDetails?.totalOrders || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Thành công</p>
                    <p className="text-2xl font-bold font-outfit text-green-500">{userDetails?.completedOrders || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card col-span-2">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold font-outfit text-primary">
                      {userDetails?.totalSpent?.toLocaleString('vi-VN') || 0} VNĐ
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chức vụ</span>
                  <span className="font-bold capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ngày đăng ký</span>
                  <span className="font-bold">
                    {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Phân quyền người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Thay đổi vai trò cho người dùng <span className="font-bold text-foreground">{selectedUser?.email}</span>
            </p>
            <div className="grid grid-cols-1 gap-3">
              {['customer', 'staff', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setNewRole(role)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    newRole === role 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border/50 hover:border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {role === 'admin' ? <ShieldAlert className={`w-5 h-5 ${newRole === role ? 'text-primary' : 'text-muted-foreground'}`} /> :
                     role === 'staff' ? <Shield className={`w-5 h-5 ${newRole === role ? 'text-primary' : 'text-muted-foreground'}`} /> :
                     <User className={`w-5 h-5 ${newRole === role ? 'text-primary' : 'text-muted-foreground'}`} />}
                    <div className="text-left">
                      <p className="font-bold capitalize">{role}</p>
                      <p className="text-xs text-muted-foreground">
                        {role === 'admin' ? 'Toàn quyền hệ thống' :
                         role === 'staff' ? 'Quản lý kho và đơn' :
                         'Người mua hàng thông thường'}
                      </p>
                    </div>
                  </div>
                  {newRole === role && <div className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdateRole} disabled={loading || newRole === selectedUser?.role}>
              {loading ? "Đang xử lý..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

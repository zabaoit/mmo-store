"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  Banknote, 
  ShieldAlert, 
  Globe, 
  Mail, 
  History,
  Lock,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold font-outfit">Cấu hình hệ thống</h1>
        <p className="text-muted-foreground mt-1">Thiết lập tham số vận hành, thanh toán và bảo mật.</p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="payment" className="gap-2"><Banknote className="w-4 h-4" /> Thanh toán</TabsTrigger>
          <TabsTrigger value="general" className="gap-2"><Globe className="w-4 h-4" /> Chung</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><ShieldAlert className="w-4 h-4" /> Bảo mật</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><History className="w-4 h-4" /> Nhật ký hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Cấu hình ngân hàng</CardTitle>
                <CardDescription>Thông tin nhận tiền chuyển khoản của shop.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên ngân hàng</Label>
                  <Input defaultValue="MB BANK" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input defaultValue="1234567890" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Chủ tài khoản</Label>
                  <Input defaultValue="NGUYEN VAN A" className="bg-secondary/30" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-2"><Save className="w-4 h-4" /> Lưu thay đổi</Button>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Tự động hóa</CardTitle>
                <CardDescription>Cấu hình duyệt đơn và timeout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Duyệt đơn tự động</Label>
                    <p className="text-xs text-muted-foreground">Sử dụng webhook ngân hàng để duyệt đơn.</p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="space-y-2">
                  <Label>Thời gian hết hạn đơn (phút)</Label>
                  <Input type="number" defaultValue="30" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Nhật ký hoạt động (Audit Logs)</CardTitle>
              <CardDescription>Theo dõi mọi thao tác thay đổi dữ liệu của ban quản trị.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">AL</div>
                     <div>
                       <p className="text-sm font-bold">Admin đã phê duyệt đơn hàng <span className="text-primary font-mono text-xs">MMO-ABC{i}</span></p>
                       <p className="text-xs text-muted-foreground">2024-05-21 16:45:32 • IP: 1.2.3.4</p>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full gap-2">Xem thêm nhật ký <ArrowRight className="w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

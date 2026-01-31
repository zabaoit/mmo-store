
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) return null;

  return (
    <footer className="border-t bg-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                M
              </div>
              <span className="font-outfit font-bold text-lg tracking-tight">
                MMO STORE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-4">
              Hệ thống cung cấp tài khoản MMO tự động hàng đầu Việt Nam. Chất lượng, nhanh chóng và bảo mật tuyệt đối.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/category/gmail" className="hover:text-primary transition-colors">Gmail</Link></li>
              <li><Link href="/category/facebook" className="hover:text-primary transition-colors">Facebook</Link></li>
              <li><Link href="/category/tiktok" className="hover:text-primary transition-colors">TikTok</Link></li>
              <li><Link href="/category/proxy" className="hover:text-primary transition-colors">Proxy / VPN</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/policy" className="hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link href="/api-docs" className="hover:text-primary transition-colors">Tài liệu API</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MMO STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

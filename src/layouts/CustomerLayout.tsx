import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Typography } from "antd"; // Thêm dòng này để sửa lỗi Title

const { Title, Text } = Typography; // Khai báo Title để hết lỗi "not defined"

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/fields", label: "Sân bóng" },
  { href: "/booking", label: "Đặt sân" },
  { href: "/orders", label: "Đơn hàng" },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      ) as CartItem[];
      const totalItems = cart.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      );
      setCartItemCount(totalItems);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Rực Rỡ & Hiện Đại */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container flex h-20 items-center justify-between">
          {/* Logo rực rỡ */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-2 rounded-xl shadow-lg shadow-green-100">
              <span className="text-2xl drop-shadow-md">⚽</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#064e3b] to-[#10b981] tracking-tighter">
                STADIUM POS
              </span>
              <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase opacity-80">
                Premium Quality
              </span>
            </div>
          </Link>

          {/* Desktop Navigation rực rỡ */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                  window.location.pathname === link.href
                    ? "bg-white text-[#10b981] shadow-sm"
                    : "text-gray-500 hover:text-[#10b981] hover:bg-white/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions rực rỡ */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative bg-white shadow-sm border border-gray-100 rounded-full hover:bg-green-50 hover:text-[#10b981] transition-all"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center animate-bounce shadow-md border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2 ml-2 border-l pl-4 border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-gray-600 hover:text-[#10b981]"
                onClick={() => navigate("/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Tài khoản
              </Button>
              <Button
                size="sm"
                className="bg-[#10b981] hover:bg-[#059669] font-bold rounded-full px-6 shadow-lg shadow-green-100"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white shadow-sm border border-gray-100 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-l-4 border-[#10b981]"
              >
                <div className="flex flex-col gap-6 mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚽</span>
                    <Title level={4} className="m-0 font-black text-[#064e3b]">
                      STADIUM POS
                    </Title>
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-lg font-black text-gray-700 hover:text-[#10b981] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2 border-dashed border-green-200" />
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl font-bold py-6"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-5 w-5 mr-3 text-[#10b981]" />
                    Tài khoản
                  </Button>
                  <Button
                    className="w-full rounded-2xl bg-[#10b981] font-bold py-6 shadow-xl"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Họa tiết trang trí mờ phía sau */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-green-50 to-transparent pointer-events-none -z-10" />
        <Outlet />
      </main>

      {/* Footer "Rực rỡ" phong cách Sân cỏ đêm */}
      <footer className="bg-[#022c22] text-white mt-20">
        <div className="container py-12 relative overflow-hidden">
          {/* Họa tiết ánh sáng footer */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 rounded-full blur-[80px] -mr-32 -mt-32" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-200">
                  STADIUM POS
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nền tảng quản lý và đặt sân bóng đá hàng đầu. Trải nghiệm thể
                thao chuyên nghiệp chỉ với vài cú click.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-green-400">
                Liên kết
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-white transition-colors"
                  >
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link
                    to="/fields"
                    className="hover:text-white transition-colors"
                  >
                    Sân bóng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking"
                    className="hover:text-white transition-colors"
                  >
                    Đặt sân
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-green-400">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chính sách đặt sân
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Quy định hoàn tiền
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Điều khoản dịch vụ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-green-400">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  📍 123 Đường Sân Cỏ, Quận 1, TP.HCM
                </li>
                <li className="flex items-center gap-2">📞 0123 456 789</li>
                <li className="flex items-center gap-2">
                  ✉️ info@stadiumpos.vn
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            © 2024 Stadium POS. All rights reserved.🏆
          </div>
        </div>
      </footer>
    </div>
  );
}

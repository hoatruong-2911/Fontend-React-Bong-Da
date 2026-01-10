import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, User, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Typography, Dropdown, Avatar, message } from "antd";
import authService, { User as UserType } from "../services/authService";

const { Text, Title } = Typography;

// 🛑 FIX 1: Khai báo rõ ràng mảng NavLink để hết lỗi "Cannot find name"
interface NavLinkItem {
  href: string;
  label: string;
}

const navLinks: NavLinkItem[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/fields", label: "Sân bóng" },
  { href: "/booking", label: "Đặt sân" },
  { href: "/orders", label: "Đơn hàng" },
  { href: "/aboutus", label: "Giới thiệu" },
];

interface CartItem {
  id: string;
  quantity: number;
}

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // Sử dụng Interface UserType từ service, dẹp bỏ any
  const [user, setUser] = useState<UserType | null>(
    authService.getStoredUser()
  );

  useEffect(() => {
    const updateCartCount = () => {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItemCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    const handleUserUpdate = () => {
      setUser(authService.getStoredUser());
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("userUpdate", handleUserUpdate);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("userUpdate", handleUserUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      message.success("Hẹn gặp lại nhà vô địch!");
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      message.error("Lỗi khi đăng xuất!");
    }
  };

  // 🛑 FIX 2: Logic lấy URL ảnh chuẩn xác giống Admin để hiện ảnh
  const avatarPath = user?.profile?.avatar || user?.avatar;
  const avatarUrl = avatarPath
    ? `http://127.0.0.1:8000/${avatarPath.replace(/^\//, "")}`
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container flex h-20 items-center justify-between px-4">
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
              <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">
                Premium Quality
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Đã hết lỗi NavLink */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                  location.pathname === link.href
                    ? "bg-white text-[#10b981] shadow-sm"
                    : "text-gray-500 hover:text-[#10b981] hover:bg-white/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Giỏ hàng */}
            <Button
              variant="ghost"
              size="icon"
              className="relative bg-white shadow-sm border border-gray-100 rounded-full hover:bg-green-50"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center animate-bounce shadow-md border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Profile Dropdown Rực Rỡ NHƯ ADMIN */}
            <div className="hidden md:flex items-center gap-4 border-l pl-4 border-gray-200">
              {user ? (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "profile",
                        label: "Hồ sơ cá nhân",
                        icon: (
                          <UserCircle className="w-4 h-4 text-emerald-500" />
                        ),
                        onClick: () => navigate("/profile"),
                      },
                      {
                        key: "orders",
                        label: "Đơn hàng của tôi",
                        icon: (
                          <ShoppingCart className="w-4 h-4 text-emerald-500" />
                        ),
                        onClick: () => navigate("/orders"),
                      },
                      { type: "divider" },
                      {
                        key: "logout",
                        label: "Đăng xuất",
                        icon: <LogOut className="w-4 h-4" />,
                        danger: true,
                        onClick: handleLogout,
                      },
                    ],
                  }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <div className="flex items-center gap-3 cursor-pointer bg-white/50 p-1 pr-5 rounded-full border border-emerald-100 hover:bg-emerald-50/50 transition-all group relative overflow-hidden shadow-sm">
                    {/* Hiệu ứng Aura phát sáng rực rỡ */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 blur-md animate-ping-slow"></div>
                      <Avatar
                        key={avatarUrl}
                        src={avatarUrl}
                        size={44}
                        className="border-2 border-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.5)] z-10 relative transition-transform duration-300 group-hover:scale-110"
                        icon={<User />}
                      />
                    </div>
                    <div className="hidden lg:block text-left leading-tight ml-1 z-10">
                      <Text className="block text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                        {user.name}
                      </Text>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <Text className="text-emerald-500 text-[9px] uppercase font-black italic tracking-widest">
                          MEMBER VIP
                        </Text>
                      </div>
                    </div>
                    {/* Hiệu ứng Shine vệt sáng lướt qua */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
                  </div>
                </Dropdown>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#10b981] hover:bg-[#059669] font-bold rounded-full px-8 shadow-lg shadow-green-100"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
              )}
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
                  {user ? (
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl font-bold py-6 justify-start"
                        onClick={() => navigate("/profile")}
                      >
                        <Avatar
                          src={avatarUrl}
                          size={32}
                          className="mr-3 border border-emerald-400"
                          icon={<User />}
                        />{" "}
                        Hồ sơ cá nhân
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full rounded-2xl font-bold py-6"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full rounded-2xl bg-[#10b981] font-bold py-6 shadow-xl"
                      onClick={() => navigate("/login")}
                    >
                      Đăng nhập ngay
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-green-50 to-transparent pointer-events-none -z-10" />
        <Outlet />
      </main>

      {/* Hiệu ứng chuyển động rực rỡ */}
      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .group:hover .group-hover\\:animate-shine, .group:hover .animate-shine { animation: shine 0.8s ease-in-out; }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.4); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
}

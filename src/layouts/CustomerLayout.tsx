import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  UserCircle,
  Star,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Typography, Dropdown, Avatar, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import authService, { User as UserType } from "../services/authService";

const { Text, Title } = Typography;

interface NavLinkItem {
  href: string;
  label: string;
}

const navLinks: NavLinkItem[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/fields", label: "Sân bóng" },
  { href: "/booking", label: "Đặt sân" },
  { href: "/concacts", label: "Liên Hệ" },
  { href: "/maps", label: "Chỉ đường" },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserType | null>(
    authService.getStoredUser(),
  );

  // const updateCartCount = useCallback(() => {
  //   const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
  //   setCartItemCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  // }, []);

  const updateCartCount = useCallback(() => {
    const userStr = localStorage.getItem("user");
    let cartKey = "cart_guest";

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        cartKey = `cart_user_${userData.id}`;
      } catch (e) {
        cartKey = "cart_guest";
      }
    }

    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    setCartItemCount(
      cart.reduce((sum: number, item: any) => sum + item.quantity, 0),
    );
  }, []);
  // useEffect(() => {
  //   const handleScroll = () => setIsScrolled(window.scrollY > 20);
  //   const handleUserUpdate = () => setUser(authService.getStoredUser());

  //   updateCartCount();
  //   window.addEventListener("scroll", handleScroll);
  //   window.addEventListener("storage", updateCartCount);
  //   window.addEventListener("userUpdate", handleUserUpdate);
  //   const interval = setInterval(updateCartCount, 1000);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //     window.removeEventListener("storage", updateCartCount);
  //     window.removeEventListener("userUpdate", handleUserUpdate);
  //     clearInterval(interval);
  //   };
  // }, [updateCartCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleUserUpdate = () => {
      setUser(authService.getStoredUser());
      updateCartCount(); // Cập nhật lại số lượng khi user thay đổi (login/logout)
    };

    updateCartCount();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("userUpdate", handleUserUpdate);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("userUpdate", handleUserUpdate);
      clearInterval(interval);
    };
  }, [updateCartCount]);
  // const handleLogout = async () => {
  //   try {
  //     await authService.logout();
  //     message.success("Hẹn gặp lại nhà vô địch!");
  //     setUser(null);
  //     navigate("/", { replace: true });
  //   } catch (error: unknown) {
  //     message.error("Lỗi khi đăng xuất!");
  //   }
  // };
  const handleLogout = async () => {
    try {
      await authService.logout();
      message.success("Hẹn gặp lại nhà vô địch!");

      // 1. Xóa thông tin user
      setUser(null);

      // ✅ 2. CẬP NHẬT NGAY SỐ LƯỢNG GIỎ HÀNG
      // Để nó quay về đếm giỏ hàng của khách (cart_guest) ngay lập tức
      updateCartCount();

      navigate("/", { replace: true });
    } catch (error: unknown) {
      message.error("Lỗi khi đăng xuất!");
    }
  };

  const avatarPath = user?.profile?.avatar || user?.avatar;
  const avatarUrl = avatarPath
    ? `http://127.0.0.1:8000/${avatarPath.replace(/^\//, "")}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#053d2f]">
      {/* 1. NAVBAR GLASSMORPHISM */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#053d2f]/80 backdrop-blur-xl shadow-lg py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="bg-emerald-500 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
              <Star className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white uppercase">
              WESPORT <span className="text-emerald-400">PLATINUM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-black uppercase tracking-widest transition-all hover:text-emerald-400 ${
                  location.pathname === link.href
                    ? "text-emerald-400"
                    : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Giỏ hàng */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-3 bg-white/5 rounded-2xl border border-white/10 text-white hover:bg-emerald-500 transition-all"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 text-[10px] font-black text-[#053d2f] flex items-center justify-center animate-bounce border-2 border-[#053d2f]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="hidden md:block">
              {user ? (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "p",
                        label: "Hồ sơ cá nhân",
                        icon: <UserCircle className="w-4 h-4" />,
                        onClick: () => navigate("/profile"),
                      },
                      {
                        key: "o",
                        label: "Lịch Sử Đơn hàng",
                        icon: <ShoppingCart className="w-4 h-4" />,
                        onClick: () => navigate("/orders"),
                      },
                      {
                        key: "b",
                        label: "Lịch Sử Đặt sân",
                        icon: <Star className="w-4 h-4" />,
                        onClick: () => navigate("/pitch-bookings"),
                      },
                      { type: "divider" },
                      {
                        key: "l",
                        label: "Đăng xuất",
                        icon: <LogOut className="w-4 h-4" />,
                        danger: true,
                        onClick: handleLogout,
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <div className="flex items-center gap-3 cursor-pointer bg-white/5 p-1.5 pr-5 rounded-full border border-white/10 hover:bg-white/20 transition-all group relative overflow-hidden shadow-xl">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 blur-md animate-pulse"></div>
                      <Avatar
                        src={avatarUrl}
                        size={38}
                        icon={<User />}
                        className="border-2 border-emerald-400 z-10 relative"
                      />
                    </div>
                    <div className="hidden lg:block text-left leading-tight ml-1 z-10">
                      <Text className="block text-xs font-black text-white uppercase italic">
                        {user.name}
                      </Text>
                      <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                        Member VIP
                      </Text>
                    </div>
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
                  </div>
                </Dropdown>
              ) : (
                // ✅ Bọc 2 nút trong 1 div flex để không bị lỗi JSX và căn chỉnh đẹp
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-[#053d2f] px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    ĐĂNG NHẬP
                  </button>

                  <button
                    onClick={() => navigate("/register")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-[#053d2f] px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    ĐĂNG KÝ
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-400 bg-white/5 rounded-xl"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#053d2f] border-l border-white/10 text-white"
              >
                <div className="flex flex-col gap-6 mt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-2xl font-black italic uppercase text-emerald-50 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="border-white/10" />
                  {user ? (
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="rounded-2xl py-6 font-black uppercase italic"
                    >
                      Đăng xuất
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate("/login")}
                      className="bg-emerald-500 rounded-2xl py-6 font-black uppercase italic"
                    >
                      Đăng nhập
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow pt-24">
        <Outlet />
      </main>

      {/* 3. FOOTER 4 CỘT RỰC RỠ NHƯ MẪU */}
      <footer className="bg-[#03231b] text-white pt-24 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg">
                  <Star className="text-white w-7 h-7 fill-current" />
                </div>
                <span className="text-3xl font-black italic tracking-tighter uppercase">
                  THANH HÓA <span className="text-emerald-400">Soccer</span>
                </span>
              </div>
              <p className="text-emerald-100/60 text-lg mb-10 max-w-md leading-relaxed font-medium italic">
                Nâng tầm trải nghiệm bóng đá phong trào tại Ninh Thuận với hệ
                thống quản lý chuyên nghiệp và cơ sở vật chất Platinum bậc nhất.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:-translate-y-1 transition-all border border-white/5"
                  >
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black mb-8 uppercase tracking-[0.2em] text-emerald-400">
                Thông tin
              </h4>
              <ul className="space-y-5 text-emerald-100/60 font-bold italic text-sm">
                <li className="flex items-start gap-3 hover:text-white transition-colors cursor-pointer">
                  <MapPin className="text-emerald-500 shrink-0" size={20} />
                  <span>123 Stadium Drive, Phan Rang, Ninh Thuận</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Phone className="text-emerald-500 shrink-0" size={20} />
                  <span>0372.786.259</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <MessageSquare
                    className="text-emerald-500 shrink-0"
                    size={20}
                  />
                  <span>thanhhoasoccer@gmail.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black mb-8 uppercase tracking-[0.2em] text-emerald-400">
                Bản tin
              </h4>
              <p className="text-emerald-100/60 mb-6 text-sm italic">
                Đăng ký để nhận thông báo về các giải đấu và ưu đãi Platinum mới
                nhất.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm italic"
                />
                <button className="bg-emerald-500 p-3 rounded-xl hover:bg-emerald-400 transition-all text-white">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 text-center text-emerald-100/20 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Thanh Hóa Soccer Platinum System. All
            rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .animate-shine { animation: shine 0.8s ease-in-out; }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.4); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
}

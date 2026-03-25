import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  Star,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Trophy,
  Zap,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import { Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import homeService, { Product } from "@/services/customer/HomeService";
import { Field } from "@/services/customer/fieldService";
// --- IMPORT ASSETS TĨNH ---
import quangHai from "../../../assets/images/quang_hai.jpg";
import congPhuong from "../../../assets/images/cong_phuong.jpg";
import cancris from "../../../assets/images/can_cris.jpg";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

// --- INTERFACES CHUẨN XỊN (SẠCH ANY) ---
interface StaticFeature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CelebReview {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
}

interface CartItem extends Product {
  quantity: number;
}

// --- DỮ LIỆU TĨNH GIỮ LẠI ĐỂ TRANG WEB PHONG PHÚ ---
const FEATURES: StaticFeature[] = [
  {
    id: 1,
    title: "Đặt Lịch Thông Minh",
    description:
      "Hệ thống booking tự động, cập nhật thời gian thực giúp bạn chọn giờ vàng chỉ trong 30 giây.",
    icon: <Calendar className="w-8 h-8 text-emerald-500" />,
  },
  {
    id: 2,
    title: "Sân Cỏ Đạt Chuẩn FIFA",
    description:
      "Mặt cỏ nhân tạo cao cấp, hệ thống thoát nước hiện đại, đảm bảo trải nghiệm thi đấu tốt nhất.",
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
  },
  {
    id: 3,
    title: "Hệ Thống Chiếu Sáng",
    description:
      "Dàn đèn LED công suất lớn, không gây chói mắt, hỗ trợ các trận cầu đỉnh cao vào ban đêm.",
    icon: <Zap className="w-8 h-8 text-blue-500" />,
  },
  {
    id: 4,
    title: "Quản Lý Chuyên Nghiệp",
    description:
      "Đội ngũ nhân viên nhiệt tình, hệ thống POS hiện đại giúp thanh toán nhanh chóng.",
    icon: <ShieldCheck className="w-8 h-8 text-red-500" />,
  },
  {
    id: 5,
    title: "Kết Nối Cộng Đồng",
    description:
      "Dễ dàng tìm đối thủ, tổ chức giải đấu và giao lưu với hàng ngàn cầu thủ tại Thanh Hóa.",
    icon: <Users className="w-8 h-8 text-purple-500" />,
  },
  {
    id: 6,
    title: "Hoạt Động 24/7",
    description:
      "Sẵn sàng phục vụ đam mê của bạn vào bất cứ khung giờ nào trong ngày.",
    icon: <Clock className="w-8 h-8 text-orange-500" />,
  },
];

const CELEBS: CelebReview[] = [
  {
    id: 1,
    name: "Nguyễn Quang Hải",
    role: "Quả Bóng Vàng",
    avatar: quangHai,
    content:
      "Sân chất lượng tốt, cỏ FIFA rực rỡ. Trải nghiệm rất chuyên nghiệp!",
  },
  {
    id: 2,
    name: "Nguyễn Công Phượng",
    role: "Tiền Đạo Quốc Gia",
    avatar: congPhuong,
    content:
      "Không gian tuyệt vời, mặt sân êm rực rỡ, phù hợp luyện tập đỉnh cao.",
  },
  {
    id: 3,
    name: "Cán Cris",
    role: "Vlogger Bóng Đá",
    avatar: cancris,
    content: "Đi quay vlog mà book sân quá nhanh, chất lượng phục vụ rực rỡ!",
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [apiFields, setApiFields] = useState<Field[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fieldRes, productRes] = await Promise.all([
        homeService.getFeaturedFields(),
        homeService.getFeaturedProducts(),
      ]);

      if (fieldRes.success) setApiFields(fieldRes.data.slice(0, 3));
      if (productRes.success) setApiProducts(productRes.data.slice(0, 4));
    } catch (error: unknown) {
      message.error("Lỗi nạp năng lượng dữ liệu rực rỡ!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = (product: Product): void => {
    const cartString = localStorage.getItem("cart");
    const cart: CartItem[] = cartString ? JSON.parse(cartString) : [];

    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 } as CartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    message.success(`Đã thêm ${product.name} vào giỏ rực rỡ!`);
  };

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-emerald-900">
        <Spin size="large" />
        <p className="mt-4 text-emerald-400 font-black italic animate-pulse">
          WESPORT ĐANG KHỞI ĐỘNG...
        </p>
      </div>
    );

  return (
    <div className="bg-emerald-50/30 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-900/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-8 border border-emerald-500/30 backdrop-blur-md">
              Thanh Hóa Soccer Official
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] mb-10">
              ĐAM MÊ <br />{" "}
              <span className="text-emerald-400 italic">BẤT TẬN</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50/70 mb-12 max-w-2xl leading-relaxed font-medium">
              Hệ thống sân cỏ nhân tạo chuẩn FIFA 2 sao, trang thiết bị hiện đại
              cùng quy trình đặt sân 4.0 tiên tiến nhất Ninh Thuận.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => navigate("/fields")}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-emerald-500/40 transition-all flex items-center justify-center gap-3 group"
              >
                ĐẶT SÂN NGAY
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all"
              >
                XEM CỬA HÀNG
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. GIỚI THIỆU SECTION */}
      <section className="py-32 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000"
                alt="About"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-emerald-600 p-12 rounded-[2.5rem] shadow-2xl text-white hidden md:block">
              <h4 className="text-5xl font-black mb-1">20+</h4>
              <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">
                Sân đấu chuyên nghiệp
              </p>
            </div>
          </motion.div>

          <div>
            <span className="text-emerald-600 font-black tracking-widest uppercase text-sm mb-6 block">
              Câu Chuyện Của Chúng Tôi
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-emerald-950 mb-8 leading-tight uppercase italic">
              Kiến Tạo <span className="text-emerald-600">Sân Chơi</span> Chuyên
              Nghiệp
            </h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-medium">
              <p>
                WeSport ra đời với sứ mệnh mang đến một không gian thể thao văn
                minh, chuyên nghiệp và đầy cảm hứng cho người hâm mộ bóng đá.
              </p>
              <p>
                Chúng tôi tập trung vào trải nghiệm khách hàng thông qua việc số
                hóa hoàn toàn quy trình đặt sân, quản lý đội bóng và dịch vụ
                tiện ích đi kèm.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                {[
                  "Mặt cỏ chuẩn FIFA",
                  "Đèn LED 500W",
                  "Thoát nước hiện đại",
                  "Khu VIP Lounge",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-emerald-900 font-bold uppercase italic text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Star size={14} fill="currentColor" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DỊCH VỤ TIỆN ÍCH */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-black text-emerald-950 mb-6 uppercase italic">
              Dịch Vụ Tiện ÍCH
            </h2>
            <p className="text-slate-500 text-lg italic tracking-tight">
              "Chuyên nghiệp trong từng bước chạy, tận tâm trong từng dịch vụ
              rực rỡ."
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.id}
                whileHover={{ y: -10 }}
                className="group p-10 rounded-[3rem] bg-emerald-50 hover:bg-emerald-600 transition-all duration-500 border border-emerald-100 shadow-sm"
              >
                <div className="mb-8 p-5 bg-white rounded-[2rem] inline-block shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-emerald-900 group-hover:text-white uppercase italic">
                  {feature.title}
                </h3>
                <p className="text-slate-600 group-hover:text-emerald-50 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HỆ THỐNG SÂN BÓNG - CẬP NHẬT LOGIC FIELD XỊN */}
      <section className="py-32 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-emerald-600 font-black tracking-widest uppercase text-sm mb-4 block underline decoration-4 underline-offset-8">
              Booking System
            </span>
            <h2 className="text-5xl font-black text-emerald-950 uppercase italic">
              Chọn Sân <span className="text-emerald-600">Chiến Đấu</span>
            </h2>
          </div>
          <button
            onClick={() => navigate("/fields")}
            className="bg-emerald-900 text-white px-10 py-4 rounded-[2rem] font-black hover:bg-emerald-800 transition-all shadow-xl"
          >
            TẤT CẢ SÂN
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {apiFields.map((field) => (
            <motion.div
              key={field.id}
              whileHover={{ y: -15 }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-emerald-900/5 group relative border border-emerald-50"
            >
              <div className="h-80 overflow-hidden relative">
                <img
                  src={
                    field.image
                      ? field.image.startsWith("http")
                        ? field.image
                        : `${STORAGE_URL}${field.image}`
                      : `/field-images/${field.size}.jpg`
                  }
                  alt={field.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-md">
                  Sân {field.size} người
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-black text-emerald-950 mb-2 uppercase italic">
                  {field.name}
                </h3>
                <p className="text-emerald-600 font-black text-2xl mb-6">
                  {Number(field.price).toLocaleString("vi-VN")}đ{" "}
                  <span className="text-sm text-slate-400 font-normal">
                    /giờ
                  </span>
                </p>
                <button
                  onClick={() => navigate(`/fields/${field.id}`)}
                  className="w-full py-4 rounded-2xl bg-emerald-900 text-white font-black hover:bg-emerald-600 transition-all uppercase tracking-widest text-sm shadow-lg shadow-emerald-200"
                >
                  Chi tiết đặt sân
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. CỬA HÀNG - LOGIC NÚT RIÊNG */}
      <section className="py-32 bg-[#053d2f] relative rounded-[4rem] mx-4 md:mx-10 mb-20 shadow-2xl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
              WESPORT <span className="text-emerald-400">PRO SHOP</span>
            </h2>
            <p className="text-emerald-100/60 text-xl italic font-medium">
              Dụng cụ chuyên nghiệp - Tiếp thêm năng lượng rực rỡ
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {apiProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 group hover:bg-white/10 transition-all shadow-xl"
              >
                <div className="h-52 relative overflow-hidden rounded-3xl mb-6">
                  <img
                    src={
                      product.image
                        ? product.image.startsWith("http")
                          ? product.image
                          : `${STORAGE_URL}${product.image}`
                        : ""
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="mb-4">
                  <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] block mb-2">
                    {typeof product.category === "object"
                      ? (product.category as { name: string }).name
                      : product.category || "Sản phẩm"}
                  </span>
                  <h3 className="text-lg font-black text-white line-clamp-1 uppercase italic">
                    {product.name}
                  </h3>
                  <div className="text-2xl font-black text-emerald-400 mt-2">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="col-span-2 bg-white/10 hover:bg-white/20 p-3 rounded-xl flex justify-center transition-all text-white border border-white/5 shadow-sm"
                    title="Chi tiết"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="col-span-3 bg-emerald-500 hover:bg-emerald-400 text-white p-3 rounded-xl font-black flex items-center justify-center gap-2 text-[10px] uppercase transition-all shadow-lg"
                  >
                    <ShoppingCart size={16} /> Thêm
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS - 3 NGƯỜI 1 HÀNG */}
      <section className="py-32 container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-emerald-600 font-black tracking-widest uppercase text-sm mb-4 block underline underline-offset-8">
              Siêu sao đồng hành
            </span>
            <h2 className="text-6xl font-black text-emerald-950 italic mb-8 uppercase tracking-tighter">
              Cảm Nhận <span className="text-emerald-600">RỰC RỠ</span>
            </h2>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={24}
                  fill="#10b981"
                  color="#10b981"
                  className="animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {CELEBS.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -15 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/10 relative border border-emerald-50 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-emerald-50 shadow-lg"
                  />
                  <div>
                    <h4 className="font-black text-lg text-emerald-950 uppercase italic leading-none">
                      {t.name}
                    </h4>
                    <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest mt-2">
                      {t.role}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-lg italic leading-relaxed font-medium flex-grow">
                  "{t.content}"
                </p>
                <Trophy
                  className="absolute bottom-6 right-6 opacity-5 text-emerald-900"
                  size={60}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER INFO */}
      <footer className="bg-emerald-950 text-white py-24 px-6 rounded-t-[5rem]">
        <div className="container mx-auto grid md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
              <MapPin className="text-emerald-400" size={30} />
            </div>
            <h4 className="font-black italic uppercase text-lg mb-3">
              Vị Trí Sân Bóng
            </h4>
            <p className="text-emerald-100/40 font-bold uppercase text-xs tracking-widest">
              123 Stadium Drive, Phan Rang, Ninh Thuận
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
              <Phone className="text-emerald-400" size={30} />
            </div>
            <h4 className="font-black italic uppercase text-lg mb-3">
              Liên Hệ Ngay
            </h4>
            <p className="text-emerald-100/40 font-black text-2xl font-mono">
              0372.786.259
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
              <ShieldCheck className="text-emerald-400" size={30} />
            </div>
            <h4 className="font-black italic uppercase text-lg mb-3">
              Hệ Thống 4.0
            </h4>
            <p className="text-emerald-100/40 font-bold uppercase text-xs tracking-widest">
              Thanh Hóa FC Platinum System
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING SUPPORT */}
      <motion.button
        // 1. Trạng thái bắt đầu (ẩn và nhỏ)
        initial={{ scale: 0, opacity: 0 }}
        // 2. GỘP TẤT CẢ LOGIC ANIMATE VÀO ĐÂY (FIX LỖI MULTIPLE ATTRIBUTES)
        animate={{
          scale: 1, // Hiện ra rực rỡ
          opacity: 1, // Hiện ra rực rỡ
          rotate: [0, 10, -10, 10, 0], // Hiệu ứng lắc chuông điện thoại
          boxShadow: [
            "0px 0px 0px 0px rgba(16, 185, 129, 0)",
            "0px 0px 20px 10px rgba(16, 185, 129, 0.4)",
            "0px 0px 0px 0px rgba(16, 185, 129, 0)",
          ],
        }}
        // 3. Cấu hình thời gian lặp lại
        transition={{
          scale: { duration: 0.5 }, // Chỉ chạy 1 lần khi hiện nút
          opacity: { duration: 0.5 }, // Chỉ chạy 1 lần khi hiện nút
          rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }, // Lặp vô hạn
          boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }, // Lặp vô hạn
        }}
        // 4. Hiệu ứng khi tương tác
        whileHover={{
          scale: 1.2,
          backgroundColor: "#059669",
          rotate: 0,
        }}
        whileTap={{ scale: 0.8 }}
        // 5. Style Platinum
        className="fixed bottom-10 right-10 z-50 bg-emerald-600 text-white p-6 rounded-full shadow-2xl border-4 border-white flex items-center justify-center group"
        // 6. Điều hướng về trang /contacts
        onClick={() => navigate("/concacts")}
      >
        {/* Icon điện thoại kèm hiệu ứng nhịp tim */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Phone size={32} strokeWidth={2.5} />
        </motion.div>

        {/* Tooltip ẩn hiện khi hover */}
        <span className="absolute right-20 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black italic uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10">
          Liên hệ ngay
        </span>
      </motion.button>
    </div>
  );
};

export default Home;

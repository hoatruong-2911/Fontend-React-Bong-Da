import React from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Button,
  Timeline,
  Divider,
  Tag,
  Space,
  Avatar,
  Statistic,
} from "antd";
import {
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ArrowRightOutlined,
  StarFilled,
  SecurityScanOutlined,
  AimOutlined,
  CoffeeOutlined,
  CrownOutlined,
  HistoryOutlined,
  GlobalOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";

import CanCris from "../../../assets/images/ronado.jpg";

const { Title, Paragraph, Text } = Typography;

// Animation variants chuẩn doanh nghiệp lớn

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.2 } },
};

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#042f24] pb-24 font-sans text-white overflow-hidden">
      {/* ================= SECTION 1: HERO GLOW ================= */}
      <div className="relative pt-24 pb-48 px-10">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-[#10b98115] rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#34d39910] rounded-full blur-[120px]" />
        <div
          className="absolute border-[60px] border-emerald-400/5 rounded-full"
          style={{
            top: "15%",
            right: "20%",
            width: "250px",
            height: "250px",
            filter: "blur(3px)",
          }}
        />

        <div className="container mx-auto relative z-10">
          <Row gutter={48} align="middle">
            <Col lg={14}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Tag
                  color="#10b981"
                  className="font-black italic px-8 py-1 rounded-full border-none mb-6 shadow-glow animate-pulse uppercase tracking-widest"
                >
                  HOA STADIUM x WESPORT - THE NEW LEGEND
                </Tag>
                <Title className="!text-white !text-8xl !font-black !italic !uppercase !mb-6 !tracking-tighter !leading-[0.85]">
                  KHỞI NGUỒN <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    SỨC MẠNH
                  </span>{" "}
                  RỰC RỠ
                </Title>
                <Paragraph className="text-emerald-100/70 text-2xl font-medium italic max-w-2xl mb-12 leading-relaxed">
                  Dưới bàn tay nhào nặn của Founder Thanh Hóa, chúng tôi kiến
                  tạo một thánh đường cho niềm đam mê, nơi mỗi đường bóng là một
                  bản anh hùng ca rực rỡ nhất lịch sử phủi thủ.
                </Paragraph>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<FireOutlined />}
                    className="h-20 px-12 rounded-2xl bg-[#fbbf24] hover:!bg-yellow-500 border-none font-black italic uppercase text-slate-900 shadow-2xl hover:scale-105 transition-all text-xl"
                    onClick={() => navigate("/fields")}
                  >
                    Xác nhận ra sân ngay
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar
                          key={i}
                          size={48}
                          className="border-2 border-[#042f24]"
                          src={`https://i.pravatar.cc/150?img=${i + 20}`}
                        />
                      ))}
                    </div>
                    <Text className="text-white/60 font-bold italic text-xs uppercase underline">
                      15k+ Hội viên rực rỡ
                    </Text>
                  </div>
                </Space>
              </motion.div>
            </Col>
            <Col lg={10} className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000"
                  className="rounded-[60px] shadow-3xl border-4 border-emerald-400/20"
                  alt="Action"
                />
              </motion.div>
            </Col>
          </Row>

          {/* TEAM SECTION (GIỮ NGUYÊN) */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="flex justify-center gap-16 mt-32"
          >
            {[
              {
                name: "Mr. Thanh Hóa",
                role: "Founder & CEO",
                img: "https://i.pravatar.cc/150?img=11",
              },
              {
                name: "Mr. Viha",
                role: "Technical Director",
                img: "https://i.pravatar.cc/150?img=12",
              },
              {
                name: "Sarah Hanh",
                role: "Service Manager",
                img: "https://i.pravatar.cc/150?img=5",
              },
            ].map((member, idx) => (
              <motion.div
                variants={fadeInUp}
                key={idx}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-3 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-100 transition duration-700" />
                  <Avatar
                    size={140}
                    src={member.img}
                    className="relative border-4 border-emerald-400 shadow-2xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-yellow-400 p-2 rounded-full shadow-lg">
                    <CrownOutlined className="text-black" />
                  </div>
                </div>
                <div className="font-black italic uppercase text-white text-xl">
                  {member.name}
                </div>
                <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-1">
                  {member.role}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div
        className="container mx-auto px-10 relative z-20"
        style={{ marginTop: "-100px" }}
      >
        {/* ================= SECTION 2: SỨ MỆNH & TẦM NHÌN ================= */}
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#064e3b] border-emerald-800/50 rounded-[40px] p-8 h-full shadow-2xl relative overflow-hidden group">
                <div className="absolute top-4 right-6 text-emerald-800 text-6xl font-black italic opacity-20 uppercase">
                  Sứ mệnh
                </div>
                <Title
                  level={2}
                  className="!text-emerald-400 !font-black !italic !uppercase mb-6 flex items-center gap-3"
                >
                  <FireOutlined /> Sứ mệnh rực rỡ
                </Title>
                <Paragraph className="text-emerald-100/80 text-lg leading-relaxed italic mb-8">
                  Hoa Stadium ra đời để nâng tầm phủi Việt. Chúng tôi số hóa
                  100% trải nghiệm của bạn, kiến tạo một không gian thể thao văn
                  minh, chuyên nghiệp và đầy cảm hứng.
                </Paragraph>
                <img
                  src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800"
                  className="rounded-3xl w-full h-64 object-cover"
                  alt="Mission"
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#064e3b] border-emerald-800/50 rounded-[40px] p-8 h-full shadow-2xl relative overflow-hidden group">
                <div className="absolute top-4 right-6 text-emerald-800 text-6xl font-black italic opacity-20 uppercase">
                  Tầm nhìn
                </div>
                <Title
                  level={2}
                  className="!text-yellow-400 !font-black !italic !uppercase mb-6 flex items-center gap-3"
                >
                  <TrophyOutlined /> Tầm nhìn 5 sao
                </Title>
                <Paragraph className="text-emerald-100/80 text-lg leading-relaxed italic mb-8">
                  Đến năm 2030, chúng tôi sẽ trở thành biểu tượng của thể thao
                  cộng đồng rực rỡ nhất Việt Nam, phục vụ hàng triệu lượt khách
                  hàng với tiêu chuẩn đẳng cấp thế giới.
                </Paragraph>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <ThunderboltOutlined />, text: "Tốc độ thần tốc" },
                    { icon: <GlobalOutlined />, text: "Chuẩn FIFA Pro" },
                    { icon: <TeamOutlined />, text: "Kết nối đam mê" },
                    {
                      icon: <SecurityScanOutlined />,
                      text: "An tâm tuyệt đối",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-2xl border border-white/5"
                    >
                      <div className="text-yellow-400">{item.icon}</div>
                      <Text className="text-white font-bold italic text-[10px] uppercase">
                        {item.text}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* ================= SECTION 3: GIÁ TRỊ VÀNG (KHÔI PHỤC) ================= */}
        <div className="py-32">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <Title
              level={1}
              className="!text-white !font-black !italic !uppercase !text-6xl"
            >
              GIÁ TRỊ <span className="text-emerald-400">VÀNG</span> ĐÍCH THỰC
            </Title>
            <div className="h-1.5 w-32 bg-emerald-500 mx-auto rounded-full shadow-glow" />
          </motion.div>

          <Row gutter={[32, 32]}>
            {[
              {
                icon: <FireOutlined className="text-orange-500" />,
                title: "ĐAM MÊ RỰC CHÁY",
                desc: "Mỗi trận đấu tại Hoa Stadium đều được phục vụ bằng trái tim rực lửa nhất.",
              },
              {
                icon: <ThunderboltOutlined className="text-yellow-500" />,
                title: "DỊCH VỤ THẦN TỐC",
                desc: "Đặt sân, mua sắm và nhận đồ ăn chỉ trong tích tắc với hệ thống POS 4.0.",
              },
              {
                icon: <CheckCircleOutlined className="text-emerald-500" />,
                title: "FIFA PRO STANDARD",
                desc: "Hệ thống mặt cỏ nhập khẩu cao cấp, chống chấn thương rực rỡ nhất khu vực.",
              },
              {
                icon: <HeartOutlined className="text-pink-500" />,
                title: "GIA ĐÌNH THỂ THAO",
                desc: "Chúng tôi coi khách hàng là anh em, cùng nhau xây dựng cộng đồng rực rỡ.",
              },
            ].map((item, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center p-10 bg-[#052c22] rounded-[40px] shadow-2xl hover:-translate-y-4 transition-all duration-500 border border-emerald-800/30 group">
                    <div className="text-6xl mb-8 group-hover:rotate-12 transition-transform">
                      {item.icon}
                    </div>
                    <Title
                      level={4}
                      className="!text-white !font-black !italic !uppercase mb-4"
                    >
                      {item.title}
                    </Title>
                    <Text className="text-emerald-100/40 italic text-sm">
                      {item.desc}
                    </Text>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* ================= SECTION 4: HỆ SINH THÁI (KHÔI PHỤC) ================= */}
        <motion.div
          {...fadeInUp}
          className="py-24 bg-white/5 rounded-[60px] p-12 border border-white/5 shadow-inner backdrop-blur-sm mb-32"
        >
          <Row gutter={48} align="middle">
            <Col lg={12}>
              <Title
                level={1}
                className="!text-white !font-black !italic !uppercase !text-5xl mb-8 leading-tight"
              >
                HƠN CẢ MỘT <br />{" "}
                <span className="text-emerald-400">HỆ SINH THÁI</span> <br />{" "}
                RỰC RỠ
              </Title>
              <div className="space-y-6">
                {[
                  {
                    t: "Wesport Cafe",
                    d: "Thưởng thức cafe rực rỡ và đồ uống năng lượng đẳng cấp ngay tại sân bóng.",
                  },
                  {
                    t: "Pro Store",
                    d: "Phụ kiện thi đấu chính hãng, xỏ giày là thành siêu sao rực rỡ.",
                  },
                  {
                    t: "Live Stats",
                    d: "Hệ thống ghi lại những khoảnh khắc rực rỡ của bạn trên sân cỏ.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircleOutlined className="text-emerald-400 text-xl mt-1" />
                    <div>
                      <Title
                        level={4}
                        className="!text-white !m-0 font-black italic uppercase"
                      >
                        {item.t}
                      </Title>
                      <Text className="text-white/40 italic">{item.d}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
            <Col lg={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Hiệu ứng hào quang vàng rực rỡ */}
                <div className="absolute -inset-2 bg-yellow-400/20 rounded-[45px] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />

                <img
                  src={CanCris} // Truyền biến đã import vào đây (không để trong ngoặc kép)
                  className="rounded-[40px] shadow-2xl w-full h-[550px] object-cover border-4 border-yellow-400/20 relative z-10 hover:border-yellow-400/50 transition-all duration-500"
                  alt="Cristiano Ronaldo Hoa Stadium"
                />

                <div className="absolute top-8 right-8 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-yellow-400/50">
                  <Text className="text-yellow-400 font-black italic uppercase text-[10px]">
                    Legend Spirit
                  </Text>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* ================= SECTION 5: HÀNH TRÌNH PHÁT TRIỂN ================= */}
        <div className="py-20 mb-32">
          <Title
            level={1}
            className="text-center !text-white !font-black !italic !uppercase mb-20"
          >
            Hành trình kiến tạo{" "}
            <span className="text-yellow-400">HUYỀN THOẠI</span>
          </Title>
          <Timeline
            mode="alternate"
            items={[
              {
                label: (
                  <Text className="font-black italic text-emerald-400">
                    Tháng 01/2024
                  </Text>
                ),
                children: (
                  <div className="p-6 bg-[#064e3b] rounded-2xl border border-emerald-800">
                    <Title
                      level={4}
                      className="!text-white font-black italic uppercase"
                    >
                      KHỞI CÔNG RỰC RỠ
                    </Title>
                    <Paragraph className="m-0 italic text-white/50 text-sm">
                      Lễ khởi công tổ hợp HOA STADIUM đầu tiên tại Gò Vấp.
                    </Paragraph>
                  </div>
                ),
              },
              {
                label: (
                  <Text className="font-black italic text-emerald-400">
                    Tháng 06/2024
                  </Text>
                ),
                children: (
                  <div className="p-6 bg-[#064e3b] rounded-2xl border border-emerald-800">
                    <Title
                      level={4}
                      className="!text-white font-black italic uppercase"
                    >
                      HOÀN THÀNH 100%
                    </Title>
                    <Paragraph className="m-0 italic text-white/50 text-sm">
                      Ra mắt hệ thống sân chuẩn FIFA rực rỡ nhất Việt Nam.
                    </Paragraph>
                  </div>
                ),
              },
              {
                label: (
                  <Text className="font-black italic text-emerald-400">
                    Tháng 12/2024
                  </Text>
                ),
                children: (
                  <div className="p-6 bg-emerald-600 rounded-2xl shadow-glow">
                    <Title
                      level={4}
                      className="!text-white font-black italic uppercase"
                    >
                      TOP #1 STADIUM
                    </Title>
                    <Paragraph className="m-0 italic text-white/90 text-sm">
                      Vinh dự nhận giải thưởng sân bóng được yêu thích nhất rực
                      rỡ.
                    </Paragraph>
                  </div>
                ),
              },
            ]}
            className="custom-timeline"
          />
        </div>

        {/* ================= SECTION 6: LỜI CAM KẾT VÀNG ================= */}
        <motion.div {...fadeInUp} className="mb-40">
          <Card className="bg-[#052c22] border-emerald-900 rounded-[60px] p-0 overflow-hidden shadow-3xl relative h-[600px] flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1500"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              alt="Commit"
            />
            <div className="relative z-10 p-20 text-center bg-gradient-to-t from-[#052c22] via-[#052c22]/80 to-transparent">
              <Tag
                color="#fbbf24"
                className="font-black italic px-8 py-1 rounded-full border-none mb-8 text-slate-900 uppercase"
              >
                OUR COMMITMENT
              </Tag>
              <Paragraph className="text-4xl font-black italic text-white leading-tight mb-8">
                "Chúng tôi cam kết không bao giờ ngừng cải tiến rực rỡ. Mỗi bước
                chạy của bạn trên sân là danh dự của HOA STADIUM."
              </Paragraph>
              <Title
                level={2}
                className="!text-yellow-400 !m-0 !font-black !italic uppercase tracking-widest"
              >
                - CEO THANH HÓA -
              </Title>
            </div>
          </Card>
        </motion.div>

        {/* ================= SECTION 7: FINAL CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="rounded-[80px] p-24 bg-gradient-to-br from-emerald-600 to-[#021f18] border-none relative overflow-hidden shadow-glow">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grid grid-cols-6 gap-20 -rotate-12 scale-150">
              {[...Array(24)].map((_, i) => (
                <FireOutlined key={i} className="text-6xl text-white" />
              ))}
            </div>
            <Title
              level={1}
              className="!text-white !font-black !italic !uppercase !mb-10 !text-7xl tracking-tighter"
            >
              VIẾT TIẾP <span className="text-yellow-400">HUYỀN THOẠI</span>{" "}
              <br /> CÙNG HOA STADIUM?
            </Title>
            <Space size={80} wrap className="justify-center mb-20">
              <div className="text-center">
                <div className="text-6xl font-black text-white mb-2">100%</div>
                <div className="text-xs uppercase font-black italic text-emerald-400 tracking-widest">
                  Mặt cỏ FIFA Pro
                </div>
              </div>
              <Divider
                type="vertical"
                style={{ height: 80, background: "rgba(255,255,255,0.1)" }}
              />
              <div className="text-center">
                <div className="text-6xl font-black text-white mb-2">24/7</div>
                <div className="text-xs uppercase font-black italic text-emerald-400 tracking-widest">
                  Hỗ trợ rực rỡ
                </div>
              </div>
            </Space>
            <br />
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              className="h-24 px-32 rounded-[40px] bg-yellow-400 hover:!bg-yellow-500 border-none font-black italic uppercase text-slate-900 shadow-3xl text-2xl hover:scale-110 transition-all flex items-center justify-center mx-auto"
              onClick={() => navigate("/fields")}
            >
              XÁC NHẬN RA SÂN NGAY!
            </Button>
          </Card>
        </motion.div>
      </div>

      <style>{`
        .shadow-glow { box-shadow: 0 0 40px rgba(16, 185, 129, 0.4); }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5); }
        .ant-timeline-item-label { width: 140px !important; }
        .ant-timeline-item-content { font-size: 16px !important; padding-bottom: 50px !important; }
      `}</style>
    </div>
  );
};

export default AboutUs;

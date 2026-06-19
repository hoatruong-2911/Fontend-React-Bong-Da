import { Card, Typography, Button, Row, Col, Divider, Tag, Space } from "antd";
import {
  CompassOutlined,
  GlobalOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function MapLocation() {
  // 🛑 CẬP NHẬT CHÍNH XÁC: Link Iframe dẫn thẳng tới Văn Lâm, Thuận Nam, Ninh Thuận
  const mapIframe = `
    <iframe 
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.2045558137357!2d109.00473217415442!3d11.411130546788331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3173d33f695a1925%3A0x2a08269bb2e5f9ca!2zU8OCTiBCw5RORyDEkMOBIFbEg04gIEzDlE0oc8OibiBj4buPIG5ow6JuIHThuqFvKQ!5e0!3m2!1svi!2s!4v1709400000000!5m2!1svi!2s" 
      width="100%" 
      height="500" 
      style="border:0;" 
      allowfullscreen="" 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  `;

  return (
    <div className="min-h-screen relative py-16 animate-in fade-in zoom-in duration-700 overflow-hidden bg-football-pattern">
      {/* 🛑 LỚP NỀN GRADIENT XANH NHẸ & HỌA TIẾT */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 z-0"></div>

      {/* 🛑 CÁC HỌA TIẾT BÓNG ĐÁ CHÌM TRÊN NỀN */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id="ballPattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#ballPattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Tag
            className="
              /* Kích thước và Font */
              text-lg px-10 py-3 font-black italic uppercase mb-6 
              
              /* Màu nền Gradient rực rỡ */
              bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 
              
              /* Màu chữ trắng nổi bật trên nền xanh */
              text-white 
              
              /* Bo tròn và viền */
              rounded-full border-none 
              
              /* Hiệu ứng Đổ bóng phát sáng (Glow) */
              shadow-[0_0_20px_rgba(16,185,129,0.6)] 
              
              /* Hiệu ứng tương tác & Animation */
              hover:scale-110 hover:shadow-[0_0_30px_rgba(16,185,129,0.9)] 
              transition-all duration-300 cursor-default
              animate-pulse
            "
          >
            Hệ thống sân bóng số 1 Ninh Thuận
          </Tag>
          <Title
            level={1}
            className="!font-black !italic !uppercase !text-slate-800 tracking-tighter !mb-2 drop-shadow-sm"
          >
            📍 Tìm đường tới{" "}
            <span className="text-emerald-500 underline decoration-emerald-200 underline-offset-8">
              Platinum Stadium
            </span>
          </Title>
          <Text className="text-slate-500 font-bold italic text-lg">
            Văn Lâm 3 - Nơi đam mê rực cháy trên từng đường bóng!
          </Text>
        </div>

        <Row gutter={[32, 32]}>
          {/* Cột bên trái: Thông tin & Nút điều hướng */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/90 backdrop-blur-md p-2 transition-all hover:shadow-emerald-100 hover:border-emerald-100 border border-transparent">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200">
                    <InfoCircleOutlined />
                  </div>
                  <Title
                    level={4}
                    className="!m-0 !font-black !italic uppercase text-slate-700"
                  >
                    Thông tin sân
                  </Title>
                </div>

                <div className="space-y-4">
                  <div>
                    <Text className="block text-[10px] font-black uppercase italic text-slate-400 tracking-widest">
                      Địa chỉ vàng:
                    </Text>
                    <Text className="font-bold text-slate-700">
                      Văn Lâm 3, Thuận Nam, Ninh Thuận, Việt Nam
                    </Text>
                  </div>
                  <Divider className="my-2 border-slate-50" />
                  <div>
                    <Text className="block text-[10px] font-black uppercase italic text-slate-400 tracking-widest">
                      Hotline đặt sân:
                    </Text>
                    <Text className="font-bold text-emerald-600 text-lg flex items-center gap-2">
                      <PhoneOutlined spin /> 0123 456 789
                    </Text>
                  </div>
                  <Divider className="my-2 border-slate-50" />
                  <div>
                    <Text className="block text-[10px] font-black uppercase italic text-slate-400 tracking-widest">
                      Giờ hoạt động:
                    </Text>
                    <Tag
                      color="blue"
                      icon={<ClockCircleOutlined />}
                      className="font-bold border-none px-4 py-1 mt-1 rounded-lg shadow-sm"
                    >
                      05:00 - 23:00 (Hàng ngày)
                    </Tag>
                  </div>
                </div>
              </Card>

              {/* Nút điều hướng rực rỡ */}
              <Card className="border-none rounded-[2.5rem] bg-emerald-600 p-2 shadow-2xl shadow-emerald-300/50 transition-all hover:scale-[1.03] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <ThunderboltOutlined
                    style={{ fontSize: "100px", color: "white" }}
                  />
                </div>
                <div className="text-white text-center py-4 relative z-10">
                  <Title
                    level={5}
                    className="!text-white !font-black !italic uppercase mb-2 tracking-wider"
                  >
                    Bạn đang ở xa?
                  </Title>
                  <Text className="text-emerald-500 bg-white/90 rounded-full px-4 py-1 text-[10px] font-black uppercase italic mb-6 inline-block">
                    Google Maps Navigation
                  </Text>
                  <Button
                    block
                    size="large"
                    icon={<CompassOutlined />}
                    // 🛑 CẬP NHẬT CHÍNH XÁC: Link mở Google Maps dẫn tới Sân bóng Văn Lâm
                    href="https://www.google.com/maps?ll=11.494261,108.924867&z=16&t=m&hl=vi&gl=US&mapclient=embed&cid=3028713199569861066"
                    target="_blank"
                    className="h-14 rounded-2xl border-none bg-white text-emerald-700 font-black italic uppercase shadow-xl hover:bg-emerald-50"
                  >
                    Mở Bản Đồ Xịn
                  </Button>
                </div>
              </Card>

              {/* DỮ LIỆU TĨNH: CÁC TIỆN ÍCH TẠI SÂN */}
              <Card
                title={
                  <span className="font-black italic uppercase text-[12px] text-slate-500">
                    Tiện ích đi kèm
                  </span>
                }
                className="shadow-xl border-none rounded-[2.5rem] bg-white/80 backdrop-blur-sm"
              >
                <Row gutter={[12, 12]}>
                  {[
                    { icon: <CoffeeOutlined />, text: "Căng tin & Nước uống" },
                    { icon: <CheckCircleOutlined />, text: "Wifi Miễn phí" },
                    {
                      icon: <ThunderboltOutlined />,
                      text: "Hệ thống đèn LED xịn",
                    },
                    { icon: <TeamOutlined />, text: "Phòng thay đồ" },
                  ].map((item, idx) => (
                    <Col span={12} key={idx}>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-emerald-500">{item.icon}</span>
                        <span className="text-[10px] font-bold text-slate-600">
                          {item.text}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </div>
          </Col>

          {/* Cột bên phải: Bản đồ Iframe */}
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              <Card className="shadow-2xl rounded-[3rem] border-none overflow-hidden bg-white p-3 border-4 border-white">
                <div
                  className="rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner relative group"
                  style={{ lineHeight: 0 }}
                  dangerouslySetInnerHTML={{ __html: mapIframe }}
                />
                <div className="p-6 flex justify-between items-center bg-slate-50 mt-3 rounded-b-[2rem] border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <GlobalOutlined />
                    </div>
                    <div>
                      <Text className="font-black italic uppercase text-[10px] text-slate-500 tracking-widest block">
                        Tọa độ GPS Platinum:
                      </Text>
                      <Text className="font-bold text-slate-400 text-[12px]">
                        11.4111, 109.0047
                      </Text>
                    </div>
                  </div>
                  <Tag
                    color="emerald"
                    className="border-none font-black italic text-white uppercase text-[10px] px-6 py-1 rounded-full shadow-md bg-emerald-500 animate-pulse"
                  >
                    Verified Location
                  </Tag>
                </div>
              </Card>

              {/* DỮ LIỆU TĨNH: QUY ĐỊNH SÂN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "KHÔNG HÚT THUỐC", color: "red" },
                  { title: "GIÀY CỎ NHÂN TẠO", color: "blue" },
                  { title: "ĐÚNG GIỜ THI ĐẤU", color: "orange" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-white p-4 rounded-3xl shadow-lg border-b-4 border-${item.color}-500 text-center`}
                  >
                    <Text
                      className={`font-black italic uppercase text-[10px] text-${item.color}-600`}
                    >
                      {item.title}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-16 text-center">
          <Divider className="border-emerald-100" />
          <Text className="text-slate-400 font-bold italic uppercase text-[11px] tracking-[0.5em] block mb-2">
            Platinum Stadium - Sân chơi của những nhà vô địch
          </Text>
          <Text className="text-slate-300 text-[9px] uppercase font-medium italic">
            Copyright © 2024 Platinum Sports Club - Văn Lâm 3 - Ninh Thuận
          </Text>
        </div>
      </div>

      <style>{`
        .bg-football-pattern {
            background-image: 
                radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.05) 1px, transparent 0);
            background-size: 30px 30px;
        }
        iframe {
          filter: contrast(1.1) brightness(1.02) saturate(1.1);
          transition: all 0.5s ease;
          border-radius: 20px;
        }
        .ant-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ant-card:hover {
          transform: translateY(-8px);
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// 🛑 Helper để không bị lỗi Component TeamOutlined chưa import
function TeamOutlined() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
      <path d="M824.2 699.9a301.55 301.55 0 0 0-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.5-89.5-200-200-200s-200 89.5-200 200c0 62.8 28.9 118.8 74.2 155.5-32.7 18.3-62.1 43.2-86.4 73.9a301.55 301.55 0 0 0-86.4-60.4C354.1 602.8 383 546.8 383 484c0-110.5-89.5-200-200-200S-17 373.5-17 484c0 62.8 28.9 118.8 74.2 155.5-68.6 38.4-115.1 110.4-115.1 193.1 0 10.1 8.2 18.3 18.3 18.3h71.2c10.1 0 18.3-8.2 18.3-18.3 0-110.2 89.7-200 200-200s200 89.8 200 200c0 10.1 8.2 18.3 18.3 18.3h71.2c10.1 0 18.3-8.2 18.3-18.3 0-82.7-46.5-154.7-115.1-193.1z"></path>
    </svg>
  );
}

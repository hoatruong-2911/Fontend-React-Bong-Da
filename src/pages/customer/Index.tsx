import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Rate,
  Spin,
  message,
  Space,
} from "antd";
import {
  ShoppingCartOutlined,
  PhoneOutlined,
  StarFilled,
  ClockCircleOutlined,
  EnvironmentFilled,
  CalendarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import homeService, { Field, Product } from "@/services/customer/HomeService";
import { ProductCard } from "@/components/customer/ProductCard";

// Đảm bảo import đúng đường dẫn ảnh tĩnh của bro
import quangHai from "../../../assets/images/quang_hai.jpg";
import congPhuong from "../../../assets/images/cong_phuong.jpg";
import cancris from "../../../assets/images/can_cris.jpg";

const { Title, Paragraph, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [apiFields, setApiFields] = useState<Field[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  // Dữ liệu tĩnh Celebs đặt ở đây để nhận các biến import ảnh
  const celebs = [
    {
      name: "Nguyễn Quang Hải",
      image: quangHai,
      review:
        "“Sân chất lượng tốt, cỏ FIFA rực rỡ. Trải nghiệm rất chuyên nghiệp!”",
    },
    {
      name: "Nguyễn Công Phượng",
      image: congPhuong,
      review:
        "“Không gian tuyệt vời, mặt sân êm rực rỡ, phù hợp luyện tập đỉnh cao.”",
    },
    {
      name: "Cán Cris",
      image: cancris,
      review:
        "“Đi quay vlog mà book sân quá nhanh, chất lượng phục vụ rực rỡ!”",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fieldRes, productRes] = await Promise.all([
          homeService.getFeaturedFields(),
          homeService.getFeaturedProducts(),
        ]);

        if (fieldRes.success && Array.isArray(fieldRes.data)) {
          const mappedFields = fieldRes.data.map((f) => ({
            id: f.id,
            name: f.name,
            image: f.image,
            price_per_hour: Number(f.price_per_hour) || 0,
            type: f.type,
            is_active: Boolean(f.is_active),
          }));
          setApiFields(mappedFields.slice(0, 3)); // Lấy 3 sân mới nhất
        }

        if (productRes.success && Array.isArray(productRes.data)) {
          const mappedProducts = productRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            image: p.image,
            category:
              (typeof p.category === "object"
                ? p.category?.name
                : p.category) || "Món ăn",
            brand:
              (typeof p.brand === "object" ? p.brand?.name : p.brand) ||
              "Sport Pro",
            unit: p.unit || "món",
            stock: Number(p.stock) || 0,
            description: p.description,
            is_active: Boolean(p.available),
          }));
          setApiProducts(mappedProducts.slice(0, 4)); // Lấy 4 sản phẩm mới nhất
        }
      } catch (error) {
        message.error("Lỗi kết nối dữ liệu rực rỡ!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(
      (item: { id: number }) => item.id === product.id
    );
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    message.success(`Đã thêm ${product.name} rực rỡ!`);
  };

  const handleBuyNow = (p: Product) => {
    navigate("/checkout", { state: { buyNowItem: { ...p, quantity: 1 } } });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  return (
    <div style={{ background: "#fcfdfe" }}>
      {/* HERO SECTION - Thu gọn vừa mắt */}
      <div
        style={{
          height: 480,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: "white",
            textAlign: "center",
            maxWidth: 800,
            padding: "0 20px",
          }}
        >
          <Title
            style={{
              color: "white",
              fontSize: 48,
              fontWeight: 900,
              marginBottom: 12,
            }}
            className="italic uppercase"
          >
            WESPORT PLATFORM
          </Title>
          <Paragraph
            style={{ color: "white", fontSize: 18, opacity: 0.9 }}
            className="italic font-bold"
          >
            Đặt sân thần tốc - Năng lượng bùng nổ rực rỡ.
          </Paragraph>
          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              className="h-12 px-8 rounded-xl font-black italic shadow-lg bg-emerald-500 border-none mr-4"
              onClick={() => navigate("/fields")}
            >
              ĐẶT SÂN NGAY
            </Button>
            <Button
              size="large"
              ghost
              className="h-12 px-8 rounded-xl font-black italic border-2 hover:bg-white/10"
              onClick={() => navigate("/products")}
            >
              CỬA HÀNG
            </Button>
          </div>
        </div>
      </div>

      {/* FEATURES - Gọn gàng chuyên nghiệp */}
      <div style={{ padding: "50px 40px", background: "white" }}>
        <Row gutter={[24, 24]}>
          {[
            {
              icon: <ClockCircleOutlined />,
              title: "Mở cửa 24/7",
              desc: "Linh hoạt giờ chơi",
            },
            {
              icon: <EnvironmentFilled />,
              title: "Vị trí đẹp",
              desc: "Gần trung tâm",
            },
            {
              icon: <StarFilled />,
              title: "Chất lượng cao",
              desc: "Cỏ chuẩn FIFA",
            },
            {
              icon: <CalendarOutlined />,
              title: "Đặt sân dễ",
              desc: "Xác nhận 30s",
            },
          ].map((f, i) => (
            <Col xs={12} md={6} key={i}>
              <div className="text-center p-6 border border-gray-50 rounded-[32px] hover:shadow-xl transition-all group bg-white">
                <div
                  style={{ fontSize: 32, color: "#10b981", marginBottom: 12 }}
                  className="group-hover:scale-110 transition-transform"
                >
                  {f.icon}
                </div>
                <div className="font-black italic uppercase text-xs mb-1">
                  {f.title}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  {f.desc}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* SÂN BÓNG MỚI NHẤT - API DỮ LIỆU THẬT */}
      <div style={{ padding: "80px 40px", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Title
            level={2}
            style={{ fontWeight: 900 }}
            className="italic uppercase m-0"
          >
            HỆ THỐNG SÂN BÓNG <span className="text-blue-600">MỚI NHẤT</span>
          </Title>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto mt-2 rounded-full shadow-sm" />
        </div>
        {loading ? (
          <div className="text-center py-20">
            <Spin tip="Đang tải cực phẩm..." />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {apiFields.map((field) => (
              <Col xs={24} md={8} key={field.id}>
                <Card
                  hoverable
                  className="rounded-[40px] overflow-hidden border-none shadow-xl"
                  cover={
                    <img
                      src={field.image ? `${STORAGE_URL}${field.image}` : ""}
                      style={{ height: 240, objectFit: "cover" }}
                    />
                  }
                >
                  <Title level={4} className="italic font-black uppercase m-0">
                    {field.name}
                  </Title>
                  <Tag
                    color="blue"
                    className="mt-2 font-bold rounded-lg border-none bg-blue-50 text-blue-600 text-[10px]"
                  >
                    SÂN {field.type} NGƯỜI
                  </Tag>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                    <div>
                      <Text className="text-gray-400 font-black italic uppercase text-[9px] block">
                        Giá thuê rực rỡ
                      </Text>
                      <Text className="text-2xl font-black text-blue-700 italic">
                        {field.price_per_hour.toLocaleString()}đ
                        <span className="text-xs">/h</span>
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      className="rounded-2xl font-black italic px-8 h-12 bg-blue-600 shadow-md"
                      onClick={() => navigate(`/fields/${field.id}`)}
                    >
                      CHI TIẾT
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* CỬA HÀNG - DÙNG PRODUCT CARD CHUẨN ĐẸP */}
      <div style={{ padding: "80px 40px", background: "white" }}>
        <div className="flex justify-between items-end mb-10">
          <div>
            <Title
              level={2}
              style={{ fontWeight: 900 }}
              className="italic uppercase m-0 text-emerald-600"
            >
              CỬA HÀNG NĂNG LƯỢNG
            </Title>
            <div className="w-16 h-1.5 bg-emerald-500 mt-2 rounded-full" />
          </div>
          <Button
            type="link"
            onClick={() => navigate("/products")}
            className="font-black italic uppercase text-emerald-600 text-sm"
          >
            XEM TẤT CẢ <ArrowRightOutlined />
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <Spin />
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {apiProducts.map((p) => (
              <Col xs={24} sm={12} lg={6} key={p.id}>
                <ProductCard
                  product={p}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* INTRO VIDEO - Size vừa phải */}
      <div
        style={{
          height: 400,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          textAlign: "center",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,128,0,0.4)",
          }}
        />
        <div style={{ position: "relative" }}>
          <Title
            style={{ color: "white", fontSize: 40, fontWeight: 900 }}
            className="italic uppercase m-0"
          >
            WESPORT INTRO
          </Title>
          <PlayCircleOutlined
            style={{
              fontSize: 80,
              color: "#fff",
              cursor: "pointer",
              marginTop: 20,
            }}
            className="hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {/* CELEBS - DỮ LIỆU TĨNH RỰC RỠ */}
      <div style={{ padding: "100px 40px", background: "#f8fafc" }}>
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 80, fontWeight: 900 }}
          className="italic uppercase"
        >
          ĐỒNG HÀNH CÙNG <span className="text-blue-600">SIÊU SAO</span>
        </Title>
        <Row gutter={[32, 32]}>
          {celebs.map((c, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card className="text-center rounded-[40px] border-none shadow-2xl p-10 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <StarFilled style={{ fontSize: 100 }} />
                </div>
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "6px solid #f8fafc",
                  }}
                  className="shadow-2xl mb-6 mx-auto hover:rotate-6 transition-transform"
                />
                <Title
                  level={3}
                  className="font-black italic uppercase text-slate-800 text-xl"
                >
                  {c.name}
                </Title>
                <Paragraph
                  italic
                  className="text-slate-400 text-base leading-relaxed"
                >
                  "{c.review}"
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CONTACT INFO */}
      <div
        style={{ padding: "80px 40px", background: "#001529", color: "white" }}
      >
        <Row gutter={48} justify="center">
          <Col md={8} className="text-center">
            <EnvironmentOutlined
              style={{ fontSize: 40, color: "#1890ff", marginBottom: 20 }}
            />
            <div className="font-black italic uppercase text-xs mb-1">
              VỊ TRÍ RỰC RỠ
            </div>
            <Text className="text-gray-400 text-[11px]">
              123 Stadium Drive, Gò Vấp, TP.HCM
            </Text>
          </Col>
          <Col md={8} className="text-center">
            <PhoneOutlined
              style={{
                fontSize: 40,
                color: "#1890ff",
                marginBottom: 20,
                transform: "rotate(90deg)",
              }}
            />
            <div className="font-black italic uppercase text-xs mb-1">
              KẾT NỐI NGAY
            </div>
            <Text className="text-gray-400 text-[11px]">
              Hotline: 0900 123 456
            </Text>
          </Col>
          <Col md={8} className="text-center">
            <MailOutlined
              style={{ fontSize: 40, color: "#1890ff", marginBottom: 20 }}
            />
            <div className="font-black italic uppercase text-xs mb-1">
              EMAIL HỖ TRỢ
            </div>
            <Text className="text-gray-400 text-[11px]">
              contact@wesport.vn
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Index;

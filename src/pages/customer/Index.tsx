import { Button, Card, Row, Col, Typography, Tag, Rate } from "antd";
import {
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  StarFilled,
  ClockCircleOutlined,
  EnvironmentFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import quangHai from "../../../assets/images/quang_hai.jpg";
import congPhuong from "../../../assets/images/cong_phuong.jpg";
import cancris from "../../../assets/images/can_cris.jpg";

const { Title, Paragraph } = Typography;

/* ========================== TYPES ========================== */
interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface Field {
  id: number;
  name: string;
  image: string;
  price: string;
  rating: number;
  size: string;
  surface: string;
  available: boolean;
}

interface Celeb {
  name: string;
  image: string;
  review: string;
}

/* ========================== DATA ========================== */
const features: Feature[] = [
  {
    icon: <ClockCircleOutlined style={{ fontSize: 30, color: "#1677ff" }} />,
    title: "Mở cửa 24/7",
    desc: "Linh hoạt giờ chơi theo nhu cầu",
  },
  {
    icon: <EnvironmentFilled style={{ fontSize: 30, color: "#1677ff" }} />,
    title: "Vị trí thuận lợi",
    desc: "Gần trung tâm thành phố",
  },
  {
    icon: <StarFilled style={{ fontSize: 30, color: "#1677ff" }} />,
    title: "Chất lượng cao",
    desc: "Cỏ nhân tạo tiêu chuẩn FIFA",
  },
  {
    icon: <CalendarOutlined style={{ fontSize: 30, color: "#1677ff" }} />,
    title: "Đặt sân dễ dàng",
    desc: "Đặt online nhanh chóng",
  },
];

const fields: Field[] = [
  {
    id: 1,
    name: "Sân 1 - Sân 5 người",
    image:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
    price: "500,000đ",
    rating: 4.8,
    size: "5 vs 5",
    surface: "Cỏ nhân tạo",
    available: true,
  },
  {
    id: 2,
    name: "Sân 2 - Sân 7 người",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    price: "800,000đ",
    rating: 4.9,
    size: "7 vs 7",
    surface: "Cỏ nhân tạo",
    available: true,
  },
  {
    id: 3,
    name: "Sân 3 - Sân 11 người",
    image:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600&q=80",
    price: "1,200,000đ",
    rating: 5,
    size: "11 vs 11",
    surface: "Cỏ tự nhiên",
    available: false,
  },
];

const celebs: Celeb[] = [
  {
    name: "Nguyễn Quang Hải",
    image: quangHai,
    review:
      "“Sân chất lượng tốt, đặt sân nhanh chóng. Trải nghiệm rất chuyên nghiệp!”",
  },
  {
    name: "Nguyễn Công Phượng",
    image: congPhuong,
    review:
      "“Không gian tuyệt vời, mặt sân êm, rất phù hợp để luyện tập và thi đấu.”",
  },
  {
    name: "Cán Cris",
    image: cancris,
    review:
      "“Đi quay vlog mà book sân quá nhanh, chất lượng sân tuyệt vời!”",
  },
];

/* ========================== COMPONENT ========================== */
const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f5f5f5" }}>
      {/* ================= HERO ================= */}
      <div
        style={{
          height: 550,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: "white",
            textAlign: "center",
            top: "35%",
          }}
        >
          <Title style={{ color: "white", fontSize: 48 }}>
            NỀN TẢNG ĐẶT SÂN SỐ 1
          </Title>
          <Paragraph style={{ color: "white", fontSize: 20 }}>
            Đặt sân bóng nhanh – có sân ngay.
          </Paragraph>

          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              style={{ marginRight: 16 }}
              onClick={() => navigate("/fields")}
            >
              Đặt sân
            </Button>
            <Button size="large" icon={<SearchOutlined />}>
              Liên hệ về chúng tôi
            </Button>
          </div>
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <div style={{ padding: "60px 80px", background: "white" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Tại sao chọn chúng tôi?
        </Title>

        <Row gutter={[30, 30]}>
          {features.map((f) => (
            <Col xs={24} md={12} lg={6} key={f.title}>
              <Card hoverable style={{ textAlign: "center" }}>
                {f.icon}
                <Title level={4} style={{ marginTop: 16 }}>
                  {f.title}
                </Title>
                <Paragraph>{f.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ================= 2 IMAGE BLOCK ================= */}
      <div style={{ padding: "50px 80px", background: "white" }}>
        <Row gutter={40} justify="center">
          <Col xs={24} md={10}>
            <Card
              hoverable
              cover={
                <img src={fields[0].image} alt="" />
              }
            >
              <Title level={4}>ĐẶT SÂN NHANH CHÓNG</Title>
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Card
              hoverable
              cover={
                <img src={fields[1].image} alt="" />
              }
            >
              <Title level={4}>SÂN BÓNG HIỆN ĐẠI</Title>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ================= FIELDS ================= */}
      <div style={{ padding: "60px 80px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Các sân bóng của chúng tôi
        </Title>

        <Row gutter={[30, 30]}>
          {fields.map((field) => (
            <Col xs={24} md={12} lg={8} key={field.id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: "relative" }}>
                    <img
                      src={field.image}
                      alt={field.name}
                      style={{
                        height: 200,
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Tag
                      color={field.available ? "green" : "red"}
                      style={{ position: "absolute", top: 10, right: 10 }}
                    >
                      {field.available ? "Còn trống" : "Đã đầy"}
                    </Tag>
                  </div>
                }
              >
                <Title level={4}>{field.name}</Title>
                <Rate disabled allowHalf defaultValue={field.rating} />
                <Paragraph>Mặt sân: {field.surface}</Paragraph>
                <Paragraph>Quy mô: {field.size}</Paragraph>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1677ff",
                  }}
                >
                  {field.price}/giờ
                </div>
                <Button
                  type="primary"
                  block
                  size="large"
                  disabled={!field.available}
                >
                  {field.available ? "Đặt sân ngay" : "Hết chỗ"}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ================= INTRO VIDEO ================= */}
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
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />
        <div style={{ position: "relative", top: "40%" }}>
          <Title style={{ color: "white" }}>WESPORT INTRO</Title>
          <PlayCircleOutlined style={{ fontSize: 60 }} />
        </div>
      </div>

      {/* ================= PARTNERS ================= */}
      <div style={{ padding: "50px 80px", background: "white" }}>
        <Title level={2} style={{ textAlign: "center" }}>
          ĐỐI TÁC CỦA CHÚNG TÔI
        </Title>
        <Paragraph style={{ textAlign: "center", width: "60%", margin: "0 auto" }}>
          Trở thành đối tác của chúng tôi để cùng phát triển cộng đồng thể thao.
        </Paragraph>
      </div>

      {/* ================= CONTACT ================= */}
      <div style={{ padding: "60px 80px", background: "white" }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Liên hệ với chúng tôi
        </Title>

        <Row gutter={40} justify="center">
          <Col md={8} style={{ textAlign: "center" }}>
            <EnvironmentOutlined style={{ fontSize: 36, color: "#1677ff" }} />
            <Paragraph>123 Đường ABC, TP.HCM</Paragraph>
          </Col>
          <Col md={8} style={{ textAlign: "center" }}>
            <PhoneOutlined style={{ fontSize: 36, color: "#1677ff" }} />
            <Paragraph>0123 456 789</Paragraph>
          </Col>
          <Col md={8} style={{ textAlign: "center" }}>
            <MailOutlined style={{ fontSize: 36, color: "#1677ff" }} />
            <Paragraph>info@sanbong.vn</Paragraph>
          </Col>
        </Row>
      </div>

      {/* ================= CELEBS ================= */}
      <div style={{ padding: "60px 80px", background: "white" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Trải nghiệm của khách hàng nổi tiếng
        </Title>

        <Row gutter={[30, 30]}>
          {celebs.map((c) => (
            <Col xs={24} md={8} key={c.name}>
              <Card hoverable style={{ textAlign: "center" }}>
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 20,
                  }}
                />
                <Title level={4}>{c.name}</Title>
                <Paragraph italic>{c.review}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Index;

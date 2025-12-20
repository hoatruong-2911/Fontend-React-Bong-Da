import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Row,
  Col,
  Image,
  message,
  Spin,
  Typography,
  Space,
  Divider,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  StarOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

// IMPORT SERVICE
import adminFieldService from "@/services/admin/fieldService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function FieldDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [field, setField] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await adminFieldService.getFieldById(id);
          if (response.success) {
            setField(response.data);
          }
        }
      } catch (error: any) {
        console.error("Lỗi lấy chi tiết sân:", error);
        message.error("Không thể tải thông tin sân bóng");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 min-h-screen bg-gray-50">
        <Spin size="large" />
        <Text className="mt-4 text-green-600 font-medium animate-pulse">
          Đang chuẩn bị mặt sân rực rỡ...
        </Text>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="text-center py-24 bg-gray-50 min-h-screen">
        <Title level={2}>Không tìm thấy sân bóng</Title>
        <Button
          type="primary"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/fields")}
          className="mt-4 rounded-full"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-8 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Rực rỡ Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-white/60">
          <div className="flex items-center gap-5">
            <Button
              className="flex items-center justify-center border-none shadow-lg hover:scale-110 transition-all bg-white"
              shape="circle"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/fields")}
            />
            <div>
              <Space align="center" size="small">
                <Title
                  level={2}
                  className="m-0 text-green-800 uppercase tracking-tight"
                >
                  {field.name}
                </Title>
                <Badge
                  status={field.available ? "success" : "error"}
                  text={
                    <Text
                      strong
                      className={
                        field.available ? "text-green-600" : "text-red-600"
                      }
                    >
                      {field.available ? "Đang mở cửa" : "Bảo trì"}
                    </Text>
                  }
                />
              </Space>
              <Text className="text-gray-500 flex items-center gap-2 mt-1">
                <EnvironmentOutlined className="text-red-500" />{" "}
                {field.location}
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<EditOutlined />}
            style={{
              background: "linear-gradient(45deg, #2ecc71, #27ae60)",
              border: "none",
            }}
            className="rounded-2xl shadow-lg flex items-center hover:brightness-110"
            onClick={() => navigate(`/admin/fields/${id}/edit`)}
          >
            Chỉnh sửa thông tin
          </Button>
        </div>

        <Row gutter={[32, 32]}>
          {/* Hình ảnh rực rỡ phía trái */}
          <Col xs={24} lg={10}>
            <Card
              className="border-none shadow-2xl overflow-hidden hover:shadow-green-100 transition-all"
              style={{ borderRadius: 32 }}
              bodyStyle={{ padding: 0 }}
            >
              <div className="relative group">
                <Image
                  src={field.image}
                  alt={field.name}
                  className="w-full h-[450px] object-cover transition-transform duration-500 group-hover:scale-105"
                  fallback="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop"
                />
                <div className="absolute top-4 right-4">
                  <Tag
                    color="rgba(0,0,0,0.6)"
                    className="px-3 py-1 rounded-full backdrop-blur-md border-none text-white font-bold"
                  >
                    <StarOutlined className="text-yellow-400 mr-1" />{" "}
                    {field.rating || "5.0"}
                  </Tag>
                </div>
              </div>
            </Card>

            <Card
              className="mt-8 border-none shadow-xl bg-green-900 text-white overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              <div className="flex items-center justify-between">
                <Space direction="vertical" size={0}>
                  <Text className="text-green-200 uppercase text-xs font-bold tracking-widest">
                    Giá thuê sân
                  </Text>
                  <Title level={2} className="m-0 text-white">
                    {formatCurrency(field.price)}
                    <span className="text-lg font-normal">/giờ</span>
                  </Title>
                </Space>
                <DollarCircleOutlined className="text-5xl opacity-20" />
              </div>
            </Card>
          </Col>

          {/* Chi tiết rực rỡ phía phải */}
          <Col xs={24} lg={14}>
            <Card
              className="border-none shadow-xl"
              style={{ borderRadius: 32 }}
            >
              <Title level={4} className="mb-6 flex items-center gap-2">
                <InfoCircleOutlined className="text-green-600" /> Thông tin mặt
                sân & Quy mô
              </Title>

              <Row gutter={[16, 16]} className="mb-8">
                <Col span={12}>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <Text
                      type="secondary"
                      className="block text-xs uppercase font-bold mb-1"
                    >
                      Loại sân bóng
                    </Text>
                    <Title level={5} className="m-0">
                      <ProjectOutlined className="mr-2 text-blue-500" /> Sân{" "}
                      {field.size} người
                    </Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <Text
                      type="secondary"
                      className="block text-xs uppercase font-bold mb-1"
                    >
                      Bề mặt thi đấu
                    </Text>
                    <Title level={5} className="m-0">
                      <ThunderboltOutlined className="mr-2 text-purple-500" />{" "}
                      {field.surface}
                    </Title>
                  </div>
                </Col>
              </Row>

              <Descriptions column={1} className="custom-field-descriptions">
                <Descriptions.Item
                  label={
                    <Text strong className="flex items-center gap-2">
                      <EnvironmentOutlined /> Địa chỉ chính xác
                    </Text>
                  }
                >
                  {field.location}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong className="flex items-center gap-2">
                      <StarOutlined /> Chỉ số uy tín
                    </Text>
                  }
                >
                  <Space>
                    <Text strong className="text-lg">
                      {field.rating}
                    </Text>
                    <Text type="secondary">
                      ({field.reviews_count || 0} lượt khách đánh giá)
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong className="flex items-center gap-2">
                      <CheckCircleOutlined /> Tiện ích đi kèm
                    </Text>
                  }
                >
                  <div className="flex flex-wrap gap-2 mt-1">
                    {field.features && Array.isArray(field.features) ? (
                      field.features.map((feature: string, idx: number) => (
                        <Tag
                          key={idx}
                          className="border-none bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg"
                        >
                          {feature}
                        </Tag>
                      ))
                    ) : (
                      <Text italic className="text-gray-400">
                        Đang cập nhật tiện ích...
                      </Text>
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider className="my-6" />

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <Title level={5} className="flex items-center gap-2 mb-3">
                  <InfoCircleOutlined className="text-blue-500" /> Mô tả chi
                  tiết
                </Title>
                <p className="text-gray-600 leading-relaxed italic">
                  {field.description ||
                    "Chào mừng bạn đến với sân bóng tiêu chuẩn chất lượng cao. Sân được trang bị hệ thống đèn chiếu sáng hiện đại, cỏ nhân tạo đạt chuẩn FIFA, mang lại trải nghiệm thi đấu tốt nhất cho các vận động viên."}
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-field-descriptions .ant-descriptions-item-label {
          width: 180px;
          color: #64748b;
        }
        .custom-field-descriptions .ant-descriptions-item-content {
          color: #1e293b;
          font-weight: 500;
        }
        .ant-card-title {
          font-weight: 800 !important;
          color: #13341c !important;
        }
      `}</style>
    </div>
  );
}

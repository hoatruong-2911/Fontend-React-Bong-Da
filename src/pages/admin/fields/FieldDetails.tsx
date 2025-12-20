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
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  StarOutlined,
} from "@ant-design/icons";

// IMPORT SERVICE
import adminFieldService from "@/services/admin/fieldService";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};


export default function FieldDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Trạng thái lưu trữ dữ liệu từ API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (error: any) {
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
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Không tìm thấy sân</h2>
        <Button onClick={() => navigate("/admin/fields")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/fields")}
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{field.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <EnvironmentOutlined /> {field.location}
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/fields/${id}/edit`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <Row gutter={24}>
        {/* Image */}
        <Col xs={24} md={10}>
          <Card className="border-0 shadow-md">
            <Image
              src={field.image}
              alt={field.name}
              className="rounded-lg w-full object-cover"
              fallback="https://via.placeholder.com/400x300?text=No+Image"
            />
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} md={14}>
          <Card className="border-0 shadow-md">
            <Descriptions title="Thông tin sân" bordered column={1}>
              <Descriptions.Item label="Tên sân">
                {field.name}
              </Descriptions.Item>
              {/* Hiển thị loại sân dựa trên field.size (ví dụ: 5 -> Sân 5 người) */}
              <Descriptions.Item label="Loại sân">
                Sân {field.size} người
              </Descriptions.Item>
              <Descriptions.Item label="Mặt sân">
                {field.surface}
              </Descriptions.Item>
              <Descriptions.Item label="Giá thuê">
                <span className="text-primary font-semibold">
                  {formatCurrency(field.price)}/giờ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                {field.location}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                <span className="flex items-center gap-1">
                  <StarOutlined
                    className="text-warning"
                    style={{ color: "#faad14" }}
                  />
                  {field.rating} ({field.reviews_count || 0} đánh giá)
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={field.available ? "green" : "red"}>
                  {field.available ? "Hoạt động" : "Bảo trì"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiện ích">
                <div className="flex flex-wrap gap-1">
                  {/* Kiểm tra và hiển thị mảng features từ API */}
                  {field.features && Array.isArray(field.features) ? (
                    field.features.map((feature: string, idx: number) => (
                      <Tag key={idx} color="blue">
                        {feature}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">
                      Không có tiện ích
                    </span>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="border-0 shadow-md mt-4">
            <h3 className="font-semibold mb-2">Mô tả</h3>
            <p className="text-muted-foreground">
              {field.description || "Không có mô tả cho sân bóng này."}
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

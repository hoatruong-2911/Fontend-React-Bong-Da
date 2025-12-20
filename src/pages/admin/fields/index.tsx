import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// IMPORT SERVICE
import adminFieldService, { Field } from "@/services/admin/fieldService";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function FieldsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Lấy dữ liệu từ API
  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await adminFieldService.getFields();

      // ĐÚNG: Laravel Pagination trả về danh sách thực sự nằm trong data.data
      // Nếu không dùng phân trang thì là response.data
      const result = response.data?.data || response.data || [];

      setFields(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. Tính toán thống kê (Sửa logic khớp DB)
  const stats = useMemo(() => {
    const total = fields.length;
    // Database dùng available là 1/0
    const active = fields.filter((f) => Number(f.available) === 1).length;
    const inactive = total - active;

    const avgRating =
      total > 0
        ? (
            fields.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / total
          ).toFixed(1)
        : "0.0";

    return { total, active, inactive, avgRating };
  }, [fields]);

  // 3. Hàm xử lý Xóa (Đã sửa: Tách biệt logic API khỏi UI xác nhận)
  const confirmDelete = async (id: number) => {
    try {
      const response = await adminFieldService.deleteField(id);
      if (response.success) {
        message.success("Đã xóa sân bóng thành công");
        fetchFields(); // Tải lại danh sách sau khi xóa
      }
    } catch (error) {
      message.error("Không thể xóa sân bóng này");
    }
  };

  const filteredFields = fields.filter((field) =>
    field.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 3. Định nghĩa các cột (Khớp chính xác với cột Database)
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string) => (
        <img
          src={image} // Chuỗi Base64 hoặc Link URL đều chạy được trong thẻ src
          alt="Sân bóng"
          style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 4 }}
          // Nếu ảnh lỗi (do chuỗi base64 bị cắt nửa chừng) thì hiện ảnh mặc định
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1574629810360-7efdf195018e?q=80&w=200";
          }}
        />
      ),
    },
    { title: "Tên sân", dataIndex: "name", key: "name" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Mặt sân",
      dataIndex: "surface",
      key: "surface",
      render: (surface: string) => (
        <span>
          {surface ? (
            surface
          ) : (
            <span style={{ color: "#bfbfbf", fontStyle: "italic" }}>
              Chưa có dữ liệu
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Giá/giờ",
      dataIndex: "price", // Khớp với cột 'price' trong DB
      key: "price",
      render: (price: number) => (
        <strong>{formatCurrency(Number(price) || 0)}</strong>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => (
        <span style={{ color: "#faad14", fontWeight: "bold" }}>
          ⭐ {rating || "0.0"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "available", // Khớp với cột 'available' trong DB
      key: "available",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (available: any) => {
        const isActive = Number(available) === 1;
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Hoạt động" : "Bảo trì"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Field) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/fields/${record.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => navigate(`/admin/fields/edit/${record.id}`)}
          />
          <Popconfirm
            title="Xác nhận xóa sân?"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            onConfirm={() => confirmDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Stats Section */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" variant="outlined">
            <Statistic
              title="Tổng số sân"
              value={stats.total}
              prefix={<EnvironmentOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{ backgroundColor: "#f6ffed" }}
            variant="outlined"
          >
            <Statistic
              title="Hoạt động"
              value={stats.active}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{ backgroundColor: "#fff1f0" }}
            variant="outlined"
          >
            <Statistic
              title="Bảo trì"
              value={stats.inactive}
              styles={{ content: { color: "#f5222d" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{ backgroundColor: "#fffbe6" }}
            variant="outlined"
          >
            <Statistic
              title="Đánh giá TB"
              value={stats.avgRating}
              prefix="⭐"
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card
        variant="borderless"
        styles={{ body: { padding: "16px" } }}
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Tìm sân bóng..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/fields/add")}
            >
              Thêm sân mới
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredFields} // filteredFields là kết quả sau khi bạn search từ mảng fields
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5, // Hiển thị 5 sân mỗi dòng trên giao diện để test phân trang
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} sân`,
          }}
        />
      </Card>
    </div>
  );
}

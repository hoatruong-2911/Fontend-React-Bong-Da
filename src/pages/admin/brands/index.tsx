import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Input,
  message,
  Avatar,
  Typography,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import brandService, { Brand } from "@/services/admin/brandService";

const { Title, Text } = Typography;

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await brandService.getBrands();
      setBrands(res.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Tính toán số liệu cho Dashboard
  const stats = {
    total: brands.length,
    active: brands.filter((b) => b.is_active).length,
    inactive: brands.filter((b) => !b.is_active).length,
    totalProducts: brands.reduce((sum, b) => sum + (b.products_count || 0), 0),
  };

  const handleDelete = async (id: number) => {
    try {
      await brandService.deleteBrand(id);
      message.success("Đã xóa thương hiệu thành công!");
      fetchBrands();
    } catch (error) {
      message.error("Xóa thất bại!");
    }
  };

  const columns = [
    {
      title: "THƯƠNG HIỆU",
      key: "brand",
      render: (record: Brand) => (
        <Space size="middle">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <Avatar
              key={record.logo}
              src={
                record.logo
                  ? `http://127.0.0.1:8000/storage/${record.logo}`
                  : null
              }
              shape="square"
              size={54}
              icon={<AppstoreOutlined />}
              className="relative z-10 border-2 border-white shadow-sm rounded-xl"
              style={{ background: "#f0fdf4", objectFit: "contain" }}
            />
          </div>
          <div className="flex flex-col">
            <Text
              strong
              className="block text-green-900 uppercase italic font-black leading-none tracking-tight"
            >
              {record.name}
            </Text>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {record.slug}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "WEBSITE",
      dataIndex: "website",
      render: (text: string) =>
        text ? (
          <a
            href={text}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-500 font-bold"
          >
            <GlobalOutlined /> Visit Site
          </a>
        ) : (
          <Text type="secondary" className="text-xs opacity-50">
            N/A
          </Text>
        ),
    },
    {
      title: "MẶT HÀNG",
      dataIndex: "products_count",
      align: "center" as const,
      render: (count: number) => (
        <div className="bg-blue-50 py-1 px-3 rounded-lg inline-block border border-blue-100">
          <Text className="text-sm font-black text-blue-600">{count || 0}</Text>
        </div>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "is_active",
      render: (active: boolean) => (
        <Tag
          color={active ? "green" : "red"}
          className="rounded-full px-4 border-none font-black text-[10px] uppercase shadow-sm"
        >
          {active ? "● Active" : "○ Inactive"}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right" as const,
      render: (record: Brand) => (
        <Space size="middle">
          {/* Nút Xem chi tiết - Icon EyeOutlined màu xanh lá */}
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/brands/${record.id}`)}
            />
          </Tooltip>

          {/* Nút Chỉnh sửa - Icon EditOutlined màu xanh dương */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin/brands/edit/${record.id}`)}
            />
          </Tooltip>

          {/* Nút Xóa - Icon DeleteOutlined màu đỏ bọc trong Popconfirm */}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa thương hiệu này?"
              description="Tất cả sản phẩm liên quan sẽ bị mất hãng sản xuất!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-2 animate-in fade-in duration-700">
      {/* 1. Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <Title
            level={2}
            className="m-0 !text-green-800 font-black italic uppercase tracking-tighter"
          >
            Hãng Sản Xuất <span className="text-green-400">Brands</span>
          </Title>
          <Text className="text-gray-400 font-medium">
            Phân tích và quản lý đối tác thương hiệu
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-gradient-to-r from-green-600 to-emerald-500 border-none rounded-2xl shadow-xl font-bold px-8 hover:scale-105 transition-transform"
          onClick={() => navigate("add")}
        >
          Tạo Brand Mới
        </Button>
      </div>

      {/* 2. Dashboard Stats Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-white to-green-50 overflow-hidden relative">
            <RocketOutlined className="absolute -right-4 -bottom-4 text-6xl text-green-100 opacity-50 rotate-12" />
            <Statistic
              title={
                <Text className="text-gray-400 uppercase font-black text-[10px] tracking-widest">
                  Tổng Thương Hiệu
                </Text>
              }
              value={stats.total}
              valueStyle={{
                color: "#064e3b",
                fontWeight: 900,
                fontSize: "28px",
              }}
              prefix={<AppstoreOutlined className="mr-2 opacity-50" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-white to-emerald-50 overflow-hidden relative">
            <CheckCircleOutlined className="absolute -right-4 -bottom-4 text-6xl text-emerald-100 opacity-50" />
            <Statistic
              title={
                <Text className="text-gray-400 uppercase font-black text-[10px] tracking-widest">
                  Đang Hoạt Động
                </Text>
              }
              value={stats.active}
              valueStyle={{
                color: "#059669",
                fontWeight: 900,
                fontSize: "28px",
              }}
              prefix={
                <div className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 animate-pulse" />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-white to-orange-50 overflow-hidden relative">
            <StopOutlined className="absolute -right-4 -bottom-4 text-6xl text-orange-100 opacity-50" />
            <Statistic
              title={
                <Text className="text-gray-400 uppercase font-black text-[10px] tracking-widest">
                  Tạm Ngưng
                </Text>
              }
              value={stats.inactive}
              valueStyle={{
                color: "#d97706",
                fontWeight: 900,
                fontSize: "28px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-white to-blue-50 overflow-hidden relative">
            <ShoppingOutlined className="absolute -right-4 -bottom-4 text-6xl text-blue-100 opacity-50" />
            <Statistic
              title={
                <Text className="text-gray-400 uppercase font-black text-[10px] tracking-widest">
                  Tổng Sản Phẩm
                </Text>
              }
              value={stats.totalProducts}
              valueStyle={{
                color: "#2563eb",
                fontWeight: 900,
                fontSize: "28px",
              }}
              suffix={
                <span className="text-xs font-bold text-blue-300 ml-1 italic">
                  SKU
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 3. Main Table Section */}
      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/70 backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Input
            placeholder="Tìm kiếm thương hiệu đối tác..."
            prefix={<SearchOutlined className="text-green-500" />}
            className="w-full md:w-96 rounded-2xl border-none h-12 shadow-inner bg-gray-100/50 px-5"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={brands.filter((b) =>
            b.name.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, className: "px-4" }}
          className="brand-table"
        />
      </Card>

      <style>{`
        .brand-table .ant-table { background: transparent !important; }
        .brand-table .ant-table-thead > tr > th {
          background: rgba(248, 250, 252, 0.5) !important;
          color: #64748b !important;
          font-size: 11px;
          letter-spacing: 0.1em;
          font-weight: 800;
          border-bottom: 2px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}

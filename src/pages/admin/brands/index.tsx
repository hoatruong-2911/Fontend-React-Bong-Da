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
import { authService } from "@/services";

const { Title, Text } = Typography;

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  // ✅ 0. LOGIC PHÂN QUYỀN PLATINUM
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin"; // Check nếu là Admin mới được sửa/xóa

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
        <Space size="middle" className="py-1">
          <div className="relative group">
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
              className="border border-slate-200 shadow-sm rounded-xl bg-white p-1"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="flex flex-col">
            <Text
              strong
              className="block text-slate-800 uppercase italic font-black leading-none tracking-tight text-[14px]"
            >
              {record.name}
            </Text>
            <Text className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
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
            className="flex items-center gap-1 text-blue-500 font-bold hover:text-blue-600 transition-colors"
          >
            <GlobalOutlined /> Website
          </a>
        ) : (
          <Text type="secondary" className="text-[11px] opacity-50 italic">
            Chưa cập nhật
          </Text>
        ),
    },
    {
      title: "MẶT HÀNG",
      dataIndex: "products_count",
      align: "center" as const,
      render: (count: number) => (
        <div className="bg-slate-50 py-1 px-3 rounded-lg inline-block border border-slate-200 shadow-inner">
          <Text className="text-sm font-black text-slate-700">
            {count || 0}
          </Text>
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
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="border-none bg-slate-100 rounded-lg hover:bg-emerald-500 hover:text-white"
              onClick={() => navigate(`/admin/brands/${record.id}`)}
            />
          </Tooltip>

          <Tooltip title={isAdmin ? "Sửa" : "Bạn không có quyền sửa"}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={!isAdmin}
              size="small"
              className="rounded-lg shadow-sm"
              onClick={() => navigate(`/admin/brands/edit/${record.id}`)}
            />
          </Tooltip>

          <Tooltip title={isAdmin ? "Xóa" : "Bạn không có quyền xóa"}>
            <Popconfirm
              title="Xóa thương hiệu này?"
              disabled={!isAdmin}
              description="Sản phẩm liên quan sẽ bị ảnh hưởng!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="border-none bg-red-50 rounded-lg"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* 1. Header Area Platinum - Tinh chỉnh rực rỡ hơn */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <Title
            level={2}
            className="m-0 !text-slate-800 font-black italic uppercase tracking-tighter"
          >
            Hãng Sản Xuất <span className="text-emerald-500">Brands</span>
          </Title>
          <Text className="text-slate-400 font-medium italic">
            Quản lý đối tác thương hiệu hệ thống
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-emerald-600 border-none rounded-xl shadow-lg shadow-emerald-200 font-bold px-8 hover:scale-105 transition-transform"
          onClick={() => navigate("add")}
        >
          Tạo Brand Mới
        </Button>
      </div>

      {/* 2. Dashboard Stats Section - Glow Effect nhẹ */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: "Tổng Thương Hiệu",
            value: stats.total,
            icon: <AppstoreOutlined />,
            color: "border-blue-500",
          },
          {
            title: "Đang Hoạt Động",
            value: stats.active,
            icon: <CheckCircleOutlined />,
            color: "border-emerald-500",
          },
          {
            title: "Tạm Ngưng",
            value: stats.inactive,
            icon: <StopOutlined />,
            color: "border-orange-500",
          },
          {
            title: "Tổng Sản Phẩm",
            value: stats.totalProducts,
            icon: <ShoppingOutlined />,
            color: "border-indigo-500",
            suffix: "SKU",
          },
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className={`rounded-2xl border-0 border-t-4 ${item.color} shadow-sm hover:shadow-md transition-all`}
            >
              <Statistic
                title={
                  <Text className="text-slate-400 uppercase font-black text-[10px] tracking-widest">
                    {item.title}
                  </Text>
                }
                value={item.value}
                valueStyle={{
                  color: "#1e293b",
                  fontWeight: 900,
                  fontSize: "24px",
                }}
                prefix={<div className="mr-2 opacity-50">{item.icon}</div>}
                suffix={
                  <span className="text-[10px] text-slate-300 font-bold ml-1">
                    {item.suffix}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 3. Main Table Section - Glassmorphism nhẹ */}
      <Card className="shadow-xl border-none rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md p-2">
        <div className="mb-6 flex items-center justify-between gap-4 px-2 mt-2">
          <Input
            placeholder="Tìm kiếm thương hiệu đối tác..."
            prefix={<SearchOutlined className="text-emerald-500" />}
            className="w-full md:w-96 rounded-xl border-none h-11 shadow-inner bg-slate-50 px-4 font-medium"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={brands.filter((b) =>
            b.name.toLowerCase().includes(searchText.toLowerCase()),
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, className: "px-4" }}
          className="brand-table-custom"
        />
      </Card>

      <style>{`
        .brand-table-custom .ant-table { background: transparent !important; }
        .brand-table-custom .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px;
          letter-spacing: 0.1em;
          font-weight: 800;
          text-transform: uppercase;
          font-style: italic;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .brand-table-custom .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
          transition: all 0.3s;
        }
        .brand-table-custom .ant-table-row:hover > td {
          background-color: #f0fdfa !important;
        }
      `}</style>
    </div>
  );
}

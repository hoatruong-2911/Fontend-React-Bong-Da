import { useState, useEffect, useMemo } from "react";
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BoxPlotOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import productService, { Product } from "@/services/admin/productService";

const { Title, Text } = Typography;

export default function ProductIndex() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // 1. Hàm lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      message.error("Lỗi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Hàm Xóa Sản Phẩm (Mới bổ sung)
  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success("Đã xóa sản phẩm khỏi kho!");
      fetchProducts(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      message.error("Xóa thất bại, sản phẩm có thể đang nằm trong đơn hàng!");
    }
  };

  // 3. Hàm Đổi Trạng Thái (Mới bổ sung)
  const handleToggleStatus = async (id: number) => {
    try {
      await productService.toggleStatus(id);
      message.success("Cập nhật trạng thái thành công!");
      fetchProducts();
    } catch (error) {
      message.error("Thao tác thất bại!");
    }
  };

  // Logic tính toán Dashboard
  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => !!p.available).length,
      lowStock: products.filter((p) => p.stock < 10).length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    }),
    [products]
  );

  const columns = [
    {
      title: "SẢN PHẨM",
      key: "product",
      render: (record: Product) => (
        <Space size="middle">
          <Avatar
            src={
              record.image
                ? `http://127.0.0.1:8000/storage/${record.image}`
                : null
            }
            shape="square"
            size={54}
            icon={<BoxPlotOutlined />}
            className="rounded-xl border border-gray-100 bg-gray-50 shadow-sm"
          />
          <div className="flex flex-col">
            <Text
              strong
              className="text-blue-900 uppercase italic font-black text-[13px]"
            >
              {record.name}
            </Text>
            <Space
              split={
                <Text type="secondary" style={{ fontSize: 10 }}>
                  |
                </Text>
              }
            >
              <Text className="text-[10px] text-blue-500 font-bold uppercase">
                {record.brand?.name}
              </Text>
              <Text className="text-[10px] text-orange-500 font-bold uppercase">
                {record.category?.name}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "GIÁ BÁN",
      dataIndex: "price",
      render: (price: number) => (
        <Text strong className="text-red-500">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </Text>
      ),
    },
    {
      title: "KHO",
      dataIndex: "stock",
      align: "center" as const,
      render: (stock: number) => (
        <Tag
          color={stock < 10 ? "red" : "green"}
          className="rounded-full font-bold border-none px-3"
        >
          {stock}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right" as const,
      width: 140,
      render: (record: Product) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="border-none bg-gray-100"
              onClick={() => navigate(`${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              className="shadow-sm"
              onClick={() => navigate(`edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="border-none bg-red-50 text-red-500"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <Title
            level={2}
            className="m-0! !text-green-800 font-black italic uppercase"
          >
            Kho Hàng{" "}
            <span className="text-gray-300 not-italic font-light text-xl">
              PRODUCTS
            </span>
          </Title>
          <Text className="text-gray-400 font-medium italic text-xs">
            Quản lý tồn kho và giá bán sản phẩm
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-green-600 border-none rounded-xl shadow-lg font-bold"
          onClick={() => navigate("add")}
        >
          Nhập Sản Phẩm
        </Button>
      </div>

      {/* Dashboard Section (4 Card tương tự Brand) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Text strong className="text-gray-400 text-[10px] uppercase">
              Tổng sản phẩm
            </Text>
            <Title level={2} className="m-0! mt-1">
              {stats.total}
            </Title>
            <ShoppingOutlined className="absolute -right-2 -bottom-2 text-blue-500 opacity-10 text-6xl" />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Text strong className="text-gray-400 text-[10px] uppercase">
              Đang mở bán
            </Text>
            <Title level={2} className="m-0! mt-1 text-green-600">
              {stats.active}
            </Title>
            <CheckCircleOutlined className="absolute -right-2 -bottom-2 text-green-500 opacity-10 text-6xl" />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Text strong className="text-gray-400 text-[10px] uppercase">
              Sắp hết hàng
            </Text>
            <Title level={2} className="m-0! mt-1 text-orange-500">
              {stats.lowStock}
            </Title>
            <StopOutlined className="absolute -right-2 -bottom-2 text-orange-500 opacity-10 text-6xl" />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <Text strong className="text-gray-400 text-[10px] uppercase">
              Tổng vốn tồn kho
            </Text>
            <Title level={3} className="m-0! mt-2 text-blue-800">
              {new Intl.NumberFormat("vi-VN").format(stats.totalValue)} đ
            </Title>
            <BoxPlotOutlined className="absolute -right-2 -bottom-2 text-indigo-500 opacity-10 text-6xl" />
          </div>
        </Col>
      </Row>

      {/* Table Section */}
      <Card className="shadow-xl border-none rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md">
        <Input
          placeholder="Tìm kiếm theo tên sản phẩm..."
          prefix={<SearchOutlined className="text-green-500" />}
          className="w-80 mb-6 rounded-xl h-10 bg-gray-50 border-none px-4 shadow-inner"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={products.filter((p) =>
            p.name.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}

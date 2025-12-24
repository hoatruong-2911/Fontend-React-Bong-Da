import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Descriptions,
  Avatar,
  Divider,
  Spin,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  BoxPlotOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DollarOutlined,
  DropboxOutlined,
} from "@ant-design/icons";
import productService, { Product } from "@/services/admin/productService";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(Number(id));
        setProduct(res.data);
      } catch (error) {
        message.error("Sản phẩm không tồn tại!");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !product)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang kiểm kho..." />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/products")}
          className="rounded-full shadow-sm"
        >
          {" "}
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/products/edit/${id}`)}
          className="bg-blue-600 rounded-xl px-8 shadow-lg"
        >
          {" "}
          Chỉnh sửa sản phẩm
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Bên trái: Hình ảnh & Stats nhanh */}
        <Col xs={24} md={9}>
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden p-2 bg-white">
            <div className="aspect-square rounded-[32px] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
              <img
                src={
                  product.image
                    ? `http://127.0.0.1:8000/storage/${product.image}`
                    : "https://placehold.co/600x600?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text
                        strong
                        className="text-[10px] uppercase text-gray-400"
                      >
                        Tồn kho hiện tại
                      </Text>
                    }
                    value={product.stock}
                    prefix={<DropboxOutlined className="text-orange-500" />}
                    valueStyle={{
                      color:
                        product.stock < 10 ? "#ef4444" : "#10b981",
                      fontWeight: 900,
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text
                        strong
                        className="text-[10px] uppercase text-gray-400"
                      >
                        Giá trị đơn chiếc
                      </Text>
                    }
                    value={product.price}
                    prefix={<DollarOutlined className="text-green-500" />}
                    valueStyle={{ fontWeight: 900, fontSize: "20px" }}
                    suffix={<span className="text-xs">đ</span>}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Bên phải: Thông tin chi tiết */}
        <Col xs={24} md={15}>
          <div className="space-y-6">
            <Card className="rounded-[32px] border-none shadow-xl bg-white/80 backdrop-blur-md p-4">
              <Space direction="vertical" className="w-full" size={0}>
                <Space>
                  <Tag
                    color="blue"
                    className="rounded-full px-3 font-bold uppercase"
                  >
                    {product.brand?.name}
                  </Tag>
                  <Tag
                    color="orange"
                    className="rounded-full px-3 font-bold uppercase"
                  >
                    {product.category?.name}
                  </Tag>
                </Space>
                <Title
                  level={2}
                  className="m-0 mt-2 !text-green-900 font-black italic uppercase"
                >
                  {product.name}
                </Title>
                <Text type="secondary" className="font-mono text-xs italic">
                  SKU: PROD-{product.id}-
                  {product.slug?.substring(0, 5).toUpperCase()}
                </Text>
              </Space>

              <Divider className="my-6" />

              <Descriptions column={2} className="product-descriptions">
                <Descriptions.Item
                  label={
                    <Text
                      strong
                      className="text-gray-400 uppercase text-[10px]"
                    >
                      Trạng thái
                    </Text>
                  }
                >
                  {product.available ? (
                    <Tag
                      color="green"
                      icon={<CheckCircleOutlined />}
                      className="rounded-full"
                    >
                      ĐANG MỞ BÁN
                    </Tag>
                  ) : (
                    <Tag
                      color="red"
                      icon={<StopOutlined />}
                      className="rounded-full"
                    >
                      ĐANG KHÓA
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text
                      strong
                      className="text-gray-400 uppercase text-[10px]"
                    >
                      Ngày nhập kho
                    </Text>
                  }
                >
                  <Text className="font-bold">
                    {new Date(product.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text
                      strong
                      className="text-gray-400 uppercase text-[10px]"
                    >
                      Cập nhật lần cuối
                    </Text>
                  }
                  span={2}
                >
                  <Text className="font-bold text-blue-500 italic">
                    <HistoryOutlined />{" "}
                    {new Date(product.updated_at).toLocaleString("vi-VN")}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <div className="mt-8">
                <Text
                  strong
                  className="text-gray-400 uppercase text-[10px] block mb-2"
                >
                  Mô tả sản phẩm
                </Text>
                <Paragraph className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl italic border border-dashed border-gray-200">
                  {product.description ||
                    "Thương hiệu chưa cung cấp mô tả chi tiết cho mặt hàng này."}
                </Paragraph>
              </div>
            </Card>

            <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-r from-green-600 to-emerald-500 p-1">
              <div className="p-4 flex items-center justify-between text-white">
                <Space>
                  <BoxPlotOutlined className="text-2xl" />
                  <Text className="text-white font-bold uppercase italic">
                    Tổng vốn tồn kho dự kiến:
                  </Text>
                </Space>
                <Title level={3} className="m-0 !text-white italic">
                  {(product.price * product.stock).toLocaleString()}{" "}
                  VNĐ
                </Title>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

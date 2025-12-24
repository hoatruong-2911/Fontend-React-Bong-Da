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
  Empty,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  GlobalOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import brandService from "@/services/admin/brandService";

const { Title, Text, Paragraph } = Typography;

export default function BrandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await brandService.getBrandById(Number(id));
        setBrand(res.data);
      } catch (error) {
        message.error("Không tìm thấy dữ liệu thương hiệu!");
        navigate("/admin/brands");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang lấy dữ liệu rực rỡ..." />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in zoom-in-95 duration-500">
      {/* Header điều hướng */}
      <div className="flex justify-between items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/brands")}
          className="rounded-full shadow-sm"
        >
          {" "}
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/brands/edit/${id}`)}
          className="bg-blue-500 rounded-xl px-6"
        >
          {" "}
          Chỉnh sửa thông tin
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Cột trái: Profile Card */}
        <Col xs={24} md={8}>
          <Card className="rounded-[32px] border-none shadow-2xl overflow-hidden text-center p-4 bg-gradient-to-b from-white to-green-50">
            <div className="py-8 flex flex-col items-center">
              <Avatar
                src={
                  brand.logo
                    ? `http://127.0.0.1:8000/storage/${brand.logo}`
                    : null
                }
                size={160}
                shape="square"
                className="rounded-3xl shadow-2xl border-4 border-white mb-6"
                style={{ background: "#fff", objectFit: "contain" }}
              />
              <Title
                level={3}
                className="m-0 !text-green-900 uppercase italic font-black"
              >
                {brand.name}
              </Title>
              <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                ID: #{brand.id} | Slug: {brand.slug}
              </Text>

              <div className="mt-6 w-full flex justify-around bg-white p-4 rounded-2xl shadow-inner">
                <div>
                  <Title level={4} className="m-0 !text-blue-600">
                    {brand.products_count || 0}
                  </Title>
                  <Text className="text-[10px] uppercase font-bold text-gray-400">
                    Sản phẩm
                  </Text>
                </div>
                <Divider type="vertical" className="h-10" />
                <div>
                  <Title level={4} className="m-0 !text-green-600">
                    {brand.sort_order}
                  </Title>
                  <Text className="text-[10px] uppercase font-bold text-gray-400">
                    Thứ tự
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Cột phải: Thông tin chi tiết */}
        <Col xs={24} md={16}>
          <div className="space-y-6">
            <Card className="rounded-[32px] border-none shadow-xl bg-white/80 backdrop-blur-md p-2">
              <Title
                level={4}
                className="flex items-center gap-2 text-green-800 uppercase italic"
              >
                <InfoCircleOutlined /> Thông tin chi tiết
              </Title>
              <Divider className="my-3" />
              <Descriptions
                column={1}
                bordered
                className="rounded-xl overflow-hidden"
              >
                <Descriptions.Item label={<Text strong>Website</Text>}>
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      className="text-blue-500 font-bold"
                    >
                      {brand.website}
                    </a>
                  ) : (
                    "Chưa cập nhật"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Trạng thái</Text>}>
                  {brand.is_active ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      ĐANG KINH DOANH
                    </Tag>
                  ) : (
                    <Tag color="red" icon={<StopOutlined />}>
                      NGỪNG HOẠT ĐỘNG
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Mô tả</Text>}>
                  <Paragraph className="text-gray-600 m-0 italic">
                    {brand.description || "Không có mô tả cho thương hiệu này."}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Danh sách sản phẩm mới nhất */}
            <Card className="rounded-[32px] border-none shadow-xl bg-white/80 p-2">
              <Title
                level={4}
                className="flex items-center gap-2 text-blue-800 uppercase italic"
              >
                <ShoppingOutlined /> Sản phẩm mới cập nhật
              </Title>
              <Divider className="my-3" />
              {brand.products && brand.products.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={brand.products}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={`http://127.0.0.1:8000/storage/${item.image}`}
                            className="rounded-lg shadow-sm"
                          />
                        }
                        title={
                          <Text strong className="text-gray-700">
                            {item.name}
                          </Text>
                        }
                        description={
                          <Text className="text-green-600 font-mono">
                            {Number(item.price).toLocaleString()}đ
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có sản phẩm nào thuộc thương hiệu này" />
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Upload,
  InputNumber,
  message,
  Typography,
  Space,
  Radio,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import productService from "@/services/admin/productService";
import brandService from "@/services/admin/brandService";
import categoryService from "@/services/admin/categoryService";

const { Title, Text } = Typography;

export default function ProductAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [bRes, cRes] = await Promise.all([
        brandService.getBrands(),
        categoryService.getCategories(),
      ]);
      setBrands(bRes.data);
      setCategories(cRes.data);
    };
    loadData();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === "image" && values[key]?.[0]?.originFileObj) {
          formData.append(key, values[key][0].originFileObj);
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      await productService.createProduct(formData);
      message.success("Nhập kho thành công rực rỡ! 🚀");
      navigate("/admin/products");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi nhập hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <Space className="mb-8" size="large">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-full"
        />
        <Title
          level={2}
          className="m-0 !text-green-800 italic font-black uppercase"
        >
          Thêm Sản Phẩm Mới <ShoppingCartOutlined />
        </Title>
      </Space>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/90 backdrop-blur-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ available: "1", stock: 0, price: 0 }}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                name="name"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Tên sản phẩm
                  </Text>
                }
                rules={[{ required: true }]}
              >
                <Input
                  size="large"
                  placeholder="VD: Giày đá bóng Nike Mercurial..."
                  className="rounded-xl"
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category_id"
                    label={
                      <Text
                        strong
                        className="text-green-700 uppercase text-[11px]"
                      >
                        Danh mục
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      className="rounded-xl"
                      options={categories.map((c: any) => ({
                        label: c.name,
                        value: c.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="brand_id"
                    label={
                      <Text
                        strong
                        className="text-green-700 uppercase text-[11px]"
                      >
                        Thương hiệu
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      className="rounded-xl"
                      options={brands.map((b: any) => ({
                        label: b.name,
                        value: b.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label={
                      <Text
                        strong
                        className="text-green-700 uppercase text-[11px]"
                      >
                        Giá bán (VNĐ)
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      size="large"
                      className="w-full rounded-xl"
                      formatter={(val) =>
                        `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label={
                      <Text
                        strong
                        className="text-green-700 uppercase text-[11px]"
                      >
                        Số lượng kho
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      size="large"
                      className="w-full rounded-xl"
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="image"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Ảnh minh họa
                  </Text>
                }
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined className="text-green-500" />
                    <div className="mt-2 font-bold text-gray-400">Tải ảnh</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item
                name="available"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Trạng thái bán
                  </Text>
                }
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  className="w-full flex"
                >
                  <Radio value="1" className="flex-1 text-center rounded-l-xl">
                    MỞ BÁN
                  </Radio>
                  <Radio value="0" className="flex-1 text-center rounded-r-xl">
                    TẠM ẨN
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label={
              <Text strong className="text-green-700 uppercase text-[11px]">
                Mô tả chi tiết
              </Text>
            }
          >
            <Input.TextArea rows={4} className="rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              size="large"
              onClick={() => navigate(-1)}
              className="rounded-xl px-8"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-gradient-to-r from-green-600 to-emerald-500 border-none rounded-xl px-12 font-bold shadow-lg shadow-green-200"
            >
              Lưu Sản Phẩm
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

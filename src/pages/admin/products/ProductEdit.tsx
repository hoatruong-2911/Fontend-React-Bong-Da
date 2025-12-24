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
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import productService from "@/services/admin/productService";
import brandService from "@/services/admin/brandService";
import categoryService from "@/services/admin/categoryService";

const { Title, Text } = Typography;

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setFetching(true);
        const [bRes, cRes, pRes] = await Promise.all([
          brandService.getBrands(),
          categoryService.getCategories(),
          productService.getProductById(Number(id)),
        ]);

        setBrands(bRes.data);
        setCategories(cRes.data);

        const product = pRes.data;
        form.setFieldsValue({
          ...product,
          available: String(product.available),
          image: product.image
            ? [
                {
                  uid: "-1",
                  name: "Current Image",
                  status: "done",
                  url: `http://127.0.0.1:8000/storage/${product.image}`,
                },
              ]
            : [],
        });
      } catch (error) {
        message.error("Không thể tải dữ liệu sản phẩm!");
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Logic xử lý FormData tương tự trang Add nhưng gọi Update
      Object.keys(values).forEach((key) => {
        if (key === "image") {
          if (values[key]?.[0]?.originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else {
          formData.append(key, values[key]);
        }
      });

      await productService.updateProduct(Number(id), formData);
      message.success("Cập nhật kho thành công rực rỡ! ✨");
      navigate("/admin/products");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang truy xuất kho..." />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <Space className="mb-8" size="large">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-full shadow-sm"
        />
        <div>
          <Title
            level={2}
            className="m-0 !text-blue-800 italic font-black uppercase"
          >
            Chỉnh Sửa Sản Phẩm <EditOutlined />
          </Title>
          <Text className="text-gray-400 font-medium italic">
            ID: #{id} - Cập nhật thông số mặt hàng
          </Text>
        </div>
      </Space>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/90 backdrop-blur-md">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                name="name"
                label={
                  <Text strong className="text-blue-700 uppercase text-[11px]">
                    Tên sản phẩm
                  </Text>
                }
                rules={[{ required: true }]}
              >
                <Input size="large" className="rounded-xl border-blue-50" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category_id"
                    label={
                      <Text
                        strong
                        className="text-blue-700 uppercase text-[11px]"
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
                        className="text-blue-700 uppercase text-[11px]"
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
                        className="text-blue-700 uppercase text-[11px]"
                      >
                        Giá bán (VNĐ)
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <InputNumber size="large" className="w-full rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label={
                      <Text
                        strong
                        className="text-blue-700 uppercase text-[11px]"
                      >
                        Số lượng kho
                      </Text>
                    }
                    rules={[{ required: true }]}
                  >
                    <InputNumber size="large" className="w-full rounded-xl" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="image"
                label={
                  <Text strong className="text-blue-700 uppercase text-[11px]">
                    Đổi ảnh sản phẩm
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
                    <PlusOutlined className="text-blue-500" />
                    <div className="mt-2 font-bold text-gray-400">Thay đổi</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item
                name="available"
                label={
                  <Text strong className="text-blue-700 uppercase text-[11px]">
                    Trạng thái kinh doanh
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
                    NGỪNG
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label={
              <Text strong className="text-blue-700 uppercase text-[11px]">
                Mô tả sản phẩm
              </Text>
            }
          >
            <Input.TextArea rows={4} className="rounded-xl border-blue-50" />
          </Form.Item>
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              size="large"
              onClick={() => navigate(-1)}
              className="rounded-xl px-8"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 border-none rounded-xl px-12 font-bold shadow-lg"
            >
              Cập Nhật Kho
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

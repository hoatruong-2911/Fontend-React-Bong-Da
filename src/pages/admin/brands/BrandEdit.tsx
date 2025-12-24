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
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  RocketOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import brandService from "@/services/admin/brandService";

const { Title, Text } = Typography;

export default function BrandEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setFetching(true);
        const res = await brandService.getBrandById(Number(id));
        const brand = res.data;

        form.setFieldsValue({
          name: brand.name,
          website: brand.website,
          description: brand.description,
          sort_order: brand.sort_order,
          is_active: String(brand.is_active), // Chuyển sang string để match với Radio value
          logo: brand.logo
            ? [
                {
                  uid: "-1",
                  name: "Current Logo",
                  status: "done",
                  url: `http://127.0.0.1:8000/storage/${brand.logo}`,
                },
              ]
            : [],
        });
      } catch (error) {
        message.error("Không thể lấy thông tin thương hiệu!");
        navigate("/admin/brands");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchBrandData();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", values.name);
      if (values.website) formData.append("website", values.website);
      if (values.description)
        formData.append("description", values.description);
      formData.append("sort_order", values.sort_order);
      formData.append("is_active", values.is_active);

      if (values.logo && values.logo[0] && values.logo[0].originFileObj) {
        formData.append("logo", values.logo[0].originFileObj);
      }

      await brandService.updateBrand(Number(id), formData);
      message.success("Cập nhật thương hiệu thành công rực rỡ! ✨");
      navigate("/admin/brands");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Số thứ tự hoặc tên đã bị trùng!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Space size="large">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-full shadow-sm"
          />
          <div>
            <Title
              level={2}
              className="m-0 !text-green-800 font-black uppercase italic tracking-tighter"
            >
              Chỉnh Sửa Thương Hiệu <EditOutlined className="text-blue-500" />
            </Title>
            <Text className="text-gray-400 font-medium italic">
              Thay đổi thông tin đối tác chiến lược
            </Text>
          </div>
        </Space>
      </div>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-md">
        <Form form={form} layout="vertical" onFinish={onFinish} className="p-4">
          <Alert
            message="Hệ thống sẽ không cho phép hai thương hiệu có cùng một số thứ tự hiển thị."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            className="mb-6 rounded-xl border-orange-100 bg-orange-50/50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Form.Item
                name="name"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Tên thương hiệu
                  </Text>
                }
                rules={[{ required: true }]}
              >
                <Input size="large" className="rounded-xl border-green-50" />
              </Form.Item>
              <Form.Item
                name="website"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Website
                  </Text>
                }
              >
                <Input size="large" className="rounded-xl border-green-50" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="sort_order"
                  label={
                    <Text
                      strong
                      className="text-green-700 uppercase text-[11px]"
                    >
                      Thứ tự (Unique)
                    </Text>
                  }
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    className="w-full rounded-xl"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="is_active"
                  label={
                    <Text
                      strong
                      className="text-green-700 uppercase text-[11px]"
                    >
                      Trạng thái
                    </Text>
                  }
                >
                  <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    className="w-full flex"
                  >
                    <Radio
                      value="1"
                      className="flex-1 text-center rounded-l-xl"
                    >
                      HIỆN
                    </Radio>
                    <Radio
                      value="0"
                      className="flex-1 text-center rounded-r-xl"
                    >
                      ẨN
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item
                name="logo"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Logo (Tải để đổi)
                  </Text>
                }
                valuePropName="fileList"
                getValueFromEvent={(e: any) =>
                  Array.isArray(e) ? e : e?.fileList
                }
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <RocketOutlined className="text-green-500 text-xl" />
                    <div
                      style={{ marginTop: 8 }}
                      className="font-bold text-gray-400"
                    >
                      Đổi Ảnh
                    </div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item
                name="description"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Mô tả
                  </Text>
                }
              >
                <Input.TextArea
                  rows={4}
                  className="rounded-xl border-green-50"
                />
              </Form.Item>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4 border-t pt-8">
            <Button
              size="large"
              onClick={() => navigate(-1)}
              className="rounded-xl px-8 font-bold border-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 border-none rounded-xl px-12 shadow-lg font-bold"
            >
              Cập nhật dữ liệu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

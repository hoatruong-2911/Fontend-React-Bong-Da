import { useState } from "react";
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
  Alert,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  RocketOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import brandService from "@/services/admin/brandService";

const { Title, Text } = Typography;

export default function BrandAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
      if (values.website) formData.append("website", values.website);
      formData.append("sort_order", values.sort_order);
      formData.append("is_active", values.is_active);

      if (values.logo && values.logo[0]) {
        formData.append("logo", values.logo[0].originFileObj);
      }

      await brandService.createBrand(formData);
      message.success("Thêm thương hiệu mới thành công rực rỡ! 🚀");
      navigate("/admin/brands");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Lỗi khi thêm thương hiệu"
      );
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

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
              className="m-0 !text-green-800 tracking-tight uppercase italic font-black"
            >
              Thêm Thương Hiệu <RocketOutlined className="text-yellow-500" />
            </Title>
            <Text className="text-gray-400 font-medium italic">
              Khởi tạo đối tác cung cấp mới cho hệ thống
            </Text>
          </div>
        </Space>
      </div>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/90 backdrop-blur-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_active: "1", sort_order: 1 }}
          className="p-4"
        >
          <Alert
            message="Lưu ý: Thứ tự ưu tiên là duy nhất, số càng nhỏ thương hiệu càng hiện lên đầu."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mb-6 rounded-xl border-blue-100 bg-blue-50/50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Form.Item
                name="name"
                label={
                  <Text
                    strong
                    className="text-green-700 uppercase text-[11px] tracking-wider"
                  >
                    Tên thương hiệu
                  </Text>
                }
                rules={[
                  { required: true, message: "Nhập tên thương hiệu nhé bro!" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nike, Adidas..."
                  className="rounded-xl border-green-100"
                />
              </Form.Item>

              <Form.Item
                name="website"
                label={
                  <Text
                    strong
                    className="text-green-700 uppercase text-[11px] tracking-wider"
                  >
                    Website
                  </Text>
                }
                rules={[{ type: "url", message: "Địa chỉ web không hợp lệ!" }]}
              >
                <Input
                  size="large"
                  placeholder="https://..."
                  className="rounded-xl border-green-100"
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="sort_order"
                  label={
                    <Text
                      strong
                      className="text-green-700 uppercase text-[11px] tracking-wider"
                    >
                      Thứ tự ưu tiên
                    </Text>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Không được bỏ trống số thứ tự",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className="w-full rounded-xl"
                    size="large"
                    placeholder="Số 1, 2, 3..."
                  />
                </Form.Item>

                <Form.Item
                  name="is_active"
                  label={
                    <Text
                      strong
                      className="text-green-700 uppercase text-[11px] tracking-wider"
                    >
                      Trạng thái kinh doanh
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
                      ĐANG BÁN
                    </Radio>
                    <Radio
                      value="0"
                      className="flex-1 text-center rounded-r-xl"
                    >
                      NGỪNG
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item
                name="logo"
                label={
                  <Text
                    strong
                    className="text-green-700 uppercase text-[11px] tracking-wider"
                  >
                    Logo đại diện
                  </Text>
                }
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined className="text-green-500" />
                    <div
                      style={{ marginTop: 8 }}
                      className="font-bold text-gray-400"
                    >
                      Tải ảnh
                    </div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Text
                    strong
                    className="text-green-700 uppercase text-[11px] tracking-wider"
                  >
                    Mô tả ngắn
                  </Text>
                }
              >
                <Input.TextArea
                  rows={4}
                  className="rounded-xl border-green-100"
                  placeholder="..."
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
              className="bg-gradient-to-r from-green-600 to-emerald-500 border-none rounded-xl px-12 shadow-lg font-bold"
            >
              Lưu Thương Hiệu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

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
  TagsOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import categoryService from "@/services/admin/categoryService";

const { Title, Text } = Typography;

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Fetch dữ liệu cũ khi vào trang
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setFetching(true);
        const res = await categoryService.getCategoryById(Number(id));
        const category = res.data;

        form.setFieldsValue({
          name: category.name,
          description: category.description,
          sort_order: category.sort_order,
          is_active: String(category.is_active), // Chuyển sang string để đồng bộ với Radio Group
          // Hiển thị ảnh cũ trong Upload component
          image: category.image
            ? [
                {
                  uid: "-1",
                  name: "Current Image",
                  status: "done",
                  url: `http://127.0.0.1:8000/storage/${category.image}`,
                },
              ]
            : [],
        });
      } catch (error: any) {
        // 1. Kiểm tra xem có lỗi Validation (422) từ Laravel không
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors;

          // Lấy câu lỗi đầu tiên của từng trường bị sai
          Object.keys(errors).forEach((key) => {
            message.error(errors[key][0]); // Hiện đúng câu: "Tên danh mục... đã bị trùng..."
          });
        } else {
          // 2. Nếu là lỗi khác (500, mất mạng...)
          message.error(
            error.response?.data?.message ||
              "Lỗi hệ thống, kiểm tra lại server bro ơi!"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategoryData();
  }, [id, form, navigate]);

  // 2. Xử lý submit cập nhật
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Laravel yêu cầu _method PUT khi gửi FormData qua POST để update
      formData.append("_method", "PUT");
      formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
      formData.append("sort_order", values.sort_order);
      formData.append("is_active", values.is_active);

      // Chỉ gửi ảnh nếu người dùng chọn file mới (originFileObj tồn tại)
      if (values.image && values.image[0] && values.image[0].originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await categoryService.updateCategory(Number(id), formData);
      message.success("Cập nhật danh mục thành công rực rỡ! ✨");
      navigate("/admin/categories");
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          "Cập nhật thất bại, kiểm tra lại tên hoặc thứ tự!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu danh mục..." />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      {/* Header */}
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
              Chỉnh Sửa Danh Mục <EditOutlined className="text-blue-500" />
            </Title>
            <Text className="text-gray-400 font-medium italic">
              Cập nhật cấu trúc phân loại sản phẩm
            </Text>
          </div>
        </Space>
      </div>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-md">
        <Form form={form} layout="vertical" onFinish={onFinish} className="p-4">
          <Alert
            message="Lưu ý: Tên danh mục và Thứ tự ưu tiên phải là duy nhất trong hệ thống."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            className="mb-6 rounded-xl border-orange-100 bg-orange-50/50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái */}
            <div className="space-y-4">
              <Form.Item
                name="name"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Tên danh mục
                  </Text>
                }
                rules={[
                  {
                    required: true,
                    message: "Tên danh mục không được để trống!",
                  },
                ]}
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
                  rules={[{ required: true, message: "Cần số thứ tự!" }]}
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

              <Form.Item
                name="description"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Mô tả danh mục
                  </Text>
                }
              >
                <Input.TextArea
                  rows={6}
                  className="rounded-xl border-green-50"
                  placeholder="Mô tả về nhóm sản phẩm này..."
                />
              </Form.Item>
            </div>

            {/* Cột phải */}
            <div className="space-y-4">
              <Form.Item
                name="image"
                label={
                  <Text strong className="text-green-700 uppercase text-[11px]">
                    Ảnh đại diện (Tải lên để đổi)
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
                  className="category-upload"
                >
                  <div>
                    <TagsOutlined className="text-green-500 text-2xl" />
                    <div
                      style={{ marginTop: 8 }}
                      className="font-bold text-gray-400"
                    >
                      Đổi ảnh
                    </div>
                  </div>
                </Upload>
              </Form.Item>

              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                <Text type="secondary" className="text-xs italic">
                  * Mẹo: Sử dụng hình ảnh có kích thước vuông (1:1) để hiển thị
                  đẹp nhất trên ứng dụng khách hàng.
                </Text>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4 border-t pt-8">
            <Button
              size="large"
              onClick={() => navigate(-1)}
              className="rounded-xl px-8 font-bold border-gray-100"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 border-none rounded-xl px-12 shadow-lg font-bold"
            >
              Cập nhật danh mục
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

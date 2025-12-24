import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Switch,
  Upload,
  message,
  Typography,
  Space,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import categoryService from "../../../services/admin/categoryService";

const { Title } = Typography;

const CategoryAdd: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("sort_order", values.sort_order.toString());
    formData.append("is_active", values.is_active ? "1" : "0");
    formData.append("description", values.description || "");
    if (values.image?.fileList[0]?.originFileObj) {
      formData.append("image", values.image.fileList[0].originFileObj);
    }

    try {
      await categoryService.createCategory(formData);
      message.success("Thêm danh mục thành công rực rỡ!");
      navigate("/admin/categories");
    } catch (error) {
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

  return (
    <Card className="max-w-2xl mx-auto shadow-md rounded-2xl border-t-4 border-green-500">
      <Space className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          shape="circle"
        />
        <Title level={3} className="m-0!">
          THÊM DANH MỤC MỚI
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true, sort_order: 1 }}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Nhập tên danh mục bro ơi!" }]}
        >
          <Input placeholder="Ví dụ: Đồ nội thất" size="large" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Thứ tự ưu tiên"
            name="sort_order"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} className="w-full" size="large" />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={4} placeholder="Mô tả ngắn về danh mục..." />
        </Form.Item>

        <Form.Item label="Ảnh đại diện" name="image">
          <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Chọn ảnh rực rỡ</Button>
          </Upload>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
          block
          size="large"
          className="h-12 rounded-xl bg-blue-600 font-bold mt-4"
        >
          LƯU DANH MỤC
        </Button>
      </Form>
    </Card>
  );
};

export default CategoryAdd;

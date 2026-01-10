import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Upload, message, Divider } from "antd"; // 🛑 Đã thêm Button vào đây
import type { UploadFile } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import adminUserService, { User } from "@/services/admin/userService";

// 🛑 Định nghĩa Interface chặt chẽ để dẹp bỏ any
interface PersonalInfoProps {
  user: User | null;
  onRefresh: () => void;
}

interface AdminFormValues {
  name: string;
  email: string;
  phone?: string;
  avatar?: {
    fileList: UploadFile[];
  };
}

export default function PersonalInfo({ user, onRefresh }: PersonalInfoProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<AdminFormValues>();

  // Đổ dữ liệu cũ vào form cực chuẩn khi user thay đổi
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.profile?.phone || "",
      });
    }
  }, [user, form]);

  const onFinish = async (values: AdminFormValues) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone || "");

      // Xử lý lấy file ảnh từ Upload component
      const fileList = values.avatar?.fileList;
      if (fileList && fileList.length > 0) {
        const file = fileList[0].originFileObj;
        if (file) {
          formData.append("avatar", file as File);
        }
      }

      // 🚀 Gọi Service cập nhật rực rỡ (Service đã có dispatch event userUpdate)
      await adminUserService.updateMyProfile(formData);

      // 1. Thông báo rực rỡ như ý bro
      message.success("Cập nhật hồ sơ Super Admin thành công! 🏆");

      // 2. Load lại dữ liệu tại trang hiện tại (cập nhật ảnh to ở giữa trang)
      onRefresh();

      // 3. Xóa danh sách file đã chọn sau khi lưu thành công
      form.setFieldsValue({ avatar: undefined });
    } catch (error) {
      console.error("Update profile error:", error);
      message.error("Cập nhật thất bại, hãy kiểm tra lại kết nối!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="p-4">
      <Row gutter={24}>
        <Col span={24} className="mb-6">
          <Form.Item
            name="avatar"
            label={<span className="font-bold">Ảnh đại diện mới</span>}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              listType="picture"
              className="upload-list-inline"
            >
              <Button icon={<UploadOutlined />}>
                Chọn ảnh từ máy tính rực rỡ
              </Button>
            </Upload>
          </Form.Item>
          <Divider />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input
              prefix={<UserOutlined />}
              size="large"
              placeholder="Nhập họ và tên"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Email (Tên đăng nhập)" name="email">
            <Input
              prefix={<MailOutlined />}
              size="large"
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-3 mt-8">
        <Button
          onClick={() => onRefresh()}
          size="large"
          className="rounded-lg px-8"
        >
          Hủy bỏ
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          size="large"
          className="bg-emerald-600 border-emerald-600 rounded-lg px-8 shadow-md hover:bg-emerald-700 transition-all"
        >
          Lưu thay đổi
        </Button>
      </div>
    </Form>
  );
}

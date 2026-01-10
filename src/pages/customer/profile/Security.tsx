import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, SaveOutlined } from "@ant-design/icons";
import authService, { ChangePasswordData } from "@/services/authService"; // Import Interface chuẩn

const Security: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<ChangePasswordData>(); // Dập tắt any bằng ChangePasswordData

  // Logic đổi mật khẩu thực tế như Admin
  const onFinish = async (values: ChangePasswordData) => {
    try {
      setLoading(true);

      // Gọi service đổi mật khẩu thực tế
      await authService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      });

      message.success("Cập nhật mật khẩu rực rỡ thành công! 🏆");
      form.resetFields(); // Xóa trắng form sau khi đổi xong
    } catch (error: any) {
      // Bắt lỗi từ Backend trả về (ví dụ: sai mật khẩu cũ)
      const errorMsg =
        error.response?.data?.message || "Cập nhật mật khẩu thất bại!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="current_password" // Đổi tên cho khớp với API
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            className="rounded-xl"
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="new_password" // Đổi tên cho khớp với API
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            className="rounded-xl"
            placeholder="••••••••"
          />
        </Form.Item>

        {/* Thêm trường xác nhận mật khẩu cho chuẩn logic bảo mật */}
        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="new_password_confirmation"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            className="rounded-xl"
            placeholder="••••••••"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          className="w-full h-12 bg-emerald-600 rounded-xl font-bold italic uppercase shadow-lg"
        >
          Cập nhật mật khẩu
        </Button>
      </Form>
    </div>
  );
};

export default Security;

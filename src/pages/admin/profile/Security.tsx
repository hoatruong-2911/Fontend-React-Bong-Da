import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, SaveOutlined } from "@ant-design/icons";
import adminUserService from "@/services/admin/userService";

export default function Security() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await adminUserService.changeMyPassword({
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.confirm_password,
      });
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Mật khẩu cũ không chính xác"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ maxWidth: 500 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="current_password"
          rules={[{ required: true }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="new_password"
          rules={[{ required: true, min: 8 }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm_password"
          dependencies={["new_password"]}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value)
                  return Promise.resolve();
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
          block
          size="large"
        >
          Cập nhật mật khẩu
        </Button>
      </Form>
    </div>
  );
}

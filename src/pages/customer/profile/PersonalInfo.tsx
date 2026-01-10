import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Upload, message, Divider } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import authService, { User } from "@/services/authService";

interface PersonalInfoProps {
  user: User | null;
  onRefresh: () => void;
}

interface FormValues {
  name: string;
  phone?: string;
  address?: string;
  avatar?: any[];
}

export default function PersonalInfo({ user, onRefresh }: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
      });
    }
  }, [user, form]);

  // Inside PersonalInfo.tsx - hàm onFinish
  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");

      // 🛑 Lấy file từ object avatar của Ant Design (Sạch bóng any)
      if (values.avatar && values.avatar.length > 0) {
        const file = values.avatar[0].originFileObj;
        if (file) {
          formData.append("avatar", file);
        }
      }

      const updatedUser = await authService.updateProfile(formData);

      // Cập nhật state local để UI thay đổi rực rỡ
      message.success("Cập nhật cực phẩm thành công!");
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      message.error("Lỗi rồi bro ơi, kiểm tra lại kết nối nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="p-4">
      <Row gutter={24}>
        {isEditing && (
          <Col span={24} className="mb-6">
            <Form.Item
              name="avatar"
              label="Ảnh đại diện"
              valuePropName="fileList"
              getValueFromEvent={(e: any) =>
                Array.isArray(e) ? e : e?.fileList
              }
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh mới rực rỡ</Button>
              </Upload>
            </Form.Item>
            <Divider />
          </Col>
        )}
        <Col xs={24} md={12}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Không được để trống tên" }]}
          >
            <Input
              prefix={<UserOutlined />}
              size="large"
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Địa chỉ" name="address">
            <Input
              prefix={<HomeOutlined />}
              size="large"
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-3 mt-8">
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-emerald-600"
            >
              Lưu thay đổi
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600"
          >
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>
    </Form>
  );
}

import { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Upload, message, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import adminUserService from "@/services/admin/userService";

export default function PersonalInfo({ user, onRefresh }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Đồng bộ dữ liệu từ prop 'user' vào Form khi component load hoặc dữ liệu thay đổi
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.profile?.phone,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Gửi các thông tin văn bản
      formData.append("name", values.name);
      formData.append("phone", values.phone || "");

      // Gửi file ảnh (Lấy từ originFileObj của Ant Design)
      if (values.avatar && values.avatar.length > 0) {
        const fileToUpload = values.avatar[0].originFileObj;
        if (fileToUpload) {
          formData.append("avatar", fileToUpload);
        }
      }

      // Gọi API qua Service (Sử dụng hàm đã viết ở userService)
      const res = await adminUserService.updateMyProfile(formData);

      if (res.success) {
        message.success("Lưu hồ sơ và ảnh đại diện thành công!");
        setIsEditing(false);
        onRefresh(); // Load lại trang để cập nhật ảnh trên Header/Avatar
      }
    } catch (error) {
      message.error("Có lỗi khi upload ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        // Quan trọng: Không để disabled={!isEditing} ở đây vì nó chặn cả nút bấm
        requiredMark={isEditing}
      >
        <Row gutter={24}>
          {isEditing && (
            <Col span={24} className="mb-6">
              <Form.Item
                name="avatar"
                label="Ảnh đại diện mới"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>
                    Chọn ảnh từ máy tính
                  </Button>
                </Upload>
              </Form.Item>
              <Divider />
            </Col>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input
                prefix={<UserOutlined />}
                size="large"
                disabled={!isEditing}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email (Tên đăng nhập)" name="email">
              <Input prefix={<MailOutlined />} size="large" disabled={true} />
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
        </Row>

        <div className="flex justify-end gap-3 mt-8">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>Hủy bỏ</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ backgroundColor: "#62B462", borderColor: "#62B462" }}
              >
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              className="flex items-center"
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}

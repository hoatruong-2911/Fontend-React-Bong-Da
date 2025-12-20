import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Row,
  Col,
  Space,
  Divider,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UserOutlined,
  SafetyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import adminUserService from "@/services/admin/userService";

const { Option } = Select;

export default function AddUser() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Chuyển đổi sang FormData để gửi được File ảnh
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone || "");
      formData.append("role", values.role);
      formData.append("password", values.password);

      // Kiểm tra nếu có chọn ảnh đại diện
      if (values.avatar && values.avatar.length > 0) {
        formData.append("avatar", values.avatar[0].originFileObj);
      }

      const res = await adminUserService.createUser(formData);

      if (res.success) {
        message.success("Thêm tài khoản thành công!");
        navigate("/admin/user");
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <Space>
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <h1 className="text-2xl font-bold m-0 text-gray-800">
              Tạo tài khoản mới
            </h1>
          </Space>
        </header>

        <Card className="shadow-lg border-none" style={{ borderRadius: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <div className="mb-6 text-blue-600 font-semibold flex items-center gap-2 text-lg">
              <UserOutlined /> Thông tin cá nhân & Ảnh
            </div>

            {/* PHẦN THÊM MỚI: UPLOAD ẢNH */}
            <Form.Item
              label="Ảnh đại diện"
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e && e.fileList;
              }}
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false} // Không upload tự động lên server ngay lập tức
              >
                <Button icon={<UploadOutlined />} className="w-full">
                  Chọn ảnh đại diện
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên người dùng" },
              ]}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Nguyễn Văn A"
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Email không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="example@gmail.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input
                    size="large"
                    placeholder="09xx xxx xxx"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider dashed />

            <div className="mb-6 text-orange-600 font-semibold flex items-center gap-2 text-lg">
              <SafetyOutlined /> Bảo mật & Phân quyền
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Vai trò hệ thống"
                  name="role"
                  initialValue="customer"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value="customer">Khách hàng</Option>
                    <Option value="staff">Nhân viên sân</Option>
                    <Option value="admin">Quản trị viên</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mật khẩu khởi tạo"
                  name="password"
                  rules={[
                    {
                      required: true,
                      min: 8,
                      message: "Mật khẩu ít nhất 8 ký tự",
                    },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập mật khẩu"
                    prefix={<LockOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-8">
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                style={{
                  height: 50,
                  borderRadius: 8,
                  backgroundColor: "#62B462",
                  borderColor: "#62B462",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                TẠO TÀI KHOẢN
              </Button>
            </div>
          </Form>
        </Card>

        <p className="text-center mt-6 text-gray-500 italic text-sm">
          * Sau khi tạo, người dùng có thể sử dụng email và mật khẩu này để đăng
          nhập.
        </p>
      </div>
    </div>
  );
}

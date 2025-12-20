import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Spin,
  Upload,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UserOutlined,
  SafetyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import adminUserService from "@/services/admin/userService";

const { Option } = Select;

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await adminUserService.getUserById(Number(id));
        const user = res.data;

        // Lưu lại đường dẫn avatar hiện tại để hiển thị
        if (user.profile?.avatar) {
          setCurrentAvatar(`http://127.0.0.1:8000/${user.profile.avatar}`);
        }

        form.setFieldsValue({
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.profile?.phone,
        });
      } catch (error) {
        message.error("Không tìm thấy thông tin người dùng");
        navigate("/admin/user");
      } finally {
        setFetching(false);
      }
    };
    getUserData();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Laravel Method Spoofing
      formData.append("_method", "PUT");

      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("phone", values.phone || "");

      // Nếu người dùng nhập mật khẩu mới
      if (values.password) {
        formData.append("password", values.password);
      }

      // Xử lý file ảnh mới nếu có
      if (values.avatar && values.avatar.length > 0) {
        formData.append("avatar", values.avatar[0].originFileObj);
      }

      await adminUserService.updateUser(Number(id), formData);
      message.success("Cập nhật tài khoản thành công!");
      navigate("/admin/user");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="p-10 text-center">
        <Spin size="large" />
      </div>
    );

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
              Chỉnh sửa tài khoản
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
              <UserOutlined /> Thông tin cá nhân & Ảnh đại diện
            </div>

            <Row gutter={24} align="middle" className="mb-6">
              <Col span={6} className="text-center">
                <Avatar
                  size={80}
                  src={currentAvatar}
                  icon={<UserOutlined />}
                  className="border-2 border-blue-100"
                />
              </Col>
              <Col span={18}>
                <Form.Item
                  name="avatar"
                  label="Thay đổi ảnh đại diện"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />} block>
                      Chọn ảnh mới
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input
                    size="large"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider dashed />

            <div className="mb-6 text-orange-600 font-semibold flex items-center gap-2 text-lg">
              <SafetyOutlined /> Quyền hạn & Bảo mật
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Vai trò"
                  name="role"
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
                  label="Mật khẩu mới (Để trống nếu không đổi)"
                  name="password"
                  rules={[{ min: 8, message: "Ít nhất 8 ký tự" }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="••••••••"
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
                icon={<SaveOutlined />}
                style={{
                  height: 50,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  backgroundColor: "#1890ff",
                }}
              >
                LƯU THAY ĐỔI
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

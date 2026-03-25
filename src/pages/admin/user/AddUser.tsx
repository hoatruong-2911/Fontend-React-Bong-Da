import React, { useState, useEffect } from "react";
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
  Typography,
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
  TeamOutlined,
} from "@ant-design/icons";
import adminUserService, { StaffSummary } from "@/services/admin/userService";

const { Option } = Select;
const { Text, Title } = Typography; // Đảm bảo định nghĩa rõ ràng ở đây

interface AddUserFormValues {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "customer";
  password: string;
  avatar?: any[];
  staff_id?: number;
}

export default function AddUser() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AddUserFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [staffs, setStaffs] = useState<StaffSummary[]>([]);
  
  // Theo dõi role để hiển thị ô chọn nhân viên
  const role = Form.useWatch("role", form);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await adminUserService.getAvailableStaffs();
        // Lọc những nhân viên chưa có tài khoản
        const available = res.data.filter((s) => !s.user_id);
        setStaffs(available);
      } catch (error) {
        console.error("Lỗi tải danh sách nhân viên");
      }
    };
    fetchStaffs();
  }, []);

  const onFinish = async (values: AddUserFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone || "");
      formData.append("role", values.role);
      formData.append("password", values.password);

      if (values.role === "staff" && values.staff_id) {
        formData.append("staff_id", values.staff_id.toString());
      }

      if (values.avatar && values.avatar.length > 0) {
        formData.append("avatar", values.avatar[0].originFileObj);
      }

      await adminUserService.createUser(formData);
      message.success("Tạo tài khoản Platinum thành công!");
      navigate("/admin/user");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <Space size="middle">
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="shadow-sm"
            />
            <Title level={3} className="!m-0 !font-black !italic uppercase tracking-tight text-slate-800">
              Tạo tài khoản <span className="text-emerald-500">Hệ thống</span>
            </Title>
          </Space>
        </header>

        <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            initialValues={{ role: 'customer' }}
          >
            <div className="mb-6 flex items-center gap-2 text-emerald-600">
              <UserOutlined className="text-xl" />
              <Text className="font-black italic uppercase text-[13px] tracking-widest">Danh tính & Hình ảnh</Text>
            </div>

            <Form.Item
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            >
              <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} className="avatar-uploader">
                <div className="flex flex-col items-center">
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }} className="text-[11px] font-bold uppercase italic">Ảnh hồ sơ</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Họ và tên rực rỡ</Text>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
            >
              <Input size="large" placeholder="Nguyễn Văn Hải" className="rounded-xl h-12 font-bold" />
            </Form.Item>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Địa chỉ Email</Text>}
                  name="email"
                  rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
                >
                  <Input size="large" placeholder="example@gmail.com" prefix={<MailOutlined />} className="rounded-xl h-12" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Số điện thoại</Text>} 
                  name="phone"
                >
                  <Input size="large" placeholder="09xx xxx xxx" prefix={<PhoneOutlined />} className="rounded-xl h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Divider dashed className="border-slate-200" />

            <div className="mb-6 flex items-center gap-2 text-orange-500">
              <SafetyOutlined className="text-xl" />
              <Text className="font-black italic uppercase text-[13px] tracking-widest">Phân quyền & Bảo mật</Text>
            </div>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Vai trò Platinum</Text>}
                  name="role"
                  rules={[{ required: true }]}
                >
                  <Select size="large" className="rounded-xl">
                    <Option value="customer">Khách hàng</Option>
                    <Option value="staff">Nhân viên sân</Option>
                    <Option value="admin">Quản trị viên</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Mật khẩu khởi tạo</Text>}
                  name="password"
                  rules={[{ required: true, min: 8, message: "Mật khẩu ít nhất 8 ký tự" }]}
                >
                  <Input.Password size="large" placeholder="********" prefix={<LockOutlined />} className="rounded-xl h-12" />
                </Form.Item>
              </Col>
            </Row>

            {role === "staff" && (
              <Form.Item
                label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-emerald-600">Liên kết hồ sơ nhân viên</Text>}
                name="staff_id"
                rules={[{ required: true, message: "Cần chọn nhân viên để cấp tài khoản" }]}
                className="animate-in slide-in-from-top-2"
              >
                <Select size="large" placeholder="Chọn nhân viên từ danh sách rực rỡ" className="rounded-xl">
                  {staffs.map((s) => (
                    <Option key={s.id} value={s.id}>{s.name} - {s.position}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              loading={loading}
              icon={<UserAddOutlined />}
              className="mt-8 h-14 bg-emerald-600 rounded-2xl font-black italic uppercase shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-all"
            >
              Kích hoạt tài khoản mới
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
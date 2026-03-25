import React, { useState, useEffect } from "react";
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
  Typography,
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
  TeamOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import adminUserService, { StaffSummary, User } from "@/services/admin/userService";

const { Option } = Select;
const { Text, Title } = Typography;

interface EditUserFormValues {
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  phone?: string;
  password?: string;
  avatar?: any[];
  staff_id?: number;
}

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditUserFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [staffs, setStaffs] = useState<StaffSummary[]>([]);
  
  const role = Form.useWatch("role", form);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [userRes, staffRes] = await Promise.all([
          adminUserService.getUserById(id),
          adminUserService.getAvailableStaffs()
        ]);
        
        const user = userRes.data;
        if (user.profile?.avatar) {
          setCurrentAvatar(`http://127.0.0.1:8000/${user.profile.avatar}`);
        }

        form.setFieldsValue({
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.profile?.phone,
          // Kiểm tra xem user này có đang gắn với staff nào không
          staff_id: staffRes.data.find(s => s.user_id === Number(id))?.id
        });

        // Lọc staff: Chưa có tài khoản HOẶC là người đang sở hữu tài khoản này
        const filtered = staffRes.data.filter(s => !s.user_id || s.user_id === Number(id));
        setStaffs(filtered);
      } catch (error) {
        message.error("Không thể truy xuất dữ liệu Platinum");
        navigate("/admin/user");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, form, navigate]);

  const onFinish = async (values: EditUserFormValues) => {
    if (!id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("phone", values.phone || "");

      if (values.password) formData.append("password", values.password);
      if (values.role === "staff" && values.staff_id) {
        formData.append("staff_id", values.staff_id.toString());
      }

      if (values.avatar && values.avatar.length > 0) {
        formData.append("avatar", values.avatar[0].originFileObj);
      }

      await adminUserService.updateUser(id, formData);
      message.success("Cập nhật hệ thống rực rỡ thành công!");
      navigate("/admin/user");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <Space>
            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Title level={3} className="!m-0 !font-black !italic uppercase text-slate-800">
              Hiệu chỉnh <span className="text-blue-500">Tài khoản</span>
            </Title>
          </Space>
        </header>

        <Card className="rounded-[2rem] border-none shadow-xl">
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <div className="mb-8 flex items-center justify-center">
              <div className="relative group">
                <Avatar size={100} src={currentAvatar} icon={<UserOutlined />} className="border-4 border-white shadow-lg" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Text className="text-white text-[10px] font-black italic uppercase">Cập nhật</Text>
                </div>
              </div>
            </div>

            <Form.Item
              name="avatar"
              label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400 text-center w-full block">Thay đổi ảnh đại diện</Text>}
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            >
              <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                <Button icon={<UploadOutlined />} block className="rounded-xl border-dashed">Tải ảnh rực rỡ lên</Button>
              </Upload>
            </Form.Item>

            <Form.Item label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Họ và tên</Text>} name="name" rules={[{ required: true }]}>
              <Input size="large" className="rounded-xl font-bold h-12" />
            </Form.Item>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Email</Text>} name="email" rules={[{ required: true, type: "email" }]}>
                  <Input size="large" className="rounded-xl h-12" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Số điện thoại</Text>} name="phone">
                  <Input size="large" className="rounded-xl h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Divider dashed />

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Vai trò</Text>} name="role" rules={[{ required: true }]}>
                  <Select size="large" className="rounded-xl">
                    <Option value="customer">Khách hàng</Option>
                    <Option value="staff">Nhân viên sân</Option>
                    <Option value="admin">Quản trị viên</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-slate-400">Mật khẩu mới</Text>} name="password" rules={[{ min: 8, message: "Ít nhất 8 ký tự" }]}>
                  <Input.Password size="large" placeholder="Để trống nếu giữ nguyên" className="rounded-xl h-12" />
                </Form.Item>
              </Col>
            </Row>

            {role === "staff" && (
              <Form.Item
                label={<Text className="font-black italic text-[11px] uppercase tracking-widest text-blue-600">Sở hữu bởi nhân viên</Text>}
                name="staff_id"
                className="animate-in slide-in-from-top-2"
              >
                <Select size="large" placeholder="Chọn nhân viên" className="rounded-xl">
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
              icon={<SaveOutlined />}
              className="mt-8 h-14 bg-blue-600 rounded-2xl font-black italic uppercase shadow-lg shadow-blue-100 hover:scale-[1.02] transition-all"
            >
              Lưu thay đổi Platinum
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
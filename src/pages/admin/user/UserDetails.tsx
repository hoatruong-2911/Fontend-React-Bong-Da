import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Descriptions,
  Button,
  Space,
  Divider,
  Spin,
  message,
  Typography,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import adminUserService, { User } from "@/services/admin/userService";
import { authService } from "@/services";

const { Title, Text } = Typography;

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await adminUserService.getUserById(id!);
        setUser(res.data);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng");
        navigate("/admin/user");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  if (loading)
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        <Text className="mt-4 block text-blue-500 animate-pulse">
          Đang tải hồ sơ rực rỡ...
        </Text>
      </div>
    );

  if (!user) return null;

  const avatarUrl = user.profile?.avatar
    ? `http://127.0.0.1:8000/${user.profile.avatar}`
    : null;

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation & Action */}
        <div className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
          <Space>
            <Button
              className="flex items-center justify-center border-none shadow-md hover:scale-110 transition-transform"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <div>
              <Text className="text-xs uppercase font-bold text-gray-500 block">
                Quản lý hệ thống
              </Text>
              <Title level={4} className="m-0 text-blue-800">
                Chi tiết tài khoản
              </Title>
            </div>
          </Space>

          <Button
            type="primary"
            icon={<EditOutlined />}
            disabled={!isAdmin}
            size="large"
            className="rounded-xl shadow-lg border-none flex items-center"
            style={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
            onClick={() => navigate(`/admin/user/edit/${user.id}`)}
          >
            Chỉnh sửa ngay
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* LEFT COLUMN: Profile Header Card */}
          <Col xs={24} lg={9}>
            <Card
              className="border-none shadow-2xl overflow-hidden"
              style={{ borderRadius: 24 }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Cover Background */}
              <div
                style={{
                  height: 140,
                  background:
                    user.role === "admin"
                      ? "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)"
                      : "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
                }}
              />

              <div className="px-6 pb-8 text-center -mt-16">
                <Badge
                  count={user.is_active ? "Online" : "Offline"}
                  offset={[-15, 105]}
                  color={user.is_active ? "#52c41a" : "#f5222d"}
                >
                  <Avatar
                    size={140}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    className="border-4 border-white shadow-xl mb-4 bg-white"
                  />
                </Badge>

                <Title
                  level={3}
                  className="mb-1 text-gray-800 uppercase tracking-wide"
                >
                  {user.name}
                </Title>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Tag
                    color={user.role === "admin" ? "volcano" : "blue"}
                    className="px-4 py-1 rounded-full font-bold border-none shadow-sm"
                  >
                    {user.role === "admin"
                      ? "SYSTEM ADMIN"
                      : user.role === "staff"
                      ? "STAFF MEMBER"
                      : "CUSTOMER"}
                  </Tag>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MailOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <Text className="text-gray-400 text-xs block">
                        Địa chỉ Email
                      </Text>
                      <Text className="font-semibold break-all">
                        {user.email}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <PhoneOutlined className="text-green-600" />
                    </div>
                    <div>
                      <Text className="text-gray-400 text-xs block">
                        Số điện thoại
                      </Text>
                      <Text className="font-semibold">
                        {user.profile?.phone || "N/A"}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CalendarOutlined className="text-purple-600" />
                    </div>
                    <div>
                      <Text className="text-gray-400 text-xs block">
                        Ngày gia nhập
                      </Text>
                      <Text className="font-semibold">
                        {new Date(user.created_at).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT COLUMN: Statistics & Full Details */}
          <Col xs={24} lg={15}>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card
                  className="border-none shadow-xl"
                  style={{ borderRadius: 24 }}
                  title={
                    <Space>
                      <IdcardOutlined className="text-blue-500" />{" "}
                      <span className="text-lg">Thông tin định danh</span>
                    </Space>
                  }
                >
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    className="custom-descriptions"
                  >
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <IdcardOutlined /> ID
                        </Text>
                      }
                    >
                      <Badge status="processing" text={user.id} />
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <UserOutlined /> Tên đầy đủ
                        </Text>
                      }
                    >
                      {user.name}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <MailOutlined /> Email
                        </Text>
                      }
                    >
                      {user.email}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <PhoneOutlined /> Liên hệ
                        </Text>
                      }
                    >
                      {user.profile?.phone || "Chưa cập nhật"}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <EnvironmentOutlined /> Địa chỉ
                        </Text>
                      }
                      span={2}
                    >
                      <span className="text-gray-600">
                        {user.profile?.address ||
                          "Hệ thống chưa ghi nhận địa chỉ cụ thể"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Text strong>
                          <SafetyCertificateOutlined /> Trạng thái
                        </Text>
                      }
                    >
                      <Badge
                        status={user.is_active ? "success" : "error"}
                        text={user.is_active ? "Hoạt động" : "Bị khóa"}
                        className="font-bold"
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  className="border-none shadow-xl bg-white/80"
                  style={{ borderRadius: 24 }}
                  title={
                    <Space>
                      <HistoryOutlined className="text-orange-500" />{" "}
                      <span className="text-lg">Dấu chân hệ thống</span>
                    </Space>
                  }
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                      <Text
                        type="secondary"
                        className="text-xs uppercase font-bold block mb-2"
                      >
                        Đăng ký vào lúc
                      </Text>
                      <Title level={5} className="m-0 text-gray-700">
                        {new Date(user.created_at).toLocaleString("vi-VN")}
                      </Title>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                      <Text
                        type="secondary"
                        className="text-xs uppercase font-bold block mb-2"
                      >
                        Cập nhật cuối cùng
                      </Text>
                      <Title level={5} className="m-0 text-gray-700">
                        {new Date(
                          user.updated_at || user.created_at
                        ).toLocaleString("vi-VN")}
                      </Title>
                    </div>
                  </div>

                  <Divider dashed />

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <Text italic className="text-amber-700">
                      * Thông tin tài khoản này mang tính bảo mật cao. Mọi hành
                      động truy xuất dữ liệu cá nhân đều được ghi lại trong nhật
                      ký (Logs) của Quản trị viên.
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-descriptions .ant-descriptions-item-label {
          color: #8c8c8c;
          font-weight: 500;
        }
        .custom-descriptions .ant-descriptions-item-content {
          color: #262626;
          font-weight: 600;
        }
        .ant-card-title {
          font-weight: 700 !important;
          color: #1f1f1f !important;
        }
      `}</style>
    </div>
  );
}

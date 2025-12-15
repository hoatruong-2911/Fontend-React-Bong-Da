import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Tabs,
  Table,
  Tag,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import authService, {
  User,
  UpdateUserData,
} from "../../../services/authService";

const { Title, Text } = Typography;

// Form type
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Extended user
interface ExtendedUser extends User {
  totalOrders?: number;
  totalSpent?: number;
}

// Initial user
const initialUser: ExtendedUser = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  role: "customer",
  created_at: "",
  totalOrders: 0,
  totalSpent: 0,
};

// Mock data order history
const mockOrders = [
  {
    id: "ORD001",
    date: "28/05/2025",
    total: 350000,
    status: "completed",
    items: 3,
  },
  {
    id: "ORD002",
    date: "25/05/2025",
    total: 520000,
    status: "completed",
    items: 5,
  },
  {
    id: "ORD003",
    date: "20/05/2025",
    total: 180000,
    status: "completed",
    items: 2,
  },
  {
    id: "ORD004",
    date: "15/05/2025",
    total: 750000,
    status: "cancelled",
    items: 4,
  },
];

export default function CustomerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<ExtendedUser>(initialUser);

  const [form] = Form.useForm<ProfileFormData>();

  // Load profile when mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const userResponse: ExtendedUser = await authService.getCurrentUser();

        // Fix phone trả từ profile
        const phone = userResponse.phone || userResponse.profile?.phone || "";

        setCurrentUser({ ...userResponse, phone });

        form.setFieldsValue({
          name: userResponse.name,
          email: userResponse.email,
          phone,
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        message.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  // Save profile (PUT)
  const handleSave = async (values: ProfileFormData) => {
    try {
      setLoading(true);

      const nameParts = values.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const apiData: UpdateUserData = {
        first_name: firstName,
        last_name: lastName,
        phone: values.phone,
      };

      const updatedUser: ExtendedUser = await authService.updateProfile(
        apiData
      );

      setCurrentUser(updatedUser);
      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      const errorMessage =
        error.response?.data?.errors?.phone?.[0] ||
        error.response?.data?.message ||
        "Cập nhật thất bại.";

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    { title: "Ngày đặt", dataIndex: "date", key: "date" },
    { title: "Số SP", dataIndex: "items", key: "items" },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `${total.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "red"}>
          {status === "completed" ? "Hoàn thành" : "Đã hủy"}
        </Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: "info",
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: (
        <Card className="border-0 shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            disabled={!isEditing}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} size="large" disabled />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input prefix={<PhoneOutlined />} size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Địa chỉ" name="address">
                  <Input prefix={<HomeOutlined />} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-4">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Lưu thay đổi
                  </Button>
                </>
              ) : (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </Form>
        </Card>
      ),
    },

    {
      key: "orders",
      label: <span>🧾 Lịch sử đơn hàng</span>,
      children: (
        <Card className="border-0 shadow-sm">
          <Table
            columns={orderColumns}
            dataSource={mockOrders}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-md">
          {loading ? (
            <div className="text-center py-8">
              <Spin tip="Đang tải hồ sơ..." />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar
                src={currentUser.avatar}
                size={120}
                icon={<UserOutlined />}
              />

              <div className="text-center md:text-left flex-1">
                <Title level={2} className="!mb-1">
                  {currentUser.name}
                </Title>

                <Text className="text-muted-foreground">
                  {currentUser.email}
                </Text>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {currentUser.totalOrders || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Đơn hàng
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {(currentUser.totalSpent || 0).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tổng chi tiêu
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {currentUser.created_at
                        ? new Date(currentUser.created_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Thành viên từ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {!loading && <Tabs items={tabItems} size="large" />}
      </div>
    </div>
  );
}

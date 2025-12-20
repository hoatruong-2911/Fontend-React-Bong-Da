import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Input,
  Select,
  message,
  Avatar,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  LockOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
  PlusOutlined,
  UnlockOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import adminUserService, { User } from "@/services/admin/userService";
import { authService } from "@/services";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserService.getUsers();
      setUsers(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await adminUserService.toggleStatus(id);
      if (res.success) {
        message.success(res.message);
        fetchUsers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await adminUserService.deleteUser(id);
      if (res.success) {
        message.success(res.message);
        fetchUsers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa tài khoản thất bại");
    }
  };

  const userStats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      staffs: users.filter((u) => u.role === "staff").length,
      customers: users.filter((u) => u.role === "customer").length,
    }),
    [users]
  );

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_: any, record: User) => {
        // Đường dẫn ảnh từ server (Thay đổi URL nếu domain backend của bạn khác)
        const avatarUrl = record.profile?.avatar
          ? `http://127.0.0.1:8000/${record.profile.avatar}`
          : null;

        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={avatarUrl}
              alt={record.name}
              icon={!avatarUrl && <UserOutlined />}
              className={
                !avatarUrl
                  ? record.role === "admin"
                    ? "bg-red-500"
                    : "bg-blue-500"
                  : ""
              }
              size={40}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{record.name}</span>
                {!record.is_active && (
                  <Tag color="error" style={{ fontSize: "10px" }}>
                    ĐÃ KHÓA
                  </Tag>
                )}
              </div>
              <div className="text-xs text-gray-500">{record.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleMap: Record<string, { color: string; text: string }> = {
          admin: { color: "volcano", text: "QUẢN TRỊ" },
          staff: { color: "blue", text: "NHÂN VIÊN" },
          customer: { color: "green", text: "KHÁCH HÀNG" },
        };
        const config = roleMap[role] || { color: "default", text: role };
        return (
          <Tag
            color={config.color}
            className="font-semibold px-3 py-0.5 rounded-full"
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tham gia",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/user/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa hồ sơ">
            <Button
              icon={<EditOutlined />}
              disabled={!isAdmin}
              size="small"
              type="primary"
              ghost
              onClick={() => navigate(`/admin/user/edit/${record.id}`)}
            />
          </Tooltip>

          {record.role !== "admin" && (
            <Popconfirm
              title={
                record.is_active
                  ? "Khóa tài khoản này? Người dùng sẽ không thể đăng nhập."
                  : "Mở khóa tài khoản này?"
              }
              disabled={!isAdmin}
              onConfirm={() => handleToggleStatus(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ danger: !!record.is_active }}
            >
              <Tooltip title={record.is_active ? "Khóa tài khoản" : "Mở khóa"}>
                <Button
                  icon={
                    record.is_active ? <LockOutlined /> : <UnlockOutlined />
                  }
                  disabled={!isAdmin}
                  size="small"
                  danger={!!record.is_active}
                  type={record.is_active ? "default" : "primary"}
                />
              </Tooltip>
            </Popconfirm>
          )}

          {record.id !== 1 && record.id !== (authService as any)?.user?.id && (
            <Popconfirm
              disabled={!isAdmin}
              title="Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này?"
              description="Hành động này không thể hoàn tác và sẽ xóa mọi dữ liệu liên quan."
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Xóa ngay"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa vĩnh viễn">
                <Button
                  icon={<DeleteOutlined />}
                  disabled={!isAdmin}
                  size="small"
                  danger
                  type="text"
                  className="hover:bg-red-50"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            className="shadow-sm border-none hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Tổng tài khoản"
              value={userStats.total}
              prefix={<TeamOutlined className="mr-2" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            className="shadow-sm border-none bg-red-50/50 hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Quản trị viên"
              value={userStats.admins}
              prefix={
                <SafetyCertificateOutlined className="mr-2 text-red-500" />
              }
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            className="shadow-sm border-none bg-blue-50/50 hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Nhân viên"
              value={userStats.staffs}
              valueStyle={{ color: "#096dd9" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            className="shadow-sm border-none bg-green-50/50 hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Khách hàng"
              value={userStats.customers}
              valueStyle={{ color: "#389e0d" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-md" style={{ borderRadius: 12 }}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm tên hoặc email..."
              prefix={<SearchOutlined />}
              className="w-80 shadow-sm"
              size="large"
              style={{ borderRadius: 8 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-48 shadow-sm"
              size="large"
              style={{ borderRadius: 8 }}
            >
              <Select.Option value="all">Tất cả vai trò</Select.Option>
              <Select.Option value="admin">Quản trị viên</Select.Option>
              <Select.Option value="staff">Nhân viên</Select.Option>
              <Select.Option value="customer">Khách hàng</Select.Option>
            </Select>
          </Space>

          <Space>
            <Button
              icon={<ExportOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
              className="hover:text-blue-500 hover:border-blue-500"
            >
              Xuất dữ liệu
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!isAdmin}
              onClick={() => navigate("/admin/user/add")}
              style={{
                borderRadius: 8,
                backgroundColor: "#62B462",
                borderColor: "#62B462",
                height: "40px",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Thêm tài khoản
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
          }}
          className="user-table ant-table-striped"
        />
      </Card>
    </div>
  );
}

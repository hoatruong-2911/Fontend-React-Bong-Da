import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import adminBookingService, { Booking } from "@/services/admin/bookingService";
import { authService } from "@/services";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Cập nhật Tag Trạng thái khớp với ENUM Database
const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string; icon: any }> =
    {
      pending: {
        color: "gold",
        text: "Chờ duyệt",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "blue",
        text: "Đã duyệt",
        icon: <CheckCircleOutlined />,
      },
      playing: {
        color: "green",
        text: "Đang đá",
        icon: <PlayCircleOutlined />,
      },
      completed: {
        color: "cyan",
        text: "Hoàn thành",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "volcano",
        text: "Từ chối",
        icon: <CloseCircleOutlined />,
      },
      cancelled: { color: "default", text: "Đã hủy", icon: <StopOutlined /> },
    };
  const config = statusMap[status] || {
    color: "default",
    text: status,
    icon: null,
  };
  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text.toUpperCase()}
    </Tag>
  );
};

export default function BookingsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminBookingService.getBookings();
      const result = response.data?.data || response.data || [];
      setBookings(result);
    } catch (error) {
      message.error("Không thể tải danh sách đặt sân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      playing: bookings.filter((b) => b.status === "playing").length,
    }),
    [bookings]
  );

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminBookingService.updateStatus(id, status);
      message.success(`Đã chuyển trạng thái thành ${status}`);
      fetchBookings();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: Booking) => (
        <div>
          <div className="font-bold text-gray-800">{record.customer_name}</div>
          <div className="text-xs text-gray-500">{record.customer_phone}</div>
        </div>
      ),
    },
    {
      title: "Sân bóng",
      key: "fieldName",
      render: (_: any, record: Booking) =>
        record.field?.name || `Sân #${record.field_id}`,
    },
    {
      title: "Lịch đặt",
      key: "schedule",
      render: (_: any, record: Booking) => (
        <div>
          <div>{record.booking_date}</div>
          <div className="text-xs text-blue-600 font-medium">
            {record.start_time.substring(0, 5)} -{" "}
            {record.end_time.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (value: number) => (
        <span className="text-green-600 font-bold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác nhanh",
      key: "actions",
      render: (_: any, record: Booking) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/bookings/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              disabled={!isAdmin}
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => navigate(`/admin/bookings/edit/${record.id}`)}
            />
          </Tooltip>

          {/* Nút thao tác theo quy trình */}
          {record.status === "pending" && (
            <>
              <Button
                disabled={!isAdmin}
                size="small"
                type="primary"
                className="bg-blue-600"
                onClick={() => handleUpdateStatus(record.id, "approved")}
              >
                Duyệt
              </Button>
              <Button
                disabled={!isAdmin}
                size="small"
                danger
                onClick={() => handleUpdateStatus(record.id, "rejected")}
              >
                Từ chối
              </Button>
            </>
          )}

          {record.status === "approved" && (
            <Button
              disabled={!isAdmin}
              size="small"
              className="bg-green-600 text-white border-green-600"
              onClick={() => handleUpdateStatus(record.id, "playing")}
            >
              Bắt đầu đá
            </Button>
          )}

          {record.status === "playing" && (
            <Button
              disabled={!isAdmin}
              size="small"
              type="primary"
              ghost
              onClick={() => handleUpdateStatus(record.id, "completed")}
            >
              Xong & Thu tiền
            </Button>
          )}

          {/* Nút Hủy cho các đơn chưa hoàn thành */}
          {!["completed", "cancelled", "rejected"].includes(record.status) && (
            <Popconfirm
              title="Hủy đơn đặt này?"
              onConfirm={() => handleUpdateStatus(record.id, "cancelled")}
            >
              <Button
                disabled={!isAdmin}
                size="small"
                icon={<CloseCircleOutlined />}
                danger
                ghost
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchSearch =
      booking.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.id.toString().includes(searchText);
    const matchStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng đơn"
              value={stats.total}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" bordered={false} className="shadow-sm">
            <Statistic
              title="Đang chờ"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" bordered={false} className="shadow-sm">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" bordered={false} className="shadow-sm">
            <Statistic
              title="Đang đá"
              value={stats.playing}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-md" style={{ borderRadius: 12 }}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm mã đơn, tên khách..."
              prefix={<SearchOutlined />}
              className="w-80"
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48"
              size="large"
              style={{ borderRadius: 8 }}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="approved">Đã duyệt</Select.Option>
              <Select.Option value="playing">Đang đá</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button
              icon={<ExportOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/admin/bookings/add")}
              style={{
                borderRadius: 8,
                backgroundColor: "#62B462",
                borderColor: "#62B462",
              }}
            >
              Tạo đặt sân
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredBookings}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng cộng ${total} lượt đặt`,
          }}
          className="booking-table"
        />
      </Card>
    </div>
  );
}

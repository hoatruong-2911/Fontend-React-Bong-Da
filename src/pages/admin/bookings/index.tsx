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
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExportOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

// IMPORT SERVICE
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: "gold", text: "Chờ xác nhận" },
    confirmed: { color: "blue", text: "Đã xác nhận" },
    playing: { color: "green", text: "Đang chơi" },
    completed: { color: "default", text: "Hoàn thành" },
    cancelled: { color: "red", text: "Đã hủy" },
  };
  const { color, text } = statusMap[status] || {
    color: "default",
    text: status,
  };
  return <Tag color={color}>{text}</Tag>;
};

export default function BookingsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Lấy dữ liệu từ API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminBookingService.getBookings();
      // Laravel trả về { success: true, data: { data: [...] } } nếu dùng paginate
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

  // 2. Tính toán thống kê từ dữ liệu thực tế
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminBookingService.updateStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      fetchBookings();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const columns = [
    { title: "Mã", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Khách hàng",
      key: "customer",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Booking) => (
        <div>
          <div className="font-medium">{record.customer_name}</div>
          <div className="text-xs text-muted-foreground">
            {record.customer_phone}
          </div>
        </div>
      ),
    },
    {
      title: "Sân",
      key: "fieldName",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Booking) =>
        record.field?.name || `Sân #${record.field_id}`,
    },
    { title: "Ngày", dataIndex: "booking_date", key: "booking_date" },
    {
      title: "Giờ",
      key: "timeSlot",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Booking) =>
        `${record.start_time} - ${record.end_time}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (value: number) => <strong>{formatCurrency(value)}</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/bookings/${record.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => navigate(`/admin/bookings/edit/${record.id}`)}
          />
          {record.status === "pending" && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, "confirmed")}
            >
              Xác nhận
            </Button>
          )}
          {record.status === "confirmed" && (
            <Button
              size="small"
              type="primary"
              className="bg-green-600 hover:bg-green-500"
              onClick={() => handleUpdateStatus(record.id, "playing")}
            >
              Bắt đầu
            </Button>
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
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng đặt"
              value={stats.total}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="bg-amber-50">
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="bg-blue-50">
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="bg-green-50">
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <Input
              placeholder="Tìm tên hoặc mã..."
              prefix={<SearchOutlined />}
              className="w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="pending">Chờ xác nhận</Select.Option>
              <Select.Option value="confirmed">Đã xác nhận</Select.Option>
              <Select.Option value="playing">Đang chơi</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/bookings/add")}
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
        />
      </Card>
    </div>
  );
}

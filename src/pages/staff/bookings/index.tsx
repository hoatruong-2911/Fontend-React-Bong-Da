import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Typography,
  Modal,
  message,
} from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { mockBookings, Booking } from "@/data/mockBookings";

const { Title, Text } = Typography;

export default function StaffBookings() {
  const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed');
  const playingBookings = mockBookings.filter(b => b.status === 'playing');
  const pendingBookings = mockBookings.filter(b => b.status === 'pending');

  // Bắt đầu sân từ booking đã duyệt
  const handleStartBooking = (booking: Booking) => {
    Modal.confirm({
      title: "Xác nhận bắt đầu sân",
      content: (
        <div className="space-y-2">
          <p><strong>Khách hàng:</strong> {booking.customerName}</p>
          <p><strong>Sân:</strong> {booking.fieldName}</p>
          <p><strong>Khung giờ đặt:</strong> {booking.timeSlot}</p>
          <p><strong>Số điện thoại:</strong> {booking.customerPhone}</p>
        </div>
      ),
      okText: "Bắt đầu sân",
      cancelText: "Hủy",
      onOk() {
        message.success(`Đã bắt đầu sân cho khách ${booking.customerName}`);
      },
    });
  };

  // Kết thúc booking đang chơi
  const handleEndBooking = (booking: Booking) => {
    Modal.confirm({
      title: "Kết thúc & Thanh toán",
      content: (
        <div className="space-y-2">
          <p><strong>Khách hàng:</strong> {booking.customerName}</p>
          <p><strong>Sân:</strong> {booking.fieldName}</p>
          <p><strong>Thời lượng:</strong> {booking.duration} giờ</p>
          <p className="text-lg font-semibold text-emerald-600 mt-3">
            <strong>Tổng tiền:</strong> {booking.totalAmount.toLocaleString()}đ
          </p>
        </div>
      ),
      okText: "Xác nhận thanh toán",
      cancelText: "Hủy",
      onOk() {
        message.success("Đã hoàn thành và thanh toán thành công!");
      },
    });
  };

  const bookingColumns = [
    {
      title: "Mã đặt",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => <span className="font-mono font-medium">{id}</span>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: unknown, record: Booking) => (
        <div>
          <div className="font-medium">{record.customerName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <PhoneOutlined /> {record.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: "Sân",
      dataIndex: "fieldName",
      key: "fieldName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-emerald-600" />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Ngày / Giờ",
      key: "datetime",
      render: (_: unknown, record: Booking) => (
        <div>
          <div className="font-medium">{dayjs(record.date).format("DD/MM/YYYY")}</div>
          <div className="text-sm text-muted-foreground">{record.timeSlot}</div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-semibold text-emerald-600">{amount.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          pending: { color: "warning", text: "Chờ duyệt" },
          confirmed: { color: "processing", text: "Đã duyệt - Chờ nhận sân" },
          playing: { color: "success", text: "Đang chơi" },
          completed: { color: "default", text: "Hoàn thành" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        return <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      render: (_: unknown, record: Booking) => (
        <Space>
          {record.status === "confirmed" && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartBooking(record)}
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
            >
              Bắt đầu sân
            </Button>
          )}
          {record.status === "playing" && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleEndBooking(record)}
            >
              Kết thúc
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <Title level={4} className="!mb-1">Danh sách đặt sân từ khách hàng</Title>
          <Text type="secondary">Các booking đã được Admin duyệt, chờ nhân viên xác nhận và bắt đầu sân</Text>
        </div>
      </div>

      {/* Thống kê booking */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small" className="text-center bg-orange-50 dark:bg-orange-900/20 border-orange-200">
            <Statistic
              title="Chờ duyệt"
              value={pendingBookings.length}
              valueStyle={{ color: "#f97316" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <Statistic
              title="Đã duyệt - Chờ sân"
              value={confirmedBookings.length}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20 border-green-200">
            <Statistic
              title="Đang chơi"
              value={playingBookings.length}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" className="text-center bg-gray-50 dark:bg-gray-900/20">
            <Statistic
              title="Tổng hôm nay"
              value={mockBookings.filter(b => b.date === '2024-01-15').length}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng booking chờ xử lý */}
      <Card title={<span className="flex items-center gap-2"><CheckCircleOutlined className="text-emerald-600" /> Booking đã duyệt - Sẵn sàng bắt đầu</span>}>
        <Table
          columns={bookingColumns}
          dataSource={confirmedBookings}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "Không có booking nào đang chờ" }}
        />
      </Card>

      {/* Bảng sân đang chơi */}
      <Card title={<span className="flex items-center gap-2"><PlayCircleOutlined className="text-green-600" /> Sân đang hoạt động</span>}>
        <Table
          columns={bookingColumns}
          dataSource={playingBookings}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "Không có sân nào đang hoạt động" }}
        />
      </Card>
    </div>
  );
}
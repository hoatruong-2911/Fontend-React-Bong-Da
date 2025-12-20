import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Row,
  Col,
  message,
  Spin,
  Steps,
  Divider,
  Result,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminBookingService, { Booking } from "@/services/admin/bookingService";
import { Space } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await adminBookingService.getBookingById(id);
        if (response.success) {
          setBooking(response.data);
        }
      }
    } catch (error) {
      message.error("Không thể tải chi tiết lượt đặt sân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setBtnLoading(true);
      if (id) {
        await adminBookingService.updateBookingStatus(id, newStatus);
        message.success(`Đã chuyển trạng thái đơn hàng sang: ${newStatus}`);
        fetchDetail(); // Tải lại dữ liệu
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Spin size="large" tip="Đang lấy dữ liệu..." /></div>;

  if (!booking) return <Result status="404" title="Không tìm thấy đơn hàng" extra={<Button onClick={() => navigate("/admin/bookings")}>Quay lại</Button>} />;

  // Tính toán các mốc trạng thái cho Steps
  const getStepCurrent = (status: string) => {
    const map: any = { pending: 0, confirmed: 1, playing: 2, completed: 3, cancelled: -1 };
    return map[status];
  };

  return (
    <div className="p-6">
      <header className="mb-6 flex justify-between items-center">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/bookings")} />
          <h1 className="text-2xl font-bold m-0">Chi tiết đặt sân #{booking.id}</h1>
        </Space>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In hóa đơn</Button>
          
          {booking.status === "pending" && (
            <Button type="primary" onClick={() => handleUpdateStatus("confirmed")} loading={btnLoading}>
              Xác nhận đơn
            </Button>
          )}

          {booking.status === "confirmed" && (
            <Button type="primary" className="bg-green-600 border-green-600" onClick={() => handleUpdateStatus("playing")} loading={btnLoading}>
              Bắt đầu đá
            </Button>
          )}

          {booking.status === "playing" && (
            <Button type="primary" onClick={() => handleUpdateStatus("completed")} loading={btnLoading}>
              Hoàn thành & Thanh toán
            </Button>
          )}

          {["pending", "confirmed"].includes(booking.status) && (
            <Popconfirm title="Bạn có chắc chắn muốn hủy đơn này?" onConfirm={() => handleUpdateStatus("cancelled")} okText="Hủy đơn" cancelText="Quay lại" okButtonProps={{ danger: true }}>
              <Button danger icon={<CloseCircleOutlined />}>Hủy lượt đặt</Button>
            </Popconfirm>
          )}
        </Space>
      </header>

      {/* Tiến trình đơn hàng */}
      {booking.status !== "cancelled" && (
        <Card className="mb-6 shadow-sm">
          <Steps
            current={getStepCurrent(booking.status)}
            items={[
              { title: 'Chờ xác nhận' },
              { title: 'Đã xác nhận' },
              { title: 'Đang chơi' },
              { title: 'Hoàn thành' },
            ]}
          />
        </Card>
      )}

      <Row gutter={24}>
        {/* Thông tin khách hàng & Sân */}
        <Col xs={24} lg={16}>
          <Card title={<Space><UserOutlined /> Thông tin đặt sân</Space>} className="shadow-sm mb-6">
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Khách hàng" span={2}>
                <span className="font-bold text-lg">{booking.customer_name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{booking.customer_phone}</Descriptions.Item>
              <Descriptions.Item label="Sân bóng">{booking.field?.name}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(booking.booking_date).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                <Tag color="blue" icon={<ClockCircleOutlined />}>
                  {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                {booking.status === "completed" ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>
                ) : booking.status === "cancelled" ? (
                  <Tag color="error" icon={<CloseCircleOutlined />}>Đã hủy</Tag>
                ) : (
                  <Tag color="processing">{booking.status.toUpperCase()}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {booking.notes || <span className="italic text-gray-400">Không có ghi chú</span>}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Thanh toán */}
        <Col xs={24} lg={8}>
          <Card title={<Space><DollarOutlined /> Chi tiết thanh toán</Space>} className="shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Đơn giá:</span>
                <span>{formatCurrency(booking.total_amount / (booking.duration / 60))}/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thời lượng:</span>
                <span>{booking.duration} phút</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">TỔNG CỘNG:</span>
                <span className="text-2xl font-black text-green-600">
                  {formatCurrency(booking.total_amount)}
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-blue-700 text-xs m-0 italic">
                  * Vui lòng kiểm tra lại tiền nước và dịch vụ đi kèm khi khách thanh toán tại quầy.
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
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
  Typography,
  Space,
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
  ShoppingOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
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
        fetchDetail();
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
        <Text className="mt-4 text-blue-500 animate-pulse">
          Đang truy xuất hóa đơn rực rỡ...
        </Text>
      </div>
    );

  if (!booking)
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        extra={
          <Button onClick={() => navigate("/admin/bookings")}>Quay lại</Button>
        }
      />
    );

  const getStepCurrent = (status: string) => {
    const map: any = {
      pending: 0,
      confirmed: 1,
      playing: 2,
      completed: 3,
      cancelled: -1,
    };
    return map[status];
  };

  const statusColors: any = {
    pending: "gold",
    confirmed: "blue",
    playing: "green",
    completed: "cyan",
    cancelled: "error",
  };

  return (
    <div
      className="p-4 md:p-8 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Rực Rỡ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
          <Space direction="vertical" size={0}>
            <Space className="mb-2">
              <Button
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/bookings")}
                className="shadow-md hover:scale-110 transition-transform"
              />
              <Tag
                color={statusColors[booking.status]}
                className="font-bold uppercase rounded-full px-3"
              >
                {booking.status}
              </Tag>
            </Space>
            <Title level={2} className="m-0 text-gray-800">
              Mã đặt sân <span className="text-blue-600">#{booking.id}</span>
            </Title>
          </Space>

          <Space className="mt-4 md:mt-0 flex-wrap">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="rounded-xl border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              In hóa đơn
            </Button>

            {booking.status === "pending" && (
              <Button
                type="primary"
                size="large"
                className="rounded-xl shadow-lg bg-blue-600"
                onClick={() => handleUpdateStatus("confirmed")}
                loading={btnLoading}
                icon={<CheckCircleOutlined />}
              >
                Xác nhận ngay
              </Button>
            )}

            {booking.status === "confirmed" && (
              <Button
                type="primary"
                size="large"
                className="rounded-xl shadow-lg bg-green-500 border-none"
                onClick={() => handleUpdateStatus("playing")}
                loading={btnLoading}
                icon={<RocketOutlined />}
              >
                Bắt đầu đá
              </Button>
            )}

            {booking.status === "playing" && (
              <Button
                type="primary"
                size="large"
                className="rounded-xl shadow-lg bg-cyan-600"
                onClick={() => handleUpdateStatus("completed")}
                loading={btnLoading}
                icon={<WalletOutlined />}
              >
                Hoàn thành & Thanh toán
              </Button>
            )}

            {["pending", "confirmed"].includes(booking.status) && (
              <Popconfirm
                title="Xác nhận hủy đơn này?"
                onConfirm={() => handleUpdateStatus("cancelled")}
                okText="Hủy đơn"
                cancelText="Quay lại"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  type="text"
                  className="hover:bg-red-50 rounded-xl"
                  icon={<CloseCircleOutlined />}
                >
                  Hủy lượt
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        {/* Tiến trình đơn hàng */}
        {booking.status !== "cancelled" && (
          <Card
            className="mb-8 border-none shadow-xl"
            style={{ borderRadius: 24 }}
          >
            <Steps
              current={getStepCurrent(booking.status)}
              items={[
                { title: "Chờ xác nhận", icon: <ClockCircleOutlined /> },
                { title: "Đã xác nhận", icon: <CheckCircleOutlined /> },
                { title: "Đang chơi", icon: <RocketOutlined /> },
                { title: "Hoàn thành", icon: <WalletOutlined /> },
              ]}
              className="px-4"
            />
          </Card>
        )}

        <Row gutter={[24, 24]}>
          {/* Thông tin chính */}
          <Col xs={24} lg={15}>
            <Card
              title={
                <Space>
                  <InfoCircleOutlined className="text-blue-500" />{" "}
                  <span className="text-lg font-bold">
                    Chi tiết khách hàng & Sân bóng
                  </span>
                </Space>
              }
              className="border-none shadow-xl mb-6 overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              <Descriptions bordered column={1} className="custom-booking-desc">
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined /> Khách hàng
                    </Space>
                  }
                >
                  <Text strong className="text-lg text-blue-700">
                    {booking.customer_name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <ClockCircleOutlined /> Liên hệ
                    </Space>
                  }
                >
                  {booking.customer_phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <ShoppingOutlined /> Tên sân
                    </Space>
                  }
                >
                  <Text strong>{booking.field?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined /> Lịch thi đấu
                    </Space>
                  }
                >
                  <div className="flex flex-col">
                    <Text strong>
                      {dayjs(booking.booking_date).format("dddd, DD/MM/YYYY")}
                    </Text>
                    <Space className="mt-2">
                      <Tag
                        color="blue"
                        className="text-lg px-4 py-1 rounded-lg"
                      >
                        {booking.start_time.substring(0, 5)} -{" "}
                        {booking.end_time.substring(0, 5)}
                      </Tag>
                      <Text type="secondary">({booking.duration} phút)</Text>
                    </Space>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <InfoCircleOutlined /> Ghi chú khách
                    </Space>
                  }
                >
                  {booking.notes || (
                    <Text italic className="text-gray-400">
                      Không có yêu cầu đặc biệt
                    </Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thanh toán & Hóa đơn */}
          <Col xs={24} lg={9}>
            <Card
              className="border-none shadow-2xl bg-white relative overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              {/* Trang trí góc hóa đơn */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarOutlined style={{ fontSize: 100 }} />
              </div>

              <div className="p-2">
                <Title level={4} className="flex items-center gap-2 mb-6">
                  <WalletOutlined className="text-green-600" /> Tóm tắt thanh
                  toán
                </Title>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <Text type="secondary">Đơn giá sân:</Text>
                    <Text strong>
                      {formatCurrency(
                        booking.total_amount / (booking.duration / 60)
                      )}
                      /giờ
                    </Text>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <Text type="secondary">Tổng thời gian:</Text>
                    <Text strong>{booking.duration / 60} giờ</Text>
                  </div>

                  <Divider className="my-4" />

                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center">
                    <Text
                      type="secondary"
                      className="uppercase text-xs font-black block mb-1"
                    >
                      Tổng cộng cần thu
                    </Text>
                    <Title level={2} className="m-0 text-green-600 font-black">
                      {formatCurrency(booking.total_amount)}
                    </Title>
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <InfoCircleOutlined className="text-amber-600 mt-1" />
                    <Text italic className="text-amber-800 text-xs">
                      Vui lòng yêu cầu khách hàng thanh toán đầy đủ trước khi
                      rời sân. Nhắc khách kiểm tra lại đồ đạc cá nhân.
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-booking-desc .ant-descriptions-item-label {
          width: 150px;
          background: #f1f5f9 !important;
          color: #475569 !important;
          font-weight: 600 !important;
        }
        .ant-steps-item-title {
          font-weight: 700 !important;
        }
        .ant-card-title {
          padding-top: 15px !important;
        }
      `}</style>
    </div>
  );
}

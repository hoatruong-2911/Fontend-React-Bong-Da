import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, Button, Tag, Descriptions, Row, Col, message, 
  Spin, Steps, Divider, Result, Typography, Space 
} from "antd";
import { 
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  PrinterOutlined, UserOutlined, CalendarOutlined, 
  ClockCircleOutlined, InfoCircleOutlined, WalletOutlined, 
  RocketOutlined, PhoneOutlined, CarryOutOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>(); // Sạch any: định nghĩa kiểu cho params
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // FIX LỖI GẠCH VÀNG: Dùng useCallback để hàm không bị tạo lại gây lặp useEffect
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await adminBookingService.getBookingById(id);
        
        // FIX LỖI GẠCH ĐỎ: Bóc tách trực tiếp vì Interface đã chuẩn
        if (response.success && response.data) {
          console.log(">>> [LOG UI] Dữ liệu nạp thành công:", response.data);
          setBooking(response.data);
        } else {
          console.error(">>> [LOG UI] Backend trả về thành công nhưng thiếu data quan hệ");
        }
      }
    } catch (error: unknown) { // Sạch any: dùng unknown cho error
      console.error(">>> [LOG UI] Lỗi fetchDetail:", error);
      message.error("Không thể tải chi tiết lượt đặt sân");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    fetchDetail(); 
  }, [fetchDetail]); // Dependencies đã đầy đủ theo cảnh báo

  const getStepStatus = (status: string): number => {
    const map: Record<string, number> = { pending: 0, approved: 1, playing: 2, completed: 3, cancelled: -1 };
    return map[status] ?? 0;
  };

  const statusConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
    pending: { color: "gold", icon: <ClockCircleOutlined />, label: "Chờ duyệt" },
    approved: { color: "blue", icon: <CheckCircleOutlined />, label: "Đã duyệt" },
    playing: { color: "green", icon: <RocketOutlined />, label: "Đang đá" },
    completed: { color: "cyan", icon: <CarryOutOutlined />, label: "Hoàn thành" },
    cancelled: { color: "error", icon: <CloseCircleOutlined />, label: "Đã hủy" },
  };

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#f0f2f5]"><Spin size="large" tip="Đang truy xuất dữ liệu rực rỡ..." /></div>;
  if (!booking) return <Result status="404" title="Không tìm thấy đơn hàng" />;

  const config = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-white">
          <Space size="middle">
            <Button shape="circle" size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/bookings")} />
            <div>
              <Title level={2} className="!m-0 !font-black !italic !uppercase !text-slate-800">
                Hóa đơn <span className="text-emerald-600">#{booking.id}</span>
              </Title>
              <Text type="secondary" className="font-medium uppercase tracking-widest text-[10px]">Stadium POS System</Text>
            </div>
          </Space>
          <Tag color={config.color} icon={config.icon} className="font-bold uppercase px-6 py-1 rounded-full text-sm border-none shadow-sm">
            {config.label}
          </Tag>
        </div>

        {/* Steps Section */}
        {booking.status !== "cancelled" && (
          <Card className="mb-8 border-none shadow-sm rounded-[32px]">
            <Steps
              current={getStepStatus(booking.status)}
              className="px-4 py-2"
              items={[
                { title: "Chờ duyệt" }, { title: "Đã duyệt" }, { title: "Đang đá" }, { title: "Hoàn thành" }
              ]}
            />
          </Card>
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <Card 
              title={<Space><InfoCircleOutlined className="text-emerald-500" /> <span className="font-black italic uppercase text-slate-700">Thông tin chi tiết</span></Space>} 
              className="shadow-sm rounded-[32px] border-none"
            >
              <Descriptions bordered column={1} className="custom-booking-desc rounded-2xl overflow-hidden">
                <Descriptions.Item label={<Space><UserOutlined /> Khách hàng</Space>}>
                  <Text strong className="text-blue-700 uppercase">{booking.customer_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><PhoneOutlined /> Liên hệ</Space>}>
                  <Text strong>{booking.customer_phone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><RocketOutlined /> Tên sân</Space>}>
                  <Text strong className="text-emerald-600 uppercase italic font-black">
                    {booking.field?.name || "LỖI: FIELD BỊ NULL TỪ BACKEND"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Lịch thi đấu</Space>}>
                  <div className="flex flex-col gap-2">
                    <Text strong className="text-lg">
                      {dayjs(booking.booking_date).format("dddd, DD/MM/YYYY")}
                    </Text>
                    <Space>
                      {booking.start_time ? (
                        <Tag color="blue" className="text-lg px-6 font-black rounded-xl border-none bg-blue-50 text-blue-600">
                          {booking.start_time.substring(0, 5)} - {booking.end_time?.substring(0, 5)}
                        </Tag>
                      ) : <Tag color="error">Thiếu giờ</Tag>}
                      <Text className="font-bold text-slate-500 text-xs">{booking.duration} phút</Text>
                    </Space>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><InfoCircleOutlined /> Ghi chú</Space>}>
                  <div className="italic text-slate-500">{booking.notes || "Không có yêu cầu đặc biệt"}</div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="shadow-xl rounded-[32px] border-none" title={<Space><WalletOutlined className="text-emerald-500" /> <span className="font-black italic uppercase text-slate-700">Thanh toán</span></Space>}>
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-[24px]">
                  <Text className="font-bold text-slate-400 uppercase text-[10px]">Đơn giá sân</Text>
                  <Text strong>{formatCurrency(booking.total_amount / (booking.duration / 60 || 1))} /h</Text>
                </div>
                <Divider className="!m-0" />
                <div className="bg-emerald-600 p-8 rounded-[32px] text-center shadow-lg">
                  <Text className="uppercase text-xs font-black text-emerald-100 block mb-2">Tổng tiền thanh toán</Text>
                  <Title level={1} className="!m-0 !text-white !font-black !italic">{formatCurrency(booking.total_amount)}</Title>
                </div>
                <Button block size="large" icon={<PrinterOutlined />} onClick={() => window.print()} className="rounded-2xl h-14 font-bold uppercase italic">In hóa đơn ngay</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <style>{`
        .custom-booking-desc .ant-descriptions-item-label { width: 160px; background: #f8fafc !important; color: #64748b !important; font-weight: 900 !important; text-transform: uppercase !important; font-style: italic !important; font-size: 10px !important; }
        .custom-booking-desc .ant-descriptions-item-content { background: #ffffff !important; padding: 20px !important; }
      `}</style>
    </div>
  );
}
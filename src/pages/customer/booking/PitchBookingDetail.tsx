import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Tag, Typography, Button, Descriptions, Divider,
  Space, message, Spin, Result, Popconfirm, Steps, Row, Col
} from "antd";
import {
  ArrowLeftOutlined, PrinterOutlined, CalendarOutlined,
  ClockCircleOutlined, CloseCircleOutlined, InfoCircleOutlined,
  WalletOutlined, RocketOutlined, PhoneOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
// Sử dụng chung service của Admin để lấy đầy đủ thông tin field
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
};

export default function PitchBookingDetail() {
  const { id } = useParams<{ id: string }>(); // Sạch any: định nghĩa kiểu tham số
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await adminBookingService.getBookingById(id);
        // Bóc vỏ dữ liệu chuẩn xác
        if (response.success && response.data) {
          setBooking(response.data);
        }
      }
    } catch (error: unknown) {
      console.error(">>> [LOG UI] Lỗi fetchDetail:", error);
      message.error("Không thể tải chi tiết lượt đặt sân");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const getStepCurrent = (status: string): number => {
    const map: Record<string, number> = { 
      pending: 0, approved: 1, confirmed: 1, playing: 2, completed: 3, cancelled: -1 
    };
    return map[status] ?? 0;
  };

  const statusConfig: Record<string, { color: string; label: string; icon: JSX.Element }> = {
    pending: { color: "gold", label: "Chờ duyệt", icon: <ClockCircleOutlined /> },
    approved: { color: "blue", label: "Đã duyệt", icon: <CalendarOutlined /> },
    confirmed: { color: "blue", label: "Đã duyệt", icon: <CalendarOutlined /> },
    playing: { color: "green", label: "Đang chơi", icon: <RocketOutlined /> },
    completed: { color: "cyan", label: "Hoàn thành", icon: <WalletOutlined /> },
    cancelled: { color: "error", label: "Đã hủy", icon: <CloseCircleOutlined /> },
  };

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#f8fafc]"><Spin size="large" tip="Đang truy xuất hóa đơn rực rỡ..." /></div>;
  if (!booking) return <Result status="404" title="Không tìm thấy đơn hàng" />;

  const config = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        {/* Header rực rỡ như admin */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-white">
          <Space size="middle">
            <Button 
              shape="circle" 
              size="large"
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)} 
              className="hover:scale-110 transition-transform"
            />
            <div>
              <Title level={2} className="!m-0 !font-black !italic !uppercase !text-slate-800">
                Chi tiết <span className="text-blue-600">#{booking.id}</span>
              </Title>
              <Text type="secondary" className="font-medium uppercase tracking-widest text-[10px]">Lịch sử đặt sân cá nhân</Text>
            </div>
          </Space>
          <div className="mt-4 md:mt-0">
            <Tag color={config.color} icon={config.icon} className="font-bold uppercase px-6 py-1 rounded-full text-sm border-none shadow-sm">
              {config.label}
            </Tag>
          </div>
        </div>

        {/* Thanh trạng thái rực rỡ */}
        {booking.status !== "cancelled" && (
          <Card className="mb-8 border-none shadow-sm rounded-[32px] overflow-hidden">
            <Steps
              current={getStepCurrent(booking.status)}
              className="px-4 py-2"
              items={[
                { title: "Chờ duyệt" },
                { title: "Đã duyệt" },
                { title: "Đang chơi" },
                { title: "Hoàn thành" },
              ]}
            />
          </Card>
        )}

        <Row gutter={[24, 24]}>
          {/* Thông tin chi tiết */}
          <Col xs={24} lg={15}>
            <Card 
              title={<Space><InfoCircleOutlined className="text-blue-500" /> <span className="font-black italic uppercase text-slate-700">Thông tin lượt đặt</span></Space>} 
              className="shadow-sm rounded-[32px] border-none overflow-hidden"
            >
              <Descriptions bordered column={1} className="custom-booking-desc rounded-2xl overflow-hidden">
                <Descriptions.Item label={<Space><PhoneOutlined /> Khách hàng</Space>}>
                  <div className="flex flex-col">
                    <Text strong className="text-blue-700 uppercase text-lg">{booking.customer_name}</Text>
                    <Text type="secondary">{booking.customer_phone}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><RocketOutlined /> Sân bóng</Space>}>
                  <Text strong className="text-emerald-600 uppercase italic font-black text-lg">
                    {booking.field?.name || "Đang nạp tên sân..."}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Lịch thi đấu</Space>}>
                  <div className="flex flex-col gap-2">
                    <Text strong className="text-slate-700 text-lg">
                      {dayjs(booking.booking_date).format("dddd, DD/MM/YYYY")}
                    </Text>
                    <Space>
                      <Tag color="blue" className="text-lg px-6 font-black rounded-xl border-none bg-blue-50 text-blue-600">
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                      </Tag>
                      <Text className="font-bold text-slate-400">({booking.duration} phút)</Text>
                    </Space>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><InfoCircleOutlined /> Ghi chú của bạn</Space>}>
                  <div className="p-3 bg-slate-50 rounded-xl italic text-slate-500 border border-dashed border-slate-200">
                    {booking.notes || "Bạn không có yêu cầu đặc biệt nào cho lượt đặt này."}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thanh toán & Thao tác */}
          <Col xs={24} lg={9}>
            <Card 
              className="shadow-xl rounded-[32px] border-none bg-white relative overflow-hidden"
              title={<Space><WalletOutlined className="text-emerald-500" /> <span className="font-black italic uppercase text-slate-700">Hóa đơn dự kiến</span></Space>}
            >
              <div className="space-y-6 relative z-10">
                <div className="bg-emerald-600 p-8 rounded-[32px] text-center shadow-lg shadow-emerald-100">
                  <Text className="uppercase text-xs font-black text-emerald-100 block mb-2 tracking-widest">Tổng tiền cần thanh toán</Text>
                  <Title level={1} className="!m-0 !text-white !font-black !italic tracking-tight">
                    {formatCurrency(booking.total_amount)}
                  </Title>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="flex justify-between mb-2">
                    <Text type="secondary">Đơn giá sân:</Text>
                    <Text strong>{formatCurrency(booking.total_amount / (booking.duration / 60 || 1))} /h</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Thời gian đá:</Text>
                    <Text strong>{(booking.duration / 60).toFixed(1)} giờ</Text>
                  </div>
                </div>

                <Space direction="vertical" className="w-full" size="middle">
                  <Button 
                    block 
                    size="large" 
                    icon={<PrinterOutlined />} 
                    onClick={() => window.print()}
                    className="rounded-2xl h-14 font-bold uppercase italic border-2"
                  >
                    In hóa đơn
                  </Button>

                  {/* Nút hủy: Chỉ cho phép hủy khi đang chờ duyệt */}
                  {booking.status === "pending" && (
                    <Popconfirm
                      title="Xác nhận hủy lượt đặt?"
                      description="Bạn sẽ không thể hoàn tác sau khi hủy đơn này."
                      onConfirm={async () => {
                        await adminBookingService.updateStatus(booking.id, "cancelled");
                        message.success("Đã gửi yêu cầu hủy đơn thành công!");
                        fetchDetail();
                      }}
                      okText="Đúng, hủy nó"
                      cancelText="Quay lại"
                      okButtonProps={{ danger: true }}
                    >
                      <Button 
                        block 
                        danger 
                        type="text"
                        icon={<CloseCircleOutlined />}
                        className="h-12 font-bold uppercase"
                      >
                        Hủy lượt đặt sân
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-booking-desc .ant-descriptions-item-label {
          width: 150px;
          background: #f8fafc !important;
          color: #64748b !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-style: italic !important;
          font-size: 10px !important;
        }
        .ant-steps-item-title {
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-style: italic !important;
          font-size: 11px !important;
        }
        @media print {
          button, .ant-steps, .bg-[#f8fafc] { display: none !important; }
          .max-w-6xl { width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
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
  InfoCircleOutlined,
  WalletOutlined,
  RocketOutlined,
  PhoneOutlined,
  CarryOutOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// 🚀 BỔ SUNG: Hàm lấy Tag trạng thái tiền cọc đồng bộ hệ thống Admin
const getPaymentStatusDetailTag = (
  paymentStatus: string,
  depositAmount: number,
) => {
  const status = (paymentStatus || "").toLowerCase();
  if (depositAmount <= 0 && status === "paid") {
    return (
      <Tag color="blue" className="font-bold px-3 py-0.5 rounded-md">
        KHÔNG CẦN CỌC
      </Tag>
    );
  }
  if (status === "fully_paid" || status === "paid") {
    return (
      <Tag
        color="green"
        icon={<CheckCircleOutlined />}
        className="font-bold px-3 py-0.5 rounded-md"
      >
        ĐÃ THANH TOÁN ĐỦ (100%)
      </Tag>
    );
  }
  if (status === "partial_paid") {
    return (
      <Tag
        color="emerald"
        icon={<DollarCircleOutlined />}
        className="font-bold px-3 py-0.5 rounded-md"
      >
        ĐÃ CỌC GIỮ CHỖ (30%)
      </Tag>
    );
  }
  return (
    <Tag
      color="red"
      icon={<ClockCircleOutlined />}
      className="font-bold px-3 py-0.5 rounded-md"
    >
      CHƯA ĐÓNG TIỀN CỌC
    </Tag>
  );
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await adminBookingService.getBookingById(id);
        if (response.success && response.data) {
          console.log(
            ">>> [LOG UI] Dữ liệu nạp chi tiết thành công:",
            response.data,
          );
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

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const getStepStatus = (status: string): number => {
    const map: Record<string, number> = {
      pending: 0,
      approved: 1,
      playing: 2,
      completed: 3,
      cancelled: -1,
    };
    return map[status] ?? 0;
  };

  const statusConfig: Record<
    string,
    { color: string; icon: JSX.Element; label: string }
  > = {
    pending: {
      color: "gold",
      icon: <ClockCircleOutlined />,
      label: "Chờ duyệt",
    },
    approved: {
      color: "blue",
      icon: <CheckCircleOutlined />,
      label: "Đã duyệt",
    },
    playing: { color: "green", icon: <RocketOutlined />, label: "Đang đá" },
    completed: {
      color: "cyan",
      icon: <CarryOutOutlined />,
      label: "Hoàn thành",
    },
    cancelled: {
      color: "error",
      icon: <CloseCircleOutlined />,
      label: "Đã hủy",
    },
    rejected: {
      color: "volcano",
      icon: <CloseCircleOutlined />,
      label: "Từ chối",
    },
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center bg-[#f0f2f5]">
        <Spin size="large" tip="Đang truy xuất dữ liệu rực rỡ..." />
      </div>
    );
  if (!booking)
    return <Result status="404" title="Không tìm thấy đơn đặt sân" />;

  const config = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-white gap-4">
          <Space size="middle">
            <Button
              shape="circle"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/bookings")}
            />
            <div>
              <Title
                level={2}
                className="!m-0 !font-black !italic !uppercase !text-slate-800"
              >
                Đơn đặt sân{" "}
                <span className="text-emerald-600">#{booking.id}</span>
              </Title>
              <Text
                type="secondary"
                className="font-medium uppercase tracking-widest text-[10px]"
              >
                Wesport Management System
              </Text>
            </div>
          </Space>
          <Tag
            color={config.color}
            icon={config.icon}
            className="font-bold uppercase 'text-xs' px-6 py-1 rounded-full border-none shadow-sm text-center"
          >
            {config.label}
          </Tag>
        </div>

        {/* Steps Section */}
        {!["cancelled", "rejected"].includes(booking.status) && (
          <Card className="mb-8 border-none shadow-sm rounded-[32px]">
            <Steps
              current={getStepStatus(booking.status)}
              className="px-4 py-2"
              items={[
                { title: "Chờ duyệt" },
                { title: "Đã duyệt" },
                { title: "Đang đá" },
                { title: "Hoàn thành" },
              ]}
            />
          </Card>
        )}

        <Row gutter={[24, 24]}>
          {/* CỘT TRÁI: KHỐI THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={15}>
            <Card
              title={
                <Space>
                  <InfoCircleOutlined className="text-emerald-500" />{" "}
                  <span className="font-black italic uppercase text-slate-700">
                    Thông tin chi tiết
                  </span>
                </Space>
              }
              className="shadow-sm rounded-[32px] border-none"
            >
              <Descriptions
                bordered
                column={1}
                className="custom-booking-desc rounded-2xl overflow-hidden"
              >
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined /> Khách hàng
                    </Space>
                  }
                >
                  <Text strong className="text-blue-700 uppercase">
                    {booking.customer_name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <PhoneOutlined /> Liên hệ
                    </Space>
                  }
                >
                  <Text strong>{booking.customer_phone}</Text>
                </Descriptions.Item>

                {/* 🚀 HIỂN THỊ MÃ CHUỖI ĐỊNH KỲ NẾU CÓ */}
                {booking.recurring_group_id && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <CarryOutOutlined /> Loại đặt lịch
                      </Space>
                    }
                  >
                    <Tag
                      color="purple"
                      className="font-black uppercase italic border-none bg-purple-50 text-purple-600 px-3 py-0.5"
                    >
                      ⛓️ Đặt chuỗi cố định: {booking.recurring_group_id}
                    </Tag>
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label={
                    <Space>
                      <RocketOutlined /> Tên sân
                    </Space>
                  }
                >
                  <Text
                    strong
                    className="text-emerald-600 uppercase italic font-black"
                  >
                    {booking.field?.name || `Sân bóng #${booking.field_id}`}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined /> Lịch thi đấu
                    </Space>
                  }
                >
                  <div className="flex flex-col gap-2">
                    <Text strong className="text-base text-slate-700">
                      {dayjs(booking.booking_date).format(
                        "dddd, Ngày DD/MM/YYYY",
                      )}
                    </Text>
                    <Space>
                      {booking.start_time ? (
                        <Tag
                          color="blue"
                          className="text-sm px-4 font-black rounded-xl border-none bg-blue-50 text-blue-600 py-0.5"
                        >
                          {booking.start_time.substring(0, 5)} -{" "}
                          {booking.end_time?.substring(0, 5)}
                        </Tag>
                      ) : (
                        <Tag color="error">Thiếu giờ</Tag>
                      )}
                      <Text className="font-black text-slate-400 text-xs">
                        ⏱️ {booking.duration} phút
                      </Text>
                    </Space>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <InfoCircleOutlined /> Ghi chú
                    </Space>
                  }
                >
                  <div className="italic text-slate-500 font-medium">
                    {booking.notes || "Không có yêu cầu đặc biệt từ khách."}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* CỘT PHẢI: KHỐI DÒNG TIỀN & BIÊN LAI CỌC */}
          <Col xs={24} lg={9}>
            <Card
              className="shadow-sm rounded-[32px] border-none"
              title={
                <Space>
                  <WalletOutlined className="text-emerald-500" />{" "}
                  <span className="font-black italic uppercase text-slate-700">
                    Theo dõi dòng tiền
                  </span>
                </Space>
              }
            >
              <div className="space-y-5">
                {/* 🚀 HIỂN THỊ MINH BẠCH TRẠNG THÁI TIỀN CỌC 30% */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5">
                  <div className="flex flex-col gap-1">
                    <Text className="font-black text-slate-400 uppercase text-[9px] tracking-wider">
                      Trạng thái thanh toán cọc
                    </Text>
                    <div>
                      {getPaymentStatusDetailTag(
                        booking.payment_status || "unpaid",
                        booking.deposit_amount || 0,
                      )}
                    </div>
                  </div>
                  {booking.deposit_amount && booking.deposit_amount > 0 ? (
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-dashed">
                      <span className="text-slate-500 font-medium">
                        Hạn mức cọc (30%):
                      </span>
                      <span className="font-black text-red-500">
                        {formatCurrency(booking.deposit_amount)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <Divider className="!m-0 border-slate-100" />

                {/* KHỐI TỔNG TIỀN SÂN */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-[24px] text-center shadow-md">
                  <Text className="uppercase text-[10px] font-black text-emerald-100 block mb-1 tracking-widest">
                    Tổng giá trị đơn đặt
                  </Text>
                  <Title
                    level={2}
                    className="!m-0 !text-white !font-black !italic tracking-tight"
                  >
                    {formatCurrency(booking.total_amount)}
                  </Title>
                </div>

                <Button
                  block
                  size="large"
                  type="primary"
                  ghost
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  className="rounded-xl h-12 font-black uppercase italic border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 transition-all"
                >
                  In biên lai hóa đơn
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <style>{`
        .custom-booking-desc .ant-descriptions-item-label { width: 150px; background: #f8fafc !important; color: #64748b !important; font-weight: 900 !important; text-transform: uppercase !important; font-style: italic !important; font-size: 10px !important; }
        .custom-booking-desc .ant-descriptions-item-content { background: #ffffff !important; padding: 16px !important; font-weight: 600; color: #334155; }
      `}</style>
    </div>
  );
}

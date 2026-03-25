import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Modal,
  message,
  Badge,
  Tag,
  Row,
  Col,
  Statistic,
  notification,
  Popconfirm,
} from "antd";
import {
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import staffBookingService, {
  Booking,
} from "@/services/staff/staffBookingService";

const { Title, Text } = Typography;

interface BackendError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- COMPONENT ĐẾM NGƯỢC ---
const CountdownTimer = ({
  booking,
  onTimeUp,
}: {
  booking: Booking;
  onTimeUp: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isOver, setIsOver] = useState<boolean>(false);

  useEffect(() => {
    const durationMinutes = dayjs(`2000-01-01 ${booking.end_time}`).diff(
      dayjs(`2000-01-01 ${booking.start_time}`),
      "minute",
    );

    const startTimeReal = dayjs(booking.updated_at);
    const deadline = startTimeReal.add(durationMinutes, "minute");

    const tick = () => {
      const now = dayjs();
      const diffSeconds = deadline.diff(now, "second");

      if (diffSeconds <= 0) {
        setTimeLeft("00:00:00");
        if (!isOver) {
          setIsOver(true);
          onTimeUp();
        }
      } else {
        const h = Math.floor(diffSeconds / 3600);
        const m = Math.floor((diffSeconds % 3600) / 60);
        const s = diffSeconds % 60;
        setTimeLeft(
          `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
        );
        setIsOver(false);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [
    booking.updated_at,
    booking.start_time,
    booking.end_time,
    onTimeUp,
    isOver,
  ]);

  return (
    <div
      className={`font-mono font-black italic text-lg ${isOver ? "text-red-500 animate-pulse" : "text-emerald-600"}`}
    >
      {isOver ? (
        <Badge
          status="error"
          text="HẾT GIỜ"
          className="font-black italic text-red-500"
        />
      ) : (
        timeLeft
      )}
    </div>
  );
};

export default function StaffBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await staffBookingService.getBookings();
      const rawData = res.data;
      if (Array.isArray(rawData)) {
        setBookings(rawData);
      } else if (rawData && typeof rawData === "object" && "data" in rawData) {
        setBookings(rawData.data as Booking[]);
      } else {
        setBookings([]);
      }
    } catch (err) {
      message.error("Lỗi nạp năng lượng hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    return {
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      playing: bookings.filter((b) => b.status === "playing").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      today: bookings.filter((b) => b.booking_date === today).length,
    };
  }, [bookings]);

  // Danh sách phân luồng
  const pendingList = useMemo(
    () => bookings.filter((b) => b.status === "pending"),
    [bookings],
  );
  const approvedList = useMemo(
    () => bookings.filter((b) => b.status === "approved"),
    [bookings],
  );
  const playingList = useMemo(
    () => bookings.filter((b) => b.status === "playing"),
    [bookings],
  );

  const handleUpdateStatus = async (
    id: number,
    status: string,
    msg: string,
  ) => {
    try {
      await staffBookingService.updateStatus(id, status as any);
      message.success(msg);
      fetchBookings();
    } catch (e) {
      const err = e as BackendError;
      message.error(err.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleStartBooking = (booking: Booking) => {
    const now = dayjs();
    const bookingDate = dayjs(booking.booking_date);
    if (!bookingDate.isSame(now, "day")) {
      message.error(
        `Đơn đặt ngày ${bookingDate.format("DD/MM/YYYY")}. Không phải hôm nay!`,
      );
      return;
    }

    Modal.confirm({
      title: "XÁC NHẬN BẮT ĐẦU SÂN",
      content: `Kích hoạt sân cho khách ${booking.customer_name}?`,
      okText: "BẮT ĐẦU",
      onOk: () =>
        handleUpdateStatus(booking.id, "playing", "Sân đã bắt đầu đá!"),
    });
  };

  // ✅ FIX LỖI NaNđ: Sử dụng đúng thuộc tính total_amount (hoặc total_price tùy DB)
  const handleEndBooking = (booking: Booking) => {
    const durationMinutes = dayjs(`2000-01-01 ${booking.end_time}`).diff(
      dayjs(`2000-01-01 ${booking.start_time}`),
      "minute",
    );
    const deadline = dayjs(booking.updated_at).add(durationMinutes, "minute");
    const isEarly = dayjs().isBefore(deadline);

    // ✅ Ép kiểu hoặc fallback để lấy giá tiền chính xác nhất
    const priceToDisplay =
      (booking as any).total_amount || booking.total_price || 0;

    Modal.confirm({
      title: isEarly ? "⚠️ CẢNH BÁO: CHƯA HẾT GIỜ!" : "THANH TOÁN HÓA ĐƠN",
      icon: (
        <ExclamationCircleOutlined
          style={{ color: isEarly ? "#faad14" : "#1890ff" }}
        />
      ),
      content: (
        <div className="mt-4 space-y-4">
          {isEarly && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-center">
              <Text className="text-orange-600 font-black italic uppercase text-[10px]">
                ⚠️ Sân vẫn đang trong ca đá!
              </Text>
            </div>
          )}
          <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center shadow-lg">
            <Text className="text-[10px] text-white/80 uppercase font-black">
              Số tiền cần thu
            </Text>
            <div className="text-2xl font-black italic">
              {Number(priceToDisplay).toLocaleString()}đ
            </div>
          </div>
        </div>
      ),
      okText: isEarly ? "VẪN THANH TOÁN" : "XÁC NHẬN THU TIỀN",
      onOk: () =>
        handleUpdateStatus(
          booking.id,
          "completed",
          "Đã hoàn thành và thu tiền!",
        ),
    });
  };

  const columns = [
    {
      title: (
        <span className="font-black text-[10px] text-slate-400 italic">
          KHÁCH HÀNG & SÂN
        </span>
      ),
      render: (r: Booking) => (
        <div className="space-y-1">
          <div className="font-black italic uppercase text-slate-700 leading-none">
            {r.customer_name}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase italic">
            <EnvironmentOutlined /> {r.field?.name || r.field_name || "N/A"}
          </div>
          <div className="text-[9px] text-slate-400 font-bold">
            {r.customer_phone}
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] text-slate-400 italic">
          THỜI LƯỢNG CA
        </span>
      ),
      render: (r: Booking) => (
        <div className="space-y-1">
          <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md w-fit flex items-center gap-1 font-black text-[11px] italic uppercase border border-blue-100">
            <CalendarOutlined /> {dayjs(r.booking_date).format("DD/MM/YYYY")}
          </div>
          <div className="text-xs font-bold text-slate-500 pl-1">
            {r.start_time.substring(0, 5)} - {r.end_time.substring(0, 5)}
            <Tag className="ml-2 border-none bg-emerald-50 text-emerald-600 font-black italic text-[10px]">
              {dayjs(`2000-01-01 ${r.end_time}`).diff(
                dayjs(`2000-01-01 ${r.start_time}`),
                "minute",
              )}{" "}
              PHÚT
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] text-slate-400 italic uppercase">
          Đồng hồ
        </span>
      ),
      key: "countdown",
      render: (r: Booking) =>
        r.status === "playing" ? (
          <CountdownTimer
            booking={r}
            onTimeUp={() => {
              notification.warning({
                message: "HẾT GIỜ ĐÁ!",
                description: `Sân ${r.field?.name || r.field_name} đã hết giờ.`,
                duration: 0,
                placement: "topRight",
              });
            }}
          />
        ) : (
          <Text
            type="secondary"
            className="italic font-bold opacity-30 text-xs"
          >
            Đợi lệnh...
          </Text>
        ),
    },
    {
      title: (
        <span className="font-black text-[10px] text-slate-400 italic uppercase text-center block">
          Thao tác
        </span>
      ),
      align: "center" as const,
      render: (r: Booking) => (
        <Space size="small">
          {/* ✅ NÚT DUYỆT ĐƠN CHO STAFF */}
          {r.status === "pending" && (
            <Button
              type="primary"
              className="bg-orange-500 border-orange-500 text-[10px] font-black uppercase italic"
              onClick={() =>
                handleUpdateStatus(r.id, "approved", "Đã duyệt đơn thành công!")
              }
            >
              Duyệt đơn
            </Button>
          )}

          {(r.status === "approved" || r.status === "playing") && (
            <Button
              type="primary"
              danger={r.status === "playing"}
              className={`rounded-lg font-black italic uppercase text-[10px] h-9 px-4 ${r.status === "approved" ? "bg-emerald-600 border-emerald-600" : ""} shadow-lg`}
              onClick={() =>
                r.status === "playing"
                  ? handleEndBooking(r)
                  : handleStartBooking(r)
              }
            >
              {r.status === "playing" ? "Kết thúc" : "Bắt đầu"}
            </Button>
          )}

          <Popconfirm
            title="Hủy đơn?"
            onConfirm={() =>
              handleUpdateStatus(r.id, "cancelled", "Đã hủy đơn!")
            }
            okText="Hủy"
            cancelText="Lại"
          >
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              className="hover:bg-red-50 rounded-lg"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Title
          level={2}
          className="!font-black italic uppercase tracking-tighter !m-0"
        >
          Staff <span className="text-emerald-500">Dashboard</span>
        </Title>
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={fetchBookings}
          className="rounded-xl font-bold italic h-10 border-slate-200"
        >
          LÀM MỚI
        </Button>
      </div>

      <Row gutter={[12, 12]}>
        {[
          {
            label: "Chờ duyệt",
            val: stats.pending,
            color: "#f97316",
            icon: <ClockCircleOutlined />,
          },
          {
            label: "Sẵn sàng",
            val: stats.approved,
            color: "#3b82f6",
            icon: <CheckCircleOutlined />,
          },
          {
            label: "Đang đá",
            val: stats.playing,
            color: "#10b981",
            icon: <PlayCircleOutlined />,
          },
          {
            label: "Hoàn thành",
            val: stats.completed,
            color: "#22c55e",
            icon: <CheckOutlined />,
          },
          {
            label: "Đã hủy",
            val: stats.cancelled,
            color: "#ef4444",
            icon: <CloseCircleOutlined />,
          },
          {
            label: "Hôm nay",
            val: stats.today,
            color: "#64748b",
            icon: <ReloadOutlined />,
          },
        ].map((item, i) => (
          <Col xs={12} sm={8} md={4} key={i}>
            <Card
              variant="borderless"
              className="shadow-sm rounded-2xl bg-white/50 backdrop-blur h-full"
            >
              <Statistic
                title={
                  <span className="font-black italic uppercase text-[9px] text-slate-400 tracking-widest">
                    {item.label}
                  </span>
                }
                value={item.val}
                prefix={item.icon}
                styles={{
                  content: {
                    color: item.color,
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "18px",
                  },
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <span className="font-black italic uppercase text-emerald-600 tracking-widest text-xs flex items-center gap-2">
            <PlayCircleOutlined /> Sân đang đá (Real-time)
          </span>
        }
        className="rounded-[2rem] shadow-xl border-none overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={playingList}
          pagination={false}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Card
        title={
          <span className="font-black italic uppercase text-blue-600 tracking-widest text-xs flex items-center gap-2">
            <CheckCircleOutlined /> Danh sách sẵn sàng & chờ duyệt
          </span>
        }
        className="rounded-[2rem] shadow-md border-none opacity-90 overflow-hidden"
      >
        {/* Kết hợp cả Approved và Pending cho Staff dễ quản lý */}
        <Table
          columns={columns.filter((c) => c.key !== "countdown")}
          dataSource={[...pendingList, ...approvedList]}
          pagination={false}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}

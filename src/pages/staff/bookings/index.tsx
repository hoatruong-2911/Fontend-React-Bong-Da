import { useState, useEffect, useMemo, useRef } from "react";
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

// 🚀 BỔ SUNG ĐÚNG VỊ TRÍ NÀY: Hàm render màu sắc Tag dòng tiền quầy chuẩn chỉ
const getPaymentStatusTag = (paymentStatus: string, depositAmount: number) => {
  const status = (paymentStatus || "").toLowerCase().trim();

  // 1. Kiểm tra trạng thái ĐÃ THANH TOÁN ĐỦ (fully_paid hoặc paid)
  if (
    status.includes("fully") ||
    status === "paid" ||
    status === "fully_paid"
  ) {
    return (
      <Tag
        color="green"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        ĐÃ TRẢ ĐỦ
      </Tag>
    );
  }

  // 2. Kiểm tra trạng thái ĐÃ ĐÓNG CỌC 30% (partial_paid)
  if (status.includes("partial") || status === "partial_paid") {
    return (
      <Tag
        color="cyan"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        ĐÃ CỌC 30%
      </Tag>
    );
  }

  // 3. Trường hợp đặc biệt: Đơn vãng lai đá liền không cần cọc tiền
  if (
    status === "no_deposit" ||
    (depositAmount <= 0 && (status === "paid" || status === "fully_paid"))
  ) {
    return (
      <Tag
        color="blue"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        KHÔNG CẦN CỌC
      </Tag>
    );
  }

  // 4. Mặc định hiển thị CHƯA CỌC
  return (
    <Tag
      color="red"
      style={{ fontWeight: 700, borderRadius: 6 }}
      className="px-3"
    >
      CHƯA CỌC
    </Tag>
  );
};

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

  // Quản lý mốc trang hiện tại cục bộ của từng bảng nhằm đồng bộ mượt mà
  const [pagePlaying, setPagePlaying] = useState<number>(1);
  const [pageWaiting, setPageWaiting] = useState<number>(1);

  // Nạp năng lượng hệ thống (Lấy lượng dữ liệu lớn để Client phân trang không lo bị trống)
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await staffBookingService.getBookings({
        page: 1,
        per_page: 200,
      });
      const rawData = res.data;

      if (rawData && typeof rawData === "object" && "data" in rawData) {
        const paginated = rawData as { data: Booking[] };
        setBookings(paginated.data);
      } else if (Array.isArray(rawData)) {
        setBookings(rawData);
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

  // Tránh việc bắn API liên tục hoặc hiện notification trùng lặp
  const autoStartedIdsRef = useRef<Set<number>>(new Set());
  const notified30mIdsRef = useRef<Set<number>>(new Set());
  const notified5mIdsRef = useRef<Set<number>>(new Set());

  // Trình tự động quét kích hoạt ca đá & cảnh báo trước 30 phút
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = dayjs();
      const todayStr = now.format("YYYY-MM-DD");

      bookings.forEach((b) => {
        // Chỉ quét các ca đá của ngày hôm nay
        if (b.booking_date !== todayStr) return;

        const bookingStart = dayjs(`${b.booking_date} ${b.start_time}`);
        const bookingEnd = dayjs(`${b.booking_date} ${b.end_time}`);
        const diffMinutes = bookingStart.diff(now, "minute", true);

        // 1. CẢNH BÁO TRƯỚC 30 PHÚT: (status: pending/approved, còn <= 30 phút)
        if (
          (b.status === "pending" || b.status === "approved") &&
          diffMinutes > 0 &&
          diffMinutes <= 30
        ) {
          // Lần 1: Thông báo lúc còn <= 30 phút và > 5 phút
          if (diffMinutes > 5) {
            if (!notified30mIdsRef.current.has(b.id)) {
              notified30mIdsRef.current.add(b.id);
              notification.info({
                message: "⚠️ SẮP ĐẾN CA ĐÁ (Còn 30 phút)!",
                description: `Sân ${b.field?.name || b.field_name || "N/A"} chuẩn bị bắt đầu ca đá của khách "${b.customer_name}" lúc ${b.start_time.substring(0, 5)} (còn khoảng ${Math.ceil(diffMinutes)} phút)!`,
                duration: 8,
                placement: "topRight",
              });
            }
          }
          // Lần 2 (Cuối cùng): Thông báo lúc còn <= 5 phút
          else if (diffMinutes <= 5 && diffMinutes > 0) {
            if (!notified5mIdsRef.current.has(b.id)) {
              notified5mIdsRef.current.add(b.id);
              notification.warning({
                message: "🚨 SẮP ĐẾN CA ĐÁ (Còn 5 phút)!",
                description: `Sân ${b.field?.name || b.field_name || "N/A"} chuẩn bị bắt đầu ca đá của khách "${b.customer_name}" lúc ${b.start_time.substring(0, 5)} (còn khoảng ${Math.ceil(diffMinutes)} phút)!`,
                duration: 8,
                placement: "topRight",
              });
            }
          }
        }

        // 2. TỰ ĐỘNG BẮT ĐẦU CA HOẶC HỦY CA KHI ĐẾN GIỜ:
        if (
          (b.status === "pending" || b.status === "approved") &&
          (now.isAfter(bookingStart) || now.isSame(bookingStart)) &&
          now.isBefore(bookingEnd)
        ) {
          const pStatus = (b.payment_status || "").toLowerCase().trim();
          const isFullyPaid = pStatus === "fully_paid" || pStatus === "paid";

          // Chỉ tự động bắt đầu khi đã được duyệt (approved) VÀ đã thanh toán đủ (fully_paid/paid)
          if (b.status === "approved" && isFullyPaid) {
            if (!autoStartedIdsRef.current.has(b.id)) {
              autoStartedIdsRef.current.add(b.id);
              (async () => {
                try {
                  await staffBookingService.updateStatus(b.id, "playing");
                  notification.success({
                    message: "⚡ TỰ ĐỘNG BẮT ĐẦU CA",
                    description: `Hệ thống tự động kích hoạt bắt đầu ca đá cho khách "${b.customer_name}" tại sân ${b.field?.name || b.field_name || "N/A"}!`,
                    duration: 8,
                  });
                  fetchBookings();
                } catch (e) {
                  console.error("Lỗi kích hoạt ca tự động:", e);
                }
              })();
            }
          } else {
            // Đơn ở trạng thái duyệt 70% (partial_paid) hoặc chờ duyệt (pending) mà chưa trả đủ tiền sân khi đến giờ đá
            // Tự động chuyển thành trạng thái HỦY ĐƠN
            if (!autoStartedIdsRef.current.has(b.id)) {
              autoStartedIdsRef.current.add(b.id);
              (async () => {
                try {
                  await staffBookingService.updateStatus(b.id, "cancelled");
                  notification.error({
                    message: "🚫 TỰ ĐỘNG HỦY ĐƠN",
                    description: `Đơn đặt của khách "${b.customer_name}" tại sân ${b.field?.name || b.field_name || "N/A"} đã đến giờ đá nhưng chưa hoàn tất thanh toán nốt 70% hoặc chưa duyệt. Hệ thống tự động hủy đơn.`,
                    duration: 8,
                  });
                  fetchBookings();
                } catch (e) {
                  console.error("Lỗi tự động hủy đơn quá giờ:", e);
                }
              })();
            }
          }
        }
      });
    }, 5000); // Quét mỗi 5 giây cho real-time

    return () => clearInterval(checkInterval);
  }, [bookings]);

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

  // Danh sách phân luồng dữ liệu chuẩn chỉ
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
  const waitingList = useMemo(() => {
    return [...pendingList, ...approvedList].sort((a, b) => {
      const aDateTime = dayjs(`${a.booking_date} ${a.start_time}`);
      const bDateTime = dayjs(`${b.booking_date} ${b.start_time}`);
      return aDateTime.diff(bDateTime);
    });
  }, [pendingList, approvedList]);

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

    // 🚀 VALIDATE TRẠNG THÁI THANH TOÁN TRƯỚC KHI BẮT ĐẦU ĐÁ
    const paymentStatus = (booking.payment_status || "").toLowerCase().trim();
    if (
      paymentStatus !== "partial_paid" &&
      paymentStatus !== "fully_paid" &&
      paymentStatus !== "paid"
    ) {
      message.error(
        "Không thể bắt đầu đá! Trạng thái đơn phải là 'Đã cọc 30%' hoặc 'Đã trả đủ' mới được phép vào sân."
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

  const handleEndBooking = (booking: Booking) => {
    const durationMinutes = dayjs(`2000-01-01 ${booking.end_time}`).diff(
      dayjs(`2000-01-01 ${booking.start_time}`),
      "minute",
    );
    const deadline = dayjs(booking.updated_at).add(durationMinutes, "minute");
    const isEarly = dayjs().isBefore(deadline);

    const total = Number(booking.total_amount || booking.total_price || 0);
    const deposit = Number(booking.deposit_amount || 0);
    const paymentStatus = (booking.payment_status || "").toLowerCase().trim();

    let amountToCollect = total;
    let paymentNote = "";

    if (paymentStatus === "fully_paid" || paymentStatus === "paid") {
      amountToCollect = 0;
      paymentNote = "Khách đã thanh toán đủ 100%. Không cần thu tiền.";
    } else if (paymentStatus === "partial_paid") {
      amountToCollect = total - deposit;
      paymentNote = `Khách đã cọc 30% (${deposit.toLocaleString()}đ). Cần thu 70% còn lại.`;
    } else {
      amountToCollect = total;
      paymentNote = "Khách chưa đặt cọc. Cần thu 100% tiền sân.";
    }

    Modal.confirm({
      title: isEarly ? "⚠️ CẢNH BÁO: CHƯA HẾT GIỜ!" : "THANH TOÁN HÓA ĐƠN",
      icon: (
        <ExclamationCircleOutlined
          style={{ color: isEarly ? "#faad14" : "#1890ff" }}
        />
      ),
      content: (
        <div className="mt-4 space-y-4 text-left">
          {isEarly && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-center">
              <Text className="text-orange-600 font-black italic uppercase text-[10px]">
                ⚠️ Sân vẫn đang trong ca đá!
              </Text>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left">
            <div className="text-xs text-blue-700 font-bold block mb-1">
              Thông tin dòng tiền:
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>• Tổng tiền ca: <strong>{total.toLocaleString()}đ</strong></div>
              <div>• Trạng thái cọc: <span className="text-blue-600 uppercase font-black">{paymentStatus === 'partial_paid' ? 'ĐÃ CỌC 30%' : (paymentStatus === 'fully_paid' || paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN ĐỦ' : 'CHƯA ĐÓNG CỌC')}</span></div>
              <div className="text-gray-500 italic">👉 {paymentNote}</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center shadow-lg">
            <Text className="text-[10px] text-white/80 uppercase font-black">
              Số tiền cần thu thực tế
            </Text>
            <div className="text-2xl font-black italic">
              {amountToCollect.toLocaleString()}đ
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
      render: (r: Booking) => {
        const now = dayjs();
        const bookingStart = dayjs(`${r.booking_date} ${r.start_time}`);
        const diffMinutes = bookingStart.diff(now, "minute", true);
        const isUpcoming =
          (r.status === "pending" || r.status === "approved") &&
          diffMinutes > 0 &&
          diffMinutes <= 30;

        return (
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
            {isUpcoming && (
              <Tag
                color="warning"
                className="animate-pulse font-black border-none text-[9px] block w-fit mt-1 px-1.5 py-0.5 rounded"
              >
                ⚠️ SẮP ĐÁ (CÒN {Math.ceil(diffMinutes)} PHÚT)
              </Tag>
            )}
          </div>
        );
      },
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
        <span className="font-black text-[10px] text-slate-400 italic">
          CHI PHÍ & ĐÃ THU
        </span>
      ),
      render: (r: Booking) => {
        const total = Number(r.total_amount || r.total_price || 0);
        const deposit = Number(r.deposit_amount || 0);
        const paymentStatus = (r.payment_status || "").toLowerCase().trim();

        let daThu = 0;
        let canThu = total;

        if (paymentStatus === "fully_paid" || paymentStatus === "paid") {
          daThu = total;
          canThu = 0;
        } else if (paymentStatus === "partial_paid") {
          daThu = deposit > 0 ? deposit : total * 0.3;
          canThu = total - daThu;
        } else {
          daThu = 0;
          canThu = total;
        }

        return (
          <div className="space-y-0.5 text-xs font-bold">
            <div className="text-slate-600">
              Tổng: {total.toLocaleString()}đ
            </div>
            <div className="text-emerald-600">
              Đã thu: {daThu.toLocaleString()}đ
            </div>
            <div className={canThu > 0 ? "text-red-500 animate-pulse" : "text-blue-600"}>
              Cần thu: {canThu.toLocaleString()}đ
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span className="font-black text-[10px] text-slate-400 italic">
          TIỀN CỌC
        </span>
      ),
      render: (r: Booking) => {
        return getPaymentStatusTag(
          r.payment_status || "unpaid",
          r.deposit_amount || 0,
        );
      },
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
          {r.payment_status === "unpaid" && r.status === "pending" && (
            <Button
              type="primary"
              className="bg-amber-500 border-amber-500 text-[10px] font-black uppercase italic hover:bg-amber-600"
              onClick={async () => {
                try {
                  setLoading(true);
                  await staffBookingService.confirmDeposit(r.recurring_group_id || r.id);
                  message.success("Nhân viên quầy duyệt cọc thành công!");
                  fetchBookings();
                } catch (e) {
                  message.error("Lỗi xác nhận tiền cọc quầy!");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Duyệt cọc
            </Button>
          )}
          {r.status === "pending" && (
            <>
              {!r.deposit_amount ||
              r.deposit_amount <= 0 ||
              r.payment_status !== "unpaid" ? (
                <Button
                  type="primary"
                  className="bg-orange-500 border-orange-500 text-[10px] font-black uppercase italic"
                  onClick={() =>
                    handleUpdateStatus(r.id, "approved", "Đã duyệt đơn thành công!")
                  }
                >
                  Duyệt đơn
                </Button>
              ) : (
                <span className="text-[10px] text-orange-500 font-bold italic mr-1">
                  ⚠️ Đợi cọc ngân hàng
                </span>
              )}
              <Button
                type="primary"
                danger
                className="text-[10px] font-black uppercase italic"
                onClick={() =>
                  handleUpdateStatus(r.id, "rejected", "Đã từ chối đơn thành công!")
                }
              >
                Từ chối
              </Button>
            </>
          )}

          {r.status === "approved" && r.payment_status === "partial_paid" && (
            <Button
              type="primary"
              className="bg-teal-600 border-teal-600 text-[10px] font-black uppercase italic hover:bg-teal-700 h-9"
              onClick={async () => {
                try {
                  setLoading(true);
                  await staffBookingService.updateStatus(r.id, undefined, "fully_paid");
                  message.success("Xác nhận nhận đủ 70% còn lại thành công!");
                  fetchBookings();
                } catch (e) {
                  message.error("Lỗi xác nhận thanh toán!");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Nhận đủ 70%
            </Button>
          )}

          {(r.status === "playing" || (r.status === "approved" && r.payment_status !== "partial_paid")) && (
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
          rowKey="id"
          loading={loading}
          // 🚀 FIX: Liên kế liên tục không trống ca, cố định 5 đơn/trang rực rỡ
          pagination={{
            current: pagePlaying,
            pageSize: 5,
            onChange: (page) => setPagePlaying(page),
            showTotal: (total) => `Tổng cộng ${total} ca đang đá`,
          }}
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
        <Table
          columns={columns.filter((c) => c.key !== "countdown")}
          dataSource={waitingList}
          rowKey="id"
          loading={loading}
          // 🚀 FIX: Đồng bộ liên kề khít nhau, cố định 6 đơn/trang chuẩn chỉ
          pagination={{
            current: pageWaiting,
            pageSize: 6,
            onChange: (page) => setPageWaiting(page),
            showTotal: (total) => `Tổng số ${total} đơn đặt lịch trực tuyến`,
          }}
        />
      </Card>
    </div>
  );
}

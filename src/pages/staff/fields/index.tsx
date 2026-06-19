import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Tag,
  Typography,
  message,
  Space,
  DatePicker,
  Badge,
  Form,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import staffBookingService, {
  FieldInfo,
  Booking,
} from "@/services/staff/staffBookingService";
import Addfield from "./Addfield";

const { Title, Text } = Typography;

// Sinh danh sách ca mượt mà mỗi 30 phút từ 4h sáng đến 24h đêm
const generateTimeSlots = (startHour = 4, endHour = 24, stepMinutes = 30) => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push(timeString);
    }
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

interface SlotStatus {
  type: "available" | "playing" | "booked" | "expired";
  label: string;
  color: string;
}

export default function StaffFields() {
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // 🚀 ĐÃ BỔ SUNG: State lưu trữ thông tin sân đang được chọn để truyền qua Prop Component con
  const [currentSelectedField, setCurrentSelectedField] =
    useState<FieldInfo | null>(null);
  const [form] = Form.useForm();

  const fetchLiveStatus = async () => {
    try {
      setLoading(true);
      const res = await staffBookingService.getLiveStatus(
        date.format("YYYY-MM-DD"),
      );
      if (res.success) {
        setFields(res.data.fields);
        setBookings(res.data.bookings);
      }
    } catch (error: unknown) {
      message.error("Lỗi đồng bộ dữ liệu sân!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, [date]);

  const getSlotStatus = (fieldId: number, slotStart: string): SlotStatus => {
    const slotDateTime = dayjs(`${date.format("YYYY-MM-DD")} ${slotStart}`);
    if (slotDateTime.isBefore(dayjs().add(5, "minute"))) {
      return { type: "expired", label: "HẾT HẠN", color: "#d9d9d9" };
    }

    const [slotH, slotM] = slotStart.split(":").map(Number);
    const slotTotalMinutes = slotH * 60 + slotM;
    const slotEndMinutes = slotTotalMinutes + 90;

    const booking = bookings.find((b) => {
      if (b.field_id !== fieldId) return false;

      const [startH, startM] = b.start_time.split(":").map(Number);
      const [endH, endM] = b.end_time.split(":").map(Number);

      const startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;

      if (endH === 23 && endM >= 59) {
        endTotal = 24 * 60;
      }

      return slotTotalMinutes < endTotal && slotEndMinutes > startTotal;
    });

    if (!booking)
      return { type: "available", label: "TRỐNG", color: "#10b981" };
    if (booking.status === "playing")
      return { type: "playing", label: "ĐANG ĐÁ", color: "#ef4444" };
    return { type: "booked", label: "ĐÃ ĐẶT", color: "#f59e0b" };
  };

  const handleSlotClick = (field: FieldInfo, slot: string) => {
    const status = getSlotStatus(field.id, slot);

    if (status.type === "expired") {
      message.warning("Khung giờ này đã trôi qua rồi ní ơi!");
      return;
    }

    if (status.type === "booked" || status.type === "playing") {
      const now = dayjs();
      const isToday = date.isSame(now, "day");

      if (!isToday) {
        if (date.isBefore(now, "day")) {
          message.error("Lịch này đã cũ rồi, không thể bắt đầu!");
        } else {
          message.error(
            `Đơn này đặt cho ngày ${date.format("DD/MM/YYYY")}. Chưa tới ngày đá, không được mở sân sớm vậy ní!`,
          );
        }
        return;
      }

      const slotDateTime = dayjs(`${date.format("YYYY-MM-DD")} ${slot}`);
      if (status.type === "booked" && slotDateTime.diff(now, "minute") > 15) {
        const diffMinutes = slotDateTime.diff(now, "minute");
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        message.warning(
          `Chưa tới giờ vào sân! Còn khoảng ${h > 0 ? h + " giờ " : ""}${m} phút nữa mới tới ca đá.`,
        );
        return;
      }

      message.info(
        "Lịch đặt đang được xử lý, vui lòng qua Dashboard để điều phối trạng thái 'BẮT ĐẦU / KẾT THÚC' chính thức!",
      );
      return;
    }

    if (status.type === "available") {
      // Gán đối tượng thông tin sân thật vào State để đẩy sang Modal con
      setCurrentSelectedField(field);

      form.setFieldsValue({
        field_id: field.id,
        fieldName: `${field.name} - ${field.type}`,
        fieldPrice: field.price,
        start_time: slot,
        manual_end: null, // Reset lại giờ tự chọn của đơn trước
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[100vw] overflow-hidden">
      {/* HEADER BAR */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <Title
            level={2}
            className="!m-0 !font-black italic uppercase tracking-tighter"
          >
            Bản đồ <span className="text-emerald-500">Sân Trống</span>
          </Title>
          <Text className="text-slate-400 font-bold italic uppercase text-[10px]">
            Real-time Field Grid
          </Text>
        </div>
        <Space className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <DatePicker
            value={date}
            onChange={(d) => d && setDate(d)}
            allowClear={false}
            className="font-bold border-none"
            format="DD/MM/YYYY"
          />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchLiveStatus}
            shape="circle"
          />
        </Space>
      </div>

      {/* TRẠNG THÁI BADGE */}
      <div className="flex gap-6 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm w-fit">
        <Badge
          color="#10b981"
          text={
            <Text className="text-[10px] font-black italic uppercase">
              Sẵn sàng
            </Text>
          }
        />
        <Badge
          color="#f59e0b"
          text={
            <Text className="text-[10px] font-black italic uppercase">
              Đã có lịch
            </Text>
          }
        />
        <Badge
          color="#ef4444"
          text={
            <Text className="text-[10px] font-black italic uppercase">
              Đang đá
            </Text>
          }
        />
        <Badge
          color="#d9d9d9"
          text={
            <Text className="text-[10px] font-black italic uppercase">
              Hết hạn
            </Text>
          }
        />
      </div>

      {/* LƯỚI QUẢN LÝ SÂN BÓNG BIỂU DIỄN SẠCH ĐẸP */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 overflow-hidden">
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[3200px] space-y-4">
            {/* DÒNG TIÊU ĐỀ: MỐC GIỜ CA ĐÁ */}
            <div className="flex items-center text-center">
              <div className="w-56 sticky left-0 bg-white z-20 font-black italic uppercase text-slate-400 text-[10px] text-left pr-4">
                Thông tin sân
              </div>

              <div
                className="flex-1 grid gap-2 pr-4"
                style={{
                  gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(0, 1fr))`,
                }}
              >
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="text-[8px] text-emerald-500 font-black mb-1 bg-emerald-50 rounded-full py-0.5 px-2 w-fit">
                      {date.format("DD/MM")}
                    </div>
                    <div className="font-black italic text-slate-600 text-xs">
                      {slot}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DANH SÁCH SÂN VÀ TRẠNG THÁI KHUNG GIỜ CHI TIẾT */}
            {fields.map((field) => (
              <div key={field.id} className="flex items-center group">
                <div className="w-56 sticky left-0 bg-white z-10 pr-4 flex-shrink-0">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all shadow-sm">
                    <div className="bg-emerald-500 w-1 h-8 rounded-full flex-shrink-0"></div>
                    <div className="overflow-hidden">
                      <div className="font-black italic uppercase text-slate-700 leading-none mb-1 text-xs truncate">
                        {field.name}
                      </div>
                      <Tag className="text-[9px] font-bold border-none bg-emerald-100 text-emerald-700 m-0 uppercase italic scale-90 origin-left">
                        {field.type}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 grid gap-2 pr-4"
                  style={{
                    gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(0, 1fr))`,
                  }}
                >
                  {TIME_SLOTS.map((slot) => {
                    const status = getSlotStatus(field.id, slot);
                    return (
                      <div
                        key={slot}
                        onClick={() => handleSlotClick(field, slot)}
                        className={`h-14 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm text-center select-none
                          ${status.type === "available" ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 border-dashed" : "text-white"}
                          ${status.type === "playing" ? "bg-gradient-to-br from-red-500 to-rose-600 font-bold" : ""}
                          ${status.type === "booked" ? "bg-gradient-to-br from-orange-400 to-amber-500 font-bold" : ""}
                          ${status.type === "expired" ? "bg-slate-100 cursor-not-allowed border-none opacity-40 grayscale pointer-events-none" : ""}
                        `}
                      >
                        <span
                          className={`text-[9px] font-black italic tracking-tight uppercase ${status.type === "available" ? "text-emerald-600" : status.type === "expired" ? "text-slate-400" : "text-white"}`}
                        >
                          {status.label}
                        </span>
                        {status.type === "available" && (
                          <Text className="text-[8px] text-emerald-400 font-black mt-0.5">
                            {field.price / 1000}K
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ĐIỀU PHỐI TẠO ĐƠN TẠI QUẦY */}
      <Addfield
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setCurrentSelectedField(null);
        }}
        date={date}
        onSuccess={() => {
          setIsModalOpen(false);
          setCurrentSelectedField(null);
          fetchLiveStatus();
        }}
        form={form}
        selectedField={currentSelectedField} // 🚀 ĐÃ SỬA: Đẩy object data sân thật thay vì null
      />
    </div>
  );
}

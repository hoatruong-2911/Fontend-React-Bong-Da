import { useState, useEffect } from "react";
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
import { EnvironmentOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import staffBookingService, {
  FieldInfo,
  Booking,
} from "@/services/staff/staffBookingService";
import Addfield from "./Addfield";

const { Title, Text } = Typography;

const TIME_SLOTS = [
  "06:00",
  "07:30",
  "09:00",
  "10:30",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "19:00",
  "20:30",
  "22:00",
];

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

    const booking = bookings.find((b) => {
      if (b.field_id !== fieldId) return false;
      const [startH, startM] = b.start_time.split(":").map(Number);
      const [endH, endM] = b.end_time.split(":").map(Number);
      return (
        slotTotalMinutes >= startH * 60 + startM &&
        slotTotalMinutes < endH * 60 + endM
      );
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

    // ✅ CẬP NHẬT: LOGIC KIỂM TRA NGÀY KHI CLICK VÀO Ô ĐÃ ĐẶT
    if (status.type === "booked") {
      const now = dayjs();
      const isToday = date.isSame(now, "day"); // So sánh ngày trên DatePicker với hôm nay

      // 🛑 CHẶN NẾU SAI NGÀY
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

      // Nếu là đúng ngày hôm nay, check tiếp giờ (cho phép sớm 15p)
      const slotDateTime = dayjs(`${date.format("YYYY-MM-DD")} ${slot}`);
      if (slotDateTime.diff(now, "minute") > 15) {
        const diffMinutes = slotDateTime.diff(now, "minute");
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        message.warning(
          `Chưa tới giờ vào sân! Còn khoảng ${h > 0 ? h + " giờ " : ""}${m} phút nữa mới tới ca đá.`,
        );
        return;
      }

      message.info(
        "Giờ đá đã tới, vui lòng qua Dashboard để bấm 'BẮT ĐẦU' chính thức!",
      );
      return;
    }

    if (status.type === "available") {
      form.setFieldsValue({
        field_id: field.id,
        fieldName: `${field.name} - ${field.type}`,
        fieldPrice: field.price,
        start_time: slot,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
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
          />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchLiveStatus}
            shape="circle"
          />
        </Space>
      </div>

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

      <div className="overflow-x-auto rounded-[2rem] shadow-2xl border border-slate-50">
        <div className="min-w-[1100px] bg-white p-8">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr>
                <th className="w-48 text-left font-black italic uppercase text-slate-400 text-[10px] pb-2">
                  Thông tin sân
                </th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot}
                    className="text-center font-black italic text-slate-600 text-[11px] pb-2"
                  >
                    {/* ✅ HIỂN THỊ NGÀY TRÊN GIỜ CA (Sửa chỗ này) */}
                    <div className="text-[8px] text-emerald-500 font-black mb-1 bg-emerald-50 rounded-full py-0.5 px-2 w-fit mx-auto">
                      {date.format("DD/MM/YYYY")}
                    </div>
                    <div>{slot}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="group">
                  <td className="pr-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                      <div className="bg-emerald-500 w-1.5 h-10 rounded-full"></div>
                      <div>
                        <div className="font-black italic uppercase text-slate-700 leading-none mb-1">
                          {field.name}
                        </div>
                        <Tag className="text-[9px] font-bold border-none bg-emerald-100 text-emerald-700 m-0 uppercase italic">
                          {field.type}
                        </Tag>
                      </div>
                    </div>
                  </td>
                  {TIME_SLOTS.map((slot) => {
                    const status = getSlotStatus(field.id, slot);
                    return (
                      <td key={slot} className="px-1">
                        <div
                          onClick={() => handleSlotClick(field, slot)}
                          className={`h-16 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95
                            ${status.type === "available" ? "bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 border-dashed" : "text-white"}
                            ${status.type === "playing" ? "bg-red-500 shadow-lg shadow-red-100 font-bold" : ""}
                            ${status.type === "booked" ? "bg-orange-400 shadow-lg shadow-orange-100 font-bold" : ""}
                            ${status.type === "expired" ? "bg-slate-100 cursor-not-allowed border-none opacity-40 grayscale" : ""}
                          `}
                        >
                          <span
                            className={`text-[10px] font-black italic ${status.type === "available" ? "text-emerald-600" : status.type === "expired" ? "text-slate-400" : "text-white"}`}
                          >
                            {status.label}
                          </span>
                          {status.type === "available" && (
                            <Text className="text-[9px] text-emerald-400 font-bold">
                              {field.price / 1000}K/H
                            </Text>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Addfield
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        date={date}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchLiveStatus();
        }}
        form={form}
        selectedField={null}
      />
    </div>
  );
}

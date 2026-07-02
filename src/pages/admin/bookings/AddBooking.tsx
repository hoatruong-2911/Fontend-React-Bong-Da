import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  DatePicker,
  Divider,
  message,
  Space,
  Spin,
  Select,
  Row,
  Col,
  Switch,
  TimePicker,
  Typography,
  Form,
  Badge,
  Modal,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  LeftOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

// 🚀 CHỈ SỬ DỤNG SERVICES ADMIN CHUẨN CHỈNH
import adminFieldService from "@/services/admin/fieldService";
import adminBookingService from "@/services/admin/bookingService";
import { Field } from "@/services/admin/fieldService";

dayjs.locale("vi");
const { Option } = Select;
const { Text } = Typography;

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

interface CustomerInfo {
  name: string;
  phone: string;
  note: string;
}

interface CustomCardProps {
  title: string;
  step: number;
  description: string;
  children: React.ReactNode;
}

const CustomCard = ({
  title,
  step,
  description,
  children,
}: CustomCardProps) => (
  <Card className="shadow-sm mb-6" style={{ borderRadius: 12, border: "none" }}>
    <div style={{ marginBottom: 20 }}>
      <Space align="center" style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#62B462",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {step}
        </div>
        <h3
          style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#262626" }}
        >
          {title}
        </h3>
      </Space>
      <p style={{ margin: 0, marginLeft: 44, color: "#8c8c8c", fontSize: 14 }}>
        {description}
      </p>
    </div>
    <div style={{ marginLeft: 44 }}>{children}</div>
  </Card>
);

export default function AddBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fieldIdFromUrl = searchParams.get("fieldId");
  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [currentField, setCurrentField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [isManualTime, setIsManualTime] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [modalDetails, setModalDetails] = useState<{
    groupId: string;
    deposit: number;
  } | null>(null);

  const [manualTime, setManualTime] = useState(() => {
    let start = dayjs().add(15, "minute");
    if (start.hour() >= 0 && start.hour() < 4) {
      start = start.hour(4).minute(0);
    }
    let end = start.add(1, "hour");
    if (end.date() !== start.date() && (end.hour() > 0 || end.minute() > 0)) {
      end = start.add(1, "day").hour(0).minute(0);
    }
    return {
      start: start.format("HH:mm"),
      end: end.format("HH:mm"),
    };
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    note: "",
  });

  // 1. Tải danh sách sân (Admin Service)
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const response = await adminFieldService.getFields();
        const fields = response.data?.data || response.data || [];
        setAllFields(fields);
        const id = fieldIdFromUrl ? parseInt(fieldIdFromUrl) : null;
        const target = fields.find((f: Field) => f.id === id) || fields[0];
        if (target) setCurrentField(target);
      } catch (error) {
        message.error("Lỗi tải danh sách sân.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [fieldIdFromUrl]);

  // 2. 🚀 ĐÃ ĐỒNG BỘ: Sử dụng getFieldSchedule mới bổ sung của Admin để khớp lưới ca bận
  const fetchFieldSchedule = useCallback(
    async (fieldId: number, selectedDate: Dayjs) => {
      try {
        setScheduleLoading(true);
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const response = await adminBookingService.getFieldSchedule(
          fieldId,
          dateStr,
        );
        const data = response.data?.data || response.data || [];
        setBookings(data);
      } catch (error) {
        console.error("Lỗi tải lịch bận của sân.");
      } finally {
        setScheduleLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (currentField && date) fetchFieldSchedule(currentField.id, date);
  }, [currentField, date, fetchFieldSchedule]);

  // 🚀 ĐÃ ĐỒNG BỘ: Logic tính trạng thái ô giờ chi tiết mượt mà y chang Customer
  const getSlotStatus = (slotStart: string) => {
    const slotDateTime = dayjs(`${date?.format("YYYY-MM-DD")} ${slotStart}`);

    if (slotDateTime.isBefore(dayjs().add(5, "minute"))) {
      return {
        type: "expired",
        label: "HẾT HẠN",
        color: "#d9d9d9",
        disabled: true,
      };
    }

    const [slotH, slotM] = slotStart.split(":").map(Number);
    const slotTotalMinutes = slotH * 60 + slotM;
    const slotEndMinutes = slotTotalMinutes + 30; // Mỗi ô lưới đại diện 30 phút

    const booking = bookings.find((b: any) => {
      const [startH, startM] = b.start_time.split(":").map(Number);
      const [endH, endM] = b.end_time.split(":").map(Number);
      const startTotal = startH * 60 + startM;

      let endTotal = endH * 60 + endM;
      if (endH === 23 && endM >= 59) {
        endTotal = 24 * 60;
      } else if (endTotal < startTotal) {
        // Hỗ trợ trường hợp ca đá xuyên đêm (qua ngày hôm sau)
        endTotal += 24 * 60;
      }

      return slotTotalMinutes < endTotal && slotEndMinutes > startTotal;
    });

    if (booking) {
      if (booking.status === "playing")
        return {
          type: "playing",
          label: "ĐANG ĐÁ",
          color: "#ef4444",
          disabled: true,
        };
      return {
        type: "booked",
        label: "ĐÃ ĐẶT",
        color: "#f59e0b",
        disabled: true,
      };
    }

    if (slotStart === "23:00" || slotStart === "23:30") {
      return {
        type: "available",
        label: "TRỐNG",
        color: "#10b981",
        disabled: true,
      };
    }

    return {
      type: "available",
      label: "SẴN SÀNG",
      color: "#10b981",
      disabled: false,
    };
  };

  // --- LOGIC TÍNH TOÁN TIỀN ---
  const pricing = useMemo(() => {
    let durationInHours = 0;
    let startTimeStr = "";
    let endTimeStr = "";

    if (isRecurring) {
      const start = dayjs(manualTime.start, "HH:mm");
      let end = dayjs(manualTime.end, "HH:mm");
      if (manualTime.end === "00:00") end = end.add(1, "day");

      durationInHours = end.diff(start, "minute") / 60;
      startTimeStr = manualTime.start;
      endTimeStr = manualTime.end;

      const totalSessions = recurringMonths * 4;
      const basePricePerHour = currentField?.price || 0;
      const sessionPrice = basePricePerHour * durationInHours;
      const isNight = parseInt(startTimeStr.split(":")[0]) >= 20;
      const surchargePerSession = isNight ? sessionPrice * 0.2 : 0;
      const finalSessionPrice = sessionPrice + surchargePerSession;
      const finalTotal = finalSessionPrice * totalSessions;

      return {
        durationInHours,
        startTimeStr,
        endTimeStr,
        subTotal: finalTotal,
        surcharge: 0,
        finalTotal: finalTotal,
        depositRequired: finalTotal * 0.3,
        totalSessions: totalSessions,
      };
    }

    if (isManualTime) {
      const start = dayjs(manualTime.start, "HH:mm");
      let end = dayjs(manualTime.end, "HH:mm");
      if (manualTime.end === "00:00") end = end.add(1, "day");

      durationInHours = end.diff(start, "minute") / 60;
      startTimeStr = manualTime.start;
      endTimeStr = manualTime.end;
    } else {
      if (selectedTime) {
        if (selectedTime === "22:30") {
          durationInHours = 1.0;
          startTimeStr = selectedTime;
          endTimeStr = "23:30";
        } else {
          durationInHours = 1.5;
          startTimeStr = selectedTime;
          endTimeStr = dayjs(`2000-01-01 ${selectedTime}`)
            .add(90, "minute")
            .format("HH:mm");
        }
      }
    }

    if (durationInHours <= 0 || !currentField) return null;
    const basePricePerHour = currentField.price || 0;
    const subTotal = basePricePerHour * durationInHours;
    const isNight = parseInt(startTimeStr.split(":")[0]) >= 20;
    const surcharge = isNight ? subTotal * 0.2 : 0;
    const finalTotal = subTotal + surcharge;

    return {
      durationInHours,
      startTimeStr,
      endTimeStr,
      subTotal,
      surcharge,
      finalTotal,
      depositRequired: finalTotal * 0.3,
      totalSessions: 1,
    };
  }, [
    isManualTime,
    manualTime,
    selectedTime,
    currentField,
    isRecurring,
    recurringMonths,
    bookings,
  ]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomerInfo({ ...customerInfo, phone: val });
    form.setFieldsValue({ phone: val });
  };

  // 🚀 ĐÃ SỬA CHUẨN LUỒNG GIỜ LẺ: Gán trực tiếp chuỗi định dạng HH:mm giống bên Customer, triệt tiêu lỗi 422 Carbon
  const handleSingleBooking = async (
    bookingDateStr: string,
    pricingData: any,
  ) => {
    if (!currentField) return;
    let finalEndTime = `${bookingDateStr} ${pricingData.endTimeStr}:00`;
    if (pricingData.endTimeStr === "00:00") {
      finalEndTime = `${bookingDateStr} 23:59:59`;
    }
    const bookingData = {
      field_id: currentField.id,
      start_time: `${bookingDateStr} ${pricingData.startTimeStr}:00`,
      end_time: finalEndTime,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      notes: customerInfo.note,
    };

    const response = await adminBookingService.createBooking(bookingData);

    setModalDetails({
      groupId: response.data?.id || response.id || "LE",
      deposit: pricingData.depositRequired,
    });
    setShowDepositModal(true);
    message.success("Giữ chỗ sân lẻ thành công! Vui lòng chuyển khoản cọc.");
  };

  // 🚀 ĐÃ SỬA CHUẨN LUỒNG ĐỊNH KỲ: Gọi đúng service của Admin vừa bổ sung
  const handleRecurringBooking = async (
    bookingDateStr: string,
    pricingData: any,
  ) => {
    if (!currentField) return;
    const recurringData = {
      field_id: currentField.id,
      start_date: bookingDateStr,
      number_of_months: recurringMonths,
      start_time: pricingData.startTimeStr,
      end_time: pricingData.endTimeStr,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      notes: customerInfo.note,
    };
    const response =
      await adminBookingService.createRecurringBooking(recurringData);

    setModalDetails({
      groupId: response.recurring_group_id || response.data?.recurring_group_id,
      deposit: pricingData.depositRequired,
    });
    setShowDepositModal(true);
    message.success("Đặt lịch chuỗi định kỳ thành công!");
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields(["name", "phone"]);

      if (!date || !currentField || !pricing) {
        message.warning("Vui lòng chọn thời gian đặt sân!");
        return;
      }
      if ((isManualTime || isRecurring) && pricing.durationInHours < 1) {
        message.warning("Thời gian đặt sân tự chọn phải từ 1 tiếng trở lên!");
        return;
      }

      const startHour = pricing.startTimeStr;
      const endHour = pricing.endTimeStr;

      if (startHour < "04:00" || startHour > "23:30" || endHour < "04:00" || endHour > "23:30" || endHour <= startHour) {
        message.error("Khung giờ đặt sân không hợp lệ. Sân chỉ hoạt động từ 04:00 đến 23:30.");
        return;
      }

      setIsSubmitting(true);
      const bookingDateStr = date.format("YYYY-MM-DD");

      if (isRecurring) {
        await handleRecurringBooking(bookingDateStr, pricing);
      } else {
        await handleSingleBooking(bookingDateStr, pricing);
      }
    } catch (error: any) {
      if (error && error.errorFields) {
        message.error(
          "Bro ơi! Vui lòng nhập đầy đủ Họ tên và Số điện thoại ở Bước 3 nhé!",
        );
        const contactSection = document.getElementById("step-contact-info");
        if (contactSection) {
          contactSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }
      message.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang tải dữ liệu rực rỡ..." />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <div>
            <h1 className="text-2xl font-bold m-0 italic uppercase">
              Đặt sân rực rỡ (Admin)
            </h1>
            <p className="text-gray-500 m-0">
              Trải nghiệm hệ thống đặt sân chuyên nghiệp số 1 dành cho Admin
            </p>
          </div>
        </header>

        <Row gutter={32}>
          <Col xs={24} lg={16}>
            <CustomCard
              title="Chọn ngày & Sân"
              step={1}
              description="Thời gian và địa điểm"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <DatePicker
                    className="w-full h-12 rounded-xl"
                    size="large"
                    value={date}
                    onChange={setDate}
                    format="DD/MM/YYYY"
                    disabledDate={(c) => c && c < dayjs().startOf("day")}
                  />
                </Col>
                <Col span={12}>
                  <Select
                    size="large"
                    className="w-full h-12"
                    value={currentField?.id}
                    onChange={(id) =>
                      setCurrentField(
                        allFields.find((f) => f.id === id) || null,
                      )
                    }
                  >
                    {allFields.map((f) => (
                      <Option key={f.id} value={f.id}>
                        {f.name} - {f.location}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </CustomCard>

            <CustomCard
              title="Chọn giờ"
              step={2}
              description="Xem trạng thái sân thực tế"
            >
              <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm ${!isRecurring ? "font-bold text-green-600" : "text-gray-400"}`}
                  >
                    Đặt lẻ (1 buổi)
                  </span>
                  <Switch
                    checked={isRecurring}
                    onChange={(val) => {
                      setIsRecurring(val);
                      if (val) setIsManualTime(true);
                      setSelectedTime(null);
                    }}
                  />
                  <span
                    className={`text-sm ${isRecurring ? "font-bold text-green-600" : "text-gray-400"}`}
                  >
                    Đặt cố định (Tháng)
                  </span>
                </div>
                <Divider type="vertical" />
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm ${!isManualTime ? "font-bold text-green-600" : "text-gray-400"}`}
                  >
                    Theo ca (90')
                  </span>
                  <Switch
                    checked={isManualTime}
                    onChange={(val) => {
                      setIsManualTime(val);
                      setSelectedTime(null);
                    }}
                    disabled={isRecurring}
                  />
                  <span
                    className={`text-sm ${isManualTime ? "font-bold text-green-600" : "text-gray-400"}`}
                  >
                    Tự chọn giờ
                  </span>
                </div>
                <Divider type="vertical" />
                <Space size="middle">
                  <Badge
                    color="#10b981"
                    text={
                      <span className="text-[10px] font-bold uppercase italic">
                        Sẵn sàng
                      </span>
                    }
                  />
                  <Badge
                    color="#f59e0b"
                    text={
                      <span className="text-[10px] font-bold uppercase italic">
                        Đã đặt
                      </span>
                    }
                  />
                  <Badge
                    color="#ef4444"
                    text={
                      <span className="text-[10px] font-bold uppercase italic">
                        Đang đá
                      </span>
                    }
                  />
                  <Badge
                    color="#d9d9d9"
                    text={
                      <span className="text-[10px] font-bold uppercase italic">
                        Hết hạn
                      </span>
                    }
                  />
                </Space>
              </div>

              {isRecurring && (
                <div className="bg-white p-6 rounded-xl border border-dashed border-green-300 shadow-sm mb-6">
                  <p className="mb-2 font-black italic uppercase text-[10px] text-green-600">
                    Chọn số tháng muốn đặt cố định *
                  </p>
                  <Select
                    size="large"
                    className="w-full h-12"
                    value={recurringMonths}
                    onChange={setRecurringMonths}
                  >
                    <Option value={1}>1 Tháng (4 buổi)</Option>
                    <Option value={3}>3 Tháng (12 buổi)</Option>
                    <Option value={6}>6 Tháng (24 buổi)</Option>
                  </Select>
                </div>
              )}

              {!isManualTime && !isRecurring ? (
                <Spin spinning={scheduleLoading}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TIME_SLOTS.map((slot) => {
                      const status = getSlotStatus(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <div
                          key={slot}
                          onClick={() =>
                            !status.disabled && setSelectedTime(slot)
                          }
                          className={`relative p-4 border-2 rounded-xl transition-all text-center cursor-pointer
                            ${status.disabled ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" : "bg-white hover:border-green-400 shadow-sm"}
                            ${isSelected && !status.disabled ? "border-green-500 bg-green-50" : "border-gray-100"}`}
                        >
                          <ClockCircleOutlined
                            className={
                              status.disabled
                                ? "text-gray-300"
                                : "text-green-500"
                            }
                          />
                          <div
                            className={`font-bold mt-1 text-xs ${status.disabled ? "text-gray-400" : "text-gray-800"}`}
                          >
                            {slot}
                          </div>
                          <div
                            className="text-[10px] mt-1 font-black italic"
                            style={{ color: status.color }}
                          >
                            {status.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Spin>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <Row gutter={24}>
                    <Col span={12}>
                      <p className="mb-2 font-black italic uppercase text-[10px] text-gray-400">
                        Giờ bắt đầu *
                      </p>
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        size="large"
                        className="w-full h-12 rounded-xl"
                        value={dayjs(manualTime.start, "HH:mm")}
                        disabledTime={() => ({
                          disabledHours: () => {
                            const hours = [0, 1, 2, 3, 23];
                            if (date?.isSame(dayjs(), "day")) {
                              for (let i = 4; i < dayjs().hour(); i++) {
                                hours.push(i);
                              }
                            }
                            return hours;
                          },
                          disabledMinutes: (h) =>
                            date?.isSame(dayjs(), "day") && h === dayjs().hour()
                              ? Array.from(
                                  { length: dayjs().minute() },
                                  (_, i) => i,
                                )
                              : [],
                        })}
                        onChange={(t) =>
                          setManualTime({
                            ...manualTime,
                            start: t?.format("HH:mm") || "17:30",
                          })
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <p className="mb-2 font-black italic uppercase text-[10px] text-gray-400">
                        Giờ kết thúc *
                      </p>
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        size="large"
                        className="w-full h-12 rounded-xl"
                        value={dayjs(manualTime.end, "HH:mm")}
                        disabledTime={() => {
                          const startTime = dayjs(manualTime.start, "HH:mm");
                          return {
                            disabledHours: () => {
                              const hours = [0, 1, 2, 3, 4];
                              for (let i = 5; i < 24; i++) {
                                if (
                                  date?.isSame(dayjs(), "day") &&
                                  i < dayjs().hour()
                                )
                                  hours.push(i);
                                if (i < startTime.hour()) hours.push(i);
                              }
                              return [...new Set(hours)];
                            },
                            disabledMinutes: (selectedHour) => {
                              const minutes = [];
                              if (selectedHour === startTime.hour()) {
                                for (let i = 0; i <= startTime.minute(); i++) {
                                  minutes.push(i);
                                }
                              }
                              if (selectedHour === 23) {
                                for (let i = 31; i < 60; i++) {
                                  minutes.push(i);
                                }
                              }
                              if (
                                date?.isSame(dayjs(), "day") &&
                                selectedHour === dayjs().hour()
                              ) {
                                for (let i = 0; i < dayjs().minute(); i++) {
                                  minutes.push(i);
                                }
                              }
                              return [...new Set(minutes)];
                            },
                          };
                        }}
                        onChange={(t) =>
                          setManualTime({
                            ...manualTime,
                            end: t?.format("HH:mm") || "19:00",
                          })
                        }
                      />
                    </Col>
                  </Row>
                  {(isManualTime || isRecurring) &&
                    pricing &&
                    pricing.durationInHours < 1 && (
                      <div className="text-red-500 mt-2 text-sm italic font-bold">
                        * Thời gian đặt sân tự chọn tối thiểu là 1 giờ!
                      </div>
                    )}
                </div>
              )}
            </CustomCard>

            <div id="step-contact-info">
              <CustomCard
                title="Thông tin liên hệ"
                step={3}
                description="Để chúng tôi xác nhận đặt sân"
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="name"
                    rules={[
                      { required: true, message: "Bro vui lòng nhập họ tên!" },
                    ]}
                  >
                    <Input
                      size="large"
                      className="h-12 rounded-xl font-bold"
                      prefix={<UserOutlined className="text-green-500" />}
                      placeholder="Họ và tên của bạn"
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: "Số điện thoại là bắt buộc!" },
                      {
                        pattern: /^(0)[0-9]{9}$/,
                        message:
                          "Số điện thoại phải là 10 số, bắt đầu bằng số 0!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      className="h-12 rounded-xl font-bold"
                      prefix={<PhoneOutlined className="text-green-500" />}
                      placeholder="Số điện thoại (10 số)"
                      value={customerInfo.phone}
                      onChange={handlePhoneChange}
                    />
                  </Form.Item>
                  <Input.TextArea
                    rows={3}
                    className="rounded-xl font-bold"
                    placeholder="Ghi chú (Ví dụ: Cần mượn thêm bóng...)"
                    value={customerInfo.note}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, note: e.target.value })
                    }
                  />
                </Form>
              </CustomCard>
            </div>
          </Col>

          {/* TỔNG KẾT ĐƠN HÀNG */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <span className="font-black italic uppercase text-slate-700">
                  Tổng kết đơn hàng
                </span>
              }
              className="sticky top-24 shadow-lg border-none"
              style={{ borderRadius: 20 }}
            >
              <div className="space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Đơn giá:</span>
                  <Text className="font-black">
                    {currentField?.price.toLocaleString()}đ/h
                  </Text>
                </div>
                <div className="flex justify-between text-blue-600 font-bold italic">
                  <span>Thời lượng:</span>
                  <span>{pricing?.durationInHours.toFixed(1)} giờ</span>
                </div>
                {isRecurring && pricing && (
                  <div className="flex justify-between text-purple-600 font-bold italic">
                    <span>Số buổi:</span>
                    <span>{pricing.totalSessions} buổi</span>
                  </div>
                )}
                <div className="flex justify-between uppercase italic font-black text-xs">
                  <span>Khung giờ:</span>
                  <span
                    className={
                      pricing?.surcharge ? "text-orange-500" : "text-green-600"
                    }
                  >
                    {pricing
                      ? `${pricing.startTimeStr} - ${pricing.endTimeStr}`
                      : "--:--"}
                  </span>
                </div>
                <Divider className="my-2 border-dashed" />
                {pricing && (
                  <div className="bg-emerald-50 p-4 rounded-xl text-xs space-y-2 border border-emerald-100 shadow-inner">
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-bold italic">
                        Tiền sân gốc:
                      </span>
                      <span className="font-black">
                        {pricing.subTotal.toLocaleString()}đ
                      </span>
                    </div>
                    {pricing.surcharge > 0 && (
                      <div className="flex justify-between text-orange-500 font-black uppercase italic">
                        <span>
                          <InfoCircleOutlined /> Phụ phí đêm (+20%):
                        </span>
                        <span>{pricing.surcharge.toLocaleString()}đ</span>
                      </div>
                    )}
                    {pricing.depositRequired > 0 && (
                      <div className="flex justify-between text-red-500 font-black uppercase italic mt-2 pt-2 border-t border-dashed border-emerald-200">
                        <span>
                          <InfoCircleOutlined /> Cần cọc (30%):
                        </span>
                        <span>{pricing.depositRequired.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black italic uppercase text-lg">
                    TỔNG CỘNG
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-green-600 italic tracking-tighter">
                      {pricing?.finalTotal.toLocaleString() || 0}đ
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  disabled={
                    !pricing ||
                    ((isManualTime || isRecurring) &&
                      pricing.durationInHours < 1)
                  }
                  className="h-16 rounded-[20px] bg-gradient-to-r from-green-500 to-emerald-600 border-none font-black italic uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isRecurring ? "TẠO CHUỖI ĐẶT SÂN" : "XÁC NHẬN ĐẶT SÂN"}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* MODAL MÃ QR ĐỘNG KHỚP SỐ TIỀN THANH TOÁN */}
      <Modal
        title={
          <div className="text-center font-black italic uppercase text-slate-800 text-lg border-b pb-2">
            Thanh Toán Cọc Giữ Chỗ (30%)
          </div>
        }
        open={showDepositModal}
        onOk={() => {
          setShowDepositModal(false);
          navigate("/admin/bookings");
        }}
        onCancel={() => {
          setShowDepositModal(false);
          navigate("/admin/bookings");
        }}
        okText="Tôi đã hiểu & Quay lại danh sách"
        cancelButtonProps={{ style: { display: "none" } }}
        closable={false}
        maskClosable={false}
        centered
        width={500}
      >
        <div className="py-4 space-y-4">
          <div className="text-center">
            <Badge
              status="processing"
              text={
                <span className="font-bold text-emerald-600 text-xs uppercase">
                  Hệ thống đang giữ chỗ tạm thời cho chuỗi đơn của bạn
                </span>
              }
            />
          </div>
          {modalDetails && (
            <div className="flex justify-center my-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <img
                src={`https://img.vietqr.io/image/MB-0372786250-compact2.png?amount=${modalDetails.deposit}&addInfo=${encodeURIComponent(`COC SAN ${modalDetails.groupId}`)}&accountName=${encodeURIComponent("TRUONG THANH HOA")}`}
                alt="Mã QR Chuyển Khoản Cọc Sân"
                className="w-56 h-56 object-contain border-2 border-dashed border-emerald-400 p-1.5 rounded-xl"
              />
            </div>
          )}
          <div className="text-center text-[11px] text-orange-500 font-bold italic">
            ⚡ Mẹo nhỏ: Mở App Ngân hàng quét mã QR trên để tự động điền Tiền &
            Nội dung!
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 font-semibold text-slate-700 text-sm shadow-inner">
            <p>
              🏦 Ngân hàng:{" "}
              <span className="font-black text-slate-900">
                MB BANK (Ngân hàng Quân Đội)
              </span>
            </p>
            <p>
              💳 Số tài khoản:{" "}
              <span className="font-black text-blue-600 tracking-wider text-base">
                0372786250
              </span>
            </p>
            <p>
              👤 Chủ tài khoản:{" "}
              <span className="font-black text-slate-900 uppercase">
                TRUONG THANH HOA
              </span>
            </p>
            <p>
              💰 Số tiền cần cọc:{" "}
              <span className="font-black text-red-500 text-base">
                {(modalDetails?.deposit || 0).toLocaleString()}đ
              </span>
            </p>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 font-bold mt-2">
              📌 Nội dung chuyển khoản bắt buộc (chính xác từng chữ): <br />
              <span className="text-xs font-black text-slate-900 bg-white px-2 py-1.5 rounded border border-orange-300 inline-block mt-1 select-all tracking-wider">
                COC SAN {modalDetails?.groupId}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

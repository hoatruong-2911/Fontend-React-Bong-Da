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

// IMPORT SERVICES KHÁCH HÀNG
import customerFieldService, { Field } from "@/services/customer/fieldService";
import customerBookingService, {
  CreateBookingData,
} from "@/services/customer/bookingService";

dayjs.locale("vi");
const { Option } = Select;
const { Text } = Typography;

// --- CẤU HÌNH KHUNG GIỜ ĐỒNG BỘ VỚI STAFF ---
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

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fieldIdFromUrl = searchParams.get("fieldId");
  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [currentField, setCurrentField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]); // Danh sách đơn chiếm dụng thực tế
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [isManualTime, setIsManualTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [manualTime, setManualTime] = useState({
    start: "17:30",
    end: "19:00",
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    note: "",
  });

  // 1. Tải danh sách sân
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const response = await customerFieldService.getFields();
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

  // 2. Tải lịch bận thực tế của 1 sân (FIELD SPECIFIC)
  const fetchFieldSchedule = useCallback(
    async (fieldId: number, selectedDate: Dayjs) => {
      try {
        setScheduleLoading(true);
        const dateStr = selectedDate.format("YYYY-MM-DD");
        // Gọi hàm getFieldSchedule mới ở Backend
        const response = await customerBookingService.getFieldSchedule(
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

  // ✅ HÀM TÍNH TRẠNG THÁI Ô GIỜ CHI TIẾT
  const getSlotStatus = (slotStart: string) => {
    const slotDateTime = dayjs(`${date?.format("YYYY-MM-DD")} ${slotStart}`);

    // 1. Kiểm tra HẾT HẠN (Quá khứ)
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

    // 2. Kiểm tra CHẾM CHỖ (Dùng logic Overlap như bên Staff)
    const booking = bookings.find((b: any) => {
      const [startH, startM] = b.start_time.split(":").map(Number);
      const [endH, endM] = b.end_time.split(":").map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      return slotTotalMinutes >= startTotal && slotTotalMinutes < endTotal;
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

    return {
      type: "available",
      label: "SẴN SÀNG",
      color: "#10b981",
      disabled: false,
    };
  };

  // --- LOGIC TÍNH TOÁN TIỀN (GIỮ NGUYÊN) ---
  const pricing = useMemo(() => {
    let durationInHours = 0;
    let startTimeStr = "";
    let endTimeStr = "";

    if (isManualTime) {
      const start = dayjs(manualTime.start, "HH:mm");
      const end = dayjs(manualTime.end, "HH:mm");
      durationInHours = end.diff(start, "minute") / 60;
      startTimeStr = manualTime.start;
      endTimeStr = manualTime.end;
    } else {
      if (selectedTime) {
        durationInHours = 1.5;
        startTimeStr = selectedTime;
        endTimeStr = dayjs(`2000-01-01 ${selectedTime}`)
          .add(90, "minute")
          .format("HH:mm");
      }
    }

    if (durationInHours <= 0 || !currentField) return null;
    const basePricePerHour = currentField.price || 0;
    const subTotal = basePricePerHour * durationInHours;
    const isNight = parseInt(startTimeStr.split(":")[0]) >= 20;
    const surcharge = isNight ? subTotal * 0.2 : 0;

    return {
      durationInHours,
      startTimeStr,
      endTimeStr,
      subTotal,
      surcharge,
      finalTotal: subTotal + surcharge,
    };
  }, [isManualTime, manualTime, selectedTime, currentField]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomerInfo({ ...customerInfo, phone: val });
    form.setFieldsValue({ phone: val });
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (!date || !currentField || !pricing) {
        message.warning("Vui lòng chọn thời gian đặt sân!");
        return;
      }
      setIsSubmitting(true);
      const bookingDateStr = date.format("YYYY-MM-DD");
      const bookingData: CreateBookingData = {
        field_id: currentField.id,
        start_time: `${bookingDateStr} ${pricing.startTimeStr}:00`,
        end_time: `${bookingDateStr} ${pricing.endTimeStr}:00`,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        notes: customerInfo.note,
      };
      await customerBookingService.createBooking(bookingData);
      message.success("Đặt sân thành công rực rỡ!");
      navigate("/fields");
    } catch (error: any) {
      if (error.errorFields) return;
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
              Đặt sân rực rỡ
            </h1>
            <p className="text-gray-500 m-0">
              Trải nghiệm hệ thống đặt sân chuyên nghiệp số 1
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

              {!isManualTime ? (
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
                            ${isSelected && !status.disabled ? "border-green-500 bg-green-50" : "border-gray-100"}
                          `}
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
                          disabledHours: () =>
                            date?.isSame(dayjs(), "day")
                              ? Array.from(
                                  { length: dayjs().hour() },
                                  (_, i) => i,
                                )
                              : [],
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
                            // Vô hiệu hóa các giờ nhỏ hơn giờ bắt đầu
                            disabledHours: () => {
                              const hours = [];
                              for (let i = 0; i < 24; i++) {
                                // Nếu là ngày hôm nay, chặn các giờ đã qua
                                if (
                                  date?.isSame(dayjs(), "day") &&
                                  i < dayjs().hour()
                                ) {
                                  hours.push(i);
                                }
                                // Luôn chặn các giờ nhỏ hơn giờ bắt đầu đã chọn
                                if (i < startTime.hour()) {
                                  hours.push(i);
                                }
                              }
                              return [...new Set(hours)]; // Loại bỏ trùng lặp
                            },
                            // Vô hiệu hóa các phút nhỏ hơn phút bắt đầu nếu cùng giờ
                            disabledMinutes: (selectedHour) => {
                              const minutes = [];
                              if (selectedHour === startTime.hour()) {
                                for (let i = 0; i <= startTime.minute(); i++) {
                                  minutes.push(i);
                                }
                              }
                              // Chặn thêm phút của giờ hiện tại nếu là ngày hôm nay
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
                  <Text
                    type="secondary"
                    className="text-[10px] mt-2 block italic text-orange-500"
                  >
                    * Vui lòng đối chiếu bảng trạng thái phía trên để tránh chọn
                    trùng giờ đã bận.
                  </Text>
                </div>
              )}
            </CustomCard>

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
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
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
          </Col>

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
                    <div className="text-[10px] text-gray-400 font-bold uppercase">
                      Xác nhận rực rỡ
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  disabled={!pricing}
                  className="h-16 rounded-[20px] bg-gradient-to-r from-green-500 to-emerald-600 border-none font-black italic uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  XÁC NHẬN ĐẶT SÂN
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

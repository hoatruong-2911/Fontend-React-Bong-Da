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
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckOutlined,
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
const { Text, Title } = Typography;

// --- INTERFACES ---
interface TimeSlot {
  start_time: string;
  end_time: string;
  price: number;
  status: "available" | "booked";
}

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

// Giao diện Card chuẩn Admin rực rỡ
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
  const [form] = Form.useForm(); // Khai báo form để validate báo đỏ

  // --- STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [currentField, setCurrentField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Logic chọn giờ chuẩn Admin
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

  // 1. Tải danh sách sân (Khách hàng)
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

  // 2. Tải lịch sân (Khách hàng)
  const fetchSchedule = useCallback(
    async (fieldId: number, selectedDate: Dayjs) => {
      try {
        setScheduleLoading(true);
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const response = await customerFieldService.getSchedule(
          fieldId,
          dateStr,
        );
        const data = response.data?.data || response.data || [];
        setTimeSlots(data);
      } catch (error) {
        console.error("Lỗi tải lịch sân.");
      } finally {
        setScheduleLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (currentField && date && !isManualTime)
      fetchSchedule(currentField.id, date);
  }, [currentField?.id, date, fetchSchedule, isManualTime]);

  // --- LOGIC TÍNH TOÁN TIỀN CHUẨN ADMIN ---
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
      const slot = timeSlots.find((t) => t.start_time === selectedTime);
      if (slot) {
        durationInHours = 1.5; // Ca mặc định 90 phút
        startTimeStr = slot.start_time;
        endTimeStr = slot.end_time;
      }
    }

    if (durationInHours <= 0 || !currentField) return null;

    const basePricePerHour = currentField.price || 0;
    const subTotal = basePricePerHour * durationInHours;

    // Phụ phí đêm nếu bắt đầu từ 20:00 trở đi (+20%)
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
  }, [isManualTime, manualTime, selectedTime, timeSlots, currentField]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomerInfo({ ...customerInfo, phone: val });
    form.setFieldsValue({ phone: val }); // Đồng bộ với Form Antd để validate
  };

  const handleSubmit = async () => {
    try {
      // Kích hoạt validate của Ant Design
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
      if (error.errorFields) return; // Nếu lỗi validate form thì dừng
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "Lỗi khi lưu dữ liệu.");
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
              description="Chọn theo ca cố định hoặc thời gian tự do"
            >
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg border border-gray-100 w-fit shadow-sm">
                <span
                  className={`text-sm ${
                    !isManualTime ? "font-bold text-green-600" : "text-gray-400"
                  }`}
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
                  className={`text-sm ${
                    isManualTime ? "font-bold text-green-600" : "text-gray-400"
                  }`}
                >
                  Tự chọn giờ
                </span>
              </div>

              {!isManualTime ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {timeSlots.map((slot) => {
                    const slotStart = dayjs(
                      `${date?.format("YYYY-MM-DD")} ${slot.start_time}`,
                    );

                    // 1. Kiểm tra giờ quá khứ (Cho phép trễ 5p tránh lag)
                    const isPast =
                      date?.isSame(dayjs(), "day") &&
                      slotStart.isBefore(dayjs().add(5, "minute"));

                    // 2. Ép kiểu về string để so sánh an toàn tuyệt đối
                    const isBooked = String(slot.status).trim() === "booked";

                    // 🛑 BIẾN QUYẾT ĐỊNH: Nếu trùng lịch hoặc hết giờ đều khóa
                    const isDisabled = isBooked || isPast;

                    return (
                      <div
                        key={slot.start_time}
                        onClick={() =>
                          !isDisabled && setSelectedTime(slot.start_time)
                        } // Không cho click nếu disabled
                        className={`relative p-4 border-2 rounded-xl transition-all text-center
        ${
          isDisabled
            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
            : "bg-white hover:border-green-400 cursor-pointer shadow-sm"
        }
        ${selectedTime === slot.start_time && !isDisabled ? "border-green-500 bg-green-50" : "border-gray-100"}`}
                      >
                        <ClockCircleOutlined
                          className={
                            isDisabled ? "text-gray-400" : "text-green-500"
                          }
                        />
                        <div
                          className={`font-bold mt-1 italic uppercase text-xs ${isDisabled ? "text-gray-400" : "text-gray-800"}`}
                        >
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div
                          className={`text-xs mt-1 font-black ${isDisabled ? "text-red-400" : "text-green-600"}`}
                        >
                          {/* HIỂN THỊ CHỮ THEO ĐÚNG TRẠNG THÁI */}
                          {isBooked
                            ? "ĐÃ ĐẶT"
                            : isPast
                              ? "HẾT GIỜ"
                              : `${slot.price.toLocaleString()}đ`}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        // Khóa giờ trong quá khứ cho TimePicker
                        disabledTime={() => ({
                          disabledHours: () => {
                            if (!date?.isSame(dayjs(), "day")) return [];
                            return Array.from(
                              { length: dayjs().hour() },
                              (_, i) => i,
                            );
                          },
                          disabledMinutes: (selectedHour) => {
                            if (
                              !date?.isSame(dayjs(), "day") ||
                              selectedHour > dayjs().hour()
                            )
                              return [];
                            return Array.from(
                              { length: dayjs().minute() },
                              (_, i) => i,
                            );
                          },
                        })}
                        onChange={(t) =>
                          setManualTime({
                            ...manualTime,
                            start: t?.format("HH:mm") || "07:00",
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
                        onChange={(t) =>
                          setManualTime({
                            ...manualTime,
                            end: t?.format("HH:mm") || "08:30",
                          })
                        }
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </CustomCard>

            <CustomCard
              title="Thông tin liên hệ"
              step={3}
              description="Để chúng tôi xác nhận đặt sân"
            >
              {/* Sử dụng Form Ant Design để validate báo đỏ rực rỡ */}
              <Form form={form} layout="vertical" initialValues={customerInfo}>
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
                <div className="text-center text-[10px] text-gray-400 font-black italic uppercase">
                  🔒 Bảo mật & An toàn 100%
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

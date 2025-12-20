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

// IMPORT SERVICES
import adminFieldService from "@/services/admin/fieldService";
import adminBookingService from "@/services/admin/bookingService";
import { Field } from "@/services/admin/fieldService";

dayjs.locale("vi");
const { Option } = Select;

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomCard = ({ title, step, description, children }: any) => (
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

  // --- STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [currentField, setCurrentField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Logic chọn giờ
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

  // 2. Tải lịch sân (Chỉ dùng cho chế độ Theo ca)
  const fetchSchedule = useCallback(
    async (fieldId: number, selectedDate: Dayjs) => {
      try {
        setScheduleLoading(true);
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const response = await adminBookingService.getSchedule(
          fieldId,
          dateStr
        );
        if (response.success) setTimeSlots(response.data);
      } catch (error) {
        console.error("Lỗi tải lịch sân.");
      } finally {
        setScheduleLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentField && date && !isManualTime)
      fetchSchedule(currentField.id, date);
  }, [currentField?.id, date, fetchSchedule, isManualTime]);

  // --- LOGIC TÍNH TOÁN TIỀN ---
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

    if (durationInHours <= 0) return null;

    const basePricePerHour = currentField?.price || 0;
    const subTotal = basePricePerHour * durationInHours;

    // Phụ phí đêm nếu bắt đầu từ 20:00 trở đi
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
    setCustomerInfo({
      ...customerInfo,
      phone: e.target.value.replace(/[^0-9]/g, ""),
    });
  };

  const handleSubmit = async () => {
    if (
      !date ||
      !currentField ||
      !pricing ||
      !customerInfo.name ||
      !customerInfo.phone
    ) {
      message.warning("Vui lòng nhập đầy đủ thông tin và thời gian!");
      return;
    }

    setIsSubmitting(true);
    const bookingDateStr = date.format("YYYY-MM-DD");
    const bookingData = {
      field_id: currentField.id,
      start_time: `${bookingDateStr} ${pricing.startTimeStr}:00`,
      end_time: `${bookingDateStr} ${pricing.endTimeStr}:00`,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      notes: customerInfo.note,
    };

    try {
      const response = await adminBookingService.createBooking(bookingData);
      if (response.success) {
        message.success("Đặt sân thành công!");
        navigate("/admin/bookings");
      }// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => navigate("/admin/bookings")}
          />
          <div>
            <h1 className="text-2xl font-bold m-0">Tạo đặt sân mới</h1>
            <p className="text-gray-500 m-0">
              Quản lý đặt sân linh hoạt cho khách hàng
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
                    className="w-full"
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
                    className="w-full"
                    value={currentField?.id}
                    onChange={(id) =>
                      setCurrentField(
                        allFields.find((f) => f.id === id) || null
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
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg border border-gray-100 w-fit">
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
                    const isBooked = slot.status === "booked";
                    const isSelected = selectedTime === slot.start_time;
                    return (
                      <div
                        key={slot.start_time}
                        onClick={() =>
                          !isBooked && setSelectedTime(slot.start_time)
                        }
                        className={`relative p-4 border rounded-xl cursor-pointer transition-all text-center
                          ${
                            isBooked
                              ? "bg-gray-50 border-gray-100 cursor-not-allowed"
                              : "bg-white hover:border-green-400 shadow-sm"
                          }
                          ${
                            isSelected
                              ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                              : "border-gray-200"
                          }`}
                      >
                        <ClockCircleOutlined
                          className={
                            isBooked ? "text-gray-300" : "text-gray-500"
                          }
                        />
                        <div
                          className={`font-bold mt-1 ${
                            isBooked ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-sm mt-1 font-semibold">
                          {isBooked
                            ? "Đã đặt"
                            : `${slot.price.toLocaleString()}đ`}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-2 text-green-600">
                            <CheckOutlined style={{ fontSize: 12 }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <Row gutter={24}>
                    <Col span={12}>
                      <p className="mb-2 font-medium">Giờ bắt đầu *</p>
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        size="large"
                        className="w-full"
                        value={dayjs(manualTime.start, "HH:mm")}
                        onChange={(t) =>
                          setManualTime({
                            ...manualTime,
                            start: t?.format("HH:mm") || "07:00",
                          })
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <p className="mb-2 font-medium">Giờ kết thúc *</p>
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        size="large"
                        className="w-full"
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
              title="Thông tin khách hàng"
              step={3}
              description="Người đặt sân"
            >
              <Space direction="vertical" className="w-full" size="middle">
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Tên khách hàng"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
                <Input
                  size="large"
                  prefix={<PhoneOutlined />}
                  placeholder="Số điện thoại"
                  value={customerInfo.phone}
                  onChange={handlePhoneChange}
                />
                <Input.TextArea
                  placeholder="Ghi chú..."
                  rows={3}
                  value={customerInfo.note}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, note: e.target.value })
                  }
                />
              </Space>
            </CustomCard>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <span className="text-lg font-bold">Tổng kết đặt sân</span>
              }
              className="sticky top-24 shadow-md border-none"
              style={{ borderRadius: 12 }}
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Đơn giá sân:</span>
                  <span className="font-medium">
                    {currentField?.price.toLocaleString()}đ/h
                  </span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Thời lượng:</span>
                  <span className="font-bold">
                    {pricing?.durationInHours.toFixed(1)} giờ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Khung giờ:</span>
                  <span
                    className={`font-medium ${
                      pricing?.surcharge ? "text-orange-500" : ""
                    }`}
                  >
                    {pricing
                      ? `${pricing.startTimeStr} - ${pricing.endTimeStr}`
                      : "--:--"}
                  </span>
                </div>

                <Divider className="my-1" style={{ borderStyle: "dashed" }} />

                {pricing && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>
                        Tiền gốc ({currentField?.price.toLocaleString()}đ x{" "}
                        {pricing.durationInHours.toFixed(1)}h):
                      </span>
                      <span>{pricing.subTotal.toLocaleString()}đ</span>
                    </div>
                    {pricing.surcharge > 0 && (
                      <div className="flex justify-between text-orange-500 font-medium">
                        <span className="flex items-center gap-1">
                          <InfoCircleOutlined style={{ fontSize: 12 }} /> Phụ
                          phí đêm (+20%):
                        </span>
                        <span>{pricing.surcharge.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">TỔNG CỘNG</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-600">
                      {pricing?.finalTotal.toLocaleString() || 0}đ
                    </span>
                    <div className="text-xs text-gray-400">
                      Giá cuối cùng xác nhận
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
                  style={{
                    height: 54,
                    borderRadius: 10,
                    backgroundColor: "#62B462",
                    borderColor: "#62B462",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
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

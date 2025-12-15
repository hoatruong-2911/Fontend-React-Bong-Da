import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Checkbox,
  DatePicker,
  Divider,
  message,
  Space,
  Tag,
  Spin,
  Select,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  LeftOutlined,
  TagOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

// ⬅️ IMPORTS SERVICE VÀ INTERFACE
import customerBookingService, {
  CreateBookingData,
} from "../../services/customer/bookingService";
import customerFieldService, {
  Field,
} from "../../services/customer/fieldService";

dayjs.locale("vi");
const { Option } = Select;

// --- INTERFACES VÀ DỮ LIỆU ---

interface TimeSlot {
  start_time: string;
  end_time: string;
  price: number;
  status: "available" | "booked";
}

interface EquipmentItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  note: string;
}

const equipment: EquipmentItem[] = [
  { id: "ball", name: "Bóng đá", price: 50000, icon: "⚽" },
  { id: "jersey", name: "Áo đấu (bộ)", price: 150000, icon: "👕" },
  { id: "water", name: "Nước uống (thùng)", price: 100000, icon: "💧" },
  { id: "shoes", name: "Giày đá bóng", price: 80000, icon: "👟" },
  { id: "vest", name: "Áo training (10 chiếc)", price: 120000, icon: "🎽" },
];

const initialField: Field = {
  id: 0,
  name: "",
  size: 0,
  location: "",
  price: 0,
  type: "",
  rating: 0,
  reviews_count: 0,
  available: false,
  is_vip: false,
  surface: "",
  description: "",
  image: "",
  features: [],
};

// --- CUSTOM CARD COMPONENT (ĐỊNH NGHĨA NGOÀI COMPONENT CHÍNH) ---

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
  <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "#62B462",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {step}
        </div>
        <h3
          style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#2B2B2B" }}
        >
          {title}
        </h3>
      </div>
      <p style={{ margin: 0, marginLeft: 40, color: "#8E8E8E", fontSize: 14 }}>
        {description}
      </p>
    </div>
    {children}
  </Card>
);

// --- LABEL WRAPPER COMPONENT (ĐỊNH NGHĨA NGOÀI COMPONENT CHÍNH) ---

interface LabelWrapperProps {
  htmlFor: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const LabelWrapper = ({
  htmlFor,
  required,
  icon,
  children,
}: LabelWrapperProps) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      fontWeight: 500,
      color: "#2B2B2B",
    }}
  >
    {icon}
    {children}
    {required && <span style={{ color: "#ff4d4f" }}>*</span>}
  </label>
);

// --- COMPONENT CHÍNH ---

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy ID sân từ query parameter 'fieldId'
  const fieldIdFromUrl = searchParams.get("fieldId");

  // --- STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const [currentField, setCurrentField] = useState<Field>(initialField);
  const [fieldLoading, setFieldLoading] = useState(true);

  // THÊM STATE DANH SÁCH TẤT CẢ SÂN
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [allFieldsLoading, setAllFieldsLoading] = useState(false);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "email@example.com",
    note: "",
  });

  // --- API HANDLERS ---

  // 0. Load Danh sách TẤT CẢ SÂN và Chọn Sân ban đầu
  useEffect(() => {
    const fetchAllFields = async (callbackId: number | null) => {
      try {
        setAllFieldsLoading(true);

        // Tải danh sách sân
        const response = await customerFieldService.getFields();
        const fieldsArray = response.data?.data || response.data;

        if (Array.isArray(fieldsArray)) {
          setAllFields(fieldsArray);

          let targetField = null;

          // 1. Nếu có ID từ URL, tìm và đặt sân đó
          if (callbackId) {
            targetField = fieldsArray.find((f) => f.id === callbackId);
            if (!targetField) {
              message.error("Sân được chọn không khả dụng.");
            }
          }

          // 2. Nếu không có ID hoặc sân không khả dụng, chọn sân đầu tiên
          if (!targetField && fieldsArray.length > 0) {
            targetField = fieldsArray[0];
          }

          // CẬP NHẬT SÂN HIỆN TẠI MỘT LẦN DUY NHẤT
          if (targetField && currentField.id !== targetField.id) {
            setCurrentField(targetField);
          }
        }
      } catch (error) {
        message.error("Lỗi tải danh sách sân.");
        console.error("Lỗi tải danh sách sân:", error);
      } finally {
        setAllFieldsLoading(false);
        setFieldLoading(false);
      }
    };

    const id = fieldIdFromUrl ? parseInt(fieldIdFromUrl, 10) : null;
    // Gọi hàm fetch, chỉ phụ thuộc vào fieldIdFromUrl để tránh lặp vô hạn
    fetchAllFields(id);
  }, [fieldIdFromUrl]);

  // 1. Load Lịch Trống (Chạy khi Sân hoặc Ngày thay đổi)
  const fetchSchedule = useCallback(
    async (fieldId: number, selectedDate: Dayjs) => {
      try {
        setScheduleLoading(true);
        setSelectedTime(null);

        const dateStr = selectedDate.format("YYYY-MM-DD");
        const response = await customerFieldService.getSchedule(
          fieldId,
          dateStr
        );

        setTimeSlots(response.data.data || response.data || []);
      } catch (error) {
        console.error("Lỗi tải lịch sân:", error);
        message.error("Không thể tải lịch trống cho ngày này.");
        setTimeSlots([]);
      } finally {
        setScheduleLoading(false);
      }
    },
    []
  );

  // Tự động load lịch khi Field ID (của sân hiện tại) hoặc Ngày thay đổi
  useEffect(() => {
    const id = currentField.id;
    if (id !== 0 && date) {
      fetchSchedule(id, date);
    }
  }, [currentField.id, date, fetchSchedule]);

  // --- MEMO/CALCULATIONS ---

  const selectedTimeSlot = useMemo(
    () => timeSlots.find((t) => t.start_time === selectedTime),
    [selectedTime, timeSlots]
  );

  const fieldPrice = selectedTimeSlot?.price || 0;

  const equipmentPrice = useMemo(() => {
    return selectedEquipment.reduce((total, eqId) => {
      const eq = equipment.find((e) => e.id === eqId);
      return total + (eq?.price || 0);
    }, 0);
  }, [selectedEquipment]);

  const totalPrice = fieldPrice + equipmentPrice;

  // --- HANDLERS ---

  // Xử lý khi chọn sân từ dropdown
  const handleFieldChange = (fieldId: number) => {
    const newField = allFields.find((f) => f.id === fieldId);
    if (newField) {
      setCurrentField(newField);
    }
  };

  const handleEquipmentToggle = (equipmentId: string, checked: boolean) => {
    setSelectedEquipment((prev) =>
      checked ? [...prev, equipmentId] : prev.filter((id) => id !== equipmentId)
    );
  };

  const handleSubmit = async () => {
    if (
      !date ||
      currentField.id === 0 ||
      !selectedTimeSlot ||
      !customerInfo.name ||
      !customerInfo.phone
    ) {
      message.error(
        "Vui lòng điền đầy đủ thông tin đặt sân (Ngày, Sân, Giờ, Tên, SĐT)!"
      );
      return;
    }

    setIsSubmitting(true);

    // TÍNH TOÁN DATETIME ĐẦY ĐỦ CHO BACKEND
    const bookingDateStr = date.format("YYYY-MM-DD");
    const startTimeFull = dayjs(
      `${bookingDateStr} ${selectedTimeSlot.start_time}`
    ).format("YYYY-MM-DD HH:mm:ss");
    const endTimeFull = dayjs(
      `${bookingDateStr} ${selectedTimeSlot.end_time}`
    ).format("YYYY-MM-DD HH:mm:ss");

    const bookingData: CreateBookingData = {
      field_id: currentField.id,
      start_time: startTimeFull,
      end_time: endTimeFull,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      notes: customerInfo.note,
    };

    try {
      const response = await customerBookingService.createBooking(bookingData);

      message.success(
        response.message || `Đặt sân ${currentField.name} thành công!`
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi đặt sân: Vui lòng kiểm tra giờ và thông tin.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER CHECKS ---
  if (fieldLoading && allFieldsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" tip="Đang tải danh sách sân..." />
      </div>
    );
  }

  if (currentField.id === 0 && !allFieldsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Không tìm thấy sân bóng nào khả dụng</h2>
        <Button
          type="primary"
          onClick={() => navigate("/fields")}
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách sân
        </Button>
      </div>
    );
  }

  // --- JSX RENDER ---
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          borderBottom: "1px solid #EDEDED",
          padding: "16px 0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={<LeftOutlined style={{ fontSize: 16 }} />}
              onClick={() => navigate(`/fields/${currentField.id}`)}
              style={{ color: "#5F5F5F", fontSize: 16, height: "auto" }}
            />
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                  color: "#2B2B2B",
                }}
              >
                Đặt sân bóng
              </h1>
              <p style={{ margin: 0, color: "#8E8E8E", fontSize: 14 }}>
                Chọn sân và thời gian phù hợp
              </p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}
          className="booking-grid"
        >
          {/* Cột trái - Form đặt sân */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* 1. Chọn ngày (Giữ nguyên) */}
            <CustomCard
              title="Chọn ngày"
              step={1}
              description="Chọn ngày bạn muốn đặt sân"
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    padding: "8px 12px",
                    borderRadius: 8,
                    borderColor: "#D9D9D9",
                  }}
                />
              </div>
              {date && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: "#F0F9F0",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CalendarOutlined style={{ color: "#62B462" }} />
                  <span style={{ fontWeight: 600, color: "#2B2B2B" }}>
                    {date.format("dddd, DD/MM/YYYY")}
                  </span>
                </div>
              )}
            </CustomCard>

            {/* 2. Chọn/Xem Sân */}
            <CustomCard
              title="Chọn sân"
              step={2}
              description="Chọn sân bạn muốn đặt"
            >
              {allFieldsLoading ? (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <Spin tip="Đang tải danh sách sân..." size="default" />
                </div>
              ) : (
                <>
                  {/* DROPDOWN CHỌN SÂN */}
                  <Select
                    size="large"
                    value={currentField.id === 0 ? undefined : currentField.id}
                    placeholder="Chọn sân..."
                    onChange={handleFieldChange}
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    {allFields.map((f) => (
                      <Option key={f.id} value={f.id}>
                        {f.name} ({f.size} người) - {f.location}
                      </Option>
                    ))}
                  </Select>

                  {currentField.id !== 0 && (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        border: "2px solid #62B462",
                        backgroundColor: "#F0F9F0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <EnvironmentOutlined
                              style={{ color: "#62B462", fontSize: 16 }}
                            />
                            <h3
                              style={{
                                fontWeight: 600,
                                margin: 0,
                                color: "#2B2B2B",
                              }}
                            >
                              {currentField.name}
                            </h3>
                          </div>
                          <div style={{ fontSize: 13, color: "#8E8E8E" }}>
                            Khu vực: {currentField.location} | Quy mô:{" "}
                            {currentField.size} người
                          </div>
                        </div>
                        <div style={{ textAlign: "right", marginLeft: 16 }}>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "#62B462",
                            }}
                          >
                            {currentField.price.toLocaleString("vi-VN")}đ
                          </div>
                          <div style={{ fontSize: 12, color: "#8E8E8E" }}>
                            /giờ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <Divider style={{ margin: "16px 0 0 0" }} />
              <Button
                type="link"
                onClick={() => navigate("/fields")}
                style={{ paddingLeft: 0, color: "#1890ff" }}
              >
                Xem chi tiết tất cả sân
              </Button>
            </CustomCard>

            {/* 3. Chọn giờ (SỬ DỤNG DỮ LIỆU API CHO TIME SLOTS) */}
            <CustomCard
              title="Chọn giờ"
              step={3}
              description={
                scheduleLoading
                  ? "Đang tải lịch trống..."
                  : "Chọn khung giờ phù hợp"
              }
            >
              {currentField.id === 0 ? (
                <div
                  style={{ textAlign: "center", padding: 30, color: "#8E8E8E" }}
                >
                  Vui lòng chọn sân ở Bước 2 để xem lịch.
                </div>
              ) : scheduleLoading ? (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <Spin tip="Đang tải lịch..." size="large" />
                </div>
              ) : timeSlots.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 12,
                  }}
                >
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.start_time;
                    const isDisabled = slot.status === "booked";
                    const slotPrice = slot.price.toLocaleString("vi-VN");

                    return (
                      <Button
                        key={slot.start_time}
                        onClick={() =>
                          !isDisabled && setSelectedTime(slot.start_time)
                        }
                        disabled={isDisabled}
                        style={{
                          height: "auto",
                          padding: "10px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          opacity: isDisabled ? 0.6 : 1,
                          position: "relative",
                          borderRadius: 8,
                          border: isSelected
                            ? "1px solid #62B462"
                            : "1px solid #E0E0E0",
                          backgroundColor: isSelected ? "#F0F9F0" : "#fff",
                          color: isSelected ? "#62B462" : "#2B2B2B",
                        }}
                      >
                        <ClockCircleOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: isDisabled ? "red" : "#000",
                            fontWeight: 600,
                          }}
                        >
                          {isDisabled ? "Đã đặt" : slotPrice + "đ"}
                        </span>
                        {isSelected && (
                          <CheckOutlined
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              color: "#62B462",
                              fontSize: 14,
                            }}
                          />
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{ textAlign: "center", padding: 30, color: "#8E8E8E" }}
                >
                  Không có khung giờ trống nào cho ngày này.
                </div>
              )}
            </CustomCard>

            {/* 4. Đồ dùng thêm (Giữ nguyên) */}
            <CustomCard
              title="Đồ dùng thêm"
              step={4}
              description="Chọn đồ dùng bạn muốn thuê thêm"
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {equipment.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      border: selectedEquipment.includes(item.id)
                        ? "1px solid #62B462"
                        : "1px solid #E0E0E0",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor: selectedEquipment.includes(item.id)
                        ? "#F0F9F0"
                        : "#fff",
                    }}
                    onClick={() =>
                      handleEquipmentToggle(
                        item.id,
                        !selectedEquipment.includes(item.id)
                      )
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <Checkbox checked={selectedEquipment.includes(item.id)} />
                      <span style={{ fontSize: 24 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: "#2B2B2B" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 13, color: "#8E8E8E" }}>
                          {item.price.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                    {selectedEquipment.includes(item.id) && (
                      <CheckOutlined
                        style={{ color: "#62B462", fontSize: 18 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CustomCard>

            {/* 5. Thông tin liên hệ (Giữ nguyên) */}
            <CustomCard
              title="Thông tin liên hệ"
              step={5}
              description="Điền thông tin để chúng tôi xác nhận đặt sân"
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <LabelWrapper htmlFor="name" required icon={<UserOutlined />}>
                    Họ và tên
                  </LabelWrapper>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Space>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <LabelWrapper
                    htmlFor="phone"
                    required
                    icon={<PhoneOutlined />}
                  >
                    Số điện thoại
                  </LabelWrapper>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Space>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <LabelWrapper htmlFor="email" icon={<MailOutlined />}>
                    Email
                  </LabelWrapper>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Space>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <LabelWrapper htmlFor="note" icon={<TagOutlined />}>
                    Ghi chú
                  </LabelWrapper>
                  <Input.TextArea
                    id="note"
                    placeholder="Ghi chú thêm (không bắt buộc)"
                    value={customerInfo.note}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, note: e.target.value })
                    }
                    rows={3}
                    style={{ borderRadius: 8 }}
                  />
                </Space>
              </div>
            </CustomCard>
          </div>

          {/* Cột phải - Tổng kết (Giữ nguyên giao diện) */}
          <div>
            <Card
              title="Tổng kết đặt sân"
              style={{
                position: "sticky",
                top: 100,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Ngày */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#8E8E8E" }}>Ngày đặt</span>
                  <span style={{ fontWeight: 500 }}>
                    {date ? date.format("DD/MM/YYYY") : "-"}
                  </span>
                </div>

                {/* Sân */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#8E8E8E" }}>Sân</span>
                  <span style={{ fontWeight: 500 }}>
                    {currentField.name || "-"}
                  </span>
                </div>

                {/* Giờ */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#8E8E8E" }}>Khung giờ</span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedTimeSlot
                      ? `${selectedTimeSlot.start_time} - ${selectedTimeSlot.end_time}`
                      : "-"}
                  </span>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                {/* Giá sân */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#8E8E8E" }}>Tiền sân</span>
                  <span style={{ fontWeight: 500 }}>
                    {fieldPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {/* Đồ dùng */}
                {selectedEquipment.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#8E8E8E" }}>Đồ dùng thêm</span>
                    <span style={{ fontWeight: 500 }}>
                      {equipmentPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                <Divider style={{ margin: "8px 0" }} />

                {/* Tổng */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 600 }}>
                    Tổng cộng
                  </span>
                  <span
                    style={{ fontSize: 24, fontWeight: 700, color: "#62B462" }}
                  >
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {/* Nút đặt */}
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={
                    isSubmitting || !selectedTimeSlot || currentField.id === 0
                  }
                  style={{
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600,
                    backgroundColor: "#62B462",
                    borderColor: "#62B462",
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                >
                  {isSubmitting ? "Đang xác nhận..." : "Xác nhận đặt sân"}
                </Button>

                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "#8E8E8E",
                    lineHeight: 1.6,
                  }}
                >
                  Đặt cọc 30% để giữ sân
                  <br />
                  Hủy trước 4 giờ để được hoàn tiền
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
                @media (max-width: 768px) {
                    .booking-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
    </div>
  );
}

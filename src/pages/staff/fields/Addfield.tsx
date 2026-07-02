import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  message,
  FormInstance,
  Row,
  Col,
  Divider,
  Switch,
  TimePicker,
  Card,
  Select,
  Radio,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState, useEffect } from "react";
import staffBookingService, { // 🚨 ĐÂY LÀ NGUYÊN NHÂN GỐC RỄ CỦA VẤN ĐỀ
  Booking,
  FieldInfo,
} from "@/services/staff/bookingService"; // 🚨 SỬA LẠI: Tên file thật là bookingService, không phải staffBookingService

const { Text, Title } = Typography;
const { Option } = Select;

interface AddFieldProps {
  open: boolean;
  onCancel: () => void;
  date: Dayjs;
  onSuccess: () => void;
  form: FormInstance;
  selectedField: FieldInfo | null;
}

export default function Addfield({
  open,
  onCancel,
  date,
  onSuccess,
  form,
}: AddFieldProps) {
  const [isManualTime, setIsManualTime] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // CÁC STATE QUẢN LÝ NGHIỆP VỤ DÒNG TIỀN TẠI QUẦY
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringMonths, setRecurringMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank">("cash");
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showInvoicePrint, setShowInvoicePrint] = useState<boolean>(false);
  const [printData, setPrintData] = useState<any>(null);

  // Xem ngày đang chọn là hôm nay hay tương lai
  const isToday = useMemo(() => date.isSame(dayjs(), "day"), [date]);

  // Watch các giá trị từ Form Antd
  const fieldPrice = Form.useWatch("fieldPrice", form);
  const startTimeStr = Form.useWatch("start_time", form);
  const manualEnd = Form.useWatch("manual_end", form);

  // Tính khoảng cách từ giờ hiện tại đến thời điểm bắt đầu ca đá (tiếng)
  const hoursDiff = useMemo(() => {
    if (!startTimeStr) return 0;
    const bookingStart = dayjs(`${date.format("YYYY-MM-DD")} ${startTimeStr}`);
    return bookingStart.diff(dayjs(), "hour", true);
  }, [date, startTimeStr]);

  // Ép trạng thái nếu ca đá bắt đầu trong vòng 24h tới thì bắt buộc thanh toán đủ
  useEffect(() => {
    if (hoursDiff < 24) {
      setPaymentType("full");
    }
  }, [hoursDiff, open]);

  // BIỂU THỨC TÍNH TOÁN GIÁ TIỀN & TIỀN CỌC ĐỒNG BỘ
  const pricing = useMemo(() => {
    if (!fieldPrice || !startTimeStr) return null;

    let durationInHours = 1.5;
    let endTimeStr = dayjs(`2000-01-01 ${startTimeStr}`)
      .add(90, "minute")
      .format("HH:mm");

    if (startTimeStr === "22:30") {
      durationInHours = 1.0;
      endTimeStr = "23:30";
    }

    if (isManualTime && manualEnd) {
      const start = dayjs(`2000-01-01 ${startTimeStr}`);
      const end = dayjs(`2000-01-01 ${manualEnd.format("HH:mm")}`);
      durationInHours = end.diff(start, "minute") / 60;
      endTimeStr = manualEnd.format("HH:mm");
    }

    if (durationInHours <= 0) return null;

    const basePricePerHour = fieldPrice;
    const sessionPrice = basePricePerHour * durationInHours;
    const isNight = parseInt(startTimeStr.split(":")[0]) >= 20;
    const surchargePerSession = isNight ? sessionPrice * 0.2 : 0;
    const singleSessionTotal = sessionPrice + surchargePerSession;

    const totalSessions = isRecurring ? recurringMonths * 4 : 1;
    const finalTotal = singleSessionTotal * totalSessions;

    // Số tiền thực tế cần thu tại quầy dựa vào nút chọn (Thu đủ 100% hoặc cọc 30%)
    const amountToPay =
      paymentType === "deposit" ? finalTotal * 0.3 : finalTotal;

    return {
      durationInHours,
      endTimeStr,
      singleSessionTotal,
      totalSessions,
      finalTotal,
      amountToPay,
    };
  }, [
    fieldPrice,
    startTimeStr,
    manualEnd,
    isManualTime,
    isRecurring,
    recurringMonths,
    paymentType,
  ]);

  // Tiền thừa trả khách
  const changeToGiveBack = useMemo(() => {
    if (!pricing) return 0;
    const diff = cashReceived - pricing.amountToPay;
    return diff > 0 ? diff : 0;
  }, [cashReceived, pricing]);

  // Tự động điền số tiền khách đưa bằng số tiền cần thanh toán ban đầu
  useEffect(() => {
    if (pricing) {
      setCashReceived(pricing.amountToPay);
    } else {
      setCashReceived(0);
    }
  }, [pricing?.amountToPay, open]);

  const handleFinish = async (values: any) => {
    if (!pricing) return;

    // 🚀 LOG CHẶN 1: Kiểm tra xem các nút bấm State hiện tại đang giữ giá trị gì
    console.log("=== [FRONTEND STEP 1: TRẠNG THÁI STATE] ===");
    console.log("Nút Payment Type chọn (full/deposit):", paymentType);
    console.log("Nút Payment Method chọn (cash/bank):", paymentMethod);
    console.log("Tiền khách đưa nhập vào ô tính thối:", cashReceived);

    // Chốt chặn validate tiền mặt
    if (paymentMethod === "cash") {
      const requiredAmount = pricing.amountToPay || 0;
      if (!cashReceived || cashReceived < requiredAmount) {
        message.error(
          `Số tiền khách đưa (${cashReceived.toLocaleString()}đ) phải bằng hoặc lớn hơn số tiền cần thu (${requiredAmount.toLocaleString()}đ) ní ơi!`
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const selectedDateStr = date.format("YYYY-MM-DD");
      let response;

      if (isRecurring) {
        // LUỒNG 1: ĐẶT CHUỖI ĐỊNH KỲ (Giữ nguyên)
        const recurringPayload = {
          field_id: values.field_id,
          start_date: selectedDateStr,
          number_of_months: recurringMonths,
          start_time: startTimeStr, // Sửa lại: Chỉ gửi HH:mm để khớp với Backend
          end_time: pricing.endTimeStr, // Sửa lại: Chỉ gửi HH:mm để khớp với Backend
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          notes: values.notes,
          payment_type: paymentType, // Truyền payment_type của đơn định kỳ tại quầy
        };

        // 🚀 LOG CHẶN 2A: In ra payload của Đơn Chuỗi
        console.log(
          ">>> [FRONTEND STEP 2A] Payload ĐƠN CHUỖI chuẩn bị đẩy lên Service:",
          recurringPayload,
        );

        response =
          await staffBookingService.createRecurringBooking(recurringPayload);
      } else {
        // LUỒNG 2: ĐẶT ĐƠN LẺ TẠI QUẦY
        let finalEndTime = `${selectedDateStr} ${pricing.endTimeStr}:00`;
        if (pricing.endTimeStr === "00:00")
          finalEndTime = `${selectedDateStr} 23:59:59`;

        const bookingPayload = {
          field_id: values.field_id,
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          booking_date: selectedDateStr,
          status: "approved", // 🚀 SỬA LẠI: Mọi đơn tạo tại quầy đều là "Đã duyệt", chờ nhân viên bấm "Bắt đầu"
          start_time: `${selectedDateStr} ${startTimeStr}:00`,
          end_time: finalEndTime,
          payment_type: paymentType, // Gửi "full" hoặc "deposit"
          notes: values.notes,
        };

        // 🚀 LOG CHẶN 2B: In ra payload của Đơn Lẻ
        console.log(
          ">>> [FRONTEND STEP 2B] Payload ĐƠN LẺ chuẩn bị đẩy lên Service:",
          bookingPayload,
        );

        response = await staffBookingService.createBooking(bookingPayload);
      }

      // 🚀 LOG CHẶN 3: In ra kết quả nhận về từ Server
      console.log(
        "<<< [FRONTEND STEP 3] Server phản hồi thành công! Data trả về thật:",
        response,
      );

      if (response.success || response.recurring_group_id || response.data) {
        // 🚀 FIX 1: THÊM THÔNG BÁO THÀNH CÔNG RỰC RỠ TẠI ĐÂY
        message.success(
          isRecurring
            ? "Tạo chuỗi đặt sân định kỳ thành công rực rỡ!"
            : "Tạo đơn đặt sân tại quầy thành công rực rỡ!"
        );

        // 🚀 FIX 2: NẠP DỮ LIỆU ĐỂ HIỂN THỊ VÀ IN BIÊN LAI (Hóa đơn hết trống trơn)
        setPrintData({
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          fieldName: values.fieldName || `Sân #${values.field_id}`,
          date: date.format("DD/MM/YYYY"),
          time: `${startTimeStr} - ${pricing.endTimeStr}`,
          type: isRecurring ? `Chuỗi định kỳ (${recurringMonths} tháng)` : (paymentType === "full" ? "Thanh toán đủ 100%" : "Cọc giữ chỗ 30%"),
          total: pricing.finalTotal || 0,
          toPay: pricing.amountToPay || 0,
          method: paymentMethod === "cash" ? "TIỀN MẶT" : "CHUYỂN KHOẢN",
          received: paymentMethod === "cash" ? cashReceived : (pricing.amountToPay || 0),
          back: paymentMethod === "cash" ? changeToGiveBack : 0,
        });

        setShowInvoicePrint(true);
      }
    } catch (error: any) {
      // 🚀 LOG CHẶN 4: In ra chi tiết nếu Server quăng lỗi (như lỗi 500 hoặc 422)
      console.error(
        "❌ [FRONTEND ERROR] Quá trình đẩy đơn lên Server thất bại kịch trần!",
      );
      console.error(
        "Chi tiết object lỗi nhận về từ Axios:",
        error.response?.data || error,
      );
      message.error(error.response?.data?.message || "Lỗi tạo đơn xử lý!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-capture");
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="font-black italic uppercase text-slate-700 text-xl border-b pb-2">
            ⚽ ĐIỀU PHỐI ĐẶT SÂN TẠI QUẦY
          </div>
        }
        open={open}
        onCancel={() => {
          setIsManualTime(false);
          setIsRecurring(false);
          setCashReceived(0);
          onCancel();
        }}
        footer={null}
        centered
        width={750}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ isManualTime: false }}
        >
          <Row gutter={24}>
            <Col span={13} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Text className="text-[9px] font-black uppercase text-slate-400 block">
                    Sân bóng
                  </Text>
                  <Form.Item name="fieldName" noStyle>
                    <Input
                      variant="borderless"
                      className="p-0 font-black text-emerald-600 uppercase text-xs"
                      readOnly
                    />
                  </Form.Item>
                  <Form.Item name="field_id" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="fieldPrice" hidden>
                    <Input />
                  </Form.Item>
                </div>
                <div className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Text className="text-[9px] font-black uppercase text-slate-400 block">
                    Giờ vào sân
                  </Text>
                  <Form.Item name="start_time" noStyle>
                    <Input
                      variant="borderless"
                      className="p-0 font-black text-blue-600 text-xs"
                      readOnly
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="p-3 bg-green-50/50 border border-dashed border-green-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-800">
                    Đặt cố định hàng tuần
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tự động sinh chuỗi lịch theo tháng cho khách quen
                  </div>
                </div>
                <Switch
                  checked={isRecurring}
                  onChange={(val) => {
                    setIsRecurring(val);
                  }}
                />
              </div>

              {isRecurring && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl animate-in fade-in duration-300">
                  <Text className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Thời lượng duy trì lịch chuỗi:
                  </Text>
                  <Select
                    className="w-full h-10"
                    value={recurringMonths}
                    onChange={setRecurringMonths}
                  >
                    <Option value={1}>1 Tháng (Gồm 4 buổi đá)</Option>
                    <Option value={3}>3 Tháng (Gồm 12 buổi đá)</Option>
                    <Option value={6}>6 Tháng (Gồm 24 buổi đá)</Option>
                  </Select>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-800">
                    Tự tùy chỉnh giờ kết thúc
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Mặc định hệ thống là ca 90 phút
                  </div>
                </div>
                <Switch
                  checked={isManualTime}
                  onChange={setIsManualTime}
                />
              </div>

              {isManualTime && (
                <Form.Item
                  name="manual_end"
                  label={
                    <span className="font-bold text-xs uppercase italic text-slate-600">
                      Giờ trả sân mong muốn *
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ nghỉ" },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    minuteStep={15}
                    className="w-full h-11 rounded-xl"
                    placeholder="Chọn giờ kết thúc..."
                    disabledTime={() => {
                      const startHour = startTimeStr ? parseInt(startTimeStr.split(":")[0]) : 4;
                      const startMinute = startTimeStr ? parseInt(startTimeStr.split(":")[1]) : 0;
                      return {
                        disabledHours: () => {
                          const hours = [0, 1, 2, 3, 4];
                          for (let i = 5; i < 24; i++) {
                            if (i < startHour) hours.push(i);
                          }
                          return [...new Set(hours)];
                        },
                        disabledMinutes: (selectedHour) => {
                          const minutes = [];
                          if (selectedHour === startHour) {
                            for (let i = 0; i <= startMinute; i++) {
                              minutes.push(i);
                            }
                          }
                          if (selectedHour === 23) {
                            for (let i = 31; i < 60; i++) {
                              minutes.push(i);
                            }
                          }
                          return [...new Set(minutes)];
                        },
                      };
                    }}
                  />
                </Form.Item>
              )}

              <Form.Item
                name="customer_name"
                label={
                  <span className="font-bold text-xs uppercase italic text-slate-600">
                    Họ tên khách hàng
                  </span>
                }
                rules={[
                  { required: true, message: "Không được bỏ trống tên khách" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-emerald-500" />}
                  size="large"
                  placeholder="Nhập tên đại diện đội..."
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item
                name="customer_phone"
                label={
                  <span className="font-bold text-xs uppercase italic text-slate-600">
                    Số điện thoại liên hệ
                  </span>
                }
                rules={[
                  { required: true, message: "Bắt buộc nhập số điện thoại" },
                  {
                    pattern: /^0[0-9]{9}$/,
                    message: "Định dạng SĐT phải có 10 chữ số",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-emerald-500" />}
                  size="large"
                  placeholder="Ví dụ: 0987654321"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>

            <Col span={11}>
              <Card className="bg-slate-50 border-none rounded-2xl h-full shadow-inner p-1">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <Text type="secondary">TRẢ SÂN:</Text>
                    <Text className="text-blue-600 font-black">
                      {pricing?.endTimeStr || "--:--"}
                    </Text>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <Text type="secondary">THỜI LƯỢNG:</Text>
                    <Text className="font-black">
                      {pricing?.durationInHours.toFixed(1)} Giờ / Buổi
                    </Text>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between text-xs font-bold text-purple-600">
                      <span>TỔNG SỐ BUỔI:</span>
                      <span className="font-black">
                        {pricing?.totalSessions} Buổi
                      </span>
                    </div>
                  )}

                  <Divider className="my-2 border-slate-200" />

                  <div className="space-y-1">
                    <Text className="text-[10px] font-black text-slate-400 uppercase italic">
                      Hạn mức thu tiền:
                    </Text>
                    <Radio.Group
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full flex"
                    >
                      <Radio.Button
                        value="full"
                        className="flex-1 text-center font-bold text-xs"
                      >
                        Trả đủ (100%)
                      </Radio.Button>
                      <Radio.Button
                        value="deposit"
                        className="flex-1 text-center font-bold text-xs text-red-500"
                        disabled={hoursDiff < 24}
                      >
                        Đặt cọc (30%)
                      </Radio.Button>
                    </Radio.Group>
                    {hoursDiff < 24 && (
                      <Text className="text-[9px] text-orange-500 italic block mt-1">
                        * Ca đá bắt đầu trong vòng 24h tới bắt buộc thanh toán đủ 100%
                      </Text>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <Text className="text-[10px] font-black text-slate-400 uppercase italic">
                      Hình thức thanh toán:
                    </Text>
                    <Radio.Group
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full flex"
                    >
                      <Radio.Button
                        value="cash"
                        className="flex-1 text-center font-bold text-xs"
                      >
                        💵 TIỀN MẶT
                      </Radio.Button>
                      <Radio.Button
                        value="bank"
                        className="flex-1 text-center font-bold text-xs"
                      >
                        🏦 CHUYỂN KHOẢN
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Tổng giá trị đơn:</span>
                      <span className="font-bold text-slate-800">
                        {pricing?.finalTotal.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black border-t pt-1.5 text-sm">
                      <span className="text-emerald-700">TIỀN CẦN THU:</span>
                      <span className="text-emerald-600">
                        {pricing?.amountToPay.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {paymentMethod === "cash" ? (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                      <Text className="text-[10px] font-black text-amber-700 uppercase block">
                        Trình tính tiền thối tại quầy:
                      </Text>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">
                          Khách đưa quầy:
                        </span>
                        <InputNumber
                          className="w-36 rounded-lg font-bold"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                          value={cashReceived}
                          onChange={(val) => setCashReceived(val || 0)}
                          placeholder="Nhập số tiền..."
                        />
                      </div>
                      <div className="flex justify-between items-center border-t border-amber-200 pt-1.5">
                        <span className="text-xs font-black text-amber-800">
                          TIỀN THỐI LẠI:
                        </span>
                        <span className="text-sm font-black text-red-600">
                          {changeToGiveBack.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  ) : (
                    pricing && (
                      <div className="p-2 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <img
                          src={`https://img.vietqr.io/image/MB-0372786250-compact2.png?amount=${pricing.amountToPay}&addInfo=${encodeURIComponent(`WALKIN SAN ${date.format("DDMM")}`)}&accountName=${encodeURIComponent("TRUONG THANH HOA")}`}
                          alt="Mã QR thanh toán tại quầy"
                          className="w-32 h-32 object-contain border border-dashed border-slate-300 p-1 rounded-lg"
                        />
                        <Text
                          type="secondary"
                          className="text-[9px] font-bold mt-1 text-blue-600"
                        >
                          Quét mã nhận tiền ngay tại quầy
                        </Text>
                      </div>
                    )
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={isSubmitting}
                    className="h-14 rounded-xl font-black italic uppercase bg-gradient-to-r from-emerald-600 to-green-600 border-none shadow-lg mt-2"
                  >
                    {isRecurring ? "TẠO CHUỖI ĐỊNH KỲ" : "XÁC NHẬN ĐẶT SÂN"}
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL BIÊN LAI HÓA ĐƠN IN NHIỆT */}
      <Modal
        title={
          <div className="font-black text-center text-slate-700 text-sm italic uppercase">
            <PrinterOutlined /> BIÊN LAI THANH TOÁN TẠI QUẦY
          </div>
        }
        open={showInvoicePrint}
        onOk={() => {
          setShowInvoicePrint(false);
          onSuccess();
        }}
        onCancel={() => {
          setShowInvoicePrint(false);
          onSuccess();
        }}
        okText="Hoàn thành & Đóng"
        cancelButtonProps={{ style: { display: "none" } }}
        width={400}
        centered
      >
        <div className="p-4 space-y-4">
          <div
            id="invoice-capture"
            className="p-4 bg-white text-slate-900 font-mono text-xs space-y-2 border border-slate-300 rounded-lg"
          >
            <div className="text-center font-black text-sm uppercase">
              WESPORT STADIUM
            </div>
            <div className="text-center text-[10px] text-slate-400">
              Hóa đơn bán sân tại quầy
            </div>
            <Divider className="my-1 border-slate-900 border-dashed" />
            <p>
              Khách hàng:{" "}
              <span className="font-bold">{printData?.customer_name}</span>
            </p>
            <p>
              Số điện thoại:{" "}
              <span className="font-bold">{printData?.customer_phone}</span>
            </p>
            <p>
              Sân chỉ định:{" "}
              <span className="font-bold uppercase text-emerald-700">
                {printData?.fieldName}
              </span>
            </p>
            <p>
              Ngày thi đấu: <span>{printData?.date}</span>
            </p>
            <p>
              Khung giờ:{" "}
              <span className="font-bold text-blue-600">{printData?.time}</span>
            </p>
            <p>
              Loại hóa đơn:{" "}
              <span className="font-bold italic text-red-600">
                {printData?.type}
              </span>
            </p>
            <Divider className="my-1 border-slate-900 border-dashed" />
            <div className="flex justify-between font-bold">
              <span>Tổng tiền sân:</span>
              <span>{printData?.total.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between font-black text-sm text-emerald-700">
              <span>THỰC THU QUẦY:</span>
              <span>{printData?.toPay.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span className="font-bold">{printData?.method}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền khách đưa:</span>
              <span>{printData?.received.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between font-bold text-red-500">
              <span>TIỀN THỐI LẠI:</span>
              <span>{printData?.back.toLocaleString()}đ</span>
            </div>
            <Divider className="my-1 border-slate-900 border-dashed" />
            <div className="text-center text-[9px] italic text-slate-400 font-sans">
              Cảm ơn quý khách đã tin tưởng lựa chọn sân bóng rực rỡ WESPORT!
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PrinterOutlined />}
            block
            onClick={handlePrint}
            className="bg-slate-800 border-none font-bold h-12 rounded-xl"
          >
            BẤM IN HÓA ĐƠN (PRINT)
          </Button>
        </div>
      </Modal>
    </>
  );
}

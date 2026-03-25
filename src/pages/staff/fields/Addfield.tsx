import { Modal, Form, Input, Button, Typography, message, FormInstance, Row, Col, Divider, Switch, TimePicker, Card } from "antd";
import { UserOutlined, PhoneOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState, useEffect } from "react";
import staffBookingService, { Booking, FieldInfo } from "@/services/staff/staffBookingService";
import { Space } from "lucide-react";

const { Text } = Typography;

interface AddFieldProps {
  open: boolean;
  onCancel: () => void;
  date: Dayjs;
  onSuccess: () => void;
  form: FormInstance;
  selectedField: FieldInfo | null;
}

interface AddFieldFormValues {
  field_id: number;
  fieldName: string;
  start_time: string;
  customer_name: string;
  customer_phone: string;
  isManualTime: boolean;
  manual_end: Dayjs;
}

export default function Addfield({ open, onCancel, date, onSuccess, form }: AddFieldProps) {
  const [isManualTime, setIsManualTime] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Watch values để tính tiền Real-time
  const fieldPrice = Form.useWatch("fieldPrice", form);
  const startTimeStr = Form.useWatch("start_time", form);
  const manualEnd = Form.useWatch("manual_end", form);

  // LOGIC TÍNH TIỀN NHƯ CUSTOMER
  const pricing = useMemo(() => {
    if (!fieldPrice || !startTimeStr) return null;

    let durationInHours = 1.5; // Mặc định 90p
    let endTimeStr = dayjs(`2000-01-01 ${startTimeStr}`).add(90, "minute").format("HH:mm");

    if (isManualTime && manualEnd) {
      const start = dayjs(`2000-01-01 ${startTimeStr}`);
      const end = dayjs(`2000-01-01 ${manualEnd.format("HH:mm")}`);
      durationInHours = end.diff(start, "minute") / 60;
      endTimeStr = manualEnd.format("HH:mm");
    }

    if (durationInHours <= 0) return null;

    const subTotal = fieldPrice * durationInHours;
    const isNight = parseInt(startTimeStr.split(":")[0]) >= 20;
    const surcharge = isNight ? subTotal * 0.2 : 0;

    return {
      durationInHours,
      endTimeStr,
      subTotal,
      surcharge,
      finalTotal: subTotal + surcharge,
    };
  }, [fieldPrice, startTimeStr, manualEnd, isManualTime]);

  const handleFinish = async (values: AddFieldFormValues) => {
    if (!pricing) return;
    try {
      setIsSubmitting(true);
      const selectedDateStr = date.format("YYYY-MM-DD");
      const bookingData: Partial<Booking> = {
        field_id: values.field_id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        booking_date: selectedDateStr,
        status: "approved",
        start_time: `${selectedDateStr} ${startTimeStr}:00`,
        end_time: `${selectedDateStr} ${pricing.endTimeStr}:00`,
        total_amount: pricing.finalTotal
      };

      const res = await staffBookingService.createBooking(bookingData);
      if (res.success) {
        message.success("Bán sân thành công! ⚽");
        form.resetFields();
        setIsManualTime(false);
        onSuccess();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "Lỗi tạo đơn!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={<div className="font-black italic uppercase text-slate-700 text-xl">🔥 Đặt sân nhanh (Walk-in)</div>}
      open={open}
      onCancel={() => { setIsManualTime(false); onCancel(); }}
      footer={null}
      centered
      width={700}
      className="rounded-[2rem] overflow-hidden"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={24}>
          <Col span={14}>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Text className="text-[9px] font-black uppercase italic text-slate-400">Sân bóng</Text>
                <Form.Item name="fieldName" noStyle><Input variant="borderless" className="p-0 font-black text-emerald-600 uppercase" readOnly /></Form.Item>
                <Form.Item name="field_id" hidden><Input /></Form.Item>
                <Form.Item name="fieldPrice" hidden><Input /></Form.Item>
              </div>
              <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Text className="text-[9px] font-black uppercase italic text-slate-400">Bắt đầu</Text>
                <Form.Item name="start_time" noStyle><Input variant="borderless" className="p-0 font-black text-blue-600" readOnly /></Form.Item>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-gray-100 mb-4 shadow-sm flex items-center justify-between">
              <Space direction="vertical" size={0}>
                <Text className="text-[10px] font-black uppercase text-gray-400 italic">Chế độ đặt</Text>
                <Text className="font-bold text-xs">{isManualTime ? "Tự chọn giờ kết thúc" : "Mặc định 90 phút"}</Text>
              </Space>
              <Switch checked={isManualTime} onChange={setIsManualTime} />
            </div>

            {isManualTime && (
              <Form.Item name="manual_end" label={<Text className="font-bold italic uppercase text-[11px]">Giờ kết thúc</Text>} rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}>
                <TimePicker format="HH:mm" minuteStep={15} className="w-full h-12 rounded-xl" placeholder="Chọn giờ khách muốn nghỉ" />
              </Form.Item>
            )}

            <Form.Item name="customer_name" label={<Text className="font-bold italic uppercase text-[11px]">Tên khách hàng</Text>} rules={[{ required: true, message: "Nhập tên khách" }]}>
              <Input prefix={<UserOutlined />} size="large" placeholder="Tên khách hàng..." className="rounded-xl" />
            </Form.Item>

            <Form.Item name="customer_phone" label={<Text className="font-bold italic uppercase text-[11px]">Số điện thoại</Text>} rules={[{ required: true, message: "Nhập SĐT" }, { pattern: /^0[0-9]{9}$/, message: "SĐT không hợp lệ" }]}>
              <Input prefix={<PhoneOutlined />} size="large" placeholder="0901234567" className="rounded-xl" />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Card className="bg-slate-50 border-none rounded-2xl h-full shadow-inner">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold italic">
                  <Text type="secondary">KẾT THÚC:</Text>
                  <Text className="text-blue-600">{pricing?.endTimeStr || "--:--"}</Text>
                </div>
                <div className="flex justify-between text-[11px] font-bold italic">
                  <Text type="secondary">THỜI LƯỢNG:</Text>
                  <Text>{pricing?.durationInHours.toFixed(1)} giờ</Text>
                </div>
                
                <Divider className="my-2" />
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <Text>Tiền sân gốc:</Text>
                    <Text className="font-bold">{pricing?.subTotal.toLocaleString()}đ</Text>
                  </div>
                  {pricing && pricing.surcharge > 0 && (
                    <div className="flex justify-between text-xs text-orange-500 font-bold uppercase italic">
                      <span><InfoCircleOutlined /> Phụ phí đêm:</span>
                      <span>{pricing.surcharge.toLocaleString()}đ</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 text-center">
                  <Text className="text-[10px] font-black uppercase text-gray-400 block mb-1">Tổng cộng tạm tính</Text>
                  <div className="text-2xl font-black text-emerald-600 italic leading-none">
                    {pricing?.finalTotal.toLocaleString() || 0}đ
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={isSubmitting}
                  className="h-14 rounded-xl font-black italic uppercase bg-emerald-600 border-none shadow-lg mt-4"
                >
                  XÁC NHẬN
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
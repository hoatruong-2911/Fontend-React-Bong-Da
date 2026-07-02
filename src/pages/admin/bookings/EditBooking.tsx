import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  Card,
  message,
  Spin,
  Space,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// IMPORT SERVICES ADMIN (Chỉ sử dụng của hệ thống Admin)
import adminBookingService from "@/services/admin/bookingService";
import adminFieldService from "@/services/admin/fieldService";
import { Field } from "@/services/admin/fieldService";

dayjs.locale("vi");
const { Option } = Select;
const { Text } = Typography;

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

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);

  // Watchers để tính tiền tự động khi thay đổi trên Form
  const watchFieldId = Form.useWatch("field_id", form);
  const watchTimeRange = Form.useWatch("time_range", form);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === watchFieldId),
    [watchFieldId, fields],
  );

  // 1. Tải dữ liệu ban đầu từ Admin Service
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const fieldRes = await adminFieldService.getFields();
        const fieldList = fieldRes.data?.data || fieldRes.data || [];
        setFields(fieldList);

        if (id) {
          const res = await adminBookingService.getBookingById(id);
          if (res.success) {
            const data = res.data;

            // Kết hợp ngày đặt với giờ bắt đầu/kết thúc
            const startDate = dayjs(`${data.booking_date} ${data.start_time}`);
            const endDate = dayjs(`${data.booking_date} ${data.end_time}`);

            form.setFieldsValue({
              customer_name: data.customer_name,
              customer_phone: data.customer_phone,
              field_id: data.field_id,
              booking_date: dayjs(data.booking_date),
              time_range: [startDate, endDate],
              notes: data.notes,
              status: data.status,
              payment_status: data.payment_status || "unpaid",
              approved_by: data.approved_by,
              confirmed_by: data.confirmed_by,
            });
          }
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, form]);

  // 2. LOGIC TÍNH TIỀN VÀ HẠN MỨC CỌC 30% ĐỒNG BỘ
  const pricing = useMemo(() => {
    if (
      !selectedField ||
      !watchTimeRange ||
      !watchTimeRange[0] ||
      !watchTimeRange[1]
    )
      return null;

    const start = watchTimeRange[0];
    const end = watchTimeRange[1];

    if (!start.isValid() || !end.isValid()) return null;

    const durationMinutes = end.diff(start, "minute");
    const durationHours = durationMinutes / 60;

    if (durationHours <= 0) return null;

    const basePrice = selectedField.price;
    const subTotal = basePrice * durationHours;
    const isNight = start.hour() >= 20;
    const surcharge = isNight ? subTotal * 0.2 : 0;
    const finalTotal = subTotal + surcharge;

    return {
      durationHours,
      subTotal,
      surcharge,
      finalTotal,
      depositRequired: finalTotal * 0.3, // 🚀 Tính cọc 30% đồng bộ hệ thống
    };
  }, [selectedField, watchTimeRange]);

  const onFinish = async (values: any) => {
    if (!pricing) return;

    const startStr = values.time_range[0].format("HH:mm");
    const endStr = values.time_range[1].format("HH:mm");

    if (startStr < "04:00" || startStr > "23:30" || endStr < "04:00" || endStr > "23:30" || endStr <= startStr) {
      message.error("Khung giờ đặt sân không hợp lệ. Sân chỉ hoạt động từ 04:00 đến 23:30.");
      return;
    }

    if (pricing.durationHours < 1) {
      message.warning("Thời gian đặt sân phải từ 1 tiếng trở lên!");
      return;
    }

    try {
      setBtnLoading(true);
      const selectedDateStr = values.booking_date.format("YYYY-MM-DD");

      const payload = {
        field_id: values.field_id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        start_time: `${selectedDateStr} ${values.time_range[0].format("HH:mm")}:00`,
        end_time: `${selectedDateStr} ${values.time_range[1].format("HH:mm")}:00`,
        notes: values.notes,
        status: values.status,
        payment_status: values.payment_status, // 🚀 Đẩy trạng thái cọc lựa chọn từ ô Select lên API
        approved_by: values.approved_by || null,
        confirmed_by: values.confirmed_by || null,
      };

      await adminBookingService.updateBooking(id!, payload);
      message.success("Cập nhật và sửa đổi trạng thái cọc thành công rực rỡ!");
      navigate("/admin/bookings");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang tải dữ liệu đơn đặt sân..." />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <h1 className="text-2xl font-bold m-0 italic uppercase">
            Chỉnh sửa lượt đặt sân #{id} (Admin)
          </h1>
        </header>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={32}>
            <Col xs={24} lg={16}>
              <CustomCard
                title="Thông tin khách hàng"
                step={1}
                description="Người đặt sân"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Tên khách hàng
                        </span>
                      }
                      name="customer_name"
                      rules={[
                        { required: true, message: "Nhập tên khách hàng" },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined className="text-green-500" />}
                        className="rounded-xl font-bold"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Số điện thoại
                        </span>
                      }
                      name="customer_phone"
                      rules={[
                        { required: true, message: "Nhập số điện thoại" },
                        {
                          pattern: /^(0)[0-9]{9}$/,
                          message: "SĐT không hợp lệ, phải gồm 10 số!",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<PhoneOutlined className="text-green-500" />}
                        className="rounded-xl font-bold"
                        onChange={(e) =>
                          form.setFieldValue(
                            "customer_phone",
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>

              <CustomCard
                title="Thời gian & Sân"
                step={2}
                description="Điều chỉnh lịch trình"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Chọn sân
                        </span>
                      }
                      name="field_id"
                      rules={[{ required: true, message: "Chọn sân bóng" }]}
                    >
                      <Select size="large" className="h-12">
                        {fields.map((f) => (
                          <Option key={f.id} value={f.id}>
                            {f.name} - {f.location}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Ngày đặt
                        </span>
                      }
                      name="booking_date"
                      rules={[{ required: true, message: "Chọn ngày đá" }]}
                    >
                      <DatePicker
                        size="large"
                        className="w-full h-12 rounded-xl font-bold"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Khung giờ đá
                        </span>
                      }
                      name="time_range"
                      rules={[{ required: true, message: "Chọn khung giờ" }]}
                    >
                      <TimePicker.RangePicker
                        size="large"
                        format="HH:mm"
                        className="w-full h-12 rounded-xl"
                        minuteStep={15}
                        disabledTime={(d, type) => {
                          if (type === "start") {
                            return {
                              disabledHours: () => [0, 1, 2, 3, 23],
                              disabledMinutes: () => [],
                            };
                          }
                          return {
                            disabledHours: () => [0, 1, 2, 3, 4],
                            disabledMinutes: (h) => {
                              if (h === 23) {
                                return Array.from({ length: 29 }, (_, i) => i + 31); // 31 to 59
                              }
                              return [];
                            },
                          };
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>

              <CustomCard
                title="Quản lý hệ thống"
                step={3}
                description="Cập nhật trạng thái và dòng tiền"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Trạng thái đơn
                        </span>
                      }
                      name="status"
                    >
                      <Select size="large" className="h-12">
                        <Option value="pending">Chờ xác nhận (Pending)</Option>
                        <Option value="approved">Đã duyệt (Approved)</Option>
                        <Option value="playing">Đang đá (Playing)</Option>
                        <Option value="completed">
                          Hoàn thành (Completed)
                        </Option>
                        <Option value="cancelled">Đã hủy (Cancelled)</Option>
                        <Option value="rejected">Từ chối (Rejected)</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* 🚀 PHẦN BỔ SUNG: Cho phép Admin tinh chỉnh trạng thái cọc dòng tiền */}
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Trạng thái tiền cọc
                        </span>
                      }
                      name="payment_status"
                    >
                      <Select size="large" className="h-12">
                        <Option value="unpaid">Chưa đóng cọc (Unpaid)</Option>
                        <Option value="partial_paid">
                          Đã cọc 30% (Partial Paid)
                        </Option>
                        <Option value="fully_paid">
                          Đã thanh toán đủ (Fully Paid)
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Người duyệt (ID)
                        </span>
                      }
                      name="approved_by"
                    >
                      <Input
                        size="large"
                        placeholder="Mã ID nhân viên..."
                        className="rounded-xl font-bold"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Người xác nhận (ID)
                        </span>
                      }
                      name="confirmed_by"
                    >
                      <Input
                        size="large"
                        placeholder="Mã ID nhân viên..."
                        className="rounded-xl font-bold"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <span className="font-bold text-xs uppercase text-slate-500">
                          Ghi chú điều phối
                        </span>
                      }
                      name="notes"
                    >
                      <Input.TextArea
                        rows={3}
                        className="rounded-xl font-bold"
                        placeholder="Ghi chú thêm từ ban quản lý..."
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>

            {/* CỘT TỔNG KẾT ĐẶT SÂN (STICKY RIGHT) */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span className="font-black italic uppercase text-slate-700">
                    Tổng kết chỉnh sửa
                  </span>
                }
                className="sticky top-24 shadow-md border-none"
                style={{ borderRadius: 20 }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Đơn giá sân gốc:</span>
                    <span className="font-black text-gray-800">
                      {selectedField?.price.toLocaleString() || 0}đ/h
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs italic font-bold">
                    <span>Thời lượng tính toán:</span>
                    <span className="text-blue-600">
                      {pricing?.durationHours.toFixed(1) || 0} giờ
                    </span>
                  </div>

                  <Divider className="my-1 border-dashed" />

                  {pricing && (
                    <div className="bg-emerald-50 p-4 rounded-xl text-xs space-y-2 border border-emerald-100 shadow-inner">
                      <div className="flex justify-between text-emerald-700 font-bold italic">
                        <span>Tiền sân gốc:</span>
                        <span className="font-black text-slate-900">
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

                      {/* 🚀 ĐỒNG BỘ GIAO DIỆN HIỂN THỊ HẠN MỨC CỌC 30% GIỐNG CUSTOMER */}
                      <div className="flex justify-between text-red-500 font-black uppercase italic mt-2 pt-2 border-t border-dashed border-emerald-200/80">
                        <span>
                          <DollarCircleOutlined /> Hạn mức cọc (30%):
                        </span>
                        <span>{pricing.depositRequired.toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black italic uppercase text-sm text-slate-500">
                      TỔNG CỘNG BILL
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-green-600 italic tracking-tighter">
                        {pricing?.finalTotal.toLocaleString() || 0}đ
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={btnLoading}
                    disabled={!pricing}
                    className="h-16 rounded-[20px] bg-gradient-to-r from-green-500 to-emerald-600 border-none font-black italic uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    LƯU THAY ĐỔI
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

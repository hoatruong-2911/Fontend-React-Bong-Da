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
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// IMPORT SERVICES
import adminBookingService from "@/services/admin/bookingService";
import adminFieldService from "@/services/admin/fieldService";
import { Field } from "@/services/admin/fieldService";

dayjs.locale("vi");
const { Option } = Select;

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
    [watchFieldId, fields]
  );

  // 1. Tải dữ liệu ban đầu
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

            // FIX LỖI INVALID DATE: Kết hợp ngày đặt với giờ bắt đầu/kết thúc
            const startDate = dayjs(`${data.booking_date} ${data.start_time}`);
            const endDate = dayjs(`${data.booking_date} ${data.end_time}`);

            form.setFieldsValue({
              customer_name: data.customer_name,
              customer_phone: data.customer_phone,
              field_id: data.field_id,
              booking_date: dayjs(data.booking_date),
              time_range: [startDate, endDate], // Truyền đối tượng dayjs hợp lệ
              notes: data.notes,
              status: data.status,
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

  // 2. LOGIC TÍNH TIỀN CHO CỘT TỔNG KẾT (Fix lỗi NaN)
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

    return {
      durationHours,
      subTotal,
      surcharge,
      finalTotal: subTotal + surcharge,
    };
  }, [selectedField, watchTimeRange]);

  const onFinish = async (values: any) => {
    try {
      setBtnLoading(true);
      const payload = {
        field_id: values.field_id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        // Gửi định dạng Y-m-d H:i:s chuẩn cho Backend
        start_time: values.time_range[0].format("YYYY-MM-DD HH:mm:ss"),
        end_time: values.time_range[1].format("YYYY-MM-DD HH:mm:ss"),
        notes: values.notes,
        status: values.status,
        approved_by: values.approved_by || null,
        confirmed_by: values.confirmed_by || null,
      };

      await adminBookingService.updateBooking(id!, payload);
      message.success("Cập nhật thành công!");
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
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <h1 className="text-2xl font-bold m-0">
            Chỉnh sửa lượt đặt sân #{id}
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
                      label="Tên khách hàng"
                      name="customer_name"
                      rules={[{ required: true }]}
                    >
                      <Input size="large" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="customer_phone"
                      rules={[{ required: true }]}
                    >
                      <Input
                        size="large"
                        prefix={<PhoneOutlined />}
                        onChange={(e) =>
                          form.setFieldValue(
                            "customer_phone",
                            e.target.value.replace(/[^0-9]/g, "")
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
                      label="Chọn sân"
                      name="field_id"
                      rules={[{ required: true }]}
                    >
                      <Select size="large">
                        {fields.map((f) => (
                          <Option key={f.id} value={f.id}>
                            {f.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Ngày đặt"
                      name="booking_date"
                      rules={[{ required: true }]}
                    >
                      <DatePicker
                        size="large"
                        className="w-full"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Khung giờ đá"
                      name="time_range"
                      rules={[{ required: true }]}
                    >
                      <TimePicker.RangePicker
                        size="large"
                        format="HH:mm"
                        className="w-full"
                        minuteStep={15}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>

              <CustomCard
                title="Quản lý hệ thống"
                step={3}
                description="Cập nhật trạng thái"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Trạng thái" name="status">
                      <Select size="large">
                        <Option value="pending">Chờ xác nhận</Option>
                        <Option value="confirmed">Đã xác nhận</Option>
                        <Option value="playing">Đang đá</Option>
                        <Option value="completed">Hoàn thành</Option>
                        <Option value="cancelled">Đã hủy</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Người duyệt (ID)" name="approved_by">
                      <Input size="large" placeholder="Ví dụ: 1" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Người xác nhận (ID)" name="confirmed_by">
                      <Input size="large" placeholder="Ví dụ: 2" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Ghi chú" name="notes">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              </CustomCard>
            </Col>

            {/* CỘT TỔNG KẾT ĐẶT SÂN */}
            <Col xs={24} lg={8}>
              <Card
                title={<span className="font-bold">Tổng kết chỉnh sửa</span>}
                className="sticky top-6 shadow-md border-none"
                style={{ borderRadius: 12 }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Đơn giá sân:</span>
                    <span className="font-medium text-gray-800">
                      {selectedField?.price.toLocaleString() || 0}đ/h
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Thời lượng:</span>
                    <span className="font-bold text-blue-600">
                      {pricing?.durationHours.toFixed(1) || 0} giờ
                    </span>
                  </div>
                  <Divider className="my-1" dashed />
                  {pricing && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Tiền sân:</span>
                        <span>{pricing.subTotal.toLocaleString()}đ</span>
                      </div>
                      {pricing.surcharge > 0 && (
                        <div className="flex justify-between text-orange-500 font-medium">
                          <span>
                            <InfoCircleOutlined /> Phụ phí đêm:
                          </span>
                          <span>{pricing.surcharge.toLocaleString()}đ</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">TỔNG CỘNG</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-green-600">
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
                    style={{
                      height: 54,
                      borderRadius: 10,
                      backgroundColor: "#62B462",
                      borderColor: "#62B462",
                      fontWeight: 700,
                    }}
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

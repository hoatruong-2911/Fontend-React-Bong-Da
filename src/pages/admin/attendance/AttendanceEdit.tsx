import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Typography,
  Space,
  Row,
  Col,
  message,
  Divider,
  TimePicker,
  Input,
  Statistic,
  Avatar,
  Tag,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
  EditOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import attendanceService, {
  AttendanceRecord,
} from "@/services/admin/attendanceService";

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

// Interface cho giá trị của Form - Tuyệt đối không dùng any
interface AttendanceFormValues {
  status: AttendanceRecord["status"];
  date: Dayjs;
  check_in: Dayjs | null;
  check_out: Dayjs | null;
  note: string;
}

// Interface bóc tách lỗi từ API
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

export default function AttendanceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<AttendanceFormValues>();

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(
    null
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        const res = await attendanceService.getAttendanceById(id);
        if (res.success) {
          const data: AttendanceRecord = res.data;
          setAttendanceData(data);

          form.setFieldsValue({
            status: data.status,
            date: dayjs(data.date),
            check_in: data.check_in ? dayjs(data.check_in, "HH:mm:ss") : null,
            check_out: data.check_out
              ? dayjs(data.check_out, "HH:mm:ss")
              : null,
            note: data.note || "",
          });
        }
      } catch (error: unknown) {
        message.error("Không thể lấy dữ liệu chỉnh sửa");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, form]);

  const onFinish = async (values: AttendanceFormValues) => {
    if (!attendanceData) return;

    setLoading(true);
    try {
      const payload = {
        staff_id: attendanceData.staff_id,
        date: values.date.format("YYYY-MM-DD"),
        status: values.status,
        // FIX: Định dạng đúng HH:mm để Backend không báo lỗi 422
        check_in: values.check_in ? values.check_in.format("HH:mm") : null,
        check_out: values.check_out ? values.check_out.format("HH:mm") : null,
        note: values.note,
      };

      const res = await attendanceService.saveAttendance(payload);

      if (res.success) {
        message.success("Cập nhật chấm công thành công! 🚀");
        navigate("/admin/attendances");
      }
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      // Hiển thị lỗi chi tiết từ Backend nếu có
      const errorMsg =
        apiError.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#064e3b]">
        <Spin
          size="large"
          tip={
            <span className="text-white font-bold italic">
              Đang tải hồ sơ...
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <Space direction="vertical" size={4}>
            <Title
              level={2}
              className="text-white! m-0 font-black italic uppercase tracking-wider"
            >
              <EditOutlined className="mr-2" /> Điều chỉnh chấm công
            </Title>
            <Text className="text-emerald-300 font-bold italic opacity-80 uppercase">
              ID BẢN GHI: #{id}
            </Text>
          </Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-2xl font-black h-12 px-6 border-none bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all uppercase italic"
          >
            Hủy bỏ
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            {/* Cột trái: Profile Nhân viên */}
            <Col xs={24} lg={8}>
              <Card className="rounded-[32px] border-none shadow-2xl bg-gradient-to-b from-white to-blue-50 text-center p-6">
                <div className="relative inline-block mb-6">
                  <Avatar
                    size={140}
                    src={
                      attendanceData?.staff?.avatar
                        ? `${STORAGE_URL}${attendanceData.staff.avatar}`
                        : undefined
                    }
                    icon={<UserOutlined />}
                    className="border-4 border-white shadow-2xl"
                  />
                </div>

                <Title
                  level={3}
                  className="m-0 font-black uppercase italic text-blue-900"
                >
                  {attendanceData?.staff?.name}
                </Title>
                <Space direction="vertical" className="mt-2 w-full">
                  <Tag
                    color="blue"
                    className="border-none font-black px-4 rounded-lg uppercase italic m-0"
                  >
                    {attendanceData?.staff?.position}
                  </Tag>
                  <Tag
                    color="cyan"
                    className="border-none font-black px-4 rounded-lg uppercase italic m-0"
                  >
                    {attendanceData?.staff?.department?.name ||
                      "CHƯA XẾP PHÒNG"}
                  </Tag>
                </Space>

                <Divider className="my-6 border-blue-100" />

                <Form.Item
                  name="date"
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ngày làm việc
                    </span>
                  }
                >
                  <DatePicker
                    className="w-full rounded-2xl h-12 font-black border-none bg-blue-100/30 text-center"
                    format="DD/MM/YYYY"
                    disabled
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Cột phải: Form chỉnh sửa */}
            <Col xs={24} lg={16}>
              <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 p-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label={
                        <span className="font-black uppercase text-[11px] text-blue-700 italic flex items-center gap-1">
                          <InfoCircleOutlined /> Trạng thái làm việc
                        </span>
                      }
                      rules={[{ required: true }]}
                    >
                      <Select
                        size="large"
                        className="rounded-2xl font-bold uppercase italic h-12 shadow-sm"
                      >
                        <Select.Option value="present">CÓ MẶT</Select.Option>
                        <Select.Option value="late">ĐI MUỘN</Select.Option>
                        <Select.Option value="leave">NGHỈ PHÉP</Select.Option>
                        <Select.Option value="absent">VẮNG MẶT</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 mt-6 shadow-inner">
                      <Statistic
                        title={
                          <span className="font-black text-[10px] text-blue-600 uppercase italic text-center block">
                            Tăng ca dự kiến
                          </span>
                        }
                        value={attendanceData?.overtime_hours || 0}
                        precision={2}
                        suffix="H"
                        valueStyle={{
                          color: "#1d4ed8",
                          fontWeight: 900,
                          fontStyle: "italic",
                          textAlign: "center",
                        }}
                        prefix={<CalculatorOutlined />}
                      />
                    </div>
                  </Col>
                </Row>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-[32px] border border-emerald-100 my-6 shadow-inner">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="check_in"
                        label={
                          <span className="font-black text-[11px] uppercase text-emerald-800 italic">
                            Giờ vào thực tế
                          </span>
                        }
                      >
                        <TimePicker
                          className="w-full rounded-2xl h-[52px] font-black border-none shadow-md bg-white"
                          format="HH:mm"
                          size="large"
                          placeholder="Chọn giờ vào"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="check_out"
                        label={
                          <span className="font-black text-[11px] uppercase text-emerald-800 italic">
                            Giờ ra thực tế
                          </span>
                        }
                      >
                        <TimePicker
                          className="w-full rounded-2xl h-[52px] font-black border-none shadow-md bg-white"
                          format="HH:mm"
                          size="large"
                          placeholder="Chọn giờ ra"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Form.Item
                  name="note"
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ghi chú điều chỉnh
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={4}
                    className="rounded-3xl p-5 shadow-sm border-gray-100 font-bold italic"
                    placeholder="Nhập lý do thay đổi..."
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="w-full h-16 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 border-none shadow-xl font-black text-lg uppercase italic mt-4 hover:scale-[1.01] transition-transform"
                >
                  Xác nhận cập nhật dữ liệu
                </Button>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

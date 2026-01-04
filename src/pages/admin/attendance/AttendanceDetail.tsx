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
  CalendarOutlined,
  InfoCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import attendanceService, {
  AttendanceRecord,
} from "@/services/admin/attendanceService";

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function AttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fetching, setFetching] = useState<boolean>(true);
  const [calculatedOT, setCalculatedOT] = useState<number>(0);
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

          // Đổ dữ liệu vào form để hiển thị rực rỡ
          form.setFieldsValue({
            staff_id: data.staff_id,
            date: dayjs(data.date),
            status: data.status,
            check_in: data.check_in ? dayjs(data.check_in, "HH:mm:ss") : null,
            check_out: data.check_out
              ? dayjs(data.check_out, "HH:mm:ss")
              : null,
            note: data.note || "",
          });

          // Tính toán số giờ tăng ca từ database
          setCalculatedOT(Number(data.overtime_hours || 0));
        }
      } catch (error: unknown) {
        message.error("Không thể tải thông tin bản ghi");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, form]);

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#064e3b]">
        <Spin
          size="large"
          tip={
            <span className="text-white font-bold">Đang lấy dữ liệu...</span>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <Space direction="vertical" size={4}>
            <Title
              level={2}
              className="text-white! m-0 font-black italic uppercase tracking-wider"
            >
              <SolutionOutlined className="mr-2" /> Hồ sơ chấm công
            </Title>
            <Tag
              color="rgba(255,255,255,0.2)"
              className="border-none text-emerald-200 font-bold m-0 px-3 py-1 rounded-lg italic"
            >
              ID BẢN GHI: #{id}
            </Tag>
          </Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-2xl font-black h-12 px-8 shadow-xl border-none bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all uppercase italic"
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={24}>
          {/* CỘT TRÁI: THÔNG TIN NHÂN VIÊN */}
          <Col xs={24} lg={8}>
            <Card className="rounded-[32px] border-none shadow-2xl bg-gradient-to-b from-white to-blue-50 overflow-hidden text-center p-4">
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
                <div className="absolute bottom-2 right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white" />
              </div>

              <Title
                level={3}
                className="m-0 font-black uppercase italic text-blue-900 leading-tight"
              >
                {attendanceData?.staff?.name}
              </Title>
              <Text className="text-blue-500 font-bold uppercase tracking-tighter text-[13px]">
                {attendanceData?.staff?.position}
              </Text>

              <Divider className="my-6 border-blue-100" />

              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-gray-400 font-bold text-[11px] uppercase italic">
                    Phòng ban
                  </span>
                  <Tag
                    color="blue"
                    className="m-0 font-black border-none px-4 rounded-lg uppercase"
                  >
                    {/* FIX: Lấy dữ liệu phòng ban từ đúng quan hệ staff.department */}
                    {attendanceData?.staff?.department?.name ||
                      "CHƯA XẾP PHÒNG"}
                  </Tag>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-gray-400 font-bold text-[11px] uppercase italic">
                    Ngày chấm
                  </span>
                  <span className="font-black text-blue-800 tracking-tight uppercase italic">
                    {dayjs(attendanceData?.date).format("DD [Tháng] MM, YYYY")}
                  </span>
                </div>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: CHI TIẾT CÔNG VIỆC (CHỈ XEM) */}
          <Col xs={24} lg={16}>
            <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 p-4 relative h-full">
              <Form form={form} layout="vertical" disabled>
                {" "}
                {/* disabled ở đây để khóa toàn bộ form */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Form.Item
                    name="status"
                    label={
                      <span className="font-black uppercase text-[11px] text-blue-700 italic flex items-center gap-1">
                        <InfoCircleOutlined /> Trạng thái làm việc
                      </span>
                    }
                  >
                    <Select
                      size="large"
                      className="rounded-2xl font-bold uppercase italic h-12 shadow-sm border-none bg-gray-50"
                    >
                      <Select.Option value="present">
                        <Tag
                          color="success"
                          className="rounded-full px-4 border-none font-bold uppercase"
                        >
                          Có mặt
                        </Tag>
                      </Select.Option>
                      <Select.Option value="late">
                        <Tag
                          color="warning"
                          className="rounded-full px-4 border-none font-bold uppercase"
                        >
                          Đi muộn
                        </Tag>
                      </Select.Option>
                      <Select.Option value="leave">
                        <Tag
                          color="default"
                          className="rounded-full px-4 border-none font-bold uppercase"
                        >
                          Nghỉ phép
                        </Tag>
                      </Select.Option>
                      <Select.Option value="absent">
                        <Tag
                          color="error"
                          className="rounded-full px-4 border-none font-bold uppercase"
                        >
                          Vắng mặt
                        </Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-black uppercase text-[11px] text-blue-700 italic flex items-center gap-1">
                        <CalendarOutlined /> Thời gian áp dụng
                      </span>
                    }
                  >
                    <div className="h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center px-4 font-black text-gray-500 italic">
                      {dayjs(attendanceData?.date).format("DD / MM / YYYY")}
                    </div>
                  </Form.Item>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-[32px] border border-emerald-100 mb-8 shadow-inner">
                  <Row gutter={24} align="middle">
                    <Col span={8}>
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
                          showNow={false}
                          suffixIcon={<ClockCircleOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
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
                          showNow={false}
                          suffixIcon={<ClockCircleOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <div className="bg-white rounded-[24px] p-4 border border-emerald-200 shadow-xl">
                        <Statistic
                          title={
                            <span className="font-black text-[10px] text-blue-600 uppercase italic">
                              Số giờ tăng ca
                            </span>
                          }
                          value={calculatedOT}
                          precision={2}
                          suffix={
                            <span className="text-[14px] font-black italic text-blue-400 ml-1">
                              H
                            </span>
                          }
                          valueStyle={{
                            color: "#1d4ed8",
                            fontWeight: 900,
                            fontStyle: "italic",
                            fontSize: "28px",
                          }}
                          prefix={
                            <CalculatorOutlined className="text-[20px]" />
                          }
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
                <Form.Item
                  name="note"
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic flex items-center gap-1">
                      <SolutionOutlined /> Ghi chú từ hệ thống
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={6}
                    className="rounded-3xl p-5 shadow-sm border-gray-100 font-bold bg-gray-50 text-blue-900 italic"
                  />
                </Form.Item>
              </Form>

              <div className="mt-4 p-4 bg-blue-100/50 rounded-2xl border border-blue-200 text-center">
                <Text className="text-blue-700 font-black italic uppercase text-[12px]">
                  Bản ghi này đã được xác thực và không thể chỉnh sửa trực tiếp.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

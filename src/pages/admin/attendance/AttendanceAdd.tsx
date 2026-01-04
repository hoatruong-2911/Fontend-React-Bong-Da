import { useEffect, useState } from "react";
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
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import attendanceService from "@/services/admin/attendanceService";
import shiftService from "@/services/admin/shiftService";
import api from "@/services/api";

const { Title } = Typography;

interface Staff {
  id: number;
  name: string;
  position: string;
}

interface ShiftAssignment {
  work_date: string;
  shift?: {
    name: string;
    start_time: string;
    end_time: string;
  };
}

export default function AttendanceAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isTimeDisabled, setIsTimeDisabled] = useState<boolean>(false);
  const [calculatedOT, setCalculatedOT] = useState<number>(0);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get("/admin/staff");
        setStaffList(res.data.data);
      } catch (error) {
        message.error("Không thể tải danh sách nhân viên");
      }
    };
    fetchStaff();
  }, []);

  // NGHIỆP VỤ 2: Tự động tính OT ngay trên giao diện
  const calculateLiveOT = () => {
    const checkIn: Dayjs | null = form.getFieldValue("check_in");
    const checkOut: Dayjs | null = form.getFieldValue("check_out");
    const status: string = form.getFieldValue("status");

    if (
      checkIn &&
      checkOut &&
      (status === "present" || status === "leave" || status === "late")
    ) {
      // FIX: Dùng Math.abs để đảm bảo không bao giờ hiện số âm trên UI
      const diffMinutes = Math.abs(checkOut.diff(checkIn, "minute"));
      const hours = diffMinutes / 60;
      setCalculatedOT(hours > 8 ? Number((hours - 8).toFixed(2)) : 0);
    } else {
      setCalculatedOT(0);
    }
  };

  const handleStaffChange = async (staffId: number) => {
    try {
      const dateVal: Dayjs = form.getFieldValue("date");
      const dateStr = dateVal
        ? dateVal.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const res = await shiftService.getStaffShiftDetail(staffId.toString());

      if (res.success) {
        const assignment = res.data.assignments.find(
          (a: ShiftAssignment) => a.work_date === dateStr
        );
        if (assignment && assignment.shift) {
          form.setFieldsValue({
            check_in: dayjs(assignment.shift.start_time, "HH:mm:ss"),
            check_out: dayjs(assignment.shift.end_time, "HH:mm:ss"),
          });
          calculateLiveOT();
          message.success(`Đã lấy ca: ${assignment.shift.name}`);
        } else {
          message.warning("Nhân viên không có ca làm vào ngày này");
        }
      }
    } catch (error) {
      message.error("Lỗi lấy thông tin ca làm");
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === "absent") {
      setIsTimeDisabled(true);
      form.setFieldsValue({ check_in: null, check_out: null });
      setCalculatedOT(0);
    } else {
      setIsTimeDisabled(false);
      const currentStaff = form.getFieldValue("staff_id");
      if (currentStaff) handleStaffChange(currentStaff);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        check_in: values.check_in?.format("HH:mm"),
        check_out: values.check_out?.format("HH:mm"),
      };
      const res = await attendanceService.saveAttendance(payload);
      if (res.success) {
        message.success(res.message);
        navigate("/admin/attendances");
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title
            level={2}
            className="text-white! m-0 font-black italic uppercase"
          >
            Chấm công mới
          </Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl font-black uppercase h-10 px-6 shadow-lg"
          >
            Quay lại
          </Button>
        </div>

        <Card className="rounded-[32px] border-none shadow-2xl p-8 bg-white/95 text-gray-800">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ date: dayjs(), status: "present" }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="staff_id"
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Nhân viên
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chọn nhân viên"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    onChange={handleStaffChange}
                    className="rounded-xl font-bold"
                  >
                    {staffList.map((s) => (
                      <Select.Option key={s.id} value={s.id} label={s.name}>
                        {s.name} - {s.position}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ngày chấm công
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    className="w-full rounded-xl h-[45px] font-bold"
                    format="DD/MM/YYYY"
                    size="large"
                    onChange={() => {
                      const staffId = form.getFieldValue("staff_id");
                      if (staffId) handleStaffChange(staffId);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="status"
              label={
                <span className="font-black uppercase text-[11px] text-blue-700 italic">
                  Trạng thái (Admin chọn thủ công)
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                className="rounded-xl font-bold uppercase italic"
                onChange={handleStatusChange}
              >
                <Select.Option value="present">
                  CÓ MẶT (ĐÚNG GIỜ / TĂNG CA)
                </Select.Option>
                <Select.Option value="late">ĐI MUỘN (LATE)</Select.Option>
                <Select.Option value="leave">
                  NGHỈ PHÉP (HƯỞNG LƯƠNG - TỐI ĐA 2 NGÀY)
                </Select.Option>
                <Select.Option value="absent">
                  VẮNG MẶT (KHÔNG LƯƠNG)
                </Select.Option>
              </Select>
            </Form.Item>

            <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 mb-6">
              <Row gutter={24} align="middle">
                <Col span={8}>
                  <Form.Item
                    name="check_in"
                    label={
                      <span className="font-black text-[11px] uppercase text-blue-800">
                        Giờ vào thực tế
                      </span>
                    }
                  >
                    <TimePicker
                      disabled={isTimeDisabled}
                      className="w-full rounded-xl h-[45px] font-bold"
                      format="HH:mm"
                      size="large"
                      onChange={calculateLiveOT}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="check_out"
                    label={
                      <span className="font-black text-[11px] uppercase text-blue-800">
                        Giờ ra thực tế
                      </span>
                    }
                  >
                    <TimePicker
                      disabled={isTimeDisabled}
                      className="w-full rounded-xl h-[45px] font-bold"
                      format="HH:mm"
                      size="large"
                      onChange={calculateLiveOT}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Statistic
                    title={
                      <span className="font-black text-[10px] text-blue-500 uppercase italic">
                        Tăng ca dự kiến
                      </span>
                    }
                    value={calculatedOT}
                    suffix="H"
                    valueStyle={{
                      color: "#1d4ed8",
                      fontWeight: 900,
                      fontStyle: "italic",
                    }}
                    prefix={<CalculatorOutlined />}
                  />
                </Col>
              </Row>
            </div>

            <Form.Item
              name="note"
              label={
                <span className="font-black uppercase text-[11px] text-blue-700 italic">
                  Ghi chú
                </span>
              }
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập lý do..."
                className="rounded-2xl"
              />
            </Form.Item>

            <Divider />
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="w-full h-14 rounded-2xl bg-blue-700 font-black italic uppercase text-[16px] shadow-xl shadow-blue-200"
            >
              Xác nhận lưu chấm công
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

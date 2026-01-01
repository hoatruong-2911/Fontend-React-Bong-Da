import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Space,
  Typography,
  message,
  Divider,
  Tag, // Đã thêm Tag vào đây để fix lỗi ReferenceError
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import shiftService, {
  Shift,
  StaffSchedule,
} from "@/services/admin/shiftService";
import api from "@/services/api";

const { Title, Text } = Typography;

// Interface cho dữ liệu Form (No Any)
interface AssignFormValues {
  staff_id: number;
  shift_id: number;
  work_date: dayjs.Dayjs;
  note?: string;
}

export default function ShiftAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AssignFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffList, setStaffList] = useState<StaffSchedule[]>([]);

  // Lấy dữ liệu khởi tạo cho các Selectbox
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [shiftRes, staffRes] = await Promise.all([
          shiftService.getShifts(),
          api.get("/admin/staff"),
        ]);
        setShifts(shiftRes.data);
        setStaffList(staffRes.data.data);
      } catch (error: unknown) {
        message.error("Không thể tải danh sách dữ liệu");
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values: AssignFormValues): Promise<void> => {
    try {
      setLoading(true);
      const res = await shiftService.assignShift({
        staff_id: values.staff_id,
        shift_id: values.shift_id,
        work_date: values.work_date.format("YYYY-MM-DD"),
        note: values.note,
      });

      if (res.success) {
        message.success(res.message);
        navigate("/admin/shifts");
      }
    } catch (error: any) {
      // 1. Nếu là lỗi Validate (422) - Hiện lỗi đỏ dưới từng ô Input
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const formErrors = Object.keys(backendErrors).map((key) => ({
          name: key,
          errors: backendErrors[key],
        }));
        form.setFields(formErrors);
        message.error("Dữ liệu nhập vào chưa đúng!");
      }
      // 2. Nếu là lỗi Quyền hạn (403) - Báo rõ lỗi phân quyền
      else if (error.response && error.response.status === 403) {
        message.error(
          error.response.data.message ||
            "Bạn không có quyền thực hiện hành động này!"
        );
      }
      // 3. Các lỗi khác từ Backend (500, 404...) - Lấy message cụ thể
      else {
        const errorMsg =
          error.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại!";
        message.error(`Lỗi: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          {/* Fix cảnh báo direction: mặc định là vertical thì dùng direction="vertical" là ok trong bản antd 5.x, 
              nhưng nếu báo deprecated hãy dùng className thay thế */}
          <div className="flex flex-col">
            <Title
              level={2}
              className="text-white! m-0 font-black italic uppercase"
            >
              Phân ca làm việc mới
            </Title>
            <Text className="text-emerald-200 italic font-bold">
              Gán lịch làm việc cho nhân sự sân bóng
            </Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl font-bold uppercase italic border-none h-10 px-6"
          >
            Quay lại
          </Button>
        </div>

        <Card className="rounded-[32px] border-none shadow-2xl p-4 overflow-hidden bg-white/95">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{ work_date: dayjs() }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chọn nhân viên */}
              <Form.Item
                name="staff_id"
                label={
                  <Space>
                    <UserOutlined className="text-blue-600" />
                    {/* Bỏ thuộc tính uppercase={true} vào span để fix warning non-boolean attribute */}
                    <span className="font-bold uppercase text-[12px]">
                      Nhân viên
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
              >
                <Select
                  placeholder="Chọn nhân viên cần phân ca"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  className="rounded-xl shadow-sm"
                >
                  {staffList.map((s) => (
                    <Select.Option key={s.id} value={s.id} label={s.name}>
                      <div className="flex flex-col">
                        <span className="font-bold">{s.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase italic">
                          {s.position}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Chọn ngày làm việc */}
              <Form.Item
                name="work_date"
                label={
                  <Space>
                    <CalendarOutlined className="text-blue-600" />
                    <span className="font-bold uppercase text-[12px]">
                      Ngày làm việc
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  className="w-full rounded-xl shadow-sm h-[45px]"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>

              {/* Chọn ca làm việc */}
              <Form.Item
                name="shift_id"
                label={
                  <Space>
                    <ClockCircleOutlined className="text-blue-600" />
                    <span className="font-bold uppercase text-[12px]">
                      Ca làm việc
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn ca làm" }]}
              >
                <Select
                  placeholder="Chọn ca (Sáng, Chiều, Tối...)"
                  size="large"
                  className="rounded-xl shadow-sm"
                >
                  {shifts.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">{s.name}</span>
                        <Tag
                          color="blue"
                          className="m-0 border-none rounded-md italic"
                        >
                          {s.start_time.substring(0, 5)} -{" "}
                          {s.end_time.substring(0, 5)}
                        </Tag>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Ghi chú */}
              <Form.Item
                name="note"
                className="md:col-span-2"
                label={
                  <Space>
                    <FormOutlined className="text-blue-600" />
                    <span className="font-bold uppercase text-[12px]">
                      Ghi chú công việc
                    </span>
                  </Space>
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập ghi chú cụ thể cho nhân viên nếu có..."
                  className="rounded-2xl shadow-sm p-3"
                />
              </Form.Item>
            </div>

            <Divider className="my-6 border-gray-100" />

            <div className="flex justify-end gap-4">
              <Button
                size="large"
                onClick={() => navigate(-1)}
                className="rounded-2xl h-12 px-10 font-bold uppercase italic text-gray-400"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                className="rounded-2xl h-12 px-12 bg-blue-700 border-none font-black italic uppercase shadow-xl shadow-blue-200"
              >
                Xác nhận phân ca
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

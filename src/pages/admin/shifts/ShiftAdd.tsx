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
  Tag,
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
import shiftService, { Shift } from "@/services/admin/shiftService";
import api from "@/services/api";

const { Title, Text } = Typography;

interface AssignFormValues {
  staff_id: number;
  shift_id: number[];
  work_date: dayjs.Dayjs;
  note?: string;
}

export default function ShiftAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AssignFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = useState<any[]>([]);

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

  const handleShiftChange = (selectedIds: number[]) => {
    const FULL_SHIFT_NAME = "Ca full";
    const fullShift = shifts.find(
      (s) => s.name.toLowerCase() === FULL_SHIFT_NAME.toLowerCase()
    );
    if (!fullShift) return;
    const lastSelected = selectedIds[selectedIds.length - 1];

    if (lastSelected === fullShift.id) {
      form.setFieldsValue({ shift_id: [fullShift.id] });
      message.warning("Đã chọn Ca Full: Tự động hủy các ca lẻ khác");
    } else if (selectedIds.includes(fullShift.id) && selectedIds.length > 1) {
      const filtered = selectedIds.filter((sid) => sid !== fullShift.id);
      form.setFieldsValue({ shift_id: filtered });
      message.info("Đã chọn ca lẻ: Tự động hủy Ca Full");
    }
  };

  const onFinish = async (values: AssignFormValues): Promise<void> => {
    try {
      setLoading(true);
      const res = await shiftService.assignShift({
        staff_id: values.staff_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shift_id: values.shift_id as any,
        work_date: values.work_date.format("YYYY-MM-DD"),
        note: values.note,
      });
      if (res.success) {
        message.success(res.message);
        navigate("/admin/shifts");
      }// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message || "Lỗi hệ thống!";
      message.error(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <Title
              level={2}
              className="text-white! m-0 font-black italic uppercase"
            >
              Phân ca làm việc mới
            </Title>
            <Text className="text-emerald-200 italic font-bold">
              Gán lịch làm việc linh hoạt cho nhân sự
            </Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl font-black uppercase h-10 px-6"
          >
            Quay lại
          </Button>
        </div>
        <Card className="rounded-[32px] border-none shadow-2xl p-6 bg-white/95">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ work_date: dayjs() }}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="staff_id"
                label={
                  <Space>
                    <UserOutlined className="text-blue-600" />
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
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
                  className="rounded-xl font-bold"
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {staffList.map((s: any) => {
                    const isDisabled = s.status !== "active";
                    return (
                      <Select.Option
                        key={s.id}
                        value={s.id}
                        label={s.name}
                        disabled={isDisabled}
                      >
                        <div className="flex justify-between items-center w-full text-left">
                          <div className="flex flex-col">
                            <span
                              className={`font-bold ${
                                isDisabled ? "text-gray-400" : "text-gray-800"
                              }`}
                            >
                              {s.name}
                            </span>
                            <span className="text-[10px] text-blue-500 font-bold uppercase italic">
                              {s.position}
                            </span>
                          </div>
                          {s.status === "off" && (
                            <Tag
                              color="warning"
                              className="m-0 text-[8px] font-black uppercase rounded-full"
                            >
                              TẠM NGHỈ
                            </Tag>
                          )}
                          {s.status === "inactive" && (
                            <Tag
                              color="red"
                              className="m-0 text-[8px] font-black uppercase rounded-full"
                            >
                              DỪNG HĐ
                            </Tag>
                          )}
                        </div>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="work_date"
                label={
                  <Space>
                    <CalendarOutlined className="text-blue-600" />
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ngày làm việc
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  className="w-full rounded-xl h-[45px] font-bold"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="shift_id"
                className="md:col-span-2"
                label={
                  <Space>
                    <ClockCircleOutlined className="text-blue-600" />
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ca làm việc (Chọn nhiều ca lẻ)
                    </span>
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một ca làm",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn một hoặc nhiều ca lẻ"
                  size="large"
                  onChange={handleShiftChange}
                  className="rounded-xl font-bold"
                >
                  {shifts.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-black uppercase italic text-[13px]">
                          {s.name}
                        </span>
                        <Tag
                          color="blue"
                          className="m-0 border-none rounded-full font-bold text-[10px]"
                        >
                          {s.start_time.substring(0, 5)} -{" "}
                          {s.end_time.substring(0, 5)}
                        </Tag>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="note"
                className="md:col-span-2"
                label={
                  <Space>
                    <FormOutlined className="text-blue-600" />
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ghi chú
                    </span>
                  </Space>
                }
              >
                <Input.TextArea
                  rows={4}
                  className="rounded-2xl shadow-inner p-3 font-medium"
                />
              </Form.Item>
            </div>
            <Divider className="my-6 border-gray-100" />
            <div className="flex justify-end gap-4">
              <Button
                size="large"
                onClick={() => navigate(-1)}
                className="rounded-2xl h-12 px-10 font-black uppercase text-gray-400"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                className="rounded-2xl h-12 px-12 bg-blue-700 border-none font-black italic uppercase shadow-xl"
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

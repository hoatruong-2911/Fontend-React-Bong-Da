import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Avatar,
  message,
  Divider,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import shiftService, { Shift } from "@/services/admin/shiftService";
import api from "@/services/api";

const { Title, Text } = Typography;
const { TextArea } = Input;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function ShiftEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffInfo, setStaffInfo] = useState<any>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        // 1. Lấy danh sách các loại ca để đổ vào Select
        const shiftRes = await shiftService.getShifts();
        setShifts(shiftRes.data);

        if (id) {
          // 2. Gọi API lấy thông tin nhân viên (staff_id)
          // Sử dụng endpoint staff-shifts vì nó trả về thông tin Staff kèm assignments
          const res = await shiftService.getStaffShiftDetail(id);

          if (res.success) {
            const staff = res.data;
            setStaffInfo(staff);

            // Nếu bro muốn form mặc định hiện ca làm của NGÀY HÔM NAY của nhân viên đó
            const today = dayjs().format("YYYY-MM-DD");
            const todayShift = staff.assignments.find(
              (a) => a.work_date === today
            );

            form.setFieldsValue({
              work_date: dayjs(), // Mặc định chọn ngày hôm nay
              shift_id: todayShift?.shift_id, // Lấy ca của hôm nay nếu có
              note: todayShift?.note,
            });
          }
        }
      } catch (error) {
        message.error("Không thể tải thông tin nhân viên");
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);

      // Ép kiểu id sang number để khớp với Interface trong shiftService
      const staffId = id ? Number(id) : 0;

      const payload = {
        staff_id: staffId,
        shift_id: values.shift_id,
        work_date: values.work_date.format("YYYY-MM-DD"),
        note: values.note,
      };

      // LOG để kiểm tra payload trước khi gửi
      console.log(">>> [Payload gửi đi]:", payload);

      const res = await shiftService.assignShift(payload);

      if (res.success) {
        message.success("Cập nhật ca làm việc thành công!");
        navigate("/admin/shifts");
      }
    } catch (error: any) {
      message.error("Lỗi khi cập nhật dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="p-8 bg-[#064e3b] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl font-black uppercase italic border-none h-10 px-6 shadow-lg bg-white"
          >
            Hủy bỏ
          </Button>
          <Text className="text-white font-black italic uppercase tracking-widest text-[16px]">
            Chỉnh sửa lịch làm việc
          </Text>
        </div>

        <Card
          className="rounded-[32px] border-none shadow-2xl overflow-hidden bg-white/95 p-4"
          loading={loading}
        >
          <Row gutter={[32, 32]}>
            <Col
              xs={24}
              md={8}
              className="text-center md:border-r border-gray-100"
            >
              <Avatar
                size={120}
                src={
                  staffInfo?.avatar
                    ? `${STORAGE_URL}${staffInfo.avatar}`
                    : undefined
                }
                icon={<UserOutlined />}
                className="border-4 border-blue-50 shadow-xl mb-4"
              />
              <Title
                level={4}
                className="m-0 font-black uppercase italic text-gray-800"
              >
                {staffInfo?.name || "Đang tải..."}
              </Title>
              <Text className="text-blue-500 font-bold uppercase text-[12px] block mb-4">
                {staffInfo?.position || "N/A"}
              </Text>

              <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 mx-4">
                <Space>
                  <EditOutlined className="text-yellow-600" />
                  <Text className="text-[11px] font-black uppercase text-yellow-700 italic">
                    Chế độ chỉnh sửa
                  </Text>
                </Space>
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="p-2"
              >
                <Form.Item
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ngày làm việc
                    </span>
                  }
                  name="work_date"
                  rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                  <DatePicker
                    className="w-full h-12 rounded-xl font-bold border-gray-200"
                    format="DD/MM/YYYY"
                    suffixIcon={<CalendarOutlined className="text-blue-500" />}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ca làm việc
                    </span>
                  }
                  name="shift_id"
                  rules={[{ required: true, message: "Vui lòng chọn ca" }]}
                >
                  <Select
                    className="h-12 w-full rounded-xl font-bold"
                    placeholder="Chọn ca làm"
                  >
                    {shifts.map((s) => (
                      <Select.Option key={s.id} value={s.id}>
                        <span className="font-black">{s.name}</span>
                        <span className="text-gray-400 text-[12px] ml-2 italic">
                          ({s.start_time.substring(0, 5)} -{" "}
                          {s.end_time.substring(0, 5)})
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ghi chú điều chỉnh
                    </span>
                  }
                  name="note"
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập lý do thay đổi hoặc ghi chú cho nhân viên..."
                    className="rounded-xl font-medium p-4 border-gray-200 shadow-inner"
                  />
                </Form.Item>

                <Divider className="my-6 border-gray-100" />
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={submitting}
                    className="w-full h-14 rounded-2xl font-black uppercase italic text-[16px] bg-blue-700 shadow-xl border-none hover:bg-blue-800 transform transition-transform hover:scale-[1.01]"
                  >
                    Lưu thay đổi ngay
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}

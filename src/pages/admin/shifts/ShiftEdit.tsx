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
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import shiftService, { Shift } from "@/services/admin/shiftService";

const { Title, Text } = Typography;
const { TextArea } = Input;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function ShiftEdit() {
  const { id } = useParams<{ id: string }>(); // staff_id truyền từ Index
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // Hàm load ca làm theo ngày được chọn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFormByDate = (date: dayjs.Dayjs, assignments: any[]) => {
    const dateStr = date.format("YYYY-MM-DD");
    const dayShifts = assignments.filter((a) => a.work_date === dateStr);

    if (dayShifts.length > 0) {
      form.setFieldsValue({
        shift_id: dayShifts.map((a) => a.shift_id),
        note: dayShifts[0]?.note || "",
      });
    } else {
      // Nếu không có ca thì để mảng rỗng biểu thị trạng thái NGHỈ
      form.setFieldsValue({ shift_id: [], note: "" });
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const shiftRes = await shiftService.getShifts();
        setShifts(shiftRes.data);

        if (id) {
          const res = await shiftService.getStaffShiftDetail(id);
          if (res.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const staff: any = res.data;
            setStaffInfo(staff);

            // Kiểm tra trạng thái nhân sự
            if (staff.status !== "active") {
              setIsBlocked(true);
              const msg =
                staff.status === "inactive" ? "ĐÃ NGHỈ VIỆC" : "ĐANG TẠM NGHỈ";
              message.error(`Nhân viên này ${msg}, không thể chỉnh sửa!`);
            }

            // Mặc định lấy lịch ngày hôm nay
            updateFormByDate(dayjs(), staff.assignments);
          }
        }
      } catch (error) {
        message.error("Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [id, form]);

  const handleShiftChange = (selectedIds: number[]) => {
    const FULL_SHIFT_NAME = "Ca full";
    const fullShift = shifts.find(
      (s) => s.name.toLowerCase() === FULL_SHIFT_NAME.toLowerCase()
    );

    if (selectedIds.length === 0) return; // Cho phép mảng rỗng để Nghỉ lẻ

    const lastSelected = selectedIds[selectedIds.length - 1];
    let currentSelection = [...selectedIds];

    // Logic chặn Ca Full và ca lẻ lồng nhau
    if (fullShift) {
      if (lastSelected === fullShift.id) {
        currentSelection = [fullShift.id];
        message.warning("Đã chọn Ca Full: Tự động hủy các ca lẻ khác");
      } else if (
        currentSelection.includes(fullShift.id) &&
        currentSelection.length > 1
      ) {
        currentSelection = currentSelection.filter(
          (sid) => sid !== fullShift.id
        );
        message.info("Đã chọn ca lẻ: Tự động hủy Ca Full");
      }
    }

    form.setFieldsValue({ shift_id: currentSelection });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    if (isBlocked) return;
    try {
      setSubmitting(true);
      const payload = {
        staff_id: Number(id),
        shift_id: values.shift_id || [], // Gửi mảng rỗng nếu cho Nghỉ
        work_date: values.work_date.format("YYYY-MM-DD"),
        note: values.note,
      };

      const res = await shiftService.assignShift(payload);
      if (res.success) {
        message.success(res.message || "Cập nhật thành công!");
        navigate("/admin/shifts");
      }
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMsg =
        (error as any).response?.data?.message || "Lỗi khi cập nhật dữ liệu";
      message.error(errorMsg);
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

        {isBlocked && (
          <Alert
            message={
              <span className="font-black italic uppercase">
                Cảnh báo nhân sự
              </span>
            }
            description={`Nhân viên này hiện đang ở trạng thái ${
              staffInfo?.status === "inactive" ? "DỪNG HỢP ĐỒNG" : "TẠM NGHỈ"
            }. Bạn không thể thực hiện thao tác sửa lịch.`}
            type="error"
            showIcon
            icon={<StopOutlined />}
            className="rounded-2xl border-none shadow-lg mb-6 bg-red-50"
          />
        )}

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

              <div
                className={`mt-8 p-4 rounded-2xl border ${
                  isBlocked
                    ? "bg-red-50 border-red-100"
                    : "bg-yellow-50 border-yellow-100"
                } mx-4`}
              >
                <Space>
                  {isBlocked ? (
                    <StopOutlined className="text-red-600" />
                  ) : (
                    <EditOutlined className="text-yellow-600" />
                  )}
                  <Text
                    className={`text-[11px] font-black uppercase ${
                      isBlocked ? "text-red-700" : "text-yellow-700"
                    } italic`}
                  >
                    {isBlocked ? "Vô hiệu hóa" : "Chế độ chỉnh sửa"}
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
                disabled={isBlocked}
                className="p-2"
              >
                <Form.Item
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ngày làm việc (Chọn ngày để sửa ca)
                    </span>
                  }
                  name="work_date"
                  initialValue={dayjs()}
                  rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                  <DatePicker
                    className="w-full h-12 rounded-xl font-bold border-gray-200"
                    format="DD/MM/YYYY"
                    onChange={(date) => {
                      if (date && staffInfo)
                        updateFormByDate(date, staffInfo.assignments);
                    }}
                    suffixIcon={<CalendarOutlined className="text-blue-500" />}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-black uppercase text-[11px] text-blue-700 italic">
                      Ca làm việc (Xóa hết ca để cho Nghỉ lẻ)
                    </span>
                  }
                  name="shift_id"
                >
                  <Select
                    mode="multiple"
                    allowClear
                    className="h-12 w-full rounded-xl font-bold"
                    placeholder="Chọn ca làm hoặc xóa sạch để Nghỉ"
                    onChange={handleShiftChange}
                    maxTagCount="responsive"
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
                      Ghi chú
                    </span>
                  }
                  name="note"
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập lý do thay đổi..."
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
                    disabled={isBlocked}
                    className={`w-full h-14 rounded-2xl font-black uppercase italic text-[16px] border-none transform transition-transform hover:scale-[1.01] ${
                      isBlocked
                        ? "bg-gray-300"
                        : "bg-blue-700 shadow-xl shadow-blue-100"
                    }`}
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

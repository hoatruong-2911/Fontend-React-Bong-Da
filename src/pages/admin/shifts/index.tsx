import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Avatar,
  Button,
  Space,
  message,
  Input,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  ExportOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
// Import thêm locale tiếng Việt để ép Thứ 2 làm đầu tuần
import "dayjs/locale/vi";
import shiftService, {
  Shift,
  WeeklyScheduleData,
} from "@/services/admin/shiftService";

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

const getShiftColor = (name: string): string => {
  const colors: Record<string, string> = {
    "Ca sáng": "#006400",
    "Ca chiều": "#0000FF",
    "Ca tối": "#4B0082",
    "Ca full": "#D2691E",
    Nghỉ: "transparent",
  };
  return colors[name] || "#64748b";
};

export default function StaffShiftIndex() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs().locale("vi")); // Dùng locale vi
  const [scheduleData, setScheduleData] = useState<WeeklyScheduleData | null>(
    null
  );
  const [searchText, setSearchText] = useState<string>("");

  const fetchSchedule = async (date: Dayjs): Promise<void> => {
    try {
      setLoading(true);
      const res = await shiftService.getWeeklyAssignments(
        date.format("YYYY-MM-DD")
      );
      if (res.success) setScheduleData(res.data);
    } catch (error: unknown) {
      message.error("Không thể tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(currentDate);
  }, [currentDate]);

  // FIX LỖI THỨ 2: Lấy chính xác 7 ngày từ Thứ 2 đến Chủ Nhật
  const weekDays = useMemo(() => {
    // startOf("week") với locale "vi" sẽ trả về Thứ 2
    const start = currentDate.locale("vi").startOf("week");
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
  }, [currentDate]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredStaff = useMemo((): any[] => {
    if (!scheduleData) return [];
    return scheduleData.staff_schedules.filter((s) =>
      s.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [scheduleData, searchText]);

  const handleDeleteStaffAssignments = async (
    staffId: number
  ): Promise<void> => {
    try {
      if (!scheduleData) return;
      message.loading({ content: "Đang xử lý...", key: "del_assignment" });
      const { start, end } = scheduleData.week_range;
      const startDate = dayjs(start, "DD/MM/YYYY").format("YYYY-MM-DD");
      const endDate = dayjs(end, "DD/MM/YYYY").format("YYYY-MM-DD");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await shiftService.removeStaffWeeklyAssignments(
        staffId,
        startDate,
        endDate
      );
      if (res.success) {
        message.success({ content: res.message, key: "del_assignment" });
        fetchSchedule(currentDate);
      }
    } catch (error) {
      message.error({
        content: "Không thể xóa lịch làm việc",
        key: "del_assignment",
      });
    }
  };

  const columns = [
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          NHÂN VIÊN
        </span>
      ),
      key: "staff",
      fixed: "left" as const,
      width: 220,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => (
        <Space size="middle">
          <Avatar
            size={40}
            src={record.avatar ? `${STORAGE_URL}${record.avatar}` : undefined}
            icon={<UserOutlined />}
            className="border border-blue-100 shadow-sm"
          />
          <div className="flex flex-col">
            <Text className="text-[13px] font-black text-gray-800 uppercase italic leading-tight">
              {record.name}
            </Text>
            <Text className="text-[10px] text-blue-500 font-bold uppercase">
              {record.department?.name || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    ...weekDays.map((day) => ({
      title: (
        <div className="text-center py-1">
          <div className="text-[10px] text-gray-400 font-black uppercase italic">
            {/* Locale VI: 0 là Thứ 2, 6 là Chủ Nhật */}
            {day.day() === 0 ? "CN" : `T${day.day() + 1}`}
          </div>
          <div className="text-[12px] font-bold text-blue-900">
            {day.format("DD/MM")}
          </div>
        </div>
      ),
      key: day.format("YYYY-MM-DD"),
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => {
        if (record.status === "inactive")
          return (
            <Tag
              color="default"
              className="opacity-40 grayscale border-none font-black italic text-[9px]"
            >
              DỪNG HĐ
            </Tag>
          );
        if (record.status === "off")
          return (
            <Tag
              color="orange"
              className="border-none font-black italic text-[9px]"
            >
              TẠM NGHỈ
            </Tag>
          );

        const dateStr = day.format("YYYY-MM-DD");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayAssignments = record.assignments.filter(
          (a: any) => a.work_date === dateStr
        );

        if (dayAssignments.length > 0) {
          return (
            <Space
              direction="vertical"
              size={4}
              className="w-full items-center"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {dayAssignments.map((assignment: any) => (
                <Tag
                  key={assignment.id}
                  className="border-none rounded-full px-4 py-1 font-black italic text-[9px] m-0 shadow-md w-[85px] text-center"
                  style={{
                    backgroundColor: getShiftColor(
                      assignment.shift?.name || ""
                    ),
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/admin/shifts/edit/${record.id}`)}
                >
                  {assignment.shift?.name.toUpperCase()}
                </Tag>
              ))}
            </Space>
          );
        }
        return (
          <Text className="text-gray-300 font-black italic uppercase text-[10px]">
            NGHỈ
          </Text>
        );
      },
    })),
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          THAO TÁC
        </span>
      ),
      key: "action",
      align: "right" as const,
      fixed: "right" as const,
      width: 140,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="flex items-center justify-center rounded-md border-gray-300 text-blue-500 shadow-sm"
              onClick={() => navigate(`/admin/shifts/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              className="flex items-center justify-center rounded-md shadow-sm bg-blue-600 border-blue-600"
              onClick={() => navigate(`/admin/shifts/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa lịch làm?"
            onConfirm={() => handleDeleteStaffAssignments(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                size="small"
                className="flex items-center justify-center rounded-md shadow-sm"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen space-y-8">
      <Card className="rounded-2xl border-none shadow-xl bg-white/95">
        <Space size="large" wrap>
          <Text className="text-gray-400 font-black italic text-[11px] uppercase tracking-widest">
            LOẠI CA:
          </Text>
          {scheduleData?.shifts.map((s: Shift) => (
            <Space
              key={s.id}
              size={6}
              className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getShiftColor(s.name) }}
              />
              <Text className="text-[11px] font-black text-gray-600 uppercase">
                {s.name}:{" "}
                <span className="text-blue-600 font-black">
                  {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                </span>
              </Text>
            </Space>
          ))}
        </Space>
      </Card>
      {/* Giữ nguyên phần Stats và Table phía dưới như code gốc của bro */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={4}>
          <Card className="rounded-[24px] border-none shadow-lg text-center bg-white border-t-4 border-blue-600">
            <Text className="text-gray-400 font-black text-[10px] uppercase italic">
              TỔNG CA TUẦN NÀY
            </Text>
            <div className="flex items-center justify-center gap-3 mt-2">
              <ClockCircleOutlined className="text-3xl text-gray-800" />
              <Title level={2} className="m-0! italic font-black text-gray-900">
                {scheduleData?.stats.total_week || 0}
              </Title>
            </div>
          </Card>
        </Col>
        {scheduleData?.shifts.map((s: Shift) => (
          <Col xs={24} sm={12} lg={4} key={s.id}>
            <Card
              className="rounded-[24px] border-none shadow-lg relative overflow-hidden text-center bg-white border-t-4"
              style={{ borderTopColor: getShiftColor(s.name) }}
            >
              <Text className="text-gray-400 font-black text-[10px] uppercase italic">
                {s.name}
              </Text>
              <Title
                level={2}
                style={{ color: getShiftColor(s.name) }}
                className="m-0! mt-2 italic font-black"
              >
                {scheduleData?.stats.counts[s.name] || 0}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="rounded-[32px] border-none shadow-2xl overflow-hidden bg-white/95">
        <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
          <Space wrap size="middle">
            <Button.Group className="rounded-xl overflow-hidden shadow-sm">
              <Button
                icon={<LeftOutlined />}
                onClick={() =>
                  setCurrentDate((prev) => prev.subtract(1, "week"))
                }
              />
              <Button
                onClick={() => setCurrentDate(dayjs())}
                className="font-black uppercase italic text-[11px] bg-gray-50"
              >
                TUẦN NÀY
              </Button>
              <Button
                icon={<RightOutlined />}
                onClick={() => setCurrentDate((prev) => prev.add(1, "week"))}
              />
            </Button.Group>
            <Input
              placeholder="Tìm kiếm nhân viên..."
              prefix={<SearchOutlined className="text-blue-500" />}
              className="w-72 rounded-xl h-10 shadow-inner font-bold"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Space>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/shifts/add")}
              className="h-11 px-8 rounded-2xl bg-blue-700 font-black italic uppercase shadow-xl hover:scale-105 transition-all"
            >
              THÊM CA LÀM
            </Button>
            <Button
              icon={<ExportOutlined />}
              className="rounded-2xl h-11 px-6 font-black uppercase italic text-[11px] border-gray-300"
            >
              XUẤT BÁO CÁO
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1300 }}
          className="staff-shift-table custom-table-bold"
        />
      </Card>
    </div>
  );
}

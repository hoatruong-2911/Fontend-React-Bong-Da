import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Avatar,
  DatePicker,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExportOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import attendanceService, {
  AttendanceRecord,
  AttendanceStats,
} from "@/services/admin/attendanceService";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function AttendanceManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  const fetchAttendance = async (date: Dayjs) => {
    try {
      setLoading(true);
      const res = await attendanceService.getAttendances(
        date.format("YYYY-MM-DD")
      );

      // LOG DỮ LIỆU ĐỂ KIỂM TRA
      console.log(">>> RECORDS FROM API:", res.data);

      if (res.success) {
        setRecords(res.data);
        setStats(res.stats);
      }
    } catch (error: unknown) {
      message.error("Lỗi tải dữ liệu");
      console.error(">>> LỖI API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleDelete = async (id: number) => {
    try {
      const res = await attendanceService.deleteAttendance(id);
      if (res.success) {
        message.success("Xóa bản ghi thành công");
        fetchAttendance(selectedDate);
      }
    } catch (error: unknown) {
      message.error("Lỗi khi xóa bản ghi");
    }
  };

  const filteredData = records.filter((item) => {
    const matchSearch = item.staff.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusTag = (status: AttendanceRecord["status"]) => {
    const statusMap: Record<
      string,
      { color: string; text: string; icon: React.ReactNode }
    > = {
      present: {
        color: "success",
        text: "Có mặt",
        icon: <CheckCircleOutlined />,
      },
      late: {
        color: "warning",
        text: "Đi muộn",
        icon: <ClockCircleOutlined />,
      },
      absent: {
        color: "error",
        text: "Vắng mặt",
        icon: <CloseCircleOutlined />,
      },
      leave: {
        color: "default",
        text: "Nghỉ phép",
        icon: <CalendarOutlined />,
      },
    };
    const { color, text, icon } = statusMap[status] || {
      color: "default",
      text: status,
      icon: null,
    };
    return (
      <Tag color={color} icon={icon} className="rounded-full font-bold px-3">
        {text.toUpperCase()}
      </Tag>
    );
  };

  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: (
        <span className="font-black text-[11px] uppercase">Nhân viên</span>
      ),
      key: "staff",
      fixed: "left",
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={
              record.staff.avatar
                ? `${STORAGE_URL}${record.staff.avatar}`
                : undefined
            }
            icon={<UserOutlined />}
            className="border border-blue-100 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-black italic uppercase text-[13px]">
              {record.staff.name}
            </span>
            <span className="text-[10px] font-bold text-blue-500 uppercase">
              {record.staff.position}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-center block">
          Giờ vào
        </span>
      ),
      dataIndex: "check_in",
      align: "center",
      render: (t: string | null) => (
        <span className="font-black">{t?.substring(0, 5) || "--:--"}</span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-center block">
          Giờ ra
        </span>
      ),
      dataIndex: "check_out",
      align: "center",
      render: (t: string | null) => (
        <span className="font-black">{t?.substring(0, 5) || "--:--"}</span>
      ),
    },
    {
      title: <span className="font-black text-[11px] uppercase">Giờ làm</span>,
      dataIndex: "work_hours",
      align: "center",
      render: (h: number, record) => {
        const workHours = Math.abs(Number(h || 0));
        const isRed = record.status === "late";
        return (
          <span
            className={`font-black italic text-[14px] ${
              isRed ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {workHours.toFixed(2)}H
          </span>
        );
      },
    },
    {
      title: <span className="font-black text-[11px] uppercase">Tăng ca</span>,
      dataIndex: "overtime_hours",
      align: "center",
      render: (h: number) => {
        const otHours = Math.abs(Number(h || 0));
        return otHours > 0 ? (
          <Tag
            color="blue"
            className="rounded-lg font-black border-none shadow-sm"
          >
            +{otHours.toFixed(2)}H
          </Tag>
        ) : (
          <span className="text-gray-300 font-bold italic">0.00H</span>
        );
      },
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Trạng thái</span>
      ),
      dataIndex: "status",
      render: (s: AttendanceRecord["status"]) => getStatusTag(s),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-blue-700">
          Thao tác
        </span>
      ),
      key: "actions",
      fixed: "right",
      width: 150,
      align: "right" as const,
      render: (record: AttendanceRecord) => (
        <Space size="middle">
          {/* Nút Xem chi tiết - Màu xanh lá emerald */}
          <Tooltip title="Xem chi tiết">
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 border-emerald-500 hover:border-emerald-600 text-white flex items-center justify-center rounded-lg shadow-sm"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/attendances/${record.id}`)}
            />
          </Tooltip>

          {/* Nút Chỉnh sửa - Màu xanh dương */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 flex items-center justify-center rounded-lg shadow-sm"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin/attendances/edit/${record.id}`)}
            />
          </Tooltip>

          {/* Nút Xóa - Màu đỏ bọc trong Popconfirm */}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa bản ghi chấm công này?"
              description="Dữ liệu chấm công của nhân viên sẽ bị mất hoàn toàn!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                className: "rounded-lg font-bold",
              }}
              cancelButtonProps={{ className: "rounded-lg font-bold" }}
            >
              <Button
                danger
                className="flex items-center justify-center rounded-lg shadow-sm hover:bg-red-50"
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen space-y-6 text-white">
      <Row gutter={[16, 16]}>
        {[
          {
            title: "TỔNG NHÂN SỰ",
            value: stats?.total_staff,
            color: "#1890ff",
            icon: <UserOutlined />,
          },
          {
            title: "CÓ MẶT",
            value: stats?.present,
            color: "#52c41a",
            icon: <CheckCircleOutlined />,
          },
          {
            title: "ĐI MUỘN",
            value: stats?.late,
            color: "#faad14",
            icon: <ClockCircleOutlined />,
          },
          {
            title: "NGHỈ PHÉP",
            value: stats?.leave || 0,
            color: "#8c8c8c",
            icon: <CalendarOutlined />,
          },
          {
            title: "VẮNG MẶT",
            value: stats?.absent,
            color: "#ff4d4f",
            icon: <CloseCircleOutlined />,
          },
        ].map((item, index) => (
          <Col
            xs={24}
            sm={12}
            md={4}
            lg={4.8}
            key={index}
            style={{ flex: "1 0 20%" }}
          >
            <Card className="rounded-2xl border-none shadow-lg relative overflow-hidden h-full">
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: item.color }}
              />
              <Statistic
                title={
                  <span className="font-black text-[10px] text-gray-400 italic uppercase">
                    {item.title}
                  </span>
                }
                value={item.value || 0}
                valueStyle={{ color: item.color, fontWeight: 900 }}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 overflow-hidden text-gray-800">
        <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
          <Space wrap size="middle">
            <DatePicker
              value={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              format="DD/MM/YYYY"
              className="rounded-xl h-10 font-bold border-gray-100 shadow-sm"
              allowClear={false}
            />
            <Input
              placeholder="Tìm nhân viên..."
              prefix={<SearchOutlined className="text-blue-500" />}
              className="w-64 rounded-xl h-10 border-gray-100 font-bold shadow-sm"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="all"
              className="w-32 h-10 font-black italic shadow-sm"
              onChange={setStatusFilter}
            >
              <Select.Option value="all">TẤT CẢ</Select.Option>
              <Select.Option value="present">CÓ MẶT</Select.Option>
              <Select.Option value="late">ĐI MUỘN</Select.Option>
              <Select.Option value="absent">VẮNG MẶT</Select.Option>
              <Select.Option value="leave">NGHỈ PHÉP</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              className="h-10 rounded-xl bg-blue-700 font-black italic uppercase shadow-md border-none"
              onClick={() => navigate("/admin/attendances/add")}
            >
              Chấm công
            </Button>
            <Button
              icon={<ExportOutlined />}
              className="h-10 rounded-xl font-black italic uppercase border-gray-200 shadow-sm"
            >
              Báo cáo
            </Button>
          </Space>
        </div>
        <Table
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          className="custom-table-bold"
          pagination={{ pageSize: 10, className: "p-4 font-bold" }}
        />
      </Card>
    </div>
  );
}

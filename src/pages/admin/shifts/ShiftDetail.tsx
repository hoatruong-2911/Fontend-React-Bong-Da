import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Table,
  Button,
  Space,
  Statistic,
  Divider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import shiftService, {
  StaffSchedule,
  ShiftAssignment,
} from "@/services/admin/shiftService";

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

// Đồng bộ hàm lấy màu đậm từ trang Index
const getShiftColor = (name: string): string => {
  const colors: Record<string, string> = {
    "Ca sáng": "#006400", // Xanh lá đậm
    "Ca chiều": "#0000FF", // Xanh dương thuần
    "Ca tối": "#4B0082", // Tím đậm
    "Ca full": "#D2691E", // Cam đất đậm
    Nghỉ: "#64748b", // Xám đậm
  };
  return colors[name] || "#64748b";
};

export default function ShiftDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [staffData, setStaffData] = useState<StaffSchedule | null>(null);

  // Lấy dữ liệu chi tiết nhân viên và lịch làm
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (id) {
          // Gọi hàm service mới dẫn tới /admin/staff-shifts/${id}
          const res = await shiftService.getStaffShiftDetail(id);
          if (res.success) {
            setStaffData(res.data);
          }
        }
      } catch (error: any) {
        message.error("Không thể tải chi tiết lịch làm việc");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const columns = [
    {
      title: (
        <span className="font-black uppercase text-[11px] text-blue-700">
          Ngày làm việc
        </span>
      ),
      dataIndex: "work_date",
      key: "work_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined className="text-blue-500" />
          <Text className="font-bold">{dayjs(date).format("DD/MM/YYYY")}</Text>
          <Text className="text-[11px] italic text-gray-400">
            ({dayjs(date).format("dddd")})
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <span className="font-black uppercase text-[11px] text-blue-700">
          Ca làm
        </span>
      ),
      key: "shift",
      render: (record: ShiftAssignment) => {
        const shiftName = record.shift?.name || "Nghỉ";
        return (
          <Tag
            style={{
              backgroundColor: record.shift
                ? getShiftColor(shiftName)
                : "transparent",
              color: record.shift ? "#fff" : "#94a3b8",
              border: record.shift ? "none" : "1px solid #e2e8f0",
              minWidth: "100px",
              textAlign: "center",
            }}
            className="font-black italic px-4 rounded-full text-[10px] shadow-sm"
          >
            {record.shift
              ? `${record.shift.name.toUpperCase()} (${record.shift.start_time.substring(
                  0,
                  5
                )} - ${record.shift.end_time.substring(0, 5)})`
              : "NGHỈ"}
          </Tag>
        );
      },
    },
    {
      title: (
        <span className="font-black uppercase text-[11px] text-blue-700">
          Ghi chú
        </span>
      ),
      dataIndex: "note",
      key: "note",
      render: (note: string) =>
        note ? (
          <Text className="text-[12px] font-medium">{note}</Text>
        ) : (
          <Text type="secondary" className="italic text-[11px]">
            Không có ghi chú
          </Text>
        ),
    },
    {
      title: (
        <span className="font-black uppercase text-[11px] text-blue-700">
          Trạng thái
        </span>
      ),
      key: "status",
      align: "center" as const,
      render: (record: ShiftAssignment) => {
        const isPast = dayjs(record.work_date).isBefore(dayjs(), "day");
        return isPast ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="rounded-md font-black uppercase text-[9px] border-none"
          >
            Hoàn thành
          </Tag>
        ) : (
          <Tag
            icon={<ClockCircleOutlined />}
            color="processing"
            className="rounded-md font-black uppercase text-[9px] border-none"
          >
            Sắp tới
          </Tag>
        );
      },
    },
  ];

  if (!staffData && !loading)
    return <div className="p-8 text-white">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Back Button */}
        <div className="flex justify-between items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl font-black uppercase italic border-none h-10 px-6 shadow-lg bg-white hover:text-blue-600"
          >
            Quay lại bảng lịch
          </Button>
          <Text className="text-white font-black italic uppercase tracking-widest text-[16px]">
            CHI TIẾT LỊCH CÔNG TÁC:{" "}
            <span className="text-yellow-400">
              {staffData?.name.toUpperCase()}
            </span>
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Cột trái: Thông tin nhân viên */}
          <Col xs={24} lg={8}>
            <Card className="rounded-[32px] border-none shadow-2xl overflow-hidden text-center p-6 bg-white/95 backdrop-blur-md">
              <Avatar
                size={140}
                src={
                  staffData?.avatar
                    ? `${STORAGE_URL}${staffData.avatar}`
                    : undefined
                }
                icon={<UserOutlined />}
                className="border-4 border-blue-100 shadow-2xl mb-6 mx-auto"
              />
              <Title
                level={2}
                className="m-0! font-black uppercase italic text-gray-800 tracking-tighter"
              >
                {staffData?.name}
              </Title>
              <Text className="text-blue-600 font-black uppercase italic text-[12px] block mb-6 tracking-widest">
                {staffData?.position} — {staffData?.department?.name}
              </Text>

              <Divider className="my-6 border-gray-100" />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text className="text-[10px] font-black uppercase text-gray-400 italic">
                        Tổng số ca
                      </Text>
                    }
                    value={staffData?.assignments.length || 0}
                    valueStyle={{
                      fontWeight: 900,
                      color: "#1e3a8a",
                      fontStyle: "italic",
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text className="text-[10px] font-black uppercase text-gray-400 italic">
                        Hiệu suất tuần
                      </Text>
                    }
                    value={100}
                    suffix="%"
                    valueStyle={{
                      fontWeight: 900,
                      color: "#10b981",
                      fontStyle: "italic",
                    }}
                  />
                </Col>
              </Row>
            </Card>

            <Card className="rounded-[24px] border-none shadow-xl mt-6 p-4 bg-white/90">
              <Space direction="vertical" className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <InfoCircleOutlined className="text-blue-500" />
                  <Text className="text-[11px] font-black uppercase italic text-blue-700">
                    Lưu ý vận hành:
                  </Text>
                </div>
                <Text className="text-[12px] text-gray-500 italic block leading-relaxed">
                  Dữ liệu lịch làm việc được đồng bộ trực tiếp từ hệ thống phân
                  ca của Admin. Mọi thay đổi sẽ được ghi nhận vào nhật ký hệ
                  thống.
                </Text>
              </Space>
            </Card>
          </Col>

          {/* Cột phải: Bảng danh sách ca làm */}
          <Col xs={24} lg={16}>
            <Card className="rounded-[32px] border-none shadow-2xl overflow-hidden bg-white/95 h-full">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <Title
                  level={4}
                  className="m-0! font-black italic uppercase text-blue-900 tracking-wider"
                >
                  Nhật ký phân ca chi tiết
                </Title>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="rounded-xl font-black italic uppercase text-[10px] h-9 bg-blue-700 shadow-md"
                >
                  Xuất báo cáo cá nhân
                </Button>
              </div>

              <Table
                columns={columns}
                dataSource={staffData?.assignments || []}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
                className="custom-detail-table"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

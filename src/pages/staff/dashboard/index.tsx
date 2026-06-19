import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Avatar,
  Typography,
  Badge,
  Descriptions,
  Button,
  Spin,
  message,
  Space,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  PlusOutlined,
  LoadingOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dashboardService, {
  StaffInfo,
  StaffDashboardStats,
} from "@/services/staff/dashboardService";

const { Title, Text } = Typography;

export default function StaffDashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [stats, setStats] = useState<StaffDashboardStats | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getOverview();
      if (response.success) {
        setStaffInfo(response.data.staff);
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error("Không thể tải dữ liệu Dashboard nhân viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
        <Text className="mt-4 font-bold italic text-slate-400 uppercase">
          Đang nạp năng lượng hệ thống Staff...
        </Text>
      </div>
    );
  }

  if (!staffInfo || !stats) return <Text>Không có dữ liệu hiển thị.</Text>;

  const avatarUrl = staffInfo.avatar
    ? staffInfo.avatar.trim().startsWith("http")
      ? staffInfo.avatar.trim()
      : `http://127.0.0.1:8000/storage/${staffInfo.avatar
          .trim()
          .replace(/^\//, "")
          .replace(/^storage\//, "")}`
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <Statistic
              title={
                <span className="font-bold uppercase text-[11px] text-slate-500 italic">
                  Doanh thu hôm nay
                </span>
              }
              value={Number(stats.todayRevenue || 0)}
              formatter={(val) => `${val.toLocaleString()}đ`}
              valueStyle={{
                color: "#10b981",
                fontWeight: 900,
                fontStyle: "italic",
              }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <Statistic
              title={
                <span className="font-bold uppercase text-[11px] text-slate-500 italic">
                  Đơn hàng hôm nay
                </span>
              }
              value={Number(stats.ordersToday || 0)}
              valueStyle={{ fontWeight: 900, fontStyle: "italic" }}
              prefix={<ShoppingOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <Statistic
              title={
                <span className="font-bold uppercase text-[11px] text-slate-500 italic">
                  Booking chờ xử lý
                </span>
              }
              value={stats.pendingBookings}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{
                color: "#f97316",
                fontWeight: 900,
                fontStyle: "italic",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <Statistic
              title={
                <span className="font-bold uppercase text-[11px] text-slate-500 italic">
                  Đánh giá trung bình
                </span>
              }
              value={stats.rating}
              precision={1}
              valueStyle={{
                color: "#faad14",
                fontWeight: 900,
                fontStyle: "italic",
              }}
              prefix={<StarOutlined />}
              suffix="/ 5.0"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Text className="font-black uppercase italic text-slate-600">
            Thông tin nhân viên
          </Text>
        }
        className="shadow-sm"
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item
            label={
              <Text strong italic>
                Họ tên
              </Text>
            }
          >
            <Space size="middle">
              <Avatar
                src={avatarUrl}
                icon={
                  staffInfo.position === "Admin" ? (
                    <CrownOutlined />
                  ) : (
                    <UserOutlined />
                  )
                }
                className={
                  staffInfo.position === "Admin"
                    ? "bg-orange-500"
                    : "bg-emerald-500"
                }
              />
              <Text strong>{staffInfo.name}</Text>
              {staffInfo.position === "Admin" && (
                <Badge
                  count="VIP"
                  style={{ backgroundColor: "#f5222d", fontSize: "10px" }}
                />
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Chức vụ
              </Text>
            }
          >
            {staffInfo.position === "Admin" ? (
              <Text className="text-red-500 font-bold uppercase italic">
                Quản trị viên (Admin)
              </Text>
            ) : (
              staffInfo.position
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Bộ phận
              </Text>
            }
          >
            {staffInfo.position === "Admin"
              ? "Ban quản trị hệ thống"
              : staffInfo.department}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Ca làm việc
              </Text>
            }
          >
            {staffInfo.position === "Admin"
              ? "Toàn thời gian (24/7)"
              : staffInfo.shift}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Số điện thoại
              </Text>
            }
          >
            {staffInfo.phone}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Email
              </Text>
            }
          >
            {staffInfo.email}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Text strong italic>
                Trạng thái
              </Text>
            }
          >
            <Badge
              status={staffInfo.status === "active" ? "success" : "error"}
              text={
                staffInfo.position === "Admin"
                  ? "Admin đang sử dụng"
                  : staffInfo.status === "active"
                    ? "Đang làm việc"
                    : "Nghỉ"
              }
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <Text className="font-black uppercase italic text-slate-600">
            Thao tác nhanh
          </Text>
        }
        className="shadow-sm"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              size="large"
              block
              icon={<CalendarOutlined />}
              onClick={() => navigate("/staff/bookings")}
              className="font-bold italic uppercase h-[60px] bg-gradient-to-r from-emerald-500 to-teal-500 border-none shadow-lg shadow-emerald-100"
            >
              Duyệt Booking ({stats.pendingBookings})
            </Button>
          </Col>
          {/* <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<FieldTimeOutlined />}
              onClick={() => navigate("/staff/fields")}
              className="font-bold italic uppercase h-[60px] border-emerald-500 text-emerald-600 hover:!bg-emerald-50 shadow-sm"
            >
              Quản lý sân ({stats.playingFields} đang chơi)
            </Button>
          </Col> */}
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/staff/orders")}
              className="font-bold italic uppercase h-[60px] shadow-sm"
            >
              Quản lý đơn hàng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<PlusOutlined />}
              onClick={() => navigate("/staff/fields")}
              className="font-bold italic uppercase h-[60px] shadow-sm"
            >
              Bắt đầu sân
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Text className="font-black uppercase italic text-slate-600">
                Hiệu suất tổng thể
              </Text>
            }
            className="shadow-sm h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <Text className="italic font-medium text-slate-500">
                  Tổng đơn hàng đã xử lý
                </Text>
                <Text className="text-lg font-black italic text-blue-600">
                  {stats.totalOrders}
                </Text>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <Text className="italic font-medium text-slate-500">
                  Tổng doanh thu mang lại
                </Text>
                <Text className="text-xl font-black italic text-emerald-600">
                  {Number(stats.totalRevenue || 0).toLocaleString()}đ
                </Text>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <Text className="italic font-medium text-slate-500">
                  Số lượt sân đã quản lý
                </Text>
                <Text className="text-lg font-black italic text-orange-600">
                  {stats.fieldsManaged}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <Text className="font-black uppercase italic text-slate-600">
                Lịch làm tháng {new Date().getMonth() + 1}
              </Text>
            }
            className="shadow-sm h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between py-1 items-center">
                <Text className="italic text-slate-500">
                  Tổng số ca trực tháng này
                </Text>
                <Text className="font-black italic text-slate-800">
                  {stats.attendance.totalShifts} ca
                </Text>
              </div>
              <div className="flex justify-between py-1 items-center">
                <Text className="italic text-slate-500">
                  Số ca đã hoàn thành
                </Text>
                <Text className="font-black italic text-green-600">
                  {stats.attendance.completedShifts} ca
                </Text>
              </div>
              <div className="flex justify-between py-1 items-center">
                <Text className="italic text-slate-500">
                  Số ca còn lại dự kiến
                </Text>
                <Text className="font-black italic text-orange-500">
                  {stats.attendance.remainingShifts} ca
                </Text>
              </div>
              <div className="flex justify-between py-2 border-t border-emerald-100 mt-2">
                <Text className="font-black uppercase italic text-emerald-800">
                  Tổng giờ làm thực tế
                </Text>
                <Text className="text-xl font-black italic text-emerald-700">
                  {stats.attendance.totalHours} giờ
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

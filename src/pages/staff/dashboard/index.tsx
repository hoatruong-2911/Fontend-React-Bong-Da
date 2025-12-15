import { useState } from "react";
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
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { currentStaff, currentStaffStats } from "@/data/mockStaff";
import { mockBookings } from "@/data/mockBookings";

const { Title, Text } = Typography;

export default function StaffDashboardOverview() {
  const navigate = useNavigate();
  
  const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed');
  const playingBookings = mockBookings.filter(b => b.status === 'playing');

  return (
    <div className="space-y-6">
      {/* Thống kê nhanh */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-emerald-500">
            <Statistic
              title="Doanh thu hôm nay"
              value={currentStaffStats.todayRevenue}
              precision={0}
              valueStyle={{ color: "#10b981" }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-blue-500">
            <Statistic
              title="Đơn hàng hôm nay"
              value={currentStaffStats.ordersToday}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-orange-500">
            <Statistic
              title="Booking chờ xử lý"
              value={confirmedBookings.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#f97316" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-l-4 border-l-yellow-500">
            <Statistic
              title="Đánh giá"
              value={currentStaffStats.rating}
              precision={1}
              valueStyle={{ color: "#faad14" }}
              prefix={<StarOutlined />}
              suffix="/ 5.0"
            />
          </Card>
        </Col>
      </Row>

      {/* Thông tin cá nhân */}
      <Card title="Thông tin nhân viên">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Họ tên">
            <div className="flex items-center gap-2">
              <Avatar src={currentStaff.avatar} icon={<UserOutlined />} />
              <strong>{currentStaff.name}</strong>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">{currentStaff.position}</Descriptions.Item>
          <Descriptions.Item label="Bộ phận">{currentStaff.department}</Descriptions.Item>
          <Descriptions.Item label="Ca làm việc">{currentStaff.shift}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{currentStaff.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{currentStaff.email}</Descriptions.Item>
          <Descriptions.Item label="Lương cơ bản">
            {currentStaff.salary.toLocaleString()}đ
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng tháng này">
            {currentStaff.bonus.toLocaleString()}đ
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge status="success" text="Đang làm việc" />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              size="large"
              block
              icon={<CalendarOutlined />}
              onClick={() => navigate('/staff/bookings')}
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', height: 60 }}
            >
              Xem booking chờ ({confirmedBookings.length})
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<FieldTimeOutlined />}
              onClick={() => navigate('/staff/fields')}
              style={{ height: 60 }}
            >
              Quản lý sân ({playingBookings.length} đang chơi)
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/staff/orders')}
              style={{ height: 60 }}
            >
              Quản lý đơn hàng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              block
              icon={<PlusOutlined />}
              onClick={() => navigate('/staff/fields')}
              style={{ height: 60 }}
            >
              Bắt đầu sân (Walk-in)
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tổng hợp hiệu suất */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Hiệu suất tổng thể">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Tổng đơn hàng</Text>
                <Text strong>{currentStaffStats.totalOrders}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text>Tổng doanh thu</Text>
                <Text strong className="text-emerald-600">
                  {currentStaffStats.totalRevenue.toLocaleString()}đ
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text>Sân đã quản lý</Text>
                <Text strong>{currentStaffStats.fieldsManaged}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Ca làm việc tháng này">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Tổng số ca</Text>
                <Text strong>24 ca</Text>
              </div>
              <div className="flex justify-between">
                <Text>Đã làm</Text>
                <Text strong className="text-green-600">18 ca</Text>
              </div>
              <div className="flex justify-between">
                <Text>Còn lại</Text>
                <Text strong>6 ca</Text>
              </div>
              <div className="flex justify-between">
                <Text>Tổng giờ làm</Text>
                <Text strong>144 giờ</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
import React from "react";
import { Card, Row, Col, Statistic, Progress, Typography, Space } from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { StaffDashboardStats } from "@/services/staff/dashboardService";
import { Tag } from "lucide-react";

const { Text } = Typography;

interface Props {
  stats: StaffDashboardStats;
}

const Performance: React.FC<Props> = ({ stats }) => {
  // ✅ Tính toán an toàn để tránh lỗi chia cho 0
  const attendancePercent = stats.attendance.totalShifts > 0 
    ? Math.round((stats.attendance.completedShifts / stats.attendance.totalShifts) * 100) 
    : 0;

  const revenueGoal = 50000000; // 50 Triệu
  const revenuePercent = Math.min(Math.round((stats.totalRevenue / revenueGoal) * 100), 100);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="rounded-3xl border-none shadow-sm bg-emerald-50/50 hover:shadow-md transition-all">
            <Statistic
              title={
                <Text className="font-black italic uppercase text-[10px] text-emerald-600 tracking-wider">
                  Tổng doanh thu mang về
                </Text>
              }
              value={stats.totalRevenue}
              formatter={(val) => `${Number(val).toLocaleString()}đ`}
              valueStyle={{
                color: "#059669",
                fontWeight: 900,
                fontStyle: "italic",
              }}
              prefix={<DollarOutlined />}
            />
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <Text className="text-[11px] text-slate-400 italic">Tiến độ mục tiêu tháng</Text>
                <Text className="text-[11px] font-bold text-emerald-600">{revenuePercent}%</Text>
              </div>
              <Progress
                percent={revenuePercent}
                status="active"
                strokeColor="#10b981"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="rounded-3xl border-none shadow-sm bg-blue-50/50 hover:shadow-md transition-all">
            <Statistic
              title={
                <Text className="font-black italic uppercase text-[10px] text-blue-600 tracking-wider">
                  Đơn hàng đã chốt
                </Text>
              }
              value={stats.totalOrders}
              valueStyle={{
                color: "#2563eb",
                fontWeight: 900,
                fontStyle: "italic",
              }}
              prefix={<ShoppingOutlined />}
            />
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <Text className="text-[11px] text-slate-400 italic">Độ hài lòng khách hàng</Text>
                <Text className="text-[11px] font-bold text-blue-600">{stats.rating}/5.0</Text>
              </div>
              <Progress
                percent={stats.rating * 20}
                strokeColor="#3b82f6"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span className="font-black italic uppercase text-slate-500 text-[11px] tracking-widest flex items-center gap-2">
            <TrophyOutlined className="text-yellow-500" /> Chỉ số vận hành sân
          </span>
        }
        className="rounded-3xl border-none shadow-sm"
      >
        <Row gutter={24} align="middle">
          <Col xs={24} sm={10} className="text-center">
            <Progress
              type="dashboard"
              percent={attendancePercent}
              strokeColor="#10b981"
              gapDegree={30}
            />
            <div className="mt-2 font-black italic text-slate-600 uppercase text-[11px]">
              Tỉ lệ chuyên cần
            </div>
          </Col>
          <Col xs={24} sm={14}>
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <Text className="text-slate-500 italic font-medium">Số lượt quản lý sân:</Text>
                <Tag color="emerald" className="m-0 font-black italic border-none rounded-lg">
                  {stats.fieldsManaged} LƯỢT
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-slate-500 italic font-medium">Tổng giờ trực:</Text>
                <Tag color="blue" className="m-0 font-black italic border-none rounded-lg">
                  {stats.attendance.totalHours} GIỜ
                </Tag>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <Text className="text-slate-500 italic font-medium">Ca hoàn thành:</Text>
                <Text strong className="text-emerald-600">
                  {stats.attendance.completedShifts} / {stats.attendance.totalShifts}
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Performance;
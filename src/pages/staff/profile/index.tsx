import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  Spin,
  message,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  SafetyOutlined,
  CalendarOutlined,
  TrophyOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import adminUserService, { User } from "@/services/admin/userService";
import dashboardService, {
  StaffDashboardStats,
} from "@/services/staff/dashboardService";

import PersonalInfo from "./PersonalInfo";
import Security from "./Security";
// import ShiftHistory from "./ShiftHistory";
import Performance from "./Performance";
import StaffWeeklySchedule from "./StaffWeeklySchedule";
import StaffAttendanceHistory from "./StaffAttendanceHistory";

const { Title, Text } = Typography;

export default function StaffProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<StaffDashboardStats | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      setFetching(true);
      const [userRes, staffRes] = await Promise.all([
        adminUserService.getMe(),
        dashboardService.getOverview(),
      ]);

      setUser(userRes.data);
      setStats(staffRes.data.stats);
    } catch (error: unknown) {
      message.error("Không thể tải thông tin hồ sơ Platinum");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (fetching || !user)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );

  const tabItems = [
    {
      key: "info",
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: <PersonalInfo user={user} onRefresh={fetchProfile} />,
    },

    {
      key: "performance",
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined /> Hiệu suất
        </span>
      ),
      children: stats ? <Performance stats={stats} /> : <Spin />,
    },
    {
      key: "history", // Khớp với key của tab Lịch sử ca
      label: (
        <span>
          <CalendarOutlined /> Lịch sử chấm công
        </span>
      ),
      children: <StaffAttendanceHistory />, // ✅ Ghi đè nội dung cũ bằng component thật
    },
    {
      key: "schedule",
      label: (
        <span>
          <CalendarOutlined /> Lịch làm việc
        </span>
      ),
      children: <StaffWeeklySchedule />, // ✅ Gắn component vào đây
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined /> Bảo mật
        </span>
      ),
      children: <Security />,
    },
  ];

  const avatarUrl = user?.profile?.avatar
    ? `http://127.0.0.1:8000/${user.profile.avatar}`
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Card className="border-0 shadow-lg rounded-[2.5rem] bg-gradient-to-r from-emerald-900 to-slate-900 text-white overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-8 p-4 relative z-10">
          <Avatar
            size={120}
            src={avatarUrl}
            icon={<UserOutlined />}
            className="border-4 border-emerald-400 shadow-2xl"
          />
          <div className="text-center md:text-left flex-1">
            <Title
              level={2}
              className="!text-white !mb-1 !font-black italic uppercase tracking-tighter"
            >
              {user?.name}
            </Title>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Tag
                color="emerald"
                className="m-0 font-bold italic uppercase border-none px-3 py-0.5 rounded-lg"
              >
                {user?.role === "staff" ? "Nhân viên vận hành" : user?.role}
              </Tag>
              <Text className="text-emerald-300 font-black italic opacity-80 tracking-widest text-xs">
                MÃ NV: #{user?.id.toString().padStart(4, "0")}
              </Text>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-4">
              <div className="text-center">
                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">
                  Email liên hệ
                </div>
                <div className="font-bold italic text-white text-sm">
                  {user?.email}
                </div>
              </div>
              <div className="text-center border-l border-white/10 pl-8">
                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">
                  Tỉ lệ chuyên cần
                </div>
                <div className="font-black italic text-lg text-white">
                  {stats?.attendance?.completedShifts || 0} /{" "}
                  {stats?.attendance?.totalShifts || 0} ca
                </div>
              </div>
              <div className="text-center border-l border-white/10 pl-8">
                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">
                  Xếp hạng
                </div>
                <div className="font-black italic text-lg text-yellow-400">
                  ★ {stats?.rating || 5.0}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-5">
          <TrophyOutlined style={{ fontSize: "250px" }} />
        </div>
      </Card>

      <Tabs
        items={tabItems}
        size="large"
        type="card"
        className="platinum-tabs bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-xl"
      />

      <style>{`
        .platinum-tabs .ant-tabs-nav::before { border: none !important; }
        .platinum-tabs .ant-tabs-tab { 
          border: none !important; 
          background: #f1f5f9 !important; 
          border-radius: 12px !important; 
          margin-right: 8px !important;
          font-weight: 800;
          text-transform: uppercase;
          font-style: italic;
          transition: all 0.3s;
        }
        .platinum-tabs .ant-tabs-tab-active { background: #10b981 !important; }
        .platinum-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: white !important; }
      `}</style>
    </div>
  );
}

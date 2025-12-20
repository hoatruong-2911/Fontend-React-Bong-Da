import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Button,
  Dropdown,
  message,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BarChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import authService from "../services/authService";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- PHẦN CHỈNH SỬA: Dùng State để quản lý thông tin User ---
  const [user, setUser] = useState(authService.getStoredUser());

  // Lắng nghe sự kiện thay đổi từ localStorage
  useEffect(() => {
    const handleUserUpdate = () => {
      // Cập nhật lại State user mỗi khi có sự kiện 'userUpdate' hoặc 'storage'
      const updatedUser = authService.getStoredUser();
      setUser(updatedUser);
    };

    // Lắng nghe sự kiện tùy chỉnh và sự kiện storage mặc định của trình duyệt
    window.addEventListener("userUpdate", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdate", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  // Tính toán đường dẫn ảnh đại diện (Tự động cập nhật khi State user thay đổi)
  // const avatarPath = user?.avatar || user?.profile?.avatar;
  const avatarPath = user?.avatar || (user as any)?.profile?.avatar;
  const avatarUrl = avatarPath
    ? `http://127.0.0.1:8000/${avatarPath.replace(/^\//, "")}`
    : null;
  // ----------------------------------------------------------

  const handleLogout = async () => {
    try {
      const hide = message.loading("Đang rời sân cỏ...", 0);
      await authService.logout();
      hide();
      message.success("Hẹn gặp lại nhà vô địch!");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error("Lỗi khi đăng xuất!");
    }
  };

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/admin/fields",
      icon: <EnvironmentOutlined />,
      label: "Quản lý sân",
    },
    {
      key: "/admin/bookings",
      icon: <CalendarOutlined />,
      label: "Quản lý đặt sân",
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
    },
    { key: "/admin/staff", icon: <TeamOutlined />, label: "Quản lý nhân viên" },
    {
      key: "/admin/customers",
      icon: <UserOutlined />,
      label: "Quản lý khách hàng",
    },
    { key: "/admin/user", icon: <UserOutlined />, label: "Quản lý tài khoản" },
    { key: "d1", type: "divider" as const },
    {
      key: "/admin/attendance",
      icon: <ClockCircleOutlined />,
      label: "Chấm công",
    },
    { key: "/admin/shifts", icon: <ScheduleOutlined />, label: "Lịch ca làm" },
    {
      key: "/admin/revenue",
      icon: <BarChartOutlined />,
      label: "Báo cáo doanh thu",
    },
    { key: "d2", type: "divider" as const },
    { key: "/admin/settings", icon: <SettingOutlined />, label: "Cài đặt" },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: "#064e3b" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: "rgba(6, 78, 59, 0.95)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          position: "sticky",
          top: 0,
          left: 0,
          height: "100vh",
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 mb-4 px-4">
          <Link to="/admin" className="flex items-center gap-3">
            <TrophyOutlined className="text-2xl text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            {!collapsed && (
              <Title
                level={4}
                className="m-0 text-white font-black tracking-tighter italic"
              >
                STADIUM <span className="text-green-400">POS</span>
              </Title>
            )}
          </Link>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          theme="dark"
          style={{ background: "transparent", border: "none" }}
          items={menuItems.map((item: any) => {
            if (item.type === "divider") return item;
            return {
              ...item,
              label: <Link to={item.key}>{item.label}</Link>,
            };
          })}
        />
      </Sider>

      <Layout
        className="relative overflow-hidden"
        style={{ background: "transparent" }}
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "40px 40px, 100px 100px, 100px 100px",
            backgroundPosition: "center center",
          }}
        />

        <Header
          className="px-6 flex items-center justify-between h-16 z-10 sticky top-0"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(15px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-white text-lg hover:bg-white/10"
            />
            <div className="hidden sm:block pt-3 ml-4 leading-tight">
              <Text className="text-green-400 text-[10px] block uppercase font-black tracking-widest opacity-80">
                Hệ thống quản trị
              </Text>
              <Text className="text-white font-bold uppercase tracking-tight text-sm block">
                Sân bóng chuyên nghiệp
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationDropdown />

            <Dropdown
              menu={{
                items: [
                  {
                    key: "p",
                    icon: <UserOutlined />,
                    label: "Hồ sơ cá nhân",
                    onClick: () => navigate("/admin/profile"),
                  },
                  {
                    key: "s",
                    icon: <SettingOutlined />,
                    label: "Cài đặt hệ thống",
                  },
                  { key: "sep", type: "divider" },
                  {
                    key: "l",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer bg-white/5 p-1.5 pr-5 rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl group relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-70 blur-md animate-ping-slow"></div>

                  <Avatar
                    key={avatarUrl} // Buộc avatar render lại khi url thay đổi
                    src={avatarUrl}
                    size={46}
                    icon={<UserOutlined />}
                    className="border-2 border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)] z-10 relative transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "#064e3b",
                      objectFit: "cover",
                      minWidth: 46,
                    }}
                  />
                </div>

                <div className="hidden md:block text-left leading-tight ml-1 z-10">
                  <Text className="text-white block font-black text-sm tracking-wide">
                    {user?.name || "Admin VIP"}
                  </Text>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <Text className="text-green-400 text-[9px] uppercase font-black italic tracking-tighter opacity-90">
                      {user?.role === "admin"
                        ? "Super Admin Pro"
                        : "Staff Member"}
                    </Text>
                  </div>
                </div>

                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-6 relative z-10 overflow-auto h-[calc(100vh-64px)]">
          <div
            className="rounded-3xl p-6 shadow-2xl min-h-full"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .group:hover .group-hover:animate-shine { animation: shine 0.8s ease-in-out; }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.4); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .ant-menu-item-selected { background: linear-gradient(90deg, #10b981 0%, transparent 100%) !important; color: #fff !important; font-weight: 800; border-left: 4px solid #fbbf24 !important; }
        .ant-menu-item:hover { background: rgba(16, 185, 129, 0.1) !important; color: #34d399 !important; }
        .ant-card, .ant-table { background: #ffffff !important; border-radius: 16px !important; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </Layout>
  );
}

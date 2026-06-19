import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Badge,
  Button,
  Dropdown,
  message,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FieldTimeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import authService from "../services/authService";
import NotificationBadge from "@/components/staff/NotificationBadge";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Đồng bộ logic lấy User để hiển thị avatar mượt mà
  const [user, setUser] = useState<any>(authService.getStoredUser());

  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = authService.getStoredUser();
      setUser(updatedUser);
    };
    window.addEventListener("userUpdate", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdate", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  const avatarPath = user?.profile?.avatar || user?.avatar;
  const avatarUrl = avatarPath
    ? `http://127.0.0.1:8000/${avatarPath.replace(/^\//, "")}`
    : null;

  const handleLogout = async () => {
    try {
      message.loading({ content: "Đang rời sân cỏ...", key: "logout" });
      await authService.logout();
      message.success({ content: "Hẹn gặp lại nhà vô địch!", key: "logout" });
      navigate("/login", { replace: true });
    } catch (error) {
      message.error("Lỗi khi đăng xuất!");
    }
  };

  const menuItems = [
    { key: "/staff", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/staff/bookings",
      icon: <CalendarOutlined />,
      label: "Đặt sân từ khách",
    },
    { key: "/staff/fields", icon: <FieldTimeOutlined />, label: "Quản lý sân" },
    { key: "/staff/bookings/history", icon: <ShoppingOutlined />, label: "Lịch Sử Đặt Sân" },

    { key: "/staff/orders", icon: <ShoppingOutlined />, label: "Đơn hàng" },
    { key: "/staff/orders/history", icon: <UserOutlined />, label: "Lịch Sử Đơn Hàng" },
    // { key: "/staff/user", icon: <UserOutlined />, label: "Tài Khoản" },

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
          zIndex: 100,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 mb-4 px-4">
          <Link to="/staff" className="flex items-center gap-3">
            <TrophyOutlined className="text-2xl text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            {!collapsed && (
              <Title
                level={4}
                className="m-0 text-white font-black tracking-tighter italic"
              >
                STAFF <span className="text-green-400">PANEL</span>
              </Title>
            )}
          </Link>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          style={{ background: "transparent", border: "none" }}
          items={menuItems.map((item) => ({
            ...item,
            label: (
              <Link to={item.key} className="font-bold">
                {item.label}
              </Link>
            ),
          }))}
        />
      </Sider>

      <Layout
        className="relative overflow-hidden"
        style={{ background: "transparent" }}
      >
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
              className="text-white text-lg hover:bg-white/20"
            />
          </div>

          {/* <div className="flex items-center gap-6">
            {/* <Badge count={3} offset={[-2, 5]}>
              <Button
                type="text"
                icon={<BellOutlined className="text-xl text-white" />}
              />
            </Badge> */}
            <div className="flex items-center gap-6">
             <NotificationBadge /> {/* ✅ Thay thế Badge + Button cũ bằng cái này */}

            <Dropdown
              menu={{
                items: [
                  {
                    key: "p",
                    icon: <UserOutlined />,
                    label: "Hồ sơ cá nhân",
                    onClick: () => navigate("/staff/profile"),
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
              {/* CONTAINER PROFILE RỰC RỠ ĐỒNG BỘ VỚI ADMIN */}
              <div className="flex items-center gap-3 cursor-pointer bg-white/5 p-1.5 pr-5 rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-xl group relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-70 blur-md animate-ping-slow"></div>
                  <Avatar
                    key={avatarUrl}
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
                  <Text className="text-white block font-black text-sm tracking-wide uppercase italic">
                    {user?.name || "Staff Pro"}
                  </Text>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <Text className="text-green-400 text-[9px] uppercase font-black italic tracking-tighter opacity-90">
                      NHÂN VIÊN TRỰC CA
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
            className="rounded-3xl p-6 min-h-full shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .group:hover .group-hover\\:animate-shine, .group:hover .animate-shine { animation: shine 0.8s ease-in-out; }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.4); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        /* Style cho Menu Platinum */
        .ant-menu-item-selected {
          background: linear-gradient(90deg, #a3e635 0%, transparent 100%) !important;
          color: #1b5e20 !important;
          font-weight: 900 !important;
          border-radius: 10px !important;
        }
        .ant-menu-item {
          border-radius: 10px !important;
          margin: 4px 8px !important;
        }
        .ant-menu-item:hover {
          color: #a3e635 !important;
        }
      `}</style>
    </Layout>
  );
}
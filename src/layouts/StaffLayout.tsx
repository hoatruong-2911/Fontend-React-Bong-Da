import { useState } from "react";
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
  SettingOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import authService from "../services/authService";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = authService.getStoredUser();
  const avatarUrl = user?.avatar
    ? `http://127.0.0.1:8000/${user.avatar}`
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
    { key: "/staff/orders", icon: <ShoppingOutlined />, label: "Đơn hàng" },
  ];

  return (
    <Layout className="min-h-screen" style={{ background: "rgba(6, 78, 59, 0.95)" }}>
      {/* Sidebar: Màu xanh cỏ đậm, chữ trắng sắc nét */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: "rgba(255, 255, 255, 0.03)", // Xanh lá đậm chất sân cỏ
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 mb-4">
          <Link to="/staff" className="flex items-center gap-2">
            <TrophyOutlined className="text-2xl text-yellow-400" />
            {!collapsed && (
              <span className="text-white font-black text-lg tracking-tighter uppercase italic">
                Staff <span className="text-lime-400">Panel</span>
              </span>
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
        {/* Họa tiết Đường kẻ sân bóng rực rỡ */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px),
              radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.1) 31%, transparent 32%)
            `,
            backgroundSize: "100% 50%, 50% 100%, 200px 200px",
            backgroundPosition: "center",
            opacity: 0.5,
          }}
        />

        {/* Header Glassmorphism rực rỡ */}
        <Header
          className="px-6 flex items-center justify-between h-16 z-10 sticky top-0"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-white text-lg hover:bg-white/20"
            />
            <Title
              level={5}
              className="m-0 text-white uppercase tracking-widest hidden md:block"
            >
              Hệ thống quản lý sân bóng Pro
            </Title>
          </div>

          <div className="flex items-center gap-5">
            <Badge count={3} offset={[-2, 5]}>
              <Button
                type="text"
                icon={<BellOutlined className="text-xl text-white" />}
              />
            </Badge>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    icon: <UserOutlined />,
                    label: "Hồ sơ",
                    onClick: () => navigate("/staff/profile"),
                  },
                  {
                    key: "2",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer p-1 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <Avatar
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  className="bg-lime-500 border border-white"
                />
                <div className="text-left hidden sm:block leading-none pr-2">
                  <Text className="text-white block font-bold text-xs">
                    {user?.name || "Staff"}
                  </Text>
                  <Text className="text-lime-300 text-[9px] uppercase font-black">
                    Nhân viên trực ca
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Nội dung chính trong suốt rực rỡ */}
        <Content className="p-6 relative z-10 overflow-auto">
          <div
            className="rounded-3xl p-6 min-h-full"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        /* Style cho Menu được chọn rực rỡ */
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

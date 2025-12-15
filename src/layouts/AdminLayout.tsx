import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Button, Dropdown } from 'antd';
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
} from '@ant-design/icons';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  {
    key: '/admin/fields',
    icon: <EnvironmentOutlined />,
    label: 'Quản lý sân',
  },
  {
    key: '/admin/bookings',
    icon: <CalendarOutlined />,
    label: 'Quản lý đặt sân',
  },
  {
    key: '/admin/products',
    icon: <ShoppingOutlined />,
    label: 'Quản lý sản phẩm',
  },
  {
    key: '/admin/staff',
    icon: <TeamOutlined />,
    label: 'Quản lý nhân viên',
  },
  {
    key: '/admin/customers',
    icon: <UserOutlined />,
    label: 'Quản lý khách hàng',
  },
  {
    key: 'divider1',
    type: 'divider' as const,
  },
  {
    key: '/admin/attendance',
    icon: <ClockCircleOutlined />,
    label: 'Chấm công',
  },
  {
    key: '/admin/shifts',
    icon: <ScheduleOutlined />,
    label: 'Lịch ca làm',
  },
  {
    key: '/admin/revenue',
    icon: <BarChartOutlined />,
    label: 'Báo cáo doanh thu',
  },
  {
    key: 'divider2',
    type: 'divider' as const,
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt',
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => navigate('/login'),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-card border-r border-border"
        width={260}
        collapsedWidth={80}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          className="border-none mt-4"
          items={menuItems.map(item => {
            if ('type' in item && item.type === 'divider') {
              return { type: 'divider' as const, key: item.key };
            }
            const menuItem = item as { key: string; icon: React.ReactNode; label: string };
            return {
              key: menuItem.key,
              icon: menuItem.icon,
              label: <Link to={menuItem.key}>{menuItem.label}</Link>,
            };
          })}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="bg-card border-b border-border px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground m-0">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} className="bg-primary" />
                <span className="font-medium text-foreground">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="bg-muted/30 p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

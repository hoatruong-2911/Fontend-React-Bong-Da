import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Button, Dropdown } from 'antd';
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
} from '@ant-design/icons';
import { currentStaff } from '@/data/mockStaff';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/staff',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  {
    key: '/staff/bookings',
    icon: <CalendarOutlined />,
    label: 'Đặt sân từ khách',
  },
  {
    key: '/staff/fields',
    icon: <FieldTimeOutlined />,
    label: 'Quản lý sân',
  },
  {
    key: '/staff/orders',
    icon: <ShoppingOutlined />,
    label: 'Đơn hàng',
  },
];

export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
      onClick: () => navigate('/staff/profile'),
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
          <Link to="/staff" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground">Staff Panel</span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          className="border-none mt-4"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="bg-gradient-to-r from-emerald-700 to-teal-300 border-b border-border px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            <div className="flex items-center gap-3">
              <Avatar src={currentStaff.avatar} icon={<UserOutlined />} className="border-2 border-emerald-500" />
              <div>
                <div className="font-semibold text-foreground">{currentStaff.name}</div>
                <div className="text-xs text-muted-foreground">{currentStaff.position}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-card rounded-lg border border-border">
              <span className="text-xs text-muted-foreground">Ca làm: </span>
              <span className="font-medium text-foreground">{currentStaff.shift}</span>
            </div>
            
            <Badge count={3}>
              <Button type="text" icon={<BellOutlined className="text-xl" />} />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<SettingOutlined />} />
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

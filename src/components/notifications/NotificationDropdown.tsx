import { useState } from 'react';
import { Badge, Dropdown, List, Typography, Button, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { mockNotifications, Notification } from '@/data/mockNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const getNotificationIcon = (type: Notification['type']) => {
  const icons: Record<string, { color: string; bg: string }> = {
    order: { color: '#10b981', bg: '#d1fae5' },
    booking: { color: '#3b82f6', bg: '#dbeafe' },
    system: { color: '#f59e0b', bg: '#fef3c7' },
    promotion: { color: '#ef4444', bg: '#fee2e2' },
  };
  return icons[type] || icons.system;
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dropdownContent = (
    <div className="w-80 bg-white rounded-lg shadow-lg border">
      <div className="flex justify-between items-center p-3 border-b">
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} icon={<CheckOutlined />}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo" className="py-8" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => {
              const iconStyle = getNotificationIcon(item.type);
              return (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 px-3 py-2 ${
                    !item.isRead ? 'bg-green-50' : ''
                  }`}
                  onClick={() => markAsRead(item.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: iconStyle.bg }}
                      >
                        <BellOutlined style={{ color: iconStyle.color }} />
                      </div>
                    }
                    title={
                      <div className="flex justify-between">
                        <Text strong={!item.isRead}>{item.title}</Text>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" className="text-xs line-clamp-2">
                          {item.message}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
      <div className="p-2 border-t text-center">
        <Button type="link" size="small">
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown dropdownRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
      </Badge>
    </Dropdown>
  );
}

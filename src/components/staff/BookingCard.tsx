import React from 'react';
import { Card, Tag, Button, Space, Typography, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface BookingCardProps {
  booking: {
    id: string;
    customerName: string;
    customerPhone: string;
    fieldName: string;
    date: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalAmount: number;
  };
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const statusConfig = {
  pending: { color: 'orange', text: 'Chờ xác nhận' },
  confirmed: { color: 'blue', text: 'Đã xác nhận' },
  completed: { color: 'green', text: 'Hoàn thành' },
  cancelled: { color: 'red', text: 'Đã hủy' },
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onConfirm,
  onComplete,
  onCancel,
}) => {
  const status = statusConfig[booking.status];

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      actions={[
        booking.status === 'pending' && onConfirm && (
          <Button type="link" onClick={() => onConfirm(booking.id)}>
            Xác nhận
          </Button>
        ),
        booking.status === 'confirmed' && onComplete && (
          <Button type="link" onClick={() => onComplete(booking.id)}>
            Hoàn thành
          </Button>
        ),
        (booking.status === 'pending' || booking.status === 'confirmed') && onCancel && (
          <Button type="link" danger onClick={() => onCancel(booking.id)}>
            Hủy
          </Button>
        ),
      ].filter(Boolean)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Avatar size="large" icon={<UserOutlined />} className="bg-primary" />
          <div>
            <Title level={5} className="!mb-0">{booking.customerName}</Title>
            <Text type="secondary" className="flex items-center gap-1">
              <PhoneOutlined /> {booking.customerPhone}
            </Text>
          </div>
        </div>
        <Tag color={status.color}>{status.text}</Tag>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-primary" />
          <Text strong>{booking.fieldName}</Text>
        </div>
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-primary" />
          <Text>{booking.date} - {booking.timeSlot}</Text>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex justify-between">
        <Text type="secondary">Tổng tiền:</Text>
        <Text strong className="text-primary text-lg">
          {booking.totalAmount.toLocaleString('vi-VN')}đ
        </Text>
      </div>
    </Card>
  );
};

export default BookingCard;

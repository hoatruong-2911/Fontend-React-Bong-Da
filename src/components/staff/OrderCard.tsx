import React from 'react';
import { Card, Tag, Button, Typography, List, Avatar } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    customerName?: string;
  };
  onPrepare?: (id: string) => void;
  onReady?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const statusConfig = {
  pending: { color: 'orange', text: 'Chờ xử lý' },
  preparing: { color: 'blue', text: 'Đang chuẩn bị' },
  ready: { color: 'cyan', text: 'Sẵn sàng' },
  completed: { color: 'green', text: 'Hoàn thành' },
  cancelled: { color: 'red', text: 'Đã hủy' },
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPrepare,
  onReady,
  onComplete,
  onCancel,
}) => {
  const status = statusConfig[order.status];

  const getActions = () => {
    const actions = [];
    
    if (order.status === 'pending' && onPrepare) {
      actions.push(
        <Button type="link" onClick={() => onPrepare(order.id)}>
          Chuẩn bị
        </Button>
      );
    }
    if (order.status === 'preparing' && onReady) {
      actions.push(
        <Button type="link" onClick={() => onReady(order.id)}>
          Sẵn sàng
        </Button>
      );
    }
    if (order.status === 'ready' && onComplete) {
      actions.push(
        <Button type="link" onClick={() => onComplete(order.id)}>
          Giao hàng
        </Button>
      );
    }
    if (['pending', 'preparing'].includes(order.status) && onCancel) {
      actions.push(
        <Button type="link" danger onClick={() => onCancel(order.id)}>
          Hủy
        </Button>
      );
    }
    
    return actions;
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      actions={getActions()}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <Title level={5} className="!mb-0 flex items-center gap-2">
            <ShoppingOutlined /> #{order.orderNumber}
          </Title>
          {order.customerName && (
            <Text type="secondary">{order.customerName}</Text>
          )}
        </div>
        <Tag color={status.color}>{status.text}</Tag>
      </div>

      <List
        size="small"
        dataSource={order.items}
        renderItem={(item) => (
          <List.Item className="!px-0">
            <div className="flex items-center gap-2 flex-1">
              {item.image && (
                <Avatar shape="square" size="small" src={item.image} />
              )}
              <Text>{item.name}</Text>
              <Text type="secondary">x{item.quantity}</Text>
            </div>
            <Text>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
          </List.Item>
        )}
      />

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between mb-1">
          <Text type="secondary" className="flex items-center gap-1">
            <ClockCircleOutlined /> {order.createdAt}
          </Text>
        </div>
        <div className="flex justify-between">
          <Text strong>Tổng cộng:</Text>
          <Text strong className="text-primary text-lg">
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;

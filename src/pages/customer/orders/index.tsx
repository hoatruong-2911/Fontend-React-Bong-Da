import { useState } from 'react';
import { Card, Table, Tag, Typography, Input, Select, Space, Button, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockCustomerOrders } from '@/data/mockNotifications';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'warning', text: 'Chờ xử lý' },
  preparing: { color: 'processing', text: 'Đang chuẩn bị' },
  completed: { color: 'success', text: 'Hoàn thành' },
  cancelled: { color: 'error', text: 'Đã hủy' },
};

const paymentStatusConfig: Record<string, { color: string; text: string }> = {
  unpaid: { color: 'error', text: 'Chưa thanh toán' },
  paid: { color: 'success', text: 'Đã thanh toán' },
  refunded: { color: 'default', text: 'Đã hoàn tiền' },
};

export default function CustomerOrders() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<typeof mockCustomerOrders[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = mockCustomerOrders.filter((order) => {
    const matchSearch = order.orderCode.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string) => <Text strong className="text-green-600">{code}</Text>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: typeof mockCustomerOrders[0]['items']) => (
        <div>
          {items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="text-sm">
              {item.productName} x{item.quantity}
            </div>
          ))}
          {items.length > 2 && <Text type="secondary">+{items.length - 2} sản phẩm khác</Text>}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong>{total.toLocaleString()}đ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={paymentStatusConfig[status]?.color}>{paymentStatusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: typeof mockCustomerOrders[0]) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 p-4">
      <Title level={4}>Lịch sử đơn hàng</Title>

      <Card>
        <Space className="mb-4 flex-wrap">
          <Input
            placeholder="Tìm mã đơn hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'preparing', label: 'Đang chuẩn bị' },
              { value: 'completed', label: 'Hoàn thành' },
              { value: 'cancelled', label: 'Đã hủy' },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            In hóa đơn
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="print-content">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text strong className="text-green-600">{selectedOrder.orderCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusConfig[selectedOrder.status]?.color}>
                  {statusConfig[selectedOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức TT">
                {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' :
                 selectedOrder.paymentMethod === 'card' ? 'Thẻ' :
                 selectedOrder.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'QR Code'}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={paymentStatusConfig[selectedOrder.paymentStatus]?.color}>
                  {paymentStatusConfig[selectedOrder.paymentStatus]?.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Sản phẩm</Divider>

            <Table
              dataSource={selectedOrder.items}
              rowKey="productName"
              pagination={false}
              size="small"
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
                { 
                  title: 'Đơn giá', 
                  dataIndex: 'unitPrice', 
                  key: 'unitPrice',
                  render: (price: number) => `${price.toLocaleString()}đ`
                },
                { 
                  title: 'Thành tiền', 
                  dataIndex: 'subtotal', 
                  key: 'subtotal',
                  render: (price: number) => <Text strong>{price.toLocaleString()}đ</Text>
                },
              ]}
            />

            <div className="mt-4 text-right space-y-1">
              <div>Tạm tính: <Text>{selectedOrder.subtotal.toLocaleString()}đ</Text></div>
              {selectedOrder.discount > 0 && (
                <div>Giảm giá: <Text type="danger">-{selectedOrder.discount.toLocaleString()}đ</Text></div>
              )}
              <div className="text-lg">
                <Text strong>Tổng cộng: </Text>
                <Text strong className="text-green-600">{selectedOrder.total.toLocaleString()}đ</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  message,
  InputNumber,
} from "antd";
import { PlusOutlined, PrinterOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { recentOrders } from "@/data/mockStaff";
import { mockProducts } from "@/data/mockProducts";
import { printInvoice } from "@/utils/printInvoice";

const { Title, Text } = Typography;

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function StaffOrders() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderForm] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState<Array<{ id: string; quantity: number }>>([]);

  // Tạo đơn hàng mới
  const handleCreateOrder = () => {
    orderForm.validateFields().then((values) => {
      console.log("Tạo đơn hàng:", values, selectedProducts);
      message.success("Đã tạo đơn hàng thành công!");
      setIsOrderModalOpen(false);
      orderForm.resetFields();
      setSelectedProducts([]);
    });
  };

  // Xem chi tiết đơn hàng
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // In hóa đơn
  const handlePrintInvoice = (order: Order) => {
    const subtotal = order.totalAmount;
    const invoiceData = {
      invoiceCode: `HD-${order.id}`,
      type: 'order' as const,
      customerName: order.customerName || "Khách lẻ",
      items: order.items.map(item => {
        const unitPrice = item.price || Math.round(order.totalAmount / order.items.reduce((sum, i) => sum + i.quantity, 0));
        return {
          name: item.productName,
          quantity: item.quantity,
          unitPrice: unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      }),
      subtotal: subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      staffName: "Nhân viên A",
      createdAt: order.createdAt,
    };
    printInvoice(invoiceData);
    message.success("Đang in hóa đơn...");
  };

  // Xác nhận đơn hàng
  const handleConfirmOrder = (orderId: string) => {
    message.success(`Đã xác nhận đơn hàng ${orderId}`);
  };

  // Hoàn thành đơn hàng
  const handleCompleteOrder = (orderId: string) => {
    message.success(`Đã hoàn thành đơn hàng ${orderId}`);
  };

  // Thêm sản phẩm vào danh sách
  const handleProductSelect = (productIds: string[]) => {
    const newProducts = productIds.map(id => {
      const existing = selectedProducts.find(p => p.id === id);
      return existing || { id, quantity: 1 };
    });
    setSelectedProducts(newProducts);
  };

  // Cập nhật số lượng sản phẩm
  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return selectedProducts.reduce((sum, sp) => {
      const product = mockProducts.find(p => p.id === sp.id);
      return sum + (product?.price || 0) * sp.quantity;
    }, 0);
  };

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (name: string) => name || <Text type="secondary">Khách lẻ</Text>,
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      render: (items: OrderItem[]) => (
        <div>
          {items.slice(0, 2).map((item, index) => (
            <div key={index}>
              {item.productName} x{item.quantity}
            </div>
          ))}
          {items.length > 2 && <Text type="secondary">+{items.length - 2} sản phẩm khác</Text>}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <strong className="text-primary">{amount.toLocaleString()}đ</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          pending: { color: "warning", text: "Chờ xử lý" },
          preparing: { color: "processing", text: "Đang chuẩn bị" },
          completed: { color: "success", text: "Hoàn thành" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        return <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time: string) => dayjs(time).format("HH:mm DD/MM"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      render: (_: unknown, record: Order) => (
        <Space wrap>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewOrder(record)}
          >
            Chi tiết
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            size="small"
            onClick={() => handlePrintInvoice(record)}
          >
            In hóa đơn
          </Button>
          {record.status === "pending" && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleConfirmOrder(record.id)}
            >
              Xác nhận
            </Button>
          )}
          {record.status === "preparing" && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleCompleteOrder(record.id)}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <Title level={4}>Quản lý đơn hàng</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsOrderModalOpen(true)}
            style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
          >
            Tạo đơn mới
          </Button>
          <Button type="default">
            <Link to="/products">Xem menu sản phẩm</Link>
          </Button>
        </Space>
      </div>

      <Card>
        <Table 
          columns={orderColumns} 
          dataSource={recentOrders as Order[]} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal tạo đơn hàng */}
      <Modal
        title="Tạo đơn hàng mới"
        open={isOrderModalOpen}
        onOk={handleCreateOrder}
        onCancel={() => {
          setIsOrderModalOpen(false);
          setSelectedProducts([]);
          orderForm.resetFields();
        }}
        okText="Tạo đơn"
        cancelText="Hủy"
        width={700}
      >
        <Form form={orderForm} layout="vertical" className="mt-4">
          <Form.Item name="customerName" label="Tên khách hàng (không bắt buộc)">
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="products"
            label="Chọn sản phẩm"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 sản phẩm" }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn sản phẩm" 
              showSearch
              onChange={handleProductSelect}
              optionFilterProp="children"
            >
              {mockProducts.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name} - {product.price.toLocaleString()}đ
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Danh sách sản phẩm đã chọn với số lượng */}
          {selectedProducts.length > 0 && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <Text strong className="block mb-3">Chi tiết sản phẩm:</Text>
              {selectedProducts.map(sp => {
                const product = mockProducts.find(p => p.id === sp.id);
                if (!product) return null;
                return (
                  <div key={sp.id} className="flex items-center justify-between mb-2 p-2 bg-background rounded">
                    <span>{product.name}</span>
                    <Space>
                      <InputNumber 
                        min={1} 
                        max={100}
                        value={sp.quantity}
                        onChange={(value) => updateProductQuantity(sp.id, value || 1)}
                        style={{ width: 80 }}
                      />
                      <Text type="secondary">{(product.price * sp.quantity).toLocaleString()}đ</Text>
                    </Space>
                  </div>
                );
              })}
              <div className="border-t mt-3 pt-3 flex justify-between">
                <Text strong>Tổng cộng:</Text>
                <Text strong className="text-primary text-lg">{calculateTotal().toLocaleString()}đ</Text>
              </div>
            </div>
          )}

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú đơn hàng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => selectedOrder && handlePrintInvoice(selectedOrder)}
          >
            In hóa đơn
          </Button>,
        ]}
        width={500}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text type="secondary">Khách hàng:</Text>
                <div className="font-medium">{selectedOrder.customerName || "Khách lẻ"}</div>
              </div>
              <div>
                <Text type="secondary">Thời gian:</Text>
                <div className="font-medium">{dayjs(selectedOrder.createdAt).format("HH:mm DD/MM/YYYY")}</div>
              </div>
            </div>

            <div>
              <Text type="secondary" className="block mb-2">Sản phẩm:</Text>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>{((item.price || 0) * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <Text strong className="text-lg">Tổng cộng:</Text>
              <Text strong className="text-primary text-xl">{selectedOrder.totalAmount.toLocaleString()}đ</Text>
            </div>

            <div>
              <Text type="secondary">Trạng thái: </Text>
              <Tag color={
                selectedOrder.status === "completed" ? "success" :
                selectedOrder.status === "preparing" ? "processing" :
                selectedOrder.status === "pending" ? "warning" : "error"
              }>
                {selectedOrder.status === "completed" ? "Hoàn thành" :
                 selectedOrder.status === "preparing" ? "Đang chuẩn bị" :
                 selectedOrder.status === "pending" ? "Chờ xử lý" : "Đã hủy"}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
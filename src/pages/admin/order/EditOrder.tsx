import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  InputNumber,
  Space,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Spin,
  Select,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import adminOrderService, {
  Order,
  OrderItem,
  UpdateOrderPayload,
} from "@/services/admin/orderService";

const { Title, Text } = Typography;

// Cấu hình danh sách trạng thái khớp Database
const STATUS_OPTIONS = [
  { value: "pending", label: "CHỜ XÁC NHẬN" },
  { value: "confirmed", label: "ĐÃ XÁC NHẬN" },
  { value: "paid", label: "ĐÃ THANH TOÁN" },
  { value: "preparing", label: "ĐANG CHUẨN BỊ" },
  { value: "completed", label: "HOÀN THÀNH" },
  { value: "cancelled", label: "ĐÃ HỦY" },
];

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<Order>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const fetchDetail = async (): Promise<void> => {
      if (!id) return;
      try {
        setFetching(true);
        const res = await adminOrderService.getOrderDetails(Number(id));
        const orderData = res.data.data;
        form.setFieldsValue(orderData);
        setItems(orderData.items || []);
      } catch (error: unknown) {
        message.error("Lỗi nạp dữ liệu đơn hàng!");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [id, form]);

  const totalAmount = useMemo((): number => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [items]);

  // 🛑 LOGIC XÓA SẢN PHẨM KHỎI DANH SÁCH TẠM THỜI
  const handleRemoveItem = (itemId: number) => {
    if (items.length <= 1) {
      message.warning("Đơn hàng phải có ít nhất một sản phẩm rực rỡ!");
      return;
    }
    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    message.success("Đã xóa món này ra khỏi danh sách sửa đổi!");
  };

  const handleSave = async (values: Order): Promise<void> => {
    if (!id) return;
    try {
      setLoading(true);
      const payload: UpdateOrderPayload = {
        customer_name: values.customer_name,
        phone: values.phone,
        notes: values.notes,
        status: values.status,
        total_amount: totalAmount,
        items: items.map((i) => ({
          product_id: i.product_id || i.id,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      await adminOrderService.updateOrder(Number(id), payload);
      message.success("Đã cập nhật đơn hàng rực rỡ!");
      navigate("/admin/orders");
    } catch (error: unknown) {
      message.error("Không thể lưu thay đổi!");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<OrderItem> = [
    {
      title: <span className="font-black text-[11px] uppercase">Sản phẩm</span>,
      dataIndex: "product_name",
      key: "product_name",
      render: (name: string) => (
        <Text className="font-bold italic text-slate-700">{name}</Text>
      ),
    },
    {
      title: <span className="font-black text-[11px] uppercase">Đơn giá</span>,
      dataIndex: "price",
      align: "right",
      render: (p: number) => (
        <Text className="text-emerald-600 font-bold">
          {Number(p).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: <span className="font-black text-[11px] uppercase">Số lượng</span>,
      key: "quantity",
      width: 120,
      render: (_: unknown, record: OrderItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          className="rounded-lg font-black w-full"
          onChange={(val: number | null) => {
            const newItems = items.map((item) =>
              item.id === record.id ? { ...item, quantity: val || 1 } : item,
            );
            setItems(newItems);
          }}
        />
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-right">
          Thành tiền
        </span>
      ),
      align: "right",
      render: (_: unknown, record: OrderItem) => (
        <Text className="font-black text-red-500">
          {(Number(record.price) * record.quantity).toLocaleString()}đ
        </Text>
      ),
    },
    // 🛑 CỘT THAO TÁC XÓA MÓN ĐẶT LẦN NÀY
    {
      title: (
        <span className="font-black text-[11px] uppercase text-center">
          Xóa
        </span>
      ),
      key: "action",
      align: "center",
      width: 80,
      render: (_: unknown, record: OrderItem) => (
        <Popconfirm
          title="Xóa món này khỏi đơn?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, className: "font-bold" }}
        >
          <Tooltip title="Bỏ sản phẩm này">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="flex items-center justify-center mx-auto"
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải cực phẩm..." />
      </div>
    );

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/orders")}
              className="border-none shadow-none bg-transparent"
            />
            <Title
              level={4}
              className="!m-0 italic font-black uppercase text-emerald-800"
            >
              Chỉnh sửa đơn hàng #{id}
            </Title>
          </Space>
        }
        className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/90"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="customer_name"
                label={
                  <span className="font-black text-[10px] uppercase italic">
                    Tên khách hàng
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Input size="large" className="rounded-xl font-bold h-11" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="phone"
                label={
                  <span className="font-black text-[10px] uppercase italic">
                    Số điện thoại
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Input size="large" className="rounded-xl font-bold h-11" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label={
                  <span className="font-black text-[10px] uppercase italic">
                    Trạng thái đơn hàng
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  className="rounded-xl font-black italic h-11"
                  options={STATUS_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" className="!my-8">
            <span className="font-black italic text-emerald-600 uppercase text-xs">
              <ShoppingCartOutlined className="mr-2" /> Danh sách sản phẩm
            </span>
          </Divider>

          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
            className="mb-8 border rounded-2xl overflow-hidden"
          />

          <div className="flex justify-end items-center gap-6 bg-gray-50 p-8 rounded-[32px] mb-8 border border-gray-100 shadow-inner">
            <span className="font-black italic text-gray-400 uppercase text-xs">
              Tổng giá trị đơn hàng:
            </span>
            <Text className="text-5xl font-black italic text-red-500">
              {totalAmount.toLocaleString()}đ
            </Text>
          </div>

          <Form.Item
            name="notes"
            label={
              <span className="font-black text-[10px] uppercase italic">
                Ghi chú đơn hàng
              </span>
            }
          >
            <Input.TextArea
              rows={3}
              className="rounded-2xl font-medium"
              placeholder="Nhập ghi chú mới..."
            />
          </Form.Item>

          <Space size="middle">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              htmlType="submit"
              loading={loading}
              className="h-12 px-12 rounded-xl bg-blue-700 font-black italic uppercase shadow-lg border-none"
            >
              Lưu thay đổi
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/admin/orders")}
              className="h-12 px-12 rounded-xl font-black italic uppercase"
            >
              Hủy
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

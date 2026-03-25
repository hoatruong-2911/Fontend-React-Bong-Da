import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Input,
  Select,
  Space,
  Button,
  message,
  Image as AntdImage,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ShoppingOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  ExportOutlined,
  PrinterOutlined,
  UserOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  CheckOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import adminOrderService, {
  Order,
  OrderItem,
  OrderResponse,
} from "@/services/admin/orderService";
import { useNavigate } from "react-router-dom";

import { authService } from "@/services";

const { Title, Text } = Typography;

// 🛑 ĐÃ CẬP NHẬT: Thêm trạng thái Confirmed vào Config rực rỡ
const statusConfig: Record<
  string,
  { color: string; text: string; icon: React.ReactNode }
> = {
  pending: { color: "gold", text: "CHỜ XÁC NHẬN", icon: <SyncOutlined spin /> },
  confirmed: {
    color: "cyan",
    text: "ĐÃ XÁC NHẬN",
    icon: <CheckCircleOutlined />,
  },
  paid: {
    color: "blue",
    text: "ĐÃ THANH TOÁN",
    icon: <DollarCircleOutlined />,
  },
  preparing: {
    color: "orange",
    text: "ĐANG CHUẨN BỊ",
    icon: <CoffeeOutlined />,
  },
  completed: { color: "green", text: "HOÀN THÀNH", icon: <CheckOutlined /> },
  cancelled: {
    color: "volcano",
    text: "ĐÃ HỦY",
    icon: <CloseCircleOutlined />,
  },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function OrderAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">(
    "all",
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // ✅ 0. LOGIC PHÂN QUYỀN PLATINUM
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin"; // Check nếu là Admin mới được sửa/xóa

  const navigate = useNavigate();

  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminOrderService.getAllOrders();
      const rawData = response.data as unknown as OrderResponse;
      const actualData = Array.isArray(response.data)
        ? response.data
        : rawData.data || [];
      setOrders(actualData);
    } catch (error: unknown) {
      message.error("Lỗi nạp danh sách đơn hàng rực rỡ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (id: number, newStatus: Order["status"]) => {
    try {
      await adminOrderService.updateStatus(id, newStatus);
      message.success(`Đã chuyển trạng thái đơn hàng rực rỡ!`);
      loadOrders();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" || // Tính cả đơn mới xác nhận vào "Đơn cần xử lý"
        o.status === "paid" ||
        o.status === "preparing",
    ).length;
    const revenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { total, pending, revenue };
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.order_code.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      key: "order_code",
      render: (code: string) => (
        <Text strong className="text-emerald-600 italic uppercase">
          {code}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record: Order) => (
        <Space direction="vertical" size={0}>
          <Text className="font-black uppercase text-[12px] text-slate-700">
            {record.customer_name}
          </Text>
          <Text className="text-[10px] text-gray-400 font-bold">
            {record.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      render: (items: OrderItem[]) => (
        <div className="max-w-[200px]">
          {items?.slice(0, 1).map((item) => {
            const img = item.image?.startsWith("http")
              ? item.image
              : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`;
            return (
              <Space key={item.id} align="center">
                <AntdImage
                  src={img}
                  width={36}
                  height={36}
                  className="rounded-lg object-cover"
                  fallback="https://placehold.co/40x40?text=⚽"
                />
                <div className="text-[10px] truncate italic font-bold uppercase w-24">
                  {item.name}
                </div>
              </Space>
            );
          })}
          {items?.length > 1 && (
            <div className="text-[9px] text-gray-400 italic font-black ml-10">
              +{items.length - 1} món khác
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total: number) => (
        <Text strong className="text-red-500 font-black italic">
          {formatCurrency(Number(total))}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = statusConfig[status] || {
          color: "default",
          text: status,
          icon: null,
        };
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            className="font-black italic uppercase rounded-md border-none px-3 shadow-sm text-[10px]"
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      align: "right",
      render: (_, record: Order) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedOrder(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip
            title={
              isAdmin
                ? "Chỉnh sửa"
                : "Nhân viên không có quyền sửa nội dung đơn"
            }
          >
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              disabled={!isAdmin}
              onClick={() => navigate(`/admin/orders/edit/${record.id}`)}
            />
          </Tooltip>

          {/* 🛑 LUỒNG LOGIC MỚI: THEO QUY TRÌNH SHOPEE SÂN BÓNG */}

          {/* Bước 1: CHỜ XÁC NHẬN -> Bấm Xác nhận đơn */}
          {record.status === "pending" && (
            <Button
              size="small"
              type="primary"
              className="bg-emerald-600"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, "confirmed")}
            >
              Xác nhận
            </Button>
          )}

          {/* Bước 2: ĐÃ XÁC NHẬN -> Bấm Thu tiền (Dành cho khách trả tại quầy) */}
          {record.status === "confirmed" && (
            <Button
              size="small"
              type="primary"
              className="bg-blue-500"
              icon={<DollarCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, "paid")}
            >
              Thu tiền
            </Button>
          )}

          {/* Bước 3: ĐÃ THANH TOÁN -> Bấm Chuẩn bị hàng */}
          {record.status === "paid" && (
            <Button
              size="small"
              type="primary"
              className="bg-orange-500"
              icon={<CoffeeOutlined />}
              onClick={() => handleUpdateStatus(record.id, "preparing")}
            >
              Chuẩn bị
            </Button>
          )}

          {/* Bước 4: ĐANG CHUẨN BỊ -> Bấm Giao xong */}
          {record.status === "preparing" && (
            <Button
              size="small"
              className="bg-green-600 text-white border-green-600"
              icon={<CheckOutlined />}
              onClick={() => handleUpdateStatus(record.id, "completed")}
            >
              Xong
            </Button>
          )}

          {/* Nút hủy: Hiện cho các đơn chưa hoàn thành */}
          {!["completed", "cancelled"].includes(record.status) && (
            <Popconfirm
              title="Hủy đơn hàng này?"
              onConfirm={() => handleUpdateStatus(record.id, "cancelled")}
            >
              <Button
                size="small"
                danger
                ghost
                icon={<CloseCircleOutlined />}
              />
            </Popconfirm>
          )}
          <Tooltip
            title={
              isAdmin ? "Xóa vĩnh viễn" : "Nhân viên không có quyền xóa dữ liệu"
            }
          >
            <Popconfirm
              title="Xóa vĩnh viễn đơn này?"
              disabled={!isAdmin}
              onConfirm={() =>
                adminOrderService
                  .deleteOrder(record.id)
                  .then(() => loadOrders())
              }
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" variant="outlined">
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: "#1890ff", fontWeight: 900 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            size="small"
            style={{ backgroundColor: "#fffbe6" }}
            variant="outlined"
          >
            <Statistic
              title="Đơn cần xử lý"
              value={stats.pending}
              prefix={<SyncOutlined spin />}
              styles={{ content: { color: "#faad14", fontWeight: 900 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            size="small"
            style={{ backgroundColor: "#f6ffed" }}
            variant="outlined"
          >
            <Statistic
              title="Doanh thu thực"
              value={stats.revenue}
              formatter={(val) => formatCurrency(Number(val))}
              styles={{ content: { color: "#52c41a", fontWeight: 900 } }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: "16px",
            flexWrap: "wrap",
            padding: "16px",
          }}
        >
          <Space wrap size="middle">
            <Input
              placeholder="Mã đơn, tên khách..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-xl h-12 w-80 font-bold shadow-sm"
            />
            <Select
              placeholder="Lọc trạng thái"
              className="w-56 h-12 font-bold"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              {Object.entries(statusConfig).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value.text}
                </Select.Option>
              ))}
            </Select>
            <Button
              onClick={loadOrders}
              icon={<SyncOutlined />}
              className="h-12 rounded-xl font-black italic border-emerald-500 text-emerald-500"
            >
              LÀM MỚI
            </Button>
          </Space>
          <Button
            icon={<ExportOutlined />}
            className="h-12 rounded-xl font-black italic uppercase border-gray-200"
          >
            Xuất Excel
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} đơn hàng rực rỡ`,
          }}
          className="custom-admin-order-table"
        />
      </Card>

      <Modal
        title={
          <Title
            level={3}
            className="!m-0 italic font-black uppercase text-emerald-600"
          >
            Đơn hàng #{selectedOrder?.order_code}
          </Title>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        centered
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            In hóa đơn
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsModalOpen(false)}
            className="bg-emerald-600"
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div className="py-4 space-y-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Người nhận">
                {selectedOrder.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(selectedOrder.created_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {selectedOrder.payment_method.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag
                  color={statusConfig[selectedOrder.status]?.color}
                  className="font-bold italic uppercase"
                >
                  {statusConfig[selectedOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <div className="space-y-2">
              {selectedOrder.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                >
                  <Space>
                    <AntdImage
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`
                      }
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs uppercase">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        x{item.quantity} {item.unit}
                      </div>
                    </div>
                  </Space>
                  <Text className="font-black text-emerald-600">
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </div>
              ))}
            </div>
            <div className="flex justify-end bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="font-black italic mr-4 uppercase">
                Tổng cộng:
              </span>
              <Text className="text-2xl font-black text-red-500">
                {formatCurrency(Number(selectedOrder.total_amount))}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .custom-admin-order-table .ant-table-thead > tr > th { background: #f0fdf4 !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #065f46 !important; border-bottom: 2px solid #d1fae5 !important; }
        .custom-admin-order-table .ant-table-row:hover > td { background-color: #fafffd !important; }
      `}</style>
    </div>
  );
}

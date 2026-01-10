import { useState, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Thêm navigate
import orderService, {
  OrderRecord,
  OrderItemDetail,
} from "@/services/customer/orderService";

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: "warning", text: "Chờ xử lý" },
  preparing: { color: "processing", text: "Đang chuẩn bị" },
  completed: { color: "success", text: "Hoàn thành" },
  cancelled: { color: "error", text: "Đã hủy" },
  paid: { color: "green", text: "Đã thanh toán" },
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      if (res.status === "success") {
        setOrders(res.data);
      }
    } catch (error: unknown) {
      message.error("Không thể tải lịch sử đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchSearch = order.order_code
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
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
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      render: (items: OrderItemDetail[]) => (
        <div className="max-w-[200px]">
          {items?.slice(0, 1).map((item) => (
            <div
              key={item.id}
              className="text-xs truncate italic font-bold uppercase"
            >
              {item.product_name}{" "}
              <Text type="secondary" className="text-[10px]">
                x{item.quantity}
              </Text>
            </div>
          ))}
          {items?.length > 1 && (
            <Text type="secondary" className="text-[10px]">
              +{items.length - 1} khác
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (total: string | number) => (
        <Text strong className="text-emerald-500">
          {Number(total).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={statusConfig[status]?.color}
          className="font-black italic uppercase rounded-md"
        >
          {statusConfig[status]?.text}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: OrderRecord) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.order_code}`)} // Chuyển sang trang chi tiết
          className="border-emerald-500 text-emerald-500 hover:!bg-emerald-50 rounded-lg font-bold italic"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafb] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <Title
          level={2}
          className="!mb-0 !font-black !italic !uppercase !tracking-tighter"
        >
          <HistoryOutlined className="text-emerald-500 mr-3" /> Lịch sử{" "}
          <span className="text-emerald-500">Giao dịch</span>
        </Title>
      </div>
      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden">
        <Space
          className="mb-6 flex-wrap bg-gray-50/50 p-6 rounded-[24px] w-full"
          size="large"
        >
          <Input
            placeholder="Tìm mã ORD..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-xl h-12 w-72 font-bold"
          />
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            className="w-56 h-12"
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="custom-order-table"
        />
      </Card>
    </div>
  );
}

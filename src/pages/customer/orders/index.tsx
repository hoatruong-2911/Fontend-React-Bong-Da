import { useState, useEffect, useCallback } from "react";
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
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import orderService, {
  OrderRecord,
  OrderItemDetail,
} from "@/services/customer/orderService";

const { Title, Text } = Typography;

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  current_page?: number;
}

const statusConfig: Record<
  string,
  { color: string; text: string; icon?: React.ReactNode }
> = {
  pending: { color: "gold", text: "Chờ xác nhận" },
  confirmed: {
    color: "cyan",
    text: "Đã xác nhận",
    icon: <CheckCircleOutlined />,
  },
  paid: { color: "green", text: "Đã thanh toán" },
  preparing: { color: "processing", text: "Đang chuẩn bị" },
  completed: { color: "success", text: "Hoàn thành" },
  cancelled: { color: "error", text: "Đã hủy" },
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();

      const rawData = response.data as
        | OrderRecord[]
        | PaginatedResponse<OrderRecord>;
      let actualData: OrderRecord[] = [];

      if (Array.isArray(rawData)) {
        actualData = rawData;
      } else if (rawData && typeof rawData === "object" && "data" in rawData) {
        actualData = rawData.data;
      }

      setOrders(actualData);
    } catch (error: unknown) {
      console.error("Lỗi nạp đơn hàng:", error);
      message.error("Lỗi nạp danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 🛑 LOGIC HỦY ĐƠN HÀNG
  const handleCancelOrder = async (id: number) => {
    try {
      await orderService.updateOrderStatus(id, "cancelled");
      message.success("Đã hủy đơn hàng rực rỡ!");
      loadOrders(); // Tải lại danh sách sau khi hủy
    } catch (error) {
      message.error("Không thể hủy đơn hàng vào lúc này.");
    }
  };

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
        <div className="max-w-[250px]">
          {items?.slice(0, 1).map((item) => {
            const fullImageUrl = item.image?.startsWith("http")
              ? item.image
              : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`;

            return (
              <Space key={item.id} align="center" className="mb-1">
                <AntdImage
                  src={fullImageUrl}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover border border-gray-100"
                  fallback="https://placehold.co/40x40?text=⚽"
                />
                <div>
                  <div className="text-xs truncate italic font-bold uppercase w-32">
                    {item.product_name}
                  </div>
                  <Text type="secondary" className="text-[10px]">
                    x{item.quantity}
                  </Text>
                </div>
              </Space>
            );
          })}
          {items?.length > 1 && (
            <div className="pl-[52px]">
              <Text type="secondary" className="text-[10px] italic">
                +{items.length - 1} món khác
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hẹn giờ lấy",
      dataIndex: "pickup_time",
      key: "pickup_time",
      render: (time: string, record: OrderRecord) => {
        if (!time) {
          return <Text type="secondary" className="text-[10px] italic">Không hẹn</Text>;
        }

        const pickupDay = dayjs(time);
        const now = dayjs();
        const cancelTime = pickupDay.subtract(1, "hour");
        const diffMinutes = cancelTime.diff(now, "minute");

        const formattedTime = pickupDay.format("HH:mm DD/MM");

        if (!["pending", "confirmed"].includes(record.status)) {
          return (
            <Space direction="vertical" size={0}>
              <span className="font-bold text-slate-700 text-xs">⏰ {formattedTime}</span>
            </Space>
          );
        }

        if (diffMinutes <= 0) {
          return (
            <Space direction="vertical" size={0}>
              <span className="font-bold text-red-500 text-xs">⏰ {formattedTime}</span>
              <Tag color="error" className="m-0 text-[9px] font-black animate-pulse border-none">
                ⚠️ QUÁ HẠN (SẼ HỦY)
              </Tag>
            </Space>
          );
        }

        if (diffMinutes <= 180) {
          const hoursLeft = Math.floor(diffMinutes / 60);
          const minsLeft = diffMinutes % 60;
          const leftStr = hoursLeft > 0 ? `${hoursLeft}h${minsLeft}m` : `${minsLeft}m`;
          return (
            <Space direction="vertical" size={0}>
              <span className="font-bold text-orange-500 text-xs">⏰ {formattedTime}</span>
              <Tag color="warning" className="m-0 text-[9px] font-black border-none">
                ⚠️ HỦY SAU {leftStr}
              </Tag>
            </Space>
          );
        }

        return (
          <Space direction="vertical" size={0}>
            <span className="font-bold text-emerald-600 text-xs">⏰ {formattedTime}</span>
          </Space>
        );
      }
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total: string | number) => (
        <Text strong className="text-emerald-500 font-black">
          {Number(total).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={statusConfig[status]?.color}
          icon={statusConfig[status]?.icon}
          className="font-black italic uppercase rounded-md border-none px-3 shadow-sm"
        >
          {statusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: OrderRecord) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.order_code}`)}
            className="border-emerald-500 text-emerald-500 hover:!bg-emerald-50 rounded-lg font-bold italic"
          >
            Chi tiết
          </Button>

          {/* 🛑 NÚT HỦY ĐƠN: Chỉ hiện khi đơn là 'pending' (Chờ xác nhận) */}
          {record.status === "pending" && (
            <Popconfirm
              title="Bạn muốn hủy đơn hàng này?"
              description="Sản phẩm sẽ được hoàn về kho, bạn chắc chứ?"
              onConfirm={() => handleCancelOrder(record.id)}
              okText="Hủy đơn"
              cancelText="Quay lại"
              okButtonProps={{ danger: true, className: "font-black" }}
            >
              <Button
                danger
                icon={<CloseCircleOutlined />}
                className="rounded-lg font-bold italic"
              >
                Hủy đơn
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const upcomingOrders = useMemo(() => {
    const now = dayjs();
    return orders.filter((o) => {
      if (!["pending", "confirmed"].includes(o.status) || !o.pickup_time) return false;
      const pickupTime = dayjs(o.pickup_time);
      const diffMins = pickupTime.diff(now, "minute");
      return diffMins > 0 && diffMins <= 180; // Trong vòng 3 tiếng
    });
  }, [orders]);

  return (
    <div className="p-8 bg-[#f8fafb] min-h-screen">
      {upcomingOrders.map((o) => {
        const pickupTime = dayjs(o.pickup_time);
        const cancelTime = pickupTime.subtract(1, "hour");
        const diffMins = pickupTime.diff(dayjs(), "minute");
        const hoursLeft = Math.floor(diffMins / 60);
        const minsLeft = diffMins % 60;
        return (
          <Card key={o.id} className="mb-6 border-none bg-orange-50/70 rounded-[24px] shadow-sm p-4">
            <Space direction="vertical" className="w-full" size="small">
              <span className="text-orange-700 font-black italic uppercase text-xs block">
                ⏱️ Cảnh báo: Sắp đến giờ hẹn lấy đồ ăn/nước uống (Mã đơn: {o.order_code})
              </span>
              <span className="text-slate-700 text-sm font-bold block">
                Chỉ còn <span className="text-orange-600 font-black text-base">{hoursLeft > 0 ? `${hoursLeft}h${minsLeft}m` : `${minsLeft}m`}</span> nữa là đến giờ hẹn lấy hàng của bạn (lúc {pickupTime.format("HH:mm")}). Vui lòng sắp xếp thời gian đến quầy nhận món.
              </span>
              <span className="text-red-600 text-xs italic font-black block">
                * Lưu ý: Đơn hàng sẽ bị hệ thống tự động hủy lúc {cancelTime.format("HH:mm DD/MM")} (trước giờ hẹn 1 tiếng) nếu bạn không đến thanh toán và nhận đồ tại quầy.
              </span>
            </Space>
          </Card>
        );
      })}

      <div className="flex items-center justify-between mb-8">
        <Title
          level={2}
          className="!mb-0 !font-black !italic !uppercase !tracking-tighter"
        >
          <HistoryOutlined className="text-emerald-500 mr-3" /> Lịch sử{" "}
          <span className="text-emerald-500">Giao dịch</span>
        </Title>
        <Button onClick={loadOrders} type="link" className="font-bold italic">
          Làm mới dữ liệu
        </Button>
      </div>

      <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden">
        <Space
          className="mb-6 flex-wrap bg-gray-50/50 p-6 rounded-[24px] w-full"
          size="large"
        >
          <Input
            placeholder="Tìm theo mã ORD..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-xl h-12 w-72 font-bold shadow-sm"
          />
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            className="w-56 h-12 font-bold"
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
          pagination={{ pageSize: 8, className: "font-black italic px-4" }}
          className="custom-order-table"
        />
      </Card>
      <style>{`
        .custom-order-table .ant-table-thead > tr > th { background: #f0fdf4 !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #065f46 !important; border-bottom: 2px solid #d1fae5 !important; }
      `}</style>
    </div>
  );
}

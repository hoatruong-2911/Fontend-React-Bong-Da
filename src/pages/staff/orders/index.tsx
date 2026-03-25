import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Input,
  Space,
  Button,
  message,
  Image as AntdImage,
  Modal,
  Descriptions,
  DatePicker,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PrinterOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import staffOrderService, {
  Order,
  OrderItem,
} from "@/services/staff/orderService";
import OrderActions from "./OrderActions";
import AddOrder from "./CreateOrderModal";

const { Title, Text } = Typography;

const statusConfig: Record<
  string,
  { color: string; text: string; icon: React.ReactNode }
> = {
  pending: { color: "gold", text: "CHỜ XÁC NHẬN", icon: null },
  confirmed: { color: "cyan", text: "ĐÃ XÁC NHẬN", icon: null },
  paid: { color: "blue", text: "ĐÃ THANH TOÁN", icon: null },
  preparing: { color: "orange", text: "ĐANG CHUẨN BỊ", icon: null },
  completed: { color: "green", text: "HOÀN THÀNH", icon: null },
  cancelled: { color: "volcano", text: "ĐÃ HỦY", icon: null },
};

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

interface OrderApiResponse {
  data?:
    | {
        data: Order[];
      }
    | Order[];
}

export default function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // ✅ THÊM STATE LỌC NGÀY (Mặc định null để hiện tất cả đơn đang xử lý)
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffOrderService.getAllOrders();
      const rawData = response.data as unknown as OrderApiResponse;
      let actualData: Order[] = [];

      if (Array.isArray(rawData)) {
        actualData = rawData;
      } else if (rawData && typeof rawData === "object" && rawData.data) {
        actualData = Array.isArray(rawData.data)
          ? rawData.data
          : (rawData.data as any).data || [];
      }

      const ongoingOrders = actualData.filter(
        (o) => !["completed", "cancelled"].includes(o.status),
      );
      setOrders(ongoingOrders);
    } catch (error) {
      message.error("Lỗi nạp danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (id: number, newStatus: Order["status"]) => {
    try {
      await staffOrderService.updateStatus(id, newStatus);
      message.success(`Đã cập nhật trạng thái đơn hàng rực rỡ!`);
      loadOrders();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái.");
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      message.error("Vui lòng cho phép trình duyệt mở popup để in!");
      return;
    }

    const itemsHtml = (order.items || [])
      .map((item) => {
        const name = item.name || (item as any).product_name;
        return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">${name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px;">${Number(item.price).toLocaleString()}đ</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; font-size: 13px;">${(item.price * item.quantity).toLocaleString()}đ</td>
        </tr>
      `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn - ${order.order_code}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #10b981; font-size: 24px; text-transform: uppercase; }
            .info { margin-bottom: 30px; font-size: 14px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 10px; background: #f9fafb; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #10b981; }
            .total-box { margin-top: 30px; text-align: right; padding: 20px; background: #f0fdf4; border-radius: 10px; }
            .footer { text-align: center; margin-top: 50px; font-style: italic; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SÂN BÓNG THANH HÓA SOCCER</h1>
            <p style="font-weight: bold;">HÓA ĐƠN DỊCH VỤ</p>
          </div>
          <div class="info">
            <p><strong>Mã đơn hàng:</strong> #${order.order_code}</p>
            <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
            <p><strong>Điện thoại:</strong> ${order.phone}</p>
            <p><strong>Ngày giờ:</strong> ${dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align: center;">SL</th>
                <th style="text-align: right;">Đơn giá</th>
                <th style="text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total-box">
            <span style="font-size: 14px; color: #065f46;">TỔNG CỘNG:</span>
            <div style="font-size: 24px; font-weight: 900; color: #ef4444;">${Number(order.total_amount).toLocaleString()} VNĐ</div>
          </div>
          <div class="footer">Cảm ơn quý khách rực rỡ! Hẹn gặp lại. ⚽</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    message.success("Đang chuẩn bị lệnh in...");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_code.toLowerCase().includes(searchText.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchText.toLowerCase());

      // ✅ LOGIC LỌC THEO NGÀY
      const matchDate = filterDate
        ? dayjs(o.created_at).format("YYYY-MM-DD") === filterDate
        : true;

      return matchSearch && matchDate;
    });
  }, [orders, searchText, filterDate]);

  const columns: ColumnsType<Order> = [
    {
      title: "MÃ ĐƠN",
      key: "order_info",
      render: (_, r: Order) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-emerald-600 uppercase italic">
            {r.order_code}
          </Text>
          <Text className="text-[10px] text-gray-400">
            {dayjs(r.created_at).format("HH:mm DD/MM")}
          </Text>
        </Space>
      ),
    },
    {
      title: "KHÁCH HÀNG",
      render: (_, r: Order) => (
        <div>
          <div className="font-black text-slate-700 uppercase text-[11px]">
            {r.customer_name}
          </div>
          <div className="text-[10px] text-gray-400 font-bold">{r.phone}</div>
        </div>
      ),
    },
    {
      title: "SẢN PHẨM",
      dataIndex: "items",
      render: (items: OrderItem[]) => (
        <div className="max-w-[200px]">
          {items?.slice(0, 1).map((item) => {
            const itemAny = item as any;
            const img = item.image?.startsWith("http")
              ? item.image
              : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`;
            return (
              <Space key={item.id} align="center">
                <AntdImage
                  src={img}
                  width={30}
                  height={30}
                  className="rounded-md object-cover"
                  fallback="https://placehold.co/40x40?text=⚽"
                />
                <Text className="text-[10px] font-bold uppercase truncate w-24">
                  {item.name || itemAny.product_name}
                </Text>
                <Tag className="m-0 text-[9px] font-black">
                  x{item.quantity}
                </Tag>
              </Space>
            );
          })}
          {items?.length > 1 && (
            <div className="text-[9px] text-gray-400 italic ml-8">
              +{items.length - 1} món khác
            </div>
          )}
        </div>
      ),
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "total_amount",
      render: (val: number) => (
        <Text className="font-black text-red-500 italic">
          {Number(val).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={statusConfig[status]?.color}
          className="font-black italic uppercase text-[9px] border-none px-2 shadow-sm"
        >
          {statusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right",
      render: (_, r: Order) => (
        <OrderActions
          record={r}
          onView={(order: Order) => {
            setSelectedOrder(order);
            setIsDetailModalOpen(true);
          }}
          onPrint={handlePrint}
          onUpdateStatus={handleUpdateStatus}
        />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <Title
            level={3}
            className="!m-0 italic font-black uppercase tracking-tighter"
          >
            Đơn hàng <span className="text-emerald-500">Đang xử lý</span>
          </Title>
          <Text className="text-gray-400 text-[10px] font-bold uppercase italic">
            Theo dõi & Phục vụ tại quầy
          </Text>
        </div>
        <Space wrap>
          {/* ✅ BỘ LỌC THỜI GIAN ĐỒNG BỘ UI */}
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100 h-10">
            <DatePicker
              variant="borderless"
              placeholder="Chọn ngày"
              className="font-bold w-36"
              value={filterDate ? dayjs(filterDate) : null}
              onChange={(date) =>
                setFilterDate(date ? date.format("YYYY-MM-DD") : null)
              }
            />
            <Divider type="vertical" className="h-6" />
            <Button
              type="text"
              className={`font-black italic text-[11px] px-3 rounded-lg uppercase ${!filterDate ? "text-emerald-600 bg-emerald-50" : "text-slate-400"}`}
              onClick={() => setFilterDate(null)}
            >
              TẤT CẢ
            </Button>
          </div>

          <Input
            placeholder="Tìm mã, khách..."
            prefix={<SearchOutlined />}
            className="rounded-xl w-64 h-10 font-bold"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 rounded-xl font-black italic bg-emerald-600 border-none shadow-lg shadow-emerald-100"
          >
            TẠO ĐƠN
          </Button>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={loadOrders}
            className="h-10 rounded-xl"
          />
        </Space>
      </div>

      <Card
        variant="borderless"
        className="shadow-2xl rounded-[2rem] overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="custom-staff-table"
        />
      </Card>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal
        title={
          <Text className="italic font-black uppercase text-emerald-600 text-lg">
            Hóa đơn chi tiết #{selectedOrder?.order_code}
          </Text>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={600}
        centered
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => selectedOrder && handlePrint(selectedOrder)}
          >
            In hóa đơn
          </Button>,
          <Button
            key="close"
            type="primary"
            className="bg-emerald-600"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Text className="text-[10px] text-gray-400 font-black uppercase block">
                  Khách hàng
                </Text>
                <Text className="font-black text-slate-700 uppercase">
                  {selectedOrder.customer_name}
                </Text>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Text className="text-[10px] text-gray-400 font-black uppercase block">
                  Điện thoại
                </Text>
                <Text className="font-black text-slate-700">
                  {selectedOrder.phone}
                </Text>
              </div>
            </div>

            <Descriptions
              bordered
              column={1}
              size="small"
              className="rounded-xl overflow-hidden shadow-sm"
            >
              <Descriptions.Item
                label={
                  <span className="text-[10px] font-black italic">
                    NGÀY ĐẶT
                  </span>
                }
              >
                {dayjs(selectedOrder.created_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="text-[10px] font-black italic">
                    THANH TOÁN
                  </span>
                }
              >
                <Tag
                  color="blue"
                  className="font-bold border-none uppercase italic m-0"
                >
                  {selectedOrder.payment_method.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="text-[10px] font-black italic">
                    TRẠNG THÁI
                  </span>
                }
              >
                <Tag
                  color={statusConfig[selectedOrder.status]?.color}
                  className="font-bold border-none uppercase italic m-0"
                >
                  {statusConfig[selectedOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <Text className="font-black italic uppercase text-[10px] text-gray-400 pl-2">
                Chi tiết sản phẩm
              </Text>
              {(selectedOrder.items || []).map((item) => {
                const itemAny = item as any;
                const itemImg = item.image?.startsWith("http")
                  ? item.image
                  : `${STORAGE_URL}${item.image?.replace(/^\//, "")}`;
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"
                  >
                    <Space>
                      <AntdImage
                        src={itemImg}
                        width={45}
                        height={45}
                        className="rounded-lg object-cover shadow-sm"
                        fallback="https://placehold.co/45x45?text=⚽"
                      />
                      <div>
                        <div className="font-black text-[11px] uppercase text-slate-600">
                          {item.name || itemAny.product_name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold">
                          x{item.quantity} {item.unit}
                        </div>
                      </div>
                    </Space>
                    <Text className="font-black text-emerald-600">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </Text>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 shadow-inner">
              <span className="font-black italic uppercase text-emerald-700 text-lg">
                Tổng tiền:
              </span>
              <Text className="text-3xl font-black text-red-500 italic leading-none">
                {Number(selectedOrder.total_amount).toLocaleString()}đ
              </Text>
            </div>
          </div>
        )}
      </Modal>

      <AddOrder
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadOrders();
        }}
      />

      <style>{`
        .custom-staff-table .ant-table-thead > tr > th { background: #f0fdf4 !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #065f46 !important; border-bottom: 2px solid #d1fae5 !important; }
        .custom-staff-table .ant-table-row:hover > td { background-color: #fafffd !important; }
      `}</style>
    </div>
  );
}

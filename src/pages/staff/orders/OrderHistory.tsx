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
  EyeOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
// ✅ FIX LỖI IMPORT (image_393bcd): Import chuẩn từ file service
import staffOrderService from "@/services/staff/orderService";
import type { Order, OrderItem } from "@/services/staff/orderService";
import AddOrder from "./CreateOrderModal"; 

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

  // ✅ LỌC NGÀY MẶC ĐỊNH LÀ HÔM NAY
  const [filterDate, setFilterDate] = useState<string | null>(
    dayjs().format("YYYY-MM-DD"),
  );

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffOrderService.getAllOrders();
      const rawData = response.data as any;
      const actualData: Order[] = Array.isArray(rawData)
        ? rawData
        : rawData.data?.data || rawData.data || [];

      // ✅ CHỈ LẤY ĐƠN ĐÃ HOÀN THÀNH HOẶC ĐÃ HỦY
      const historyData = actualData.filter((o) =>
        ["completed", "cancelled"].includes(o.status),
      );
      setOrders(historyData);
    } catch (error) {
      message.error("Lỗi nạp lịch sử đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_code.toLowerCase().includes(searchText.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchText.toLowerCase());
      const matchDate = filterDate
        ? dayjs(o.created_at).format("YYYY-MM-DD") === filterDate
        : true;
      return matchSearch && matchDate;
    });
  }, [orders, searchText, filterDate]);

  const columns: ColumnsType<Order> = [
    {
      title: "MÃ ĐƠN",
      render: (_, r: Order) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-emerald-600 uppercase italic">
            {r.order_code}
          </Text>
          <Text className="text-[10px] text-gray-400">
            {dayjs(r.created_at).format("HH:mm DD/MM/YYYY")}
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
      title: "TỔNG TIỀN",
      dataIndex: "total_amount",
      align: "right",
      render: (val: number) => (
        <Text className="font-black text-red-500 italic">
          {Number(val).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: "center",
      render: (status: string) => (
        <Tag
          color={status === "completed" ? "success" : "error"}
          icon={status === "completed" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          className="font-black italic uppercase text-[9px] border-none px-3 shadow-sm"
        >
          {status === "completed" ? "HOÀN THÀNH" : "ĐÃ HỦY"}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right",
      render: (_, r: Order) => (
        <Space>
          {/* ✅ NÚT XEM CHI TIẾT THEO YÊU CẦU (image_39402a) */}
          <Button
            icon={<EyeOutlined />}
            className="flex items-center gap-1 rounded-full border-blue-400 text-blue-500 font-black italic text-[11px] h-8 hover:bg-blue-50"
            onClick={() => {
              setSelectedOrder(r);
              setIsDetailModalOpen(true);
            }}
          >
            Chi tiết
          </Button>

          {/* {r.status === "cancelled" && (
            <Button 
              icon={<ShoppingCartOutlined />} 
              size="small" 
              type="primary"
              className="bg-orange-500 border-none rounded-full italic font-bold text-[10px]"
              onClick={() => setIsReorderModalOpen(true)}
            >
              MUA LẠI
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <Title level={2} className="!m-0 !font-black italic uppercase tracking-tighter">
            Lịch sử <span className="text-emerald-500">Đơn hàng</span>
          </Title>
          <Text className="text-slate-400 font-bold italic uppercase text-[10px]">
            Retail Sales History
          </Text>
        </div>

        <Space wrap size="middle">
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <DatePicker
              variant="borderless"
              className="font-bold w-40"
              value={filterDate ? dayjs(filterDate) : null}
              onChange={(date) =>
                setFilterDate(date ? date.format("YYYY-MM-DD") : null)
              }
            />
            <Divider type="vertical" className="h-6" />
            <Button
              type="text"
              className={`font-black italic text-[11px] px-4 rounded-lg uppercase ${!filterDate ? "text-emerald-600 bg-emerald-50" : "text-slate-400"}`}
              onClick={() => setFilterDate(null)}
            >
              Tất cả
            </Button>
          </div>

          <Input
            placeholder="Tìm mã đơn, khách..."
            prefix={<SearchOutlined />}
            className="rounded-xl w-64 h-10 font-bold shadow-sm border-none bg-white"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={loadOrders}
            className="h-10 rounded-xl bg-white border-none shadow-sm"
          />
        </Space>
      </div>

      <Card
        variant="borderless"
        className="shadow-2xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm"
      >
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (t) => `Tổng cộng ${t} hóa đơn`,
          }}
          className="custom-staff-history-table"
        />
      </Card>

      {/* ✅ MODAL CHI TIẾT ĐẦY ĐỦ HƠN (THEO YÊU CẦU) */}
      <Modal
        title={
          <Text className="italic font-black uppercase text-emerald-600 text-lg">
            Chi tiết hóa đơn #{selectedOrder?.order_code}
          </Text>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            className="bg-emerald-600 rounded-lg font-bold"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={650}
        centered
      >
        {selectedOrder && (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <Text className="text-[10px] text-gray-400 font-black uppercase block mb-1"><UserOutlined /> Khách hàng</Text>
                  <Text className="font-black text-slate-700 uppercase text-sm">{selectedOrder.customer_name}</Text>
               </div>
               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <Text className="text-[10px] text-gray-400 font-black uppercase block mb-1"><PhoneOutlined /> Số điện thoại</Text>
                  <Text className="font-black text-slate-700 text-sm">{selectedOrder.phone}</Text>
               </div>
            </div>

            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden shadow-sm">
              <Descriptions.Item label={<span className="font-bold text-[10px] uppercase italic text-slate-400"><CalendarOutlined /> Ngày lập đơn</span>}>
                <Text className="font-bold">{dayjs(selectedOrder.created_at).format("HH:mm - DD/MM/YYYY")}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-[10px] uppercase italic text-slate-400"><CreditCardOutlined /> Thanh toán</span>}>
                <Tag color="blue" className="font-black uppercase italic border-none m-0">
                  {selectedOrder.payment_method?.toUpperCase() || "TIỀN MẶT"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-bold text-[10px] uppercase italic text-slate-400">Trạng thái</span>}>
                <Tag color={selectedOrder.status === "completed" ? "success" : "error"} className="font-black uppercase italic border-none m-0">
                  {selectedOrder.status === "completed" ? "Đã thanh toán thành công" : "Đã hủy đơn"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <Text className="font-black italic uppercase text-[10px] text-gray-400 pl-2">Danh sách sản phẩm ({selectedOrder.items?.length || 0})</Text>
              {(selectedOrder.items || []).map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md"
                >
                  <Space size="middle">
                    <AntdImage
                      src={item.image?.startsWith("http") ? item.image : `${STORAGE_URL}${item.image}`}
                      width={45}
                      height={45}
                      className="rounded-xl object-cover shadow-sm"
                      fallback="https://placehold.co/45x45?text=SP"
                    />
                    <div>
                      <div className="font-black text-[12px] uppercase text-slate-600">
                        {item.product_name || item.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-black italic">
                        x{item.quantity} {item.unit || "món"} | {Number(item.price).toLocaleString()}đ
                      </div>
                    </div>
                  </Space>
                  <Text className="font-black text-slate-700 text-base">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </Text>
                </div>
              ))}
            </div>

            <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex justify-between items-center shadow-inner">
              <span className="font-black italic uppercase text-emerald-700 text-lg">TỔNG CỘNG:</span>
              <Text className="text-3xl font-black text-red-500 italic tracking-tighter">
                {Number(selectedOrder.total_amount).toLocaleString()}đ
              </Text>
            </div>
          </div>
        )}
      </Modal>

      <AddOrder
        open={isReorderModalOpen}
        onCancel={() => setIsReorderModalOpen(false)}
        onSuccess={() => {
          setIsReorderModalOpen(false);
          loadOrders();
        }}
      />

      <style>{`
        .custom-staff-history-table .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #64748b !important; border-bottom: 2px solid #e2e8f0 !important; }
        .custom-staff-history-table .ant-table-row:hover > td { background-color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Typography,
  Button,
  Descriptions,
  Divider,
  Table,
  message,
  Spin,
  Result,
  Image as AntdImage,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  CoffeeOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import orderService, { OrderRecord } from "@/services/customer/orderService";

const { Title, Text } = Typography;

// 🛑 CẬP NHẬT: Config trạng thái đồng bộ toàn hệ thống
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

export default function OrderDetail() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  useEffect(() => {
    if (orderCode) {
      setLoading(true);
      orderService
        .getOrderDetail(orderCode)
        .then((res) => {
          if (res.status === "success") {
            setOrder(res.data);
          }
        })
        .catch(() => {
          message.error("Không thể tải chi tiết đơn hàng!");
        })
        .finally(() => setLoading(false));
    }
  }, [orderCode]);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center bg-[#f8fafb]">
        <Spin size="large" tip="Đang tải cực phẩm..." />
      </div>
    );

  if (!order)
    return (
      <div className="h-screen flex justify-center items-center bg-[#f8fafb]">
        <Result
          status="404"
          title="Không tìm thấy đơn hàng"
          subTitle="Mã đơn hàng không tồn tại hoặc bro không có quyền xem."
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          }
        />
      </div>
    );

  // Lấy cấu hình trạng thái hiện tại
  const currentStatus = statusConfig[order.status] || {
    color: "default",
    text: order.status,
    icon: null,
  };

  return (
    <div className="p-8 bg-[#f8fafb] min-h-screen animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6 font-bold italic uppercase border-none bg-transparent shadow-none hover:text-emerald-500"
        >
          Quay lại danh sách
        </Button>

        <Card className="shadow-2xl border-none rounded-[32px] p-8 bg-white print-area overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <Title
                level={2}
                className="!font-black !italic !uppercase !text-emerald-600 !mb-0 tracking-tighter"
              >
                HÓA ĐƠN CHI TIẾT
              </Title>
              <Text className="text-gray-400 font-bold uppercase italic text-[10px]">
                Stadium POS - Thanh Hóa Soccer
              </Text>
            </div>
            <div className="text-right">
              <Text
                strong
                className="text-2xl italic text-emerald-600 uppercase tracking-widest"
              >
                {order.order_code}
              </Text>
              <div className="mt-2">
                {/* 🛑 CẬP NHẬT: Hiển thị Tag trạng thái linh hoạt */}
                <Tag
                  color={currentStatus.color}
                  icon={currentStatus.icon}
                  className="font-black italic uppercase rounded-md border-none px-4 py-1 shadow-sm"
                >
                  {currentStatus.text}
                </Tag>
              </div>
            </div>
          </div>

          <Descriptions
            bordered
            column={2}
            size="small"
            className="invoice-descriptions mb-8 rounded-xl overflow-hidden shadow-sm"
          >
            <Descriptions.Item label="Ngày đặt">
              {dayjs(order.created_at).format("HH:mm DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <Text strong className="uppercase">
                {order.customer_name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {order.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán" span={2}>
              <Tag
                color="cyan"
                className="font-black italic uppercase border-none"
              >
                {order.payment_method === "qr" ? "VietQR" : "Tiền mặt"}
              </Tag>
            </Descriptions.Item>
            {order.notes && (
              <Descriptions.Item
                label="Ghi chú"
                span={2}
                className="italic text-gray-400"
              >
                {order.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider
            className="!my-10 font-black italic uppercase text-emerald-800/10"
            plain
          >
            Chi tiết các món đã đặt
          </Divider>

          <Table
            dataSource={order.items || []}
            rowKey="id"
            pagination={false}
            size="small"
            className="mb-10 border rounded-2xl overflow-hidden shadow-sm"
            columns={[
              {
                title: "Ảnh",
                dataIndex: "image",
                key: "image",
                width: 100,
                render: (img: string) => {
                  const fullUrl = img?.startsWith("http")
                    ? img
                    : `${STORAGE_URL}${img?.replace(/^\//, "")}`;
                  return (
                    <AntdImage
                      src={fullUrl}
                      width={60}
                      height={60}
                      className="rounded-xl object-cover shadow-sm border border-gray-50"
                      fallback="https://placehold.co/60x60?text=⚽"
                    />
                  );
                },
              },
              {
                title: "Sản phẩm/Sân",
                dataIndex: "product_name",
                key: "product_name",
                render: (t) => (
                  <Text className="italic font-bold uppercase text-slate-700">
                    {t}
                  </Text>
                ),
              },
              {
                title: "SL",
                dataIndex: "quantity",
                key: "quantity",
                align: "center",
                width: 80,
              },
              {
                title: "Đơn giá",
                dataIndex: "price",
                key: "price",
                render: (p) => `${Number(p).toLocaleString()}đ`,
              },
              {
                title: "Thành tiền",
                dataIndex: "subtotal",
                key: "subtotal",
                render: (v) => (
                  <Text strong className="text-emerald-600 italic">
                    {Number(v).toLocaleString()}đ
                  </Text>
                ),
              },
            ]}
          />

          <div className="bg-emerald-50/20 p-8 rounded-[32px] border border-emerald-50 text-right shadow-inner">
            <div className="flex justify-between px-4 mb-4">
              <Text className="font-black uppercase italic text-gray-400">
                Tạm tính:
              </Text>
              <Text strong className="text-xl">
                {Number(order.total_amount).toLocaleString()}đ
              </Text>
            </div>
            <Divider className="my-4" />
            <div className="flex justify-between px-4">
              <Text className="font-black uppercase italic text-emerald-800 text-xl">
                Tổng cộng:
              </Text>
              <Text
                strong
                className="text-5xl text-emerald-600 italic font-black tracking-tighter"
              >
                {Number(order.total_amount).toLocaleString()}đ
              </Text>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-4 no-print">
            <Button
              icon={<PrinterOutlined />}
              size="large"
              onClick={() => window.print()}
              className="rounded-xl font-bold italic h-14 px-10 shadow-lg"
            >
              In hóa đơn rực rỡ
            </Button>
          </div>
        </Card>
      </div>

      <style>{`
        .invoice-descriptions .ant-descriptions-item-label { background: #f8fafb !important; font-weight: 900 !important; text-transform: uppercase !important; font-size: 10px !important; font-style: italic !important; width: 160px; color: #64748b; }
        @media print {
            .no-print, .ant-btn, .ant-layout-sider, .ant-layout-header { display: none !important; }
            .print-area { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
            body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

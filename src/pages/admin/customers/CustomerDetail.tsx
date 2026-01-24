import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Table,
  Button,
  Space,
  Statistic,
  Divider,
  Spin,
  message,
  Tabs,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
  HistoryOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminCustomerService, {
  Customer,
  CustomerBooking,
} from "@/services/admin/customerService";

const { Title, Text } = Typography;

// 🛑 Định nghĩa Interface thay cho any
interface CustomerOrder {
  id: number;
  order_code: string;
  total_amount: number;
  status: string;
  created_at: string;
}

// Interface mở rộng cho Response từ API chi tiết
interface CustomerDetailResponse {
  success: boolean;
  data: Customer;
  bookings: CustomerBooking[];
  orders: CustomerOrder[]; // Thêm orders vào đây cho sạch any
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const fetchData = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);

      // Ép kiểu Response về Interface vừa định nghĩa ở trên
      const res = (await adminCustomerService.getCustomerDetail(
        id,
      )) as unknown as CustomerDetailResponse;

      if (res.success) {
        setCustomer(res.data);
        setBookings(res.bookings || []);
        setOrders(res.orders || []);
      }
    } catch (error: unknown) {
      // Xử lý lỗi unknown theo chuẩn TS
      const errorMsg = error instanceof Error ? error.message : "Lỗi hệ thống";
      console.error(errorMsg);
      message.error("Lỗi soi hồ sơ khách hàng rực rỡ!");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#064e3b]">
        <Spin size="large" />
        <div className="mt-4 text-white font-bold italic uppercase tracking-widest">
          Đang soi hồ sơ cực phẩm...
        </div>
      </div>
    );

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6 rounded-xl font-black italic bg-white/10 text-white border-none hover:bg-white/20 uppercase"
        >
          Quay lại danh sách
        </Button>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="rounded-[32px] border-none shadow-2xl text-center p-4 bg-white/95">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className={
                  customer?.is_vip
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-600 border-4 border-white shadow-xl"
                    : "bg-blue-500 shadow-lg"
                }
              />
              <Title
                level={3}
                className="mt-4 mb-0 font-black uppercase italic text-slate-800"
              >
                {customer?.name}{" "}
                {customer?.is_vip && (
                  <StarOutlined className="text-amber-500" />
                )}
              </Title>
              <Tag
                color={customer?.status === "active" ? "green" : "volcano"}
                className="rounded-full px-4 mt-2 font-black border-none shadow-sm"
              >
                {customer?.status === "active" ? "HOẠT ĐỘNG" : "TẠM KHÓA"}
              </Tag>

              <Divider className="my-6" />

              <div className="text-left space-y-5 px-4">
                <Space align="center" size="middle">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm">
                    <PhoneOutlined className="text-blue-500" />
                  </div>
                  <Text className="font-bold text-slate-700 text-base">
                    {customer?.phone || "---"}
                  </Text>
                </Space>
                <br />
                <Space align="center" size="middle">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shadow-sm">
                    <MailOutlined className="text-emerald-500" />
                  </div>
                  <Text className="font-bold text-slate-700 text-base">
                    {customer?.email || "---"}
                  </Text>
                </Space>
                <br />
                <Space align="center" size="middle">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shadow-sm">
                    <CalendarOutlined className="text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">
                      Ngày gia nhập
                    </div>
                    <Text className="font-bold text-slate-600">
                      {customer
                        ? dayjs(customer.created_at).format("DD/MM/YYYY")
                        : "---"}
                    </Text>
                  </div>
                </Space>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <Card
                  size="small"
                  className="bg-blue-50 border-none rounded-2xl shadow-inner"
                >
                  <Statistic
                    title={
                      <span className="text-[10px] font-black text-blue-800 uppercase">
                        Tổng lượt đặt
                      </span>
                    }
                    value={customer?.total_bookings}
                    styles={{ content: { fontWeight: 900, color: "#1d4ed8" } }}
                  />
                </Card>
                <Card
                  size="small"
                  className="bg-emerald-50 border-none rounded-2xl shadow-inner"
                >
                  <Statistic
                    title={
                      <span className="text-[10px] font-black text-emerald-800 uppercase">
                        Tổng chi tiêu
                      </span>
                    }
                    value={customer?.total_spent}
                    formatter={(val) => (
                      <span className="text-[14px] font-black">
                        {formatCurrency(Number(val))}
                      </span>
                    )}
                    styles={{ content: { color: "#059669" } }}
                  />
                </Card>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 overflow-hidden min-h-[600px]">
              <Tabs
                defaultActiveKey="1"
                className="custom-detail-tabs px-6 py-4"
                items={[
                  {
                    key: "1",
                    label: (
                      <span className="font-black italic uppercase text-[12px] flex items-center gap-2">
                        <HistoryOutlined /> Lịch sử đặt sân
                      </span>
                    ),
                    children: (
                      <Table
                        dataSource={bookings}
                        rowKey="id"
                        pagination={{ pageSize: 6 }}
                        className="custom-table-bold"
                        columns={[
                          {
                            title: "MÃ ĐƠN",
                            dataIndex: "booking_code",
                            render: (text: string) => (
                              <Text className="font-black text-blue-600">
                                #{text}
                              </Text>
                            ),
                          },
                          {
                            title: "NGÀY ĐÁ",
                            dataIndex: "booking_date",
                            render: (date: string) => (
                              <Text className="font-bold">
                                {dayjs(date).format("DD/MM/YYYY")}
                              </Text>
                            ),
                          },
                          {
                            title: "THÀNH TIỀN",
                            dataIndex: "total_amount",
                            render: (amount: number) => (
                              <Text className="font-black text-emerald-600">
                                {formatCurrency(amount)}
                              </Text>
                            ),
                          },
                          {
                            title: "TRẠNG THÁI",
                            dataIndex: "status",
                            render: (st: string) => (
                              <Tag
                                color={
                                  st === "completed"
                                    ? "green"
                                    : st === "cancelled"
                                      ? "volcano"
                                      : "gold"
                                }
                                className="rounded-full font-black border-none px-3 shadow-sm text-[10px]"
                              >
                                {st?.toUpperCase()}
                              </Tag>
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <span className="font-black italic uppercase text-[12px] flex items-center gap-2">
                        <ShoppingCartOutlined /> Đơn hàng dịch vụ
                      </span>
                    ),
                    children: (
                      <Table
                        dataSource={orders}
                        rowKey="id"
                        pagination={{ pageSize: 6 }}
                        className="custom-table-bold"
                        columns={[
                          {
                            title: "MÃ ORD",
                            dataIndex: "order_code",
                            render: (text: string) => (
                              <Text className="font-black text-orange-600">
                                {text}
                              </Text>
                            ),
                          },
                          {
                            title: "NGÀY MUA",
                            dataIndex: "created_at",
                            render: (date: string) => (
                              <Text className="font-bold">
                                {dayjs(date).format("DD/MM/YYYY HH:mm")}
                              </Text>
                            ),
                          },
                          {
                            title: "TỔNG TIỀN",
                            dataIndex: "total_amount",
                            render: (amount: number) => (
                              <Text className="font-black text-red-500">
                                {formatCurrency(amount)}
                              </Text>
                            ),
                          },
                          {
                            title: "TRẠNG THÁI",
                            dataIndex: "status",
                            render: (st: string) => (
                              <Tag
                                color={
                                  st === "completed"
                                    ? "green"
                                    : st === "cancelled"
                                      ? "volcano"
                                      : "gold"
                                }
                                className="rounded-full font-black border-none px-3 text-[10px]"
                              >
                                {st?.toUpperCase()}
                              </Tag>
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-detail-tabs .ant-tabs-tab { padding: 12px 0 !important; }
        .custom-detail-tabs .ant-tabs-tab-btn { color: #94a3b8 !important; font-weight: 700; }
        .custom-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #065f46 !important; font-size: 14px; }
        .custom-detail-tabs .ant-tabs-ink-bar { background: #065f46 !important; height: 4px !important; border-radius: 4px; }
        .custom-table-bold .ant-table-thead > tr > th { background: #f8fafb !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #64748b !important; }
        .custom-table-bold .ant-table-row:hover > td { background-color: #fafffd !important; }
      `}</style>
    </div>
  );
}

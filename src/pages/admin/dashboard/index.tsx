import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Spin,
  message,
  Typography,
  Divider,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import adminDashboardService, {
  DashboardResponse,
  RecentBooking,
  RecentOrder,
} from "@/services/admin/adminDashboardService";

const { Text, Title } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: "gold", text: "Chờ xác nhận" },
    confirmed: { color: "blue", text: "Đã xác nhận" },
    playing: { color: "green", text: "Đang chơi" },
    completed: { color: "default", text: "Hoàn thành" },
    cancelled: { color: "red", text: "Đã hủy" },
  };
  const { color, text } = statusMap[status] || {
    color: "default",
    text: status,
  };
  return (
    <Tag color={color} className="rounded-full font-bold px-3">
      {text}
    </Tag>
  );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminDashboardService.getDashboardData();
      if (res.success) {
        setData(res);
      }
    } catch (error: unknown) {
      message.error("Lỗi nạp năng lượng Dashboard!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !data)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Spin size="large" />
        <Text className="mt-4 text-emerald-500 font-black italic">
          ĐANG TỔNG HỢP DỮ LIỆU CỰC PHẨM...
        </Text>
      </div>
    );

  const {
    stats,
    revenueData,
    fieldUsage,
    recentBookings,
    recentOrders,
    yearlyTotal,
  } = data;

  return (
    <div className="space-y-8">
      {/* 1. Daily Stats */}
      <Row gutter={[20, 20]}>
        {[
          {
            title: "Doanh thu tuần này", // 🛑 Cập nhật nhãn mới cho rực rỡ
            val: stats.revenue,
            growth: stats.revenueGrowth,
            icon: <DollarOutlined />,
            color: "#10b981",
            suffix: "đ",
          },
          {
            title: "Lượt đặt tuần này", // 🛑 Cập nhật nhãn
            val: stats.bookings,
            growth: stats.bookingsGrowth,
            icon: <CalendarOutlined />,
            color: "#3b82f6",
            suffix: " lượt",
          },
          // {
          //   title: "Lượt đặt sân",
          //   val: stats.bookings,
          //   growth: stats.bookingsGrowth,
          //   icon: <CalendarOutlined />,
          //   color: "#3b82f6",
          //   suffix: " lượt",
          // },
          {
            title: "Khách hàng",
            val: stats.customers,
            growth: stats.newCustomers,
            icon: <TeamOutlined />,
            color: "#f59e0b",
            suffix: " người",
            isNew: true,
          },
          {
            title: "Sản phẩm bán",
            val: stats.products,
            growth: stats.productsGrowth,
            icon: <ShoppingCartOutlined />,
            color: "#8b5cf6",
            suffix: " đơn",
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="border-none shadow-lg rounded-[2rem] bg-white/95 transition-all hover:shadow-2xl">
              <Statistic
                title={
                  <span className="font-black uppercase italic text-[10px] text-slate-400">
                    {item.title}
                  </span>
                }
                value={item.val}
                formatter={(value) =>
                  item.suffix === "đ"
                    ? formatCurrency(Number(value))
                    : `${value}${item.suffix}`
                }
                styles={{ content: { color: item.color, fontWeight: 900 } }}
                prefix={item.icon}
              />
              <div
                className={`mt-2 flex items-center text-[11px] font-bold ${item.isNew ? "text-blue-500" : "text-green-600"}`}
              >
                <RiseOutlined className="mr-1" />
                {item.isNew
                  ? `+${item.growth} khách mới`
                  : `+${item.growth}% so với hôm qua`}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 2. Charts Section */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="font-black uppercase italic text-emerald-700">
                Biểu đồ doanh thu tổng hợp (Sân + Shop)
              </span>
            }
            className="border-none shadow-xl rounded-[2.5rem] bg-white/95"
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* 🛑 DÒNG TỔNG CỘNG BRO YÊU CẦU */}
            <Divider className="my-4" />
            <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
              <div>
                <Text className="text-emerald-600 font-black italic uppercase block text-xs tracking-wider">
                  Tổng doanh thu năm nay:
                </Text>
                <Text className="text-[10px] text-slate-400 font-bold uppercase italic">
                  * Chỉ tính các đơn hàng đã hoàn thành rực rỡ
                </Text>
              </div>
              <Title
                level={3}
                className="!m-0 !text-emerald-700 !font-black tracking-tighter italic"
              >
                {formatCurrency(yearlyTotal || 0)}
              </Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="font-black uppercase italic text-blue-700">
                Tỷ lệ sân
              </span>
            }
            className="border-none shadow-xl rounded-[2.5rem] bg-white/95"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fieldUsage}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fieldUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {fieldUsage.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-[10px] font-bold uppercase italic">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Recent Bookings */}
      <Card
        title={
          <span className="font-black uppercase italic text-blue-600">
            Đặt sân mới nhất
          </span>
        }
        className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/95"
      >
        <Table
          dataSource={recentBookings}
          rowKey="id"
          pagination={false}
          className="custom-table-platinum"
          columns={[
            {
              title: "MÃ ĐƠN",
              dataIndex: "booking_code",
              render: (text: string) => (
                <Text className="font-black text-blue-600">#{text}</Text>
              ),
            },
            {
              title: "KHÁCH HÀNG",
              dataIndex: "customer_name",
              render: (text: string) => (
                <Text className="font-bold uppercase text-[12px]">{text}</Text>
              ),
            },
            {
              title: "SÂN BÓNG",
              dataIndex: "field_name",
              render: (text: string) => (
                <Tag
                  color="green"
                  className="font-black uppercase italic border-none"
                >
                  {text}
                </Tag>
              ),
            },
            {
              title: "KHUNG GIỜ",
              dataIndex: "time_slot",
              render: (text: string) => (
                <Text className="font-bold text-slate-500 italic">{text}</Text>
              ),
            },
            {
              title: "TỔNG TIỀN",
              dataIndex: "total_amount",
              render: (val: number) => (
                <Text className="font-black text-emerald-600">
                  {formatCurrency(val)}
                </Text>
              ),
            },
            {
              title: "TRẠNG THÁI",
              dataIndex: "status",
              render: (st: string) => getStatusTag(st),
            },
          ]}
        />
      </Card>

      {/* 4. Recent Orders */}
      <Card
        title={
          <span className="font-black uppercase italic text-orange-600">
            Đơn hàng sản phẩm mới nhất
          </span>
        }
        className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/95"
      >
        <Table
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          className="custom-table-platinum"
          columns={[
            {
              title: "MÃ ĐƠN",
              dataIndex: "order_code",
              render: (text: string) => (
                <Text className="font-black text-orange-500">#{text}</Text>
              ),
            },
            {
              title: "KHÁCH HÀNG",
              dataIndex: "customer_name",
              render: (text: string) => (
                <Text className="font-bold uppercase text-[12px]">
                  {text || "N/A"}
                </Text>
              ),
            },
            {
              title: "THỜI GIAN",
              dataIndex: "created_at",
              render: (text: string) => (
                <Text className="italic text-slate-400">{text}</Text>
              ),
            },
            {
              title: "TỔNG TIỀN",
              dataIndex: "total_amount",
              render: (val: number) => (
                <Text className="font-black text-red-500">
                  {formatCurrency(val)}
                </Text>
              ),
            },
            {
              title: "TRẠNG THÁI",
              dataIndex: "status",
              render: (st: string) => (
                <Tag
                  color={st === "completed" ? "green" : "gold"}
                  className="rounded-full font-bold px-3"
                >
                  {st === "completed" ? "Thành công" : "Chờ xử lý"}
                </Tag>
              ),
            },
          ]}
        />
      </Card>

      <style>{`
        .custom-table-platinum .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 900 !important; font-style: italic !important; font-size: 11px !important; text-transform: uppercase !important; }
        .ant-card { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
}

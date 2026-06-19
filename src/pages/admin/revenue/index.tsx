import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Select,
  Table,
  Spin,
  message,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import adminDashboardService, {
  RevenueReportResponse,
  TopProduct,
  TopCustomer,
  CategoryRevenueData,
} from "@/services/admin/adminDashboardService";

const { Title, Text } = Typography;

export default function AdminRevenue() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RevenueReportResponse | null>(null);
  const [period, setPeriod] = useState<string>("week");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminDashboardService.getRevenueReport({ period });
      if (res.success) {
        setData(res);
      }
    } catch (error: unknown) {
      message.error("Lỗi nạp năng lượng báo cáo rực rỡ!");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading || !data)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-[3rem]">
        <Spin size="large" />
        <Text className="mt-4 text-emerald-500 font-black italic">
          ĐANG TRÍCH XUẤT DỮ LIỆU DOANH THU...
        </Text>
      </div>
    );

  // Định nghĩa cột cho bảng Sản phẩm (Sạch any)
  const productColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: unknown, __: TopProduct, index: number) => index + 1,
    },
    {
      title: "SẢN PHẨM",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text className="font-bold">{text}</Text>,
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "quantity",
      key: "quantity",
      render: (q: number) => (
        <Text className="font-black text-blue-600">{q}</Text>
      ),
    },
    {
      title: "DOANH THU",
      dataIndex: "revenue",
      key: "revenue",
      render: (val: number) => (
        <Text className="font-black text-emerald-600">
          {val.toLocaleString()}đ
        </Text>
      ),
    },
  ];

  // Định nghĩa cột cho bảng Khách hàng (Sạch any)
  const customerColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: unknown, __: TopCustomer, index: number) => index + 1,
    },
    {
      title: "KHÁCH HÀNG",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text className="font-bold">{text}</Text>,
    },
    {
      title: "SỐ ĐƠN",
      dataIndex: "orders",
      key: "orders",
      render: (o: number) => (
        <Text className="font-black text-orange-500">{o}</Text>
      ),
    },
    {
      title: "CHI TIÊU",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (val: number) => (
        <Text className="font-black text-emerald-600">
          {val.toLocaleString()}đ
        </Text>
      ),
    },
  ];

  const statsCards = [
    {
      title: "Tổng doanh thu",
      value: data.totalRevenue,
      icon: <DollarOutlined />,
      color: "#10b981",
      suffix: "đ",
    },
    {
      title: "Tổng đơn hàng",
      value: data.totalOrders,
      icon: <ShoppingCartOutlined />,
      color: "#3b82f6",
      suffix: "",
    },
    {
      title: "Tổng lượt đặt sân",
      value: data.totalBookings,
      icon: <CalendarOutlined />,
      color: "#f59e0b",
      suffix: "",
    },
    {
      title: "Giá trị TB/đơn",
      value: data.totalRevenue / (data.totalOrders || 1),
      icon: <TrophyOutlined />,
      color: "#8b5cf6",
      suffix: "đ",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center flex-wrap gap-4 px-2">
        <Title
          level={3}
          className="!m-0 uppercase italic font-black text-emerald-800 tracking-tighter"
        >
          Báo cáo doanh thu <span className="text-emerald-500">Platinum</span>
        </Title>
        <Select
          value={period}
          onChange={setPeriod}
          className="w-40 custom-select-platinum"
          options={[
            { value: "week", label: "TUẦN NÀY" },
            { value: "month", label: "THÁNG NÀY" },
            { value: "year", label: "NĂM NAY" },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <Row gutter={[20, 20]}>
        {statsCards.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="rounded-[2rem] border-none shadow-xl bg-white/95 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <Text className="uppercase font-black text-[10px] text-slate-400 tracking-widest block">
                    {stat.title}
                  </Text>
                  <div className="text-2xl font-black italic text-slate-800">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="font-black italic uppercase text-emerald-700">
                Biến động doanh thu theo ngày
              </span>
            }
            className="rounded-[2.5rem] border-none shadow-2xl bg-white/95"
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.dailyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: number) => [
                    val.toLocaleString() + "đ",
                    "Doanh thu",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="font-black italic uppercase text-blue-700">
                Cơ cấu danh mục
              </span>
            }
            className="rounded-[2.5rem] border-none shadow-2xl bg-white/95"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                >
                  {data.categoryData.map(
                    (entry: CategoryRevenueData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ),
                  )}
                </Pie>
                <Tooltip
                  formatter={(val: number) => val.toLocaleString() + "đ"}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data.categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-[10px] font-bold uppercase italic text-slate-500">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Chart */}
      <Card
        title={
          <span className="font-black italic uppercase text-slate-700">
            Tương quan Đơn hàng & Đặt sân
          </span>
        }
        className="rounded-[2.5rem] border-none shadow-2xl bg-white/95"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#f8fafc" }} />
            <Bar
              dataKey="orders"
              fill="#3b82f6"
              name="Đơn hàng"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
            <Bar
              dataKey="bookings"
              fill="#10b981"
              name="Đặt sân"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Ranking Tables */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span className="font-black italic uppercase">
                <TrophyOutlined className="text-yellow-500 mr-2" /> Top sản phẩm
                bán chạy
              </span>
            }
            className="rounded-[2.5rem] border-none shadow-2xl bg-white/95 overflow-hidden"
          >
            <Table
              columns={productColumns}
              dataSource={data.topProducts}
              rowKey="id"
              pagination={false}
              size="middle"
              className="custom-table-platinum"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span className="font-black italic uppercase">
                <TrophyOutlined className="text-orange-500 mr-2" /> Khách hàng
                thân thiết
              </span>
            }
            className="rounded-[2.5rem] border-none shadow-2xl bg-white/95 overflow-hidden"
          >
            <Table
              columns={customerColumns}
              dataSource={data.topCustomers}
              rowKey="name"
              pagination={false}
              size="middle"
              className="custom-table-platinum"
            />
          </Card>
        </Col>
      </Row>

      <style>{`
        .custom-select-platinum .ant-select-selector { border-radius: 12px !important; border: none !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important; font-weight: 900 !important; font-style: italic !important; }
        .custom-table-platinum .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 900 !important; font-style: italic !important; font-size: 11px !important; color: #64748b !important; border: none !important; }
      `}</style>
    </div>
  );
}

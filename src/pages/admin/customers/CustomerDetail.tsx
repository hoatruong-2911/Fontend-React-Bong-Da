import { useEffect, useState } from "react";
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
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
  HistoryOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminCustomerService, {
  Customer,
  CustomerBooking,
} from "@/services/admin/customerService";

const { Title, Text } = Typography;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const res = await adminCustomerService.getCustomerDetail(id);
        if (res.success) {
          setCustomer(res.data);
          setBookings(res.bookings || []);
        }
      } catch (error: unknown) {
        message.error("Không thể tải thông tin khách hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#064e3b]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6 rounded-xl font-bold bg-white/10 text-white border-none hover:bg-white/20"
        >
          QUAY LẠI DANH SÁCH
        </Button>

        <Row gutter={24}>
          {/* CỘT TRÁI: PROFILE KHÁCH HÀNG */}
          <Col xs={24} lg={8}>
            <Card className="rounded-[32px] border-none shadow-2xl text-center p-4">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className={
                  customer?.is_vip
                    ? "bg-amber-500 border-4 border-white shadow-xl"
                    : "bg-blue-500"
                }
              />
              <Title
                level={3}
                className="mt-4 mb-0 font-black uppercase italic"
              >
                {customer?.name}{" "}
                {customer?.is_vip && (
                  <StarOutlined className="text-amber-500" />
                )}
              </Title>
              <Tag
                color={customer?.status === "active" ? "green" : "default"}
                className="rounded-full px-4 mt-2 font-bold"
              >
                {customer?.status === "active" ? "ĐANG HOẠT ĐỘNG" : "TẠM KHÓA"}
              </Tag>

              <Divider className="my-6" />

              <div className="text-left space-y-4">
                <Space>
                  <PhoneOutlined className="text-blue-500" />{" "}
                  <Text font-bold>{customer?.phone || "Chưa cập nhật"}</Text>
                </Space>
                <br />
                <Space>
                  <MailOutlined className="text-blue-500" />{" "}
                  <Text font-bold>{customer?.email}</Text>
                </Space>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <Card
                  size="small"
                  className="bg-blue-50 border-none rounded-2xl"
                >
                  <Statistic
                    title={
                      <span className="text-[10px] font-bold">TỔNG ĐẶT</span>
                    }
                    value={customer?.total_bookings}
                    valueStyle={{ fontWeight: 900, color: "#1d4ed8" }}
                  />
                </Card>
                <Card
                  size="small"
                  className="bg-emerald-50 border-none rounded-2xl"
                >
                  <Statistic
                    title={
                      <span className="text-[10px] font-bold">CHI TIÊU</span>
                    }
                    value={customer?.total_spent}
                    precision={0}
                    suffix="đ"
                    valueStyle={{
                      fontWeight: 900,
                      color: "#059669",
                      fontSize: "14px",
                    }}
                  />
                </Card>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <HistoryOutlined />{" "}
                  <span className="font-black uppercase italic">
                    Lịch sử đặt sân
                  </span>
                </Space>
              }
              className="rounded-[32px] border-none shadow-2xl"
            >
              <Table
                dataSource={bookings}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: "MÃ ĐƠN",
                    dataIndex: "booking_code",
                    render: (text) => <b className="text-blue-600">#{text}</b>,
                  },
                  {
                    title: "NGÀY ĐẶT",
                    dataIndex: "check_in_date",
                    render: (date) => dayjs(date).format("DD/MM/YYYY"),
                  },
                  {
                    title: "SỐ TIỀN",
                    dataIndex: "total_price",
                    render: (price) => (
                      <span className="font-bold">{formatCurrency(price)}</span>
                    ),
                  },
                  {
                    title: "TRẠNG THÁI",
                    dataIndex: "status",
                    render: (st) => (
                      <Tag
                        color={st === "completed" ? "green" : "orange"}
                        className="rounded-full font-bold"
                      >
                        {st === "completed" ? "THÀNH CÔNG" : "CHỜ DUYỆT"}
                      </Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

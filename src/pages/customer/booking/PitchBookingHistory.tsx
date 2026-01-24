import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  message,
  Typography,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminBookingService, { Booking } from "@/services/admin/bookingService";

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string; icon: JSX.Element }> = {
    pending: { color: "gold", text: "Chờ duyệt", icon: <ClockCircleOutlined /> },
    approved: { color: "blue", text: "Đã duyệt", icon: <CalendarOutlined /> },
    playing: { color: "green", text: "Đang đá", icon: <HistoryOutlined /> },
    completed: { color: "cyan", text: "Hoàn thành", icon: <EyeOutlined /> },
    rejected: { color: "volcano", text: "Từ chối", icon: <CloseCircleOutlined /> },
    cancelled: { color: "default", text: "Đã hủy", icon: <CloseCircleOutlined /> },
  };
  const config = statusMap[status] || { color: "default", text: status, icon: <InfoCircleOutlined /> };
  return (
    <Tag color={config.color} icon={config.icon} className="font-bold uppercase rounded-md border-none px-3 shadow-sm">
      {config.text}
    </Tag>
  );
};

import { InfoCircleOutlined } from "@ant-design/icons";

export default function PitchBookingHistory() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // FIX LỖI TypeScript (da82b0): Bóc tách mảng data từ Object trả về của AdminService
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminBookingService.getBookings();
      
      // Kiểm tra cấu trúc phân trang của Laravel
      // Nếu có response.data.data (mảng), gán vào state. Nếu không gán mảng rỗng.
      const result = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      setBookings(result);
    } catch (error: unknown) {
      console.error("Lỗi:", error);
      message.error("Không thể tải lịch sử đặt sân");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: number) => {
    try {
      await adminBookingService.cancelMyBooking(id);
      message.success("Đã yêu cầu hủy đơn thành công!");
      fetchBookings();
    } catch (error: unknown) {
      message.error("Lỗi khi hủy đơn, vui lòng liên hệ hotline.");
    }
  };

  const columns = [
    { 
      title: "Mã đơn", 
      dataIndex: "id", 
      key: "id", 
      width: 80,
      render: (id: number) => <Text strong className="text-gray-400">#{id}</Text>
    },
    {
      title: "Sân bóng",
      key: "field",
      render: (_: unknown, record: Booking) => (
        <Text strong className="text-blue-600 italic uppercase">
          {record.field?.name || `Sân #${record.field_id}`}
        </Text>
      ),
    },
    {
      title: "Lịch thi đấu",
      key: "schedule",
      render: (_: unknown, record: Booking) => (
        <div>
          <div className="font-bold">{dayjs(record.booking_date).format("DD/MM/YYYY")}</div>
          <div className="text-xs text-emerald-600 font-black italic">
            <ClockCircleOutlined className="mr-1" />
            {record.start_time?.substring(0, 5)} - {record.end_time?.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (value: number) => (
        <Text strong className="text-red-500">
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: Booking) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết hóa đơn">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => navigate(`/pitch-bookings/${record.id}`)}
              className="rounded-lg font-bold italic"
            >
              Chi tiết
            </Button>
          </Tooltip>

          {["pending", "approved"].includes(record.status) && (
            <Popconfirm
              title="Bạn muốn hủy lượt đặt này?"
              onConfirm={() => handleCancel(record.id)}
              okText="Xác nhận hủy"
              cancelText="Quay lại"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<CloseCircleOutlined />}
                className="rounded-lg font-bold italic flex items-center"
              >
                Hủy đơn
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = b.field?.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                          b.customer_name?.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchText, statusFilter]);

  return (
    <div className="p-8 bg-[#f8fafb] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="!mb-8 !font-black !italic !uppercase tracking-tighter">
          <HistoryOutlined className="text-emerald-500 mr-3" /> Lịch sử 
          <span className="text-emerald-500"> đặt sân của bạn</span>
        </Title>

        <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-gray-50/50 p-6 rounded-2xl">
            <Space wrap size="middle">
              <Input
                placeholder="Tìm theo tên sân bóng..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-xl h-11 w-80 font-bold shadow-sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-48 h-11"
                size="large"
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="pending">Chờ duyệt</Select.Option>
                <Select.Option value="approved">Đã duyệt</Select.Option>
                <Select.Option value="playing">Đang đá</Select.Option>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Space>
            
            <Button onClick={fetchBookings} icon={<HistoryOutlined />} type="text" className="font-bold">
              Làm mới
            </Button>
          </div>

          <Table
            dataSource={filteredBookings}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="custom-booking-table"
          />
        </Card>
      </div>
      <style>{`
        .custom-booking-table .ant-table-thead > tr > th { background: #f0fdf4 !important; font-weight: 900 !important; text-transform: uppercase !important; color: #065f46 !important; font-size: 11px !important; }
      `}</style>
    </div>
  );
}
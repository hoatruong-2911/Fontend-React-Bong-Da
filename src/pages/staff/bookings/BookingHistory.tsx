import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Tag,
  Typography,
  Card,
  Space,
  Button,
  message,
  Modal,
  Descriptions,
  Input,
  DatePicker,
  Select,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Booking } from "@/services/staff/staffBookingService";
import staffBookingService from "@/services/staff/staffBookingService"; // Sửa lại đường dẫn import đúng chuẩn

const { Title, Text } = Typography;

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ✅ THÊM STATE LỌC NGÀY (Mặc định là ngày hôm nay)
  const [filterDate, setFilterDate] = useState<string | null>(
    dayjs().format("YYYY-MM-DD"),
  );

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffBookingService.getBookings();
      const rawData = res.data;

      let allData: Booking[] = [];
      if (Array.isArray(rawData)) {
        allData = rawData;
      } else if (rawData && typeof rawData === "object" && "data" in rawData) {
        allData = (rawData as any).data as Booking[];
      }

      const historyData = allData.filter((b) =>
        ["completed", "cancelled"].includes(b.status),
      );
      setBookings(historyData);
    } catch (error) {
      message.error("Không thể nạp lịch sử!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredData = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Lọc theo tên khách hoặc mã đơn
      const matchSearch =
        b.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (b.booking_code || "").toLowerCase().includes(searchText.toLowerCase());

      // 2. ✅ LỌC THEO NGÀY (Nếu filterDate là null thì hiện tất cả)
      const matchDate = filterDate ? b.booking_date === filterDate : true;

      return matchSearch && matchDate;
    });
  }, [bookings, searchText, filterDate]);

  const columns = [
    {
      title: (
        <span className="font-black text-[10px] italic uppercase">
          Mã đơn & Khách
        </span>
      ),
      render: (r: Booking) => (
        <div className="space-y-1">
          <div className="font-black text-emerald-600 italic uppercase text-[12px]">
            #{r.booking_code || (r as any).order_code || "POS-" + r.id}
          </div>
          <div className="font-bold text-slate-700 uppercase leading-none">
            {r.customer_name}
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            {r.customer_phone}
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] italic uppercase">
          Thông tin sân
        </span>
      ),
      render: (r: Booking) => (
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-black uppercase leading-none mb-1">
            <EnvironmentOutlined />{" "}
            {r.field?.name || r.field_name || "Sân chưa xác định"}
          </div>
          <div className="text-[10px] text-slate-400 font-bold italic uppercase flex items-center gap-1">
            <CalendarOutlined /> {dayjs(r.booking_date).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] italic uppercase">
          Thời gian
        </span>
      ),
      render: (r: Booking) => (
        <Tag className="font-black italic bg-slate-50 border-none text-slate-500 rounded-md">
          {r.start_time.substring(0, 5)} - {r.end_time.substring(0, 5)}
        </Tag>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] italic uppercase text-right block">
          Thanh toán
        </span>
      ),
      align: "right" as const,
      render: (r: Booking) => {
        const amount = r.total_price || (r as any).total_amount || 0;
        return (
          <Text className="font-black text-red-500 italic text-lg">
            {Number(amount).toLocaleString()}đ
          </Text>
        );
      },
    },
    {
      title: (
        <span className="font-black text-[10px] italic uppercase text-center block">
          Trạng thái
        </span>
      ),
      align: "center" as const,
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={status === "completed" ? "success" : "error"}
          className="font-black italic uppercase text-[10px] rounded-md border-none px-3 shadow-sm"
        >
          {status === "completed" ? "HOÀN THÀNH" : "ĐÃ HỦY"}
        </Tag>
      ),
    },
    {
      title: (
        <span className="font-black text-[10px] italic uppercase text-center block">
          Thao tác
        </span>
      ),
      align: "center" as const,
      render: (r: Booking) => (
        <Button
          icon={<EyeOutlined />}
          className="flex items-center gap-1 rounded-full border-blue-400 text-blue-500 font-black italic text-[11px] h-8 hover:bg-blue-50"
          onClick={() => {
            setSelectedBooking(r);
            setIsDetailOpen(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <Title
            level={2}
            className="!m-0 !font-black italic uppercase tracking-tighter"
          >
            Lịch sử <span className="text-emerald-500">Đặt sân</span>
          </Title>
          <Text className="text-slate-400 font-bold italic uppercase text-[10px]">
            Booking Audit Trail
          </Text>
        </div>
        <Space wrap size="middle">
          {/* ✅ BỘ LỌC NGÀY THÔNG MINH */}
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <DatePicker
              variant="borderless"
              placeholder="Lọc theo ngày"
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
            placeholder="Tìm mã, tên khách..."
            prefix={<SearchOutlined />}
            className="rounded-xl w-64 h-10 font-bold shadow-sm border-none bg-white"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchHistory}
            className="h-10 rounded-xl font-bold bg-white border-none shadow-sm"
          />
        </Space>
      </div>

      <Card
        variant="borderless"
        className="shadow-2xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm"
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (t) => `Tổng cộng ${t} đơn hàng`,
          }}
          className="custom-staff-history-table"
        />
      </Card>

      {/* ✅ MODAL CHI TIẾT ĐẦY ĐỦ THÔNG TIN */}
      <Modal
        title={
          <Text className="italic font-black uppercase text-emerald-600 text-lg">
            Chi tiết đơn đặt sân #
            {selectedBooking?.booking_code || selectedBooking?.id}
          </Text>
        }
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            className="bg-emerald-600 rounded-lg font-bold"
            onClick={() => setIsDetailOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={550}
        centered
      >
        {selectedBooking && (
          <div className="py-2 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <Text className="text-[10px] text-gray-400 font-black uppercase block mb-1">
                  Khách hàng
                </Text>
                <Text className="font-black text-slate-700 uppercase text-sm italic">
                  {selectedBooking.customer_name}
                </Text>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <Text className="text-[10px] text-gray-400 font-black uppercase block mb-1">
                  SĐT liên hệ
                </Text>
                <Text className="font-black text-slate-700 text-sm">
                  {selectedBooking.customer_phone}
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
                  <span className="font-bold text-[10px] uppercase italic text-slate-400">
                    <EnvironmentOutlined /> Sân bóng
                  </span>
                }
              >
                <Text className="font-black uppercase text-emerald-600">
                  {selectedBooking.field?.name || selectedBooking.field_name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-[10px] uppercase italic text-slate-400">
                    <CalendarOutlined /> Ngày đặt
                  </span>
                }
              >
                <Text className="font-bold">
                  {dayjs(selectedBooking.booking_date).format("DD/MM/YYYY")}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-[10px] uppercase italic text-slate-400">
                    <ClockCircleOutlined /> Thời gian
                  </span>
                }
              >
                <Tag className="font-black italic bg-emerald-50 text-emerald-600 border-none m-0">
                  {selectedBooking.start_time.substring(0, 5)} -{" "}
                  {selectedBooking.end_time.substring(0, 5)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-[10px] uppercase italic text-slate-400">
                    <WalletOutlined /> Trạng thái
                  </span>
                }
              >
                <Tag
                  color={
                    selectedBooking.status === "completed" ? "success" : "error"
                  }
                  className="font-black uppercase italic text-[10px] m-0 border-none"
                >
                  {selectedBooking.status === "completed"
                    ? "Đã thanh toán"
                    : "Đã hủy đơn"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex justify-between items-center shadow-inner">
              <span className="font-black italic uppercase text-emerald-700">
                Tổng tiền đã thu:
              </span>
              <Text className="text-2xl font-black text-red-500 italic">
                {Number(
                  selectedBooking.total_price ||
                    (selectedBooking as any).total_amount ||
                    0,
                ).toLocaleString()}
                đ
              </Text>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .custom-staff-history-table .ant-table-thead > tr > th { background: #f8fafc !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #64748b !important; border-bottom: 2px solid #e2e8f0 !important; }
        .custom-staff-history-table .ant-table-row:hover > td { background-color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
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
  Statistic,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import adminBookingService, { Booking } from "@/services/admin/bookingService";
import { authService } from "@/services";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string; icon: any }> =
    {
      pending: {
        color: "gold",
        text: "Chờ duyệt",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "blue",
        text: "Đã duyệt",
        icon: <CheckCircleOutlined />,
      },
      playing: {
        color: "green",
        text: "Đang đá",
        icon: <PlayCircleOutlined />,
      },
      completed: {
        color: "cyan",
        text: "Hoàn thành",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "volcano",
        text: "Từ chối",
        icon: <CloseCircleOutlined />,
      },
      cancelled: { color: "default", text: "Đã hủy", icon: <StopOutlined /> },
    };
  const config = statusMap[status] || {
    color: "default",
    text: status,
    icon: null,
  };
  return (
    <Tag color={config.color} icon={config.icon} className="font-bold">
      {config.text.toUpperCase()}
    </Tag>
  );
};

// 🚀 ĐÃ TỐI ƯU TOÀN DIỆN: Fix dứt điểm lỗi lệch chuỗi trạng thái dòng tiền
// 🚀 ĐÃ CẬP NHẬT TOÀN DIỆN: Đối soát chính xác trạng thái từ Database gửi về Index Admin
const getPaymentStatusTag = (paymentStatus: string, depositAmount: number) => {
  // Chuẩn hóa chuỗi dữ liệu
  const status = (paymentStatus || "").toLowerCase().trim();

  // 1. Kiểm tra trạng thái ĐÃ THANH TOÁN ĐỦ (fully_paid hoặc paid)
  if (
    status.includes("fully") ||
    status === "paid" ||
    status === "fully_paid"
  ) {
    return (
      <Tag
        color="green"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        ĐÃ TRẢ ĐỦ
      </Tag>
    );
  }

  // 2. Kiểm tra trạng thái ĐÃ ĐÓNG CỌC 30% (partial_paid)
  if (status.includes("partial") || status === "partial_paid") {
    return (
      <Tag
        color="cyan"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        ĐÃ CỌC 30%
      </Tag>
    );
  }

  // 3. Trường hợp đặc biệt: Đơn vãng lai đá liền không cần cọc tiền
  if (
    status === "no_deposit" ||
    (depositAmount <= 0 && (status === "paid" || status === "fully_paid"))
  ) {
    return (
      <Tag
        color="blue"
        style={{ fontWeight: 700, borderRadius: 6 }}
        className="px-3"
      >
        KHÔNG CẦN CỌC
      </Tag>
    );
  }

  // 4. Mặc định hiển thị CHƯA CỌC
  return (
    <Tag
      color="red"
      style={{ fontWeight: 700, borderRadius: 6 }}
      className="px-3"
    >
      CHƯA CỌC
    </Tag>
  );
};

export default function BookingsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    playing: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });

  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await adminBookingService.bulkDeleteBookings(selectedRowKeys);
      message.success("Đã xóa hàng loạt các đơn được chọn thành công!");
      setSelectedRowKeys([]); // Reset các dòng đã chọn
      fetchBookings(currentPage);
    } catch (error) {
      message.error("Lỗi khi xóa hàng loạt các đơn đặt sân.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (page = 1, currentStatus = statusFilter) => {
    try {
      setLoading(true);
      const filters: any = { page };

      if (currentStatus !== "all") {
        filters.status = currentStatus;
      }

      const response = await adminBookingService.getBookings(filters);
      const paginatedPayload = response.data as any;
      const resultList = paginatedPayload?.data || [];
      const totalCount = paginatedPayload?.total || 0;

      setBookings(resultList);
      setTotalBookings(totalCount);
      setCurrentPage(page);

      if (response && (response as any).stats) {
        setGlobalStats((response as any).stats);
      }
    } catch (error) {
      message.error("Không thể tải danh sách đặt sân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1, statusFilter);
  }, [statusFilter]);

  // 🚀 ĐÃ SỬA CHUẨN XỊN: Gọi đúng hàm updateStatus gốc, gửi PATCH chuẩn chỉ lên hàm changeStatus của Backend
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setLoading(true);
      // Gọi đúng endpoint PATCH /bookings/{id}/status thông qua hàm updateStatus gốc của ní
      const response = await adminBookingService.updateStatus(id, status);

      if (response.success) {
        message.success(
          `Đã chuyển trạng thái sang ${status.toUpperCase()} thành công!`,
        );
        fetchBookings(currentPage);
      }
    } catch (error: any) {
      // 🚀 BẮT LỖI NGHIỆP VỤ: Nếu Backend chặn không cho đá vì sai ngày (Lỗi 403 / 422), bóc tách hiển thị ngay lên UI
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        message.error(backendMessage);
      } else {
        message.error("Hệ thống từ chối cập nhật trạng thái nhanh!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeposit = async (record: Booking) => {
    const targetGroupId = record.recurring_group_id || String(record.id);
    try {
      setLoading(true);
      await adminBookingService.confirmDeposit(targetGroupId);
      message.success(
        "Xác nhận tiền cọc thành công! Lịch sân đã được kích hoạt.",
      );
      fetchBookings(currentPage);
    } catch (error) {
      message.error("Lỗi hoặc không tìm thấy chuỗi đơn bận tương ứng!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await adminBookingService.deleteBooking(id);
      message.success("Đã xóa đơn đặt sân rực rỡ!");
      fetchBookings(currentPage);
    } catch (error) {
      message.error("Lỗi khi xóa đơn đặt sân");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: Booking) => (
        <div>
          <div className="font-bold text-gray-800">{record.customer_name}</div>
          <div className="text-xs text-gray-500">{record.customer_phone}</div>
          {record.recurring_group_id && (
            <div className="text-[10px] bg-purple-50 text-purple-600 font-black px-1.5 py-0.5 rounded border border-purple-100 w-fit mt-1">
              ⛓️ CHUỖI: {record.recurring_group_id}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Sân bóng",
      key: "fieldName",
      render: (_: any, record: Booking) =>
        record.field?.name || `Sân #${record.field_id}`,
    },
    {
      title: "Lịch đặt",
      key: "schedule",
      render: (_: any, record: Booking) => (
        <div>
          <div className="font-medium text-slate-700">
            {record.booking_date}
          </div>
          <div className="text-xs text-blue-600 font-bold">
            {record.start_time.substring(0, 5)} -{" "}
            {record.end_time.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "Chi phí & Tiền cọc",
      key: "money_flow",
      render: (_: any, record: Booking) => {
        const total = Number(record.total_amount || 0);
        const deposit = Number(record.deposit_amount || 0);
        const paymentStatus = (record.payment_status || "").toLowerCase().trim();
        return (
          <div className="space-y-0.5 text-xs">
            <div>
              Tổng:{" "}
              <span className="text-green-600 font-bold">
                {formatCurrency(total)}
              </span>
            </div>
            {deposit > 0 && (
              <div className="text-red-500 font-medium">
                Cọc 30%: <span>{formatCurrency(deposit)}</span>
              </div>
            )}
            {paymentStatus === "partial_paid" && (
              <div className="text-red-500 font-bold italic animate-pulse">
                Chưa nhận 70% còn lại: {formatCurrency(total - deposit)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái cọc",
      dataIndex: "payment_status", // 🚀 BẮT BUỘC: Khai báo rõ ràng dataIndex để Antd bóc tách từ Object Booking
      key: "payment_status",
      render: (payment_status: string, record: Booking) =>
        getPaymentStatusTag(
          payment_status || record.payment_status || "unpaid", // Bọc lót hai đầu chống null dữ liệu
          record.deposit_amount || 0,
        ),
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác nhanh",
      key: "actions",
      render: (_: any, record: Booking) => (
        <Space size="small">
          {record.deposit_amount &&
            record.deposit_amount > 0 &&
            record.payment_status === "unpaid" &&
            record.status === "pending" && (
              <Tooltip title="Bấm xác nhận khi nhận được tiền cọc ngân hàng">
                <Button
                  disabled={!isAdmin}
                  size="small"
                  type="primary"
                  icon={<DollarCircleOutlined />}
                  className="bg-amber-500 border-amber-500 hover:bg-amber-600 font-bold text-xs"
                  onClick={() => handleConfirmDeposit(record)}
                >
                  Duyệt cọc
                </Button>
              </Tooltip>
            )}

          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/bookings/${record.id}`)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              disabled={!isAdmin}
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => navigate(`/admin/bookings/edit/${record.id}`)}
            />
          </Tooltip>

          {record.status === "pending" && (
            <>
              {!record.deposit_amount ||
              record.deposit_amount <= 0 ||
              record.payment_status !== "unpaid" ? (
                <Button
                  disabled={!isAdmin}
                  size="small"
                  type="primary"
                  className="bg-blue-600"
                  onClick={() => handleUpdateStatus(record.id, "approved")}
                >
                  Duyệt
                </Button>
              ) : (
                <span className="text-[10px] text-orange-500 font-bold italic mr-1">
                  ⚠️ Đợi cọc ngân hàng
                </span>
              )}
              <Button
                disabled={!isAdmin}
                size="small"
                danger
                onClick={() => handleUpdateStatus(record.id, "rejected")}
              >
                Từ chối
              </Button>
            </>
          )}

          {record.status === "approved" && record.payment_status === "partial_paid" && (
            <Button
              disabled={!isAdmin}
              size="small"
              className="bg-teal-600 border-teal-600 text-white font-bold hover:bg-teal-700"
              onClick={async () => {
                try {
                  setLoading(true);
                  await adminBookingService.updateStatus(record.id, undefined, "fully_paid");
                  message.success("Xác nhận nhận đủ 70% còn lại thành công!");
                  fetchBookings(currentPage);
                } catch (e) {
                  message.error("Lỗi xác nhận thanh toán!");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Nhận đủ 70%
            </Button>
          )}

          {record.status === "approved" && record.payment_status !== "partial_paid" && (
            <Button
              disabled={!isAdmin}
              size="small"
              className="bg-green-600 text-white border-green-600 font-bold"
              onClick={() => handleUpdateStatus(record.id, "playing")}
            >
              Bắt đầu đá
            </Button>
          )}

          {record.status === "playing" && (
            <Button
              disabled={!isAdmin}
              size="small"
              type="primary"
              ghost
              className="font-bold"
              onClick={() => handleUpdateStatus(record.id, "completed")}
            >
              Xong & Thu tiền
            </Button>
          )}

          {!["completed", "cancelled", "rejected"].includes(record.status) && (
            <Popconfirm
              title="Hủy đơn đặt này?"
              onConfirm={() => handleUpdateStatus(record.id, "cancelled")}
            >
              <Button
                disabled={!isAdmin}
                size="small"
                icon={<CloseCircleOutlined />}
                danger
                ghost
              />
            </Popconfirm>
          )}

          <Popconfirm
            title="Xóa vĩnh viễn đơn này?"
            description="Hành động này không thể hoàn tác, bro chắc chứ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa luôn"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa đơn hàng">
              <Button
                disabled={!isAdmin}
                icon={<DeleteOutlined />}
                size="small"
                danger
                className="flex items-center justify-center"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    return (
      booking.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.id.toString().includes(searchText) ||
      (booking.recurring_group_id &&
        booking.recurring_group_id
          .toLowerCase()
          .includes(searchText.toLowerCase()))
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <Row gutter={[12, 12]} className="flex-wrap">
        {[
          { label: "Tổng đơn", val: globalStats.total, color: "#1890ff", icon: <CalendarOutlined /> },
          { label: "Chờ duyệt", val: globalStats.pending, color: "#faad14", icon: <ClockCircleOutlined /> },
          { label: "Đã duyệt", val: globalStats.approved, color: "#3498db", icon: <CheckCircleOutlined /> },
          { label: "Đang đá", val: globalStats.playing, color: "#2ecc71", icon: <PlayCircleOutlined /> },
          { label: "Hoàn thành", val: globalStats.completed, color: "#1abc9c", icon: <CheckCircleOutlined /> },
          { label: "Đã hủy", val: globalStats.cancelled, color: "#e74c3c", icon: <CloseCircleOutlined /> },
          { label: "Doanh thu", val: globalStats.revenue, color: "#27ae60", icon: <DollarCircleOutlined />, isCurrency: true },
        ].map((item, i) => (
          <Col xs={12} sm={8} md={6} lg={3} xl={3} key={i} className="flex-fill">
            <Card size="small" bordered={false} className="shadow-sm rounded-xl bg-white h-full">
              <Statistic
                title={<span className="font-bold text-gray-400 text-xs">{item.label}</span>}
                value={item.val}
                prefix={item.icon}
                valueStyle={{
                  color: item.color,
                  fontWeight: 800,
                  fontSize: item.isCurrency ? "15px" : "18px",
                }}
                formatter={item.isCurrency ? (val) => formatCurrency(Number(val)) : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-md" style={{ borderRadius: 12 }}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm mã đơn, tên khách, mã chuỗi..."
              prefix={<SearchOutlined />}
              className="w-80"
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48"
              size="large"
              style={{ borderRadius: 8 }}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="approved">Đã duyệt</Select.Option>
              <Select.Option value="playing">Đang đá</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Space>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Xóa vĩnh viễn ${selectedRowKeys.length} đơn đặt sân đã chọn?`}
                description="Hành động này không thể hoàn tác, bro chắc chứ?"
                onConfirm={handleBulkDelete}
                okText="Xóa tất cả"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  disabled={!isAdmin}
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Xóa hàng loạt ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
            <Button
              icon={<ExportOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/admin/bookings/add")}
              style={{
                borderRadius: 8,
                backgroundColor: "#62B462",
                borderColor: "#62B462",
              }}
            >
              Tạo đặt sân
            </Button>
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => fetchBookings(currentPage)}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          dataSource={filteredBookings}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: 7,
            total: totalBookings,
            onChange: (page) => fetchBookings(page, statusFilter),
            showTotal: (total) => `Tổng cộng ${total} lượt đặt`,
          }}
          className="booking-table"
        />
      </Card>
    </div>
  );
}

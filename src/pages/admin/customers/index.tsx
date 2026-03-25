import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Avatar,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EyeOutlined,
  ExportOutlined,
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  DeleteOutlined,
  StarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import adminCustomerService, {
  Customer,
  CustomerStats,
} from "@/services/admin/customerService";

import { authService } from "@/services";

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // ✅ 0. LOGIC PHÂN QUYỀN PLATINUM
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin"; // Check nếu là Admin mới được sửa/xóa
  // 🛑 TỐI ƯU GỌI API: Dùng useCallback để tránh re-render vô tận
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminCustomerService.getCustomers({
        search: searchText,
        status: statusFilter,
      });
      if (res.success) {
        setCustomers(res.data);
        setStats(res.stats);
      }
    } catch (error: unknown) {
      message.error("Lỗi tải danh sách khách hàng rực rỡ");
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const columns: ColumnsType<Customer> = [
    {
      title: (
        <span className="font-black text-[11px] uppercase">Khách hàng</span>
      ),
      key: "customer",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            icon={<UserOutlined />}
            className={record.is_vip ? "bg-amber-500 shadow-lg" : "bg-blue-500"}
          />
          <div>
            <div className="font-bold flex items-center gap-1 uppercase italic text-[13px]">
              {record.name}
              {record.is_vip && <StarOutlined className="text-amber-500" />}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Điện thoại</span>
      ),
      dataIndex: "phone",
      render: (p: string | null) => (
        <span className="font-bold text-gray-600">{p || "---"}</span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-center">
          Lượt đặt
        </span>
      ),
      dataIndex: "total_bookings",
      align: "center",
      render: (val: number) => (
        <Tag color="blue" className="font-black border-none rounded-lg px-3">
          {val}
        </Tag>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Tổng chi tiêu</span>
      ),
      dataIndex: "total_spent",
      render: (value: number) => (
        <span className="font-black text-emerald-600 italic">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Đặt gần nhất</span>
      ),
      dataIndex: "last_booking",
      render: (date: string | null) => (
        <span className="font-bold text-gray-500">
          {date ? new Date(date).toLocaleDateString("vi-VN") : "---"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Trạng thái</span>
      ),
      dataIndex: "status",
      render: (s: Customer["status"]) => (
        <Tag
          color={s === "active" ? "green" : "volcano"}
          className="rounded-full font-black px-3 border-none shadow-sm text-[10px]"
        >
          {s === "active" ? "HOẠT ĐỘNG" : "TẠM KHÓA"}
        </Tag>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase text-blue-700">
          Thao tác
        </span>
      ),
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 border-none text-white flex items-center justify-center rounded-lg shadow-md"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/customers/${record.id}`)}
            />
          </Tooltip>
          <Button
            icon={<MailOutlined />}
            size="small"
            className="bg-blue-600 hover:bg-blue-700 border-none text-white font-black italic text-[10px]"
          >
            GỬI MAIL
          </Button>
          {/* // Tìm đến nút Delete trong columns Table */}
          <Tooltip title={isAdmin ? "Xóa" : "Chỉ Admin mới có quyền xóa"}>
            <Popconfirm
              title="Xóa khách hàng này?"
              disabled={!isAdmin}
              description="Mọi dữ liệu liên quan sẽ biến mất vĩnh viễn!"
              onConfirm={async () => {
                try {
                  const res = await adminCustomerService.deleteCustomer(
                    record.id,
                  );
                  if (res.success) {
                    message.success("Đã xóa khách hàng rực rỡ!");
                    fetchCustomers();
                  }
                } catch (error: unknown) {
                  // 🛑 KHÔNG DÙNG ANY: Ép kiểu error về AxiosError với cấu trúc data tùy chỉnh
                  const axiosError = error as {
                    response?: {
                      status: number;
                      data: {
                        message: string;
                        debug_info?: {
                          orders: Array<{ order_code: string; status: string }>;
                          bookings: Array<{
                            booking_date: string;
                            status: string;
                          }>;
                        };
                      };
                    };
                  };

                  const response = axiosError.response;

                  if (response && response.status === 422) {
                    const debugData = response.data.debug_info;

                    console.log(
                      "%c--- DỮ LIỆU THAM CHIẾU CÒN SÓT ---",
                      "color: red; font-weight: bold; font-size: 14px;",
                    );

                    if (debugData) {
                      if (debugData.orders.length > 0) {
                        console.table(debugData.orders);
                      } else {
                        console.log("Không còn đơn hàng nào.");
                      }

                      if (debugData.bookings.length > 0) {
                        console.table(debugData.bookings);
                      } else {
                        console.log("Không còn lịch đặt sân nào.");
                      }
                    }

                    message.error(response.data.message);
                  } else {
                    message.error("Lỗi hệ thống khi xóa!");
                  }
                }
              }}
              okText="Xóa luôn"
              cancelText="Thôi"
              okButtonProps={{ danger: true, className: "font-bold" }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="rounded-lg shadow-sm"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen space-y-6">
      {/* 🛑 4 THẺ THỐNG KÊ (Sửa lỗi styles content thay cho valueStyle) */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: "TỔNG KHÁCH HÀNG",
            value: stats?.totalCustomers,
            color: "#1890ff",
            icon: <TeamOutlined />,
          },
          {
            title: "ĐANG HOẠT ĐỘNG",
            value: stats?.activeCustomers,
            color: "#52c41a",
            icon: <UserOutlined />,
          },
          {
            title: "KHÁCH VIP",
            value: stats?.vipCustomers,
            color: "#faad14",
            icon: <StarOutlined />,
          },
          {
            title: "TỔNG LƯỢT ĐẶT",
            value: stats?.totalBookings,
            color: "#eb2f96",
            icon: <ShoppingCartOutlined />,
          },
        ].map((item, idx) => (
          <Col xs={24} sm={6} key={idx}>
            <Card className="rounded-2xl border-none shadow-lg relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: item.color }}
              />
              <Statistic
                title={
                  <span className="font-black text-[10px] text-gray-400 italic uppercase">
                    {item.title}
                  </span>
                }
                value={item.value || 0}
                styles={{ content: { color: item.color, fontWeight: 900 } }}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 🛑 BẢNG DỮ LIỆU CHÍNH */}
      <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 overflow-hidden">
        <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm tên, email khách hàng..."
              prefix={<SearchOutlined className="text-blue-500" />}
              className="w-72 h-10 rounded-xl font-bold shadow-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchCustomers}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-44 h-10 font-black italic shadow-sm custom-select-bold"
            >
              <Select.Option value="all">TẤT CẢ TRẠNG THÁI</Select.Option>
              <Select.Option value="active">ĐANG HOẠT ĐỘNG</Select.Option>
              <Select.Option value="inactive">TẠM KHÓA</Select.Option>
            </Select>
            <Button
              type="primary"
              onClick={fetchCustomers}
              className="h-10 rounded-xl bg-blue-700 font-black italic uppercase shadow-md border-none px-8 hover:!bg-blue-800"
            >
              LỌC DỮ LIỆU
            </Button>
          </Space>
          <Button
            icon={<ExportOutlined />}
            className="h-10 rounded-xl font-black italic uppercase border-gray-200 shadow-sm px-6"
          >
            Xuất Báo Cáo
          </Button>
        </div>

        <Table
          loading={loading}
          dataSource={customers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 8,
            className: "p-4 font-black italic",
            showTotal: (total) => `Tổng cộng ${total} khách hàng rực rỡ`,
          }}
          className="custom-table-bold"
        />
      </Card>

      <style>{`
        .custom-table-bold .ant-table-thead > tr > th { background: #f0fdf4 !important; font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 11px !important; color: #065f46 !important; border-bottom: 2px solid #d1fae5 !important; }
        .custom-table-bold .ant-table-row:hover > td { background-color: #fafffd !important; }
        .custom-select-bold .ant-select-selection-item { font-weight: 900 !important; font-style: italic !important; text-transform: uppercase !important; font-size: 12px !important; }
      `}</style>
    </div>
  );
}

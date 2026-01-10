import { useEffect, useState } from "react";
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
} from "@ant-design/icons";
import adminCustomerService, {
  Customer,
  CustomerStats,
} from "@/services/admin/customerService";

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchCustomers = async () => {
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
      message.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

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
        <span className="font-black text-[11px] uppercase">Số lần đặt</span>
      ),
      dataIndex: "total_bookings",
      align: "center",
      render: (val: number) => (
        <Tag color="blue" className="font-black border-none rounded-lg">
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
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Đặt gần nhất</span>
      ),
      dataIndex: "last_booking",
      render: (date: string | null) => (
        <span className="font-bold text-gray-500">{date || "---"}</span>
      ),
    },
    {
      title: (
        <span className="font-black text-[11px] uppercase">Trạng thái</span>
      ),
      dataIndex: "status",
      render: (s: Customer["status"]) => (
        <Tag
          color={s === "active" ? "green" : "default"}
          className="rounded-full font-black px-3 border-none shadow-sm"
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
          <Popconfirm
            title="Xóa khách hàng này?"
            description="Dữ liệu liên quan sẽ bị ảnh hưởng!"
            onConfirm={async () => {
              await adminCustomerService.deleteCustomer(record.id);
              message.success("Đã xóa khách hàng rực rỡ!");
              fetchCustomers();
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="rounded-lg shadow-sm"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#064e3b] min-h-screen space-y-6 text-white">
      {/* 4 Thẻ Stats */}
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
            title: "TỔNG BOOKING",
            value: stats?.totalBookings,
            color: "#1890ff",
            icon: <TeamOutlined />,
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
                valueStyle={{ color: item.color, fontWeight: 900 }}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[32px] border-none shadow-2xl bg-white/95 overflow-hidden text-gray-800">
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
              className="w-44 h-10 font-black italic shadow-sm"
            >
              <Select.Option value="all">TẤT CẢ TRẠNG THÁI</Select.Option>
              <Select.Option value="active">ĐANG HOẠT ĐỘNG</Select.Option>
              <Select.Option value="inactive">TẠM KHÓA</Select.Option>
            </Select>
            <Button
              type="primary"
              onClick={fetchCustomers}
              className="h-10 rounded-xl bg-blue-700 font-black italic uppercase shadow-md border-none px-8"
            >
              LỌC
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
          pagination={{ pageSize: 10, className: "p-4 font-bold" }}
          className="custom-table-bold"
        />
      </Card>
    </div>
  );
}

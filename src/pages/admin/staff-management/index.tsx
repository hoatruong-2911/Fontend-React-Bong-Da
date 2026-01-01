import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Avatar,
  Input,
  Popconfirm,
  Tooltip,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import staffService, { Staff } from "@/services/admin/staffService";

const { Title, Text } = Typography;

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function StaffIndex() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const navigate = useNavigate();

  const fetchStaffs = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await staffService.getStaffs();
      setStaffs(res.data || []);
    } catch (error: unknown) {
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const filteredData = useMemo(() => {
    return staffs.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchStatus =
        filterStatus === "all" || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [staffs, searchText, filterStatus]);

  const stats = useMemo(
    () => ({
      total: staffs.length,
      active: staffs.filter((s) => s.status === "active").length,
      off: staffs.filter((s) => s.status === "off").length,
      depts: new Set(staffs.map((s) => s.department_id)).size,
    }),
    [staffs]
  );

  const columns = [
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          Nhân viên
        </span>
      ),
      key: "employee",
      render: (record: Staff) => (
        <Space size="middle">
          <Avatar
            size={54}
            src={record.avatar ? `${STORAGE_URL}${record.avatar}` : undefined}
            icon={<UserOutlined />}
            className="border-2 border-blue-100 shadow-sm bg-gradient-to-tr from-blue-50 to-white"
          />
          <div className="flex flex-col">
            <Text className="text-[15px] font-black text-gray-800 uppercase italic leading-tight">
              {record.name}
            </Text>
            <Tag
              color="blue"
              className="w-fit mt-1 border-none text-[10px] font-bold px-2 rounded-md"
            >
              {record.position}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          Phòng ban
        </span>
      ),
      key: "department",
      render: (record: Staff) => (
        <Space className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          <BankOutlined className="text-blue-500" />
          <Text className="text-gray-600 font-medium">
            {record.department?.name || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          Liên hệ
        </span>
      ),
      key: "contact",
      render: (record: Staff) => (
        <div className="flex flex-col gap-1">
          <Text className="text-[13px] text-gray-500">
            <PhoneOutlined className="text-green-500 mr-2" />
            {record.phone}
          </Text>
          <Text className="text-[13px] text-gray-500">
            <MailOutlined className="text-red-400 mr-2" />
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          Trạng thái
        </span>
      ),
      dataIndex: "status",
      align: "center" as const,
      render: (status: string) => {
        // Chuyển từ Select sang Tag tĩnh (Read-only)
        const config = {
          active: { color: "#10b981", text: "HOẠT ĐỘNG" },
          off: { color: "#f59e0b", text: "NGHỈ PHÉP" },
          inactive: { color: "#ef4444", text: "ĐÃ NGHỈ" },
        };
        const current = config[status as keyof typeof config] || config.active;
        return (
          <Tag
            color={current.color}
            className="border-none font-black italic rounded-full px-4 text-[10px] py-1 text-white shadow-sm"
          >
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: (
        <span className="text-blue-700 font-bold uppercase text-[12px]">
          Thao tác
        </span>
      ),
      align: "right" as const,
      render: (record: Staff) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="flex items-center justify-center rounded-md border-gray-300 text-blue-500 hover:text-blue-600 hover:border-blue-500"
              onClick={() => navigate(`${record.id}`)}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              className="flex items-center justify-center rounded-md shadow-sm bg-blue-600"
              onClick={() => navigate(`edit/${record.id}`)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa nhân viên này?"
            onConfirm={async () => {
              try {
                await staffService.deleteStaff(record.id);
                message.success("Đã xóa nhân viên thành công");
                fetchStaffs();
              } catch (error: unknown) {
                message.error("Không thể xóa nhân viên này");
              }
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                size="small"
                className="flex items-center justify-center rounded-md shadow-sm"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <Title
            level={2}
            className="m-0! font-black italic text-blue-900 uppercase tracking-tighter"
          >
            Quản lý nhân sự
          </Title>
          <Text className="text-gray-400">
            Xem danh sách và quản lý thông tin nhân viên chuyên nghiệp
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 border-none font-bold shadow-lg shadow-blue-200 uppercase italic flex items-center"
          onClick={() => navigate("add")}
        >
          Thêm nhân viên mới
        </Button>
      </div>

      {/* Stats Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-[24px] border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-400 p-2">
            <div className="flex justify-between items-center text-white">
              <div>
                <Text className="text-blue-100 block font-bold text-[10px] uppercase">
                  Tổng nhân viên
                </Text>
                <Title level={2} className="text-white! m-0 italic font-black">
                  {stats.total}
                </Title>
              </div>
              <TeamOutlined className="text-4xl opacity-20" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-[24px] border-none shadow-sm bg-white p-2">
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-gray-400 block font-bold text-[10px] uppercase">
                  Đang làm việc
                </Text>
                <Title
                  level={2}
                  className="text-green-500! m-0 italic font-black"
                >
                  {stats.active}
                </Title>
              </div>
              <CheckCircleOutlined className="text-4xl text-green-100" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-[24px] border-none shadow-sm bg-white p-2">
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-gray-400 block font-bold text-[10px] uppercase">
                  Nghỉ phép
                </Text>
                <Title
                  level={2}
                  className="text-orange-500! m-0 italic font-black"
                >
                  {stats.off}
                </Title>
              </div>
              <ThunderboltOutlined className="text-4xl text-orange-100" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-[24px] border-none shadow-sm bg-white p-2">
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-gray-400 block font-bold text-[10px] uppercase">
                  Phòng ban
                </Text>
                <Title
                  level={2}
                  className="text-indigo-500! m-0 italic font-black"
                >
                  {stats.depts}
                </Title>
              </div>
              <ApartmentOutlined className="text-4xl text-indigo-100" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card className="rounded-[32px] border-none shadow-xl overflow-hidden p-2 bg-white">
        <div className="p-4 flex flex-wrap justify-between items-center bg-gray-50/50 rounded-t-[24px] gap-4">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm kiếm nhân viên..."
              prefix={<SearchOutlined className="text-blue-500" />}
              className="w-80 rounded-xl h-10 border-gray-200 shadow-sm"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="all"
              className="w-44"
              size="large"
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang hoạt động" },
                { value: "off", label: "Nghỉ phép" },
                { value: "inactive", label: "Đã nghỉ" },
              ]}
              dropdownStyle={{ borderRadius: "12px" }}
            />
          </Space>
          <div className="px-4 py-2 bg-blue-50 rounded-lg">
            <Text className="text-[11px] font-black text-blue-700 uppercase italic">
              Hiển thị {filteredData.length} kết quả
            </Text>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 7,
            className: "px-6 py-4",
            showTotal: (total) => `Tổng số ${total} nhân viên`,
          }}
          className="staff-table"
        />
      </Card>
    </div>
  );
}

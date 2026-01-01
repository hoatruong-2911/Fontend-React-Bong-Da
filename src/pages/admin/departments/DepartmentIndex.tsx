import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Switch,
  Typography,
  Popconfirm,
  message,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ApartmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import departmentService, {
  ApiError,
  Department,
  DepartmentResponse,
} from "@/services/admin/departmentService";

const { Title, Text } = Typography;

// Định nghĩa Props cho DashboardCard để bỏ any
interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function DepartmentIndex() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Thêm kiểu boolean
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res: DepartmentResponse = await departmentService.getDepartments();
      // Ép kiểu dữ liệu trả về là mảng
      setDepartments((res.data as Department[]) || []);
    } catch (error) {
      message.error("Không thể tải danh sách phòng ban!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const stats = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((d) => !!d.is_active).length,
      inactive:
        departments.length - departments.filter((d) => !!d.is_active).length,
      totalStaff: departments.reduce((sum, d) => sum + (d.staff_count || 0), 0),
    }),
    [departments]
  );

  const columns = [
    {
      title: "PHÒNG BAN",
      key: "name",
      render: (record: Department) => (
        <Space>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ApartmentOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <Text strong className="block uppercase text-blue-900">
              {record.name}
            </Text>
            <Text type="secondary" className="text-[10px] italic">
              {record.slug}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "NHÂN VIÊN",
      dataIndex: "staff_count",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="purple" className="rounded-full px-3">
          {count || 0} Thành viên
        </Tag>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "is_active",
      // Thay any bằng boolean | number
      render: (active: boolean | number, record: Department) => (
        <Switch
          checked={!!active}
          size="small"
          onChange={async () => {
            try {
              // res đã được định nghĩa kiểu Promise<DepartmentResponse> trong service
              const res = await departmentService.toggleStatus(record.id);

              if (res.success) {
                // Hiển thị thông báo trực tiếp từ Backend trả về
                message.success(
                  res.message || "Cập nhật trạng thái thành công!"
                );
                fetchDepartments(); // Tải lại danh sách
              }
            } catch (err: unknown) {
              // Trong TypeScript hiện đại, lỗi trong catch nên để là 'unknown'
              // Sau đó ép kiểu (Type Casting) về ApiError để truy cập thuộc tính
              const error = err as ApiError;

              const errorMsg =
                error.response?.data?.message || "Lỗi cập nhật trạng thái";
              message.error(errorMsg);

              console.error("Toggle Status Error:", error);
            }
          }}
        />
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right" as const,
      render: (record: Department) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="border-none bg-gray-100"
              onClick={() => navigate(`${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa phòng ban này?"
            onConfirm={async () => {
              try {
                await departmentService.deleteDepartment(record.id);
                message.success("Đã xóa!");
                fetchDepartments();
              } catch (err) {
                message.error("Không thể xóa phòng ban này!");
              }
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="border-none bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Sử dụng Interface thay cho any
  const DashboardCard = ({
    title,
    value,
    icon,
    color,
    bgColor,
  }: DashboardCardProps) => (
    <div className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-gray-100 bg-white h-full">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <Text
          strong
          className="text-gray-400 text-[11px] uppercase tracking-wider"
        >
          {title}
        </Text>
        <Title level={2} className="m-0! font-black mt-2">
          {value}
        </Title>
      </div>
      <div
        className="absolute -right-4 -bottom-4 opacity-10"
        style={{ fontSize: "80px", color: color }}
      >
        {icon}
      </div>
      <div
        className={`absolute top-6 left-0 w-1 h-6 rounded-r-full ${bgColor}`}
      ></div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic text-blue-800 uppercase m-0">
            PHÒNG BAN{" "}
            <span className="text-gray-300 not-italic font-light">
              DEPARTMENTS
            </span>
          </h1>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="rounded-xl bg-blue-600 border-none font-bold shadow-lg"
          onClick={() => navigate("add")}
        >
          Thêm Phòng Ban
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tổng phòng ban"
            value={stats.total}
            icon={<ApartmentOutlined />}
            color="#3b82f6"
            bgColor="bg-blue-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Đang hoạt động"
            value={stats.active}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            bgColor="bg-green-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tạm ngừng"
            value={stats.inactive}
            icon={<StopOutlined />}
            color="#f59e0b"
            bgColor="bg-orange-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tổng nhân sự"
            value={stats.totalStaff}
            icon={<TeamOutlined />}
            color="#6366f1"
            bgColor="bg-indigo-500"
          />
        </Col>
      </Row>

      <Card className="shadow-xl border-none rounded-[24px] overflow-hidden">
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}

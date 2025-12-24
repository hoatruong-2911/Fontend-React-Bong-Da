import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Switch,
  Avatar,
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
  TagsOutlined,
  AppstoreAddOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import categoryService, {
  Category,
} from "../../../services/admin/categoryService";

const { Title, Text } = Typography;

const CategoryIndex: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      message.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      message.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (error) {
      message.error("Xóa thất bại!");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await categoryService.toggleStatus(id);
      message.success("Đổi trạng thái rực rỡ!");
      fetchCategories();
    } catch (error) {
      message.error("Thao tác thất bại!");
    }
  };

  // --- LOGIC TÍNH TOÁN CHO DASHBOARD ---
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => !!c.is_active).length;
  const inactiveCategories = totalCategories - activeCategories;
  const totalProductsCount = categories.reduce(
    (sum, c) => sum + (c.products_count || 0),
    0
  );

  // --- UI CUSTOM CARD (GIỐNG BÊN BRAND) ---
  const DashboardCard = ({
    title,
    value,
    subValue,
    icon,
    color,
    bgColor,
    iconBg,
  }: any) => (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-gray-100 bg-white h-full"
      style={{ minHeight: "140px" }}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <Text
          strong
          className="text-gray-400 text-[11px] uppercase tracking-wider"
        >
          {title}
        </Text>
        <div className="flex items-baseline gap-2 mt-2">
          <Title
            level={2}
            className="m-0! font-black"
            style={{ color: "#1f2937" }}
          >
            {value}
          </Title>
          {subValue && (
            <Text className="text-blue-500 font-bold text-xs">{subValue}</Text>
          )}
        </div>
      </div>
      {/* Icon lớn mờ nằm dưới góc phải */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        {React.cloneElement(icon, {
          style: { fontSize: "80px", color: color },
        })}
      </div>
      {/* Chấm màu trang trí góc trái */}
      <div
        className={`absolute top-6 left-0 w-1 h-6 rounded-r-full ${bgColor}`}
      ></div>
    </div>
  );

  const columns = [
    {
      title: "STT",
      dataIndex: "sort_order",
      key: "sort_order",
      width: 80,
      render: (val: number) => (
        <Tag color="purple" className="font-bold rounded-md">
          #{val}
        </Tag>
      ),
    },
    {
      title: "DANH MỤC",
      key: "name",
      render: (record: Category) => (
        <Space size="middle">
          <Avatar
            src={
              record.image
                ? `http://127.0.0.1:8000/storage/${record.image}`
                : null
            }
            shape="square"
            size={48}
            icon={<TagsOutlined />}
            className="shadow-sm border border-gray-100 bg-gray-50"
          />
          <div>
            <Text
              strong
              className="block uppercase text-blue-900"
              style={{ fontSize: "13px" }}
            >
              {record.name}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "11px" }}
              className="italic"
            >
              {record.slug}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "SẢN PHẨM",
      dataIndex: "products_count",
      align: "center" as const,
      render: (count: number) => (
        <Tag
          color="cyan"
          className="rounded-full px-3 font-medium border-none bg-cyan-50 text-cyan-600"
        >
          {count || 0} SP
        </Tag>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "is_active",
      render: (active: any, record: Category) => (
        <Switch
          checked={!!active}
          onChange={() => handleToggleStatus(record.id)}
          size="small"
        />
      ),
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "right" as const,
      render: (record: Category) => (
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
              className="shadow-sm"
              onClick={() => navigate(`edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
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

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black italic text-green-800 uppercase m-0 flex items-center gap-2">
            DANH MỤC{" "}
            <span className="text-gray-400 not-italic font-light">
              CATEGORIES
            </span>
          </h1>
          <p className="text-gray-400 text-xs italic font-medium">
            Phân loại và tổ chức hệ thống sản phẩm
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate("add")}
          className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-green-100 bg-green-600 border-none hover:bg-green-700!"
        >
          Tạo Danh Mục Mới
        </Button>
      </div>

      {/* DASHBOARD SECTION - Y HỆT BÊN BRAND */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tổng danh mục"
            value={totalCategories}
            icon={<AppstoreAddOutlined />}
            color="#3b82f6"
            bgColor="bg-blue-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Đang hoạt động"
            value={activeCategories}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            bgColor="bg-green-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tạm ngừng"
            value={inactiveCategories}
            icon={<StopOutlined />}
            color="#f59e0b"
            bgColor="bg-orange-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Tổng sản phẩm"
            value={totalProductsCount}
            subValue="SKU"
            icon={<ShoppingOutlined />}
            color="#6366f1"
            bgColor="bg-indigo-500"
          />
        </Col>
      </Row>

      {/* TABLE SECTION */}
      <Card className="shadow-xl border-none rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <TagsOutlined className="text-green-600 text-lg" />
          </div>
          <Title
            level={4}
            className="m-0! font-black uppercase tracking-tight text-gray-800"
          >
            Quản lý danh mục
          </Title>
        </div>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          className="custom-table"
          pagination={{
            pageSize: 7,
            showTotal: (total) => (
              <Text className="text-gray-400 italic">
                Tổng số {total} danh mục
              </Text>
            ),
          }}
        />
      </Card>

      <style>{`
        .custom-table .ant-table-thead > tr > th {
          background: #f9fafb;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f3f4f6;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9fafb;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default CategoryIndex;

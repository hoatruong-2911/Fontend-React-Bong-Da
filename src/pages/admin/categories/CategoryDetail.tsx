import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Descriptions,
  Tag,
  Avatar,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import categoryService, {
  Category,
} from "../../../services/admin/categoryService";

const { Title, Text } = Typography;

const CategoryDetail: React.FC = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id)
      categoryService.getCategoryById(id).then((res) => setCategory(res.data));
  }, [id]);

  if (!category) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Title level={3} className="m-0!">
              CHI TIẾT DANH MỤC
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/categories/edit/${id}`)}
          >
            SỬA NGAY
          </Button>
        </div>

        <div className="flex gap-8 items-start">
          <Avatar
            src={`http://127.0.0.1:8000/storage/${category.image}`}
            size={180}
            shape="square"
            icon={<TagsOutlined />}
            className="rounded-2xl border-4 border-white shadow-xl bg-gray-50"
          />
          <div className="flex-1">
            <Descriptions
              title={
                <span className="text-blue-600 uppercase">
                  Thông tin cơ bản
                </span>
              }
              bordered
              column={1}
            >
              <Descriptions.Item label="Tên danh mục">
                <Text strong className="text-xl">
                  {category.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Đường dẫn tĩnh (Slug)">
                <Tag color="blue">{category.slug}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự">
                {category.sort_order}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {category.is_active ? (
                  <Tag color="green">ĐANG HOẠT ĐỘNG</Tag>
                ) : (
                  <Tag color="red">ĐÃ TẮT</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {category.description || "Chưa có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      <Card
        title={
          <Space>
            <ShoppingCartOutlined /> 5 SẢN PHẨM MỚI NHẤT THUỘC DANH MỤC
          </Space>
        }
        className="shadow-md rounded-2xl"
      >
        <Table
          dataSource={category.products}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Tên SP", dataIndex: "name", key: "name" },
            {
              title: "Giá",
              dataIndex: "price",
              key: "price",
              render: (p) => <Text type="danger">{p?.toLocaleString()}đ</Text>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CategoryDetail;

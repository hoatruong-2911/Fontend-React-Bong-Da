import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Typography, Space, Tag, Divider, Spin } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  ApartmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import departmentService, {
  Department,
} from "@/services/admin/departmentService";

const { Title, Text, Paragraph } = Typography;

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Department | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await departmentService.getDepartmentById(id!);
      // res.data lúc này mặc định là kiểu Department
      setData(res.data);
    };
    fetch();
  }, [id]);

  if (!data)
    return (
      <div className="p-20 text-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/departments")}
          className="rounded-full"
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/departments/edit/${id}`)}
          className="bg-blue-600 rounded-xl px-8 shadow-lg border-none"
        >
          Chỉnh sửa
        </Button>
      </div>

      <Card className="rounded-[40px] border-none shadow-2xl p-8 bg-white/80 backdrop-blur-md">
        <Space direction="vertical" className="w-full text-center" size={0}>
          <div className="w-20 h-20 rounded-[28px] bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <ApartmentOutlined className="text-blue-600 text-4xl" />
          </div>
          <Tag
            color={data.is_active ? "green" : "red"}
            className="rounded-full px-4 mb-2"
          >
            {data.is_active ? "ĐANG HOẠT ĐỘNG" : "TẠM NGỪNG"}
          </Tag>
          <Title
            level={1}
            className="m-0 uppercase font-black italic text-blue-900"
          >
            {data.name}
          </Title>
          <Text type="secondary" className="font-mono text-xs italic">
            Slug: /{data.slug}
          </Text>
        </Space>

        <Divider className="my-8" />

        <div className="space-y-6">
          <div>
            <Text
              strong
              className="text-gray-400 uppercase text-[10px] block mb-2 tracking-widest"
            >
              Mô tả chi tiết
            </Text>
            <Paragraph className="text-lg text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-3xl italic border border-dashed border-gray-200">
              {data.description || "Không có mô tả nào cho phòng ban này."}
            </Paragraph>
          </div>

          <div className="flex justify-between bg-blue-50 p-6 rounded-3xl">
            <Space>
              <CalendarOutlined className="text-blue-600" />
              <Text strong>Ngày tạo hệ thống:</Text>
            </Space>
            <Text className="font-bold">
              {new Date(data.created_at).toLocaleDateString("vi-VN")}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

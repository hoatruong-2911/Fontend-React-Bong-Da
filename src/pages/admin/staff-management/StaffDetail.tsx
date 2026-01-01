import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Avatar,
  Typography,
  Spin,
  Space,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BankOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import staffService, { Staff } from "@/services/admin/staffService";

const { Title, Text } = Typography;
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

// Helper định dạng tiền tệ chuyên nghiệp
const formatMoney = (amount: number | string | undefined): string => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return (value || 0).toLocaleString("vi-VN", { minimumFractionDigits: 2 });
};

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async (): Promise<void> => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await staffService.getStaffById(id);
        setData(res.data);
      } catch (error: unknown) {
        message.error("Lỗi: Không tìm thấy hồ sơ nhân viên này!");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a4d3a]">
        <Spin size="large" tip="Đang tải hồ sơ nhân sự..." />
      </div>
    );

  if (!data)
    return (
      <div className="p-20 text-center text-white">Dữ liệu không tồn tại</div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#1a4d3a] min-h-screen animate-in fade-in duration-700">
      {/* Nút quay lại & Header */}
      <div className="flex justify-between items-center mb-8">
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="hover:scale-110 transition-transform shadow-md border-none flex items-center justify-center"
            shape="circle"
          />
          <div className="flex items-center gap-2">
            <Text className="text-[20px] italic font-black text-gray-900 uppercase">
              CHI TIẾT NHÂN SỰ
            </Text>
            <Text className="text-[20px] text-gray-400 font-light uppercase">
              / {data.name}
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="large"
          className="rounded-xl h-10 bg-blue-600 font-bold shadow-lg flex items-center border-none px-6 uppercase text-[12px]"
          onClick={() => navigate(`/admin/staff/edit/${data.id}`)}
        >
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <Row gutter={[32, 32]}>
        {/* Cột trái: Profile Card */}
        <Col xs={24} lg={8}>
          <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden p-6 h-full flex flex-col gap-6">
            <div className="bg-gradient-to-b from-[#3b66f1] to-[#2c4cc0] rounded-[15px] p-10 text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-2 right-2 p-2 opacity-20">
                <RocketOutlined style={{ fontSize: "60px", color: "#fff" }} />
              </div>
              <Avatar
                size={160}
                src={data.avatar ? `${STORAGE_URL}${data.avatar}` : undefined}
                icon={<UserOutlined />}
                className="border-4 border-white/30 shadow-2xl bg-white/10 backdrop-blur-md mb-8"
              />
              <Title
                level={2}
                className="text-white! m-0 uppercase font-black italic tracking-tighter leading-none mb-6"
              >
                {data.name}
              </Title>
              <Tag
                color="#10b981"
                className="border-none rounded-full px-6 font-black italic text-[10px] py-1"
              >
                {data.status === "active"
                  ? "ĐANG HOẠT ĐỘNG"
                  : data.status?.toUpperCase()}
              </Tag>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-5 rounded-[20px] bg-[#f0f5ff]">
                <div className="p-3 bg-[#3b66f1] rounded-[12px] text-white flex items-center justify-center shadow-lg">
                  <MailOutlined />
                </div>
                <div className="flex flex-col">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">
                    Email công việc
                  </Text>
                  <Text strong className="text-[#3b66f1] text-[13px]">
                    {data.email}
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-5 rounded-[20px] bg-[#f2faf5]">
                <div className="p-3 bg-[#10b981] rounded-[12px] text-white flex items-center justify-center shadow-lg">
                  <PhoneOutlined />
                </div>
                <div className="flex flex-col">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">
                    Số điện thoại
                  </Text>
                  <Text strong className="text-[#10b981] text-[13px]">
                    {data.phone}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Cột phải: Detailed Info */}
        <Col xs={24} lg={16} className="flex flex-col gap-6">
          {/* Card 1: Công việc */}
          <Card className="rounded-[20px] border-none shadow-xl p-2 h-fit">
            <Divider orientation="left" className="m-0! border-gray-100">
              <Space>
                <BankOutlined className="text-blue-600" />{" "}
                <span className="font-black italic text-blue-900 uppercase text-[15px]">
                  Tổ chức & Vị trí
                </span>
              </Space>
            </Divider>
            <Descriptions column={{ xs: 1, sm: 2 }} className="mt-6 ml-6">
              <Descriptions.Item
                label={
                  <Text strong className="text-[11px] text-gray-400 uppercase">
                    Phòng ban
                  </Text>
                }
              >
                <Tag
                  color="blue"
                  className="rounded-full font-bold border-none px-4 bg-[#e6f4ff] text-[#0958d9]"
                >
                  {data.department?.name || "Chưa rõ"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text strong className="text-[11px] text-gray-400 uppercase">
                    Chức vụ
                  </Text>
                }
              >
                <Text strong className="text-gray-700 italic">
                  {data.position}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text strong className="text-[11px] text-gray-400 uppercase">
                    Ngày gia nhập
                  </Text>
                }
              >
                <Space>
                  <CalendarOutlined className="text-gray-400" />{" "}
                  <Text strong>{data.join_date}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text strong className="text-[11px] text-gray-400 uppercase">
                    Ca làm việc
                  </Text>
                }
              >
                <Space>
                  <ClockCircleOutlined className="text-gray-400" />{" "}
                  <Text strong className="uppercase text-[13px]">
                    {data.shift || "CA HÀNH CHÍNH"}
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Card 2: Tài chính */}
          <Card className="rounded-[20px] border-none shadow-xl p-2 h-fit">
            <Divider orientation="left" className="m-0! border-gray-100">
              <Space>
                <DollarOutlined className="text-[#d46b08]" />{" "}
                <span className="font-black italic text-[#d46b08] uppercase text-[15px]">
                  Chế độ đãi ngộ
                </span>
              </Space>
            </Divider>
            <Row gutter={24} className="mt-4 p-4">
              <Col span={12}>
                <div className="p-6 rounded-[20px] bg-white border border-gray-50 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                  <Text strong className="text-[10px] text-gray-400 uppercase">
                    Lương cơ bản
                  </Text>
                  <Title
                    level={3}
                    className="m-0! text-gray-800 font-black italic tracking-tight"
                  >
                    {formatMoney(data.salary)}
                  </Title>
                  <div className="absolute right-4 bottom-4 opacity-10">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center text-[20px] font-bold text-blue-500">
                      $
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="p-6 rounded-[20px] bg-white border border-gray-50 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                  <Text strong className="text-[10px] text-gray-400 uppercase">
                    Thưởng chuyên cần/KPI
                  </Text>
                  <Title
                    level={3}
                    className="m-0! text-gray-800 font-black italic tracking-tight"
                  >
                    {formatMoney(data.bonus)}
                  </Title>
                  <TrophyOutlined className="absolute right-4 bottom-4 text-[40px] text-orange-200 opacity-30" />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Footer card */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] rounded-[20px] p-8 text-white shadow-2xl relative overflow-hidden mt-auto">
            <div className="relative z-10">
              <Text className="text-white text-[15px] font-black italic uppercase block mb-1">
                CAM KẾT NHÂN SỰ
              </Text>
              <Text className="text-blue-100 text-[12px]">
                Hồ sơ đã được xác thực bởi bộ phận quản trị hệ thống.
              </Text>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <UserOutlined style={{ fontSize: "120px" }} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Row,
  Col,
  Divider,
  Card,
  message,
  Spin,
  Typography,
  Image,
  Rate,
  Empty,
  Space as AntdSpace,
} from "antd";
import {
  EnvironmentOutlined,
  StarFilled,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import customerFieldService, {
  Field,
} from "../../services/customer/fieldService";

const { Title, Text } = Typography;

const initialField: Field = {
  id: 0,
  name: "",
  size: 0,
  location: "",
  price: 0,
  type: "",
  rating: 0,
  reviews_count: 0,
  available: false,
  is_vip: false,
  surface: "",
  description: "",
  image: "",
  features: [],
};

const STATIC_FEATURES = [
  "Chiếu sáng LED tiêu chuẩn",
  "Cỏ nhân tạo nhập khẩu",
  "Hệ thống thoát nước hiện đại",
  "Khu vực thay đồ VIP",
];

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fieldId = id ? parseInt(id, 10) : null;

  const [field, setField] = useState<Field>(initialField);
  const [relatedFields, setRelatedFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!fieldId) return;

    const fetchFullData = async () => {
      try {
        setLoading(true);
        // 1. Lấy chi tiết sân
        const response = await customerFieldService.getField(fieldId);
        const data = response.data.data || response.data;
        setField(data);

        // 2. Lấy sân bóng liên quan (cùng kích thước size)
        const allRes = await customerFieldService.getFields();
        const allFields: Field[] = allRes.data.data || allRes.data;
        const related = allFields
          .filter((f) => f.size === data.size && f.id !== data.id)
          .slice(0, 4);
        setRelatedFields(related);
      } catch (error) {
        message.error("Không thể tải thông tin sân bóng cực phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fieldId]);

  const handleBook = () => {
    navigate(`/booking?fieldId=${field.id}`);
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Spin size="large" />
        <Text className="mt-4 font-black italic uppercase text-emerald-500 tracking-widest animate-pulse">
          Đang chuẩn bị sân đấu rực rỡ...
        </Text>
      </div>
    );

  if (!field || field.id === 0) return null;

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 animate-in fade-in duration-700">
      {/* Header Điều hướng */}
      <div className="bg-gradient-to-r from-white via-[#f0f9f6] to-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/fields")}
            className="rounded-2xl font-bold border-none bg-white shadow-lg hover:shadow-emerald-100 hover:text-emerald-600 px-6 h-12 flex items-center transition-all"
          >
            Quay lại danh sách sân
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <Row gutter={[64, 64]}>
          {/* CỘT ẢNH SÂN BÓNG */}
          <Col xs={24} md={11}>
            <div className="sticky top-10 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-[50px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-0 shadow-2xl rounded-[48px] overflow-hidden p-8 bg-white">
                <div className="aspect-video flex items-center justify-center bg-gradient-to-b from-[#fafcfb] to-white rounded-[36px] overflow-hidden">
                  <Image
                    src={field.image || `/field-images/${field.size}.jpg`}
                    alt={field.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center font-black italic uppercase text-lg">
                          <ThunderboltOutlined className="text-3xl mb-2" /> Soi
                          chi tiết mặt sân
                        </div>
                      ),
                    }}
                  />
                </div>
              </Card>
            </div>
          </Col>

          {/* CỘT THÔNG TIN SÂN BÓNG */}
          <Col xs={24} md={13}>
            <div className="space-y-8">
              <AntdSpace size="middle">
                <Tag className="rounded-xl px-5 py-1 font-black uppercase italic border-none shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white m-0">
                  Sân {field.size} người
                </Tag>
                {field.is_vip && (
                  <Tag className="rounded-xl px-5 py-1 font-black uppercase italic border-none shadow-md bg-gradient-to-r from-gold-500 to-yellow-500 bg-yellow-500 text-white m-0">
                    <CrownOutlined /> VIP FIELD
                  </Tag>
                )}
                <Tag className="rounded-xl px-5 py-1 font-black uppercase italic border-none shadow-md bg-gradient-to-r from-orange-500 to-red-500 bg-orange-500 text-white m-0">
                  <FireOutlined /> HOT AREA
                </Tag>
              </AntdSpace>

              <div>
                <Title
                  level={1}
                  className="!text-6xl !font-black !text-slate-900 !uppercase !italic !tracking-tighter !leading-[1.1] !mb-4"
                >
                  SÂN {field.name}
                </Title>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-yellow-50 px-4 py-1 rounded-full border border-yellow-100">
                    <Rate
                      disabled
                      defaultValue={field.rating}
                      className="text-yellow-500 text-sm"
                      character={<StarFilled />}
                    />
                    <span className="text-yellow-700 font-black italic ml-2 text-xs">
                      {field.rating.toFixed(1)}
                    </span>
                  </div>
                  <Divider type="vertical" className="h-6 border-gray-200" />
                  <span className="text-gray-400 font-bold italic tracking-wide text-xs">
                    <EnvironmentOutlined className="mr-1" /> {field.location}
                  </span>
                </div>
              </div>

              {/* Box Giá tiền rực rỡ */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[40px] shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-10 text-[120px] text-white font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                  FIELD
                </div>
                <div className="relative z-10">
                  <Text className="text-emerald-100 font-black italic uppercase text-xs tracking-[0.3em] mb-2 block">
                    Giá thuê sân tiêu chuẩn
                  </Text>
                  <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black text-white italic drop-shadow-lg tracking-tighter">
                      {field.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-emerald-200/70 text-2xl font-black italic uppercase">
                      / giờ
                    </span>
                  </div>
                </div>
              </div>

              {/* Mô tả sân bóng */}
              <div className="p-8 bg-white rounded-[32px] shadow-xl shadow-gray-100/50 border border-gray-50 relative">
                <div className="absolute top-0 left-10 transform -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm">
                  <h3 className="font-black uppercase italic text-emerald-600 m-0 text-xs flex items-center gap-2">
                    <ThunderboltOutlined /> Giới thiệu sân đấu
                  </h3>
                </div>
                <p className="text-slate-600 italic leading-relaxed text-xl font-medium">
                  {field.description ||
                    "Trải nghiệm không gian thi đấu đẳng cấp chuyên nghiệp với mặt cỏ FIFA chất lượng cao, hệ thống đèn LED chống lóa rực rỡ nhất khu vực."}
                </p>
              </div>

              {/* Tiện ích sân bóng Grid */}
              <div className="grid grid-cols-2 gap-4">
                {STATIC_FEATURES.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100"
                  >
                    <CheckCircleOutlined className="text-emerald-500 text-lg" />
                    <span className="font-bold italic uppercase text-slate-700 text-xs tracking-wider">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              {/* Nút Đặt sân */}
              <div className="flex gap-6 pt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<TrophyOutlined style={{ fontSize: "24px" }} />}
                  onClick={handleBook}
                  disabled={!field.available}
                  className="flex-1 h-24 rounded-[30px] bg-gradient-to-r from-emerald-500 to-teal-600 border-none font-black italic uppercase shadow-2xl shadow-emerald-200 text-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                >
                  {field.available ? "Đặt sân ngay" : "Sân đã kín lịch"}
                </Button>
              </div>

              {/* Cam kết tin tưởng */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-[28px] bg-white border border-emerald-50 shadow-lg shadow-gray-100/50 flex items-center gap-4 group hover:bg-emerald-50 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                    <SafetyCertificateOutlined className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-xs text-slate-800">
                      Cọc 30% giữ sân
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      An toàn & Minh bạch
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-[28px] bg-white border border-blue-50 shadow-lg shadow-gray-100/50 flex items-center gap-4 group hover:bg-blue-50 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                    <ClockCircleOutlined className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-black italic uppercase text-xs text-slate-800">
                      Hỗ trợ đổi lịch
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      Trước 4h thi đấu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* PHẦN SÂN BÓNG LIÊN QUAN - ĐÚNG CHẤT SẢN PHẨM */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-5xl font-black italic uppercase text-slate-900 m-0 tracking-tighter">
                Sân bóng cùng quy mô
              </h2>
              <div className="h-2 w-48 bg-emerald-500 mt-4 rounded-full shadow-lg shadow-emerald-100"></div>
            </div>
            <Button
              type="link"
              onClick={() => navigate("/fields")}
              className="font-black italic uppercase text-emerald-600 text-lg hover:text-emerald-700"
            >
              Xem tất cả <ArrowLeftOutlined className="rotate-180 ml-2" />
            </Button>
          </div>

          {relatedFields.length > 0 || relatedFields.length > 0 ? (
            <Row gutter={[32, 32]}>
              {relatedFields.map((f) => (
                <Col key={f.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    className="border-0 shadow-xl rounded-[32px] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white"
                    onClick={() => navigate(`/fields/${f.id}`)}
                    cover={
                      <div className="h-48 overflow-hidden relative">
                        <img
                          alt={f.name}
                          src={f.image || `/field-images/${f.size}.jpg`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black italic uppercase text-emerald-600">
                          Sân {f.size} người
                        </div>
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      <Title
                        level={4}
                        className="!m-0 !font-black !uppercase !italic !text-slate-800 !text-base group-hover:text-emerald-600 transition-colors"
                      >
                        Sân {f.name}
                      </Title>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-yellow-500 font-black italic text-xs">
                          <StarFilled /> {f.rating.toFixed(1)}
                        </div>
                        <Text className="font-black italic text-emerald-600 text-sm">
                          {f.price.toLocaleString("vi-VN")}đ
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="bg-white rounded-[40px] py-24 text-center border border-gray-100 shadow-xl">
              <Empty
                image={
                  <TrophyOutlined className="text-7xl text-slate-200 mb-4" />
                }
                description={
                  <span className="font-black italic uppercase text-slate-300 text-2xl tracking-[0.1em] block mt-4">
                    Hiện chưa có sân liên quan nào rực rỡ hơn!
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .group:hover .group-hover\\:animate-shine { animation: shine 0.8s ease-in-out; }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.4); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
}

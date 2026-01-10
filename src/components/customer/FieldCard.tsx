import React from "react";
import { Card, Button, Tag, Rate, Typography, Space } from "antd";
import {
  EnvironmentOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Field } from "@/services/customer/fieldService";

const { Text } = Typography;

interface FieldCardProps {
  field: Field;
}

const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
  const navigate = useNavigate();
  const STORAGE_URL = "http://127.0.0.1:8000/storage/";

  // Xử lý đường dẫn ảnh rực rỡ
  const fullImageUrl = field.image?.startsWith("http")
    ? field.image
    : `${STORAGE_URL}${field.image?.replace(/^\//, "")}`;

  return (
    <Card
      hoverable
      className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
      style={{ borderRadius: 24 }}
      cover={
        <div
          className="relative h-56 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/fields/${field.id}`)}
        >
          <img
            alt={field.name}
            src={fullImageUrl}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x250?text=Sport+Field";
            }}
          />
          {/* Tag trạng thái rực rỡ */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Tag
              color={field.available ? "green" : "red"}
              className="m-0 border-none font-black italic uppercase rounded-full px-3 py-0.5 shadow-md"
            >
              {field.available ? "Sẵn sàng" : "Hết lịch"}
            </Tag>
            {field.is_vip && (
              <Tag
                color="gold"
                className="m-0 border-none font-black italic uppercase rounded-full px-3 py-0.5 shadow-md"
              >
                VIP
              </Tag>
            )}
          </div>

          <Tag
            color="blue"
            className="absolute bottom-3 left-3 m-0 border-none font-black italic uppercase rounded-lg px-3 py-1 shadow-md bg-blue-600/80 backdrop-blur-sm"
          >
            Sân {field.size} người
          </Tag>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <h3
            className="font-black text-slate-800 text-lg truncate cursor-pointer hover:text-emerald-600 uppercase italic m-0 transition-colors"
            onClick={() => navigate(`/fields/${field.id}`)}
          >
            {field.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold uppercase italic mt-1">
            <EnvironmentOutlined className="text-emerald-500" />
            <span>{field.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1">
            <StarFilled className="text-yellow-400 text-xs" />
            <Text className="font-black text-slate-700 text-xs">
              {field.rating || 5.0}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold">
              ({field.reviews_count || 0})
            </Text>
          </div>
          <Tag
            color="default"
            icon={<TeamOutlined />}
            className="m-0 border-none font-bold text-[10px] uppercase bg-white"
          >
            {field.surface}
          </Tag>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <Text className="text-2xl font-black text-emerald-600 italic leading-none">
              {field.price.toLocaleString("vi-VN")}đ
            </Text>
            <Text className="text-slate-400 text-[10px] font-black italic uppercase ml-1">
              /giờ
            </Text>
          </div>

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            className="rounded-xl font-black italic uppercase h-10 border-none shadow-md shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/booking?fieldId=${field.id}`);
            }}
            disabled={!field.available}
          >
            {field.available ? "Đặt ngay" : "Đã đầy"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FieldCard;

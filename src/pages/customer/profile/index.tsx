import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Tabs, Spin, message, Tag } from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import authService, { User } from "@/services/authService";

// Import các sub-components
import PersonalInfo from "./PersonalInfo";
import OrderHistory from "./OrderHistory";
import Security from "./Security";

const { Title, Text } = Typography;

export default function CustomerProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      // getCurrentUser trả về Promise<User> nên không cần ép kiểu data
      const res = await authService.getCurrentUser();
      setUser(res);
    } catch (error) {
      message.error("Không thể tải thông tin hồ sơ rực rỡ");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (fetching)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang tải cực phẩm..." />
      </div>
    );

  const tabItems = [
    {
      key: "info",
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: <PersonalInfo user={user} onRefresh={fetchProfile} />,
    },
    {
      key: "orders",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử đơn hàng
        </span>
      ),
      children: <OrderHistory />,
    },
    {
      key: "security",
      label: (
        <span>
          <SafetyOutlined /> Bảo mật
        </span>
      ),
      children: <Security />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f3] py-10">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* Header Profile - Hiển thị ảnh rực rỡ */}
        <Card className="border-0 shadow-lg" style={{ borderRadius: 24 }}>
          <div className="flex flex-col md:flex-row items-center gap-6 p-2">
            <Avatar
              size={120}
              className="shadow-md border-4 border-emerald-100"
              src={
                user?.profile?.avatar
                  ? `http://127.0.0.1:8000/${user.profile.avatar}`
                  : null
              }
              icon={<UserOutlined />}
            />
            <div className="text-center md:text-left flex-1">
              <Title
                level={2}
                className="!mb-1 !font-black !italic !uppercase tracking-tighter"
              >
                {user?.name}
              </Title>
              {user?.customer_stats?.is_vip ? (
                <Tag color="gold" className="font-bold uppercase italic rounded-full px-3 py-0.5 shadow-sm">
                  🌟 KHÁCH HÀNG VIP
                </Tag>
              ) : (
                <Tag color="blue" className="font-bold uppercase italic rounded-full px-3 py-0.5 shadow-sm">
                  KHÁCH HÀNG THƯỜNG
                </Tag>
              )}

              {user?.customer_stats && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm">
                  <div className="flex justify-between text-xs font-black text-slate-500 uppercase italic mb-1">
                    <span>Tích lũy chi tiêu:</span>
                    <span className="text-emerald-600">
                      {Number(user.customer_stats.total_spent || 0).toLocaleString()}đ / 5.000.000đ
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((Number(user.customer_stats.total_spent || 0) / 5000000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic mt-1.5 mb-0">
                    {user.customer_stats.is_vip 
                      ? "🎉 Chúc mừng! Bạn đã đạt danh hiệu Khách hàng VIP rực rỡ!" 
                      : `💡 Bạn cần tích lũy thêm ${Math.max(5000000 - Number(user.customer_stats.total_spent || 0), 0).toLocaleString()}đ chi tiêu để thăng hạng VIP.`}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 text-sm text-slate-500">
                <div>
                  Email:{" "}
                  <Text strong className="text-emerald-600">
                    {user?.email}
                  </Text>
                </div>
                <div>
                  Gia nhập:{" "}
                  <Text strong>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs
          items={tabItems}
          size="large"
          type="card"
          className="bg-white p-6 rounded-[24px] shadow-md custom-profile-tabs"
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Tabs, Spin, message, Tag } from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  SafetyOutlined,
  BellOutlined,
} from "@ant-design/icons";
import authService, { User } from "@/services/authService";

// Import các sub-components
import PersonalInfo from "./PersonalInfo";
import OrderHistory from "./OrderHistory";
import Security from "./Security";
import Notifications from "./Notifications";

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
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined /> Thông báo
        </span>
      ),
      children: <Notifications />,
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
              <Tag color="emerald" className="font-bold uppercase italic">
                KHÁCH HÀNG VIP
              </Tag>
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

import { useState, useEffect } from "react";
import { Card, Avatar, Typography, Tabs, Spin, message, Tag } from "antd";
import {
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import adminUserService from "@/services/admin/userService";

import PersonalInfo from "./PersonalInfo";
import Security from "./Security";
import Notifications from "./Notifications";
import SystemSettings from "./SystemSettings";

const { Title, Text } = Typography;

export default function AdminProfile() {
  const [user, setUser] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await adminUserService.getMe();
      setUser(res.data);
    } catch (error) {
      message.error("Không thể tải thông tin hồ sơ");
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
        <Spin size="large" />
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
    {
      key: "settings",
      label: (
        <span>
          <SettingOutlined /> Hệ thống
        </span>
      ),
      children: <SystemSettings />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md" style={{ borderRadius: 16 }}>
        <div className="flex flex-col md:flex-row items-center gap-6 p-2">
          <Avatar
            size={100}
            // Nối URL Backend (ví dụ http://127.0.0.1:8000/) với đường dẫn trong DB
            src={
              user?.profile?.avatar
                ? `http://127.0.0.1:8000/${user.profile.avatar}`
                : null
            }
            icon={<UserOutlined />}
          />
          <div className="text-center md:text-left flex-1">
            <Title level={2} className="!mb-1">
              {user?.name}
            </Title>
            <Tag color="volcano" className="font-semibold">
              {user?.role?.toUpperCase()}
            </Tag>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-4 text-sm text-gray-500">
              <div>
                Email: <Text strong>{user?.email}</Text>
              </div>
              <div>
                ID: <Text strong>#{user?.id}</Text>
              </div>
              <div>
                Gia nhập:{" "}
                <Text strong>
                  {new Date(user?.created_at).toLocaleDateString("vi-VN")}
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
        className="bg-white p-4 rounded-xl shadow-sm"
      />
    </div>
  );
}

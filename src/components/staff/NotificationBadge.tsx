import React, { useState, useEffect, useRef } from "react";
import { Badge, Button, Dropdown, List, Typography, Space, Empty } from "antd";
import {
  BellOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "@/services/api";

dayjs.extend(relativeTime);

const { Text } = Typography;

// ✅ ĐỊNH NGHĨA INTERFACE SẠCH BÓNG ANY
interface NotificationItem {
  id: number;
  type: "booking_new" | "order_new" | "time_out";
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export default function NotificationBadge() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotifIdRef = useRef<number>(0);

  useEffect(() => {
    audioRef.current = new Audio("/assets/sounds/notification.mp3");
    fetchNotifications(true);
  }, []);

  const fetchNotifications = async (isFirstLoad = false) => {
    try {
      const res = await api.get<{ success: boolean; data: NotificationItem[] }>(
        "/staff/notifications",
      );
      if (res.data.success) {
        const newNotifs = res.data.data;

        if (newNotifs.length > 0) {
          const latestId = newNotifs[0].id;

          if (!isFirstLoad && latestId > lastNotifIdRef.current) {
            const hasNewUnread = newNotifs.some(
              (n) => n.id > lastNotifIdRef.current && !n.is_read,
            );

            if (hasNewUnread) {
              audioRef.current
                ?.play()
                .catch(() =>
                  console.log(
                    "Browser chặn tự động phát. Hãy tương tác trước!",
                  ),
                );
            }
          }
          lastNotifIdRef.current = latestId;
        }

        setNotifications(newNotifs);
        setUnreadCount(newNotifs.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Lỗi nạp thông báo:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => fetchNotifications(false), 3000);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.patch(`/staff/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc");
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "booking_new":
        return <CalendarOutlined className="text-emerald-500 text-lg" />;
      case "order_new":
        return <CoffeeOutlined className="text-blue-500 text-lg" />;
      case "time_out":
        return <ClockCircleOutlined className="text-red-500 text-lg" />;
      default:
        return <BellOutlined />;
    }
  };

  const renderMenu = () => (
    <div className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-3xl w-85 overflow-hidden border border-slate-100 mt-3">
      <div className="p-5 bg-gradient-to-r from-emerald-600 to-green-500 text-white flex justify-between items-center shadow-md">
        <Space>
          <BellOutlined className="text-yellow-300 animate-bounce" />
          <Text className="text-white font-black italic uppercase tracking-wider">
            Thông báo mới
          </Text>
        </Space>
        <Badge count={unreadCount} color="#ff4d4f" className="font-bold" />
      </div>
      <div className="max-h-[450px] overflow-auto bg-white p-2">
        <List
          dataSource={notifications}
          locale={{
            emptyText: <Empty description="Trống trơn ní ơi!" />,
          }}
          renderItem={(item) => (
            <div
              className={`m-1 p-4 cursor-pointer hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-none ${
                !item.is_read
                  ? "bg-emerald-50/50 shadow-sm border-l-4 border-l-emerald-500"
                  : "opacity-70"
              }`}
              onClick={() => markRead(item.id)}
            >
              <Space align="start" size="middle">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div
                    className={`text-[13px] leading-tight ${!item.is_read ? "font-black text-slate-800" : "font-bold text-slate-500"}`}
                  >
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-600 my-1 font-medium">
                    {item.message}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold italic">
                    {dayjs(item.created_at).fromNow()}
                  </div>
                </div>
              </Space>
            </div>
          )}
        />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes ring-alarm {
          0% { transform: rotate(0); }
          10% { transform: rotate(20deg); }
          20% { transform: rotate(-20deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          100% { transform: rotate(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(250, 204, 21, 0); }
          100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
        }
        .animate-ring {
          animation: ring-alarm 0.6s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .notif-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      <Dropdown
        dropdownRender={renderMenu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <div className="flex items-center cursor-pointer px-4">
          <Badge
            count={unreadCount}
            offset={[-5, 8]}
            size="default"
            style={{
              backgroundColor: "#ff4d4f",
              boxShadow: "0 0 10px rgba(255, 77, 79, 0.5)",
              fontWeight: 900,
              fontSize: "11px",
            }}
          >
            <Button
              type="text"
              icon={
                <BellOutlined
                  className={`text-3xl transition-colors duration-300 ${
                    unreadCount > 0
                      ? "text-yellow-400 animate-ring"
                      : "text-white"
                  }`}
                  style={{
                    filter:
                      unreadCount > 0
                        ? "drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))"
                        : "none",
                  }}
                />
              }
              className={`flex items-center justify-center h-14 w-14 rounded-full transition-all duration-500 ${
                unreadCount > 0
                  ? "bg-white/20 notif-glow border-2 border-yellow-400"
                  : "hover:bg-white/10 border border-white/20"
              }`}
            />
          </Badge>
        </div>
      </Dropdown>
    </>
  );
}

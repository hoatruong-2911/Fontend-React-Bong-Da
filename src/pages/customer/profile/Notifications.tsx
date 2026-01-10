import React from "react";
import { List, Switch, Typography } from "antd";
import { BellOutlined, MailOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Notifications: React.FC = () => {
  const settings = [
    {
      title: "Thông báo đặt sân",
      desc: "Nhận tin nhắn khi đặt sân thành công",
      icon: <BellOutlined />,
    },
    {
      title: "Khuyến mãi",
      desc: "Nhận thông tin ưu đãi rực rỡ qua Email",
      icon: <MailOutlined />,
    },
  ];

  return (
    <div className="p-4">
      <List
        dataSource={settings}
        renderItem={(item) => (
          <List.Item
            actions={[<Switch defaultChecked className="bg-emerald-500" />]}
          >
            <List.Item.Meta
              avatar={
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">
                  {item.icon}
                </div>
              }
              title={
                <Text className="font-bold italic uppercase text-slate-800">
                  {item.title}
                </Text>
              }
              description={
                <Text className="text-slate-400 italic text-xs">
                  {item.desc}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Notifications;

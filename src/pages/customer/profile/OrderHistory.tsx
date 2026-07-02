import React, { useState, useEffect } from "react";
import { Table, Tag, Typography, Spin, message, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import orderService, { OrderRecord } from "@/services/customer/orderService";

const { Text } = Typography;

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        let ordersList: OrderRecord[] = [];
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            ordersList = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            ordersList = res.data.data;
          }
        }
        setOrders(ordersList);
      } catch (error) {
        message.error("Lỗi khi tải lịch sử đơn hàng!");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return { color: "green", text: "Hoàn thành" };
      case "cancelled":
        return { color: "red", text: "Đã hủy" };
      case "preparing":
        return { color: "blue", text: "Đang chuẩn bị" };
      case "pending":
      default:
        return { color: "gold", text: "Chờ xử lý" };
    }
  };

  const columns: ColumnsType<OrderRecord> = [
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">Mã đơn</Text>
      ),
      dataIndex: "order_code",
      key: "order_code",
      render: (code) => <Text className="font-bold text-emerald-600">#{code}</Text>,
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">Ngày đặt</Text>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (dateStr: string) => (
        <Text className="text-slate-600">
          {new Date(dateStr).toLocaleString("vi-VN")}
        </Text>
      ),
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">
          Tổng tiền
        </Text>
      ),
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total: any) => (
        <Text className="font-black text-slate-800">
          {Number(total).toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">
          Phương thức
        </Text>
      ),
      dataIndex: "payment_method",
      key: "payment_method",
      render: (method: string) => (
        <Tag className="font-bold border-none rounded-full px-2 text-[10px]">
          {method === "qr" ? "VietQR" : "Tiền mặt"}
        </Tag>
      ),
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">
          Trạng thái
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const { color, text } = getStatusTag(status);
        return (
          <Tag
            color={color}
            className="font-bold uppercase italic border-none rounded-full px-3"
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">Chi tiết</Text>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/orders/${record.order_code}`)}
          className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg flex items-center justify-center mx-auto"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Spin tip="Đang tải lịch sử đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="custom-table"
      />
    </div>
  );
};

export default OrderHistory;

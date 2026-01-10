import React from "react";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface OrderRecord {
  id: string;
  date: string;
  total: number;
  status: "completed" | "cancelled" | "pending";
  items: number;
}

const mockOrders: OrderRecord[] = [
  {
    id: "ORD001",
    date: "08/01/2026",
    total: 350000,
    status: "completed",
    items: 3,
  },
  {
    id: "ORD002",
    date: "05/01/2026",
    total: 520000,
    status: "completed",
    items: 5,
  },
  {
    id: "ORD003",
    date: "01/01/2026",
    total: 180000,
    status: "cancelled",
    items: 2,
  },
];

const OrderHistory: React.FC = () => {
  const columns: ColumnsType<OrderRecord> = [
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">Mã đơn</Text>
      ),
      dataIndex: "id",
      key: "id",
      render: (id) => <Text className="font-bold text-emerald-600">#{id}</Text>,
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">Ngày đặt</Text>
      ),
      dataIndex: "date",
      key: "date",
    },
    {
      title: (
        <Text className="font-bold italic uppercase text-[10px]">
          Tổng tiền
        </Text>
      ),
      dataIndex: "total",
      key: "total",
      render: (total: number) => (
        <Text className="font-black text-slate-800">
          {total.toLocaleString("vi-VN")}đ
        </Text>
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
      render: (status: string) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "cancelled"
              ? "red"
              : "gold"
          }
          className="font-bold uppercase italic border-none rounded-full px-3"
        >
          {status === "completed"
            ? "Hoàn thành"
            : status === "cancelled"
            ? "Đã hủy"
            : "Chờ xử lý"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Table
        columns={columns}
        dataSource={mockOrders}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="custom-table"
      />
    </div>
  );
};

export default OrderHistory;

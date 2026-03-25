import React from "react";
import { Space, Button, Tooltip, Popconfirm } from "antd";
import {
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  CoffeeOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Order } from "@/services/staff/orderService";

interface OrderActionsProps {
  record: Order;
  onView: (order: Order) => void;
  onPrint: (order: Order) => void;
  onUpdateStatus: (id: number, status: Order["status"]) => Promise<void>;
}

export default function OrderActions({
  record,
  onView,
  onPrint,
  onUpdateStatus,
}: OrderActionsProps) {
  return (
    <Space size="small">
      <Tooltip title="Xem chi tiết">
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onView(record)}
        />
      </Tooltip>

      <Tooltip title="In hóa đơn">
        <Button
          icon={<PrinterOutlined />}
          size="small"
          onClick={() => onPrint(record)}
        />
      </Tooltip>

      {/* Luồng trạng thái: Staff toàn quyền điều phối */}
      {record.status === "pending" && (
        <Button
          size="small"
          type="primary"
          className="bg-emerald-600 text-[10px] uppercase font-bold"
          onClick={() => onUpdateStatus(record.id, "confirmed")}
        >
          Xác nhận
        </Button>
      )}

      {record.status === "confirmed" && (
        <Button
          size="small"
          type="primary"
          className="bg-blue-500 text-[10px] uppercase font-bold"
          onClick={() => onUpdateStatus(record.id, "paid")}
        >
          Thu tiền
        </Button>
      )}

      {record.status === "paid" && (
        <Button
          size="small"
          type="primary"
          className="bg-orange-500 text-[10px] uppercase font-bold"
          onClick={() => onUpdateStatus(record.id, "preparing")}
        >
          Chuẩn bị
        </Button>
      )}

      {record.status === "preparing" && (
        <Button
          size="small"
          type="primary"
          className="bg-green-600 text-[10px] uppercase font-bold"
          onClick={() => onUpdateStatus(record.id, "completed")}
        >
          Xong
        </Button>
      )}

      {/* Nút hủy dành cho Staff nếu khách đổi ý đột xuất */}
      {!["completed", "cancelled"].includes(record.status) && (
        <Popconfirm
          title="Xác nhận hủy đơn hàng này?"
          onConfirm={() => onUpdateStatus(record.id, "cancelled")}
          okText="Hủy đơn"
          cancelText="Quay lại"
        >
          <Button size="small" danger ghost icon={<CloseCircleOutlined />} />
        </Popconfirm>
      )}
    </Space>
  );
}

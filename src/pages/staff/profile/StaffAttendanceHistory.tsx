import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, message, Spin, Card } from "antd";
import dayjs from "dayjs";
import attendanceService from "@/services/admin/attendanceService";

const { Text } = Typography;

export default function StaffAttendanceHistory() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyAttendance();
      if (res.success) setRecords(res.data);
    } catch (e) {
      message.error("Lỗi tải lịch sử chấm công");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const columns = [
    {
      title: "NGÀY",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Text strong className="italic text-slate-600">
          {dayjs(date).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "GIỜ VÀO",
      dataIndex: "check_in",
      key: "check_in",
      render: (t: string) =>
        t ? <Text className="font-bold">{t.substring(0, 5)}</Text> : "--:--",
    },
    {
      title: "GIỜ RA",
      dataIndex: "check_out",
      key: "check_out",
      render: (t: string) =>
        t ? <Text className="font-bold">{t.substring(0, 5)}</Text> : "--:--",
    },
    {
      title: "GIỜ LÀM",
      dataIndex: "work_hours",
      key: "work_hours",
      render: (h: number) => (
        <Text strong className="text-emerald-600">
          {h}H
        </Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config: any = {
          present: { color: "green", text: "ĐÚNG GIỜ" },
          late: { color: "orange", text: "ĐI MUỘN" },
          leave: { color: "blue", text: "NGHỈ PHÉP" },
          absent: { color: "red", text: "VẮNG MẶT" },
        };
        const res = config[status] || { color: "default", text: status };
        return (
          <Tag
            color={res.color}
            className="font-black italic border-none px-3 rounded-full text-[10px]"
          >
            {res.text.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={records}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      className="custom-staff-table"
      locale={{ emptyText: "Chưa có lịch sử làm việc" }}
    />
  );
}

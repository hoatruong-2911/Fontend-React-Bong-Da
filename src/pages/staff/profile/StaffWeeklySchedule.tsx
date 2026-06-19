import React, { useEffect, useState } from "react";
import {
  Card,
  Calendar,
  Badge,
  Typography,
  Spin,
  message,
  Tag,
  Space,
  Button,
} from "antd";
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import shiftService from "@/services/admin/shiftService";

const { Text } = Typography;

export default function StaffWeeklySchedule() {
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [data, setData] = useState<any>(null);

  const fetchSchedule = async (date: Dayjs) => {
    try {
      setLoading(true);
      const res = await shiftService.getMySchedule(date.format("YYYY-MM-DD"));
      if (res.success) setData(res.data);
    } catch (e) {
      message.error("Lỗi tải lịch trực");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(currentDate);
  }, [currentDate]);

  const getShiftColor = (name: string) => {
    if (name.includes("sáng")) return "green";
    if (name.includes("chiều")) return "blue";
    if (name.includes("tối")) return "purple";
    return "orange";
  };

  if (loading && !data) return <Spin className="p-10 w-full" />;

  return (
    <div className="space-y-4">
      <Card
        title={
          <Space>
            <CalendarOutlined className="text-emerald-500" />
            <span className="font-black uppercase italic text-[13px]">
              Lịch trực tuần này ({data?.week_range.start} -{" "}
              {data?.week_range.end})
            </span>
          </Space>
        }
        extra={
          <Button.Group size="small">
            <Button
              icon={<LeftOutlined />}
              onClick={() => setCurrentDate(currentDate.subtract(1, "week"))}
            />
            <Button
              onClick={() => setCurrentDate(dayjs())}
              className="font-bold"
            >
              HÔM NAY
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={() => setCurrentDate(currentDate.add(1, "week"))}
            />
          </Button.Group>
        }
        className="rounded-2xl border-none shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = currentDate.locale("vi").startOf("week").add(i, "day");
            const dayStr = day.format("YYYY-MM-DD");
            // Lọc các ca trong ngày này
            const dayAssignments =
              data?.assignments.filter((a: any) => a.work_date === dayStr) ||
              [];

            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border ${day.isSame(dayjs(), "day") ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}
              >
                <div className="text-center mb-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase">
                    {day.format("dddd")}
                  </div>
                  <div className="text-lg font-black italic">
                    {day.format("DD/MM")}
                  </div>
                </div>
                <div className="space-y-2">
                  {dayAssignments.length > 0 ? (
                    dayAssignments.map((a: any) => (
                      <Tag
                        key={a.id}
                        color={getShiftColor(a.shift.name.toLowerCase())}
                        className="w-full m-0 text-center rounded-lg border-none font-bold text-[10px] py-1 shadow-sm"
                      >
                        {a.shift.name.toUpperCase()}
                        <div className="text-[8px] opacity-70">
                          {a.shift.start_time.substring(0, 5)} -{" "}
                          {a.shift.end_time.substring(0, 5)}
                        </div>
                      </Tag>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-300 font-black italic text-[9px]">
                      NGHỈ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

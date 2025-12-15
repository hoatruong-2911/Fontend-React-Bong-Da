import { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space,
  Input,
  Select,
  Avatar,
  Badge,
  DatePicker,
  Modal,
  message,
  Statistic,
  Row,
  Col,
  TimePicker
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Mock attendance data
const mockAttendance = [
  { 
    id: '1', 
    staffId: '1',
    staffName: 'Nguyễn Văn Nam', 
    position: 'Quản lý sân',
    department: 'Vận hành',
    date: '2024-01-15',
    checkIn: '07:55',
    checkOut: '16:05',
    status: 'present',
    workHours: 8.17,
    overtime: 0,
    note: ''
  },
  { 
    id: '2', 
    staffId: '2',
    staffName: 'Trần Thị Hoa', 
    position: 'Thu ngân',
    department: 'Bán hàng',
    date: '2024-01-15',
    checkIn: '08:10',
    checkOut: '16:00',
    status: 'late',
    workHours: 7.83,
    overtime: 0,
    note: 'Kẹt xe'
  },
  { 
    id: '3', 
    staffId: '3',
    staffName: 'Lê Văn Minh', 
    position: 'Bảo vệ',
    department: 'An ninh',
    date: '2024-01-15',
    checkIn: '07:45',
    checkOut: '18:00',
    status: 'present',
    workHours: 10.25,
    overtime: 2,
    note: ''
  },
  { 
    id: '4', 
    staffId: '4',
    staffName: 'Phạm Thị Lan', 
    position: 'Phục vụ',
    department: 'F&B',
    date: '2024-01-15',
    checkIn: null,
    checkOut: null,
    status: 'absent',
    workHours: 0,
    overtime: 0,
    note: 'Nghỉ phép có đơn'
  },
  { 
    id: '5', 
    staffId: '5',
    staffName: 'Hoàng Văn Đức', 
    position: 'Kỹ thuật',
    department: 'Kỹ thuật',
    date: '2024-01-15',
    checkIn: '08:00',
    checkOut: '17:30',
    status: 'present',
    workHours: 9.5,
    overtime: 1.5,
    note: ''
  },
];

const attendanceStats = {
  totalStaff: 5,
  present: 3,
  late: 1,
  absent: 1,
  totalWorkHours: 35.75,
  totalOvertime: 3.5,
};

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      present: { color: 'success', text: 'Có mặt', icon: <CheckCircleOutlined /> },
      late: { color: 'warning', text: 'Đi muộn', icon: <ClockCircleOutlined /> },
      absent: { color: 'error', text: 'Vắng mặt', icon: <CloseCircleOutlined /> },
      leave: { color: 'default', text: 'Nghỉ phép', icon: <CalendarOutlined /> },
    };
    const { color, text, icon } = statusMap[status] || { color: 'default', text: status, icon: null };
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const columns = [
    { 
      title: 'Nhân viên', 
      key: 'staff',
      fixed: 'left' as const,
      width: 220,
      render: (_: unknown, record: typeof mockAttendance[0]) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-primary" />
          <div>
            <div className="font-medium">{record.staffName}</div>
            <div className="text-sm text-muted-foreground">{record.position}</div>
          </div>
        </div>
      )
    },
    { title: 'Phòng ban', dataIndex: 'department', key: 'department', width: 120 },
    { 
      title: 'Giờ vào', 
      dataIndex: 'checkIn', 
      key: 'checkIn',
      width: 100,
      render: (time: string | null) => time ? (
        <span className="font-medium">{time}</span>
      ) : <span className="text-muted-foreground">--:--</span>
    },
    { 
      title: 'Giờ ra', 
      dataIndex: 'checkOut', 
      key: 'checkOut',
      width: 100,
      render: (time: string | null) => time ? (
        <span className="font-medium">{time}</span>
      ) : <span className="text-muted-foreground">--:--</span>
    },
    { 
      title: 'Giờ làm', 
      dataIndex: 'workHours', 
      key: 'workHours',
      width: 100,
      render: (hours: number) => (
        <span className={hours >= 8 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
          {hours.toFixed(2)}h
        </span>
      )
    },
    { 
      title: 'Tăng ca', 
      dataIndex: 'overtime', 
      key: 'overtime',
      width: 100,
      render: (hours: number) => hours > 0 ? (
        <Tag color="blue">+{hours}h</Tag>
      ) : <span className="text-muted-foreground">-</span>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'note', 
      key: 'note',
      width: 150,
      render: (note: string) => note || <span className="text-muted-foreground">-</span>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: () => (
        <Button size="small" type="link">Chỉnh sửa</Button>
      )
    },
  ];

  const handleExport = () => {
    message.success('Đã xuất báo cáo chấm công!');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng nhân viên"
              value={attendanceStats.totalStaff}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Có mặt"
              value={attendanceStats.present}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center bg-amber-50 dark:bg-amber-900/20">
            <Statistic
              title="Đi muộn"
              value={attendanceStats.late}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center bg-red-50 dark:bg-red-900/20">
            <Statistic
              title="Vắng mặt"
              value={attendanceStats.absent}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng giờ làm"
              value={attendanceStats.totalWorkHours}
              precision={2}
              suffix="h"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20">
            <Statistic
              title="Tổng tăng ca"
              value={attendanceStats.totalOvertime}
              precision={1}
              suffix="h"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <DatePicker 
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
              allowClear={false}
            />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              prefix={<SearchOutlined />}
              className="w-64"
            />
            <Select defaultValue="all" className="w-32">
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="present">Có mặt</Select.Option>
              <Select.Option value="late">Đi muộn</Select.Option>
              <Select.Option value="absent">Vắng mặt</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalOpen(true)}>
              Chấm công thủ công
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất báo cáo
            </Button>
          </Space>
        </div>

        <Table
          dataSource={mockAttendance}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title="Chấm công thủ công"
        open={isModalOpen}
        onOk={() => {
          message.success('Đã thêm chấm công!');
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nhân viên</label>
            <Select placeholder="Chọn nhân viên" className="w-full">
              <Select.Option value="1">Nguyễn Văn Nam</Select.Option>
              <Select.Option value="2">Trần Thị Hoa</Select.Option>
              <Select.Option value="3">Lê Văn Minh</Select.Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày</label>
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Giờ vào</label>
              <TimePicker className="w-full" format="HH:mm" />
            </Col>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Giờ ra</label>
              <TimePicker className="w-full" format="HH:mm" />
            </Col>
          </Row>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <Input.TextArea rows={2} placeholder="Ghi chú (không bắt buộc)" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

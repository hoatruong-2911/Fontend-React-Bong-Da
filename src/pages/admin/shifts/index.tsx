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
  Modal,
  message,
  Statistic,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  ExportOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Mock shift data
const shiftTypes = [
  { id: 'morning', name: 'Ca sáng', time: '06:00 - 14:00', color: '#52c41a' },
  { id: 'afternoon', name: 'Ca chiều', time: '14:00 - 22:00', color: '#1890ff' },
  { id: 'night', name: 'Ca tối', time: '22:00 - 06:00', color: '#722ed1' },
  { id: 'full', name: 'Ca full', time: '08:00 - 17:00', color: '#fa8c16' },
];

const mockShiftSchedule = [
  { 
    id: '1', 
    staffId: '1',
    staffName: 'Nguyễn Văn Nam', 
    position: 'Quản lý sân',
    department: 'Vận hành',
    shifts: {
      '2024-01-15': 'morning',
      '2024-01-16': 'afternoon',
      '2024-01-17': 'morning',
      '2024-01-18': 'full',
      '2024-01-19': 'morning',
    }
  },
  { 
    id: '2', 
    staffId: '2',
    staffName: 'Trần Thị Hoa', 
    position: 'Thu ngân',
    department: 'Bán hàng',
    shifts: {
      '2024-01-15': 'full',
      '2024-01-16': 'full',
      '2024-01-17': null,
      '2024-01-18': 'full',
      '2024-01-19': 'full',
    }
  },
  { 
    id: '3', 
    staffId: '3',
    staffName: 'Lê Văn Minh', 
    position: 'Bảo vệ',
    department: 'An ninh',
    shifts: {
      '2024-01-15': 'night',
      '2024-01-16': 'night',
      '2024-01-17': 'night',
      '2024-01-18': null,
      '2024-01-19': 'night',
    }
  },
  { 
    id: '4', 
    staffId: '4',
    staffName: 'Phạm Thị Lan', 
    position: 'Phục vụ',
    department: 'F&B',
    shifts: {
      '2024-01-15': 'afternoon',
      '2024-01-16': 'afternoon',
      '2024-01-17': 'morning',
      '2024-01-18': 'afternoon',
      '2024-01-19': null,
    }
  },
  { 
    id: '5', 
    staffId: '5',
    staffName: 'Hoàng Văn Đức', 
    position: 'Kỹ thuật',
    department: 'Kỹ thuật',
    shifts: {
      '2024-01-15': 'full',
      '2024-01-16': null,
      '2024-01-17': 'full',
      '2024-01-18': 'full',
      '2024-01-19': 'morning',
    }
  },
];

const scheduleStats = {
  totalShifts: 45,
  morningShifts: 15,
  afternoonShifts: 12,
  nightShifts: 8,
  fullShifts: 10,
  offDays: 5,
};

export default function ShiftsManagement() {
  const [selectedDate, setSelectedDate] = useState(dayjs('2024-01-15'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getShiftTag = (shiftId: string | null) => {
    if (!shiftId) return <Tag>Nghỉ</Tag>;
    const shift = shiftTypes.find(s => s.id === shiftId);
    if (!shift) return null;
    return (
      <Tooltip title={shift.time}>
        <Tag color={shift.color} className="cursor-pointer">{shift.name}</Tag>
      </Tooltip>
    );
  };

  // Generate date columns for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    selectedDate.startOf('week').add(i, 'day')
  );

  const columns = [
    { 
      title: 'Nhân viên', 
      key: 'staff',
      fixed: 'left' as const,
      width: 200,
      render: (_: unknown, record: typeof mockShiftSchedule[0]) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-primary" />
          <div>
            <div className="font-medium">{record.staffName}</div>
            <div className="text-sm text-muted-foreground">{record.position}</div>
          </div>
        </div>
      )
    },
    ...weekDates.map(date => ({
      title: (
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{date.format('ddd')}</div>
          <div className={date.isSame(dayjs(), 'day') ? 'font-bold text-primary' : ''}>
            {date.format('DD/MM')}
          </div>
        </div>
      ),
      key: date.format('YYYY-MM-DD'),
      width: 100,
      render: (_: unknown, record: typeof mockShiftSchedule[0]) => {
        const dateKey = date.format('YYYY-MM-DD');
        const shiftId = record.shifts[dateKey as keyof typeof record.shifts];
        return (
          <div className="text-center">
            {getShiftTag(shiftId as string | null)}
          </div>
        );
      }
    })),
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: () => (
        <Button icon={<EditOutlined />} size="small" type="link">Sửa</Button>
      )
    },
  ];

  const handleAddShift = () => {
    message.success('Đã thêm ca làm việc!');
    setIsModalOpen(false);
  };

  const handleExport = () => {
    message.success('Đã xuất báo cáo lịch ca!');
  };

  return (
    <div className="space-y-6">
      {/* Shift Types Legend */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-medium">Loại ca:</span>
          {shiftTypes.map(shift => (
            <div key={shift.id} className="flex items-center gap-2">
              <Tag color={shift.color}>{shift.name}</Tag>
              <span className="text-sm text-muted-foreground">{shift.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng ca tuần này"
              value={scheduleStats.totalShifts}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic
              title="Ca sáng"
              value={scheduleStats.morningShifts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center" style={{ borderLeft: '3px solid #1890ff' }}>
            <Statistic
              title="Ca chiều"
              value={scheduleStats.afternoonShifts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic
              title="Ca tối"
              value={scheduleStats.nightShifts}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center" style={{ borderLeft: '3px solid #fa8c16' }}>
            <Statistic
              title="Ca full"
              value={scheduleStats.fullShifts}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className="text-center bg-gray-50 dark:bg-gray-800">
            <Statistic
              title="Ngày nghỉ"
              value={scheduleStats.offDays}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <Button.Group>
              <Button onClick={() => setSelectedDate(d => d.subtract(1, 'week'))}>
                ← Tuần trước
              </Button>
              <Button onClick={() => setSelectedDate(dayjs())}>
                Tuần này
              </Button>
              <Button onClick={() => setSelectedDate(d => d.add(1, 'week'))}>
                Tuần sau →
              </Button>
            </Button.Group>
            <Input
              placeholder="Tìm kiếm nhân viên..."
              prefix={<SearchOutlined />}
              className="w-64"
            />
            <Select defaultValue="all" className="w-40">
              <Select.Option value="all">Tất cả phòng ban</Select.Option>
              <Select.Option value="operation">Vận hành</Select.Option>
              <Select.Option value="sales">Bán hàng</Select.Option>
              <Select.Option value="security">An ninh</Select.Option>
              <Select.Option value="fnb">F&B</Select.Option>
              <Select.Option value="tech">Kỹ thuật</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalOpen(true)}>
              Thêm ca làm
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất báo cáo
            </Button>
          </Space>
        </div>

        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">
            Tuần: {weekDates[0].format('DD/MM/YYYY')} - {weekDates[6].format('DD/MM/YYYY')}
          </span>
        </div>

        <Table
          dataSource={mockShiftSchedule}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title="Thêm ca làm việc"
        open={isModalOpen}
        onOk={handleAddShift}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nhân viên</label>
            <Select placeholder="Chọn nhân viên" className="w-full" mode="multiple">
              <Select.Option value="1">Nguyễn Văn Nam</Select.Option>
              <Select.Option value="2">Trần Thị Hoa</Select.Option>
              <Select.Option value="3">Lê Văn Minh</Select.Option>
              <Select.Option value="4">Phạm Thị Lan</Select.Option>
              <Select.Option value="5">Hoàng Văn Đức</Select.Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loại ca</label>
            <Select placeholder="Chọn loại ca" className="w-full">
              {shiftTypes.map(shift => (
                <Select.Option key={shift.id} value={shift.id}>
                  <Tag color={shift.color}>{shift.name}</Tag> {shift.time}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày áp dụng</label>
            <Select placeholder="Chọn ngày" className="w-full" mode="multiple">
              {weekDates.map(date => (
                <Select.Option key={date.format('YYYY-MM-DD')} value={date.format('YYYY-MM-DD')}>
                  {date.format('dddd, DD/MM/YYYY')}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <Input.TextArea rows={2} placeholder="Ghi chú (không bắt buộc)" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

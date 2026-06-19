import React from 'react';
import { Table, Tag, Card } from 'antd';

const ShiftHistory: React.FC = () => {
  const columns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Ca làm', dataIndex: 'shift', key: 'shift' },
    { title: 'Giờ vào', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Giờ ra', dataIndex: 'checkOut', key: 'checkOut' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'} className="rounded-full px-3">
          {status === 'completed' ? 'Đúng giờ' : 'Đi muộn'}
        </Tag>
      )
    },
  ];

  return (
    <Card className="border-0 shadow-sm rounded-2xl">
      <Table 
        dataSource={[]} // Bro sẽ map dữ liệu từ attendances vào đây
        columns={columns} 
        locale={{ emptyText: 'Chưa có lịch sử làm việc' }}
      />
    </Card>
  );
};

export default ShiftHistory;
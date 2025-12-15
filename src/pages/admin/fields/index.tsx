import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space,
  Input,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { mockFields } from '@/data/mockFields';

const dailyStats = {
  totalFields: mockFields.length,
  activeFields: mockFields.filter(f => f.available).length,
  maintenanceFields: mockFields.filter(f => !f.available).length,
  averageRating: (mockFields.reduce((sum, f) => sum + f.rating, 0) / mockFields.length).toFixed(1),
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function FieldsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleDelete = (id: number) => {
    message.success(`Đã xóa sân #${id}`);
  };

  const handleExport = () => {
    message.success('Đã xuất báo cáo sân bóng!');
  };

  const columns = [
    { 
      title: 'Hình ảnh', 
      dataIndex: 'image', 
      key: 'image',
      width: 100,
      render: (image: string) => (
        <img src={image} alt="Field" className="w-16 h-12 object-cover rounded" />
      )
    },
    { title: 'Tên sân', dataIndex: 'name', key: 'name' },
    { title: 'Loại', dataIndex: 'size', key: 'size' },
    { title: 'Mặt sân', dataIndex: 'surface', key: 'surface' },
    { 
      title: 'Giá/giờ', 
      dataIndex: 'price', 
      key: 'price',
      render: (price: number) => formatCurrency(price)
    },
    { 
      title: 'Đánh giá', 
      dataIndex: 'rating', 
      key: 'rating',
      render: (rating: number) => <span className="text-warning">⭐ {rating}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Hoạt động' : 'Bảo trì'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: typeof mockFields[0]) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => navigate(`/admin/fields/${record.id}`)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => navigate(`/admin/fields/${record.id}/edit`)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sân này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  const filteredFields = mockFields.filter(field =>
    field.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng số sân"
              value={dailyStats.totalFields}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Đang hoạt động"
              value={dailyStats.activeFields}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-red-50 dark:bg-red-900/20">
            <Statistic
              title="Đang bảo trì"
              value={dailyStats.maintenanceFields}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-amber-50 dark:bg-amber-900/20">
            <Statistic
              title="Đánh giá TB"
              value={dailyStats.averageRating}
              prefix="⭐"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Tìm kiếm sân..."
            prefix={<SearchOutlined />}
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/fields/add')}
            >
              Thêm sân mới
            </Button>
          </Space>
        </div>
        <Table
          dataSource={filteredFields}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

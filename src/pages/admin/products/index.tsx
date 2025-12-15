import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space,
  Input,
  Select,
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
  ExportOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { mockProducts } from '@/data/mockProducts';

const dailyStats = {
  totalProducts: mockProducts.length,
  lowStock: mockProducts.filter(p => p.stock < 10).length,
  totalStock: mockProducts.reduce((sum, p) => sum + p.stock, 0),
  categories: 4,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const categoryMap: Record<string, string> = {
  food: 'Đồ ăn',
  drink: 'Nước uống',
  apparel: 'Quần áo',
  accessories: 'Phụ kiện'
};

export default function ProductsManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleDelete = (id: string) => {
    message.success(`Đã xóa sản phẩm #${id}`);
  };

  const handleExport = () => {
    message.success('Đã xuất báo cáo sản phẩm!');
  };

  const columns = [
    { 
      title: 'Hình ảnh', 
      dataIndex: 'image', 
      key: 'image',
      width: 80,
      render: (image: string) => (
        <img src={image} alt="Product" className="w-12 h-12 object-cover rounded" />
      )
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { 
      title: 'Danh mục', 
      dataIndex: 'category', 
      key: 'category',
      render: (cat: string) => categoryMap[cat] || cat
    },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (price: number) => formatCurrency(price)
    },
    { 
      title: 'Tồn kho', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (stock: number) => (
        <span className={stock < 10 ? 'text-destructive font-medium' : ''}>
          {stock} {stock < 10 && '⚠️'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: typeof mockProducts[0]) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => navigate(`/admin/products/${record.id}/edit`)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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

  const filteredProducts = mockProducts.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tổng sản phẩm"
              value={dailyStats.totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-red-50 dark:bg-red-900/20">
            <Statistic
              title="Sắp hết hàng"
              value={dailyStats.lowStock}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-green-50 dark:bg-green-900/20">
            <Statistic
              title="Tổng tồn kho"
              value={dailyStats.totalStock}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center bg-blue-50 dark:bg-blue-900/20">
            <Statistic
              title="Danh mục"
              value={dailyStats.categories}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <Space wrap>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              className="w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select 
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-40"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="food">Đồ ăn</Select.Option>
              <Select.Option value="drink">Nước uống</Select.Option>
              <Select.Option value="apparel">Quần áo</Select.Option>
              <Select.Option value="accessories">Phụ kiện</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/products/add')}
            >
              Thêm sản phẩm
            </Button>
          </Space>
        </div>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Tag, 
  Descriptions,
  Row,
  Col,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { mockFields } from '@/data/mockFields';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function FieldDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const field = mockFields.find(f => f.id === Number(id));

  if (!field) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Không tìm thấy sân</h2>
        <Button onClick={() => navigate('/admin/fields')}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/fields')}
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{field.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <EnvironmentOutlined /> {field.location}
            </p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => navigate(`/admin/fields/${id}/edit`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <Row gutter={24}>
        {/* Image */}
        <Col xs={24} md={10}>
          <Card className="border-0 shadow-md">
            <Image
              src={field.image}
              alt={field.name}
              className="rounded-lg w-full"
            />
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} md={14}>
          <Card className="border-0 shadow-md">
            <Descriptions title="Thông tin sân" bordered column={1}>
              <Descriptions.Item label="Tên sân">{field.name}</Descriptions.Item>
              <Descriptions.Item label="Loại sân">{field.size}</Descriptions.Item>
              <Descriptions.Item label="Mặt sân">{field.surface}</Descriptions.Item>
              <Descriptions.Item label="Giá thuê">
                <span className="text-primary font-semibold">{formatCurrency(field.price)}/giờ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">{field.location}</Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                <span className="flex items-center gap-1">
                  <StarOutlined className="text-warning" />
                  {field.rating} ({field.reviews} đánh giá)
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={field.available ? 'green' : 'red'}>
                  {field.available ? 'Hoạt động' : 'Bảo trì'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiện ích">
                <div className="flex flex-wrap gap-1">
                  {field.features.map((feature, idx) => (
                    <Tag key={idx} color="blue">{feature}</Tag>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="border-0 shadow-md mt-4">
            <h3 className="font-semibold mb-2">Mô tả</h3>
            <p className="text-muted-foreground">{field.description}</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

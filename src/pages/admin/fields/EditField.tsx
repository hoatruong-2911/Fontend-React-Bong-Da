import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  Button, 
  Space,
  message,
  Upload,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { mockFields } from '@/data/mockFields';

const { TextArea } = Input;

export default function EditField() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const field = mockFields.find(f => f.id === Number(id));

  if (!field) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Không tìm thấy sân</h2>
        <Button onClick={() => navigate('/admin/fields')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const handleSubmit = (values: unknown) => {
    console.log('Update field:', values);
    message.success('Đã cập nhật sân thành công!');
    navigate('/admin/fields');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/fields')}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa sân</h1>
          <p className="text-muted-foreground">Cập nhật thông tin sân: {field.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: field.name,
            location: field.location,
            size: field.size,
            surface: field.surface,
            price: field.price,
            description: field.description,
            features: field.features,
            available: field.available,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên sân"
                rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}
              >
                <Input placeholder="VD: Sân bóng Premium A1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
              >
                <Input placeholder="VD: Quận 1, TP. HCM" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="size"
                label="Loại sân"
                rules={[{ required: true, message: 'Vui lòng chọn loại sân' }]}
              >
                <Select>
                  <Select.Option value="5v5">Sân 5 người</Select.Option>
                  <Select.Option value="7v7">Sân 7 người</Select.Option>
                  <Select.Option value="11v11">Sân 11 người</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="surface"
                label="Mặt sân"
                rules={[{ required: true, message: 'Vui lòng chọn mặt sân' }]}
              >
                <Select>
                  <Select.Option value="Cỏ nhân tạo">Cỏ nhân tạo</Select.Option>
                  <Select.Option value="Cỏ tự nhiên">Cỏ tự nhiên</Select.Option>
                  <Select.Option value="Sân cứng">Sân cứng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Giá thuê (VND/giờ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  step={10000}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '')) as unknown as 0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về sân bóng..." />
          </Form.Item>

          <Form.Item
            name="features"
            label="Tiện ích"
          >
            <Select mode="tags" placeholder="Nhập các tiện ích (nhấn Enter để thêm)">
              <Select.Option value="Đèn chiếu sáng">Đèn chiếu sáng</Select.Option>
              <Select.Option value="Phòng thay đồ">Phòng thay đồ</Select.Option>
              <Select.Option value="Bãi đỗ xe">Bãi đỗ xe</Select.Option>
              <Select.Option value="Căng tin">Căng tin</Select.Option>
              <Select.Option value="WiFi">WiFi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
          >
            <Upload maxCount={1} listType="picture-card">
              <div>
                <UploadOutlined />
                <div className="mt-2">Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="available"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Bảo trì" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Cập nhật
              </Button>
              <Button onClick={() => navigate('/admin/fields')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

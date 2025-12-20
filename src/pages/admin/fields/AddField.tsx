import { useState } from "react"; // ⬅️ Thêm useState để quản lý loading
import { useNavigate } from "react-router-dom";
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
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from 'antd';
// ⬅️ IMPORT SERVICE
import adminFieldService from "@/services/admin/fieldService";

const { TextArea } = Input;

// Định nghĩa Interface để tránh lỗi "Argument of type..."
interface FieldSubmitData {
  name: string;
  location: string;
  type: string;
  size: number;
  surface: string;
  price: number;
  description: string;
  features: string[];
  available: number;
  image: string;
}
// 1. ĐỊNH NGHĨA normFile Ở ĐÂY (NGOÀI COMPONENT)
// 1. ĐỊNH NGHĨA normFile CHUẨN TYPESCRIPT
const normFile = (e: { fileList: UploadFile[] } | UploadFile[]) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export default function AddField() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // ⬅️ Quản lý trạng thái nút lưu

  // ⬅️ CHỈNH SỬA HÀM XỬ LÝ SUBMIT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 1. Xử lý lấy chuỗi Base64
      let imageBase64 = "";
      if (values.image && values.image.length > 0) {
        // Ưu tiên lấy thumbUrl của Antd
        imageBase64 = values.image[0].thumbUrl || "";
      }

      // 2. Mapping dữ liệu chuẩn
      const submitData = {
        name: values.name,
        location: values.location,
        type:
          values.size === "5v5" ? "f5" : values.size === "7v7" ? "f7" : "f11",
        size: values.size === "5v5" ? 5 : values.size === "7v7" ? 7 : 11,
        surface: values.surface,
        price: values.price,
        description: values.description,
        features: values.features || [],
        available: values.available ? 1 : 0,
        image:
          imageBase64 ||
          "https://images.unsplash.com/photo-1574629810360-7efdf195018e?q=80&w=800",
      };

      const response = await adminFieldService.createField(submitData);

      if (response.success) {
        message.success("Đã thêm sân mới thành công!");
        navigate("/admin/fields");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi khi thêm sân:", error);
      // Hiển thị lỗi chi tiết từ Server (như lỗi Data too long)
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - GIỮ NGUYÊN */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/fields")}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thêm sân mới</h1>
          <p className="text-muted-foreground">Nhập thông tin sân bóng mới</p>
        </div>
      </div>

      {/* Form - GIỮ NGUYÊN GIAO DIỆN */}
      <Card className="border-0 shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            available: true,
            surface: "Cỏ nhân tạo",
            size: "5v5",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên sân"
                rules={[{ required: true, message: "Vui lòng nhập tên sân" }]}
              >
                <Input placeholder="VD: Sân bóng Premium A1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
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
                rules={[{ required: true, message: "Vui lòng chọn loại sân" }]}
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
                rules={[{ required: true, message: "Vui lòng chọn mặt sân" }]}
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
                rules={[{ required: true, message: "Vui lòng nhập giá thuê" }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  step={10000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value ? value.replace(/,/g, "") : "";
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return parsed as any;
                  }}
                  placeholder="300000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả chi tiết về sân bóng..." />
          </Form.Item>

          <Form.Item name="features" label="Tiện ích">
            <Select
              mode="tags"
              placeholder="Nhập các tiện ích (nhấn Enter để thêm)"
            >
              <Select.Option value="Đèn chiếu sáng">
                Đèn chiếu sáng
              </Select.Option>
              <Select.Option value="Phòng thay đồ">Phòng thay đồ</Select.Option>
              <Select.Option value="Bãi đỗ xe">Bãi đỗ xe</Select.Option>
              <Select.Option value="Căng tin">Căng tin</Select.Option>
              <Select.Option value="WiFi">WiFi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
            valuePropName="fileList" // ⬅️ Thêm cái này
            getValueFromEvent={normFile} // ⬅️ Thêm cái này
          >
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false} // Chặn tự động upload lên server của antd
            >
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
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading} // ⬅️ Thêm loading
              >
                Lưu sân mới
              </Button>
              <Button onClick={() => navigate("/admin/fields")}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

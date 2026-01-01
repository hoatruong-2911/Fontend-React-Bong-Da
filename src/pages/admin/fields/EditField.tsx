import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import adminFieldService from "@/services/admin/fieldService";

const { TextArea } = Input;

// 1. Hàm chuẩn hóa file cho Upload
const normFile = (e: { fileList: UploadFile[] } | UploadFile[]) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

export default function EditField() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu ban đầu
  const [btnLoading, setBtnLoading] = useState(false); // Trạng thái nút lưu

  // 2. Khởi tạo dữ liệu (Fetch Data)
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        if (id) {
          const res = await adminFieldService.getFieldById(id);
          if (res.data) {
            const data = res.data;

            // Mapping dữ liệu từ DB lên Form
            form.setFieldsValue({
              name: data.name,
              location: data.location,
              // Chuyển f5 -> 5v5 để khớp với Select Option
              size:
                data.type === "f5"
                  ? "5v5"
                  : data.type === "f7"
                  ? "7v7"
                  : "11v11",
              surface: data.surface,
              price: data.price,
              description: data.description,
              features: Array.isArray(data.features) ? data.features : [],
              available: Number(data.available) === 1,
              // Hiển thị ảnh cũ trong danh sách Upload (nếu có)
              image: data.image
                ? [
                    {
                      uid: "-1",
                      name: "image.png",
                      status: "done",
                      url: data.image.startsWith("data:")
                        ? data.image
                        : `http://127.0.0.1:8000/${data.image}`,
                    },
                  ]
                : [],
            });
          }
        }
      } catch (error) {
        message.error("Không tìm thấy thông tin sân bóng!");
        navigate("/admin/fields");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, form, navigate]);

  // 3. Xử lý lưu dữ liệu (Submit)
  const handleSubmit = async (values: any) => {
    try {
      setBtnLoading(true);

      // Xử lý lấy chuỗi Base64 (nếu người dùng chọn ảnh mới)
      let imageBase64 = "";
      if (values.image && values.image.length > 0) {
        // Nếu là ảnh mới chọn từ máy tính
        if (values.image[0].originFileObj) {
          const reader = new FileReader();
          imageBase64 = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(values.image[0].originFileObj);
          });
        } else {
          // Nếu vẫn là ảnh cũ (không thay đổi)
          imageBase64 = values.image[0].url || "";
        }
      }

      // Mapping dữ liệu chuẩn gửi về Backend
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
        image: imageBase64,
      };

      const response = await adminFieldService.updateField(id!, submitData);

      if (response.success) {
        message.success("Cập nhật sân bóng thành công!");
        navigate("/admin/fields");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error);
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!";
      message.error(errorMsg);
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang tải dữ liệu sân..." />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/fields")}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa sân bóng #{id}</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin chi tiết sân bóng
          </p>
        </div>
      </div>

      {/* Form - GIỐNG HỆT TRANG ADD */}
      <Card className="border-0 shadow-md">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả chi tiết về sân bóng..." />
          </Form.Item>

          <Form.Item name="features" label="Tiện ích">
            <Select mode="tags" placeholder="Nhập các tiện ích">
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
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div className="mt-2">Thay đổi ảnh</div>
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
                loading={btnLoading}
              >
                Cập nhật sân bóng
              </Button>
              <Button onClick={() => navigate("/admin/fields")}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

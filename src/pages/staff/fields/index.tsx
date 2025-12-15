import { useState } from "react";
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { activeFieldBookings } from "@/data/mockStaff";

dayjs.extend(duration);

const { Title, Text } = Typography;

export default function StaffFields() {
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Tính thời gian sử dụng sân
  const calculateFieldTime = (startTime: string) => {
    const start = dayjs(startTime);
    const now = dayjs();
    const diff = now.diff(start, "minute");
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return { hours, minutes, totalMinutes: diff };
  };

  // Kết thúc sân
  const handleEndField = (field: typeof activeFieldBookings[0]) => {
    const { hours, minutes } = calculateFieldTime(field.startTime);
    Modal.confirm({
      title: "Kết thúc sử dụng sân",
      content: (
        <div>
          <p><strong>Sân:</strong> {field.fieldName} - Số {field.fieldNumber}</p>
          <p><strong>Khách hàng:</strong> {field.customerName}</p>
          <p><strong>Thời gian:</strong> {hours} giờ {minutes} phút</p>
          <p><strong>Đơn giá:</strong> {field.pricePerHour.toLocaleString()}đ/giờ</p>
          <p className="text-lg font-semibold text-primary mt-2">
            <strong>Tổng tiền:</strong>{" "}
            {(Math.ceil((hours * 60 + minutes) / 60) * field.pricePerHour).toLocaleString()}đ
          </p>
        </div>
      ),
      okText: "Xác nhận thanh toán",
      cancelText: "Hủy",
      onOk() {
        message.success("Đã kết thúc sân và thanh toán thành công!");
      },
    });
  };

  // Bắt đầu sân mới (walk-in)
  const handleStartField = () => {
    form.validateFields().then((values) => {
      console.log("Bắt đầu sân mới:", values);
      message.success("Đã bắt đầu sân mới!");
      setIsFieldModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>Sân đang hoạt động (Walk-in)</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsFieldModalOpen(true)}
          style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
        >
          Bắt đầu sân mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {activeFieldBookings.map((field) => {
          const { hours, minutes } = calculateFieldTime(field.startTime);
          const isPlaying = field.status === "playing";

          return (
            <Col xs={24} md={12} lg={8} key={field.id}>
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span>{field.fieldName} - Số {field.fieldNumber}</span>
                    <Tag color={isPlaying ? "green" : "blue"}>
                      {isPlaying ? "Đang chơi" : "Đã đặt"}
                    </Tag>
                  </div>
                }
                className={isPlaying ? "border-green-500 border-2" : ""}
              >
                <div className="space-y-3">
                  <div>
                    <Text type="secondary">Khách hàng</Text>
                    <div className="font-medium">{field.customerName}</div>
                    <div className="text-sm text-gray-500">{field.customerPhone}</div>
                  </div>

                  <div>
                    <Text type="secondary">Giá sân</Text>
                    <div className="font-medium">{field.pricePerHour.toLocaleString()}đ/giờ</div>
                  </div>

                  {isPlaying && (
                    <div>
                      <Text type="secondary">Thời gian sử dụng</Text>
                      <div className="text-xl font-bold text-emerald-600">
                        <ClockCircleOutlined className="mr-2" />
                        {hours} giờ {minutes} phút
                      </div>
                      <div className="text-sm text-gray-500">
                        Bắt đầu: {dayjs(field.startTime).format("HH:mm")}
                      </div>
                    </div>
                  )}

                  {!isPlaying && (
                    <div>
                      <Text type="secondary">Thời gian đặt</Text>
                      <div className="font-medium">
                        {dayjs(field.startTime).format("HH:mm - DD/MM/YYYY")}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    {isPlaying ? (
                      <Button
                        type="primary"
                        danger
                        block
                        icon={<StopOutlined />}
                        onClick={() => handleEndField(field)}
                      >
                        Kết thúc & Thanh toán
                      </Button>
                    ) : (
                      <Button 
                        type="primary" 
                        block 
                        icon={<PlayCircleOutlined />}
                        style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
                      >
                        Bắt đầu sân
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal bắt đầu sân mới */}
      <Modal
        title="Bắt đầu sân mới (Khách Walk-in)"
        open={isFieldModalOpen}
        onOk={handleStartField}
        onCancel={() => setIsFieldModalOpen(false)}
        okText="Bắt đầu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="fieldType"
            label="Loại sân"
            rules={[{ required: true, message: "Vui lòng chọn loại sân" }]}
          >
            <Select placeholder="Chọn loại sân">
              <Select.Option value="5">Sân 5 người</Select.Option>
              <Select.Option value="7">Sân 7 người</Select.Option>
              <Select.Option value="11">Sân 11 người</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fieldNumber"
            label="Số sân"
            rules={[{ required: true, message: "Vui lòng nhập số sân" }]}
          >
            <InputNumber placeholder="Nhập số sân" className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="customerName"
            label="Tên khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="pricePerHour"
            label="Giá thuê (đ/giờ)"
            rules={[{ required: true, message: "Vui lòng nhập giá thuê" }]}
          >
            <InputNumber
              placeholder="Nhập giá thuê"
              className="w-full"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
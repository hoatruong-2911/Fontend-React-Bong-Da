import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Switch,
  Divider,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import departmentService, {
  DepartmentSubmitData,
} from "@/services/admin/departmentService";

const { TextArea } = Input;

export default function DepartmentAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm<DepartmentSubmitData>();
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: DepartmentSubmitData) => {
    try {
      setLoading(true);
      // Chuyển đổi boolean sang number 0/1 cho Laravel
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      const res = await departmentService.createDepartment(payload);
      if (res.success) {
        message.success("Tạo phòng ban mới thành công rực rỡ! 🚀");
        navigate("/admin/departments");
      }
    } catch (error: unknown) {
      message.error("Có lỗi xảy ra khi tạo phòng ban!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in duration-500">
      <Space className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          shape="circle"
          className="shadow-sm"
        />
        <div>
          <h2 className="m-0 font-black uppercase italic text-blue-800">
            Thêm phòng ban mới
          </h2>
          <p className="text-gray-400 text-xs m-0">
            Khởi tạo cấu trúc tổ chức mới cho hệ thống
          </p>
        </div>
      </Space>

      <Card className="rounded-[32px] shadow-2xl border-none p-6 bg-white/90 backdrop-blur-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            label={
              <span className="font-bold text-gray-500 uppercase text-[11px]">
                Tên phòng ban
              </span>
            }
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng ban!" },
            ]}
          >
            <Input
              size="large"
              className="rounded-xl"
              placeholder="VD: Bán hàng, Kỹ thuật..."
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-gray-500 uppercase text-[11px]">
                Mô tả nhiệm vụ
              </span>
            }
            name="description"
          >
            <TextArea
              rows={4}
              className="rounded-xl"
              placeholder="Nhập mô tả chức năng của phòng ban..."
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-gray-500 uppercase text-[11px]">
                Trạng thái hoạt động
              </span>
            }
            name="is_active"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="BẬT"
              unCheckedChildren="TẮT"
              className="bg-gray-300"
            />
          </Form.Item>

          <Divider className="my-8" />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<SaveOutlined />}
            className="bg-blue-600 rounded-xl font-bold h-12 shadow-lg shadow-blue-200 border-none"
          >
            XÁC NHẬN THÊM MỚI
          </Button>
        </Form>
      </Card>
    </div>
  );
}

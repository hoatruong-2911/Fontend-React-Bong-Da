import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Switch,
  Divider,
  Spin,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import departmentService, {
  DepartmentSubmitData,
} from "@/services/admin/departmentService";

const { TextArea } = Input;

export default function DepartmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<DepartmentSubmitData>();
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitLoading(true);
        if (id) {
          const res = await departmentService.getDepartmentById(id);
          // Bây giờ TypeScript đã biết chắc res.data là 1 đối tượng, không còn gạch đỏ nữa
          if (res.data) {
            form.setFieldsValue({
              name: res.data.name,
              description: res.data.description || "",
              is_active: Number(res.data.is_active) === 1,
            });
          }
        }
      } catch (error) {
        message.error("Không tìm thấy dữ liệu phòng ban!");
        navigate("/admin/departments");
      } finally {
        setInitLoading(false);
      }
    };
    fetchDetail();
  }, [id, form, navigate]);

  const onFinish = async (values: DepartmentSubmitData) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      if (id) {
        await departmentService.updateDepartment(id, payload);
        message.success("Cập nhật phòng ban thành công!");
        navigate("/admin/departments");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading)
    return (
      <div className="p-20 text-center">
        <Spin size="large" tip="Đang lấy dữ liệu..." />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in zoom-in-95 duration-500">
      <Space className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          shape="circle"
        />
        <div>
          <h2 className="m-0 font-black uppercase italic text-blue-800">
            Chỉnh sửa phòng ban
          </h2>
          <p className="text-gray-400 text-xs m-0">
            Cập nhật thông tin ID: #{id}
          </p>
        </div>
      </Space>

      <Card className="rounded-[32px] shadow-2xl border-none p-6">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={
              <span className="font-bold text-gray-500 uppercase text-[11px]">
                Tên phòng ban
              </span>
            }
            name="name"
            rules={[{ required: true, message: "Tên không được để trống!" }]}
          >
            <Input size="large" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-gray-500 uppercase text-[11px]">
                Mô tả nhiệm vụ
              </span>
            }
            name="description"
          >
            <TextArea rows={4} className="rounded-xl" />
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
            <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
          </Form.Item>

          <Divider className="my-8" />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<SaveOutlined />}
            className="bg-green-600 rounded-xl font-bold h-12 border-none shadow-lg shadow-green-100"
          >
            LƯU THAY ĐỔI
          </Button>
        </Form>
      </Card>
    </div>
  );
}

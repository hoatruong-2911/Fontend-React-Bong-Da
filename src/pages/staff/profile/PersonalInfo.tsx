import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Upload,
  message,
  Divider,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import adminUserService, { User } from "@/services/admin/userService";

const { Text } = Typography;

interface PersonalInfoProps {
  user: User | null;
  onRefresh: () => void;
}

// Interface định nghĩa dữ liệu form sạch bóng Any
interface FormValues {
  name: string;
  email: string;
  phone: string;
  avatar?: {
    fileList: any[];
  };
}

export default function PersonalInfo({ user, onRefresh }: PersonalInfoProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.profile?.phone || "",
      });
    }
  }, [user, form]);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);

      // Xử lý File Upload
      const file = values.avatar?.fileList?.[0]?.originFileObj;
      if (file) {
        formData.append("avatar", file);
      }

      await adminUserService.updateMyProfile(formData);
      message.success("Hồ sơ Platinum đã được cập nhật thành công! 🚀");
      onRefresh();
      form.setFieldsValue({ avatar: undefined });
    } catch (error: any) {
      // Bắt lỗi trùng SĐT hoặc Email từ Backend
      const errorMsg =
        error.response?.data?.message ||
        "Cập nhật thất bại, vui lòng kiểm tra lại dữ liệu!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="p-4"
      requiredMark={false}
      autoComplete="off"
    >
      <Row gutter={24}>
        <Col span={24} className="mb-8">
          <Form.Item
            name="avatar"
            label={
              <Text className="font-black italic uppercase text-[11px] text-emerald-600 tracking-widest">
                Ảnh chân dung mới
              </Text>
            }
          >
            <Upload maxCount={1} beforeUpload={() => false} listType="picture">
              <Button
                icon={<UploadOutlined />}
                className="rounded-xl h-12 w-full border-dashed font-bold italic text-slate-500 bg-slate-50/50"
              >
                Tải lên ảnh rực rỡ từ máy tính
              </Button>
            </Upload>
          </Form.Item>
          <Divider className="my-2 border-slate-50" />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={
              <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                Họ và tên nhân viên
              </Text>
            }
            name="name"
            rules={[
              { required: true, message: "Họ tên không được để trống" },
              { min: 2, message: "Tên quá ngắn, vui lòng nhập lại!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-emerald-500" />}
              size="large"
              className="rounded-xl h-12 font-bold italic shadow-sm"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={
              <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                Địa chỉ Email
              </Text>
            }
            name="email"
            rules={[
              { required: true, message: "Email là bắt buộc" },
              { type: "email", message: "Email không đúng định dạng!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-emerald-500" />}
              size="large"
              className="rounded-xl h-12 font-bold italic shadow-sm"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={
              <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                Số điện thoại liên hệ
              </Text>
            }
            name="phone"
            rules={[
              { required: true, message: "Số điện thoại là bắt buộc" },
              {
                pattern: /^(0[3|5|7|8|9])([0-9]{8})$/,
                message: "SĐT Việt Nam không hợp lệ!",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-emerald-500" />}
              size="large"
              className="rounded-xl h-12 font-bold italic shadow-sm"
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-3 mt-10">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          size="large"
          className="bg-emerald-600 border-none rounded-2xl px-12 h-16 font-black italic uppercase shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all text-sm tracking-[0.1em]"
        >
          LƯU HỒ SƠ PLATINUM
        </Button>
      </div>
    </Form>
  );
}

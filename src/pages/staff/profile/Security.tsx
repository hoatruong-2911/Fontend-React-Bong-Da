import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography, Divider } from 'antd';
import { LockOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import adminUserService from '@/services/admin/userService';

const { Text } = Typography;

// Interface cho Form để chuẩn hóa kiểu dữ liệu
interface ChangePasswordValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function Security() {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<ChangePasswordValues>();

  const onFinish = async (values: ChangePasswordValues) => {
    setLoading(true);
    try {
      // Gọi service đổi mật khẩu đã đồng bộ với Backend Laravel
      await adminUserService.changeMyPassword({
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.confirm_password
      });
      
      message.success('Đã cập nhật mật khẩu mới rực rỡ! Vui lòng sử dụng mật khẩu này cho lần đăng nhập sau.');
      form.resetFields();
    } catch (error: any) {
      // Bắt lỗi từ Backend (Mật khẩu cũ sai, hoặc validation không qua)
      const errorMsg = error.response?.data?.message || "Cập nhật mật khẩu thất bại, vui lòng thử lại!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm rounded-[2rem] p-6 bg-white/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header bảo mật */}
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-emerald-500/10 p-3 rounded-2xl">
          <SafetyCertificateOutlined className="text-2xl text-emerald-600" />
        </div>
        <div>
          <Text className="font-black italic uppercase text-sm tracking-widest text-slate-700 block">Thiết lập bảo mật</Text>
          <Text className="text-[10px] text-slate-400 font-bold italic uppercase">Bảo vệ tài khoản Platinum của bạn</Text>
        </div>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="max-w-xl"
      >
        {/* Mật khẩu hiện tại */}
        <Form.Item
          label={<Text className="font-black italic uppercase text-[11px] text-slate-500 ml-2 tracking-widest">Mật khẩu hiện tại</Text>}
          name="current_password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu đang sử dụng!' }]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-slate-300" />} 
            size="large" 
            className="rounded-xl h-12 border-slate-100 focus:border-emerald-500 shadow-sm" 
            placeholder="••••••••" 
          />
        </Form.Item>

        <Divider className="my-8 border-slate-50" />

        {/* Mật khẩu mới */}
        <Form.Item
          label={<Text className="font-black italic uppercase text-[11px] text-slate-500 ml-2 tracking-widest">Mật khẩu mới</Text>}
          name="new_password"
          rules={[
            { required: true, message: 'Không được để trống mật khẩu mới!' },
            { min: 8, message: 'Mật khẩu Platinum phải có ít nhất 8 ký tự!' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-emerald-500" />} 
            size="large" 
            className="rounded-xl h-12 border-slate-100 focus:border-emerald-500 shadow-sm" 
            placeholder="Nhập mật khẩu mới" 
          />
        </Form.Item>

        {/* Xác nhận mật khẩu mới */}
        <Form.Item
          label={<Text className="font-black italic uppercase text-[11px] text-slate-500 ml-2 tracking-widest">Xác nhận mật khẩu</Text>}
          name="confirm_password"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined className="text-emerald-500" />} 
            size="large" 
            className="rounded-xl h-12 border-slate-100 focus:border-emerald-500 shadow-sm" 
            placeholder="Nhập lại mật khẩu mới" 
          />
        </Form.Item>

        {/* Nút lưu */}
        <div className="mt-10">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            icon={<SaveOutlined />}
            className="rounded-2xl bg-slate-900 border-none font-black italic uppercase h-14 px-12 shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all tracking-widest"
          >
            Cập nhật bảo mật
          </Button>
        </div>
      </Form>
    </Card>
  );
}
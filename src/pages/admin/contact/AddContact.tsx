import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, Space, message, Divider } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  MessageOutlined, ArrowLeftOutlined, SendOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import contactService, { ContactCreateInput } from '@/services/admin/contactService';

const { Title, Text } = Typography;

export default function AddContact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<ContactCreateInput>();

  const onFinish = async (values: ContactCreateInput) => {
    setLoading(true);
    try {
      await contactService.store(values); 
      message.success("Đã ghi nhận liên hệ mới vào hệ thống Platinum!");
      navigate('/admin/contact');
    } catch (error: unknown) {
      // Xử lý lỗi chuẩn TypeScript
      const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header điều hướng */}
      <div className="mb-8">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/contacts')}
          className="font-black italic uppercase text-slate-400 hover:text-emerald-500 p-0 mb-4 transition-colors"
        >
          Quay lại danh sách
        </Button>
        <Title level={2} className="!m-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter">
          ➕ Thêm <span className="text-emerald-500">Liên hệ mới</span>
        </Title>
        <Text className="text-slate-400 font-bold italic uppercase text-[10px] tracking-widest">
          Ghi nhận yêu cầu trực tiếp vào hệ thống Platinum Stadium
        </Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className="rounded-[3rem] border-none shadow-2xl p-4 bg-white/95 backdrop-blur-md overflow-hidden relative">
            {/* Họa tiết trang trí chìm trong card */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                <SendOutlined style={{ fontSize: '200px' }} />
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              initialValues={{ subject: '' }}
            >
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label={<Text className="font-black italic uppercase text-[11px] tracking-widest ml-2 text-slate-500">Họ và tên khách hàng</Text>}
                    name="name"
                    rules={[
                        { required: true, message: 'Danh tính khách hàng là bắt buộc!' },
                        { min: 2, message: 'Tên quá ngắn!' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined className="text-emerald-500" />} 
                      placeholder="VD: Nguyễn Văn Hải" 
                      className="rounded-2xl h-14 italic font-bold border-slate-100 focus:border-emerald-500 shadow-sm"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text className="font-black italic uppercase text-[11px] tracking-widest ml-2 text-slate-500">Số điện thoại</Text>}
                    name="phone"
                    rules={[
                        { required: true, message: 'Cần số điện thoại để liên hệ lại!' },
                        { pattern: /^(0[3|5|7|8|9])([0-9]{8})$/, message: 'Số điện thoại VN không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined className="text-emerald-500" />} 
                      placeholder="09xx xxx xxx" 
                      className="rounded-2xl h-14 italic font-bold border-slate-100 shadow-sm"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<Text className="font-black italic uppercase text-[11px] tracking-widest ml-2 text-slate-500">Địa chỉ Email</Text>}
                name="email"
                rules={[
                    { required: true, message: 'Email dùng để gửi phản hồi tự động!' },
                    { type: 'email', message: 'Định dạng email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-emerald-500" />} 
                  placeholder="khachhang@gmail.com" 
                  className="rounded-2xl h-14 italic font-bold border-slate-100 shadow-sm"
                />
              </Form.Item>

              <Form.Item
                label={<Text className="font-black italic uppercase text-[11px] tracking-widest ml-2 text-slate-500">Chủ đề yêu cầu</Text>}
                name="subject"
              >
                <Input 
                  placeholder="VD: Thuê sân giải đấu, Đặt sân cố định..." 
                  className="rounded-2xl h-14 italic font-bold border-slate-100 shadow-sm"
                />
              </Form.Item>

              <Form.Item
                label={<Text className="font-black italic uppercase text-[11px] tracking-widest ml-2 text-slate-500">Nội dung chi tiết</Text>}
                name="message"
                rules={[
                    { required: true, message: 'Nội dung không được để trống!' },
                    { min: 10, message: 'Vui lòng nhập nội dung rõ ràng hơn (tối thiểu 10 ký tự).' }
                ]}
              >
                <Input.TextArea 
                  rows={6} 
                  placeholder="Ghi chú chi tiết yêu cầu của khách hàng..." 
                  className="rounded-[2.5rem] p-5 italic font-medium border-slate-100 shadow-sm"
                />
              </Form.Item>

              <Divider className="border-slate-50 my-8" />

              <div className="flex justify-end gap-4">
                <Button 
                  size="large" 
                  onClick={() => navigate('/admin/contacts')}
                  className="rounded-2xl px-10 font-black italic uppercase h-14 border-none bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  loading={loading}
                  icon={<SendOutlined />}
                  className="rounded-2xl px-14 font-black italic uppercase h-14 bg-emerald-600 border-none shadow-xl shadow-emerald-200 hover:scale-105 transition-all"
                >
                  Lưu liên hệ
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Card Hướng dẫn - Platinum Slate Style */}
        <Col xs={24} lg={8}>
          <Card className="rounded-[3rem] border-none bg-slate-900 text-white p-4 shadow-2xl relative overflow-hidden h-full">
            <div className="relative z-10 p-4">
              <Title level={4} className="!text-white !font-black !italic uppercase mb-8 tracking-tighter">
                Hỗ trợ <span className="text-emerald-500">Platinum</span>
              </Title>
              
              <Space direction="vertical" size={32} className="w-full">
                <div className="flex gap-5">
                  <div className="bg-emerald-500/20 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Text className="text-emerald-500 font-black italic">01</Text>
                  </div>
                  <Text className="text-slate-400 italic font-medium leading-relaxed">
                    Đảm bảo nhập đúng <b className="text-white">Số điện thoại</b> để nhân viên kỹ thuật có thể liên hệ xác nhận sân.
                  </Text>
                </div>

                <div className="flex gap-5">
                  <div className="bg-emerald-500/20 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Text className="text-emerald-500 font-black italic">02</Text>
                  </div>
                  <Text className="text-slate-400 italic font-medium leading-relaxed">
                    Các liên hệ được thêm từ Admin sẽ mặc định có trạng thái <b className="text-white">Chưa đọc</b>.
                  </Text>
                </div>

                <div className="flex gap-5">
                  <div className="bg-emerald-500/20 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Text className="text-emerald-500 font-black italic">03</Text>
                  </div>
                  <Text className="text-slate-400 italic font-medium leading-relaxed">
                    Sử dụng phần <b className="text-white">Chủ đề</b> để phân loại nhanh các loại yêu cầu (Đặt sân, Khiếu nại, Đối tác).
                  </Text>
                </div>
              </Space>

              <div className="mt-16 p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                    <MessageOutlined className="text-emerald-500 text-xl" />
                    <Text className="text-emerald-400 font-black italic uppercase text-xs tracking-widest">Ghi chú quan trọng</Text>
                </div>
                <Text className="text-slate-500 text-[11px] italic font-medium leading-relaxed block">
                  Hệ thống tự động lưu trữ thời gian và người tạo liên hệ để phục vụ công tác đối soát cuối tháng. Vui lòng nhập liệu trung thực.
                </Text>
              </div>
            </div>
            {/* Họa tiết SVG chìm */}
            <div className="absolute -right-20 -bottom-20 opacity-5">
                <MessageOutlined style={{ fontSize: '350px', color: '#10b981' }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message, Spin, Select, Divider, Space, Avatar, Badge } from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, LoadingOutlined, 
  UserOutlined, MessageOutlined, PhoneOutlined, MailOutlined,
  ClockCircleOutlined, EditOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import contactService, { Contact } from '@/services/admin/contactService';
import { Tag } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface EditFormValues {
  status: 0 | 1 | 2;
  admin_note: string;
}

export default function EditContact() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditFormValues>();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [contactData, setContactData] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;
      try {
        const res = await contactService.getContactById(id);
        setContactData(res.data);
        form.setFieldsValue({
          status: res.data.status,
          admin_note: res.data.admin_note || ''
        });
      } catch (error) {
        message.error("Không tìm thấy thông tin liên hệ này!");
        navigate('/admin/contact');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id, form, navigate]);

  const onFinish = async (values: EditFormValues) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await contactService.updateContact(id, values);
      message.success("Hệ thống Platinum đã cập nhật dữ liệu xử lý!");
      navigate('/admin/contact');
    } catch (error) {
      message.error("Lỗi khi đồng bộ dữ liệu với máy chủ!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <Space direction="vertical" align="center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#10b981' }} spin />} />
        <Text className="font-black italic uppercase text-slate-400 animate-pulse tracking-widest">Đang tải dữ liệu Platinum...</Text>
      </Space>
    </div>
  );

  return (
    <div className="p-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/contact')}
            className="font-black italic uppercase text-slate-400 hover:text-emerald-500 p-0 mb-4 transition-all"
          >
            Quay lại danh sách
          </Button>
          <Title level={2} className="!m-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter">
            🛠️ Hiệu chỉnh <span className="text-emerald-500">Yêu cầu khách</span>
          </Title>
        </div>
        <Badge status="processing" text={<Text className="font-black italic text-emerald-500 uppercase">Hệ thống bảo mật</Text>} />
      </div>

      <Row gutter={[32, 32]}>
        {/* Cột trái: Thông tin Ticket */}
        <Col xs={24} lg={13}>
          <Card className="rounded-[3rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 bg-white h-full relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-12">
                <div className="relative">
                  <Avatar 
                    size={90} 
                    icon={<UserOutlined />} 
                    className="bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl shadow-emerald-200" 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-lg">
                    <SafetyCertificateOutlined className="text-emerald-500 text-xl" />
                  </div>
                </div>
                <div>
                  <Title level={3} className="!m-0 !font-black italic uppercase text-slate-800 tracking-tight leading-none mb-3">
                    {contactData?.name}
                  </Title>
                  <div className="flex flex-wrap gap-3">
                    <Tag  color="cyan" className="rounded-full font-bold px-4 py-1 border-none bg-cyan-50 text-cyan-600">
                      <MailOutlined className="mr-2"/>{contactData?.email}
                    </Tag>
                    <Tag color="emerald" className="rounded-full font-bold px-4 py-1 border-none bg-emerald-50 text-emerald-600">
                      <PhoneOutlined className="mr-2"/>{contactData?.phone}
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-slate-100/50 transition-colors">
                  <Text className="text-[11px] font-black italic text-emerald-600 uppercase tracking-[0.2em] block mb-3">
                    🎯 Chủ đề liên hệ
                  </Text>
                  <Title level={4} className="!font-black italic !m-0 text-slate-800 uppercase tracking-tight">
                    {contactData?.subject || "YÊU CẦU TỪ HỆ THỐNG"}
                  </Title>
                </div>

                <div className="p-8 bg-white rounded-[2.5rem] border-2 border-emerald-50 shadow-sm">
                  <Text className="text-[11px] font-black italic text-emerald-600 uppercase tracking-[0.2em] block mb-3">
                    💬 Thông điệp chi tiết
                  </Text>
                  <Paragraph className="text-[18px] font-medium italic text-slate-600 leading-relaxed mb-6">
                    "{contactData?.message}"
                  </Paragraph>
                  <Divider className="border-slate-100" />
                  <div className="flex items-center justify-between opacity-60">
                    <Text className="text-[11px] font-black italic uppercase text-slate-400">
                      <ClockCircleOutlined className="mr-2" />
                      Nhận lúc: {dayjs(contactData?.created_at).format('HH:mm - DD/MM/YYYY')}
                    </Text>
                    <Text className="text-[11px] font-black italic uppercase text-slate-400">
                      ID: #{contactData?.id}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
            <MessageOutlined className="absolute -right-20 -top-20 text-emerald-50 text-[25rem] opacity-30 pointer-events-none rotate-12" />
          </Card>
        </Col>

        {/* Cột phải: Form xử lý Admin */}
        <Col xs={24} lg={11}>
          <Card className="rounded-[3rem] border-none shadow-2xl p-10 bg-[#0f172a] h-full relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <EditOutlined className="text-emerald-500 text-2xl" />
                </div>
                <Title level={4} className="!m-0 !text-white !font-black !italic uppercase tracking-widest">
                  Xử lý & <span className="text-emerald-500">Phản hồi</span>
                </Title>
              </div>
              
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item 
                  name="status" 
                  label={<Text className="font-black italic uppercase text-[11px] text-emerald-500 tracking-widest ml-2">Trạng thái Ticket</Text>}
                  rules={[{ required: true }]}
                >
                  <Select className="platinum-select-edit" size="large" options={[
                    { value: 0, label: '🔴 CHƯA ĐỌC' },
                    { value: 1, label: '🔵 ĐANG XỬ LÝ' },
                    { value: 2, label: '🟢 HOÀN TẤT' }
                  ]} />
                </Form.Item>

                <Form.Item 
                  name="admin_note" 
                  label={<Text className="font-black italic uppercase text-[11px] text-emerald-500 tracking-widest ml-2">Nhật ký xử lý nội bộ</Text>}
                >
                  <Input.TextArea 
                    rows={12} 
                    placeholder="Ghi chú nội dung đã trao đổi với khách hàng..." 
                    className="platinum-textarea"
                  />
                </Form.Item>

                <Divider className="border-white/10 my-10" />

                <div className="flex flex-col gap-5">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={submitting}
                    icon={<SaveOutlined />}
                    className="h-16 bg-emerald-600 rounded-2xl font-black italic uppercase shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:!bg-emerald-500 hover:scale-[1.02] transition-all border-none"
                  >
                    Lưu hồ sơ Platinum
                  </Button>
                  <Button 
                    block 
                    className="h-14 bg-transparent text-slate-500 rounded-2xl font-black italic uppercase border-2 border-slate-800 hover:!border-emerald-500 hover:!text-emerald-500 transition-all"
                    onClick={() => navigate('/admin/contact')}
                  >
                    Hủy bỏ
                  </Button>
                </div>
              </Form>
            </div>

            {/* Hiệu ứng Glow nền */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          </Card>
        </Col>
      </Row>

      <style>{`
        /* Fix triệt để cái TextArea bị chói mắt */
        .platinum-textarea {
          border-radius: 2rem !important;
          padding: 1.5rem !important;
          font-style: italic !important;
          font-weight: 500 !important;
          background-color: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
          transition: all 0.3s !important;
        }

        .platinum-textarea:hover, .platinum-textarea:focus {
          background-color: rgba(255, 255, 255, 0.07) !important; /* Hơi sáng lên một chút khi hover chứ không trắng xóa */
          border-color: #10b981 !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) !important;
          outline: none !important;
        }

        /* Khi focus, Antd hay ép nền trắng, ta đè lại bằng !important */
        .platinum-textarea:focus-within {
          background-color: rgba(255, 255, 255, 0.07) !important;
        }

        .platinum-select-edit .ant-select-selector { 
          border-radius: 20px !important; 
          height: 60px !important; 
          display: flex !important;
          align-items: center !important;
          font-weight: 800 !important; 
          font-style: italic !important;
          border-color: rgba(255,255,255,0.1) !important;
          background-color: rgba(255,255,255,0.05) !important;
          color: white !important;
        }
        
        .platinum-select-edit .ant-select-selection-item {
          color: white !important;
          line-height: 60px !important;
        }

        .ant-select-dropdown {
          background-color: #1e293b !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 15px !important;
        }

        .ant-select-item {
          color: rgba(255,255,255,0.7) !important;
          font-weight: 700 !important;
          font-style: italic !important;
        }

        .ant-select-item-option-selected {
          background-color: #10b981 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Space,
  message,
  Divider,
  Avatar,
  Tag,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  SendOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  BulbOutlined,
} from "@ant-design/icons";
import contactService, {
  ContactCreateInput,
} from "@/services/admin/contactService";

const { Title, Text, Paragraph } = Typography;

// Danh sách 10 chủ đề gợi ý "Platinum"
const SUGGESTED_SUBJECTS: string[] = [
  "Đặt sân cố định hàng tuần",
  "Thuê sân tổ chức giải đấu",
  "Hỏi phí dịch vụ trọng tài",
  "Đặt tiệc/Liên hoan sau trận",
  "Hợp tác quảng cáo tại sân",
  "Phản hồi chất lượng ánh sáng",
  "Quên đồ tại sân cần tìm lại",
  "Đăng ký lớp học bóng đá trẻ",
  "Góp ý thái độ phục vụ",
  "Hỏi về ưu đãi hội viên",
];

export default function ContactCustomer() {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<ContactCreateInput>();

  const onFinish = async (values: ContactCreateInput) => {
    setLoading(true);
    try {
      await contactService.store(values);
      message.success(
        "🚀 Gửi liên hệ thành công! Platinum Stadium sẽ phản hồi bạn sớm nhất.",
      );
      form.resetFields();
    } catch (error: unknown) {
      // Xử lý lỗi sạch bóng any
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Gửi liên hệ thất bại, vui lòng thử lại!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi bấm vào gợi ý
  const handleSuggestClick = (subject: string): void => {
    form.setFieldsValue({ subject });
    message.info(`Đã chọn: ${subject}`);
  };

  return (
    <div className="min-h-screen bg-[#f1fcf5] py-20 px-4 relative overflow-hidden">
      {/* Background Decor rực rỡ */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in duration-1000">
          <Title
            level={1}
            className="!font-black !italic !uppercase !text-slate-800 !mb-4 tracking-tighter"
          >
            LIÊN HỆ VỚI{" "}
            <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              PLATINUM STADIUM
            </span>
          </Title>
          <div className="flex justify-center items-center gap-3">
            <Divider className="w-12 min-w-[50px] bg-emerald-500 h-[2px]" />
            <Text className="text-slate-500 font-black italic uppercase text-[11px] tracking-[0.4em]">
              CHÚNG TÔI LUÔN LẮNG NGHE YÊU CẦU TỪ PHÍA BẠN
            </Text>
            <Divider className="w-12 min-w-[50px] bg-emerald-500 h-[2px]" />
          </div>
        </div>

        <Row gutter={[48, 48]} align="stretch">
          {/* Cột trái: Thông tin liên hệ */}
          <Col xs={24} lg={10}>
            <div className="space-y-8 h-full flex flex-col animate-in fade-in slide-in-from-left-12 duration-1000">
              <Card className="rounded-[3rem] border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] bg-slate-900 text-white p-10 relative overflow-hidden group flex-grow">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                    <ThunderboltFilled className="text-emerald-500 text-2xl" />
                    <Title
                      level={3}
                      className="!text-white !m-0 !font-black !italic uppercase tracking-widest"
                    >
                      THÔNG TIN LIÊN HỆ
                    </Title>
                  </div>

                  <Space direction="vertical" size={40} className="w-full">
                    <div className="flex gap-6 items-start">
                      <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                        <EnvironmentOutlined className="text-2xl text-white" />
                      </div>
                      <div>
                        <Text className="text-emerald-400 font-black italic uppercase text-[10px] block mb-2 tracking-widest">
                          ĐỊA CHỈ SÂN BÓNG
                        </Text>
                        <Paragraph className="text-slate-200 font-bold italic text-base m-0 leading-relaxed">
                          Sân bóng đá Văn Lâm (sân cỏ nhân tạo), Văn Lâm 3,
                          Phước Nam, Thuận Nam, Ninh Thuận
                        </Paragraph>
                      </div>
                    </div>

                    <div className="flex gap-6 items-start">
                      <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                        <PhoneOutlined className="text-2xl text-white" />
                      </div>
                      <div>
                        <Text className="text-emerald-400 font-black italic uppercase text-[10px] block mb-2 tracking-widest">
                          HOTLINE ĐẶT SÂN
                        </Text>
                        <Paragraph className="text-slate-200 font-black italic text-xl m-0 tracking-wider">
                          0912.345.678 - 0988.888.999
                        </Paragraph>
                      </div>
                    </div>
                  </Space>
                </div>
                <CustomerServiceOutlined className="absolute -right-12 -bottom-12 text-white/5 text-[18rem] rotate-12" />
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md p-4 border-l-8 border-emerald-500">
                <div className="flex items-center gap-6">
                  <Avatar.Group size="large">
                    <Avatar
                      src="https://i.pravatar.cc/150?u=a"
                      className="border-2 border-emerald-500"
                    />
                    <Avatar
                      src="https://i.pravatar.cc/150?u=b"
                      className="border-2 border-emerald-500"
                    />
                    <Avatar
                      src="https://i.pravatar.cc/150?u=c"
                      className="border-2 border-emerald-500"
                    />
                  </Avatar.Group>
                  <Text className="font-black italic text-slate-700 block text-sm uppercase">
                    HƠN 1,000+ YÊU CẦU THÀNH CÔNG
                  </Text>
                </div>
              </Card>
            </div>
          </Col>

          {/* Cột phải: Form nhập liệu & Suggestions */}
          <Col xs={24} lg={14}>
            <Card className="rounded-[4rem] border-none shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] p-10 bg-white relative overflow-hidden animate-in fade-in slide-in-from-right-12 duration-1000">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                requiredMark={false}
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                          Họ tên của bạn <span className="text-red-500">*</span>
                        </Text>
                      }
                      name="name"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ tên." },
                        { min: 2, message: "Tối thiểu 2 ký tự." },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-emerald-500" />}
                        placeholder="Họ và tên"
                        className="platinum-input"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Text>
                      }
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập SĐT." },
                        {
                          pattern: /^(03|05|07|08|09)([0-9]{8})$/,
                          message: "SĐT không hợp lệ.",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined className="text-emerald-500" />}
                        placeholder="Số điện thoại"
                        className="platinum-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </Text>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Email là bắt buộc." },
                    { type: "email", message: "Email sai định dạng." },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-emerald-500" />}
                    placeholder="example@gmail.com"
                    className="platinum-input"
                  />
                </Form.Item>

                {/* PHẦN CHỦ ĐỀ VÀ GỢI Ý - PLATINUM SLIDE */}
                <div className="mb-6">
                  <Form.Item
                    label={
                      <div className="flex justify-between w-full pr-2">
                        <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                          Chủ đề quan tâm
                        </Text>
                        <Text className="text-[10px] font-bold italic text-emerald-500 animate-pulse">
                          <BulbOutlined /> Gợi ý cho bạn
                        </Text>
                      </div>
                    }
                    name="subject"
                  >
                    <Input
                      placeholder="Bạn đang quan tâm đến điều gì?"
                      className="platinum-input"
                    />
                  </Form.Item>

                  {/* Slider Suggestions */}
                  <div className="flex flex-wrap gap-2 mt-[-10px] px-2">
                    {SUGGESTED_SUBJECTS.map((item, index) => (
                      <Tag
                        key={index}
                        onClick={() => handleSuggestClick(item)}
                        className="cursor-pointer border-none bg-slate-50 hover:bg-emerald-500 hover:text-white rounded-full px-4 py-1 font-bold italic text-[11px] transition-all duration-300 shadow-sm hover:shadow-emerald-200"
                      >
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Form.Item
                  label={
                    <Text className="font-black italic uppercase text-[11px] text-slate-400 ml-2 tracking-widest">
                      Nội dung tin nhắn <span className="text-red-500">*</span>
                    </Text>
                  }
                  name="message"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung." },
                    { min: 10, message: "Tối thiểu 10 ký tự." },
                  ]}
                >
                  <Input.TextArea
                    rows={5}
                    placeholder="Lời nhắn gửi đến Platinum Stadium..."
                    className="platinum-textarea"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<SendOutlined />}
                  className="w-full h-20 bg-emerald-500 rounded-[2rem] font-black italic uppercase border-none shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-[1.02] transition-all text-lg tracking-widest"
                >
                  GỬI YÊU CẦU NGAY
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .platinum-input {
          border-radius: 1rem !important;
          height: 56px !important;
          italic: true;
          font-weight: 900 !important;
          border: 2px solid #f8fafc !important;
          background: #f8fafc !important;
          transition: all 0.3s !important;
        }
        .platinum-input:focus, .platinum-input:hover {
          border-color: #10b981 !important;
          background: #fff !important;
        }
        .platinum-textarea {
          border-radius: 2rem !important;
          padding: 1.5rem !important;
          font-weight: 700 !important;
          italic: true;
          border: 2px solid #f8fafc !important;
          background: #f8fafc !important;
        }
        .platinum-textarea:focus {
          border-color: #10b981 !important;
          background: #fff !important;
        }
        .ant-form-item-label > label { height: 35px !important; }
        ::placeholder { color: #cbd5e1 !important; font-style: italic !important; }
      `}</style>
    </div>
  );
}

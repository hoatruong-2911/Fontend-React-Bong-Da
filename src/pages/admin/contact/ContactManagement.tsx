import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Popconfirm,
  Divider,
  Avatar,
  Badge,
  Tooltip,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleFilled,
  SyncOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Thêm để điều hướng trang
import contactService, {
  Contact,
  ContactStats,
} from "@/services/admin/contactService";

import { authService } from "@/services";
const { Title, Text, Paragraph } = Typography;

interface UpdateFormValues {
  status: 0 | 1 | 2;
  admin_note: string;
}

export default function ContactManagement() {
  const navigate = useNavigate(); // Hook điều hướng
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [form] = Form.useForm<UpdateFormValues>();
  // ✅ 0. LOGIC PHÂN QUYỀN PLATINUM
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === "admin"; // Check nếu là Admin mới được sửa/xóa

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactRes, statsRes] = await Promise.all([
        contactService.getContacts(),
        contactService.getStats(),
      ]);
      setContacts(contactRes.data.data);
      setStats(statsRes.data);
    } catch (error) {
      message.error("Không thể kết nối máy chủ Platinum!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleView = async (record: Contact) => {
    setCurrentContact(record);
    form.setFieldsValue({
      status: record.status,
      admin_note: record.admin_note || "",
    });
    setIsModalOpen(true);
    if (record.status === 0) fetchData();
  };

  const handleUpdate = async (values: UpdateFormValues) => {
    if (!currentContact) return;
    try {
      await contactService.updateContact(currentContact.id, values);
      message.success("Hệ thống đã cập nhật trạng thái mới!");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi cập nhật dữ liệu!");
    }
  };

  const columns = [
    {
      title: (
        <Text className="text-[11px] font-black italic uppercase text-slate-400">
          Khách hàng
        </Text>
      ),
      key: "customer",
      width: "25%",
      render: (record: Contact) => (
        <Space size="middle">
          <Badge dot={record.status === 0} offset={[-2, 32]} color="red">
            <Avatar
              size={45}
              icon={<UserOutlined />}
              className="bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-md"
            />
          </Badge>
          <div className="flex flex-col">
            <Text className="font-black italic text-slate-700 uppercase text-[13px] leading-tight">
              {record.name}
            </Text>
            <Text className="text-[11px] text-slate-400 font-bold tracking-tight">
              <MailOutlined className="mr-1 text-emerald-500" /> {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Text className="text-[11px] font-black italic uppercase text-slate-400">
          Liên hệ & Chủ đề
        </Text>
      ),
      key: "info",
      render: (record: Contact) => (
        <div className="flex flex-col gap-1">
          <Tag
            color="blue"
            className="w-fit font-black rounded-lg border-none bg-blue-50 text-blue-600"
          >
            <PhoneOutlined className="mr-1" /> {record.phone}
          </Tag>
          <Text className="text-[12px] font-bold italic text-slate-600 uppercase truncate max-w-[200px]">
            {record.subject || "Yêu cầu từ Website"}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <Text className="text-[11px] font-black italic uppercase text-slate-400 text-center block">
          Trạng thái
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: number) => {
        const config = [
          {
            color: "volcano",
            icon: <ExclamationCircleFilled />,
            text: "CHƯA ĐỌC",
          },
          {
            color: "processing",
            icon: <ClockCircleFilled />,
            text: "ĐANG XỬ LÝ",
          },
          { color: "emerald", icon: <CheckCircleFilled />, text: "HOÀN TẤT" },
        ];
        return (
          <Tag
            color={config[status].color}
            icon={config[status].icon}
            className="font-black italic rounded-full px-4 border-none shadow-sm"
          >
            {config[status].text}
          </Tag>
        );
      },
    },
    {
      title: (
        <Text className="text-[11px] font-black italic uppercase text-slate-400">
          Thời gian
        </Text>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <div className="flex flex-col">
          <Text className="font-bold text-slate-500 text-[11px] uppercase italic">
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
          <Text className="text-slate-300 font-black text-[10px]">
            {dayjs(date).format("HH:mm:ss")}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <Text className="text-[11px] font-black italic uppercase text-slate-400 text-right block">
          Thao tác
        </Text>
      ),
      key: "action",
      align: "right" as const,
      render: (record: Contact) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined className="text-emerald-500" />}
              onClick={() => handleView(record)}
              className="border-none bg-emerald-50 hover:bg-emerald-100 shadow-sm"
            />
          </Tooltip>
          {/* NÚT SỬA ĐƯỢC THÊM THEO YÊU CẦU */}
          <Tooltip title={isAdmin ? "Sửa" : "Bạn không có quyền sửa"}>
            <Button
              shape="circle"
              icon={<EditOutlined className="text-blue-500" />}
              disabled={!isAdmin} // Vô hiệu hóa nếu không phải Admin
              onClick={() => navigate(`/admin/contact/edit/${record.id}`)}
              className="border-none bg-blue-50 hover:bg-blue-100 shadow-sm"
            />
          </Tooltip>
          <Tooltip title={isAdmin ? "Xóa" : "Chỉ Admin mới có quyền xóa"}>
            <Popconfirm
              title="Xác nhận xóa liên hệ?"
              disabled={!isAdmin} // Vô hiệu hóa nếu không phải Admin
              onConfirm={() =>
                contactService.deleteContact(record.id).then(fetchData)
              }
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                shape="circle"
                danger
                icon={<DeleteOutlined />}
                className="border-none bg-red-50 hover:bg-red-100 shadow-sm"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <Title
            level={2}
            className="!m-0 !font-black !italic !uppercase !text-slate-800 tracking-tighter"
          >
            📬 Quản lý{" "}
            <span className="text-emerald-500">Liên hệ khách hàng</span>
          </Title>
          <Text className="text-slate-400 font-bold italic uppercase text-[10px] tracking-widest leading-none">
            Hệ thống xử lý yêu cầu & Feedback Platinum Stadium
          </Text>
        </div>
        {/* NHÓM NÚT ĐIỀU KHIỂN ĐƯỢC CẬP NHẬT THEO YÊU CẦU */}
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/contact/add")}
            className="bg-emerald-600 rounded-xl h-10 font-black italic uppercase border-none shadow-lg shadow-emerald-100"
          >
            Thêm liên hệ
          </Button>
          <Button
            type="default"
            icon={<SyncOutlined spin={loading} />}
            onClick={fetchData}
            className="bg-slate-800 text-white rounded-xl h-10 font-black italic uppercase border-none hover:!bg-slate-700 hover:!text-white"
          >
            Làm mới bộ nhớ
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {[
          {
            title: "TỔNG LIÊN HỆ",
            value: stats?.total,
            color: "bg-slate-800",
            icon: <MessageOutlined />,
            shadow: "shadow-slate-200",
          },
          {
            title: "CHƯA PHẢN HỒI",
            value: stats?.unread,
            color: "bg-red-500",
            icon: <ExclamationCircleFilled />,
            shadow: "shadow-red-200",
          },
          {
            title: "ĐANG XỬ LÝ",
            value: stats?.processing,
            color: "bg-blue-500",
            icon: <ClockCircleFilled />,
            shadow: "shadow-blue-200",
          },
          {
            title: "ĐÃ HOÀN TẤT",
            value: stats?.completed,
            color: "bg-emerald-500",
            icon: <CheckCircleFilled />,
            shadow: "shadow-emerald-200",
          },
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className={`rounded-[2rem] border-none shadow-xl ${item.shadow} hover:-translate-y-1 transition-all overflow-hidden relative group`}
            >
              <div className="flex items-center gap-5 relative z-10">
                <div
                  className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}
                >
                  {item.icon}
                </div>
                <div>
                  <Text className="block font-black italic text-[11px] text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {item.title}
                  </Text>
                  <div className="text-3xl font-black italic text-slate-800 tracking-tighter">
                    {item.value || 0}
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-slate-100 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="scale-[3]">{item.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden p-2">
        <Table
          loading={loading}
          columns={columns}
          dataSource={contacts}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showTotal: (total) => (
              <Text className="font-bold italic opacity-50 text-[11px]">
                Tổng cộng {total} liên hệ Platinum
              </Text>
            ),
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          className="platinum-table"
        />
      </Card>

      <Modal
        title={
          <div className="pb-4 border-b border-slate-50">
            <Title
              level={4}
              className="!m-0 !font-black !italic !uppercase tracking-tighter"
            >
              Chi tiết <span className="text-emerald-500">Ticket</span>
            </Title>
            <Tag
              color="emerald"
              className="mt-2 rounded-full font-black border-none px-4"
            >
              #{currentContact?.id}
            </Tag>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={850}
        centered
        className="platinum-modal"
      >
        <div className="py-6">
          <Row gutter={32}>
            <Col span={14}>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 scale-[4]">
                  <MessageOutlined />
                </div>

                <Space direction="vertical" className="w-full" size="large">
                  <div>
                    <Text className="text-[10px] font-black italic text-emerald-600 uppercase tracking-[0.2em] mb-2 block">
                      Chủ đề yêu cầu
                    </Text>
                    <Title
                      level={4}
                      className="!mt-0 !font-black italic text-slate-800 uppercase"
                    >
                      {currentContact?.subject || "Không có tiêu đề"}
                    </Title>
                  </div>

                  <div>
                    <Text className="text-[10px] font-black italic text-emerald-600 uppercase tracking-[0.2em] mb-2 block">
                      Nội dung tin nhắn
                    </Text>
                    <Paragraph className="text-[15px] font-medium italic text-slate-600 leading-relaxed">
                      "{currentContact?.message}"
                    </Paragraph>
                  </div>

                  <Divider className="my-2 border-slate-200" />

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <Text className="text-[11px] font-black italic text-slate-400">
                        Gửi bởi:{" "}
                        <span className="text-slate-700">
                          {currentContact?.name}
                        </span>
                      </Text>
                      <Text className="text-[11px] font-black italic text-slate-400">
                        Lúc:{" "}
                        <span className="text-slate-700">
                          {dayjs(currentContact?.created_at).format(
                            "HH:mm DD/MM/YYYY",
                          )}
                        </span>
                      </Text>
                    </div>
                    <Tag
                      color="blue"
                      className="rounded-full border-none font-bold uppercase italic px-4 py-1"
                    >
                      {currentContact?.phone}
                    </Tag>
                  </div>
                </Space>
              </div>
            </Col>

            <Col span={10}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <Form.Item
                    name="status"
                    label={
                      <Text className="font-black italic uppercase text-[11px] tracking-widest">
                        Trạng thái xử lý
                      </Text>
                    }
                  >
                    <Select
                      className="platinum-select"
                      size="large"
                      options={[
                        { value: 0, label: "CHƯA ĐỌC" },
                        { value: 1, label: "ĐANG XỬ LÝ" },
                        { value: 2, label: "HOÀN TẤT" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="admin_note"
                    label={
                      <Text className="font-black italic uppercase text-[11px] tracking-widest">
                        Ghi chú nội bộ
                      </Text>
                    }
                  >
                    <Input.TextArea
                      rows={8}
                      className="rounded-3xl border-slate-100 font-medium italic p-4"
                      placeholder="Nhập nội dung đã phản hồi hoặc ghi chú xử lý..."
                    />
                  </Form.Item>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="h-14 bg-emerald-600 rounded-2xl font-black italic uppercase shadow-xl shadow-emerald-200 hover:scale-[1.02] transition-transform"
                >
                  Cập nhật hệ thống
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      </Modal>

      <style>{`
        .platinum-table .ant-table-thead > tr > th { background: transparent !important; border-bottom: 2px solid #f8fafc !important; }
        .platinum-table .ant-table-tbody > tr:hover > td { background: #f0fdf4 !important; }
        .platinum-select .ant-select-selector { border-radius: 16px !important; border-color: #f1f5f9 !important; font-weight: 800 !important; font-style: italic !important; }
        .platinum-modal .ant-modal-content { border-radius: 3rem !important; overflow: hidden !important; }
      `}</style>
    </div>
  );
}

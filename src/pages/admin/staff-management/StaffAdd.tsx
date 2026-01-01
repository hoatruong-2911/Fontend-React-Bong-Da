import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Row,
  Col,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";

import staffService from "@/services/admin/staffService";
import departmentService, {
  Department,
} from "@/services/admin/departmentService";

interface StaffAddFormValues {
  department_id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  bonus?: number;
  join_date: Dayjs;
  status: "active" | "off" | "inactive";
  shift?: string;
}

export default function StaffAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm<StaffAddFormValues>();

  const [loading, setLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchDepts = async (): Promise<void> => {
      try {
        const res = await departmentService.getDepartments();
        setDepartments(res.data);
      } catch (error: unknown) {
        message.error("Không thể tải danh sách phòng ban");
      }
    };
    fetchDepts();
  }, []);

  const onFinish = async (values: StaffAddFormValues): Promise<void> => {
  try {
    setLoading(true);
    const formData = new FormData();
    
    // Đóng gói dữ liệu (giữ nguyên logic của bạn)
    formData.append("department_id", values.department_id.toString());
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("position", values.position);
    formData.append("salary", values.salary.toString());
    formData.append("bonus", (values.bonus || 0).toString());
    formData.append("status", values.status);
    formData.append("join_date", values.join_date.format("YYYY-MM-DD"));

    if (values.shift) formData.append("shift", values.shift);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("avatar", fileList[0].originFileObj as File);
    }

    const res = await staffService.createStaff(formData);
    if (res.success) {
      message.success(res.message || "Thêm nhân viên thành công!");
      navigate("/admin/staff");
    }
  } catch (error: any) {
    // 1. Kiểm tra nếu có lỗi Validation (422) từ Backend
    if (error.response && error.response.status === 422) {
      const serverErrors = error.response.data.errors;
      
      // Duyệt qua tất cả các lỗi và hiển thị thông báo chi tiết
      Object.keys(serverErrors).forEach((key) => {
        serverErrors[key].forEach((msg: string) => {
          message.error(msg); // Hiển thị từng lỗi như "Email đã tồn tại"
        });
      });
    } else {
      // 2. Các lỗi hệ thống khác (500, mất mạng...)
      message.error(error.response?.data?.message || "Vui lòng kiểm tra lại thông tin dữ liệu!");
    }
  } finally {
    setLoading(false);
  }
};

  const uploadProps: UploadProps = {
    listType: "picture-card",
    fileList,
    maxCount: 1,
    beforeUpload: () => false,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
  };

  // Hàm helper cho InputNumber format
  const moneyFormatter = (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === "") return "";
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const moneyParser = (value: string | undefined): number => {
    if (!value) return 0;
    return Number(value.replace(/\$\s?|(,*)/g, "")) || 0;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <Space className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" />
        <div>
          <h2 className="m-0 font-black uppercase italic text-blue-800">Thêm nhân sự mới</h2>
        </div>
      </Space>

      <Card className="rounded-[32px] shadow-2xl border-none p-8">
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "active", bonus: 0 }}>
          <Row gutter={32}>
            <Col xs={24} lg={16}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="HỌ VÀ TÊN" name="name" rules={[{ required: true, message: "Nhập tên nhân viên" }]}>
                    <Input size="large" className="rounded-xl" prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="PHÒNG BAN" name="department_id" rules={[{ required: true, message: "Chọn phòng ban" }]}>
                    <Select size="large" className="rounded-xl" placeholder="Chọn phòng ban">
                      {departments.map((d: Department) => (
                        <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="EMAIL" name="email" rules={[{ required: true, type: "email", message: "Nhập đúng email" }]}>
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="SỐ ĐIỆN THOẠI" name="phone" rules={[{ required: true, message: "Nhập SĐT" }]}>
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="VỊ TRÍ / CHỨC VỤ" name="position" rules={[{ required: true, message: "Nhập vị trí" }]}>
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="NGÀY VÀO LÀM" name="join_date" rules={[{ required: true, message: "Chọn ngày" }]}>
                    <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item label="ẢNH ĐẠI DIỆN" className="text-center">
                <Upload {...uploadProps}>
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item label="TRẠNG THÁI" name="status" rules={[{ required: true }]}>
                <Select size="large" className="rounded-xl">
                  <Select.Option value="active">Hoạt động</Select.Option>
                  <Select.Option value="off">Nghỉ phép</Select.Option>
                  <Select.Option value="inactive">Đã nghỉ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Divider orientation={"left" as const}>
            <span className="text-gray-400 text-xs uppercase font-bold tracking-widest">THÔNG TIN LƯƠNG & CA LÀM</span>
          </Divider> */}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="LƯƠNG CƠ BẢN" name="salary" rules={[{ required: true, message: "Nhập lương" }]}>
                <InputNumber className="w-full rounded-xl" size="large" formatter={moneyFormatter} parser={moneyParser} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="THƯỞNG" name="bonus">
                <InputNumber className="w-full rounded-xl" size="large" formatter={moneyFormatter} parser={moneyParser} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="CA LÀM VIỆC" name="shift">
                <Input size="large" className="rounded-xl" placeholder="VD: Ca sáng" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mt-8">
            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<SaveOutlined />} className="bg-blue-600 rounded-xl h-14 font-black italic uppercase shadow-lg border-none">
              XÁC NHẬN LƯU HỒ SƠ NHÂN VIÊN
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Upload,
  Spin,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";

import staffService, { Staff } from "@/services/admin/staffService";
import departmentService, {
  Department,
} from "@/services/admin/departmentService";

// Định nghĩa Interface cho Form values - không dùng any
interface StaffEditFormValues {
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

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function StaffEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<StaffEditFormValues>();

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      if (!id) return;

      try {
        setFetching(true);

        const [resDept, resStaff] = await Promise.all([
          departmentService.getDepartments(),
          staffService.getStaffById(id),
        ]);

        setDepartments(resDept.data);

        const staff: Staff = resStaff.data;

        form.setFieldsValue({
          department_id: staff.department_id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          position: staff.position,
          salary: staff.salary,
          bonus: staff.bonus,
          status: staff.status,
          shift: staff.shift || undefined,
          join_date: dayjs(staff.join_date),
        });

        if (staff.avatar) {
          setFileList([
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: `${STORAGE_URL}${staff.avatar}`,
            },
          ]);
        }
      } catch (error: unknown) {
        message.error("Lỗi: Không thể tải dữ liệu nhân viên");
      } finally {
        setFetching(false);
      }
    };

    loadInitialData();
  }, [id, form]);

  const onFinish = async (values: StaffEditFormValues): Promise<void> => {
    if (!id) return;

    const formData = new FormData();

    formData.append("department_id", values.department_id.toString());
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("position", values.position);
    formData.append("salary", values.salary.toString());
    formData.append("bonus", (values.bonus || 0).toString());
    formData.append("status", values.status);
    formData.append("join_date", values.join_date.format("YYYY-MM-DD"));

    if (values.shift) {
      formData.append("shift", values.shift);
    }

    const uploadFile = fileList[0];
    if (uploadFile?.originFileObj) {
      formData.append("avatar", uploadFile.originFileObj as File);
    }

    try {
      setLoading(true);

      const res = await staffService.updateStaff(id, formData);

      if (res.success) {
        message.success(res.message || "Cập nhật hồ sơ thành công!");
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
        message.error(
          error.response?.data?.message ||
            "Vui lòng kiểm tra lại thông tin dữ liệu!"
        );
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

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin size="large" tip="Đang lấy thông tin nhân viên..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <Space className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          shape="circle"
        />
        <h2 className="m-0 font-black text-blue-800 uppercase italic">
          Chỉnh sửa nhân viên
        </h2>
      </Space>

      <Card className="rounded-[32px] shadow-2xl border-none p-8">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={32}>
            <Col xs={24} lg={16}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="HỌ VÀ TÊN"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Nhập họ tên",
                      },
                    ]}
                  >
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="PHÒNG BAN"
                    name="department_id"
                    rules={[{ required: true }]}
                  >
                    <Select size="large" className="rounded-xl">
                      {departments.map((d: Department) => (
                        <Select.Option key={d.id} value={d.id}>
                          {d.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="EMAIL"
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                      },
                    ]}
                  >
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="SỐ ĐIỆN THOẠI"
                    name="phone"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="VỊ TRÍ / CHỨC VỤ"
                    name="position"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-xl" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="NGÀY VÀO LÀM"
                    name="join_date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      size="large"
                      className="w-full rounded-xl"
                      format="DD/MM/YYYY"
                    />
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
                      <div style={{ marginTop: 8 }}>Cập nhật ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item
                label="TRẠNG THÁI"
                name="status"
                rules={[{ required: true }]}
              >
                <Select size="large" className="rounded-xl">
                  <Select.Option value="active">Đang hoạt động</Select.Option>
                  <Select.Option value="off">Nghỉ phép</Select.Option>
                  <Select.Option value="inactive">Đã nghỉ việc</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Divider orientation="left">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              Tài chính & Ca làm
            </span>
          </Divider> */}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="LƯƠNG CƠ BẢN"
                name="salary"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full rounded-xl"
                  size="large"
                  formatter={(value) =>
                    value
                      ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="TIỀN THƯỞNG" name="bonus">
                <InputNumber
                  className="w-full rounded-xl"
                  size="large"
                  formatter={(value) =>
                    value
                      ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="CA LÀM VIỆC" name="shift">
                <Input
                  size="large"
                  className="rounded-xl"
                  placeholder="VD: Ca xoay"
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<SaveOutlined />}
            className="bg-green-600 rounded-xl h-14 font-black italic mt-6 uppercase border-none shadow-lg shadow-green-100"
          >
            Lưu thay đổi hồ sơ
          </Button>
        </Form>
      </Card>
    </div>
  );
}

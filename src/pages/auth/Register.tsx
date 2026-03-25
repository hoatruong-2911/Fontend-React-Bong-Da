import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Upload } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  UserAddOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import authService from "../../services/authService";

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  avatar?: any;
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    setLoading(true);
    const msgKey = "register_loading";
    message.loading({ content: "Đang tạo tài khoản...", key: msgKey });

    const nameParts = values.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // ✅ DÙNG FORMDATA ĐỂ GỬI ẢNH
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.confirmPassword);

    if (values.avatar && values.avatar.file) {
      formData.append("avatar", values.avatar.file.originFileObj);
    }

    try {
      // Gọi register qua service (Ní nhớ check service nhận FormData nhé)
      const response = await authService.register(formData as any);
      message.success({
        content: response.message || "Đăng ký thành công!",
        key: msgKey,
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      const apiErrors = error.response?.data?.errors;

      if (apiErrors) {
        // Đẩy lỗi vào từng ô Input để báo đỏ
        const fields = Object.keys(apiErrors).map((key) => {
          // Map lại key từ backend sang key frontend
          let fieldName = key;
          if (key === "first_name" || key === "last_name")
            fieldName = "fullName";
          if (key === "password_confirmation") fieldName = "confirmPassword";
          return { name: fieldName, errors: apiErrors[key] };
        });
        form.setFields(fields);
        message.destroy(msgKey);
      } else {
        message.error({
          content: "Đăng ký thất bại, ní kiểm tra lại nhé!",
          key: msgKey,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg">
              <span className="text-3xl text-white">⚽</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase text-slate-800">
              Đăng ký thành viên
            </h2>
            <p className="text-slate-500">
              Gia nhập cộng đồng sân bóng Pro ní ơi!
            </p>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            {/* ✅ FORM CHỌN ẢNH
            <Form.Item
              name="avatar"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Ảnh đại diện
                </span>
              }
              className="text-center"
            >
              <Upload
                listType="picture-circle"
                maxCount={1}
                beforeUpload={() => false}
                className="avatar-uploader"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              </Upload>
            </Form.Item> */}

            <Form.Item
              name="fullName"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Họ và tên
                </span>
              }
              rules={[{ required: true, message: "Họ tên đâu ní?" }]}
            >
              <Input
                prefix={<UserOutlined className="text-emerald-500" />}
                placeholder="Nguyễn Văn A"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Email
                </span>
              }
              rules={[
                { required: true, message: "Email nhé ní!" },
                { type: "email", message: "Email sai rồi!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-emerald-500" />}
                placeholder="email@example.com"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Số điện thoại
                </span>
              }
              rules={[
                { required: true, message: "Số điện thoại ní ơi!" },
                {
                  pattern: /^0[0-9]{9}$/,
                  message: "Phải là 10 số và bắt đầu bằng số 0!",
                }, // Đồng bộ với Backend
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-emerald-500" />}
                placeholder="0901234567"
                className="rounded-xl h-12"
                maxLength={10} // ✅ Chặn gõ thừa số
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Mật khẩu
                </span>
              }
              rules={[
                { required: true, message: "Mật khẩu nhé!" },
                { min: 8, message: "Tối thiểu 8 ký tự ní ơi!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-emerald-500" />}
                placeholder="••••••••"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px]">
                  Xác nhận mật khẩu
                </span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Nhập lại Pass nào!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-emerald-500" />}
                placeholder="Nhập lại mật khẩu"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-widest shadow-xl border-none"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                ĐĂNG KÝ NGAY
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <p className="text-slate-500 m-0">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-emerald-600 font-black uppercase text-sm ml-1 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image (Giữ nguyên) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-600/80 to-emerald-400/40" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 max-w-md border border-white/20">
            <h1 className="text-4xl font-black italic uppercase text-white mb-4">
              Gia nhập đội hình!
            </h1>
            <p className="text-white/90 text-lg mb-6 font-medium">
              Đăng ký để nhận ưu đãi và đặt sân cực nhanh ní ơi!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

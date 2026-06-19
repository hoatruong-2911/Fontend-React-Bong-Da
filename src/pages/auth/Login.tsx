import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import authService, { LoginCredentials } from "../../services/authService";

interface LoginFormData extends LoginCredentials {
  remember: boolean;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // ✅ Khai báo form để kiểm soát dữ liệu
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    const msgKey = "login_loading";
    message.loading({
      content: "Đang kiểm tra thông tin đăng nhập...",
      key: msgKey,
    });

    try {
      // 1. Gọi API Đăng nhập
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // 2. Xử lý thành công
      message.success({
        content: `Đăng nhập thành công! Chào mừng nhà vô địch!`,
        key: msgKey,
      });

      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      // ✅ XỬ LÝ LỖI KHÔNG RESET FORM
      console.error("Login failed:", error);
      const errorData = error.response?.data;
      const apiErrors = errorData?.errors;

      if (apiErrors) {
        // 🛑 CHIÊU CUỐI: Đẩy lỗi từ Backend vào đúng ô Input (Tô đỏ ô sai)
        const fieldsWithErrors = Object.keys(apiErrors).map((key) => ({
          name: key,
          errors: apiErrors[key],
        }));
        form.setFields(fieldsWithErrors);
        message.destroy(msgKey);
      } else {
        message.error({
          content: errorData?.message || "Thông tin đăng nhập không chính xác!",
          key: msgKey,
        });
      }

      // Tuyệt đối KHÔNG reload hay reset form ở đây
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image (Giữ nguyên) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/85 via-teal-500/75 to-cyan-400/70" />

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-10 max-w-md border border-white/20 shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center text-5xl">
              ⚽
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Hệ thống quản lý sân bóng chuyên nghiệp - Đặt sân nhanh chóng,
              quản lý hiệu quả
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30 text-3xl">
              ⚽
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Đăng nhập
            </h2>
            <p className="text-slate-500 mt-2">Chào mừng bạn quay trở lại!</p>
          </div>

          <Form
            form={form} // ✅ Gắn form vào đây
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ remember: true }}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px] tracking-widest ml-1">
                  Địa chỉ Email
                </span>
              }
              rules={[
                { required: true, message: "Nhập Email để vào sân nào!" },
                { type: "email", message: "Email sai cấu trúc rồi ní ơi!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-emerald-500" />}
                placeholder="soccer@example.com"
                className="rounded-xl h-12 border-slate-200"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-slate-600 font-bold italic uppercase text-[11px] tracking-widest ml-1">
                  Mật khẩu
                </span>
              }
              rules={[
                { required: true, message: "Chưa nhập mật khẩu nhé ní!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-emerald-500" />}
                placeholder="••••••••"
                className="rounded-xl h-12 border-slate-200"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-slate-500">Ghi nhớ</Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="text-emerald-600 hover:text-emerald-700 font-bold italic text-sm underline underline-offset-4 decoration-emerald-200"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-widest shadow-xl shadow-emerald-100 border-none hover:scale-[1.02] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                VÀO SÂN NGAY
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500 m-0">
              Chưa có tài khoản thành viên?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-black italic uppercase text-sm ml-1"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

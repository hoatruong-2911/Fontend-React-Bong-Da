// Login.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
// ⬅️ THÊM IMPORT SERVICE VÀ INTERFACE CHO CREDENTIALS
import authService, { LoginCredentials } from "../../services/authService";

// Dùng interface chính xác từ service
interface LoginFormData extends LoginCredentials {
  remember: boolean;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // 1. Gọi API Đăng nhập
      const response = await authService.login({
        email: values.email,
        password: values.password,
      }); // 2. Xử lý thành công
      message.success(`Đăng nhập thành công! Chào mừng ${response.user.role}!`); // Chuyển hướng dựa trên vai trò người dùng (Tùy chọn: tùy chỉnh theo logic app của bạn)
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (response.user.role === "staff") {
        navigate("/staff/products");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      // 3. Xử lý thất bại (Lỗi từ API, ví dụ: 422)
      console.error("Login failed:", error);
      // Trích xuất thông báo lỗi từ Laravel Form Request (Lỗi 422) hoặc lỗi chung
      const apiErrorMessage =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin.";
      message.error(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  }; // ----------------------------------------------------------------- // PHẦN UI/JSX DƯỚI ĐÂY GIỮ NGUYÊN KHÔNG THAY ĐỔI // -----------------------------------------------------------------

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/85 via-teal-500/75 to-cyan-400/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-10 max-w-md border border-white/20 shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-5xl">⚽</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Hệ thống quản lý sân bóng chuyên nghiệp - Đặt sân nhanh chóng,
              quản lý hiệu quả
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-teal-300/20 blur-2xl" />
      </div>
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30">
              <span className="text-3xl">⚽</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Đăng nhập</h2>
            <p className="text-muted-foreground mt-2">
              Chào mừng bạn quay trở lại!
            </p>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ remember: true }}
            size="large"
          >
            <Form.Item
              name="email"
              label={<span className="text-foreground font-medium">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-muted-foreground" />}
                placeholder="Nhập email của bạn"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-foreground font-medium">Mật khẩu</span>
              }
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Nhập mật khẩu"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-foreground">
                    Ghi nhớ đăng nhập
                  </Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
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
                className="w-full h-12 rounded-xl text-lg font-semibold"
                style={{
                  background: "linear-gradient(135deg, #10b981, #14b8a6)",
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-8 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Tài khoản demo:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex justify-between">
                <span>Admin:</span>{" "}
                <code className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                  admin@stadium.com / admin123
                </code>
              </p>
              <p className="flex justify-between">
                <span>Staff:</span>{" "}
                <code className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                  staff@stadium.com / staff123
                </code>
              </p>
              <p className="flex justify-between">
                <span>User:</span>{" "}
                <code className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                  user@stadium.com / user123
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
      {" "}
    </div>
  );
}

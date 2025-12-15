// Register.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
// ⬅️ THÊM IMPORT SERVICE VÀ INTERFACE
import authService, { RegisterData } from "../../services/authService";

// Cập nhật interface để khớp với các trường của Form
interface RegisterFormData {
  fullName: string; // Tên đầy đủ (sẽ được tách ra)
  email: string;
  phone: string;
  password: string;
  confirmPassword: string; // Tương đương với password_confirmation
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    setLoading(true);

    // 1. Xử lý dữ liệu Frontend (Tách tên và đổi tên trường)
    const nameParts = values.fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const apiData: RegisterData = {
      first_name: firstName,
      last_name: lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      password_confirmation: values.confirmPassword, // Đổi tên trường
      // role mặc định là 'customer', không cần gửi
    };

    try {
      // 2. Gọi API Đăng ký
      const response = await authService.register(apiData); // 3. Xử lý thành công
      message.success(
        response.message || "Đăng ký thành công! Vui lòng đăng nhập."
      );
      navigate("/login");
    } catch (error: any) {
      // 4. Xử lý thất bại (Lỗi từ API, ví dụ: 422 - Validation)
      console.error("Registration failed:", error.response?.data);
      let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

      // Trích xuất lỗi từ Laravel Form Request (Lỗi 422)
      const errors = error.response?.data?.errors;

      if (errors) {
        // Ví dụ: Lấy lỗi đầu tiên từ trường email, password, phone,...
        errorMessage =
          errors.email?.[0] ||
          errors.password?.[0] ||
          errors.phone?.[0] ||
          error.response.data.message;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }; // ----------------------------------------------------------------- // PHẦN UI/JSX DƯỚI ĐÂY GIỮ NGUYÊN KHÔNG THAY ĐỔI // -----------------------------------------------------------------

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        {/* ... Phần UI giữ nguyên ... */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Đăng ký tài khoản
            </h2>
            <p className="text-muted-foreground mt-2">
              Tạo tài khoản để trải nghiệm dịch vụ
            </p>
          </div>

          <Form
            name="register"
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="fullName"
              label={
                <span className="text-foreground font-medium">Họ và tên</span>
              }
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input
                prefix={<UserOutlined className="text-muted-foreground" />}
                placeholder="Nguyễn Văn A"
                className="rounded-lg"
              />
            </Form.Item>

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
                placeholder="email@example.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <span className="text-foreground font-medium">
                  Số điện thoại
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-muted-foreground" />}
                placeholder="0901234567"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-foreground font-medium">Mật khẩu</span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" }, // Đã sửa min: 8 để khớp với RegisterRequest
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Nhập mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <span className="text-foreground font-medium">
                  Xác nhận mật khẩu
                </span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Nhập lại mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-lg font-semibold"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* ... Phần UI giữ nguyên ... */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-primary/80 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">
              Tham gia ngay!
            </h1>
            <p className="text-primary-foreground/90 text-lg mb-6">
              Đăng ký để đặt sân, theo dõi lịch sử và nhận nhiều ưu đãi hấp dẫn
            </p>
            <div className="space-y-3 text-left text-primary-foreground/90">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  ✓
                </span>
                <span>Đặt sân nhanh chóng, tiện lợi</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  ✓
                </span>
                <span>Theo dõi lịch sử đặt sân</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  ✓
                </span>
                <span>Nhận thông báo ưu đãi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {" "}
    </div>
  );
}

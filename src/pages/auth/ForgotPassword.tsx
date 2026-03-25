import { useState } from "react";
import { Form, Input, Button, message, Card, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Nhập email, 1: Nhập OTP & Pass
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Xử lý Bước 1: Gửi mã OTP
  const handleSendOtp = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.sendOtp(values.email);
      message.success("Mã OTP rực rỡ đã bay vào hộp thư của ní!");
      setEmail(values.email);
      setStep(1); // Chuyển sang bước nhập mã
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Email không tồn tại trên hệ thống!",
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Bước 2: Đổi mật khẩu
  const handleResetPassword = async (values: any) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        email: email,
        otp: values.otp,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      message.success("Đổi mật khẩu thành công! Vào sân thôi ní ơi!");
      navigate("/login");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#053d2f] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-3xl shadow-2xl border-none overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white text-3xl mb-4 shadow-lg">
            ⚽
          </div>
          <h2 className="text-3xl font-black italic uppercase text-slate-800">
            Quên mật khẩu
          </h2>
          <p className="text-slate-500">
            Lấy lại "chìa khóa" vào sân ngay ní ơi!
          </p>
        </div>

        <Steps
          current={step}
          className="mb-8 px-4"
          items={[{ title: "Gửi mã" }, { title: "Đổi mật khẩu" }]}
        />

        {step === 0 ? (
          /* FORM BƯỚC 1: NHẬP EMAIL */
          <Form layout="vertical" onFinish={handleSendOtp} size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Nhập email để nhận mã nào!" },
                { type: "email", message: "Email sai rồi ní!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-emerald-500" />}
                placeholder="Nhập email của ní"
                className="rounded-xl h-12"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-xl font-black italic uppercase bg-emerald-500 border-none shadow-lg"
            >
              GỬI MÃ XÁC NHẬN
            </Button>
          </Form>
        ) : (
          /* FORM BƯỚC 2: NHẬP OTP & PASS MỚI */
          <Form
            form={form}
            layout="vertical"
            onFinish={handleResetPassword}
            size="large"
          >
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: "Mã OTP 6 số trong mail ní đó!" },
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-emerald-500" />}
                placeholder="Nhập mã OTP 6 số"
                className="rounded-xl h-12"
                maxLength={6}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Mật khẩu mới ít nhất 8 ký tự!" },
                { min: 8, message: "Ngắn quá, 8 ký tự trở lên nha!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-emerald-500" />}
                placeholder="Mật khẩu mới"
                className="rounded-xl h-12"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Nhập lại Pass cho chắc nào!" },
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
                placeholder="Nhập lại mật khẩu mới"
                className="rounded-xl h-12"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-xl font-black italic uppercase bg-emerald-500 border-none shadow-lg"
            >
              HOÀN TẤT ĐỔI MẬT KHẨU
            </Button>
            <Button
              type="link"
              onClick={() => setStep(0)}
              className="w-full mt-4 text-slate-400 font-bold italic"
            >
              <ArrowLeftOutlined /> QUAY LẠI NHẬP EMAIL
            </Button>
          </Form>
        )}

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-emerald-600 font-black uppercase text-sm hover:underline"
          >
            VỀ TRANG ĐĂNG NHẬP
          </Link>
        </div>
      </Card>
    </div>
  );
}

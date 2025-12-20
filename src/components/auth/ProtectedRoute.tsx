import { Navigate, Outlet, useLocation } from "react-router-dom";
import { message } from "antd";
import authService from "@/services/authService";

interface Props {
  allowedRoles: string[]; // Danh sách các quyền được phép truy cập
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const user = authService.getStoredUser();
  const isAuthenticated = authService.isAuthenticated();

  // 1. Kiểm tra đăng nhập
  if (!isAuthenticated) {
    message.warning("Vui lòng đăng nhập để truy cập chức năng này!");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền truy cập (Admin/Staff/Customer)
  if (!allowedRoles.includes(user?.role || "")) {
    message.error("Bạn không có quyền vào trang này!");

    // Nếu là Customer mà đi lạc vào Admin -> Về trang chủ khách hàng
    if (user?.role === "customer") {
      return <Navigate to="/" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

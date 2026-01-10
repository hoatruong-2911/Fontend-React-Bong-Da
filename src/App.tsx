import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

// Import ProtectedRoute (Đảm bảo bạn đã tạo file này ở bước trước)
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

//----------------------Admin pages
import AdminDashboard from "./pages/admin/dashboard/index";

//------- Fields
import AdminFields from "./pages/admin/fields/index";
import AddField from "./pages/admin/fields/AddField";
import EditField from "./pages/admin/fields/EditField";
import FieldDetails from "./pages/admin/fields/FieldDetails";

//------- Booking
import AdminBookings from "./pages/admin/bookings/index";
import AddBooking from "./pages/admin/bookings/AddBooking";
import BookingDetails from "./pages/admin/bookings/BookingDetails";
import EditBooking from "./pages/admin/bookings/EditBooking";

//------- User
import AdminUser from "./pages/admin/user/index";
import UserAdd from "./pages/admin/user/AddUser";
import UserEdit from "./pages/admin/user/EditUser";
import UserDetails from "./pages/admin/user/UserDetails";

//-------
// Product
import ProductsManagement from "./pages/admin/products/ProductIndex";
import ProductAdd from "./pages/admin/products/ProductAdd";
import ProductEdit from "./pages/admin/products/ProductEdit";
import ADminProductDetail from "./pages/admin/products/ProductDetail";

// brand
import BrandManagement from "./pages/admin/brands/index";
import BrandAdd from "./pages/admin/brands/BrandAdd";
import BrandEdit from "./pages/admin/brands/BrandEdit";
import BrandDetail from "./pages/admin/brands/BrandDetail";

// cate
import CategoryAdd from "./pages/admin/categories/CategoryAdd";
import CategoryDetail from "./pages/admin/categories/CategoryDetail";
import CategoryEdit from "./pages/admin/categories/CategoryEdit";
import CategoryManagement from "./pages/admin/categories/index";

// Departments
import AdminDepartments from "./pages/admin/departments/DepartmentIndex";
import AdminDepartmentsAdd from "./pages/admin/departments/DepartmentAdd";
import AdminDepartmentsEdit from "./pages/admin/departments/DepartmentEdit";
import AdminDepartmentsDetails from "./pages/admin/departments/DepartmentDetail";

// staff
import StaffIndex from "./pages/admin/staff-management/index";
import StaffAdd from "./pages/admin/staff-management/StaffAdd";
import StaffEdit from "./pages/admin/staff-management/StaffEdit";
import StaffDetail from "./pages/admin/staff-management/StaffDetail";

// ca làm cho nhân viên
import AdminShifts from "./pages/admin/shifts/index";
import ShiftAdd from "./pages/admin/shifts/ShiftAdd";
import ShiftDetail from "./pages/admin/shifts/ShiftDetail";
import ShiftEdit from "./pages/admin/shifts/ShiftEdit";

// chấm công cho nhân viên
import AdminAttendance from "./pages/admin/attendance/index";
import AttendanceAdd from "./pages/admin/attendance/AttendanceAdd";
import AttendanceDetail from "./pages/admin/attendance/AttendanceDetail";
import AttendanceEdit from "./pages/admin/attendance/AttendanceEdit";

// quản lý khách hàng
import AdminCustomers from "./pages/admin/customers/index";
import CustomerDetail from "./pages/admin/customers/CustomerDetail";

//-------
//----------------------

// ----------------------Staff pages

import AdminProfile from "./pages/admin/profile/index";
import AdminRevenue from "./pages/admin/revenue/index";
import AdminSettings from "./pages/admin/settings/index";

import StaffDashboard from "./pages/staff/dashboard/index";
import StaffBookings from "./pages/staff/bookings/index";
import StaffFields from "./pages/staff/fields/index";
import StaffOrders from "./pages/staff/orders/index";
import StaffProfile from "./pages/staff/profile/index";

// ----------------------Customer pages
import Index from "./pages/customer/Index";

// sản phẩm
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";

// sân
// import ProductDetail from "./pages/customer/ProductDetail";
import Fields from "./pages/customer/Fields";
import FieldDetail from "./pages/customer/FieldDetail";
// đặt sân
import Booking from "./pages/customer/Booking";
// giỏ hàng đặt hàng
import Cart from "./pages/customer/Cart";

// lịch sử 
import CustomerOrders from "./pages/customer/orders/index";
import OrdersDetail from "./pages/customer/orders/OrderDetail";
// thanh toán
import Checkout from "./pages/customer/Checkout";

// giới thiệu
import AboutUs from "./pages/customer/AboutUs";

// hồ sơ
import CustomerProfile from "./pages/customer/profile/index";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={viVN}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Auth routes - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- ADMIN & STAFF ROUTES: Được bảo vệ bởi ProtectedRoute --- */}
            {/* Cả Admin và Staff đều có thể vào các trang có prefix /admin (theo yêu cầu của bạn là Staff xem được) */}
            <Route
              element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}
            >
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/fields" element={<AdminFields />} />
                <Route path="/admin/fields/add" element={<AddField />} />
                <Route path="/admin/fields/edit/:id" element={<EditField />} />
                <Route path="/admin/fields/:id" element={<FieldDetails />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/bookings/add" element={<AddBooking />} />
                <Route
                  path="/admin/bookings/:id"
                  element={<BookingDetails />}
                />
                <Route
                  path="/admin/bookings/edit/:id"
                  element={<EditBooking />}
                />
                <Route path="/admin/user" element={<AdminUser />} />
                <Route path="/admin/user/add" element={<UserAdd />} />
                <Route path="/admin/user/edit/:id" element={<UserEdit />} />
                <Route path="/admin/user/:id" element={<UserDetails />} />
                {/* <Route path="/admin/products" element={<AdminProducts />} /> */}
                {/* phòng ban */}
                <Route
                  path="/admin/Departments"
                  element={<AdminDepartments />}
                />
                <Route
                  path="/admin/Departments/add"
                  element={<AdminDepartmentsAdd />}
                />
                <Route
                  path="/admin/Departments/edit/:id"
                  element={<AdminDepartmentsEdit />}
                />
                <Route
                  path="/admin/Departments/:id"
                  element={<AdminDepartmentsDetails />}
                />
                {/* quản lý nhân viên */}
                <Route path="/admin/staff" element={<StaffIndex />} />
                <Route path="/admin/staff/add" element={<StaffAdd />} />
                <Route path="/admin/staff/edit/:id" element={<StaffEdit />} />
                <Route path="/admin/staff/:id" element={<StaffDetail />} />
                {/* quản lý ca làm  */}
                <Route path="/admin/shifts" element={<AdminShifts />} />
                <Route path="/admin/shifts/add" element={<ShiftAdd />} />
                <Route path="/admin/shifts/:id" element={<ShiftDetail />} />
                <Route path="/admin/shifts/edit/:id" element={<ShiftEdit />} />
                {/* quản lý chấm công */}
                <Route
                  path="/admin/attendances"
                  element={<AdminAttendance />}
                />
                <Route
                  path="/admin/attendances/add"
                  element={<AttendanceAdd />}
                />
                <Route
                  path="/admin/attendances/:id"
                  element={<AttendanceDetail />}
                />
                <Route
                  path="/admin/attendances/edit/:id"
                  element={<AttendanceEdit />}
                />
                {/* quản lý khách hàng */}
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route
                  path="/admin/customers/:id"
                  element={<CustomerDetail />}
                />
                x <Route path="/admin/revenue" element={<AdminRevenue />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                {/* quản lý sản phẩm */}
                <Route
                  path="/admin/products"
                  element={<ProductsManagement />}
                />
                <Route path="/admin/products/add" element={<ProductAdd />} />
                <Route
                  path="/admin/products/edit/:id"
                  element={<ProductEdit />}
                />
                <Route
                  path="/admin/products/:id"
                  element={<ADminProductDetail />}
                />
                <Route path="/admin/brands" element={<BrandManagement />} />
                <Route path="/admin/brands/add" element={<BrandAdd />} />
                <Route path="/admin/brands/edit/:id" element={<BrandEdit />} />
                <Route path="/admin/brands/:id" element={<BrandDetail />} />
                <Route
                  path="/admin/categories"
                  element={<CategoryManagement />}
                />
                <Route path="/admin/categories/add" element={<CategoryAdd />} />
                <Route
                  path="/admin/categories/edit/:id"
                  element={<CategoryEdit />}
                />
                <Route
                  path="/admin/categories/:id"
                  element={<CategoryDetail />}
                />
              </Route>
            </Route>

            {/* --- STAFF ONLY ROUTES --- */}
            <Route
              element={<ProtectedRoute allowedRoles={["staff", "admin"]} />}
            >
              <Route element={<StaffLayout />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/staff/bookings" element={<StaffBookings />} />
                <Route path="/staff/fields" element={<StaffFields />} />
                <Route path="/staff/orders" element={<StaffOrders />} />
                <Route path="/staff/profile" element={<StaffProfile />} />
              </Route>
            </Route>

            {/* --- PUBLIC/CUSTOMER ROUTES: Khách hàng vào thoải mái --- */}
            <Route element={<CustomerLayout />}>
              {/* NHÓM 1: TRANG CÔNG KHAI - TUYỆT ĐỐI KHÔNG CẦN ĐĂNG NHẬP */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/fields" element={<Fields />} />
              <Route path="/fields/:id" element={<FieldDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/aboutus" element={<AboutUs />} />
              

              {/* NHÓM 2: TRANG RIÊNG TƯ - BẮT BUỘC ĐĂNG NHẬP */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["customer", "staff", "admin"]}
                  />
                }
              >
                <Route path="/booking" element={<Booking />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/orders" element={<CustomerOrders />} />
                <Route path="/orders/:orderCode" element={<OrdersDetail />} />


              </Route>
            </Route>
            {/* CATCH-ALL ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard/index";
import AdminFields from "./pages/admin/fields/index";
import AddField from "./pages/admin/fields/AddField";
import EditField from "./pages/admin/fields/EditField";
import FieldDetails from "./pages/admin/fields/FieldDetails";
import AdminBookings from "./pages/admin/bookings/index";
import AdminProducts from "./pages/admin/products/index";
import AdminStaff from "./pages/admin/staff-management/index";
import AdminCustomers from "./pages/admin/customers/index";
import AdminAttendance from "./pages/admin/attendance/index";
import AdminShifts from "./pages/admin/shifts/index";
import AdminProfile from "./pages/admin/profile/index";
import AdminRevenue from "./pages/admin/revenue/index";
import AdminSettings from "./pages/admin/settings/index";

// Staff pages
import StaffDashboard from "./pages/staff/dashboard/index";
import StaffBookings from "./pages/staff/bookings/index";
import StaffFields from "./pages/staff/fields/index";
import StaffOrders from "./pages/staff/orders/index";
import StaffProfile from "./pages/staff/profile/index";

// Customer pages
import Index from "./pages/customer/Index";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Fields from "./pages/customer/Fields";
import FieldDetail from "./pages/customer/FieldDetail";
import Booking from "./pages/customer/Booking";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import CustomerProfile from "./pages/customer/profile/index";
import CustomerOrders from "./pages/customer/orders/index";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={viVN}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes with AdminLayout */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/fields" element={<AdminFields />} />
              <Route path="/admin/fields/add" element={<AddField />} />
              <Route path="/admin/fields/edit/:id" element={<EditField />} />
              <Route path="/admin/fields/:id" element={<FieldDetails />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/shifts" element={<AdminShifts />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
            
            {/* Staff routes with StaffLayout */}
            <Route element={<StaffLayout />}>
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/staff/bookings" element={<StaffBookings />} />
              <Route path="/staff/fields" element={<StaffFields />} />
              <Route path="/staff/orders" element={<StaffOrders />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>
            
            {/* Public/Customer routes with CustomerLayout */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/fields" element={<Fields />} />
              <Route path="/fields/:id" element={<FieldDetail />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/orders" element={<CustomerOrders />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
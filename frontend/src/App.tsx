import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import { HomePage, DashboardPage, UnauthorizedPage } from './pages/DummyPages';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BrandManagement from './pages/admin/BrandManagement';
import ProductManagement from './pages/admin/ProductManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <Router>
      <Routes>
        {/* Cổng vào trang Shop (Khách hàng) */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-otp" element={<VerifyOTPPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route 
            path="checkout" 
            element={user ? <CheckoutPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="my-orders" 
            element={user ? <OrderHistoryPage /> : <Navigate to="/login" />} 
          />
          {/* Các route con của shop sẽ thêm ở đây */}
          <Route path="products" element={<div>Trang danh sách sản phẩm</div>} />
        </Route>

        {/* Cổng vào trang Admin (Quản trị) */}
        <Route 
          path="/admin" 
          element={
            !user ? <Navigate to="/login" /> : 
            user.role === 'ADMIN' ? <AdminLayout /> : <UnauthorizedPage />
          }
        >
          <Route index element={<DashboardPage />} />
          {/* Các route con của admin sẽ thêm ở đây */}
          <Route path="brands" element={<BrandManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>

        {/* Mặc định nếu gõ sai đường dẫn */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

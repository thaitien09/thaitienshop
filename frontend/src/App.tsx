import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import { HomePage, DashboardPage, ProfilePage, UnauthorizedPage } from './pages/DummyPages';
import BrandManagement from './pages/admin/BrandManagement';
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
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="products" element={<div>Quản lý sản phẩm</div>} />
          <Route path="orders" element={<div>Quản lý đơn hàng</div>} />
        </Route>

        {/* Mặc định nếu gõ sai đường dẫn */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

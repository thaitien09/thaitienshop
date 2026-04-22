import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message, Result } from 'antd';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasCalled = React.useRef(false); // Thêm chốt chặn

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        message.error('Không tìm thấy mã xác thực từ Google!');
        navigate('/login');
        return;
      }

      if (hasCalled.current) return; // Nếu đã gọi rồi thì bỏ qua
      hasCalled.current = true; // Đánh dấu đã gọi

      try {
        // Gửi code về Backend để đổi lấy JWT
        const res = await api.post('/auth/google-login', { code });
        const { accessToken, refreshToken, user } = res.data.data;

        // Lưu tokens và cập nhật State qua AuthContext
        login(accessToken, refreshToken, user);

        message.success(`Chào mừng trở lại, ${user.name}!`);
        navigate('/'); // Về trang chủ
      } catch (error: any) {
        console.error('Google Login Error:', error);
        message.error(error.response?.data?.message || 'Đăng nhập Google thất bại!');
        navigate('/login');
      }
    };

    handleGoogleLogin();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f9f9f9' 
    }}>
      <Result
        icon={<Spin size="large" />}
        title="Đang xử lý đăng nhập Google"
        subTitle="Vui lòng đợi trong giây lát..."
      />
    </div>
  );
};

export default GoogleCallbackPage;

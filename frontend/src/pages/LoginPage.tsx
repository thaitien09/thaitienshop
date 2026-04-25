import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      const { accessToken, refreshToken, user } = res.data.data;
      
      login(accessToken, refreshToken, user);
      message.success('Chào mừng bạn quay trở lại!');

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      const email = error.response?.data?.email;
      let errorMsg = error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!';
      
      // Nếu errorMsg là mảng (do NestJS validation), lấy phần tử đầu tiên
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }

      // Nếu lỗi là do chưa xác thực, điều hướng sang trang OTP
      if (email && errorMsg.includes('chưa được xác thực')) {
        message.warning('Tài khoản của bạn chưa được xác thực. Hãy nhập mã đã nhận!');
        navigate(`/verify-otp?email=${email}`);
        return;
      }

      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-sm">
        {/* Editorial Header */}
        <div className="mb-12 text-left">
          <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">
            Đăng nhập
          </Title>
          <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">
            Tiếp tục hành trình cùng Thai Tien Shop
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
          className="space-y-4"
        >
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              variant="filled"
              prefix={<Mail size={16} className="text-gray-400 mr-2" />} 
              className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mật khẩu</span>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              variant="filled"
              prefix={<Lock size={16} className="text-gray-400 mr-2" />} 
              className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
            />
          </Form.Item>

          <div className="flex justify-end mb-6">
            <Link to="/forgot-password" className="text-[12px] text-gray-400 hover:text-black transition-colors underline underline-offset-4">
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item className="!mt-10">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-transform active:scale-95" 
              loading={loading}
            >
              Tiến vào hệ thống
              <ArrowRight size={16} />
            </Button>
          </Form.Item>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-100"></div>
            <span className="px-4 text-[11px] text-gray-300 uppercase tracking-widest font-bold">Hoặc</span>
            <div className="flex-1 border-t border-gray-100"></div>
          </div>

          <Button 
            className="w-full h-14 bg-white text-black border-2 border-gray-100 hover:!border-black rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
            onClick={async () => {
              try {
                const res = await api.get('/auth/google-url');
                window.location.href = res.data.data.url;
              } catch (error) {
                message.error('Không thể kết nối với dịch vụ Google!');
              }
            }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-1" />
            Tiếp tục với Google
          </Button>
        </Form>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <Text className="text-gray-400 text-[13px]">Bạn chưa là thành viên?</Text>
          <div className="mt-4">
            <Link 
              to="/register" 
              className="text-black font-black uppercase text-[12px] tracking-widest hover:underline underline-offset-8 transition-all"
            >
              Tạo tài khoản ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

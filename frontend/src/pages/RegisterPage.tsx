import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Xử lý Đăng ký ban đầu
  const onRegister = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      message.success('Tài khoản đã được tạo! Vui lòng xác thực mã 6 số.');
      // Chuyển hướng sang trang OTP dùng chung
      navigate(`/verify-otp?email=${values.email}`);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Đăng ký không thành công, vui lòng kiểm tra lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-left">
          <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">
            Tham gia ngay
          </Title>
          <div className="flex flex-col gap-1">
            <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">
              Khởi đầu hành trình cùng Elite
            </Text>
            <div className="w-12 h-1 bg-black mt-2" />
          </div>
        </div>

        <Form
          layout="vertical"
          onFinish={onRegister}
          requiredMark={false}
          size="large"
          className="space-y-4"
        >
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Họ và tên</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
          >
            <Input 
              variant="filled"
              prefix={<User size={16} className="text-gray-400 mr-2" />} 
              className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ Email</span>}
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
            rules={[
              { required: true, message: 'Vui lòng đặt mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
            ]}
          >
            <Input.Password 
              variant="filled"
              prefix={<Lock size={16} className="text-gray-400 mr-2" />} 
              className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
            />
          </Form.Item>

          <Form.Item className="!mt-10">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-transform active:scale-95" 
              loading={loading}
            >
              Tạo tài khoản
              <ArrowRight size={16} />
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <Text className="text-gray-400 text-[13px]">Bạn đã có tài khoản?</Text>
          <div className="mt-4">
            <Link 
              to="/login" 
              className="text-black font-black uppercase text-[12px] tracking-widest hover:underline underline-offset-8 transition-all"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

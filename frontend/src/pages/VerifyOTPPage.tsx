import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const VerifyOTPPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      message.error('Thiếu thông tin Email để xác thực!');
      navigate('/login');
    }
  }, [email, navigate]);

  // Bộ đếm ngược cho nút Gửi lại mã
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 1. Xử lý Xác thực mã OTP (6 số)
  const onVerifyOTP = async (values: any) => {
    setLoading(true);
    try {
      await api.get(`/auth/verify-email?token=${values.token}`);
      
      message.success('Xác thực tài khoản thành công! Vui lòng đăng nhập để bắt đầu.');
      
      // Chuyển hướng về trang Login thay vì Trang chủ
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Gửi lại mã
  const onResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setCountdown(60);
      message.success('Mã xác thực mới đã được gửi!');
    } catch (error: any) {
      message.error('Gửi lại mã thất bại, vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20 animate-in fade-in duration-500">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full">
          <ShieldCheck size={40} className="text-black" strokeWidth={1.5} />
        </div>
        
        <div className="mb-10">
          <Title level={1} className="!text-[32px] font-black tracking-tighter uppercase !mb-2">
            Xác thực Elite
          </Title>
          <Text className="text-gray-400 text-[13px] leading-relaxed">
            Chúng tôi vừa gửi mã 6 chữ số đến <br/>
            <span className="text-black font-bold tracking-tight">{email}</span>
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onVerifyOTP}
          requiredMark={false}
          size="large"
          className="space-y-6"
        >
          <Form.Item
            name="token"
            rules={[
              { required: true, message: 'Vui lòng nhập mã xác thực!' },
              { len: 6, message: 'Mã xác thực gồm 6 chữ số!' }
            ]}
          >
            <Input 
              placeholder="000000"
              maxLength={6}
              className="text-center text-[32px] font-black tracking-[0.5em] h-20 bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all rounded-sm placeholder:text-gray-200"
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-transform active:scale-95" 
            loading={loading}
          >
            Xác thực & Khám phá ngay
            <CheckCircle2 size={16} />
          </Button>

          <div className="pt-4 flex flex-col gap-4">
            <Text className="text-gray-400 text-[12px]">
              Chưa nhận được mã?{' '}
              <button 
                type="button"
                onClick={onResend}
                disabled={countdown > 0}
                className={`font-bold transition-all ${countdown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:underline cursor-pointer'}`}
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã ngay'}
              </button>
            </Text>
            
            <Link to="/login" className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors py-2">
              <ArrowLeft size={14} /> Quay lại Đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;

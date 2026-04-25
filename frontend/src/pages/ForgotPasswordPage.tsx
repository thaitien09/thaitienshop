import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', values);
      message.success('Nếu email tồn tại, mã khôi phục đã được gửi!');
      // Điều hướng sang trang Reset Password
      navigate(`/reset-password?email=${values.email}`);
    } catch (error: any) {
      message.error('Có lỗi xảy ra, vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>
        </div>

        <div className="mb-12 text-left">
          <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">
            Quên mật khẩu
          </Title>
          <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">
            Khôi phục quyền truy cập Thai Tien Shop
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
            label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email của bạn</span>}
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
              placeholder="example@gmail.com"
            />
          </Form.Item>

          <Form.Item className="!mt-10">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-transform active:scale-95" 
              loading={loading}
            >
              Gửi mã khôi phục
              <ArrowRight size={16} />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

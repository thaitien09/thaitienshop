import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { Lock, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Bước 1: Nhập mã, Bước 2: Nhập mật khẩu mới
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [form] = Form.useForm();

  const handleNextStep = async () => {
    try {
      const values = await form.validateFields(['token']);
      if (values.token && values.token.length === 6) {
        setStep(2);
      }
    } catch (error) {
      // Form validation handles this
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token: values.token,
        newPassword: values.newPassword
      });
      message.success('Mật khẩu của bạn đã được đổi thành công!');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn!');
      // Nếu sai mã, quay lại bước 1
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-left">
          <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">
            {step === 1 ? 'Xác thực mã' : 'Mật khẩu mới'}
          </Title>
          <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">
            {step === 1 ? 'Nhập mã 6 số gửi đến email của bạn' : 'Thiết lập mật khẩu mới cho tài khoản'}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
          className="space-y-4"
          initialValues={{ email }}
        >
          {/* Bước 1: Nhập mã khôi phục */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email</span>}
            >
              <Input 
                value={email} 
                disabled 
                variant="filled"
                className="bg-gray-100 border-none h-12 rounded-sm"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mã khôi phục (6 số)</span>}
              name="token"
              rules={[{ required: true, message: 'Vui lòng nhập mã khôi phục!' }]}
            >
              <Input 
                variant="filled"
                prefix={<ShieldCheck size={16} className="text-gray-400 mr-2" />} 
                className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm font-mono tracking-[0.5em] text-center text-xl"
                maxLength={6}
                placeholder="000000"
              />
            </Form.Item>

            <Form.Item className="!mt-10">
              <Button 
                type="primary" 
                className="w-full h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3" 
                onClick={handleNextStep}
              >
                Tiếp tục
                <ArrowRight size={16} />
              </Button>
            </Form.Item>
          </div>

          {/* Bước 2: Nhập mật khẩu mới */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mật khẩu mới</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }
              ]}
            >
              <Input.Password 
                variant="filled"
                prefix={<Lock size={16} className="text-gray-400 mr-2" />} 
                className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Xác nhận mật khẩu</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                variant="filled"
                prefix={<Lock size={16} className="text-gray-400 mr-2" />} 
                className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all h-12 rounded-sm"
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item className="!mt-10">
              <div className="flex gap-3">
                <Button 
                  className="h-14 border-black border text-black rounded-sm text-[12px] font-bold uppercase tracking-[0.25em]"
                  onClick={() => setStep(1)}
                >
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="flex-1 h-14 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3" 
                  loading={loading}
                >
                  Cập nhật mật khẩu
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

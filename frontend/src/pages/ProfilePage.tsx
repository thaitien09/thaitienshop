import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Avatar, Space, Tag } from 'antd';
import { User, Mail, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-left">
        <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">
          Tài khoản của tôi
        </Title>
        <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">
          Quản lý thông tin và bảo mật tài khoản
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Info */}
        <div className="md:col-span-1">
          <Card bordered={false} className="shadow-sm rounded-sm text-center py-6">
            <Avatar 
              size={80} 
              className="bg-black mb-4"
              icon={<UserCircle size={40} />}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Title level={4} className="mb-1">{user?.name || 'Thành viên'}</Title>
            <Tag color="black" className="rounded-full px-4 uppercase text-[10px] font-bold tracking-widest mb-4">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </Tag>
            <div className="text-left mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} />
                <span className="text-[13px]">{user?.email}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Change Password */}
        <div className="md:col-span-2">
          <Card 
            title={<span className="text-[14px] font-black uppercase tracking-widest">Đổi mật khẩu</span>}
            bordered={false} 
            className="shadow-sm rounded-sm"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onChangePassword}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mật khẩu hiện tại</span>}
                name="oldPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password 
                  variant="filled"
                  prefix={<Lock size={16} className="text-gray-400 mr-2" />}
                  className="bg-gray-50 border-none h-12 rounded-sm"
                />
              </Form.Item>

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
                  className="bg-gray-50 border-none h-12 rounded-sm"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Xác nhận mật khẩu mới</span>}
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
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
                  className="bg-gray-50 border-none h-12 rounded-sm"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-8">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm h-12 px-10 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  Cập nhật mật khẩu
                  <ArrowRight size={16} />
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

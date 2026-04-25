import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Typography, 
  message, 
  Popconfirm,
  Tag,
  Switch,
  Select,
  Modal,
  Form,
  Input
} from 'antd';
import { 
  UserOutlined, 
  DeleteOutlined, 
  SafetyCertificateOutlined,
  MailOutlined,
  PlusOutlined,
  PhoneOutlined,
  LockOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || res.data);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      message.success('Thay đổi quyền hạn thành công');
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi thay đổi quyền');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('Đã xóa người dùng');
      fetchUsers();
    } catch (error) {
      message.error('Không thể xóa người dùng này');
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      // Sử dụng endpoint register để tạo user mới từ admin
      await api.post('/auth/register', values);
      message.success('Thêm người dùng mới thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (record: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <UserOutlined />
          </div>
          <div>
            <div className="font-bold text-black">{record.name || 'N/A'}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <MailOutlined size={10} /> {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: User) => (
        <Select 
          value={role} 
          onChange={(val) => handleChangeRole(record.id, val)}
          className="w-32"
          bordered={false}
          disabled={record.id === currentUser?.id}
        >
          <Select.Option value="CUSTOMER">Khách hàng</Select.Option>
          <Select.Option value="ADMIN">Quản trị viên</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Xác minh',
      dataIndex: 'isEmailVerified',
      key: 'verified',
      render: (verified: boolean) => (
        verified ? 
        <Tag color="green" icon={<SafetyCertificateOutlined />}>Đã xác minh</Tag> : 
        <Tag color="default">Chưa xác minh</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: User) => (
        <Space size="small">
          <Switch 
            checked={record.isActive} 
            onChange={() => handleToggleStatus(record.id, record.isActive)}
            size="small"
            disabled={record.id === currentUser?.id}
          />
          <Text type={record.isActive ? "success" : "danger"}>
            {record.isActive ? (record.id === currentUser?.id ? "Bạn đang Online" : "Hoạt động") : "Bị khóa"}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: User) => (
        <Popconfirm
          title="Xóa người dùng?"
          description="Hành động này không thể hoàn tác."
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          disabled={record.id === currentUser?.id}
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            disabled={record.id === currentUser?.id}
            title={record.id === currentUser?.id ? "Bạn không thể xóa chính mình" : ""}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Title level={4} className="uppercase tracking-widest font-black">Quản lý người dùng</Title>
          <Text type="secondary">Phân quyền và kiểm soát tài khoản trong hệ thống</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          className="bg-black hover:!bg-gray-800 border-none rounded-sm h-10 uppercase text-[12px] font-bold tracking-widest px-6"
        >
          Thêm người dùng
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm overflow-hidden rounded-sm">
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Input.Search
            placeholder="Tìm tên, email hoặc số điện thoại..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: 350 }}
          />
          <Select 
            value={filterRole} 
            onChange={setFilterRole} 
            style={{ width: 140 }}
          >
            <Option value="all">Tất cả quyền</Option>
            <Option value="ADMIN">Quản trị viên</Option>
            <Option value="CUSTOMER">Khách hàng</Option>
          </Select>
          <Select 
            value={filterActive} 
            onChange={setFilterActive} 
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Đang hoạt động</Option>
            <Option value="inactive">Đã bị khóa</Option>
          </Select>
          <span style={{ lineHeight: '32px', color: '#888', fontSize: 12 }}>
            {users.filter(u => {
              const matchSearch = 
                (u.name && u.name.toLowerCase().includes(searchText.toLowerCase())) || 
                u.email.toLowerCase().includes(searchText.toLowerCase()) ||
                (u.phone && u.phone.includes(searchText));
              const matchRole = filterRole === 'all' || u.role === filterRole;
              const matchActive = filterActive === 'all' 
                ? true 
                : filterActive === 'active' ? u.isActive : !u.isActive;
              return matchSearch && matchRole && matchActive;
            }).length} kết quả
          </span>
        </div>

        <Table 
          columns={columns} 
          dataSource={users.filter(u => {
            const matchSearch = 
              (u.name && u.name.toLowerCase().includes(searchText.toLowerCase())) || 
              u.email.toLowerCase().includes(searchText.toLowerCase()) ||
              (u.phone && u.phone.includes(searchText));
            const matchRole = filterRole === 'all' || u.role === filterRole;
            const matchActive = filterActive === 'all' 
              ? true 
              : filterActive === 'active' ? u.isActive : !u.isActive;
            return matchSearch && matchRole && matchActive;
          })} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={<Title level={4} className="!mb-0 uppercase tracking-widest">Thêm người dùng mới</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          className="mt-6"
          requiredMark={false}
        >
          <Form.Item
            label={<Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Họ và tên</Text>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} className="h-11 rounded-sm" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label={<Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email</Text>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} className="h-11 rounded-sm" placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            label={<Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Số điện thoại</Text>}
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} className="h-11 rounded-sm" placeholder="09xx xxx xxx" />
          </Form.Item>

          <Form.Item
            label={<Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mật khẩu</Text>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="h-11 rounded-sm" placeholder="••••••••" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => setIsModalVisible(false)} className="rounded-sm h-11 px-8 uppercase text-[11px] font-bold tracking-widest">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="bg-black hover:!bg-gray-800 border-none rounded-sm h-11 px-8 uppercase text-[11px] font-bold tracking-widest">
              Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;

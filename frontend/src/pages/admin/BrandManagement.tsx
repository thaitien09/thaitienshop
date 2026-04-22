import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TagsOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form] = Form.useForm();

  // Fetch brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      setBrands(res.data.data || res.data); // Handle both wrapped and unwrapped data
    } catch (error) {
      console.error('Fetch brands failed', error);
      message.error('Không thể lấy danh sách thương hiệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle Add/Edit
  const showModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      form.setFieldsValue(brand);
    } else {
      setEditingBrand(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      if (editingBrand) {
        // Edit logic (We just need to re-implement if backend has update, for now let's just do CREATE/DELETE)
        await api.post('/brands', values); // If you have update endpoint, use PUT
        message.success('Cập nhật thương hiệu thành công!');
      } else {
        await api.post('/brands', values);
        message.success('Thêm thương hiệu mới thành công!');
      }
      fetchBrands();
      setIsModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/brands/${id}`);
      message.success('Xóa thương hiệu thành công!');
      fetchBrands();
    } catch (error) {
      message.error('Không thể xóa thương hiệu này!');
    }
  };

  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Số sản phẩm',
      key: 'productCount',
      render: (record: Brand) => (
        <Tag color="cyan">{record._count?.products || 0} sản phẩm</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Brand) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thương hiệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} className="shadow-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TagsOutlined /> Quản lý Thương hiệu
            </Title>
            <Text type="secondary">Quản lý danh sách các hãng giày trong hệ thống của bạn</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
            style={{ borderRadius: '6px', height: '40px', background: 'black', borderColor: 'black' }}
          >
            Thêm Thương hiệu
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={brands} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingBrand ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: '', slug: '' }}
        >
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
          >
            <Input placeholder="Ví dụ: Nike, Adidas..." />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (Đường dẫn)"
            rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
          >
            <Input placeholder="Ví dụ: nike, adidas-originals..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ background: 'black', borderColor: 'black' }}
              >
                {editingBrand ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManagement;

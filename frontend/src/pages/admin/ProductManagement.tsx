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
  Tag,
  Select,
  InputNumber,
  Upload,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import api, { BASE_URL } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  costPrice: number;
  currentStock: number;
  brandId: string;
  brand?: { name: string };
}

interface Brand {
  id: string;
  name: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [searchText, setSearchText] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ tự động tạo slug khi đang thêm mới (không phải sửa)
    if (!editingProduct) {
      form.setFieldsValue({ slug: convertToSlug(e.target.value) });
    }
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const [prodRes, brandRes] = await Promise.all([
        api.get(`/products?page=${page}&limit=${PAGE_SIZE}`),
        api.get('/brands')
      ]);
      const data = prodRes.data.data || prodRes.data;
      const meta = prodRes.data.meta;
      
      setProducts(data);
      setTotal(meta?.total || data.length);
      setBrands(brandRes.data.data || brandRes.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Mở Modal Thêm mới
  const showAddModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  // Mở Modal Sửa — điền sẵn dữ liệu hiện tại vào form
  const showEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      slug: product.slug,
      description: product.description,
      brandId: product.brandId,
      price: product.price,
    });
    // Nếu có ảnh, hiển thị ảnh hiện tại vào fileList để xem trước
    if (product.image) {
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`,
      }]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('description', values.description || '');
    formData.append('brandId', values.brandId);
    formData.append('price', values.price.toString());

    // Chỉ gắn file mới nếu người dùng chọn file mới (có originFileObj)
    if (fileList[0]?.originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    }

    try {
      setLoading(true);
      if (editingProduct) {
        // CHẾ ĐỘ SỬA: PATCH /products/:id
        await api.patch(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // CHẾ ĐỘ THÊM: POST /products
        formData.append('currentStock', '0');
        formData.append('costPrice', '0');
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Thêm sản phẩm thành công!');
      }
      fetchData(currentPage);
      handleCancel();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Đã xóa sản phẩm!');
      fetchData(currentPage);
    } catch (error) {
      message.error('Không thể xóa sản phẩm!');
    }
  };

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => <Tag color="purple" className="font-mono font-bold uppercase">{sku || 'N/A'}</Tag>,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => (
        <img
          src={img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : 'https://placehold.co/50'}
          alt="product"
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand: any) => brand?.name || 'N/A',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text type="danger" strong>{(price || 0).toLocaleString()}đ</Text>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `Còn ${stock} hộp` : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => showEditModal(record)}
            title="Sửa sản phẩm"
          />
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
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
              <ShoppingOutlined /> Quản lý Kho Sáp
            </Title>
            <Text type="secondary">Danh sách các dòng sáp và tồn kho trong hệ thống</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            style={{ background: 'black', borderColor: 'black' }}
          >
            Thêm Loại Sáp
          </Button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Input.Search
            placeholder="Tìm tên sáp hoặc mã SKU..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <Select 
            value={filterBrand} 
            onChange={setFilterBrand} 
            style={{ width: 160 }}
          >
            <Option value="all">Tất cả thương hiệu</Option>
            {(Array.isArray(brands) ? brands : []).map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
          </Select>
          <Select 
            value={filterStock} 
            onChange={setFilterStock} 
            style={{ width: 140 }}
          >
            <Option value="all">Tất cả tồn kho</Option>
            <Option value="instock">Còn hàng</Option>
            <Option value="outstock">Hết hàng</Option>
            <Option value="lowstock">Sắp hết (&lt; 5)</Option>
          </Select>
          <span style={{ lineHeight: '32px', color: '#888', fontSize: 12 }}>
            {(Array.isArray(products) ? products : []).filter(p => {
              const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchText.toLowerCase()));
              const matchBrand = filterBrand === 'all' || p.brandId === filterBrand;
              const matchStock = filterStock === 'all' 
                ? true 
                : filterStock === 'instock' ? p.currentStock > 0 
                : filterStock === 'outstock' ? p.currentStock <= 0 
                : p.currentStock < 5;
              return matchSearch && matchBrand && matchStock;
            }).length} kết quả
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={(Array.isArray(products) ? products : []).filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchText.toLowerCase()));
            const matchBrand = filterBrand === 'all' || p.brandId === filterBrand;
            const matchStock = filterStock === 'all' 
              ? true 
              : filterStock === 'instock' ? p.currentStock > 0 
              : filterStock === 'outstock' ? p.currentStock <= 0 
              : p.currentStock < 5;
            return matchSearch && matchBrand && matchStock;
          })}
          rowKey="id"
          loading={loading}
          pagination={{ 
            current: currentPage, 
            pageSize: PAGE_SIZE, 
            total: total,
            onChange: (page) => setCurrentPage(page)
          }}
        />
      </Card>

      {/* Modal dùng chung cho Thêm và Sửa */}
      <Modal
        title={
          <span>
            {editingProduct ? (
              <><EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />Sửa sản phẩm: <strong>{editingProduct.name}</strong></>
            ) : (
              <><PlusOutlined style={{ marginRight: 8 }} />Thêm sản phẩm mới</>
            )}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="name" label="Tên loại sáp" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
              <Input placeholder="Ví dụ: Kevin Murphy Rough Rider" onChange={handleNameChange} />
            </Form.Item>
            <Form.Item name="slug" label="Slug (Đường dẫn)" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
              <Input placeholder="Ví dụ: kevin-murphy-rough-rider" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
              <Select placeholder="Chọn thương hiệu">
                {(Array.isArray(brands) ? brands : []).map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="price" label="Giá bán (VND)" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
              <InputNumber 
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                placeholder="Nhập giá bán"
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả sản phẩm">
            <Input.TextArea rows={3} placeholder="Nhập đặc điểm, thông số kỹ thuật..." />
          </Form.Item>

          <Form.Item label={editingProduct ? 'Cập nhật hình ảnh (để trống nếu giữ ảnh cũ)' : 'Hình ảnh sản phẩm'}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>{editingProduct ? 'Đổi ảnh' : 'Chọn ảnh'}</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ background: 'black', borderColor: 'black' }}
              >
                {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  message,
  Select,
  InputNumber,
  Divider,
  Space,
  Tag,
  DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import {
  PlusOutlined,
  HistoryOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ReceiptItem {
  id: string;
  product: { name: string };
  quantity: number;
  costPrice: number;
}

interface Receipt {
  id: string;
  note: string;
  totalCost: number;
  createdAt: string;
  user: { name: string };
  items: ReceiptItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
}

const InventoryManagement: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [receiptRes, productRes] = await Promise.all([
        api.get('/inventory/receipts'),
        api.get('/products?limit=100') // Lấy nhiều sản phẩm để chọn
      ]);
      
      const rData = receiptRes.data.data;
      setReceipts(Array.isArray(rData) ? rData : (rData?.data || []));
      
      const pResponse = productRes.data.data;
      const pData = pResponse?.data || pResponse || [];
      setProducts(Array.isArray(pData) ? pData : []);
    } catch (error) {
      message.error('Không thể tải dữ liệu kho!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const filteredItems = (values.items || []).filter((item: any) => Number(item.quantity) > 0);

      if (filteredItems.length === 0) {
        message.warning('Vui lòng nhập số lượng cho ít nhất một sản phẩm!');
        setLoading(false);
        return;
      }

      await api.post('/inventory/receipts', { ...values, items: filteredItems });
      message.success('Nhập kho thành công!');
      fetchData();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi nhập kho!');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal sửa giá và điền dữ liệu hiện tại
  const openEditModal = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    editForm.setFieldsValue({
      note: receipt.note,
      items: receipt.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        costPrice: item.costPrice,
      })),
    });
    setIsEditVisible(true);
  };

  const onEditFinish = async (values: any) => {
    if (!selectedReceipt) return;
    try {
      setLoading(true);
      await api.patch(`/inventory/receipts/${selectedReceipt.id}`, {
        note: values.note,
        items: values.items.map((item: any) => ({
          id: item.id,
          costPrice: Number(item.costPrice),
        })),
      });
      message.success('Cập nhật phiếu nhập kho thành công!');
      fetchData();
      setIsEditVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="blue">{id ? id.slice(-8).toUpperCase() : 'N/A'}</Tag>,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Quản trị viên',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => <Tag color="orange">{user?.name || 'Admin'}</Tag>,
    },
    {
      title: 'Tổng tiền vốn',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (price: number) => <Text type="danger" strong>{(price || 0).toLocaleString()}đ</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Receipt) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={async () => {
              try {
                const res = await api.get(`/inventory/receipts/${record.id}`);
                setSelectedReceipt(res.data.data || res.data);
                setIsDetailVisible(true);
              } catch (err) {
                message.error('Không thể tải chi tiết phiếu!');
              }
            }}
          >
            Chi tiết
          </Button>
          <Button
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => openEditModal(record)}
          >
            Sửa giá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 md:p-6">
      <Card bordered={false}>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          <div>
            <Title level={4} className="!m-0 flex items-center gap-2"><HistoryOutlined /> Nhật ký Nhập kho</Title>
            <Text type="secondary" className="text-xs">Quản lý các đợt nhập hàng và điều chỉnh tồn kho</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="bg-black border-black h-10 uppercase text-[11px] font-bold tracking-widest w-full md:w-auto"
          >
            Tạo Phiếu Nhập
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Input.Search
            placeholder="Tìm ghi chú hoặc người nhập..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full md:max-w-[300px]"
          />
          <RangePicker 
            onChange={(dates) => setDateRange(dates as any)}
            placeholder={['Từ ngày', 'Đến ngày']}
            className="w-full md:w-[280px]"
          />
          <span style={{ lineHeight: '32px', color: '#888', fontSize: 12 }}>
            {receipts.filter(r => {
              const matchSearch = 
                (r.note && r.note.toLowerCase().includes(searchText.toLowerCase())) || 
                (r.user?.name && r.user.name.toLowerCase().includes(searchText.toLowerCase()));
              
              let matchDate = true;
              if (dateRange && dateRange[0] && dateRange[1]) {
                const rDate = dayjs(r.createdAt);
                matchDate = rDate.isAfter(dateRange[0].startOf('day')) && rDate.isBefore(dateRange[1].endOf('day'));
              }
              return matchSearch && matchDate;
            }).length} kết quả
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={receipts.filter(r => {
            const matchSearch = 
              (r.note && r.note.toLowerCase().includes(searchText.toLowerCase())) || 
              (r.user?.name && r.user.name.toLowerCase().includes(searchText.toLowerCase()));
            
            let matchDate = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
              const rDate = dayjs(r.createdAt);
              matchDate = rDate.isAfter(dateRange[0].startOf('day')) && rDate.isBefore(dateRange[1].endOf('day'));
            }
            return matchSearch && matchDate;
          })}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 8, size: 'small' }}
        />
      </Card>

      {/* Modal Tạo Phiếu Nhập */}
      <Modal
        title="Tạo Phiếu Nhập hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        className="responsive-modal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="note" label="Ghi chú đợt nhập">
            <Input.TextArea placeholder="Ví dụ: Nhập hàng từ Reuzel tháng 4" rows={2} />
          </Form.Item>

          <Divider>Danh sách Sản phẩm Nhập</Divider>

          <Form.List name="items" initialValue={[{ quantity: 1 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    size="small"
                    key={key}
                    className="mb-4 rounded-lg border-gray-100 shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_80px_1fr_auto] gap-4 items-start">
                      <Form.Item
                        {...restField}
                        name={[name, 'productId']}
                        label={<Text strong style={{ fontSize: 12 }}>Sản phẩm</Text>}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select 
                          showSearch 
                          placeholder="Chọn sản phẩm" 
                          optionFilterProp="children"
                          size="large"
                        >
                          {products.map(p => (
                            <Option key={p.id} value={p.id}>
                              {p.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label={<Text strong style={{ fontSize: 12 }}>SL</Text>}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} size="large" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'costPrice']}
                        label={<Text strong style={{ fontSize: 12 }}>Giá nhập (VND)</Text>}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                          placeholder="0"
                        />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        className="md:mt-8"
                      />
                    </div>

                    <Form.Item shouldUpdate={(prev, curr) => prev.items?.[name] !== curr.items?.[name]} noStyle>
                      {({ getFieldValue }) => {
                        const productId = getFieldValue(['items', name, 'productId']);
                        const costPrice = getFieldValue(['items', name, 'costPrice']) || 0;
                        const product = products.find(p => p.id === productId);
                        
                        if (!product) return null;

                        const profit = product.price - costPrice;
                        const margin = costPrice > 0 ? ((profit / product.price) * 100).toFixed(1) : 0;

                        return (
                          <div style={{ 
                            marginTop: 12, 
                            padding: '8px 12px', 
                            background: '#f9f9f9', 
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Space split={<Divider type="vertical" />}>
                              <span>
                                <Text type="secondary">Giá bán lẻ: </Text>
                                <Text strong style={{ color: '#52c41a' }}>{product.price.toLocaleString()}đ</Text>
                              </span>
                              <span>
                                <Text type="secondary">Lợi nhuận: </Text>
                                <Text strong style={{ color: profit > 0 ? '#1890ff' : '#ff4d4f' }}>
                                  {profit.toLocaleString()}đ
                                </Text>
                              </span>
                            </Space>
                            
                            {costPrice > 0 && (
                              <Tag color={Number(margin) > 20 ? 'green' : 'orange'} style={{ borderRadius: 4 }}>
                                Tỷ suất: {margin}%
                              </Tag>
                            )}
                          </div>
                        );
                      }}
                    </Form.Item>
                  </Card>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm sản phẩm vào phiếu
                  </Button>
                </Form.Item>

                <Form.Item shouldUpdate={(prev, curr) => prev.items !== curr.items}>
                  {({ getFieldValue }) => {
                    const items = getFieldValue('items') || [];
                    const total = items.reduce((sum: number, item: any) => {
                      const q = Number(item?.quantity || 0);
                      const p = Number(item?.costPrice || 0);
                      return sum + (q * p);
                    }, 0 as number);

                    return (
                      <div style={{ 
                        textAlign: 'right', 
                        marginTop: '24px', 
                        padding: '20px', 
                        background: '#000', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>TỔNG TIỀN VỐN ĐỢT NHẬP: </Text>
                        <br />
                        <Text strong style={{ color: '#fff', fontSize: '28px' }}>{total.toLocaleString()}đ</Text>
                      </div>
                    );
                  }}
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: 'black', borderColor: 'black' }}>
                Xác nhận Nhập kho
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi tiết Phiếu */}
      <Modal
        title="Chi tiết Phiếu Nhập"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {selectedReceipt && (
          <div>
            <p><strong>Người nhập:</strong> {selectedReceipt?.user?.name || 'Admin'}</p>
            <p><strong>Thời gian:</strong> {selectedReceipt?.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
            <p><strong>Ghi chú:</strong> {selectedReceipt?.note || 'Không có'}</p>
            <Divider />
            <Table
              dataSource={selectedReceipt?.items || []}
              pagination={false}
              rowKey="id"
              scroll={{ x: 500 }}
              columns={[
                { title: 'Sản phẩm', render: (item: ReceiptItem) => item?.product?.name || 'N/A' },
                { title: 'Số lượng', dataIndex: 'quantity' },
                { title: 'Giá vốn', dataIndex: 'costPrice', render: (p) => `${(p || 0).toLocaleString()}đ` },
                { title: 'Thành tiền', render: (item: ReceiptItem) => `${((item?.quantity || 0) * (item?.costPrice || 0)).toLocaleString()}đ` },
              ]}
              footer={() => (
                <div className="text-right">
                  <Text strong>Tổng cộng: </Text>
                  <Text type="danger" strong className="text-lg">
                    {(selectedReceipt?.totalCost || 0).toLocaleString()}đ
                  </Text>
                </div>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Modal Sửa giá nhập */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Sửa giá nhập — Phiếu #{selectedReceipt?.id?.slice(-8).toUpperCase()}
          </span>
        }
        open={isEditVisible}
        onCancel={() => setIsEditVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={onEditFinish}>
          <Form.Item name="note" label="Ghi chú đợt nhập">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider>Chỉnh giá vốn từng sản phẩm</Divider>

          <Form.List name="items">
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} className="mb-3 bg-gray-50 border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 items-end">
                      {/* Hidden id field */}
                      <Form.Item {...restField} name={[name, 'id']} hidden><Input /></Form.Item>

                      <Form.Item {...restField} name={[name, 'productName']} label="Sản phẩm">
                        <Input disabled />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, 'quantity']} label="Số lượng">
                        <InputNumber disabled style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'costPrice']}
                        label="Giá vốn mới (VND)"
                        rules={[{ required: true, message: 'Nhập giá vốn' }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <Text type="warning" strong>⚠️ Lưu ý:</Text>
            <Text type="secondary"> Thay đổi giá vốn sẽ tự động cập nhật giá vốn trung bình của sản phẩm và ảnh hưởng đến thống kê lợi nhuận.</Text>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsEditVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: 'black', borderColor: 'black' }}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;

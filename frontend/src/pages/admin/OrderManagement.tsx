import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Typography, Card, Select, message, Modal, Divider, Badge, Input } from 'antd';
import { ShoppingBag, Eye, CheckCircle, Truck, XCircle, Clock, MapPin, Phone, User, Mail } from 'lucide-react';
import api, { BASE_URL } from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${page}&limit=${PAGE_SIZE}`);
      const data = res.data.data || res.data;
      const meta = res.data.meta;
      
      setOrders(data);
      setTotal(meta?.total || data.length);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchOrders(currentPage);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const showDetail = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      'PENDING': { color: 'orange', text: 'Chờ xác nhận', icon: <Clock size={14} /> },
      'SHIPPING': { color: 'blue', text: 'Đang giao', icon: <Truck size={14} /> },
      'DELIVERED': { color: 'green', text: 'Đã giao', icon: <CheckCircle size={14} /> },
      'CANCELLED': { color: 'red', text: 'Đã hủy', icon: <XCircle size={14} /> },
    };
    return configs[status] || { color: 'default', text: status, icon: null };
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      key: 'orderCode',
      render: (_: any, record: any) => (
        <Text className="font-bold cursor-pointer hover:text-blue-500" onClick={() => showDetail(record)}>
          {record.orderCode || `#${record.id.slice(-8).toUpperCase()}`}
        </Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.customerName}</Text>
          <Text type="secondary" className="text-[12px]">{record.customerPhone}</Text>
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => <Text strong>{amount.toLocaleString()}đ</Text>,
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon} className="rounded-full px-3 uppercase text-[10px] font-bold tracking-widest">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<Eye size={16} />}
            onClick={() => showDetail(record)}
            className="flex items-center gap-1"
          >
            Chi tiết
          </Button>
          <Select
            value={record.status}
            style={{ width: 150 }}
            onChange={(val) => handleUpdateStatus(record.id, val)}
            className="status-select"
          >
            <Option value="PENDING">Chờ xác nhận</Option>
            <Option value="SHIPPING">Đang giao</Option>
            <Option value="DELIVERED">Đã giao</Option>
            <Option value="CANCELLED">Hủy đơn</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <Title level={2} className="!text-[32px] font-black tracking-tighter uppercase mb-2">Quản lý đơn hàng</Title>
          <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">Quản lý và xử lý đơn hàng từ khách hàng</Text>
        </div>
        <Badge count={orders.filter(o => o.status === 'PENDING').length} offset={[10, 0]}>
          <Button
            icon={<ShoppingBag size={18} />}
            onClick={() => fetchOrders(currentPage)}
            className="h-12 px-6 rounded-sm font-bold uppercase text-[11px] tracking-widest flex items-center gap-2"
          >
            Làm mới danh sách
          </Button>
        </Badge>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag /> Danh sách đơn hàng
          </Title>
          <Text type="secondary">Theo dõi và cập nhật trạng thái đơn hàng từ khách hàng</Text>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Input.Search
            placeholder="Tìm mã đơn, tên hoặc số điện thoại..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: 350 }}
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 180 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="PENDING">Chờ xác nhận</Option>
            <Option value="SHIPPING">Đang giao</Option>
            <Option value="DELIVERED">Đã giao</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <span style={{ lineHeight: '32px', color: '#888', fontSize: 12 }}>
            {orders.filter(o => {
              const matchSearch =
                (o.orderCode?.toLowerCase().includes(searchText.toLowerCase())) ||
                (o.customerName && o.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
                (o.customerPhone && o.customerPhone.includes(searchText));
              const matchStatus = filterStatus === 'all' || o.status === filterStatus;
              return matchSearch && matchStatus;
            }).length} kết quả
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={orders.filter(o => {
            const matchSearch =
              (o.orderCode?.toLowerCase().includes(searchText.toLowerCase())) ||
              (o.customerName && o.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
              (o.customerPhone && o.customerPhone.includes(searchText));
            const matchStatus = filterStatus === 'all' || o.status === filterStatus;
            return matchSearch && matchStatus;
          })}
          rowKey="id"
          loading={loading}
          pagination={{ 
            current: currentPage, 
            pageSize: PAGE_SIZE, 
            total: total,
            onChange: (page) => setCurrentPage(page)
          }}
          className="admin-table"
        />
      </Card>

      {/* Chi tiết đơn hàng Modal */}
      <Modal
        title={<Title level={4} className="!mb-0 uppercase tracking-widest">Chi tiết đơn hàng {selectedOrder?.orderCode || `#${selectedOrder?.id?.slice(-8).toUpperCase()}`}</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
          <Button
            key="print"
            type="primary"
            className="bg-black"
            onClick={() => window.print()}
          >
            In hóa đơn
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                  <User size={14} /> Thông tin khách hàng
                </div>
                <div className="bg-gray-50 p-4 rounded-sm space-y-2">
                  <div className="flex justify-between">
                    <Text type="secondary">Tên:</Text>
                    <Text strong>{selectedOrder.customerName}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">SĐT:</Text>
                    <Text strong>{selectedOrder.customerPhone}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Email:</Text>
                    <Text strong>{selectedOrder.customerEmail || 'N/A'}</Text>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                  <MapPin size={14} /> Địa chỉ giao hàng
                </div>
                <div className="bg-gray-50 p-4 rounded-sm space-y-2">
                  <Paragraph strong className="mb-1">{selectedOrder.addressDetail}</Paragraph>
                  <Paragraph className="mb-0">{selectedOrder.ward}, {selectedOrder.district}, {selectedOrder.province}</Paragraph>
                  <Divider className="my-2" />
                  <Text type="secondary" className="text-[12px]">Ghi chú: {selectedOrder.note || 'Không có'}</Text>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                <ShoppingBag size={14} /> Danh sách sản phẩm
              </div>
              <div className="border border-gray-100 rounded-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3 text-center">Số lượng</th>
                      <th className="px-4 py-3 text-right">Đơn giá</th>
                      <th className="px-4 py-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <Space>
                            <img
                              src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`) : 'https://placehold.co/50x50'}
                              className="w-10 h-10 object-contain rounded-sm"
                              alt=""
                            />
                            <Text strong className="text-[13px]">{item.product.name}</Text>
                          </Space>
                        </td>
                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                        <td className="px-4 py-4 text-right">{item.price.toLocaleString()}đ</td>
                        <td className="px-4 py-4 text-right font-bold">{(item.price * item.quantity).toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-black">
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-right uppercase text-[11px] tracking-widest">Tổng cộng</td>
                      <td className="px-4 py-4 text-right text-[16px]">{selectedOrder.totalAmount.toLocaleString()}đ</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Status Update in Modal */}
            <div className="mt-8 flex justify-end gap-4">
              <Select
                value={selectedOrder.status}
                style={{ width: 200 }}
                onChange={(val) => handleUpdateStatus(selectedOrder.id, val)}
              >
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="SHIPPING">Đang giao</Option>
                <Option value="DELIVERED">Đã giao</Option>
                <Option value="CANCELLED">Hủy đơn</Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;

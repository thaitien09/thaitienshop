import React, { useEffect, useState } from 'react';
import { Typography, Card, Space, Button, Skeleton, Empty, Divider, message, Modal, Steps, Pagination } from 'antd';
import { ClockCircleOutlined, CarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Package, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';

const { Title, Text } = Typography;

interface OrderItem {
  id: string;
  product: {
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  province: string;
  district: string;
  ward: string;
  items: OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/my-orders?page=${page}&limit=${PAGE_SIZE}`);
      const data = res.data.data || res.data;
      const meta = res.data.meta;
      
      setOrders(data);
      setTotal(meta?.total || data.length);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleCancelOrder = (orderId: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Hủy đơn',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.post(`/orders/${orderId}/cancel`);
          message.success('Đã hủy đơn hàng thành công');
          fetchOrders(currentPage);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
      },
    });
  };

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'SHIPPING': return 1;
      case 'DELIVERED': return 2;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-4 text-center">
        <Empty
          image={<Package size={64} className="mx-auto text-gray-200 mb-6" />}
          description={
            <div className="space-y-4">
              <Title level={3} className="!font-black tracking-tighter uppercase">Chưa có đơn hàng</Title>
              <Text className="text-gray-400 block pb-8 italic">Bạn chưa đặt đơn hàng nào tại Thai Tien Shop.</Text>
              <Link to="/">
                <Button type="primary" size="large" className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm px-12 h-14 text-[12px] font-bold uppercase tracking-widest">
                  Mua sắm ngay
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-20 px-4">
      <div className="mb-12">
        <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">Lịch sử đơn hàng</Title>
        <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">Theo dõi các đơn hàng đã đặt của bạn</Text>
      </div>

      <div className="space-y-12">
        {orders.map((order) => (
          <Card 
            key={order.id} 
            className="hover:border-black transition-all rounded-sm shadow-sm overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            {/* Header đơn hàng */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100 gap-4">
              <Space size="large" className="flex-wrap">
                <div>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Mã đơn hàng</Text>
                  <Text className="font-bold text-black">{order.orderCode || `#${order.id.slice(-8).toUpperCase()}`}</Text>
                </div>
                <div>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Ngày đặt</Text>
                  <Text className="font-medium text-gray-600">{new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                </div>
                <div>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tổng tiền</Text>
                  <Text className="font-black text-black">{order.totalAmount.toLocaleString()}đ</Text>
                </div>
              </Space>
              
              {order.status === 'CANCELLED' && (
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-[10px] tracking-widest">
                  <CloseCircleOutlined /> Đã hủy đơn hàng
                </div>
              )}
            </div>

            {/* Thanh tiến độ Steps (Ẩn nếu đã hủy) */}
            {order.status !== 'CANCELLED' && (
              <div className="px-6 py-8 border-b border-gray-50">
                <Steps
                  size="small"
                  current={getStepStatus(order.status)}
                  items={[
                    { title: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
                    { title: 'Đang giao hàng', icon: <CarOutlined /> },
                    { title: 'Đã giao thành công', icon: <CheckCircleOutlined /> },
                  ]}
                  className="max-w-3xl mx-auto"
                />
              </div>
            )}

            {/* Danh sách sản phẩm */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-sm p-2 flex-shrink-0 border border-gray-100">
                        <img 
                          src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${BASE_URL}${item.product.image}`) : 'https://placehold.co/100x100'} 
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <Text className="font-bold text-[14px] block group-hover:text-gray-500 transition-colors uppercase tracking-tight">{item.product.name}</Text>
                        <Text className="text-[12px] text-gray-400">Số lượng: {item.quantity} x {item.price.toLocaleString()}đ</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Divider className="my-6 border-gray-100" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={14} />
                  <Text className="text-[12px] italic">Giao đến: {order.ward}, {order.province}</Text>
                </div>
                
                {order.status === 'PENDING' && (
                  <Button 
                    danger 
                    type="text" 
                    className="text-[11px] font-bold uppercase tracking-widest p-0 h-auto hover:bg-transparent"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Phân trang */}
      {total > PAGE_SIZE && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <Text className="text-[12px] text-gray-400 uppercase tracking-widest">
            Trang {currentPage} / {Math.ceil(total / PAGE_SIZE)}
          </Text>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
            className="[&_.ant-pagination-item-active]:bg-black [&_.ant-pagination-item-active]:border-black [&_.ant-pagination-item-active_a]:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;

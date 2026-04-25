import React from 'react';
import { Typography, Button, Table, InputNumber, Space, Empty, Card, Divider, message } from 'antd';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để tiến hành thanh toán!');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <Empty
          image={<ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />}
          imageStyle={{ height: 100 }}
          description={
            <div className="space-y-4">
              <Title level={3} className="!font-black tracking-tighter uppercase">Giỏ hàng trống</Title>
              <Text className="text-gray-400 block pb-8 italic">Bạn chưa chọn được mẫu sáp nào tại Thai Tien Shop?</Text>
              <Link to="/">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm px-12 h-14 text-[12px] font-bold uppercase tracking-widest"
                >
                  Khám phá ngay
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const columns = [
    {
      title: <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>,
      key: 'product',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-6 py-4">
          <div className="w-20 h-20 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0 p-2">
            <img 
              src={record.image ? (record.image.startsWith('http') ? record.image : `${BASE_URL}${record.image}`) : 'https://placehold.co/100x100?text=No+Image'} 
              alt={record.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{record.brandName}</Text>
            <Link to={`/products/${record.id}`}>
                <Text className="text-[14px] font-bold text-black hover:text-gray-500 uppercase tracking-tight block leading-tight">{record.name}</Text>
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Giá</span>,
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text className="text-[14px] font-medium">{price.toLocaleString()}đ</Text>
      ),
    },
    {
      title: <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Số lượng</span>,
      key: 'quantity',
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(val) => updateQuantity(record.id, val || 1)}
          className="rounded-sm border-gray-100"
        />
      ),
    },
    {
      title: <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Thành tiền</span>,
      key: 'subtotal',
      render: (_: any, record: any) => (
        <Text className="text-[14px] font-black">{(record.price * record.quantity).toLocaleString()}đ</Text>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          danger 
          icon={<Trash2 size={18} />} 
          onClick={() => removeFromCart(record.id)}
          className="hover:bg-red-50 flex items-center justify-center rounded-full w-10 h-10"
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">Giỏ hàng</Title>
        <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">{totalItems} Sản phẩm trong túi đồ của bạn</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Table Area */}
        <div className="lg:col-span-2">
          <Table 
            columns={columns} 
            dataSource={cart} 
            rowKey="id" 
            pagination={false}
            className="cart-table border-t border-gray-100"
          />
          <div className="mt-12">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest">
              <ArrowLeft size={14} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Summary Area */}
        <div className="lg:col-span-1">
          <Card bordered={false} className="bg-[#f9fafb] rounded-sm p-4 sticky top-32">
            <Title level={4} className="!text-[14px] font-black uppercase tracking-widest !mb-8">Tổng kết đơn hàng</Title>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <Text className="text-gray-500 text-[13px]">Tạm tính ({totalItems} món)</Text>
                <Text className="font-medium text-[13px]">{totalPrice.toLocaleString()}đ</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500 text-[13px]">Phí vận chuyển</Text>
                <Text className="text-green-500 text-[11px] font-bold uppercase tracking-widest">Miễn phí</Text>
              </div>
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="flex justify-between items-baseline mb-10">
              <Text className="text-[14px] font-black uppercase tracking-widest">Tổng cộng</Text>
              <Text className="text-[24px] font-black tracking-tight">{totalPrice.toLocaleString()}đ</Text>
            </div>

            <Button 
              type="primary" 
              block 
              size="large"
              onClick={handleCheckout}
              className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm h-16 text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3"
            >
              Tiến hành thanh toán
              <ArrowRight size={18} />
            </Button>

            <div className="mt-8 text-center">
              <Text className="text-[10px] text-gray-400 uppercase tracking-widest block italic">
                Sản phẩm chính hãng — Chất lượng đẳng cấp
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

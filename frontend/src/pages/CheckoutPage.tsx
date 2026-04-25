import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Select, Button, Card, Divider, Space, message, Steps } from 'antd';
import { ShoppingCart, MapPin, Phone, User, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "https://34tinhthanh.com/api/";

const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');

  // 0. Kiểm tra giỏ hàng trống
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/');
    }
  }, [cart, navigate, orderSuccess]);

  // 1. Tải danh sách Tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch(`${API_BASE}provinces`);
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        message.error("Lỗi tải danh sách tỉnh thành");
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Tự động điền thông tin khi User load xong
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
      });
    }
  }, [user, form]);

  // 2. Tải danh sách Phường/Xã khi chọn Tỉnh
  const handleProvinceChange = async (pCode: string) => {
    form.setFieldsValue({ ward: undefined });
    setWards([]);
    setLoadingWards(true);
    try {
      const res = await fetch(`${API_BASE}wards?province_code=${pCode}`);
      const data = await res.json();
      setWards(data);
    } catch (err) {
      message.error("Lỗi tải danh sách phường xã");
    } finally {
      setLoadingWards(false);
    }
  };

  // 3. Xử lý đặt hàng
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const provinceName = provinces.find(p => p.province_code === values.province)?.name;
      const wardName = wards.find(w => w.ward_code === values.ward)?.ward_name;

      const orderPayload = {
        ...values,
        province: provinceName,
        district: 'Toàn quốc',
        ward: wardName,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await api.post('/orders', orderPayload);
      const orderData = res.data.data || res.data;
      
      setOrderSuccess(orderData.orderCode);
      clearCart();
      message.success('Đặt hàng thành công!');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <Title level={1} className="!text-[32px] font-black uppercase tracking-tighter mb-4">Đặt hàng thành công!</Title>
        <Text className="text-gray-500 block mb-12">Mã đơn hàng: <span className="font-bold text-black">#{orderSuccess}</span>. Thai Tien Shop sẽ sớm liên hệ xác nhận đơn hàng của bạn qua điện thoại.</Text>
        <Link to="/">
          <Button type="primary" size="large" className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm px-12 h-14 text-[12px] font-bold uppercase tracking-widest">
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest mb-8">
          <ArrowLeft size={14} /> Quay lại giỏ hàng
        </Link>
        <Title level={1} className="!text-[40px] font-black tracking-tighter uppercase !mb-2">Thanh toán</Title>
        <Text className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">Hoàn tất đơn hàng của bạn</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="grid grid-cols-1 lg:grid-cols-3 gap-16"
      >
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm font-bold text-[12px]">1</div>
              <Title level={4} className="!mb-0 uppercase tracking-widest !text-[16px] font-black">Thông tin giao hàng</Title>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Họ và tên</span>}
                name="customerName"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
              >
                <Input prefix={<User size={16} className="text-gray-400 mr-2" />} className="h-12 bg-gray-50 border-none rounded-sm" placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Số điện thoại</span>}
                name="customerPhone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<Phone size={16} className="text-gray-400 mr-2" />} className="h-12 bg-gray-50 border-none rounded-sm" placeholder="09xx xxx xxx" />
              </Form.Item>
            </div>
            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email (Không bắt buộc)</span>}
              name="customerEmail"
            >
              <Input className="h-12 bg-gray-50 border-none rounded-sm" placeholder="email@example.com" />
            </Form.Item>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm font-bold text-[12px]">2</div>
              <Title level={4} className="!mb-0 uppercase tracking-widest !text-[16px] font-black">Địa chỉ nhận hàng</Title>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tỉnh / Thành phố</span>}
                name="province"
                rules={[{ required: true, message: 'Chọn tỉnh thành' }]}
              >
                <Select 
                  placeholder="Chọn Tỉnh / Thành phố" 
                  className="h-12 checkout-select" 
                  onChange={handleProvinceChange}
                  loading={loadingProvinces}
                >
                  {provinces.map(p => (
                    <Option key={p.province_code} value={p.province_code}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phường / Xã</span>}
                name="ward"
                rules={[{ required: true, message: 'Chọn phường xã' }]}
              >
                <Select 
                  placeholder="Chọn Phường / Xã" 
                  className="h-12 checkout-select"
                  loading={loadingWards}
                  disabled={wards.length === 0}
                >
                  {wards.map(w => (
                    <Option key={w.ward_code} value={w.ward_code}>{w.ward_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Form.Item
              label={<span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ chi tiết (Số nhà, tên đường...)</span>}
              name="addressDetail"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
            >
              <Input.TextArea rows={3} className="bg-gray-50 border-none rounded-sm" placeholder="Ví dụ: 123 Đường ABC, Phường X..." />
            </Form.Item>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm font-bold text-[12px]">3</div>
              <Title level={4} className="!mb-0 uppercase tracking-widest !text-[16px] font-black">Phương thức thanh toán</Title>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="cursor-default rounded-sm border-2 border-black"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <Text className="font-bold text-[13px]">COD</Text>
                      <Text className="text-gray-400 text-[11px] block">Thanh toán khi nhận hàng</Text>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-black bg-black"></div>
                </div>
              </Card>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <Card bordered={false} className="bg-[#f9fafb] rounded-sm p-4 sticky top-32">
            <Title level={4} className="!text-[14px] font-black uppercase tracking-widest !mb-8">Đơn hàng của bạn</Title>
            
            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-sm p-1 border border-gray-100 flex-shrink-0">
                      <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:1102${item.image}`) : 'https://placehold.co/50x50'} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <Text className="text-[12px] font-bold line-clamp-1 w-32">{item.name}</Text>
                      <Text className="text-[11px] text-gray-400 uppercase tracking-widest">SL: {item.quantity}</Text>
                    </div>
                  </div>
                  <Text className="text-[12px] font-bold">{(item.price * item.quantity).toLocaleString()}đ</Text>
                </div>
              ))}
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <Text className="text-gray-500 text-[13px]">Tạm tính</Text>
                <Text className="font-medium text-[13px]">{totalPrice.toLocaleString()}đ</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500 text-[13px]">Vận chuyển</Text>
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
              htmlType="submit"
              loading={submitting}
              className="bg-black text-white hover:!bg-gray-800 border-none rounded-sm h-16 text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3"
            >
              Xác nhận đặt hàng
              <ShoppingCart size={18} />
            </Button>
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default CheckoutPage;

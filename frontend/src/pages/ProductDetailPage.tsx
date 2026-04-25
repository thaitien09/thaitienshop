import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Space, Typography, Tag, message, Skeleton, Divider } from 'antd';
import { ShoppingCart, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';

const { Title, Text, Paragraph } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  sku: string;
  currentStock: number;
  brand: {
    name: string;
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data || res.data);
      } catch (error) {
        message.error('Không thể tải thông tin sản phẩm!');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <Skeleton.Image className="!w-full !h-[600px]" active />
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Title level={2}>Sản phẩm không tồn tại</Title>
        <Link to="/">
          <Button type="primary" ghost icon={<ArrowLeft size={16} />}>Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Breadcrumb / Back Link */}
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        {/* Left: Image Container */}
        <div className="bg-white border border-gray-50 rounded-sm overflow-hidden aspect-square flex items-center justify-center p-12">
          <img
            src={product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : 'https://placehold.co/600x600?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right: Info Container */}
        <div className="flex flex-col justify-start">
          <div className="space-y-2 mb-8">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.3em]">{product.brand?.name}</Text>
            <Title level={1} className="!text-[32px] md:!text-[48px] font-black tracking-tighter uppercase !mb-0">
              {product.name}
            </Title>
            <div className="flex items-center gap-4">
              <Text className="text-[24px] font-black tracking-tight">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </Text>
              <Tag color={product.currentStock > 0 ? 'success' : 'error'} className="border-none rounded-full px-3 uppercase text-[10px] font-bold tracking-widest">
                {product.currentStock > 0 ? 'Còn hàng' : 'Hết hàng'}
              </Tag>
            </div>
          </div>

          <Divider className="my-8" />

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Mã sản phẩm:</Text>
              <Text className="text-[11px] font-bold tracking-widest text-black">{product.sku}</Text>
            </div>

            <div>
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-3">Mô tả sản phẩm</Text>
              <Paragraph className="text-gray-500 text-[15px] leading-relaxed">
                {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
              </Paragraph>
            </div>



            {/* Actions */}
            <div className="pt-8 flex flex-col gap-4">
              <Button
                type="primary"
                size="large"
                disabled={product.currentStock <= 0}
                className="w-full h-16 bg-black text-white hover:!bg-gray-800 border-none rounded-sm text-[12px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart size={18} />
                {product.currentStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Button>
              <Button
                size="large"
                icon={<Heart size={18} />}
                className="w-full h-16 border-2 border-gray-100 hover:!border-black rounded-sm text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
              >
                Yêu thích
              </Button>
            </div>

            {/* Perks */}
            <div className="pt-12 grid grid-cols-1 gap-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Truck size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <Text className="text-[11px] font-bold uppercase tracking-widest block">Giao hàng siêu tốc</Text>
                  <Text className="text-[11px] text-gray-400">Nhận hàng trong 2h tại TP.HCM</Text>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <RotateCcw size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <Text className="text-[11px] font-bold uppercase tracking-widest block">Đổi trả 7 ngày</Text>
                  <Text className="text-[11px] text-gray-400">Yên tâm mua sắm với chính sách đổi trả linh hoạt</Text>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <ShieldCheck size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <Text className="text-[11px] font-bold uppercase tracking-widest block">Cam kết chính hãng 100%</Text>
                  <Text className="text-[11px] text-gray-400">Hoàn tiền 200% nếu phát hiện hàng giả</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, message } from 'antd';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import api from '../services/api';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export const HomePage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState('Tất cả');
  const [loading, setLoading] = useState(false);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brands');
        setBrands(res.data.data || res.data);
      } catch (error) {
        console.error('Fetch brands failed', error);
      }
    };
    fetchBrands();
  }, []);

  // Dữ liệu sẽ được lấy từ API sau khi hoàn thành Database
  const products: any[] = [];

  return (
    <div className="px-4 md:px-12 py-12 md:py-20">
      {/* Page Header */}
      <div className="mb-12 md:mb-20">
        <h1 className="text-[48px] md:text-[80px] font-black tracking-tight leading-none mb-10 uppercase">Bộ sưu tập</h1>
        
        {/* Pill Filters */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setActiveBrand('Tất cả')}
            className={`px-6 py-2 rounded-full border text-[13px] font-bold tracking-widest uppercase transition-all
              ${activeBrand === 'Tất cả' ? 'bg-black text-white border-black' : 'bg-transparent text-black border-gray-200 hover:border-black'}`}
          >
            Tất cả
          </button>

          {brands.map((brand) => (
            <button 
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className={`px-6 py-2 rounded-full border text-[13px] font-bold tracking-widest uppercase transition-all
                ${activeBrand === brand.id ? 'bg-black text-white border-black' : 'bg-transparent text-black border-gray-200 hover:border-black'}`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Stats & Filter Actions */}
      <div className="flex justify-end items-center py-6 border-b border-gray-100 mb-10">
        <span className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">{products.length} Kết quả</span>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="py-40 text-center border border-dashed border-gray-100 rounded-sm">
          <p className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.3em]">Đang cập nhật bộ sưu tập mới</p>
        </div>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const stats = [
    { label: 'Tổng doanh thu', value: '0đ', growth: '—', color: 'text-gray-400' },
    { label: 'Đơn hàng mới', value: '0', growth: '—', color: 'text-gray-400' },
    { label: 'Sản phẩm', value: '0', growth: '—', color: 'text-gray-400' },
    { label: 'Khách hàng', value: '0', growth: '—', color: 'text-gray-400' },
  ];

  const recentOrders: any[] = [];

  return (
    <div className="space-y-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-8 border border-gray-100 rounded-sm hover:border-black transition-all group">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 group-hover:text-black transition-colors">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 ${stat.color}`}>
                {stat.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[14px] font-bold uppercase tracking-widest">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-widest underline underline-offset-4">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-left uppercase text-[10px] tracking-widest font-bold">
                  <th className="pb-4">Mã đơn</th>
                  <th className="pb-4">Khách hàng</th>
                  <th className="pb-4">Sản phẩm</th>
                  <th className="pb-4">Số tiền</th>
                  <th className="pb-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-bold">{order.id}</td>
                    <td className="py-5 text-gray-500">{order.customer}</td>
                    <td className="py-5">{order.product}</td>
                    <td className="py-5 font-medium">{order.amount}</td>
                    <td className="py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${order.status === 'Đã giao' ? 'bg-green-50 text-green-600' : 
                          order.status === 'Đang xử lý' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-300 italic">Chưa có hoạt động nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity / Insights */}
        <div className="space-y-6">
          <div className="bg-black text-white p-8 rounded-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Thông báo hệ thống</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <div>
                  <p className="text-[12px] font-bold leading-none mb-1 text-white">Kết nối API ổn định</p>
                  <p className="text-[10px] text-gray-400">Tất cả dịch vụ đang hoạt động bình thường.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5" />
                <div>
                  <p className="text-[12px] font-bold leading-none mb-1 text-white">4 đơn hàng chờ duyệt</p>
                  <p className="text-[10px] text-gray-400">Vui lòng kiểm tra mục đơn hàng để xác nhận.</p>
                </div>
              </div>
            </div>
            <Button size="small" className="w-full mt-8 bg-white/10 hover:!bg-white/20 border-none text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-sm">
              Xem báo cáo kỹ thuật
            </Button>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Mẹo quản trị</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-4 italic">
              "Việc cập nhật hình ảnh sản phẩm chất lượng cao có thể tăng tỉ lệ chuyển đổi lên đến 30%."
            </p>
            <Link to="/admin/products" className="text-[11px] font-bold text-black uppercase tracking-widest underline underline-offset-4">
              Cập nhật sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="mb-16">
        <h1 className="text-[40px] font-black tracking-tighter uppercase mb-2">Hồ sơ cá nhân</h1>
        <p className="text-gray-400 text-[13px] uppercase tracking-[0.2em]">Thông tin tài khoản của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-100 pt-16">
        <div className="space-y-4">
          <div className="w-32 h-32 bg-black text-white flex items-center justify-center text-4xl font-black rounded-full shadow-2xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-8 bg-gray-50 rounded-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Địa chỉ Email</p>
              <p className="text-[15px] font-medium">{user?.email}</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Số điện thoại</p>
              <p className="text-[15px] font-medium text-gray-300 italic">Chưa cập nhật</p>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100">
            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Lịch sử hoạt động</h3>
            <div className="py-20 border border-dashed border-gray-200 text-center rounded-sm">
              <p className="text-[12px] text-gray-300 uppercase tracking-widest">Không có lịch sử mua hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 flex items-center justify-center rounded-full mb-8">
        <Lock size={40} strokeWidth={1.5} />
      </div>
      <h1 className="text-[32px] font-black tracking-tighter uppercase mb-4">Truy cập bị từ chối</h1>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
        Tài khoản của bạn không có đủ quyền hạn để truy cập vào khu vực quản trị này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một lỗi.
      </p>
      <Link to="/" className="inline-block px-10 py-4 bg-black text-white text-[12px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-gray-800 transition-all">
        Quay lại trang chủ
      </Link>
    </div>
  );
};


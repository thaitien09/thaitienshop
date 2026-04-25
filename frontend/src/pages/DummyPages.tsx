import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, message, Spin, Pagination } from 'antd';
import ProductCard from '../components/ProductCard';
import { Lock } from 'lucide-react';
import api, { BASE_URL } from '../services/api';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export const HomePage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeBrand, setActiveBrand] = useState('Tất cả');
  const [priceFilter, setPriceFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [brandRes, productRes] = await Promise.all([
          api.get('/brands'),
          api.get('/products')
        ]);
        setBrands(brandRes.data.data || brandRes.data);
        setProducts(productRes.data.data || productRes.data);
      } catch (error) {
        message.error('Không thể tải dữ liệu sản phẩm!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeBrand !== 'Tất cả' && p.brandId !== activeBrand) return false;
    if (priceFilter === 'under200' && p.price >= 200000) return false;
    if (priceFilter === '200to400' && (p.price < 200000 || p.price > 400000)) return false;
    if (priceFilter === 'over400' && p.price <= 400000) return false;
    if (stockFilter === 'instock' && p.currentStock <= 0) return false;
    if (stockFilter === 'outstock' && p.currentStock > 0) return false;
    return true;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1);
    if (type === 'brand') setActiveBrand(value);
    if (type === 'price') setPriceFilter(value);
    if (type === 'stock') setStockFilter(value);
  };

  const clearAllFilters = () => {
    setActiveBrand('Tất cả');
    setPriceFilter('all');
    setStockFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilter = activeBrand !== 'Tất cả' || priceFilter !== 'all' || stockFilter !== 'all';

  return (
    <div className="px-4 md:px-12 py-10">
      {/* Header */}
      <div id="collections" className="mb-8">
        <h1 className="text-[36px] md:text-[56px] font-black tracking-tight leading-none uppercase">Bộ sưu tập</h1>
        <p className="text-gray-400 text-[12px] uppercase tracking-[0.25em] mt-2">{filteredProducts.length} sản phẩm</p>
      </div>

      <div className="flex gap-10">

        {/* ===== SIDEBAR FILTER ===== */}
        <aside className="hidden md:block w-48 flex-shrink-0">
          <div className="sticky top-24 space-y-8">

            {hasActiveFilter && (
              <button onClick={clearAllFilters} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black underline underline-offset-4 transition-colors">
                Xóa bộ lọc
              </button>
            )}

            {/* Thương hiệu */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-4 border-b border-gray-100 pb-3">Thương hiệu</p>
              <div className="space-y-1">
                <button
                  onClick={() => handleFilterChange('brand', 'Tất cả')}
                  className={`w-full text-left text-[12px] py-1.5 px-3 rounded-sm transition-all font-medium ${activeBrand === 'Tất cả' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                >
                  Tất cả
                </button>
                {brands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleFilterChange('brand', b.id)}
                    className={`w-full text-left text-[12px] py-1.5 px-3 rounded-sm transition-all font-medium ${activeBrand === b.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mức giá */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-4 border-b border-gray-100 pb-3">Mức giá</p>
              <div className="space-y-1">
                {[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Dưới 200.000đ', value: 'under200' },
                  { label: '200k – 400k', value: '200to400' },
                  { label: 'Trên 400.000đ', value: 'over400' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => handleFilterChange('price', opt.value)}
                    className={`w-full text-left text-[12px] py-1.5 px-3 rounded-sm transition-all font-medium ${priceFilter === opt.value ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tình trạng */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-4 border-b border-gray-100 pb-3">Tình trạng</p>
              <div className="space-y-1">
                {[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Còn hàng', value: 'instock' },
                  { label: 'Hết hàng', value: 'outstock' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => handleFilterChange('stock', opt.value)}
                    className={`w-full text-left text-[12px] py-1.5 px-3 rounded-sm transition-all font-medium ${stockFilter === opt.value ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ===== PRODUCT GRID ===== */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">Trang {currentPage} / {Math.ceil(filteredProducts.length / PAGE_SIZE) || 1}</span>
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">{filteredProducts.length} kết quả</span>
          </div>

          {loading ? (
            <div className="py-32 text-center">
              <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.3em] animate-pulse">Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : 'https://placehold.co/300x300?text=No+Image'}
                    category={product.brand?.name || ''}
                    currentStock={product.currentStock}
                  />
                ))}
              </div>

              {filteredProducts.length > PAGE_SIZE && (
                <div className="flex justify-center mt-14">
                  <Pagination
                    current={currentPage}
                    pageSize={PAGE_SIZE}
                    total={filteredProducts.length}
                    onChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    showSizeChanger={false}
                    className="[&_.ant-pagination-item-active]:bg-black [&_.ant-pagination-item-active]:border-black [&_.ant-pagination-item-active_a]:text-white"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-32 text-center border border-dashed border-gray-100 rounded-sm">
              <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.3em]">Không tìm thấy sản phẩm phù hợp</p>
              {hasActiveFilter && (
                <button onClick={clearAllFilters} className="mt-4 text-[11px] font-bold uppercase tracking-widest text-black underline">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchStats = async (p: string, from?: string, to?: string) => {
    setLoading(true);
    try {
      const params: any = { period: p };
      if (p === 'custom' && from && to) {
        params.from = from;
        params.to = to;
      }
      const res = await api.get('/dashboard/stats', { params });
      setStats(res.data.data || res.data);
    } catch (error) {
      message.error('Không thể tải thống kê!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats('all'); }, []);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (p !== 'custom') fetchStats(p);
  };

  const handleCustomSearch = () => {
    if (!fromDate || !toDate) { message.warning('Vui lòng chọn khoảng ngày!'); return; }
    fetchStats('custom', fromDate, toDate);
  };

  const periodLabels: Record<string, string> = {
    all: 'Toàn thời gian', today: 'Hôm nay', '7days': '7 ngày qua',
    thisMonth: 'Tháng này', thisYear: 'Năm này', custom: 'Tùy chọn'
  };

  const periods = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Hôm nay', value: 'today' },
    { label: '7 ngày', value: '7days' },
    { label: 'Tháng này', value: 'thisMonth' },
    { label: 'Năm này', value: 'thisYear' },
    { label: 'Tùy chọn', value: 'custom' },
  ];

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Spin size="large" />
    </div>
  );

  const financialCards = [
    { label: 'Tổng doanh thu', value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`, sub: periodLabels[period] || period },
    { label: 'Tổng giá vốn', value: `${(stats?.totalCost || 0).toLocaleString()}đ`, sub: 'Tiền nhập hàng' },
    { label: 'Lợi nhuận gộp', value: `${(stats?.totalProfit || 0).toLocaleString()}đ`, sub: 'Sau khi trừ vốn', green: true },
    { label: 'Tỷ suất lợi nhuận', value: `${(stats?.profitMargin || 0).toFixed(1)}%`, sub: 'Hiệu quả kinh doanh' },
  ];

  const operationalCards = [
    { label: 'Đơn hàng', value: (stats?.orderCount || 0).toString(), sub: periodLabels[period] || period, color: 'text-blue-500' },
    { label: 'Sản phẩm', value: (stats?.productCount || 0).toString(), sub: 'Mặt hàng', color: 'text-indigo-500' },
    { label: 'Khách hàng', value: (stats?.customerCount || 0).toString(), sub: 'Thành viên', color: 'text-purple-500' },
    { label: 'Khách mới', value: (stats?.alerts?.newUsersToday || 0).toString(), sub: 'Trong hôm nay', color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="bg-white border border-gray-100 rounded-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mr-2">Thời gian:</span>
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all border
                ${period === p.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}
            >
              {p.label}
            </button>
          ))}

          {/* Custom date range */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 rounded-sm px-3 py-1.5 text-[12px] focus:outline-none focus:border-black"
              />
              <span className="text-gray-400 text-[12px]">→</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 rounded-sm px-3 py-1.5 text-[12px] focus:outline-none focus:border-black"
              />
              <button
                onClick={handleCustomSearch}
                className="px-4 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800 transition-colors"
              >
                Tìm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialCards.map((stat, index) => (
          <div key={index} className="bg-white p-8 border border-gray-100 rounded-sm hover:border-black transition-all group">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 group-hover:text-black transition-colors">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h3 className={`text-2xl font-black tracking-tighter ${index === 2 ? 'text-green-600' : ''}`}>{stat.value}</h3>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 uppercase font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {operationalCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 border border-gray-50 rounded-sm hover:bg-gray-50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-bold">{stat.value}</h3>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${stat.color}`}>{stat.sub}</span>
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
                  <th className="pb-4">Số tiền</th>
                  <th className="pb-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-bold">{order.id}</td>
                    <td className="py-5 text-gray-500">{order.customer}</td>
                    <td className="py-5 font-medium">{order.amount?.toLocaleString()}đ</td>
                    <td className="py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${order.status === 'Đã giao' || order.status === 'Đã thanh toán' ? 'bg-green-50 text-green-600' : 
                          order.status === 'Đang xử lý' || order.status === 'Chờ xử lý' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-300 italic">Chưa có hoạt động nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity / Real-time Notifications */}
        <div className="space-y-6">
          <div className="bg-black text-white p-8 rounded-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Thông báo hệ thống</h3>
            <div className="space-y-6">
              {/* API Connection (Always active if data loaded) */}
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <div>
                  <p className="text-[12px] font-bold leading-none mb-1 text-white">Kết nối API ổn định</p>
                  <p className="text-[10px] text-gray-400">Hệ thống Thai Tien Shop đang vận hành tốt.</p>
                </div>
              </div>

              {/* Real Pending Orders */}
              {stats?.alerts?.pendingOrders > 0 && (
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <div>
                    <p className="text-[12px] font-bold leading-none mb-1 text-white">{stats.alerts.pendingOrders} Đơn hàng mới</p>
                    <p className="text-[10px] text-gray-400">Có đơn hàng đang chờ bạn xác nhận.</p>
                  </div>
                </div>
              )}

              {/* Low Stock Alert */}
              {stats?.alerts?.lowStock > 0 && (
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <div>
                    <p className="text-[12px] font-bold leading-none mb-1 text-white">{stats.alerts.lowStock} Sản phẩm sắp hết</p>
                    <p className="text-[10px] text-gray-400">Vui lòng kiểm tra kho hàng ngay.</p>
                  </div>
                </div>
              )}

              {/* New Users Today */}
              {stats?.alerts?.newUsersToday > 0 && (
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <div>
                    <p className="text-[12px] font-bold leading-none mb-1 text-white">{stats.alerts.newUsersToday} Khách mới hôm nay</p>
                    <p className="text-[10px] text-gray-400">Cửa hàng đang thu hút thêm thành viên.</p>
                  </div>
                </div>
              )}

              {/* If no major alerts, show positive info */}
              {stats?.alerts?.pendingOrders === 0 && stats?.alerts?.lowStock === 0 && (
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <div>
                    <p className="text-[12px] font-bold leading-none mb-1 text-white">Vận hành trơn tru</p>
                    <p className="text-[10px] text-gray-400">Không có cảnh báo tồn kho hay đơn hàng tồn đọng.</p>
                  </div>
                </div>
              )}
            </div>
            <Button size="small" className="w-full mt-8 bg-white/10 hover:!bg-white/20 border-none text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-sm">
              Xem báo cáo chi tiết
            </Button>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-6">Mẹo quản trị</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-4 italic">
              "Việc xử lý đơn hàng nhanh chóng giúp tăng trải nghiệm và uy tín cho Thai Tien Shop."
            </p>
            <Link to="/admin/orders" className="text-[11px] font-bold text-black uppercase tracking-widest underline underline-offset-4">
              Quản lý đơn hàng
            </Link>
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

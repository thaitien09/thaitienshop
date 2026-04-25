import React from 'react';
import { Layout, Button, Badge, Input, Dropdown, Avatar } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  Menu as MenuIcon,
  Mail,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { Header, Content, Footer } = Layout;

const ShopLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: any[] = [
    ...(user?.role === 'ADMIN' ? [{
      key: 'admin',
      label: <span className="text-[13px]">Trang quản trị</span>,
      icon: <LayoutDashboard size={14} />,
      onClick: () => navigate('/admin'),
    }] : []),
    {
      key: 'profile',
      label: <span className="text-[13px]">Thông tin cá nhân</span>,
      icon: <UserIcon size={14} />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: <span className="text-[13px]">Đơn hàng của tôi</span>,
      icon: <ShoppingBag size={14} />,
      onClick: () => navigate('/my-orders'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: <span className="text-[13px] font-bold text-red-500">Đăng xuất</span>,
      icon: <LogOut size={14} className="text-red-500" />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-white">
      {/* Header - White Background & Black Text */}
      <Header className="bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50 h-24">
        {/* Logo Left */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center gap-2 py-2">
            <img src="/logo.png" alt="Thai Tien Shop" className="h-20 w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>

        {/* Menu Center */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[12px] font-bold text-black hover:text-gray-400 transition-colors uppercase tracking-[0.2em]">Trang chủ</Link>
          <a href="#contact" className="text-[12px] font-bold text-black hover:text-gray-400 transition-colors uppercase tracking-[0.2em]">Liên hệ</a>
        </nav>

        {/* Icons Right */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
          <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative text-black">
            <Badge count={totalItems} size="small" offset={[5, -5]} color="black">
              <ShoppingCart size={22} strokeWidth={1.5} />
            </Badge>
          </Link>

          {!user ? (
            <button 
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors text-black"
            >
              <UserIcon size={22} strokeWidth={1.5} />
            </button>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-full transition-colors ml-2">
                <Avatar 
                  className="bg-black text-[10px] font-bold"
                  size={32}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
            </Dropdown>
          )}
          
          <button className="md:hidden p-2 text-black">
            <MenuIcon size={24} />
          </button>
        </div>
      </Header>

      <Content className="bg-white">
        <Outlet />
      </Content>

      {/* Professional Footer */}
      <Footer id="contact" className="bg-[#f9fafb] pt-20 pb-12 px-4 md:px-12 border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <Link to="/" className="inline-block">
                <img src="/logo.png" alt="Thai Tien Shop" className="h-10 w-auto object-contain mix-blend-multiply" />
              </Link>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-[240px]">
                Định hình phong cách quý ông với các dòng sáp vuốt tóc chính hãng, đẳng cấp và dẫn đầu xu hướng.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 border border-gray-200 rounded-full hover:border-black transition-colors" title="Facebook">
                  <FaFacebook size={18} color="#1877F2" />
                </a>
                <a href="#" className="p-2 border border-gray-200 rounded-full hover:border-black transition-colors" title="Instagram">
                  <FaInstagram size={18} color="#E4405F" />
                </a>
                <a href="#" className="p-2 border border-gray-200 rounded-full hover:border-black transition-colors" title="X (Twitter)">
                  <FaXTwitter size={18} color="#000000" />
                </a>
              </div>
            </div>

            {/* Column 2: Empty or about us */}
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-widest mb-6">Thai Tien Shop</h4>
              <p className="text-gray-400 text-[13px] italic">"Phong cách quý ông thượng lưu"</p>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4>Hỗ trợ</h4>
              <ul className="space-y-4 text-[14px]">
                <li><a href="#">Vận chuyển & Giao hàng</a></li>
                <li><a href="#">Chính sách đổi trả</a></li>
                <li><a href="#">Bảo mật thông tin</a></li>
                <li><a href="#">Liên hệ chúng tôi</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-6">
              <h4>Nhận tin mới nhất</h4>
              <p className="text-gray-500 text-[14px]">Đăng ký để nhận ưu đãi đặc biệt và tin tức sớm nhất từ Thai Tien Shop.</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email của bạn" 
                  className="rounded-sm border-gray-200 focus:border-black"
                  prefix={<Mail size={16} className="text-gray-400 mr-2" />}
                />
                <Button className="bg-black text-white hover:bg-gray-800 border-none px-6 rounded-sm uppercase text-[12px] font-bold tracking-widest h-auto py-2">
                  Gửi
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-[11px] tracking-[0.2em] uppercase text-center md:text-left">
              Thai Tien Shop ©{new Date().getFullYear()} — Defined by Excellence. 
            </div>
            <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest">
              <a href="#">Việt Nam</a>
              <span className="text-gray-200">|</span>
              <a href="#">Tiếng Việt</a>
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default ShopLayout;

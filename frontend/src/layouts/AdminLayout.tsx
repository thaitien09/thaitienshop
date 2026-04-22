import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Dropdown, Avatar } from 'antd';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Store,
  Bell,
  Search,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: any[] = [
    { key: '/admin', icon: <BarChart3 size={18} strokeWidth={1.5} />, label: <Link to="/admin" className="text-[13px] font-medium">Bảng điều khiển</Link> },
    { key: '/admin/brands', icon: <Store size={18} strokeWidth={1.5} />, label: <Link to="/admin/brands" className="text-[13px] font-medium">Quản lý thương hiệu</Link> },
    { key: '/admin/products', icon: <Package size={18} strokeWidth={1.5} />, label: <Link to="/admin/products" className="text-[13px] font-medium">Quản lý sản phẩm</Link> },
    { key: '/admin/orders', icon: <ShoppingCart size={18} strokeWidth={1.5} />, label: <Link to="/admin/orders" className="text-[13px] font-medium">Đơn hàng mới</Link> },
    { key: '/admin/users', icon: <Users size={18} strokeWidth={1.5} />, label: <Link to="/admin/users" className="text-[13px] font-medium">Khách hàng</Link> },
    { key: 'divider-1', type: 'divider', className: "!my-6" },
    { key: '/admin/settings', icon: <Settings size={18} strokeWidth={1.5} />, label: <Link to="/admin/settings" className="text-[13px] font-medium">Hệ thống</Link> },
  ];

  return (
    <Layout className="min-h-screen bg-[#fafafa]">
      <Sider 
        trigger={null} 
        theme="light" 
        className="!border-r border-gray-100 sticky top-0 h-screen hidden lg:block"
        width={260}
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase leading-none">Sneaker<span className="text-gray-400">Elite</span></span>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 mt-1">Admin Panel</span>
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="admin-menu border-none mt-6 px-3"
        />

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100 bg-white">
          <Button 
            type="text" 
            danger 
            icon={<LogOut size={18} strokeWidth={1.5} />} 
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 h-10 hover:bg-red-50 rounded-sm text-[12px] font-bold uppercase tracking-widest px-4"
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>
      
      <Layout className="bg-[#fafafa]">
        <Header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 p-0 flex items-center justify-between px-6 border-b border-gray-100 h-20">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 w-64">
              <Search size={16} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..." 
                className="bg-transparent border-none text-[13px] focus:outline-none w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Button 
              type="primary" 
              className="bg-black hover:!bg-gray-800 border-none rounded-full px-5 text-[11px] font-bold uppercase tracking-widest h-10 flex items-center gap-2"
              icon={<Store size={16} />} 
              onClick={() => navigate('/')}
            >
              Về cửa hàng
            </Button>

            <Badge dot color="black" offset={[-2, 2]}>
              <Button type="text" icon={<Bell size={20} strokeWidth={1.5} />} className="flex items-center justify-center p-2 hover:bg-gray-50 rounded-full" />
            </Badge>
          </div>
        </Header>

        <Content className="p-8 max-w-[1400px] mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-[32px] font-black tracking-tighter uppercase mb-1">
              {menuItems.find(item => {
                const link = (item.label as any)?.props?.to;
                return link === location.pathname;
              })?.label?.props?.children || "Bảng điều khiển"}
            </h1>
            <p className="text-gray-400 text-sm">Chào mừng bạn đến với hệ thống quản trị Sneaker Elite.</p>
          </div>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

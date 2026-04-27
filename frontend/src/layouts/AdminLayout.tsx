import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Drawer } from 'antd';
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
  ChevronDown,
  History,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const menuItems: any[] = [
    { key: '/admin', icon: <BarChart3 size={18} strokeWidth={1.5} />, label: <Link to="/admin" onClick={closeMobileMenu} className="text-[13px] font-medium">Bảng điều khiển</Link> },
    { key: '/admin/brands', icon: <Store size={18} strokeWidth={1.5} />, label: <Link to="/admin/brands" onClick={closeMobileMenu} className="text-[13px] font-medium">Quản lý thương hiệu</Link> },
    { key: '/admin/products', icon: <Package size={18} strokeWidth={1.5} />, label: <Link to="/admin/products" onClick={closeMobileMenu} className="text-[13px] font-medium">Quản lý sáp vuốt tóc</Link> },
    { key: '/admin/inventory', icon: <History size={18} strokeWidth={1.5} />, label: <Link to="/admin/inventory" onClick={closeMobileMenu} className="text-[13px] font-medium">Quản lý nhập kho</Link> },
    { key: '/admin/orders', icon: <ShoppingCart size={18} strokeWidth={1.5} />, label: <Link to="/admin/orders" onClick={closeMobileMenu} className="text-[13px] font-medium">Đơn hàng mới</Link> },
    { key: '/admin/users', icon: <Users size={18} strokeWidth={1.5} />, label: <Link to="/admin/users" onClick={closeMobileMenu} className="text-[13px] font-medium">Khách hàng</Link> },
  ];

  const sidebarLogo = (
    <div className="h-20 flex items-center px-8 border-b border-gray-100">
      <div className="flex flex-col">
        <span className="text-sm font-black tracking-tighter uppercase leading-none">THAI <span className="text-gray-400">TIEN</span></span>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 mt-1">Admin Panel</span>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-[#fafafa]">
      {/* Sidebar for Desktop */}
      <Sider 
        trigger={null} 
        theme="light" 
        className="!border-r border-gray-100 sticky top-0 h-screen hidden lg:block"
        width={260}
      >
        {sidebarLogo}
        
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

      {/* Drawer for Mobile */}
      <Drawer
        placement="left"
        onClose={closeMobileMenu}
        open={mobileMenuOpen}
        closeIcon={null}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full relative">
          <div className="flex items-center justify-between pr-4">
            {sidebarLogo}
            <Button type="text" onClick={closeMobileMenu} icon={<X size={20} />} />
          </div>
          
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="admin-menu border-none mt-6 px-3 flex-1"
          />

          <div className="p-6 border-t border-gray-100 bg-white">
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
        </div>
      </Drawer>
      
      <Layout className="bg-[#fafafa]">
        <Header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 p-0 flex items-center justify-between px-3 md:px-6 border-b border-gray-100 h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              type="text" 
              className="lg:hidden flex items-center justify-center p-1" 
              icon={<MenuIcon size={22} strokeWidth={1.5} />} 
              onClick={() => setMobileMenuOpen(true)}
            />
            <div className="hidden lg:flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 w-64">
              <Search size={16} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..." 
                className="bg-transparent border-none text-[13px] focus:outline-none w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <Button 
              type="text" 
              className="flex items-center justify-center p-2 hover:bg-gray-50 rounded-full text-black"
              icon={<Store size={20} strokeWidth={1.5} />} 
              onClick={() => navigate('/')}
              title="Về cửa hàng"
            >
              <span className="hidden sm:inline ml-2 text-[11px] font-bold uppercase tracking-widest">Cửa hàng</span>
            </Button>

            <Badge dot color="black" offset={[-2, 2]}>
              <Button type="text" icon={<Bell size={18} strokeWidth={1.5} />} className="flex items-center justify-center p-1 md:p-2 hover:bg-gray-50 rounded-full" />
            </Badge>
          </div>
        </Header>

        <Content className="p-3 md:p-8 max-w-[1400px] mx-auto w-full">
          <div className="mb-4 md:mb-10">
            <h1 className="text-[20px] md:text-[32px] font-black tracking-tighter uppercase mb-0 md:mb-1">
              {menuItems.find(item => {
                const link = (item.label as any)?.props?.to;
                return link === location.pathname;
              })?.label?.props?.children || "Bảng điều khiển"}
            </h1>
            <p className="text-gray-400 text-[10px] md:text-sm">Chào mừng bạn đến với hệ thống quản trị Thai Tien Shop.</p>
          </div>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

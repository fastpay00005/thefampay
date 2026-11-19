import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { 
  LayoutDashboard, Users, ArrowLeftRight, 
  ArrowDownLeft, ArrowUpRight, Bell, FileText, 
  Settings, ChevronLeft, ChevronRight, LogOut, 
  Zap, RefreshCw, Menu, X, Shield, CheckCircle2,
  ChevronDown, Layers, CreditCard, ShieldCheck, Image, AlertTriangle, RotateCw
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAdminTheme();
  const { allUsers, transactions, loadAdminData, appName } = useApp();
  const currentAppName = appName || 'The FamPay';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sidebarNavRef = useRef(null);

  // Preserve sidebar scroll position across navigation and clicks
  useEffect(() => {
    if (sidebarNavRef.current) {
      const savedScroll = sessionStorage.getItem('fampay_admin_sidebar_scroll');
      if (savedScroll !== null) {
        sidebarNavRef.current.scrollTop = Number(savedScroll);
      }
      // Ensure the active link remains visible without jumping
      const activeElement = sidebarNavRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }
  }, [location.pathname, location.search]);

  const handleAdminLogout = () => {
    localStorage.removeItem('fampay_admin_token');
    navigate('/admin/login');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAdminData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const pendingDepositsCount = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length;
  const pendingWithdrawalsCount = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length;
  const realUsersCount = allUsers.filter(u => u.role !== 'ADMIN').length;

  // Accurate active state helper (distinguishes /admin from /admin?filter=buy and /admin?filter=sell)
  const isNavActive = (path, filterParam = null) => {
    if (filterParam) {
      const currentFilter = new URLSearchParams(location.search).get('filter');
      return location.pathname === '/admin' && currentFilter === filterParam;
    }
    if (path === '/admin') {
      const currentFilter = new URLSearchParams(location.search).get('filter');
      return location.pathname === '/admin' && !currentFilter;
    }
    return location.pathname.startsWith(path);
  };

  // Derive dynamic page title for top header
  const getHeaderMeta = () => {
    const path = location.pathname;
    const filter = new URLSearchParams(location.search).get('filter');
    if (path === '/admin') {
      if (filter === 'buy') return { title: 'Buy Orders Queue', desc: 'Real-time user token purchase executions' };
      if (filter === 'sell') return { title: 'Sell Orders Queue', desc: 'Real-time user token liquidation records' };
      return { title: 'Dashboard Overview', desc: 'Real-time metrics, platform reserves & live liquidity' };
    }
    if (path === '/admin/users') return { title: 'User Management', desc: 'Manage users, balances, locks & permissions' };
    if (path === '/admin/deposits') return { title: 'Deposit Approvals', desc: 'Review proof of payments & approve INR/USDT deposits' };
    if (path === '/admin/withdrawals') return { title: 'Withdrawal Payouts', desc: 'Settle user withdrawal requests & mark completed' };
    if (path === '/admin/sell-requests') return { title: 'Sell Requests Queue', desc: 'Settle token cash-outs & refund rejected orders' };
    if (path === '/admin/upi-review') return { title: 'UPI & Provider Accounts', desc: 'Approve user payout accounts or issue challenge codes' };
    if (path === '/admin/channels') return { title: 'Payment Gateways', desc: 'Manage Bank, UPI QR & Digital receiving accounts' };
    if (path === '/admin/tasks') return { title: 'Verification Tasks', desc: 'Create tasks & audit user proof submissions' };
    if (path === '/admin/banners') return { title: 'Announcement Banners', desc: 'Manage home announcement and promo popup modals' };
    if (path === '/admin/spin') return { title: 'Lucky Spin Wheel', desc: 'Price per spin, welcome free spin & prize segment controls' };
    if (path === '/admin/maintenance') return { title: 'Maintenance Mode', desc: 'Configure platform maintenance schedule and messaging' };
    if (path === '/admin/broadcast') return { title: 'Notification Broadcast', desc: 'Send targeted and system-wide announcements' };
    if (path === '/admin/settings') return { title: 'Platform Settings', desc: 'Exchange rates, themes, sell toggles & support links' };
    return { title: 'Admin Portal', desc: `${currentAppName} Super-Admin Workspace` };
  };

  const headerMeta = getHeaderMeta();

  // Navigation Structure organized by functional sections
  const navSections = [
    {
      title: 'CORE OVERVIEW',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', isActive: isNavActive('/admin') },
        { to: '/admin/users', icon: Users, label: 'User Accounts', badge: realUsersCount > 0 ? realUsersCount : null, isActive: isNavActive('/admin/users') },
      ]
    },
    {
      title: 'FINANCES & ORDERS',
      items: [
        { 
          to: '/admin/deposits', 
          icon: ArrowDownLeft, 
          label: 'Deposit Requests', 
          badge: pendingDepositsCount > 0 ? pendingDepositsCount : null,
          badgeColor: 'bg-emerald-500 text-white animate-pulse',
          isActive: isNavActive('/admin/deposits') 
        },
        { 
          to: '/admin/sell-requests', 
          icon: RefreshCw, 
          label: 'Sell Requests', 
          isActive: isNavActive('/admin/sell-requests') 
        },
        { 
          to: '/admin/withdrawals', 
          icon: ArrowUpRight, 
          label: 'Withdrawal Payouts', 
          badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null,
          badgeColor: 'bg-amber-500 text-white animate-pulse',
          isActive: isNavActive('/admin/withdrawals') 
        },
      ]
    },
    {
      title: 'GATEWAYS & TOOLS',
      items: [
        { to: '/admin/upi-review', icon: ShieldCheck, label: 'UPI & Tool Review', isActive: isNavActive('/admin/upi-review') },
        { to: '/admin/channels', icon: CreditCard, label: 'Payment Channels', isActive: isNavActive('/admin/channels') },
        { to: '/admin/tasks', icon: FileText, label: 'Task Verification', isActive: isNavActive('/admin/tasks') },
      ]
    },
    {
      title: 'SYSTEM CONTROL',
      items: [
        { to: '/admin/spin', icon: RotateCw, label: 'Lucky Spin Wheel', isActive: isNavActive('/admin/spin') },
        { to: '/admin/banners', icon: Image, label: 'Announcement Banners', isActive: isNavActive('/admin/banners') },
        { to: '/admin/maintenance', icon: AlertTriangle, label: 'Maintenance Mode', isActive: isNavActive('/admin/maintenance') },
        { to: '/admin/broadcast', icon: Bell, label: 'Broadcast Messages', isActive: isNavActive('/admin/broadcast') },
        { to: '/admin/settings', icon: Settings, label: 'System Settings', isActive: isNavActive('/admin/settings') },
      ]
    }
  ];

  const renderNavLinks = (onItemClick) => (
    <div className="space-y-4">
      {navSections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          {/* Section Header */}
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400/80">
              {section.title}
            </div>
          )}

          {section.items.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                data-active={active ? 'true' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-bold transition-all group ${
                  active 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 font-black ring-1 ring-white/30' 
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'} min-w-0`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    active 
                      ? 'bg-white/20 text-white' 
                      : isDark 
                        ? 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700' 
                        : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {isCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </NavLink>
            );
          })}

          {/* Special Sub-section for Orders under Finances & Orders */}
          {sIdx === 1 && !isCollapsed && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setOrdersOpen(!ordersOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isNavActive('/admin', 'buy') || isNavActive('/admin', 'sell')
                    ? 'text-blue-500 font-extrabold bg-blue-500/10'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isNavActive('/admin', 'buy') || isNavActive('/admin', 'sell')
                      ? 'bg-blue-500/20 text-blue-500'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <span>Trade Orders</span>
                </div>
                {ordersOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {ordersOpen && (
                <div className="pl-10 pr-2 py-1 space-y-1">
                  <NavLink
                    to="/admin?filter=buy"
                    onClick={onItemClick}
                    data-active={isNavActive('/admin', 'buy') ? 'true' : undefined}
                    className={`block px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      isNavActive('/admin', 'buy')
                        ? 'bg-blue-600 text-white font-black shadow-xs'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Buy Orders
                  </NavLink>
                  <NavLink
                    to="/admin?filter=sell"
                    onClick={onItemClick}
                    data-active={isNavActive('/admin', 'sell') ? 'true' : undefined}
                    className={`block px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      isNavActive('/admin', 'sell')
                        ? 'bg-purple-600 text-white font-black shadow-xs'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Sell Orders
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (FIXED TO SCREEN, NON-SCROLLING)      */}
      {/* ======================================================== */}
      <aside className={`hidden lg:flex fixed top-0 bottom-0 left-0 h-screen flex-col justify-between shrink-0 select-none z-30 border-r transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isDark ? 'bg-[#0D1527] border-[#1E293B]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div 
          ref={sidebarNavRef} 
          onScroll={(e) => sessionStorage.setItem('fampay_admin_sidebar_scroll', String(e.currentTarget.scrollTop))}
          className="flex-1 overflow-y-auto no-scrollbar py-5 px-3"
        >
          
          {/* Logo Brand Header & Collapse Toggle */}
          <div className={`px-2 pb-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className={`text-base font-black tracking-tight leading-none truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentAppName}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                      Super Admin
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isDark 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand Button When Collapsed */}
          {isCollapsed && (
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-4">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Sidebar Footer with Admin Profile Avatar */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800/80 bg-[#0A1020]' : 'border-slate-100 bg-slate-50/70'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2.5'} rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="leading-tight truncate">
                  <span className={`text-xs font-black block truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Super Admin
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Control
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className={`p-2 rounded-xl border transition-all ${
                  isDark 
                    ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Sign Out Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE APP TOP BAR (NATIVE APP FEEL)                  */}
      {/* ======================================================== */}
      <header className={`lg:hidden sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0B132B]/95 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 rounded-xl border transition-colors active:scale-95 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight leading-none block">{currentAppName}</span>
              <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Action Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Refresh Real-time Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Quick Notifications Button */}
          <button
            type="button"
            onClick={() => navigate('/admin/broadcast')}
            className={`p-2 rounded-xl border relative transition-all active:scale-95 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Broadcast Notifications"
          >
            <Bell className="w-4 h-4" />
            {(pendingDepositsCount > 0 || pendingWithdrawalsCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleAdminLogout}
            className={`p-2 rounded-xl border transition-colors active:scale-95 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. MOBILE SLIDE-OVER DRAWER MENU                         */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className={`relative w-[285px] max-w-[85vw] h-full flex flex-col justify-between p-4 shadow-2xl transition-all duration-300 ${
            isDark ? 'bg-[#0D1527] border-r border-slate-800 text-white' : 'bg-white border-r border-slate-200 text-slate-900'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black">{currentAppName} Admin</h2>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Super Portal</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg border transition-colors active:scale-95 ${
                    isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation in Drawer */}
              <nav className="mt-4 overflow-y-auto max-h-[calc(100vh-170px)] no-scrollbar">
                {renderNavLinks(() => setMobileMenuOpen(false))}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA & DESKTOP TOP HEADER                */}
      {/* ======================================================== */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        
        {/* Desktop Top Header Bar (Sticky at Top) */}
        <header className={`hidden lg:flex sticky top-0 z-20 px-8 py-4 items-center justify-between border-b backdrop-blur-md transition-colors duration-200 ${
          isDark 
            ? 'bg-[#0B132B]/95 border-slate-800' 
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}>
          <div>
            <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {headerMeta.title}
            </h2>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {headerMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all active:scale-95 ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Reload all Supabase real-time data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <span>Refresh Data</span>
            </button>

            {/* Notification Direct Link */}
            <button
              type="button"
              onClick={() => navigate('/admin/broadcast')}
              className={`p-2.5 rounded-xl border relative transition-all active:scale-95 ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Broadcast & Notifications"
            >
              <Bell className="w-4 h-4" />
              {(pendingDepositsCount > 0 || pendingWithdrawalsCount > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping"></span>
              )}
            </button>

            {/* Platform Settings Quick Link */}
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Settings & Appearance"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-24 lg:pb-10 transition-colors duration-200">
          {children || <Outlet />}
        </main>

      </div>

      {/* ======================================================== */}
      {/* 5. MOBILE BOTTOM APP DOCK (NATIVE APP BOTTOM BAR)        */}
      {/* ======================================================== */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1.5 flex items-center justify-around transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0D1527]/95 border-slate-800 text-slate-400' 
          : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
      }`}>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            isActive && !location.search.includes('filter=') ? 'text-blue-500 font-extrabold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            isActive ? 'text-blue-500 font-extrabold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/deposits"
          className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold relative transition-all ${
            isActive ? 'text-blue-500 font-extrabold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <ArrowDownLeft className="w-5 h-5 mb-0.5" />
            {pendingDepositsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {pendingDepositsCount}
              </span>
            )}
          </div>
          <span>Deposits</span>
        </NavLink>

        <NavLink
          to="/admin/withdrawals"
          className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold relative transition-all ${
            isActive ? 'text-blue-500 font-extrabold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <ArrowUpRight className="w-5 h-5 mb-0.5" />
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {pendingWithdrawalsCount}
              </span>
            )}
          </div>
          <span>Payouts</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

    </div>
  );
};

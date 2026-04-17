import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  CalendarCheck, 
  CreditCard, 
  Star, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  User,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button, Card } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onContentRef?: (ref: React.RefObject<HTMLDivElement>) => void;
  adminName?: string;
  adminAvatar?: string;
}

export const Layout = ({ 
  children, 
  activePage, 
  setActivePage, 
  onLogout, 
  notifications, 
  onMarkRead, 
  onContentRef,
  adminName = 'Super Admin',
  adminAvatar
}: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutors', label: 'Tutors', icon: Users },
    { id: 'students', label: 'Students', icon: UserRound },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Pass contentRef to parent component
  React.useEffect(() => {
    if (onContentRef) {
      onContentRef(contentRef);
    }
  }, [contentRef, onContentRef]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl italic">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-primary leading-none">Eduqra</span>
              <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-0.5">Admin Hub</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/${item.id}`);
                setActivePage(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                activePage === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-20">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-48 sm:w-64 md:w-96 group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all relative border border-primary/10"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">Notifications</h4>
                        <button className="text-xs text-primary font-bold hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => onMarkRead(n.id)}
                            className={cn(
                              "p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer",
                              n.read ? "opacity-50" : "bg-primary/5"
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={cn(
                                'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                                n.read ? 'bg-gray-300' : 'bg-primary'
                              )} />
                              <div>
                                <p className={cn("text-sm text-gray-900", n.read ? "font-medium" : "font-black")}>{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 sm:space-x-3 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black shadow-inner text-xs sm:text-sm">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{adminName}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Administrator</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden p-2"
                    >
                      <button 
                        onClick={() => { navigate('/settings'); setActivePage('settings'); setShowProfile(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <User size={18} />
                        <span>My Profile</span>
                      </button>
                      <button 
                        onClick={() => { navigate('/settings'); setActivePage('settings'); setShowProfile(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </button>
                      <div className="h-px bg-gray-100 my-2 mx-2" />
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

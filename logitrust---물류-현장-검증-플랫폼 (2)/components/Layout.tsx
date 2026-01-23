import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { Role } from '../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, ShieldCheck, LogOut, MapPin, Bell, LayoutDashboard } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, notifications, markNotificationRead } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">LogiTrust</span>
              </Link>
              
              <div className="hidden sm:flex sm:space-x-4">
                {currentUser?.role === Role.DRIVER && (
                  <>
                     <Link 
                        to="/driver" 
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${location.pathname === '/driver' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        홈
                      </Link>
                      <Link 
                        to="/driver/places" 
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${location.pathname.startsWith('/driver/places') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        장소 목록
                      </Link>
                  </>
                )}
                {currentUser?.role === Role.DISPATCH && (
                  <Link 
                    to="/dispatch" 
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${location.pathname.startsWith('/dispatch') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    배차 대시보드
                  </Link>
                )}
                {currentUser?.role === Role.OPS && (
                  <Link 
                    to="/ops" 
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${location.pathname.startsWith('/ops') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    운영 관리
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-full hover:bg-slate-100 relative">
                        <Bell className="h-5 w-5 text-slate-500" />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
                      </button>
                      
                      {showNotifs && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                           <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-700">알림</div>
                           <div className="max-h-64 overflow-y-auto">
                             {myNotifications.length === 0 ? (
                               <div className="p-4 text-center text-xs text-slate-400">새로운 알림이 없습니다.</div>
                             ) : (
                               myNotifications.map(n => (
                                 <div key={n.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${n.isRead ? 'opacity-50' : 'bg-blue-50/30'}`} onClick={() => markNotificationRead(n.id)}>
                                   <p className="text-xs text-slate-800">{n.message}</p>
                                   <p className="text-[10px] text-slate-400 mt-1">{n.createdAt.split('T')[0]}</p>
                                 </div>
                               ))
                             )}
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
                    <span className="text-[10px] tracking-wider font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {currentUser.role === Role.DRIVER ? 'DRIVER' : currentUser.role === Role.OPS ? 'OPS TEAM' : 'DISPATCH'}
                    </span>
                   </div>
                   <button 
                    onClick={handleLogout} 
                    className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all duration-200" 
                    title="로그아웃"
                   >
                     <LogOut className="h-5 w-5" />
                   </button>
                </div>
              ) : (
                <Link to="/" className="text-slate-500 text-sm hover:text-blue-600 font-medium">로그인</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {currentUser && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around py-3 z-50 pb-safe">
          {currentUser.role === Role.DRIVER && (
            <Link to="/driver" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === '/driver' ? 'text-blue-600' : 'text-slate-400'}`}>
               <Truck className="h-6 w-6" />
               <span className="text-[10px] font-bold mt-1">홈</span>
            </Link>
          )}
          
          <Link to={currentUser.role === Role.DRIVER ? "/driver/places" : "#"} className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes('/places') ? 'text-blue-600' : 'text-slate-400'}`}>
            <MapPin className="h-6 w-6" />
            <span className="text-[10px] font-bold mt-1">장소</span>
          </Link>
          
          {currentUser.role === Role.OPS && (
            <Link to="/ops" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.startsWith('/ops') ? 'text-blue-600' : 'text-slate-400'}`}>
              <ShieldCheck className="h-6 w-6" />
              <span className="text-[10px] font-bold mt-1">운영</span>
            </Link>
          )}
          
          {currentUser.role === Role.DISPATCH && (
             <Link to="/dispatch" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.startsWith('/dispatch') ? 'text-blue-600' : 'text-slate-400'}`}>
               <LayoutDashboard className="h-6 w-6" />
               <span className="text-[10px] font-bold mt-1">배차</span>
             </Link>
          )}
        </div>
      )}
    </div>
  );
};
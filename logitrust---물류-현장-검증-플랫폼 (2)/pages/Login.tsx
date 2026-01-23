import React from 'react';
import { useAppStore } from '../services/store';
import { Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { Truck, ClipboardList, Shield, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    if (role === Role.OPS) navigate('/ops');
    else if (role === Role.DISPATCH) navigate('/dispatch');
    else navigate('/driver');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 my-4">
      {/* Left Side: Brand & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Logistics Warehouse" 
            className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight">LogiTrust</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            물류 현장의<br/>
            신뢰를 잇다.
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            정확한 진입로 정보, 검증된 하차지 제약사항.<br/>
            LogiTrust와 함께 안전하고 효율적인 운송을 경험하세요.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © 2024 LogiTrust Corp. All rights reserved.
        </div>
      </div>

      {/* Right Side: Role Selection */}
      <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">로그인</h2>
            <p className="text-slate-500">서비스 이용을 위해 역할을 선택해주세요.</p>
          </div>

          <div className="space-y-4">
            <RoleCard 
              role="차주 / 기사님" 
              desc="출발 전 10초 체크, 하차지 제약정보 제보" 
              icon={<Truck className="h-6 w-6 text-blue-600" />}
              colorClass="hover:border-blue-500 hover:bg-blue-50/50"
              onClick={() => handleLogin(Role.DRIVER)}
            />
            <RoleCard 
              role="운송 / 배차 관리자" 
              desc="리스크 모니터링, 공지사항 전파" 
              icon={<ClipboardList className="h-6 w-6 text-emerald-600" />}
              colorClass="hover:border-emerald-500 hover:bg-emerald-50/50"
              onClick={() => handleLogin(Role.DISPATCH)}
            />
            <RoleCard 
              role="운영팀 (Ops)" 
              desc="정보 검수, 데이터 품질 및 분쟁 관리" 
              icon={<Shield className="h-6 w-6 text-purple-600" />}
              colorClass="hover:border-purple-500 hover:bg-purple-50/50"
              onClick={() => handleLogin(Role.OPS)}
            />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              이 데모는 별도의 회원가입 없이 역할 선택만으로 체험 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard: React.FC<{ 
  role: string; 
  desc: string; 
  icon: React.ReactNode; 
  colorClass: string;
  onClick: () => void;
}> = ({ role, desc, icon, colorClass, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center p-4 border border-slate-200 rounded-xl transition-all duration-200 group bg-white text-left ${colorClass} shadow-sm hover:shadow-md`}
  >
    <div className="bg-slate-50 p-3 rounded-full mr-4 group-hover:bg-white transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-slate-900">{role}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
  </button>
);
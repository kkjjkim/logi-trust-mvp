import React, { useMemo } from 'react';
import { useAppStore } from '../services/store';
import { Role, RequestStatus, RiskGrade, TrustLabel } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, FileText, Megaphone, ArrowRight } from 'lucide-react';

export const DispatchDashboard: React.FC = () => {
  const { places, getPlaceScore, requests, announcements, currentUser } = useAppStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
     const riskyPlaces = places
        .map(p => ({ ...p, score: getPlaceScore(p.id) }))
        .filter(p => p.score.riskGrade === RiskGrade.D || p.score.trustDetails.label === TrustLabel.LOW)
        .slice(0, 5);

     const pendingCount = requests.filter(r => r.status === RequestStatus.PENDING).length;
     const recentAnnouncements = announcements.slice(0, 3);
     
     return { riskyPlaces, pendingCount, recentAnnouncements };
  }, [places, getPlaceScore, requests, announcements]);

  if (currentUser?.role !== Role.DISPATCH) return <Navigate to="/" />;

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-extrabold text-slate-900">운송/배차 대시보드</h1>
             <p className="text-slate-500 mt-1">현장 리스크를 사전에 파악하고 공지사항을 전파하세요.</p>
          </div>
          <button 
             onClick={() => navigate('/dispatch/announce')}
             className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
             <Megaphone className="w-4 h-4" /> 공지 작성
          </button>
       </div>

       {/* Summary Cards */}
       <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                <span className="font-bold text-slate-500 uppercase text-xs">고위험 장소</span>
             </div>
             <div className="text-3xl font-extrabold text-slate-900">{stats.riskyPlaces.length}<span className="text-sm font-normal text-slate-400 ml-1">곳</span></div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>
                <span className="font-bold text-slate-500 uppercase text-xs">처리 대기 제보</span>
             </div>
             <div className="text-3xl font-extrabold text-slate-900">{stats.pendingCount}<span className="text-sm font-normal text-slate-400 ml-1">건</span></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                <span className="font-bold text-slate-500 uppercase text-xs">추정 절감 시간</span>
             </div>
             <div className="text-3xl font-extrabold text-slate-900">12.5<span className="text-sm font-normal text-slate-400 ml-1">시간 (주간)</span></div>
          </div>
       </div>

       <div className="grid lg:grid-cols-2 gap-8">
          {/* Risky Places List */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">오늘의 리스크 Top 5</h3>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">주의 요망</span>
             </div>
             <div className="divide-y divide-slate-100">
                {stats.riskyPlaces.length === 0 ? (
                   <div className="p-8 text-center text-slate-400">위험 등급 장소가 없습니다.</div>
                ) : (
                   stats.riskyPlaces.map(p => (
                      <div key={p.id} className="p-5 flex justify-between items-center hover:bg-slate-50">
                         <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{p.address}</div>
                         </div>
                         <div className="text-right">
                            {p.score.riskGrade === RiskGrade.D && <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded mb-1">Grade D</span>}
                            {p.score.trustDetails.label === TrustLabel.LOW && <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">신뢰도 낮음</span>}
                         </div>
                      </div>
                   ))
                )}
             </div>
          </section>

          {/* Recent Announcements */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">최근 공지 사항</h3>
                <button onClick={() => navigate('/dispatch/announce')} className="text-sm text-blue-600 font-bold hover:underline">전체 보기</button>
             </div>
             <div className="divide-y divide-slate-100">
                {stats.recentAnnouncements.length === 0 ? (
                   <div className="p-8 text-center text-slate-400">등록된 공지사항이 없습니다.</div>
                ) : (
                   stats.recentAnnouncements.map(a => (
                      <div key={a.id} className="p-5">
                         <div className="flex justify-between mb-1">
                            <span className="font-bold text-slate-800">{a.title}</span>
                            <span className="text-xs text-slate-400">{a.createdAt.split('T')[0]}</span>
                         </div>
                         <p className="text-sm text-slate-600 line-clamp-2">{a.content}</p>
                      </div>
                   ))
                )}
             </div>
          </section>
       </div>
    </div>
  );
};
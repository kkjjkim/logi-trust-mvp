import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Truck, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ConstraintStatus } from '../types';

export const DriverHome: React.FC = () => {
  const { places, getPlaceConstraints, getConstraintStatus, getPlaceScore } = useAppStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const filteredPlaces = searchTerm 
    ? places.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.includes(searchTerm))
    : [];

  const handleSelectPlace = (id: string) => {
    setSelectedPlaceId(id);
    setSearchTerm('');
  };

  const selectedPlace = selectedPlaceId ? places.find(p => p.id === selectedPlaceId) : null;
  const constraints = selectedPlaceId ? getPlaceConstraints(selectedPlaceId) : [];
  const score = selectedPlaceId ? getPlaceScore(selectedPlaceId) : null;

  // Key constraints for 10s check
  const keyKeys = ['height', 'dock', 'wait', 'forklift', 'time'];
  const keyConstraints = constraints.filter(c => keyKeys.includes(c.fieldKey));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. 10s Check Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold uppercase tracking-wider text-sm">
             <Clock className="w-4 h-4" /> 출발 전 10초 체크
          </div>
          <h1 className="text-3xl font-extrabold mb-6">목적지를 검색하고<br/>핵심 정보를 즉시 확인하세요.</h1>
          
          {/* Search Input */}
          <div className="relative max-w-xl">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
             </div>
             <input 
                type="text"
                placeholder="상차지/하차지 명칭 또는 주소 검색..."
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-blue-500/30 transition-all backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSelectedPlaceId(null); }}
             />
             
             {/* Search Dropdown */}
             {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-20 text-slate-900 max-h-60 overflow-y-auto">
                   {filteredPlaces.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">검색 결과가 없습니다.</div>
                   ) : (
                      filteredPlaces.map(p => (
                         <div 
                            key={p.id} 
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                            onClick={() => handleSelectPlace(p.id)}
                         >
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.address}</div>
                         </div>
                      ))
                   )}
                </div>
             )}
          </div>
        </div>
      </section>

      {/* 2. Result Card (Visible when place selected) */}
      {selectedPlace && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPlace.name}</h2>
                    <p className="text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedPlace.address}</p>
                 </div>
                 <button 
                    onClick={() => navigate(`/driver/places/${selectedPlace.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1 transition-colors"
                 >
                    상세보기 <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                 {keyConstraints.length > 0 ? keyConstraints.map(c => {
                    const status = getConstraintStatus(selectedPlace.id, c.fieldKey);
                    const isWarning = status === ConstraintStatus.DISPUTED;
                    
                    return (
                        <div key={c.id} className={`p-4 rounded-xl border ${isWarning ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} shadow-sm`}>
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase text-slate-500">{c.label}</span>
                              {status === ConstraintStatus.CONFIRMED && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                              {isWarning && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                           </div>
                           <div className={`text-xl font-extrabold ${isWarning ? 'text-red-700' : 'text-slate-900'}`}>
                              {c.value} <span className="text-sm font-normal text-slate-500">{c.unit}</span>
                           </div>
                           {isWarning && <div className="text-xs text-red-600 mt-1 font-bold">⚠️ 정보 상충 발생 (확인 필요)</div>}
                        </div>
                    );
                 }) : (
                     <div className="col-span-2 text-center py-8 text-slate-400">
                        등록된 핵심 정보가 없습니다. 상세보기를 통해 제보해주세요.
                     </div>
                 )}
              </div>
              
              {/* Trust Score Warning */}
              {score && score.trustDetails.label === 'LOW' && (
                  <div className="bg-orange-50 p-4 border-t border-orange-100 flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                     <div>
                        <h4 className="font-bold text-orange-800 text-sm">신뢰도 주의 단계</h4>
                        <p className="text-xs text-orange-700 mt-1">검증되지 않은 정보나 상충되는 제보가 많습니다. 현장 상황을 주의 깊게 확인하세요.</p>
                     </div>
                  </div>
              )}
           </div>
        </section>
      )}

      {/* 3. Quick Access */}
      <section className="grid sm:grid-cols-2 gap-4">
         <div 
            onClick={() => navigate('/driver/places')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
         >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
               <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">전체 장소 목록</h3>
            <p className="text-sm text-slate-500 mt-1">등록된 모든 상하차지를 둘러보세요.</p>
         </div>
         
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group opacity-60">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
               <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">즐겨찾는 장소 (준비중)</h3>
            <p className="text-sm text-slate-500 mt-1">자주 가는 곳을 빠르게 확인하세요.</p>
         </div>
      </section>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../services/store';
import { Link } from 'react-router-dom';
import { RiskBadge, TrustBadge } from '../components/Badges';
import { Search, MapPin, Building2, Anchor, ChevronRight, Map as MapIcon } from 'lucide-react';
import { MapModal } from '../components/MapModal';

export const PlaceList: React.FC = () => {
  const { places, getPlaceScore } = useAppStore();
  const [term, setTerm] = useState('');
  const [mapModal, setMapModal] = useState<{ isOpen: boolean; placeName: string; address: string; }>({ isOpen: false, placeName: '', address: '' });

  const filtered = useMemo(() => {
    return places.filter(p => 
      p.name.toLowerCase().includes(term.toLowerCase()) || 
      p.address.toLowerCase().includes(term.toLowerCase())
    );
  }, [places, term]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PORT': return <Anchor className="h-5 w-5 text-blue-500" />;
      case 'WAREHOUSE': return <Building2 className="h-5 w-5 text-slate-500" />;
      default: return <MapPin className="h-5 w-5 text-slate-500" />;
    }
  };

  const openMap = (e: React.MouseEvent, place: {name: string, address: string}) => {
    e.preventDefault(); // Prevent Link navigation
    setMapModal({ isOpen: true, placeName: place.name, address: place.address });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center space-y-6">
         <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">어디로 가시나요?</h1>
          <p className="text-slate-500 max-w-xl mx-auto">상차지/하차지의 정확한 제약 정보와 위험 요소를 미리 확인하고 안전하게 운행하세요.</p>
         </div>
         
         <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-base"
            placeholder="상호명, 주소, 또는 센터명 검색..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(place => {
          const score = getPlaceScore(place.id);
          return (
            <Link key={place.id} to={`/driver/places/${place.id}`} className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                    {getTypeIcon(place.placeType)}
                  </div>
                  <RiskBadge grade={score.riskGrade} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{place.name}</h3>
                  <div className="flex items-start justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-start gap-1">
                       <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                       <span className="line-clamp-2">{place.address}</span>
                    </div>
                    <button 
                      onClick={(e) => openMap(e, place)}
                      className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
                      title="지도 보기 (Demo)"
                    >
                      <MapIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <TrustBadge label={score.trustDetails.label} />
                  <span className="text-xs font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                    상세 정보 <ChevronRight className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 p-4 rounded-full inline-block mb-3">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">검색 결과가 없습니다</h3>
          <p className="text-slate-500 mt-1">다른 검색어를 입력해보시거나 새로운 장소를 등록해주세요.</p>
        </div>
      )}

      {/* Shared Map Modal */}
      <MapModal 
        isOpen={mapModal.isOpen}
        onClose={() => setMapModal({ ...mapModal, isOpen: false })}
        provider="NAVER" // Default to Naver for quick view in list
        placeName={mapModal.placeName}
        address={mapModal.address}
      />
    </div>
  );
};
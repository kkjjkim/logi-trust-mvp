import React, { useState } from 'react';
import { X, Navigation, Map } from 'lucide-react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  provider: 'NAVER' | 'GOOGLE';
  address: string;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, placeName, provider, address }) => {
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleNavigation = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isNaver = provider === 'NAVER';
  const providerName = isNaver ? '네이버 지도' : '구글 지도';
  const headerColor = isNaver ? 'bg-[#03C75A]' : 'bg-[#4285F4]';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`${headerColor} px-4 py-3 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            <span className="font-bold">{providerName} 미리보기 (Demo)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Body (Image Placeholder) */}
        <div className="relative aspect-video bg-slate-100 w-full overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
            alt="Map Placeholder" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Mock Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className={`px-2 py-1 bg-white rounded shadow-md text-xs font-bold mb-1 ${isNaver ? 'text-green-600' : 'text-blue-600'}`}>
              {placeName}
            </div>
            <div className={`w-8 h-8 ${isNaver ? 'text-[#03C75A]' : 'text-[#EA4335]'}`}>
               <svg viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-md">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
             <p className="text-xs font-light opacity-90 text-center">
               이 화면은 MVP 데모이며 실제 서비스에서는 {providerName} 앱/웹으로 연결됩니다.
             </p>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="p-5">
           <div className="mb-4">
             <h4 className="font-bold text-slate-900 text-lg mb-1">{placeName}</h4>
             <p className="text-sm text-slate-500">{address}</p>
           </div>
           
           <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
             >
               닫기
             </button>
             <button 
               onClick={handleNavigation}
               className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${isNaver ? 'bg-[#03C75A]' : 'bg-[#4285F4]'}`}
             >
               <Navigation className="h-4 w-4" />
               길안내 시작 (데모)
             </button>
           </div>
        </div>

        {/* Demo Toast */}
        {showToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg animate-in slide-in-from-top-2 fade-in">
             🚀 실제 서비스에서는 {providerName} 길안내로 연결됩니다.
          </div>
        )}
      </div>
    </div>
  );
};
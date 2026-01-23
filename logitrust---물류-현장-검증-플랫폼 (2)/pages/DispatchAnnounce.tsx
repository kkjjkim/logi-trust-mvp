import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { Role } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, CheckCircle } from 'lucide-react';

export const DispatchAnnounce: React.FC = () => {
  const { places, addAnnouncement, currentUser } = useAppStore();
  const navigate = useNavigate();
  
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (currentUser?.role !== Role.DISPATCH) return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPlaceId || !title || !content) return;
      
      addAnnouncement({
          placeId: selectedPlaceId,
          title,
          content,
          createdBy: currentUser.id
      });
      
      alert('공지사항이 등록되었습니다. 해당 장소 상세 페이지에 노출됩니다.');
      navigate('/dispatch');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <button onClick={() => navigate('/dispatch')} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> 대시보드로 돌아가기
       </button>
       
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Megaphone className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-extrabold text-slate-900">공지사항 작성</h1>
                <p className="text-slate-500">기사님들에게 중요한 현장 변동 사항을 전파하세요.</p>
             </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">대상 장소</label>
                <select 
                   className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                   value={selectedPlaceId}
                   onChange={e => setSelectedPlaceId(e.target.value)}
                >
                   {places.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
                   ))}
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">공지 제목</label>
                <input 
                   type="text" 
                   className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="예: 추석 연휴 기간 운영 안내"
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   required
                />
             </div>
             
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">상세 내용</label>
                <textarea 
                   rows={5}
                   className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="전달하실 내용을 상세히 적어주세요."
                   value={content}
                   onChange={e => setContent(e.target.value)}
                   required
                />
             </div>
             
             <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                   <CheckCircle className="w-5 h-5" /> 공지 등록하기
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};
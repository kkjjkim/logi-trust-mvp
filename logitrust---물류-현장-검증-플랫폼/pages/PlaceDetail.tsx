import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../services/store';
import { RiskBadge, TrustBadge, StatusBadge } from '../components/Badges';
import { MapModal } from '../components/MapModal';
import { MapPin, Edit2, Star, Plus, Info, MessageSquare, Shield, History, ArrowRight, Camera, X, Map as MapIcon } from 'lucide-react';
import { Role, ConstraintStatus } from '../types';
import { MOCK_IMAGES } from '../services/mockData';

export const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { places, getPlaceScore, getPlaceConstraints, getConstraintStatus, getPlaceVersions, reviews, currentUser, submitEditRequest, addReview } = useAppStore();
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'history'>('info');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const place = places.find(p => p.id === id);
  const constraints = useMemo(() => id ? getPlaceConstraints(id) : [], [id, getPlaceConstraints]);
  const placeVersions = useMemo(() => id ? getPlaceVersions(id) : [], [id, getPlaceVersions]);
  const placeReviews = useMemo(() => reviews.filter(r => r.placeId === id), [id, reviews]);
  const score = id ? getPlaceScore(id) : null;

  // Map Modal State
  const [mapModal, setMapModal] = useState<{ isOpen: boolean; provider: 'NAVER' | 'GOOGLE' }>({ isOpen: false, provider: 'NAVER' });

  // Edit Request State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<{key: string, label: string, current: string, id?: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNote, setEditNote] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);

  // Review State
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewTags, setReviewTags] = useState('');

  if (!place || !score) return <div className="p-8 text-center text-slate-500">장소를 찾을 수 없습니다.</div>;

  const handleEditClick = (c: any) => {
    setEditingConstraint({ key: c.fieldKey, label: c.label, current: c.value, id: c.id });
    setEditValue(c.value);
    setEditNote('');
    setSelectedEvidence([]);
    setEditModalOpen(true);
  };

  const handleNewConstraintClick = () => {
    setEditingConstraint({ key: 'custom', label: '새로운 제약정보', current: '', id: undefined });
    setEditValue('');
    setEditNote('');
    setSelectedEvidence([]);
    setEditModalOpen(true);
  };

  const toggleEvidence = (url: string) => {
    if (selectedEvidence.includes(url)) {
      setSelectedEvidence(prev => prev.filter(u => u !== url));
    } else {
      setSelectedEvidence(prev => [...prev, url]);
    }
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConstraint) return;
    submitEditRequest({
      placeId: place.id,
      constraintId: editingConstraint.id,
      fieldKey: editingConstraint.key === 'custom' ? `custom-${Date.now()}` : editingConstraint.key,
      fieldLabel: editingConstraint.key === 'custom' ? editValue.split(':')[0] || '기타 정보' : editingConstraint.label,
      currentValue: editingConstraint.current,
      requestedValue: editingConstraint.key === 'custom' ? editValue.split(':')[1] || editValue : editValue,
      requestedBy: currentUser?.id || 'unknown',
      note: editNote,
      evidenceFiles: selectedEvidence
    });
    setEditModalOpen(false);
    alert('정보 수정 요청이 제출되었습니다. 운영팀 검수 후 반영됩니다.');
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addReview({
      placeId: place.id,
      userId: currentUser.id,
      rating: reviewRating,
      tipText: reviewText,
      tags: reviewTags.split(',').map(t => t.trim()).filter(t => t),
      hiddenFlag: false
    });
    setReviewModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-blue-900 opacity-90"></div>
        </div>
        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-10">
            <div>
              <div className="bg-white p-1 rounded-xl shadow-lg inline-block mb-4">
                 <div className="bg-slate-100 p-3 rounded-lg">
                   <MapPin className="h-8 w-8 text-slate-700" />
                 </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{place.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                 <p className="text-slate-500 flex items-center font-medium">
                   {place.address}
                 </p>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setMapModal({ isOpen: true, provider: 'NAVER' })}
                      className="text-[10px] font-bold px-2 py-1 bg-[#03C75A] text-white rounded hover:bg-opacity-90 transition-colors"
                    >
                      네이버 지도
                    </button>
                    <button 
                      onClick={() => setMapModal({ isOpen: true, provider: 'GOOGLE' })}
                      className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                    >
                      구글 지도
                    </button>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 items-start md:items-end">
               <div className="flex items-center gap-3 relative">
                 <RiskBadge grade={score.riskGrade} />
                 <TrustBadge label={score.trustDetails.label} onClick={() => setShowScoreBreakdown(!showScoreBreakdown)} />
                 
                 {/* Score Breakdown Toggle */}
                 {showScoreBreakdown && (
                   <div className="absolute top-10 right-0 z-10 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                         <h4 className="font-bold text-slate-900 text-sm">신뢰도 점수 상세</h4>
                         <span className="text-blue-600 font-extrabold">{score.trustDetails.totalScore}점</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600">
                         <li className="flex justify-between">
                            <span>기본 데이터 (검증율)</span>
                            <span className="text-emerald-600">+{score.trustDetails.confirmedRatioScore}</span>
                         </li>
                         <li className="flex justify-between">
                            <span>최신 업데이트 보너스</span>
                            <span className="text-emerald-600">+{score.trustDetails.recencyBonus}</span>
                         </li>
                         <li className="flex justify-between">
                            <span>검증 대기 패널티</span>
                            <span className="text-orange-500">-{score.trustDetails.pendingPenalty}</span>
                         </li>
                         <li className="flex justify-between">
                            <span>상충/분쟁 패널티</span>
                            <span className="text-red-500 font-bold">-{score.trustDetails.disputedPenalty}</span>
                         </li>
                      </ul>
                      <div className="mt-3 text-[10px] text-slate-400 bg-slate-50 p-2 rounded">
                         * 상충(DISPUTED) 발생 시 점수가 크게 하락하며 운영팀의 긴급 확인이 필요합니다.
                      </div>
                   </div>
                 )}
               </div>
               {currentUser?.role === Role.DRIVER && (
                  <button 
                    onClick={() => setReviewModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-200 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Star className="h-4 w-4" />
                    리뷰 작성
                  </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Tabs & Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden">
             {/* Tab Header */}
            <div className="border-b border-slate-100 flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Info className="h-4 w-4" /> 제약정보
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" /> 현장 리뷰 <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1">{placeReviews.length}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="h-4 w-4" /> 변경 이력
                </div>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">상세 제약 조건</h3>
                    {currentUser?.role === Role.DRIVER && (
                      <button onClick={handleNewConstraintClick} className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                        <Plus className="h-4 w-4 mr-1" /> 정보 제보
                      </button>
                    )}
                  </div>
                  
                  {constraints.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-500">등록된 제약 정보가 없습니다.</p>
                      <button onClick={handleNewConstraintClick} className="mt-2 text-blue-600 font-semibold text-sm">첫 번째 정보를 등록해주세요</button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {constraints.map(c => {
                          const effectiveStatus = getConstraintStatus(place.id, c.fieldKey);
                          return (
                            <div key={c.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
                                  <p className="text-lg font-bold text-slate-800">{c.value} <span className="text-sm font-normal text-slate-500">{c.unit}</span></p>
                                </div>
                                {currentUser?.role === Role.DRIVER && (
                                  <button 
                                    onClick={() => handleEditClick(c)}
                                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    title="수정 제보"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                                 <StatusBadge status={effectiveStatus} />
                                 <span className="text-xs text-slate-400 font-mono">{c.updatedAt.split('T')[0]}</span>
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                   <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">기사님들의 생생 리뷰</h3>
                  </div>
                  {placeReviews.length === 0 ? (
                     <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-500">아직 등록된 리뷰가 없습니다.</p>
                    </div>
                  ) : (
                    placeReviews.map(r => (
                      <div key={r.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {r.userName[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{r.userName}</div>
                              <div className="text-xs text-slate-400">{r.createdAt.split('T')[0]}</div>
                            </div>
                          </div>
                          <div className="flex bg-white px-2 py-1 rounded-md border border-slate-200">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3 bg-white p-3 rounded-lg border border-slate-100">
                          "{r.tipText}"
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {r.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white text-slate-600 border border-slate-200 shadow-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-900 text-lg">정보 변경 이력 (Audit Log)</h3>
                    </div>
                    {placeVersions.length === 0 ? (
                       <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500">변경 내역이 없습니다.</p>
                      </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2">
                           {placeVersions.map(v => (
                               <div key={v.id} className="relative pl-8">
                                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <div className="flex justify-between items-start mb-2">
                                          <div>
                                              <span className="text-xs font-bold text-slate-500 uppercase">{v.createdAt.split('T')[0]}</span>
                                              <h4 className="font-bold text-slate-900">{v.label} 변경</h4>
                                          </div>
                                          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600">승인: {v.approvedBy}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm mt-2 p-2 bg-slate-50 rounded-lg">
                                          <span className="text-slate-400 line-through">{v.oldValue}</span>
                                          <ArrowRight className="h-3 w-3 text-slate-400" />
                                          <span className="font-bold text-emerald-600">{v.newValue}</span>
                                      </div>
                                   </div>
                               </div>
                           ))}
                        </div>
                    )}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar / Summary (Desktop) */}
        <div className="hidden lg:block space-y-6">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" /> 신뢰도 점수
              </h3>
              <div className="flex items-end gap-2 mb-2">
                 <span className="text-4xl font-extrabold">{score.trustDetails.totalScore}</span>
                 <span className="text-sm text-slate-400 mb-1">/ 100</span>
              </div>
              <p className="text-sm text-slate-300 opacity-80 leading-relaxed">
                현재 데이터는 운영팀에 의해 검증된 상태입니다. {score.trustDetails.label === 'LOW' && '상충된 정보가 있어 확인이 필요합니다.'}
              </p>
           </div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal 
        isOpen={mapModal.isOpen}
        onClose={() => setMapModal({ ...mapModal, isOpen: false })}
        provider={mapModal.provider}
        placeName={place.name}
        address={place.address}
      />

      {/* Edit Modal (Keeping functionality, improving UI) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all my-8">
            <h3 className="text-xl font-bold mb-1 text-slate-900">정보 수정 제보</h3>
            <p className="text-sm text-slate-500 mb-6">정확한 정보를 위해 내용을 수정해주세요. 즉시 반영되지 않고 운영팀 검수를 거칩니다.</p>
            
            <form onSubmit={submitEdit}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">항목</label>
                <div className="text-slate-900 font-semibold bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                  {editingConstraint?.label}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">제보할 내용</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={editingConstraint?.key === 'custom' ? '예) 높이제한: 3.5m' : '정확한 값을 입력하세요'}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">변경 사유 / 메모 (선택)</label>
                <textarea 
                  className="w-full border border-slate-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-sm"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="예: 최근 공사로 인해 변경됨"
                  rows={2}
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">증빙 사진 첨부 (데모용 Mock 선택)</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOCK_IMAGES.slice(0, 4).map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedEvidence.includes(img) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}
                      onClick={() => toggleEvidence(img)}
                    >
                       <img src={img} alt="mock evidence" className="w-full h-full object-cover" />
                       {selectedEvidence.includes(img) && (
                         <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                           <div className="bg-blue-500 text-white rounded-full p-0.5">
                             <CheckIcon className="w-3 h-3" />
                           </div>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">* 실제 업로드 대신 샘플 이미지를 선택하여 첨부합니다.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">취소</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">제보하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-1">리뷰 작성</h3>
            <p className="text-sm text-slate-500 mb-6">동료 기사님들을 위해 팁을 공유해주세요.</p>
            
            <form onSubmit={submitReview}>
              <div className="mb-5 text-center">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">만족도</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`transition-transform hover:scale-110 ${star <= reviewRating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      <Star className="h-10 w-10 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">팁 / 코멘트</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="예: 점심시간 피하세요, 직원 친절함..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">태그</label>
                <input 
                  type="text"
                  className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={reviewTags}
                  onChange={(e) => setReviewTags(e.target.value)}
                  placeholder="빠른하차, 대기공간없음"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">취소</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
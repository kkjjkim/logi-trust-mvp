import React, { useMemo, useState } from 'react';
import { useAppStore } from '../services/store';
import { RequestStatus, Role, EditRequest, ConstraintStatus } from '../types';
import { Check, X, Clock, AlertTriangle, ArrowRight, User, FileText, ChevronDown, ChevronUp, Image as ImageIcon, BarChart } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export const OpsDashboard: React.FC = () => {
  const { requests, places, processRequest, currentUser, getConstraintStatus } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const pendingRequests = useMemo(() => 
    requests
      .filter(r => r.status === RequestStatus.PENDING)
      .sort((a, b) => {
        // Prioritize DISPUTED items
        const statusA = getConstraintStatus(a.placeId, a.fieldKey);
        const statusB = getConstraintStatus(b.placeId, b.fieldKey);
        if (statusA === ConstraintStatus.DISPUTED && statusB !== ConstraintStatus.DISPUTED) return -1;
        if (statusB === ConstraintStatus.DISPUTED && statusA !== ConstraintStatus.DISPUTED) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      }), 
    [requests, getConstraintStatus]
  );

  const historyRequests = useMemo(() => 
    requests.filter(r => r.status !== RequestStatus.PENDING).slice(0, 10), // Recent 10
    [requests]
  );

  if (currentUser?.role !== Role.OPS) {
    return <Navigate to="/" />;
  }

  const getPlaceName = (id: string) => places.find(p => p.id === id)?.name || id;

  const handleAction = (id: string, action: RequestStatus) => {
    if (!reviewerNote.trim()) {
      alert("검수 사유(Note)를 반드시 입력해야 합니다.");
      return;
    }
    processRequest(id, action, reviewerNote);
    setReviewerNote('');
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setReviewerNote('');
    } else {
      setExpandedId(id);
      setReviewerNote('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">운영 대시보드</h1>
          <p className="text-slate-500 mt-1">현장 데이터 품질 관리 및 수정 요청 검수</p>
        </div>
        <div className="flex items-center gap-4">
           <Link to="/ops/report" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">
              <BarChart className="h-4 w-4" />
              월간 리포트
           </Link>
           <div className="text-right">
              <div className="text-sm font-medium text-slate-500">대기 중인 요청</div>
              <div className="text-3xl font-extrabold text-blue-600">{pendingRequests.length} <span className="text-lg text-slate-400 font-normal">건</span></div>
           </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900">검수 대기 (Pending)</h2>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">모든 요청이 처리되었습니다</h3>
            <p className="text-slate-500">새로운 제보가 들어오면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(req => {
               const isDisputed = getConstraintStatus(req.placeId, req.fieldKey) === ConstraintStatus.DISPUTED;
               return (
              <div key={req.id} className={`bg-white rounded-xl shadow-sm border ${expandedId === req.id ? 'border-blue-400 ring-1 ring-blue-100' : isDisputed ? 'border-red-300 bg-red-50/10' : 'border-slate-200'} transition-all`}>
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50/50 rounded-xl"
                  onClick={() => toggleExpand(req.id)}
                >
                   <div className="flex items-center gap-4 flex-1">
                     <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold text-xs ${isDisputed ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isDisputed ? <AlertTriangle className="h-5 w-5 mb-1" /> : <FileText className="h-5 w-5 mb-1" />}
                        {isDisputed ? 'DISPUTE' : 'REQ'}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                            {req.fieldLabel}
                          </span>
                          <h4 className="font-bold text-slate-900">{getPlaceName(req.placeId)}</h4>
                          {req.evidenceFiles && req.evidenceFiles.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> 증빙포함
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                           <User className="h-3 w-3" /> {req.requestedByName} ({req.requestedByRole}) 
                           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                           {req.createdAt.split('T')[0]}
                        </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="flex items-center gap-3 text-sm">
                         <span className="text-slate-400 line-through">{req.currentValue || '(공란)'}</span>
                         <ArrowRight className="h-4 w-4 text-slate-300" />
                         <span className="font-bold text-orange-600">{req.requestedValue}</span>
                      </div>
                      {expandedId === req.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                   </div>
                </div>

                {expandedId === req.id && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                     {isDisputed && (
                       <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                         <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                         <div>
                           <h5 className="text-sm font-bold text-red-700">상충 발생 (Dispute Detected)</h5>
                           <p className="text-xs text-red-600 mt-1">동일 항목에 대해 서로 다른 요청값이 존재합니다. 현장 확인 후 신중히 결정해주세요.</p>
                         </div>
                       </div>
                     )}

                     <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">요청자 노트</label>
                        <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 italic">
                          "{req.note || '내용 없음'}"
                        </div>
                     </div>

                     {req.evidenceFiles && req.evidenceFiles.length > 0 && (
                       <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">증빙 자료</label>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {req.evidenceFiles.map((src, i) => (
                              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:opacity-90">
                                <img src={src} alt="evidence" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                       </div>
                     )}
                     
                     <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">검수 사유 (Reviewer Note) <span className="text-red-500">*</span></label>
                        <textarea 
                          className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="승인 또는 반려 사유를 입력하세요 (필수)"
                          value={reviewerNote}
                          onChange={(e) => setReviewerNote(e.target.value)}
                        />
                     </div>

                     <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleAction(req.id, RequestStatus.HOLD)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
                        >
                          보류 (Hold)
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, RequestStatus.REJECTED)}
                          className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm"
                        >
                          반려 (Reject)
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, RequestStatus.APPROVED)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm"
                        >
                          승인 (Approve)
                        </button>
                     </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-slate-300 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900">최근 처리 내역</h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">장소</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">항목</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">제보값</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">메모</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {historyRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === RequestStatus.APPROVED ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">승인됨</span>
                      ) : req.status === RequestStatus.REJECTED ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">반려됨</span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">보류</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getPlaceName(req.placeId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.fieldLabel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{req.requestedValue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 italic">{req.reviewerNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
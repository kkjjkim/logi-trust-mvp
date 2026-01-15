import React, { useState, useMemo } from 'react';
import { useAppStore } from '../services/store';
import { Role, RequestStatus, RiskGrade } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export const OpsReport: React.FC = () => {
  const { requests, places, getPlaceScore, currentUser, generateCsvReport } = useAppStore();
  const [period, setPeriod] = useState<7 | 30>(30);

  const stats = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - period);

    const periodRequests = requests.filter(r => new Date(r.createdAt) >= startDate);
    
    // Stats: Request Status
    const approved = periodRequests.filter(r => r.status === RequestStatus.APPROVED).length;
    const rejected = periodRequests.filter(r => r.status === RequestStatus.REJECTED).length;
    const pending = periodRequests.filter(r => r.status === RequestStatus.PENDING).length;

    // Stats: Top Fields
    const fieldCounts: Record<string, number> = {};
    periodRequests.forEach(r => {
        fieldCounts[r.fieldLabel] = (fieldCounts[r.fieldLabel] || 0) + 1;
    });
    const topFields = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Stats: Risky Places
    const riskyPlaces = places
        .map(p => ({ ...p, score: getPlaceScore(p.id) }))
        .filter(p => p.score.riskGrade === RiskGrade.D)
        .slice(0, 5);

    // Stats: Disputed Places (Low Trust + Disputed Penalty)
    const disputedPlaces = places
        .map(p => ({ ...p, score: getPlaceScore(p.id) }))
        .filter(p => p.score.trustDetails.disputedPenalty > 0)
        .sort((a, b) => b.score.trustDetails.disputedPenalty - a.score.trustDetails.disputedPenalty)
        .slice(0, 5);

    return {
        total: periodRequests.length,
        approved,
        rejected,
        pending,
        topFields,
        riskyPlaces,
        disputedPlaces
    };
  }, [requests, places, getPlaceScore, period]);

  const handleDownload = () => {
      const csvContent = generateCsvReport(period);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `logitrust_report_${period}days.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (currentUser?.role !== Role.OPS) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link to="/ops" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">운영 월간 리포트</h1>
                    <p className="text-slate-500 text-sm">데이터 품질 현황 및 처리 통계</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex bg-white border border-slate-300 rounded-lg p-1">
                    <button 
                        onClick={() => setPeriod(7)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === 7 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        최근 7일
                    </button>
                    <button 
                        onClick={() => setPeriod(30)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === 30 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        최근 30일
                    </button>
                </div>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm"
                >
                    <Download className="h-4 w-4" /> CSV 내보내기
                </button>
            </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total Requests</div>
                <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-400 mt-1">지난 {period}일간</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-emerald-600 text-xs font-bold uppercase mb-2">Approved</div>
                <div className="text-3xl font-extrabold text-emerald-600">{stats.approved}</div>
                <div className="text-xs text-slate-400 mt-1">승인율 {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-red-500 text-xs font-bold uppercase mb-2">Rejected</div>
                <div className="text-3xl font-extrabold text-red-500">{stats.rejected}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-blue-500 text-xs font-bold uppercase mb-2">Pending</div>
                <div className="text-3xl font-extrabold text-blue-500">{stats.pending}</div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Top Requested Fields */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" /> 최다 수정 요청 항목
                </div>
                <div className="p-4">
                    {stats.topFields.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">데이터 없음</p> : (
                        <ul className="space-y-3">
                            {stats.topFields.map(([field, count], idx) => (
                                <li key={field} className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                        {field}
                                    </span>
                                    <span className="font-bold text-slate-900">{count}건</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Disputed Places */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> 상충(Dispute) 발생 장소
                </div>
                <div className="p-4">
                     {stats.disputedPlaces.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">상충 장소 없음</p> : (
                        <ul className="space-y-3">
                            {stats.disputedPlaces.map(p => (
                                <li key={p.id} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{p.name}</span>
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                                        -{p.score.trustDetails.disputedPenalty}점
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Risky Places */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" /> 위험도 D등급 장소
                </div>
                <div className="p-4">
                    {stats.riskyPlaces.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">위험 장소 없음</p> : (
                        <ul className="space-y-3">
                            {stats.riskyPlaces.map(p => (
                                <li key={p.id} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{p.name}</span>
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">Grade D</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
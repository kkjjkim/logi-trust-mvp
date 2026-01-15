import React from 'react';
import { RiskGrade, TrustLabel, ConstraintStatus } from '../types';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const RiskBadge: React.FC<{ grade: RiskGrade }> = ({ grade }) => {
  const styles = {
    [RiskGrade.A]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [RiskGrade.B]: 'bg-blue-50 text-blue-700 border-blue-200',
    [RiskGrade.C]: 'bg-orange-50 text-orange-700 border-orange-200',
    [RiskGrade.D]: 'bg-red-50 text-red-700 border-red-200',
  };

  const gradeText = {
    [RiskGrade.A]: '안전 (A)',
    [RiskGrade.B]: '양호 (B)',
    [RiskGrade.C]: '주의 (C)',
    [RiskGrade.D]: '위험 (D)',
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shadow-sm ${styles[grade]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${grade === RiskGrade.A ? 'bg-emerald-500' : grade === RiskGrade.B ? 'bg-blue-500' : grade === RiskGrade.C ? 'bg-orange-500' : 'bg-red-500'}`}></div>
      <span>{gradeText[grade]}</span>
    </div>
  );
};

export const TrustBadge: React.FC<{ label: TrustLabel, onClick?: () => void }> = ({ label, onClick }) => {
  const colors = {
    [TrustLabel.HIGH]: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    [TrustLabel.MEDIUM]: 'text-slate-600 bg-slate-100 border-slate-200',
    [TrustLabel.LOW]: 'text-orange-600 bg-orange-50 border-orange-100',
  };

  const labelText = {
    [TrustLabel.HIGH]: '신뢰도 높음',
    [TrustLabel.MEDIUM]: '신뢰도 보통',
    [TrustLabel.LOW]: '신뢰도 낮음',
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${colors[label]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <Shield className="h-3 w-3" />
      <span>{labelText[label]}</span>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: ConstraintStatus }> = ({ status }) => {
  if (status === ConstraintStatus.CONFIRMED) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle className="w-3 h-3"/> 검증됨</span>;
  }
  if (status === ConstraintStatus.DISPUTED) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 animate-pulse"><AlertCircle className="w-3 h-3"/> 상충/분쟁</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"><Clock className="w-3 h-3"/> 검수대기</span>;
};
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Award, DollarSign, Mail, Sparkles, AlertTriangle, Send } from 'lucide-react';
import { calculateAccruedSalary } from '../utils/calculations';

export const DecisionActionModal: React.FC = () => {
  const { 
    decisionModalEmployee, 
    setDecisionModalEmployee, 
    promoteToThreeMonths, 
    endEmployeeTrial, 
    attendanceRecords,
    currentDate,
    settings,
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';
  const emp = decisionModalEmployee;

  const [decisionType, setDecisionType] = useState<'upgrade' | 'terminate'>('upgrade');
  const [newSalary, setNewSalary] = useState(emp ? emp.baseSalary : 250);
  const [customMessage, setCustomMessage] = useState('');

  if (!emp) return null;

  const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);

  const handleConfirm = () => {
    if (decisionType === 'upgrade') {
      promoteToThreeMonths(emp.id, Number(newSalary) || emp.baseSalary, customMessage);
    } else {
      endEmployeeTrial(emp.id, customMessage);
    }
    setDecisionModalEmployee(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">{t.decisionModalTitle}</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{emp.name} ({emp.email})</p>
            </div>
          </div>
          <button
            onClick={() => setDecisionModalEmployee(null)}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Decision Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecisionType('upgrade')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                decisionType === 'upgrade'
                  ? 'bg-[#E06D28]/15 border-[#E06D28] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#17181D] border-[#2D3039] text-[#9CA3AF] hover:text-[#FFFFFF]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#E06D28] mx-auto mb-1.5 stroke-[1.75]" />
              <span className="font-bold text-xs block">{t.upgradeTo3Months}</span>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isAr ? 'تثبيت بعقد رسمي' : 'Promote & Retain'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDecisionType('terminate')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                decisionType === 'terminate'
                  ? 'bg-[#F43F5E]/15 border-[#F43F5E] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#17181D] border-[#2D3039] text-[#9CA3AF] hover:text-[#FFFFFF]'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-[#FB7185] mx-auto mb-1.5 stroke-[1.75]" />
              <span className="font-bold text-xs block">{t.endTrial}</span>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isAr ? 'إنهاء التجربة ودياً' : 'Conclude Trial'}</span>
            </button>
          </div>

          {/* Salary Adjustment for 3-Month Contract */}
          {decisionType === 'upgrade' && (
            <div className="space-y-2 p-3.5 bg-[#17181D] rounded-xl border border-[#2D3039]">
              <label className="block text-xs font-bold text-[#F3F4F6]">
                {isAr ? 'تثبيت الراتب الشهري لعقد الـ 3 أشهر ($ USD)' : 'Monthly Base Salary ($ USD)'}
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#FB923C] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  className="w-full bg-[#1F2127] border border-[#2D3039] rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs font-bold text-[#FB923C] focus:outline-none focus:border-[#E06D28]"
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                {isAr ? 'الراتب التجريبي الحالي كان: $' + emp.baseSalary : `Current trial salary was $${emp.baseSalary}`}
              </p>
            </div>
          )}

          {/* Custom Message */}
          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
              {isAr ? 'ملاحظة خاصة أو توجيه للموظف بالإيميل' : 'Custom Note in Email Notification'}
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={
                decisionType === 'upgrade'
                  ? (isAr ? 'مثال: أداء ممتاز يا بطل! يسعدنا استمرارك معنا للـ 3 أشهر القادمة...' : 'e.g. Outstanding work! Excited to have you for the next 3 months...')
                  : (isAr ? 'مثال: شكراً على مجهودك وتفانيك، تم تحويل مستحقاتك...' : 'Thank you for your effort during trial...')
              }
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl p-3 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28] resize-none"
            />
          </div>

          {/* Email notice */}
          <div className="p-3 bg-[#17181D] rounded-xl border border-[#2D3039] text-xs text-[#9CA3AF] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#E06D28] shrink-0 stroke-[1.75]" />
            <span>
              {isAr
                ? `سيتم إرسال هذا القرار مباشرة إلى ${emp.email} وتوثيقه في السجل.`
                : `Official email will be dispatched to ${emp.email}.`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#2D3039] flex items-center justify-end gap-2 bg-[#1F2127]">
          <button
            type="button"
            onClick={() => setDecisionModalEmployee(null)}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] cursor-pointer"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`py-2 px-5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer ${
              decisionType === 'upgrade'
                ? 'bg-[#E06D28] hover:bg-[#F07935] shadow-[#E06D28]/25'
                : 'bg-gradient-to-r from-[#FB7185] to-[#F43F5E] text-white hover:opacity-90'
            }`}
          >
            <Send className="w-3.5 h-3.5 stroke-[2]" />
            <span>{decisionType === 'upgrade' ? t.upgradeTo3Months : t.endTrial}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

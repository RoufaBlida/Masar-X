import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Users
} from 'lucide-react';
import { calculateAccruedSalary, getTrialProgress, formatDate } from '../utils/calculations';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({ isOpen, onClose }) => {
  const { 
    employees, 
    attendanceRecords, 
    currentDate, 
    settings, 
    sendWeeklySummaryEmail, 
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Compute summary stats
  let totalPay = 0;
  let totalDeductions = 0;
  employees.forEach(emp => {
    if (emp.status === 'terminated') return;
    const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
    totalPay += stats.accruedAmount;
    totalDeductions += stats.totalDeductions;
  });

  const pendingDecisions = employees.filter(e => {
    if (e.contractType !== '1_week_trial' || e.status === 'terminated') return false;
    const prog = getTrialProgress(e, currentDate);
    return prog.daysRemaining <= 1 || prog.isExpired === 1;
  });

  const handleSend = () => {
    sendWeeklySummaryEmail();
    setIsSentSuccess(true);
    setTimeout(() => {
      setIsSentSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col justify-between max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
              <Mail className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">{t.weeklySummaryTitle}</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">{t.weeklySummarySchedule}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Body: Email Preview */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Metadata Card */}
          <div className="p-3.5 bg-[#17181D] rounded-xl border border-[#2D3039] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">{isAr ? 'البريد المستلم (الأدمن):' : 'Recipient Email:'}</span>
              <span className="font-mono font-bold text-[#FB923C]">{settings.adminEmail || (isAr ? 'لم يتم تحديد بريد بعد' : 'Not configured')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">{isAr ? 'موعد الإرسال التلقائي:' : 'Auto Schedule:'}</span>
              <span className="text-[#10B981] font-bold">{isAr ? 'كل يوم خميس الساعة 8:00 مساءً' : 'Every Thursday at 8:00 PM'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">{isAr ? 'محتوى التقرير:' : 'Content Scope:'}</span>
              <span className="text-[#F3F4F6]">{isAr ? 'حضور الفريق + الرواتب + قرارات التجربة + ملخص الشغل' : 'Attendance + Payroll + Trial Decisions + Work Deliverables'}</span>
            </div>
          </div>

          {/* KPI Snapshot inside Email */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039]">
              <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'أعضاء الفريق' : 'Team Members'}</span>
              <span className="text-sm font-bold text-[#FFFFFF] mt-0.5 block">{employees.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039]">
              <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'الرواتب المستحقة' : 'Payroll Due'}</span>
              <span className="text-sm font-bold text-[#FB923C] mt-0.5 block">${totalPay.toFixed(1)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039]">
              <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'قرارات معلقة' : 'Pending Decisions'}</span>
              <span className={`text-sm font-bold mt-0.5 block ${pendingDecisions.length > 0 ? 'text-[#FB923C]' : 'text-[#10B981]'}`}>
                {pendingDecisions.length}
              </span>
            </div>
          </div>

          {/* Team Breakdown in Email */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#FFFFFF]">{isAr ? 'تفاصيل الموظفين والإنجازات هذا الأسبوع:' : 'Member Weekly Deliverables & Payroll:'}</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {employees.map(emp => {
                const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
                const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === currentDate);

                return (
                  <div key={emp.id} className="p-2.5 rounded-xl bg-[#17181D] border border-[#2D3039] text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F3F4F6]">{emp.name} ({t[`role_${emp.role}` as keyof typeof t]?.split('(')[0] || emp.role})</span>
                      <span className="text-[#FB923C] font-bold">${stats.accruedAmount.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>{isAr ? `حضور: ${stats.totalPresentDays} أيام | غياب: ${stats.totalAbsentDays}` : `P: ${stats.totalPresentDays} | A: ${stats.totalAbsentDays}`}</span>
                      <span>{isAr ? `تقييم: ${stats.ratingAverage}★` : `Rating: ${stats.ratingAverage}★`}</span>
                    </div>
                    {rec?.employeeTaskReport && (
                      <p className="text-[11px] text-[#9CA3AF] italic bg-[#1F2127] p-1.5 rounded-md mt-0.5">
                        "{rec.employeeTaskReport}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#2D3039] flex items-center justify-between bg-[#1F2127]">
          <div className="text-xs text-[#10B981] font-bold">
            {isSentSuccess && <span>✓ {isAr ? 'تم إرسال الملخص بنجاح إلى الإيميل!' : 'Digest sent successfully!'}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              onClick={handleSend}
              className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 stroke-[2]" />
              <span>{isAr ? 'إرسال الملخص الآن عبر البريد' : 'Dispatch Email Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

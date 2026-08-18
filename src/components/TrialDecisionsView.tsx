import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  DollarSign, 
  Star, 
  Calendar, 
  Check, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { getTrialProgress, calculateAccruedSalary, formatDate } from '../utils/calculations';
import { Employee } from '../types';

export const TrialDecisionsView: React.FC = () => {
  const { 
    employees, 
    attendanceRecords, 
    currentDate, 
    settings, 
    promoteToThreeMonths, 
    endEmployeeTrial, 
    setSelectedEmployeeForDetail, 
    setDecisionModalEmployee,
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';

  const trialCandidates = employees.filter(e => e.contractType === '1_week_trial' && e.status !== 'terminated');
  const graduatedEmployees = employees.filter(e => (e.contractType === '3_month_contract' || e.contractType === 'permanent') && e.status !== 'terminated');

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
            <Award className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
              {isAr ? 'قرارات انتهاء فترة التجربة وتثبيت العقود' : 'Trial Performance & Contract Upgrades'}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr
                ? 'متابعة أداء الموظفين الجدد خلال أسبوعهم التجريبي الأول، واتخاذ قرار الترقية لعقد 3 أشهر مع إرسال إشعار بريدي فوري.'
                : 'Evaluate candidates in their 1-week trial and promote to 3-month contracts with instant email notifications.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Active Trial Candidates Awaiting Decision */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <span>{isAr ? 'الموظفون في أسبوع التجربة الحالي' : 'Active 1-Week Trial Candidates'}</span>
            <span className="bg-[#E06D28]/20 text-[#FB923C] text-xs px-2 py-0.5 rounded-full font-mono font-bold">
              {trialCandidates.length}
            </span>
          </h2>
        </div>

        {trialCandidates.length === 0 ? (
          <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-8 text-center text-xs text-[#9CA3AF]">
            {isAr ? 'لا يوجد موظفون في فترة التجربة حالياً.' : 'No candidates in 1-week trial currently.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trialCandidates.map(emp => {
              const trialProg = getTrialProgress(emp, currentDate);
              const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
              const isUrgent = trialProg.daysRemaining <= 1 || trialProg.isExpired === 1;

              return (
                <div
                  key={emp.id}
                  className={`bg-[#1F2127] border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                    isUrgent
                      ? 'border-[#E06D28] shadow-md shadow-[#E06D28]/15 bg-[#251F1C]'
                      : 'border-[#2D3039]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
                          style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
                        >
                          {emp.avatarInitial || emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <h3
                            onClick={() => setSelectedEmployeeForDetail(emp)}
                            className="font-bold text-base text-[#FFFFFF] hover:text-[#E06D28] transition-colors cursor-pointer"
                          >
                            {emp.name}
                          </h3>
                          <p className="text-xs text-[#9CA3AF]">
                            {t[`role_${emp.role}` as keyof typeof t]?.split('(')[0] || emp.role}
                          </p>
                        </div>
                      </div>

                      {/* Urgency Badge */}
                      {isUrgent ? (
                        <span className="bg-[#E06D28] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg animate-pulse shadow-sm">
                          {isAr ? 'حسم القرار مطلوب الآن!' : 'Decision Required!'}
                        </span>
                      ) : (
                        <span className="bg-[#17181D] border border-[#2D3039] text-[#FB923C] text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {isAr ? `متبقي ${trialProg.daysRemaining} أيام` : `${trialProg.daysRemaining} days left`}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Day Counter */}
                    <div className="mt-4 p-3 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9CA3AF] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#E06D28] stroke-[1.75]" />
                          <span>{isAr ? `اليوم ${trialProg.daysPassed} من 7 أيام تجريبية` : `Day ${trialProg.daysPassed} of 7`}</span>
                        </span>
                        <span className="font-mono font-bold text-[#FB923C]">
                          {trialProg.percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-[#1F2127] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-[#FB923C] transition-all duration-500 shadow-sm"
                          style={{ width: `${trialProg.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Performance Summary Matrix */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-[#17181D] border border-[#2D3039]">
                        <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
                        <span className="text-xs font-bold text-[#FB923C] flex items-center justify-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-[#E06D28] text-[#E06D28] stroke-[1.75]" />
                          <span>{stats.ratingAverage} / 5</span>
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#17181D] border border-[#2D3039]">
                        <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'الحضور' : 'Present'}</span>
                        <span className="text-xs font-bold text-[#10B981] mt-0.5 block">
                          {stats.totalPresentDays} {isAr ? 'أيام' : 'days'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#17181D] border border-[#2D3039]">
                        <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'المستحق' : 'Accrued'}</span>
                        <span className="text-xs font-bold text-[#FB923C] mt-0.5 block">
                          ${stats.accruedAmount.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-3 border-t border-[#2D3039] flex items-center gap-2">
                    <button
                      onClick={() => setDecisionModalEmployee(emp)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                      <span>{t.upgradeTo3Months}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(isAr ? `هل تود إنهاء فترة التجربة لـ ${emp.name}؟` : `End trial for ${emp.name}?`)) {
                          endEmployeeTrial(emp.id);
                        }
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-[#FB7185] hover:bg-[#F43F5E]/15 border border-[#F43F5E]/40 transition-colors cursor-pointer"
                    >
                      <span>{t.endTrial}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Graduated to 3-Month Contracts */}
      <div className="space-y-4 pt-6 border-t border-[#2D3039]">
        <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] stroke-[1.75]" />
          <span>{isAr ? 'الموظفون المثبتون بعقد 3 أشهر' : 'Graduated 3-Month Contract Members'}</span>
          <span className="bg-[#10B981]/20 text-[#10B981] text-xs px-2 py-0.5 rounded-full font-mono font-bold">
            {graduatedEmployees.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {graduatedEmployees.map(emp => (
            <div key={emp.id} className="bg-[#1F2127] border border-[#2D3039] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
                >
                  {emp.avatarInitial || emp.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#FFFFFF]">{emp.name}</h4>
                  <p className="text-[11px] text-[#9CA3AF]">{emp.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#FB923C]">${emp.baseSalary}</span>
                <span className="block text-[10px] text-[#10B981] font-semibold">{isAr ? 'عقد نشط' : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

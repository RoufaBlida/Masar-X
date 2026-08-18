import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Star, 
  DollarSign, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Edit3,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FileText
} from 'lucide-react';
import { calculateAccruedSalary, getTrialProgress, formatDate } from '../utils/calculations';
import { Employee, RoleType, ContractType } from '../types';
import { PayslipModal } from './PayslipModal';

interface TeamManagementViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (emp: Employee) => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({ onOpenAddModal, onOpenEditModal }) => {
  const { 
    employees, 
    attendanceRecords, 
    currentDate, 
    settings, 
    setSelectedEmployeeForDetail, 
    setDecisionModalEmployee,
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);
  const [contractFilter, setContractFilter] = useState<string>('all');

  const filteredEmployees = employees.filter(emp => {
    if (emp.status === 'terminated') return false;

    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.accessCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (contractFilter !== 'all' && emp.contractType !== contractFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
            <Users className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FFFFFF] tracking-tight">{t.team}</h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr
                ? `إدارة الملفات المهنية، فترات التجربة، الرواتب والخصومات (${employees.filter(e => e.status !== 'terminated').length} أعضاء نشطين).`
                : `Manage creative profiles, trial periods, and salaries (${employees.filter(e => e.status !== 'terminated').length} active members).`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2]" />
          <span>{t.addEmployee}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#1F2127]/80 border border-[#2D3039] p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، الكود، أو البريد...' : 'Search team member...'}
            className="w-full bg-[#17181D] border border-[#2D3039] rounded-lg pl-9 rtl:pr-9 rtl:pl-3 py-1.5 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Contract Filter */}
          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="bg-[#17181D] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع العقود' : 'All Contracts'}</option>
            <option value="1_week_trial">{isAr ? 'أسبوع التجربة فقط' : '1-Week Trial'}</option>
            <option value="3_month_contract">{isAr ? 'عقد 3 أشهر' : '3-Month Contract'}</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#17181D] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع التخصصات' : 'All Roles'}</option>
            <option value="video_editor">{t.role_video_editor}</option>
            <option value="motion_designer">{t.role_motion_designer}</option>
            <option value="thumbnail_designer">{t.role_thumbnail_designer}</option>
            <option value="scriptwriter">{t.role_scriptwriter}</option>
            <option value="sound_designer">{t.role_sound_designer}</option>
          </select>
        </div>
      </div>

      {/* Grid of Team Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'لا يوجد أعضاء في الفريق حالياً' : 'No Team Members Found'}
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {isAr
                ? 'ابدأ بإضافة أول موظف مبدع لفريقك لتتبع فترة أسبوع التجربة وسجلات الحضور والتقييمات اليومية.'
                : 'Get started by adding your first team member to track trials, daily logs, and payouts.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/30 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2]" />
            <span>{isAr ? 'إضافة موظف جديد' : 'Add First Employee'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map(emp => {
          const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
          const trialProg = getTrialProgress(emp, currentDate);
          const isTrial = emp.contractType === '1_week_trial';

          return (
            <div
              key={emp.id}
              className="bg-[#1F2127] border border-[#2D3039] hover:border-[#E06D28]/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all"
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

                  <button
                    onClick={() => onOpenEditModal(emp)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#E06D28] hover:bg-[#262831] rounded-lg transition-colors cursor-pointer"
                    title={isAr ? 'تعديل البيانات' : 'Edit Member'}
                  >
                    <Edit3 className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>

                {/* Contract Status / Progress */}
                <div className="mt-3.5 pt-3 border-t border-[#2D3039]">
                  {isTrial ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#FB923C] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{isAr ? `أسبوع التجربة (${trialProg.daysPassed}/7)` : `Trial Day ${trialProg.daysPassed}/7`}</span>
                        </span>
                        <span className="text-[11px] text-[#9CA3AF]">
                          {trialProg.daysRemaining === 0 ? (isAr ? 'اكتمل!' : 'Done') : (isAr ? `متبقي ${trialProg.daysRemaining} أيام` : `${trialProg.daysRemaining}d left`)}
                        </span>
                      </div>
                      <div className="w-full bg-[#17181D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E06D28] transition-all duration-500 shadow-sm"
                          style={{ width: `${trialProg.percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#10B981]">
                      <span className="font-bold flex items-center gap-1">
                        <Award className="w-4 h-4 stroke-[1.75]" />
                        <span>{isAr ? 'عقد 3 أشهر (مثبت)' : '3-Month Contract'}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#9CA3AF]">${emp.baseSalary}/mo</span>
                    </div>
                  )}
                </div>

                {/* Quick Performance & Financial Matrix */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-[#17181D] border border-[#2D3039]">
                    <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'التقييم' : 'Rating'}</span>
                    <span className="text-xs font-bold text-[#FB923C] flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="w-3 h-3 fill-[#E06D28] text-[#E06D28] stroke-[1.75]" />
                      <span>{stats.ratingAverage}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#17181D] border border-[#2D3039]">
                    <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'حضور' : 'Present'}</span>
                    <span className="text-xs font-bold text-[#10B981] mt-0.5 block">
                      {stats.totalPresentDays}d
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#17181D] border border-[#2D3039]">
                    <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'المستحق' : 'Accrued'}</span>
                    <span className="text-xs font-bold text-[#FB923C] mt-0.5 block">
                      ${stats.accruedAmount.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Software Tools */}
                {emp.softwareTools && emp.softwareTools.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-1">
                    {emp.softwareTools.slice(0, 3).map((tool, idx) => (
                      <span key={idx} className="bg-[#17181D] text-[#9CA3AF] text-[10px] px-2 py-0.5 rounded-md border border-[#2D3039]">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#2D3039] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedEmployeeForDetail(emp)}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] transition-colors cursor-pointer"
                  >
                    {isAr ? 'عرض الملف' : 'Profile'}
                  </button>

                  <button
                    onClick={() => setPayslipEmployee(emp)}
                    className="py-1.5 px-2 rounded-lg text-xs font-medium text-[#FB923C] hover:bg-[#E06D28]/15 border border-[#E06D28]/30 transition-colors cursor-pointer flex items-center gap-1"
                    title={isAr ? 'قسيمة الراتب (Fiche de Paie)' : 'View Payslip'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'قسيمة الراتب' : 'Payslip'}</span>
                  </button>
                </div>

                {isTrial && (
                  <button
                    onClick={() => setDecisionModalEmployee(emp)}
                    className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm transition-colors cursor-pointer"
                  >
                    {isAr ? 'ترقية / قرار' : 'Decision'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Payslip Modal */}
      <PayslipModal
        employee={payslipEmployee}
        records={attendanceRecords}
        settings={settings}
        currentDate={currentDate}
        isOpen={Boolean(payslipEmployee)}
        onClose={() => setPayslipEmployee(null)}
        lang={lang}
      />
    </div>
  );
};

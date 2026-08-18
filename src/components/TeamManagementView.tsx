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
  FileText,
  Archive,
  RotateCcw,
  Trash2,
  Calendar,
  AlertCircle,
  HelpCircle
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
    authUser,
    employees, 
    attendanceRecords, 
    currentDate, 
    settings, 
    setSelectedEmployeeForDetail, 
    setDecisionModalEmployee,
    restoreEmployee,
    deleteEmployee,
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';
  const isSuperAdmin = authUser?.adminRole === 'super_admin';
  const canManageTeam = isSuperAdmin || authUser?.permissions?.canManageTeam !== false;
  const canViewSalaries = isSuperAdmin || authUser?.permissions?.canViewSalaries !== false;
  const canMakeTrialDecisions = isSuperAdmin || authUser?.permissions?.canMakeTrialDecisions !== false;

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);
  const [contractFilter, setContractFilter] = useState<string>('all');

  const activeEmployees = employees.filter(e => e.status !== 'terminated');
  const archivedEmployees = employees.filter(e => e.status === 'terminated');

  const currentList = activeSubTab === 'active' ? activeEmployees : archivedEmployees;

  const filteredEmployees = currentList.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.accessCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (activeSubTab === 'active' && contractFilter !== 'all' && emp.contractType !== contractFilter) return false;

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
                ? `إدارة الملفات المهنية، فترات التجربة، وسجلات الموظفين المنتهية خدماتهم.`
                : `Manage creative team profiles, trial periods, and past employee logs.`}
            </p>
          </div>
        </div>

        {canManageTeam && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2]" />
            <span>{t.addEmployee}</span>
          </button>
        )}
      </div>

      {/* Tabs: Active Team vs Archive Log */}
      <div className="flex items-center gap-2 border-b border-[#2D3039] pb-3">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'active'
              ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/25'
              : 'bg-[#1F2127] text-[#9CA3AF] hover:text-white border border-[#2D3039]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'الفريق الحالي النشط' : 'Active Team'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
            {activeEmployees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('archive')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'archive'
              ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/25'
              : 'bg-[#1F2127] text-[#9CA3AF] hover:text-white border border-[#2D3039]'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>{isAr ? 'سجل وأرشيف الموظفين السابقين' : 'Past Employees Archive'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
            {archivedEmployees.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، البريد الإلكتروني، أو كود الموظف...' : 'Search by name, email, or code...'}
            className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#17181D] border border-[#2D3039] text-[#9CA3AF] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#E06D28]"
          >
            <option value="all">{isAr ? 'جميع التخصصات' : 'All Roles'}</option>
            <option value="video_editor">{t.role_video_editor}</option>
            <option value="motion_designer">{t.role_motion_designer}</option>
            <option value="thumbnail_designer">{t.role_thumbnail_designer}</option>
            <option value="scriptwriter">{t.role_scriptwriter}</option>
            <option value="sound_designer">{t.role_sound_designer}</option>
            <option value="social_media_manager">{t.role_social_media_manager}</option>
            <option value="developer">{t.role_developer}</option>
            <option value="other">{t.role_other}</option>
          </select>

          {/* Contract Filter (Active Tab only) */}
          {activeSubTab === 'active' && (
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
              className="bg-[#17181D] border border-[#2D3039] text-[#9CA3AF] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#E06D28]"
            >
              <option value="all">{isAr ? 'جميع العقود' : 'All Contracts'}</option>
              <option value="1_week_trial">{t.contract_1_week_trial}</option>
              <option value="3_month_contract">{t.contract_3_month_contract}</option>
            </select>
          )}
        </div>
      </div>

      {/* 1. ACTIVE TEAM VIEW */}
      {activeSubTab === 'active' && (
        <>
          {filteredEmployees.length === 0 ? (
            <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-[#6B7280] mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-[#FFFFFF]">{isAr ? 'لم يتم العثور على أي موظف' : 'No employees found'}</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {searchQuery ? (isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No results match your search') : (isAr ? 'لم يتم إضافة أي موظف نشط بعد' : 'No active employees added yet')}
              </p>
              {canManageTeam && !searchQuery && (
                <button
                  onClick={onOpenAddModal}
                  className="mt-4 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{t.addEmployee}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
                const isTrial = emp.contractType === '1_week_trial';
                const trialProg = getTrialProgress(emp, currentDate);

                return (
                  <div
                    key={emp.id}
                    className="bg-[#1F2127] border border-[#2D3039] hover:border-[#E06D28]/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg group"
                  >
                    <div>
                      {/* Member Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-sm shrink-0"
                            style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
                          >
                            {emp.avatarInitial || emp.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#FB923C] transition-colors leading-tight">
                              {emp.name}
                            </h3>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">
                              {emp.customRoleName || emp.role}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono bg-[#17181D] text-[#FB923C] px-2 py-0.5 rounded border border-[#2D3039]">
                                {emp.accessCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {canManageTeam && (
                          <button
                            onClick={() => onOpenEditModal(emp)}
                            className="p-1.5 text-[#6B7280] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg transition-colors cursor-pointer"
                            title={isAr ? 'تعديل البيانات' : 'Edit Member'}
                          >
                            <Edit3 className="w-4 h-4 stroke-[1.75]" />
                          </button>
                        )}
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
                            {canViewSalaries && (
                              <span className="text-[11px] font-mono text-[#9CA3AF]">${emp.baseSalary}/mo</span>
                            )}
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
                          <span className="text-[10px] text-[#9CA3AF] block">{canViewSalaries ? (isAr ? 'المستحق' : 'Accrued') : (isAr ? 'الغياب' : 'Absence')}</span>
                          <span className="text-xs font-bold text-[#FB923C] mt-0.5 block">
                            {canViewSalaries ? `$${stats.accruedAmount.toFixed(0)}` : `${stats.totalAbsentDays}d`}
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
                    <div className="pt-3 mt-3 border-t border-[#2D3039] flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedEmployeeForDetail(emp)}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] transition-colors cursor-pointer"
                        >
                          {isAr ? 'عرض الملف' : 'Profile'}
                        </button>

                        {canViewSalaries && (
                          <button
                            onClick={() => setPayslipEmployee(emp)}
                            className="py-1.5 px-2 rounded-lg text-xs font-medium text-[#FB923C] hover:bg-[#E06D28]/15 border border-[#E06D28]/30 transition-colors cursor-pointer flex items-center gap-1"
                            title={isAr ? 'قسيمة الراتب' : 'View Payslip'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isAr ? 'قسيمة الراتب' : 'Payslip'}</span>
                          </button>
                        )}
                      </div>

                      {isTrial && canMakeTrialDecisions && (
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
        </>
      )}

      {/* 2. PAST EMPLOYEES & TERMINATION ARCHIVE VIEW */}
      {activeSubTab === 'archive' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#17181D] border border-[#2D3039] flex items-start gap-3">
            <Archive className="w-5 h-5 text-[#FB923C] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">{isAr ? 'سجل وأرشيف الموظفين المنتهية خدماتهم' : 'Concluded Employee Records & Archive'}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-relaxed">
                {isAr
                  ? 'يتضمن هذا السجل التاريخ الكامل لجميع الموظفين الذين تم إنهاء فترة تجربتهم أو عقودهم، موضحاً تاريخ البدء والانتهاء، الأسباب، الملاحظات والمستحقات.'
                  : 'Complete history of employees who concluded their trials or contracts, including start/end dates, reasons, and settlement notes.'}
              </p>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-12 text-center">
              <Archive className="w-12 h-12 text-[#6B7280] mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-[#FFFFFF]">{isAr ? 'لا توجد سجلات منتهية في الأرشيف' : 'Archive is empty'}</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {isAr ? 'عند إنهاء تجربة أو عقد أي موظف سيتم حفظ كامل سجله وتفاصيله هنا تلقائياً.' : 'Concluded employees will be archived here automatically.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((emp) => {
                const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
                return (
                  <div
                    key={emp.id}
                    className="bg-[#1F2127] border border-[#2D3039] hover:border-[#FB7185]/40 rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-sm shrink-0 opacity-75"
                        style={{ backgroundColor: emp.avatarColor || '#6B7280' }}
                      >
                        {emp.avatarInitial || emp.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-semibold">
                            {isAr ? 'منتهية خدماته' : 'Concluded / Terminated'}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF] font-mono">{emp.email}</span>
                        </div>

                        {/* History Timeline */}
                        <div className="flex items-center gap-4 text-xs text-[#9CA3AF] flex-wrap pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#FB923C]" />
                            <span>{isAr ? 'تاريخ البدء:' : 'Start:'} {emp.startDate}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#FB7185]" />
                            <span>{isAr ? 'تاريخ الإنهاء:' : 'Ended:'} {emp.terminationDate || emp.terminatedAt || '-'}</span>
                          </span>
                          {canViewSalaries && (
                            <span className="font-bold text-[#FB923C]">
                              {isAr ? 'المستحق النهائي:' : 'Payout:'} ${emp.finalPayout !== undefined ? emp.finalPayout.toFixed(0) : stats.accruedAmount.toFixed(0)} USD
                            </span>
                          )}
                        </div>

                        {/* Termination Reason and Notes */}
                        <div className="pt-2">
                          <p className="text-xs text-[#E2E8F0] font-medium">
                            <span className="text-[#FB7185] font-bold">{isAr ? 'السبب المسجل: ' : 'Reason: '}</span>
                            {emp.terminationReason || (isAr ? 'عدم اجتياز معايير الأسبوع التجريبي' : 'Trial concluded')}
                          </p>
                          {emp.terminationNotes && (
                            <p className="text-[11px] text-[#9CA3AF] mt-1 bg-[#17181D] p-2.5 rounded-xl border border-[#2D3039] italic">
                              "{emp.terminationNotes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Archive Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {canViewSalaries && (
                        <button
                          onClick={() => setPayslipEmployee(emp)}
                          className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#FB923C] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-all cursor-pointer flex items-center gap-1.5"
                          title={isAr ? 'عرض قسيمة الراتب والمستحقات' : 'View Payslip'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قسيمة التسوية' : 'Payslip'}</span>
                        </button>
                      )}

                      {canManageTeam && (
                        <>
                          <button
                            onClick={() => restoreEmployee(emp.id)}
                            className="py-1.5 px-3 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                            title={isAr ? 'استعادة الموظف وإعادته للفريق النشط' : 'Restore Employee'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isAr ? 'استعادة للفريق' : 'Restore'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(isAr ? `هل أنت متأكد من حذف ملف ${emp.name} نهائياً؟` : `Delete ${emp.name} permanently?`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            className="p-2 rounded-xl text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer"
                            title={isAr ? 'حذف نهائي من السجلات' : 'Delete Permanently'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payslip Modal */}
      {canViewSalaries && (
        <PayslipModal
          employee={payslipEmployee}
          records={attendanceRecords}
          settings={settings}
          currentDate={currentDate}
          isOpen={Boolean(payslipEmployee)}
          onClose={() => setPayslipEmployee(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

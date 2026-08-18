import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Award, 
  CalendarCheck2, 
  DollarSign, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle, 
  FileSpreadsheet, 
  Printer, 
  Video, 
  ExternalLink,
  Send,
  Star,
  CheckCircle2,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { ProductivityLineChart, RolesDoughnutChart, AttendanceComparisonBarChart } from './Charts';
import { calculateAccruedSalary, getTrialProgress, formatDate, formatShortDate } from '../utils/calculations';
import { exportToCSV } from '../utils/exportUtils';
import { Employee } from '../types';
import { ImageViewerModal } from './ImageViewerModal';

interface DashboardViewProps {
  onOpenWeeklySummary: () => void;
  onOpenAddEmployee: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenWeeklySummary, onOpenAddEmployee }) => {
  const { 
    authUser,
    employees, 
    attendanceRecords, 
    currentDate, 
    settings, 
    setSelectedEmployeeForDetail, 
    setDecisionModalEmployee,
    setActiveTab, 
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';
  const isSuperAdmin = authUser?.adminRole === 'super_admin';
  const canViewSalaries = isSuperAdmin || authUser?.permissions?.canViewSalaries !== false;
  const canManageTeam = isSuperAdmin || authUser?.permissions?.canManageTeam !== false;
  const canExportReports = isSuperAdmin || authUser?.permissions?.canExportReports !== false;
  const canMakeTrialDecisions = isSuperAdmin || authUser?.permissions?.canMakeTrialDecisions !== false;

  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const handleOpenLightbox = (imgs: string[], index = 0, empName = '') => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setLightboxTitle(empName ? `${empName} - ${isAr ? 'مرفقات الإنجاز' : 'Report Attachments'}` : '');
    setIsLightboxOpen(true);
  };

  // Compute metrics
  const activeEmployees = employees.filter(e => e.status !== 'terminated');
  const trialEmployees = activeEmployees.filter(e => e.contractType === '1_week_trial');
  const contractedEmployees = activeEmployees.filter(e => e.contractType === '3_month_contract' || e.contractType === 'permanent');

  // Today's attendance
  const todayRecords = attendanceRecords.filter(r => r.date === currentDate);
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const attendanceRate = activeEmployees.length > 0 ? Math.round((presentCount / activeEmployees.length) * 100) : 0;

  // Accrued payroll
  let totalAccruedPayroll = 0;
  let totalDeductions = 0;
  activeEmployees.forEach(emp => {
    const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
    totalAccruedPayroll += stats.accruedAmount;
    totalDeductions += stats.totalDeductions;
  });

  // Urgent trial candidates (day 6 or 7)
  const urgentTrials = trialEmployees.filter(emp => {
    const prog = getTrialProgress(emp, currentDate);
    return prog.daysRemaining <= 1 || prog.isExpired === 1;
  });

  // Recent deliverables submitted today
  const recentDeliverables = todayRecords
    .filter(r => r.employeeTaskReport || r.videoDeliverableUrl || (r.reportImages && r.reportImages.length > 0))
    .map(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      return { record: r, employee: emp };
    })
    .filter(item => item.employee !== undefined);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Quick Actions */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
              {isAr ? 'لوحة المتابعة الشاملة لأداء الفريق' : 'Team Performance Dashboard'}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr
                ? `متابعة حية للحضور، الرواتب المستحقة، ومسار الترقية من أسبوع التجربة إلى عقد الـ 3 أشهر.`
                : `Live tracking for attendance, accrued compensation, and 1-week trial to 3-month contract promotions.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenWeeklySummary}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 stroke-[2]" />
            <span>{isAr ? 'إرسال الملخص الأسبوعي' : 'Send Digest'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
            title="Print PDF"
          >
            <Printer className="w-3.5 h-3.5 stroke-[1.75]" />
            <span className="hidden sm:inline">{isAr ? 'طباعة تقرير' : 'Print PDF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (4 Distinct Functional Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Trial Members */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#E06D28]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">{t.kpiTrialCount}</span>
            <div className="w-8 h-8 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#E06D28]">
              {trialEmployees.length}
            </span>
            <span className="text-xs text-[#9CA3AF]">
              {isAr ? 'مبدع في أسبوع التجربة' : 'in 1-wk trial'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6B7280] flex items-center justify-between pt-2 border-t border-[#2D3039]">
            <span>{isAr ? 'العقود المثبتة (3 أشهر):' : '3-Month contracts:'}</span>
            <span className="font-bold text-[#FFFFFF]">{contractedEmployees.length}</span>
          </div>
        </div>

        {/* KPI 2: Today's Attendance */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#10B981]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">{t.kpiAttendanceRate}</span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#10B981]">
              {attendanceRate}%
            </span>
            <span className="text-xs text-[#9CA3AF]">
              ({presentCount}/{activeEmployees.length} {isAr ? 'حاضر' : 'present'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6B7280] flex items-center justify-between pt-2 border-t border-[#2D3039]">
            <span>{formatDate(currentDate, lang)}</span>
            <span className="text-[#E06D28] hover:underline cursor-pointer" onClick={() => setActiveTab('daily_log')}>
              {t.dailyAttendance} →
            </span>
          </div>
        </div>

        {/* KPI 3: Accrued Payroll to Date */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#E06D28]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">{t.kpiTotalAccrued}</span>
            <div className="w-8 h-8 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          {canViewSalaries ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#E06D28]">
                  ${totalAccruedPayroll.toFixed(1)}
                </span>
                <span className="text-xs text-[#9CA3AF]">USD</span>
              </div>
              <div className="mt-2 text-[11px] text-[#6B7280] flex items-center justify-between pt-2 border-t border-[#2D3039]">
                <span>{isAr ? 'الخصومات المطبقة:' : 'Deductions:'}</span>
                <span className="font-bold text-[#FB7185]">-${totalDeductions.toFixed(1)}</span>
              </div>
            </>
          ) : (
            <div className="mt-3 py-1 space-y-1">
              <span className="text-xs font-bold text-[#9CA3AF] bg-[#17181D] border border-[#2D3039] px-2.5 py-1 rounded-lg inline-block">
                🔒 {isAr ? 'محجوب (يتطلب صلاحية مالية)' : 'Restricted'}
              </span>
              <p className="text-[10px] text-[#6B7280]">
                {isAr ? 'غير مصرح برؤية الرواتب' : 'Salary permission not granted'}
              </p>
            </div>
          )}
        </div>

        {/* KPI 4: Pending Trial Decisions */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#E06D28]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">{t.kpiPendingDecisions}</span>
            <div className="w-8 h-8 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
              <Award className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${urgentTrials.length > 0 ? 'text-[#E06D28]' : 'text-[#9CA3AF]'}`}>
              {urgentTrials.length}
            </span>
            <span className="text-xs text-[#9CA3AF]">
              {isAr ? 'قرار جاهز للحسم' : 'ready for decision'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6B7280] flex items-center justify-between pt-2 border-t border-[#2D3039]">
            <span>{isAr ? 'عقد الـ 3 أشهر' : '3-Month Upgrade'}</span>
            <span className="text-[#E06D28] hover:underline cursor-pointer font-bold" onClick={() => setActiveTab('trial_decisions')}>
              {isAr ? 'اتخاذ القرار' : 'Review'} →
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Trial Notice Card (if any member has reached end of 1-week trial) */}
      {urgentTrials.length > 0 && (
        <div className="bg-[#29221C] border border-[#E06D28]/40 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E06D28]/20 text-[#FB923C] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#FFFFFF]">
                  {isAr ? 'موعد حسم قرار فترة التجربة (أسبوع اكتمل)' : 'Trial Period Review Ready'}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  {isAr
                    ? `الموظف ${urgentTrials.map(u => u.name).join(', ')} أتم فترة التجربة، حان وقت الترقية لعقد 3 أشهر أو إنهاء التجربة.`
                    : `${urgentTrials.map(u => u.name).join(', ')} completed the 1-week trial. Action required.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('trial_decisions')}
              className="py-1.5 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {isAr ? 'مراجعة القرارات الآن' : 'Take Decision Now'}
            </button>
          </div>
        </div>
      )}

      {/* Charts Section: Performance Curve & Roles Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Productivity Curve */}
        <div className="lg:col-span-2 bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h2 className="text-sm font-bold text-[#FFFFFF]">{t.productivityCurve}</h2>
            </div>
            <span className="text-xs text-[#6B7280] font-mono">{formatShortDate(currentDate, lang)}</span>
          </div>

          <div className="h-48">
            <ProductivityLineChart
              records={attendanceRecords}
              employees={employees}
              daysCount={7}
            />
          </div>
        </div>

        {/* Chart 2: Specialties Donut */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h2 className="text-sm font-bold text-[#FFFFFF]">{t.creativeRolesDistribution}</h2>
            </div>
          </div>

          <div className="h-48 flex items-center">
            <RolesDoughnutChart employees={employees} />
          </div>
        </div>
      </div>

      {/* Attendance Comparison & Deliverables Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance Breakdown */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 shadow-sm">
          <AttendanceComparisonBarChart
            employees={activeEmployees}
            records={attendanceRecords}
            currentDate={currentDate}
          />
        </div>

        {/* Today's Video Deliverables & Reports Feed */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
                <Video className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h2 className="text-sm font-bold text-[#FFFFFF]">{t.recentDeliverables}</h2>
            </div>
            <span className="text-xs text-[#6B7280]">{recentDeliverables.length} {isAr ? 'تسليمات اليوم' : 'submitted today'}</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {recentDeliverables.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#6B7280]">
                {isAr ? 'لم يقم أي موظف برفع تقرير أو رابط حتى الآن اليوم.' : 'No deliverable reports submitted yet today.'}
              </div>
            ) : (
              recentDeliverables.map(({ record, employee }) => (
                <div key={record.id} className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-xs flex flex-col gap-1.5 hover:border-[#E06D28]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: employee?.avatarColor || '#E06D28' }}
                      >
                        {employee?.avatarInitial || employee?.name.slice(0, 1)}
                      </div>
                      <span className="font-bold text-[#FFFFFF]">{employee?.name}</span>
                    </div>

                    {record.employeeSubmittedAt && (
                      <span className="text-[10px] text-[#6B7280] font-mono">{record.employeeSubmittedAt}</span>
                    )}
                  </div>

                  {record.employeeTaskReport && (
                    <p className="text-[#9CA3AF] text-[11px] line-clamp-2 leading-relaxed">
                      "{record.employeeTaskReport}"
                    </p>
                  )}

                  {/* Attached Images */}
                  {record.reportImages && record.reportImages.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {record.reportImages.slice(0, 4).map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => handleOpenLightbox(record.reportImages!, imgIdx, employee?.name)}
                          className="w-9 h-7 rounded-md overflow-hidden border border-[#2D3039] hover:border-[#E06D28] transition-all cursor-pointer group relative shrink-0"
                          title={isAr ? 'عرض الصورة' : 'View Image'}
                        >
                          <img src={img} alt={`feed-thumb-${imgIdx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {record.reportImages.length > 4 && (
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(record.reportImages!, 0, employee?.name)}
                          className="text-[10px] text-[#FB923C] font-mono hover:underline cursor-pointer"
                        >
                          +{record.reportImages.length - 4}
                        </button>
                      )}
                    </div>
                  )}

                  {record.videoDeliverableUrl && (
                    <a
                      href={record.videoDeliverableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#E06D28] hover:underline w-fit pt-0.5"
                    >
                      <Video className="w-3 h-3 stroke-[1.75]" />
                      <span>{isAr ? 'رابط ملف الفيديو' : 'View Deliverable'}</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageViewerModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        title={lightboxTitle || (isAr ? 'مرفقات التقرير' : 'Report Attachments')}
        lang={lang}
      />
    </div>
  );
};

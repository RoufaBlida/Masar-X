import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Mail, 
  Calendar, 
  DollarSign, 
  Star, 
  Award, 
  Clock, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  Phone, 
  TrendingUp,
  UserCheck,
  Image as ImageIcon,
  Eye,
  FileText,
  CreditCard,
  Globe2,
  Printer,
  Download,
  CalendarCheck2,
  XCircle
} from 'lucide-react';
import { calculateAccruedSalary, getTrialProgress, formatDate } from '../utils/calculations';
import { getPayoutMethodLabel } from '../utils/payslipUtils';
import { ImageViewerModal } from './ImageViewerModal';
import { PayslipModal } from './PayslipModal';

export const EmployeeDetailModal: React.FC = () => {
  const { 
    authUser,
    selectedEmployeeForDetail, 
    setSelectedEmployeeForDetail, 
    attendanceRecords, 
    currentDate, 
    settings, 
    setDecisionModalEmployee,
    lang, 
    t 
  } = useApp();

  const isAr = lang === 'ar';
  const emp = selectedEmployeeForDetail;
  const isSuperAdmin = authUser?.adminRole === 'super_admin';
  const canViewSalaries = isSuperAdmin || authUser?.permissions?.canViewSalaries !== false;
  const canMakeTrialDecisions = isSuperAdmin || authUser?.permissions?.canMakeTrialDecisions !== false;

  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Payslip Modal state
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const handleOpenLightbox = (imgs: string[], index = 0) => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  if (!emp) return null;

  const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
  const trialProg = getTrialProgress(emp, currentDate);
  const isTrial = emp.contractType === '1_week_trial';

  const empRecords = attendanceRecords
    .filter(r => r.employeeId === emp.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-[#1F2127] border-b border-[#2D3039] p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
              style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
            >
              {emp.avatarInitial || emp.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#FFFFFF]">{emp.name}</h2>
                <span className="font-mono text-xs text-[#FB923C] bg-[#17181D] px-2 py-0.5 rounded-md border border-[#2D3039]">
                  {emp.accessCode}
                </span>
                {isTrial ? (
                  <span className="bg-[#E06D28]/20 text-[#FB923C] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E06D28]/40">
                    {isAr ? `أسبوع التجربة (${trialProg.daysPassed}/7)` : `Trial (${trialProg.daysPassed}/7)`}
                  </span>
                ) : (
                  <span className="bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {isAr ? 'عقد 3 أشهر' : '3-Month Contract'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {t[`role_${emp.role}` as keyof typeof t]?.split('(')[0] || emp.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedEmployeeForDetail(null)}
            className="p-2 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Info Cards */}
          {canViewSalaries ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'الراتب الأساسي' : 'Base Salary'}</span>
                <span className="text-sm font-bold text-[#FFFFFF] mt-0.5 block">${emp.baseSalary}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'المستحق حتى الآن' : 'Accrued'}</span>
                <span className="text-sm font-bold text-[#FB923C] mt-0.5 block">${stats.accruedAmount.toFixed(1)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'إجمالي الخصومات' : 'Deductions'}</span>
                <span className="text-sm font-bold text-[#FB7185] mt-0.5 block">-${stats.totalDeductions.toFixed(1)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
                <span className="text-sm font-bold text-[#FB923C] mt-0.5 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#E06D28] text-[#E06D28] stroke-[1.75]" />
                  <span>{stats.ratingAverage}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'أيام الحضور' : 'Present Days'}</span>
                <span className="text-sm font-bold text-[#10B981] mt-0.5 block">{stats.totalPresentDays} {isAr ? 'يوم' : 'days'}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'أيام الغياب' : 'Absent Days'}</span>
                <span className="text-sm font-bold text-[#FB7185] mt-0.5 block">{stats.totalAbsentDays} {isAr ? 'يوم' : 'days'}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'نسبة الالتزام' : 'Attendance'}</span>
                <span className="text-sm font-bold text-[#FB923C] mt-0.5 block">
                  {(stats.totalPresentDays + stats.totalAbsentDays) > 0 
                    ? Math.round((stats.totalPresentDays / (stats.totalPresentDays + stats.totalAbsentDays)) * 100) 
                    : 100}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-center">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
                <span className="text-sm font-bold text-[#FB923C] mt-0.5 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#E06D28] text-[#E06D28] stroke-[1.75]" />
                  <span>{stats.ratingAverage}</span>
                </span>
              </div>
            </div>
          )}

          {/* Contact and Metadata details */}
          <div className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[#9CA3AF] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#E06D28] stroke-[1.75]" />
                <span className="text-[#F3F4F6]">{emp.email}</span>
              </span>

              {emp.phone && (
                <span className="text-[#9CA3AF] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#10B981] stroke-[1.75]" />
                  <span className="text-[#F3F4F6] font-mono">{emp.phone}</span>
                </span>
              )}

              <span className="text-[#9CA3AF] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E06D28] stroke-[1.75]" />
                <span>{isAr ? `تاريخ البدء: ${emp.startDate}` : `Started: ${emp.startDate}`}</span>
              </span>
            </div>

            {/* Payout & Transfer Route Details */}
            {canViewSalaries && (
              <div className="pt-2 border-t border-[#2D3039] flex items-center justify-between flex-wrap gap-2 text-[11px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#E06D28]" />
                    <span className="text-[#FFFFFF] font-semibold">{getPayoutMethodLabel(emp.payoutMethod, lang)}</span>
                  </span>
                  <span className="text-[#9CA3AF] flex items-center gap-1 font-mono text-[10px] bg-[#1F2127] px-2 py-0.5 rounded border border-[#2D3039]">
                    {emp.payoutDetails || 'لم يُحدد الحساب'}
                  </span>
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>🇸🇦 {emp.senderCountry || 'السعودية'} ➔ 🌍 {emp.recipientCountry || 'الجزائر'}</span>
                  </span>
                </div>

                {/* Quick Payslip Trigger */}
                <button
                  type="button"
                  onClick={() => setIsPayslipOpen(true)}
                  className="py-1 px-2.5 rounded-lg bg-[#E06D28]/15 hover:bg-[#E06D28]/25 text-[#FB923C] font-bold text-[11px] flex items-center gap-1 border border-[#E06D28]/30 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'قسيمة الراتب (Fiche de Paie)' : 'View Payslip PDF'}</span>
                </button>
              </div>
            )}

            {emp.softwareTools && emp.softwareTools.length > 0 && (
              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[#6B7280] text-[11px]">{isAr ? 'البرامج والأدوات:' : 'Tools:'}</span>
                {emp.softwareTools.map((tool, idx) => (
                  <span key={idx} className="bg-[#1F2127] text-[#F3F4F6] text-[10px] px-2 py-0.5 rounded-md border border-[#2D3039]">
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attendance and Rating Log Records */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
              <span>{isAr ? 'سجل الحضور والتقييمات اليومية' : 'Daily Attendance & Work Reports'}</span>
            </h3>

            {empRecords.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] text-center text-xs text-[#9CA3AF]">
                {isAr ? 'لا توجد سجلات حضور مسجلة لهذا الموظف بعد.' : 'No attendance recorded yet for this member.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {empRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rec.status === 'present' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`} />
                        <span className="text-xs font-bold font-mono text-[#FFFFFF]">{formatDate(rec.date, lang)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rec.adminRating && rec.adminRating > 0 && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(st => (
                              <Star
                                key={st}
                                className={`w-3 h-3 ${st <= (rec.adminRating || 0) ? 'text-[#E06D28] fill-[#E06D28]' : 'text-[#4B5563]'}`}
                              />
                            ))}
                          </div>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rec.status === 'present' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#F43F5E]/20 text-[#FB7185]'}`}>
                          {rec.status === 'present' ? t.status_present : t.status_absent}
                        </span>
                      </div>
                    </div>

                    {rec.employeeTaskReport && (
                      <p className="text-[11px] text-[#9CA3AF] bg-[#1F2127] p-2 rounded-lg border border-[#2D3039]/60">
                        {rec.employeeTaskReport}
                      </p>
                    )}

                    {/* Report Attachments */}
                    {rec.reportImages && rec.reportImages.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {rec.reportImages.map((img, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => handleOpenLightbox(rec.reportImages!, imgIdx)}
                            className="w-10 h-8 rounded-lg overflow-hidden border border-[#2D3039] hover:border-[#E06D28] transition-colors cursor-pointer"
                          >
                            <img src={img} alt="thumb" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#2D3039] flex items-center justify-between gap-3 bg-[#1F2127]">
          {isTrial && canMakeTrialDecisions ? (
            <button
              onClick={() => {
                setSelectedEmployeeForDetail(null);
                setDecisionModalEmployee(emp);
              }}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] flex items-center gap-2 cursor-pointer shadow-sm shadow-[#E06D28]/20"
            >
              <Award className="w-4 h-4 stroke-[1.75]" />
              <span>{isAr ? 'اتخاذ قرار الترقية الآن' : 'Take Promotion Decision'}</span>
            </button>
          ) : isTrial ? (
            <span className="text-xs text-[#9CA3AF]">
              {isAr ? 'فترة التجربة جارية' : 'Trial period in progress'}
            </span>
          ) : (
            <div className="text-xs text-[#10B981] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              <span>{isAr ? 'الموظف مثبت بعقد رسمي 3 أشهر' : 'Active 3-Month Contract Member'}</span>
            </div>
          )}

          <button
            onClick={() => setSelectedEmployeeForDetail(null)}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageViewerModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        title={`${emp.name} - ${isAr ? 'مرفقات التقرير' : 'Report Attachments'}`}
        lang={lang}
      />

      {/* Official Monthly Payslip (Fiche de Paie) Modal */}
      {canViewSalaries && (
        <PayslipModal
          employee={emp}
          records={attendanceRecords}
          settings={settings}
          currentDate={currentDate}
          isOpen={isPayslipOpen}
          onClose={() => setIsPayslipOpen(false)}
          lang={lang}
        />
      )}
    </div>
  );
};

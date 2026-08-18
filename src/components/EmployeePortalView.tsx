import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, 
  Clock, 
  Send, 
  Sparkles, 
  Star, 
  Video, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  UserCircle2, 
  ExternalLink,
  Award,
  Flame,
  Zap,
  Image as ImageIcon,
  UploadCloud,
  X,
  Eye,
  Loader2,
  FileText,
  Printer,
  Download,
  CreditCard,
  Globe2,
  LogOut
} from 'lucide-react';
import { calculateAccruedSalary, getTrialProgress, formatDate, formatShortDate } from '../utils/calculations';
import { compressAndConvertToBase64 } from '../utils/imageUtils';
import { getPayoutMethodLabel } from '../utils/payslipUtils';
import { ImageViewerModal } from './ImageViewerModal';
import { PayslipModal } from './PayslipModal';

export const EmployeePortalView: React.FC = () => {
  const {
    authUser,
    logout,
    employees,
    attendanceRecords,
    currentDate,
    settings,
    currentEmployeeId,
    setCurrentEmployeeId,
    getRecordForEmployeeAndDate,
    updateEmployeeReport,
    lang,
    t
  } = useApp();

  const isAr = lang === 'ar';

  const activeEmployee = employees.find(e => e.id === currentEmployeeId) || employees[0];
  const todayRecord = activeEmployee ? getRecordForEmployeeAndDate(activeEmployee.id, currentDate) : undefined;
  
  const [reportText, setReportText] = useState(todayRecord?.employeeTaskReport || '');
  const [deliverableUrl, setDeliverableUrl] = useState(todayRecord?.videoDeliverableUrl || '');
  const [images, setImages] = useState<string[]>(todayRecord?.reportImages || []);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Payslip Modal state
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  // Lightbox Modal state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeEmployee) {
      const rec = getRecordForEmployeeAndDate(activeEmployee.id, currentDate);
      setReportText(rec?.employeeTaskReport || '');
      setDeliverableUrl(rec?.videoDeliverableUrl || '');
      setImages(rec?.reportImages || []);
    }
  }, [activeEmployee?.id, currentDate, attendanceRecords]);

  if (!activeEmployee) {
    return (
      <div className="p-8 text-center text-xs text-[#9CA3AF]">
        {isAr ? 'لم يتم العثور على موظف نشط.' : 'No active employee selected.'}
      </div>
    );
  }

  const stats = calculateAccruedSalary(activeEmployee, attendanceRecords, currentDate, settings);
  const trialProg = getTrialProgress(activeEmployee, currentDate);
  const isTrial = activeEmployee.contractType === '1_week_trial';

  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsProcessingImages(true);
    try {
      const convertedImages: string[] = [];
      for (const file of fileList) {
        const base64 = await compressAndConvertToBase64(file, 1200, 1200, 0.82);
        convertedImages.push(base64);
      }
      setImages(prev => [...prev, ...convertedImages]);
    } catch (err) {
      console.error('Error processing images:', err);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenLightbox = (imgs: string[], index = 0) => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    updateEmployeeReport(activeEmployee.id, currentDate, {
      reportText: reportText.trim(),
      deliverableUrl: deliverableUrl.trim() || undefined,
      reportImages: images
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => setIsSubmittedSuccess(false), 3500);
  };

  const pastReports = attendanceRecords
    .filter(r => r.employeeId === activeEmployee.id && (r.employeeTaskReport || r.adminRating || (r.reportImages && r.reportImages.length > 0)))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Banner: Employee Header with Member Switcher */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
            style={{ backgroundColor: activeEmployee.avatarColor || '#E06D28' }}
          >
            {activeEmployee.avatarInitial || activeEmployee.name.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
              <span>{activeEmployee.name}</span>
              <span className="font-mono text-xs text-[#FB923C] bg-[#17181D] px-2 py-0.5 rounded-md border border-[#2D3039]">
                {activeEmployee.accessCode}
              </span>
            </h1>
            <p className="text-xs text-[#9CA3AF]">
              {t[`role_${activeEmployee.role}` as keyof typeof t]?.split('(')[0] || activeEmployee.role}
            </p>
          </div>
        </div>

        {/* Quick Member Switcher (for admin) & Logout */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {authUser?.role === 'admin' && employees.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-[#9CA3AF] shrink-0">{isAr ? 'تبديل:' : 'Switch:'}</label>
              <select
                value={activeEmployee.id}
                onChange={(e) => setCurrentEmployeeId(e.target.value)}
                className="bg-[#17181D] border border-[#2D3039] rounded-lg px-2 py-1 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.accessCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer shadow-sm ms-auto"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2]" />
            <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Hero Stats: Accrued Salary & Trial Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accrued Salary Motivation Card */}
        <div className="bg-[#29221C] border border-[#E06D28]/40 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FB923C] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#E06D28] stroke-[2]" />
                <span>{t.accruedSalaryTitle}</span>
              </span>
              <span className="text-xs text-[#9CA3AF] font-mono">{formatShortDate(currentDate, lang)}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-[#FB923C]">
                ${stats.accruedAmount.toFixed(2)}
              </span>
              <span className="text-xs text-[#9CA3AF]">USD</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E06D28]/20 text-xs text-[#F3F4F6]/80">
            {t.earnedMotivator}
          </div>
        </div>

        {/* Trial Progress / Contract Milestone Card */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
                <span>
                  {isTrial
                    ? (isAr ? 'الأسبوع التجريبي (1-Week Trial)' : '1-Week Trial Period')
                    : (isAr ? 'عقد الـ 3 أشهر' : '3-Month Contract')}
                </span>
              </span>
              {isTrial && (
                <span className="text-xs font-bold text-[#E06D28]">
                  {trialProg.daysRemaining === 0
                    ? (isAr ? 'اكتمل الأسبوع!' : 'Completed!')
                    : (isAr ? `متبقي ${trialProg.daysRemaining} أيام` : `${trialProg.daysRemaining} days left`)}
                </span>
              )}
            </div>

            {isTrial ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FFFFFF] font-bold">
                    {isAr ? `اليوم ${trialProg.daysPassed} من 7` : `Day ${trialProg.daysPassed} of 7`}
                  </span>
                  <span className="text-[#9CA3AF] font-mono">{trialProg.percentage}%</span>
                </div>
                <div className="w-full bg-[#17181D] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-[#FB923C] transition-all duration-500 shadow-sm"
                    style={{ width: `${trialProg.percentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-[#10B981] font-bold text-sm">
                <Award className="w-5 h-5 stroke-[1.75]" />
                <span>{isAr ? 'تم تثبيتك بنجاح بعقد رسمي 3 أشهر!' : 'Promoted to 3-Month Contract!'}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#2D3039] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>{isAr ? 'أيام الحضور هذا الشهر:' : 'Present this month:'}</span>
            <span className="font-bold text-[#10B981]">{stats.totalPresentDays} {isAr ? 'أيام' : 'days'}</span>
          </div>
        </div>
      </div>

      {/* Monthly Payslip (Fiche de Paie) Official Download Section */}
      <div className="bg-[#1F2127] border border-[#2D3039] hover:border-[#E06D28]/50 transition-all rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  {t.monthlyPayslip}
                </h3>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30 font-bold">
                  {isAr ? 'وثيقة PDF معتمدة' : 'Official PDF Document'}
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                {t.payslipSubtitle}
              </p>
              
              {/* Payment Route Badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-[#9CA3AF]">
                <span className="flex items-center gap-1 bg-[#17181D] px-2.5 py-1 rounded-lg border border-[#2D3039]">
                  <CreditCard className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span className="text-[#F3F4F6] font-semibold">{getPayoutMethodLabel(activeEmployee.payoutMethod, lang)}</span>
                </span>
                <span className="flex items-center gap-1 bg-[#17181D] px-2.5 py-1 rounded-lg border border-[#2D3039]">
                  <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>🇸🇦 {activeEmployee.senderCountry || 'السعودية'} ➔ 🌍 {activeEmployee.recipientCountry || 'الجزائر'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPayslipOpen(true)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] flex items-center justify-center gap-2 shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4 stroke-[2]" />
              <span>{t.viewDownloadPayslip}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action: Today's Task Report Submission */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <h2 className="text-base font-bold text-[#FFFFFF]">{t.todayWorkReport}</h2>
          </div>
          <span className="text-xs text-[#9CA3AF]">{formatDate(currentDate, lang)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={4}
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={t.todayWorkReportPlaceholder}
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl p-3.5 text-xs sm:text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28] transition-colors leading-relaxed"
            />
          </div>

          {/* Deliverable Video / File URL */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              {t.deliverableLink}
            </label>
            <div className="relative">
              <Video className="w-4 h-4 text-[#6B7280] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
              <input
                type="url"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://loom.com/..."
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          {/* Image Attachments Upload Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#F3F4F6] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E06D28] stroke-[1.75]" />
                <span>{t.attachImages}</span>
              </label>
              <span className="text-[11px] text-[#6B7280]">{t.imageUploadLimit}</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#E06D28] bg-[#E06D28]/10 text-white'
                  : 'border-[#2D3039] bg-[#17181D] hover:border-[#E06D28]/60 hover:bg-[#1C1E25]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesSelected(e.target.files);
                  }
                }}
              />

              {isProcessingImages ? (
                <div className="flex items-center gap-2 text-xs text-[#FB923C] py-2">
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
                  <span>{isAr ? 'جاري معالجة وتحسين الصور...' : 'Optimizing and preparing images...'}</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#1F2127] border border-[#2D3039] flex items-center justify-center text-[#E06D28]">
                    <UploadCloud className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F3F4F6]">
                      {t.dragDropImages}
                    </p>
                    <p className="text-[10px] text-[#6B7280] mt-0.5">
                      {isAr ? 'لقطات شاشة للمونتاج، عينات تصاميم، أو إثباتات إنجاز' : 'Video screenshots, design samples, or proof of progress'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Selected Images Preview Grid */}
            {images.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#9CA3AF] font-medium block">
                  {t.attachedImages} ({images.length}):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video rounded-xl bg-[#17181D] border border-[#2D3039] overflow-hidden shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`attachment-${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLightbox(images, idx);
                          }}
                          className="p-1.5 rounded-lg bg-[#1F2127] text-white hover:text-[#FB923C] hover:bg-[#2D3039] transition-colors cursor-pointer"
                          title={t.viewImage}
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="p-1.5 rounded-lg bg-[#F43F5E] text-white hover:bg-[#E11D48] transition-colors cursor-pointer"
                          title={t.removeImage}
                        >
                          <X className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#10B981] font-medium flex items-center gap-1.5">
              {isSubmittedSuccess && (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  <span>{t.reportSubmittedSuccess}</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessingImages}
              className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 stroke-[2]" />
              <span>{t.submitDailyReport}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History of Manager Ratings and Feedback */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
          <Star className="w-4 h-4 text-[#E06D28] fill-[#E06D28] stroke-[1.75]" />
          <span>{t.managerFeedbackTitle}</span>
        </h2>

        <div className="space-y-3">
          {pastReports.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#6B7280]">
              {t.noFeedbackYet}
            </div>
          ) : (
            pastReports.map(r => (
              <div key={r.id} className="p-3.5 rounded-xl bg-[#17181D] border border-[#2D3039] text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F3F4F6]">{formatDate(r.date, lang)}</span>
                  {r.adminRating && r.adminRating > 0 && (
                    <div className="flex items-center gap-1 text-[#FB923C] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#E06D28] text-[#E06D28] stroke-[1.75]" />
                      <span>{r.adminRating} / 5</span>
                    </div>
                  )}
                </div>

                {r.adminFeedback && (
                  <div className="bg-[#1F2127] p-2.5 rounded-lg text-[#F3F4F6] border border-[#2D3039]">
                    <span className="text-[10px] text-[#FB923C] font-semibold block mb-0.5">{isAr ? 'ملاحظة المشرف:' : 'Manager Note:'}</span>
                    <p className="italic">"{r.adminFeedback}"</p>
                  </div>
                )}

                {r.employeeTaskReport && (
                  <div className="text-[#9CA3AF] text-[11px]">
                    <span className="text-[10px] text-[#6B7280] block mb-0.5">{isAr ? 'ما سجلته أنت:' : 'Your submission:'}</span>
                    <p className="leading-relaxed bg-[#1F2127]/60 p-2 rounded-lg border border-[#2D3039]/40">{r.employeeTaskReport}</p>
                  </div>
                )}

                {/* Attached Images in past report */}
                {r.reportImages && r.reportImages.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#6B7280] block mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-[#E06D28] stroke-[1.75]" />
                      <span>{t.attachedImages} ({r.reportImages.length}):</span>
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {r.reportImages.map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => handleOpenLightbox(r.reportImages!, imgIdx)}
                          className="aspect-video rounded-lg overflow-hidden border border-[#2D3039] hover:border-[#E06D28] transition-all cursor-pointer group relative"
                        >
                          <img src={img} alt={`report-img-${imgIdx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5 stroke-[2]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {r.videoDeliverableUrl && (
                  <div className="pt-1">
                    <a
                      href={r.videoDeliverableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#E06D28] hover:underline font-semibold"
                    >
                      <Video className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>{isAr ? 'رابط التسليم المرفق' : 'Deliverable Link'}</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageViewerModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        title={isAr ? 'مرفقات تقرير الإنجاز' : 'Work Report Attachments'}
        lang={lang}
      />

      {/* Official Monthly Payslip (Fiche de Paie) Modal */}
      <PayslipModal
        employee={activeEmployee}
        records={attendanceRecords}
        settings={settings}
        currentDate={currentDate}
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        lang={lang}
      />
    </div>
  );
};

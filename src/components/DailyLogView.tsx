import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarCheck2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCheck, 
  Star, 
  Sparkles, 
  Video, 
  ExternalLink, 
  Filter, 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { formatDate, calculateAccruedSalary, getTrialProgress } from '../utils/calculations';
import { AttendanceStatus, DeliverySpeed } from '../types';
import { ImageViewerModal } from './ImageViewerModal';

export const DailyLogView: React.FC = () => {
  const {
    employees,
    attendanceRecords,
    currentDate,
    setCurrentDate,
    updateAttendanceStatus,
    updateAdminEvaluation,
    markAllPresentToday,
    getRecordForEmployeeAndDate,
    settings,
    lang,
    t
  } = useApp();

  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'trial_only' | 'absent_only' | 'missing_report'>('all');

  // Lightbox Modal state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const handleOpenLightbox = (imgs: string[], index = 0, empName = '') => {
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setLightboxTitle(empName ? `${empName} - ${isAr ? 'مرفقات الإنجاز' : 'Report Images'}` : '');
    setIsLightboxOpen(true);
  };

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (emp.status === 'terminated') return false;

    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.accessCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const rec = getRecordForEmployeeAndDate(emp.id, currentDate);

    if (filterMode === 'trial_only' && emp.contractType !== '1_week_trial') return false;
    if (filterMode === 'absent_only' && rec?.status !== 'absent') return false;
    if (filterMode === 'missing_report' && rec?.employeeTaskReport && rec.employeeTaskReport.trim().length > 0) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Date Selector */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#17181D] border border-[#2D3039] rounded-xl p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] transition-colors cursor-pointer"
              title={isAr ? 'اليوم السابق' : 'Previous Day'}
            >
              {isAr ? <ChevronRight className="w-4 h-4 stroke-[1.75]" /> : <ChevronLeft className="w-4 h-4 stroke-[1.75]" />}
            </button>

            <div className="px-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
              <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                {formatDate(currentDate, lang)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] transition-colors cursor-pointer"
              title={isAr ? 'اليوم التالي' : 'Next Day'}
            >
              {isAr ? <ChevronLeft className="w-4 h-4 stroke-[1.75]" /> : <ChevronRight className="w-4 h-4 stroke-[1.75]" />}
            </button>
          </div>

          <button
            onClick={handleToday}
            className="py-2 px-3 rounded-xl text-xs font-semibold text-[#E06D28] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
          >
            {isAr ? 'اليوم الحالي' : 'Today'}
          </button>
        </div>

        {/* Action: Mark All Present */}
        <button
          onClick={() => markAllPresentToday(currentDate)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 stroke-[2]" />
          <span>{t.markAllPresent}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1F2127]/80 border border-[#2D3039] p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو التخصص أو الكود...' : 'Search by name, role, code...'}
            className="w-full bg-[#17181D] border border-[#2D3039] rounded-lg pl-9 rtl:pr-9 rtl:pl-3 py-1.5 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'trial_only', label: isAr ? 'فترة التجربة فقط' : 'Trial Only' },
            { id: 'absent_only', label: isAr ? 'الغائبون اليوم' : 'Absent' },
            { id: 'missing_report', label: isAr ? 'بدون تقرير' : 'No Report' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`py-1 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                filterMode === f.id
                  ? 'bg-[#E06D28] text-white font-bold shadow-sm'
                  : 'bg-[#17181D] text-[#9CA3AF] hover:text-[#FFFFFF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Attendance & Evaluation List */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-12 text-center text-xs text-[#9CA3AF]">
            {isAr ? 'لا يوجد موظفون مطابقون لبحثك في هذا التاريخ.' : 'No members found matching your search.'}
          </div>
        ) : (
          filteredEmployees.map(emp => {
            const record = getRecordForEmployeeAndDate(emp.id, currentDate);
            const status: AttendanceStatus = record?.status || 'present';
            const rating = record?.adminRating || 0;
            const speed = record?.adminDeliverySpeed || 'on_time';
            const feedback = record?.adminFeedback || '';
            const report = record?.employeeTaskReport || '';
            const videoUrl = record?.videoDeliverableUrl || '';

            const trialProg = getTrialProgress(emp, currentDate);
            const isTrial = emp.contractType === '1_week_trial';

            return (
              <div
                key={emp.id}
                className={`bg-[#1F2127] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                  status === 'absent'
                    ? 'border-[#F43F5E]/40 bg-[#251A1F]'
                    : 'border-[#2D3039] hover:border-[#E06D28]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-[#2D3039]">
                  {/* Member Profile */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
                      style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
                    >
                      {emp.avatarInitial || emp.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#FFFFFF]">{emp.name}</h3>
                        <span className="font-mono text-[11px] text-[#9CA3AF] bg-[#17181D] px-1.5 py-0.5 rounded border border-[#2D3039]">
                          {emp.accessCode}
                        </span>
                        {isTrial && (
                          <span className="bg-[#E06D28]/15 text-[#FB923C] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E06D28]/30">
                            {isAr ? `أسبوع التجربة (${trialProg.daysPassed}/7)` : `Trial (${trialProg.daysPassed}/7)`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {t[`role_${emp.role}` as keyof typeof t]?.split('(')[0] || emp.role}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Toggle & Absence Penalty */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    {/* Status Pill Selectors */}
                    <div className="flex items-center bg-[#17181D] p-1 rounded-xl border border-[#2D3039]">
                      <button
                        type="button"
                        onClick={() => updateAttendanceStatus(emp.id, currentDate, 'present')}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          status === 'present'
                            ? 'bg-[#10B981] text-white font-bold shadow-sm'
                            : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{t.status_present}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateAttendanceStatus(emp.id, currentDate, 'absent')}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          status === 'absent'
                            ? 'bg-[#F43F5E] text-white font-bold shadow-sm'
                            : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{t.status_absent}</span>
                      </button>
                    </div>

                    {/* Live Deduction Display if Absent */}
                    {status === 'absent' && (
                      <div className="bg-[#F43F5E]/15 border border-[#F43F5E]/40 text-[#FB7185] px-2.5 py-1 rounded-lg text-xs font-bold font-mono animate-pulse shrink-0">
                        -{record?.deductionAmount?.toFixed(1) || '11.4'}$ USD
                      </div>
                    )}
                  </div>
                </div>

                {/* Dual Notes Section (Admin Feedback & Employee Report) */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Admin Evaluation (Stars, Speed, Notes) */}
                  <div className="space-y-3 bg-[#17181D] p-3.5 rounded-xl border border-[#2D3039]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E06D28] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{t.adminEvaluation}</span>
                      </span>

                      {/* 5-Star Rating Selector */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => updateAdminEvaluation(emp.id, currentDate, { rating: star })}
                            className="p-0.5 text-[#4B5563] hover:text-[#E06D28] transition-colors cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 stroke-[1.75] ${
                                star <= rating
                                  ? 'text-[#E06D28] fill-[#E06D28]'
                                  : 'text-[#4B5563]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Speed Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-[#9CA3AF]">{isAr ? 'سرعة التسليم:' : 'Speed:'}</span>
                      {[
                        { id: 'exceptional', label: t.speed_exceptional },
                        { id: 'fast', label: t.speed_fast },
                        { id: 'on_time', label: t.speed_on_time },
                        { id: 'delayed', label: t.speed_delayed },
                      ].map(s => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => updateAdminEvaluation(emp.id, currentDate, { speed: s.id as DeliverySpeed })}
                          className={`text-[10px] py-1 px-2 rounded-md font-medium transition-all cursor-pointer ${
                            speed === s.id
                              ? 'bg-[#E06D28]/20 text-[#FB923C] border border-[#E06D28]/50 font-bold'
                              : 'bg-[#1F2127] text-[#9CA3AF] hover:text-[#FFFFFF]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Feedback Notes Input */}
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => updateAdminEvaluation(emp.id, currentDate, { feedback: e.target.value })}
                      placeholder={t.adminNotesPlaceholder}
                      className="w-full bg-[#1F2127] border border-[#2D3039] rounded-lg p-2 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28] transition-colors resize-none"
                    />
                  </div>

                  {/* Right Column: Employee Work Report & Video Deliverable */}
                  <div className="space-y-2.5 bg-[#17181D] p-3.5 rounded-xl border border-[#2D3039] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#9CA3AF] stroke-[1.75]" />
                          <span>{t.employeeWorkReport}</span>
                        </span>

                        {record?.employeeSubmittedAt && (
                          <span className="text-[10px] text-[#9CA3AF] font-mono">
                            {isAr ? `رُفع ${record.employeeSubmittedAt}` : `Submitted ${record.employeeSubmittedAt}`}
                          </span>
                        )}
                      </div>

                      {report ? (
                        <p className="text-xs text-[#F3F4F6] bg-[#1F2127] p-2.5 rounded-lg border border-[#2D3039] leading-relaxed">
                          {report}
                        </p>
                      ) : (
                        <p className="text-xs text-[#6B7280] italic bg-[#1F2127]/50 p-2.5 rounded-lg border border-[#2D3039]/40">
                          {t.noReportYet}
                        </p>
                      )}

                      {/* Attached Images preview */}
                      {record?.reportImages && record.reportImages.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] text-[#9CA3AF] font-semibold mb-1.5 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-[#E06D28] stroke-[1.75]" />
                            <span>{t.attachedImages} ({record.reportImages.length}):</span>
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                            {record.reportImages.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => handleOpenLightbox(record.reportImages!, imgIdx, emp.name)}
                                className="aspect-video rounded-lg overflow-hidden border border-[#2D3039] hover:border-[#E06D28] transition-all cursor-pointer group relative shadow-sm"
                                title={t.viewImage}
                              >
                                <img
                                  src={img}
                                  alt={`report-attachment-${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-3.5 h-3.5 stroke-[2]" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Deliverable Link */}
                    {videoUrl ? (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#E06D28] hover:text-[#F07935] hover:underline w-fit pt-1 font-semibold"
                      >
                        <Video className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{isAr ? 'فتح رابط الفيديو والتسليم' : 'Open Deliverable Link'}</span>
                        <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
                        <Video className="w-3 h-3 text-[#4B5563] stroke-[1.75]" />
                        <span>{isAr ? 'لم يُرفق رابط تسليم بعد' : 'No video link attached'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal for Full-Resolution Preview */}
      <ImageViewerModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        title={lightboxTitle || (isAr ? 'معاينة مرفقات التقرير' : 'Report Attachments Preview')}
        lang={lang}
      />
    </div>
  );
};

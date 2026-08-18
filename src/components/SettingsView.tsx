import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  Mail, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Database,
  RefreshCw,
  Globe
} from 'lucide-react';
import { DeductionType } from '../types';
import { BrandLogo } from './BrandLogo';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToDefaultData, 
    lang, 
    t,
    isCloudConnected,
    isCloudSyncing,
    lastSyncedTime,
    syncWithCloud,
    setIsVercelSyncModalOpen
  } = useApp();
  const isAr = lang === 'ar';

  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'Roufablida90@gmail.com');
  const [weekendDays, setWeekendDays] = useState<number[]>(settings.defaultWeekendDays || [5, 6]);
  const [defaultSalary, setDefaultSalary] = useState(settings.defaultSalary || 250);
  const [deductionType, setDeductionType] = useState<DeductionType>(settings.defaultDeductionType || 'daily_divided');
  const [fixedRate, setFixedRate] = useState(settings.fixedDeductionRate || 10);
  const [companyName, setCompanyName] = useState(settings.companyName || 'مسار');

  const daysOfWeek = [
    { day: 0, ar: 'الأحد', en: 'Sunday' },
    { day: 1, ar: 'الاثنين', en: 'Monday' },
    { day: 2, ar: 'الثلاثاء', en: 'Tuesday' },
    { day: 3, ar: 'الأربعاء', en: 'Wednesday' },
    { day: 4, ar: 'الخميس', en: 'Thursday' },
    { day: 5, ar: 'الجمعة', en: 'Friday' },
    { day: 6, ar: 'السبت', en: 'Saturday' },
  ];

  const toggleWeekendDay = (dayNum: number) => {
    setWeekendDays(prev => 
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      adminEmail: adminEmail.trim(),
      defaultWeekendDays: weekendDays,
      defaultSalary: Number(defaultSalary),
      defaultDeductionType: deductionType,
      fixedDeductionRate: Number(fixedRate),
      companyName: companyName.trim()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FFFFFF]">{t.settings}</h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr
                ? 'ضبط قواعد احتساب الخصومات، أيام العطلات الأسبوعية، وبريد الإشعارات.'
                : 'Configure deduction rules, weekend off days, and admin notifications email.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Admin & Notification Settings */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <span>{isAr ? 'إعدادات الإشعارات والبريد التلقائي' : 'Notifications & Email Configuration'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {isAr ? 'بريد الأدمن المستلم للملخصات الأسبوعية' : 'Admin Digest Recipient Email'} *
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Roufablida90@gmail.com"
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs font-medium text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {isAr ? 'اسم المنصة / الشركة' : 'Company / App Name'}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          {/* Brand Identity & Logo Symbolism */}
          <div className="p-4 bg-[#17181D] rounded-xl border border-[#2D3039] space-y-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={true} lang={lang} textSubtitle={isAr ? 'الهوية البصرية والدلالة' : 'Visual Identity & Meaning'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-[#1F2127] rounded-lg border border-[#2D3039]">
                <span className="text-[#FB923C] font-bold block">{isAr ? '1. الكلمة (مسار)' : '1. The Word (Masar)'}</span>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {isAr ? 'حرف الميم (م) المندمج بأساس الشعار يمثل أصل المنصة والانطلاق.' : 'The stylized "M" foundation represents the platform origin.'}
                </p>
              </div>

              <div className="p-2.5 bg-[#1F2127] rounded-lg border border-[#2D3039]">
                <span className="text-[#FB923C] font-bold block">{isAr ? '2. المعنى (الارتقاء والنمو)' : '2. The Meaning (Growth)'}</span>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {isAr ? 'المسار الصاعد المتدرج من أسبوع التجربة إلى تثبيت العقد 3 أشهر.' : 'Ascending trajectory from 1-week trial to full 3-month contract.'}
                </p>
              </div>

              <div className="p-2.5 bg-[#1F2127] rounded-lg border border-[#2D3039]">
                <span className="text-[#FB923C] font-bold block">{isAr ? '3. العمل (صناعة الفيديو)' : '3. The Work (Creative Media)'}</span>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {isAr ? 'رأس الشعار بهيئة مثلث التشغيل (Playhead ▶) يرمز للإنتاج والمونتاج والحركة.' : 'The forward playhead vertex symbolizes video editing and creative action.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#17181D] rounded-xl border border-[#2D3039] text-xs text-[#9CA3AF] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 stroke-[1.75]" />
            <span>
              {isAr
                ? `خدمة إرسال الملخص الأسبوعي مجدولة تلقائياً كل يوم خميس مساءً إلى ${adminEmail}.`
                : `Weekly summary report scheduled every Thursday evening to ${adminEmail}.`}
            </span>
          </div>
        </div>

        {/* Section 2: Weekend Off Days Configuration */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
              <span>{isAr ? 'تقويم أيام العمل والعطلات الأسبوعية' : 'Working Days & Weekend Configuration'}</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr ? 'الأيام المحددة كعطلة لن تُحتسب كغياب على الموظفين ولن يُخصم منها الراتب.' : 'Selected weekend days are not counted as absence and incur no salary deductions.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
            {daysOfWeek.map(d => {
              const isSelected = weekendDays.includes(d.day);
              return (
                <button
                  type="button"
                  key={d.day}
                  onClick={() => toggleWeekendDay(d.day)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#34D399] font-bold shadow-sm'
                      : 'bg-[#17181D] border-[#2D3039] text-[#9CA3AF] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span className="text-xs block">{isAr ? d.ar : d.en}</span>
                  <span className="text-[10px] block mt-0.5 opacity-80">
                    {isSelected ? (isAr ? 'عطلة رسمية' : 'Off') : (isAr ? 'يوم عمل' : 'Workday')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Default Salary & Deduction Rules */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <span>{isAr ? 'الراتب الافتراضي وقواعد خصم الغياب' : 'Default Salary & Absence Deduction Rules'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {isAr ? 'الراتب الافتراضي للموظفين الجدد ($)' : 'Default Base Salary ($)'}
              </label>
              <input
                type="number"
                min={50}
                value={defaultSalary}
                onChange={(e) => setDefaultSalary(Number(e.target.value))}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs font-bold text-[#FB923C] focus:outline-none focus:border-[#E06D28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.deductionRule}
              </label>
              <select
                value={deductionType}
                onChange={(e) => setDeductionType(e.target.value as DeductionType)}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
              >
                <option value="daily_divided">{t.deductionDivided}</option>
                <option value="fixed_amount">{t.deductionFixed}</option>
              </select>
            </div>
          </div>

          {deductionType === 'fixed_amount' && (
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.fixedDeductionAmount}
              </label>
              <input
                type="number"
                min={1}
                value={fixedRate}
                onChange={(e) => setFixedRate(Number(e.target.value))}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs font-bold text-[#FB7185] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          )}
        </div>

        {/* Section 4: Cloud Database & Vercel Sync */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3039]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{isAr ? 'قاعدة بيانات Firestore والمزامنة السحابية' : 'Cloud Firestore Database'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCloudConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isCloudConnected ? (isAr ? 'متصلة بالسحابة' : 'Connected') : (isAr ? 'وضع عدم الاتصال' : 'Offline Cache')}
                  </span>
                </h3>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  {isAr 
                    ? `مشروع Firebase: crucial-rainfall-txctm • آخر مزامنة: ${lastSyncedTime || 'تلقائي'}`
                    : `Firebase Project: crucial-rainfall-txctm • Last sync: ${lastSyncedTime || 'Auto'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncWithCloud()}
                disabled={isCloudSyncing}
                className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                <span>{isCloudSyncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة الآن' : 'Sync Now')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVercelSyncModalOpen(true)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#FB923C]" />
                <span>{isAr ? 'إعدادات Vercel' : 'Vercel Settings'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#9CA3AF] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>
              {isAr
                ? 'يتم حفظ جميع التعديلات والإضافات بشكل فوري ومزدوج في قاعدة بيانات Google Firestore السحابية وفي التخزين المحلي.'
                : 'All changes are automatically synced to Google Cloud Firestore and backed up in local offline storage.'}
            </span>
          </div>
        </div>

        {/* Section 5: Data Management */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#FFFFFF]">{isAr ? 'إعادة ضبط البيانات التجريبية' : 'Reset Demo Data'}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              {isAr ? 'استعادة أعضاء الفريق وسجلات الحضور الافتراضية.' : 'Restores initial creative team and attendance records.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm(isAr ? 'هل تريد استعادة البيانات الافتراضية الأولية؟' : 'Restore initial sample data?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] border border-[#2D3039] hover:bg-[#262831] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>{isAr ? 'استعادة البيانات' : 'Reset Data'}</span>
          </button>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2]" />
            <span>{t.saveChanges}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

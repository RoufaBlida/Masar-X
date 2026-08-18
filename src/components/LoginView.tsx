import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { 
  ShieldCheck, 
  UserCircle2, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  Globe2, 
  Sparkles,
  Database,
  Briefcase,
  ExternalLink
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { 
    loginAsAdmin, 
    loginWithGoogle, 
    loginAsEmployee, 
    lang, 
    setLang, 
    isCloudConnected,
    employees 
  } = useApp();

  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeLoginType, setActiveLoginType] = useState<'admin' | 'employee'>('admin');
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState('roufablida360@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Employee form state
  const [employeeCode, setEmployeeCode] = useState('');
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // Google loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminLoading(true);

    const res = await loginAsAdmin(adminEmail, adminPassword);
    setIsAdminLoading(false);
    if (!res.success) {
      setAdminError(res.error || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    }
  };

  const handleGoogleSignIn = async () => {
    setAdminError(null);
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (!res.success) {
      setAdminError(res.error || (isAr ? 'تعذر تسجيل الدخول عبر Google' : 'Google sign-in failed'));
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError(null);
    setIsEmployeeLoading(true);

    const res = await loginAsEmployee(employeeCode);
    setIsEmployeeLoading(false);
    if (!res.success) {
      setEmployeeError(res.error || (isAr ? 'كود الموظف غير صحيح' : 'Invalid code'));
    }
  };

  return (
    <div className="min-h-screen bg-[#141518] bg-ambient-warm text-[#F3F4F6] flex flex-col justify-between selection:bg-[#E06D28]/30 selection:text-[#FFFFFF] p-4 sm:p-6 lg:p-8">
      {/* Top Header Row */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <BrandLogo size="md" showText={true} lang={lang} />
        
        <div className="flex items-center gap-3">
          {/* Cloud Database status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1F2127] border border-[#2D3039]">
            <Database className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[#9CA3AF]">
              {isCloudConnected ? (isAr ? 'قاعدة بيانات Firestore نشطة' : 'Firestore Connected') : (isAr ? 'المزامنة المحلية نشطة' : 'Local Storage')}
            </span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Center Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8 animate-fadeIn">
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Portal Switcher Tabs */}
          <div className="p-1.5 bg-[#17181D] border-b border-[#2D3039] grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                setActiveLoginType('admin');
                setAdminError(null);
                setEmployeeError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeLoginType === 'admin'
                  ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/30 font-bold'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2127]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
              <span>{isAr ? 'لوحة الإدارة' : 'Admin Login'}</span>
            </button>

            <button
              onClick={() => {
                setActiveLoginType('employee');
                setAdminError(null);
                setEmployeeError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeLoginType === 'employee'
                  ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/30 font-bold'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2127]'
              }`}
            >
              <UserCircle2 className="w-4 h-4 stroke-[2]" />
              <span>{isAr ? 'بوابة الموظف' : 'Employee Portal'}</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Admin Login Screen */}
            {activeLoginType === 'admin' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isAr ? 'تسجيل دخول المشرف' : 'Administrator Sign In'}
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {isAr
                      ? 'مرحباً بك في منصة مسار. سجّل دخولك لإدارة فريق العمل والرواتب وقرارات التقييم.'
                      : 'Sign in to manage your team, evaluations, daily logs, and payouts.'}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] hover:border-[#4B5060] text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleLoading ? (isAr ? 'جاري الاتصال بـ Google...' : 'Connecting...') : (isAr ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google')}</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <div className="h-px bg-[#2D3039] flex-1" />
                  <span>{isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}</span>
                  <div className="h-px bg-[#2D3039] flex-1" />
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                      {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute top-1/2 -translate-y-1/2 start-3" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="roufablida360@gmail.com"
                        className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2.5 ps-9 pe-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#E2E8F0]">
                        {isAr ? 'كلمة المرور / الرمز السري' : 'Password / Access Key'}
                      </label>
                      <span className="text-[10px] text-[#9CA3AF]">
                        {isAr ? '(اختياري للدخول السريع)' : '(Optional)'}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9CA3AF] absolute top-1/2 -translate-y-1/2 start-3" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2.5 ps-9 pe-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E06D28] hover:bg-[#F07935] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#E06D28]/30 transition-all cursor-pointer"
                  >
                    <span>{isAdminLoading ? (isAr ? 'جاري التحقق...' : 'Signing in...') : (isAr ? 'دخول لوحة التحكم' : 'Enter Dashboard')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Employee Login Screen */}
            {activeLoginType === 'employee' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isAr ? 'بوابة الموظف' : 'Employee Portal'}
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {isAr
                      ? 'أدخل كود الدخول الخاص بك المسلم لك من الإدارة لتسجيل إنجازك اليومي وعرض قسيمة راتبك.'
                      : 'Enter your assigned access code to submit daily task reports and view your payslip.'}
                  </p>
                </div>

                {employeeError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{employeeError}</span>
                  </div>
                )}

                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                      {isAr ? 'كود الدخول السري (Access Code)' : 'Employee Access Code'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#FB923C] absolute top-1/2 -translate-y-1/2 start-3" />
                      <input
                        type="text"
                        required
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="مثال: EMP-101"
                        className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2.5 ps-9 pe-3 text-xs font-mono font-bold text-[#FB923C] placeholder-[#6B7280] focus:outline-none uppercase tracking-wider transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#17181D] border border-[#2D3039] text-[11px] text-[#9CA3AF] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#E2E8F0] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{isAr ? 'مميزات بوابة الموظف:' : 'Employee Portal features:'}</span>
                    </div>
                    <ul className="list-disc list-inside ps-1 space-y-0.5 text-[#9CA3AF]">
                      <li>{isAr ? 'رفع تقارير الإنجاز وروابط الفيديو ولقطات الشاشة' : 'Submit daily task reports & video deliverables'}</li>
                      <li>{isAr ? 'متابعة تقييم الأسبوع التجريبي وملاحظات الإدارة' : 'Track trial evaluation and manager ratings'}</li>
                      <li>{isAr ? 'طباعة وتنزيل قسيمة الراتب الرسمية PDF' : 'Download official monthly / trial payslips'}</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={isEmployeeLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E06D28] hover:bg-[#F07935] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#E06D28]/30 transition-all cursor-pointer"
                  >
                    <span>{isEmployeeLoading ? (isAr ? 'جاري التحقق من الكود...' : 'Verifying...') : (isAr ? 'تسجيل الدخول لبوابتي' : 'Login to My Portal')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#17181D] border-t border-[#2D3039] text-center text-[11px] text-[#6B7280]">
            <span>{isAr ? 'منصة مسار لإدارة فرق العمل الإبداعية ومتابعة فترات التجربة' : 'Masar Platform for Creative Teams Management'}</span>
          </div>

        </div>
      </div>

      {/* Page Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-[#6B7280] py-2">
        <p>© 2026 مسار (MASAR) • {isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</p>
      </div>
    </div>
  );
};

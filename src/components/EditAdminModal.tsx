import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  EyeOff, 
  Check, 
  DollarSign, 
  CalendarCheck2, 
  Clock, 
  Users, 
  Award, 
  FileSpreadsheet, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { AdminAccount, AdminPermissions, DEFAULT_SUPERVISOR_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '../types';
import { useApp } from '../context/AppContext';

interface EditAdminModalProps {
  admin: AdminAccount;
  onClose: () => void;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({ admin, onClose }) => {
  const { updateAuthorizedAdmin, lang } = useApp();
  const isAr = lang === 'ar';

  const [name, setName] = useState(admin.name || '');
  const [email, setEmail] = useState(admin.email || '');
  const [password, setPassword] = useState(admin.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'super_admin' | 'supervisor'>(admin.role || 'supervisor');
  const [permissions, setPermissions] = useState<AdminPermissions>({
    ...(admin.permissions || (admin.role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_SUPERVISOR_PERMISSIONS))
  });

  const permissionDefinitions: {
    key: keyof AdminPermissions;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'canViewSalaries',
      titleAr: 'رؤية الرواتب والمبالغ المستحقة والخصومات',
      titleEn: 'View Salaries & Accrued Amounts',
      descAr: 'الاطلاع على الراتب الأساسي، كم باقي له من الراتب، تفاصيل وقسيمة الراتب.',
      descEn: 'See base salaries, remaining payouts, and financial cards.',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'canEditSalaries',
      titleAr: 'تعديل الرواتب وقواعد الخصم',
      titleEn: 'Edit Salaries & Rates',
      descAr: 'تعديل الراتب الشهري للموظف أو تغيير نسبة الخصم.',
      descEn: 'Update employee salary amounts and deduction rates.',
      icon: <Lock className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'canViewAttendance',
      titleAr: 'عرض سجلات الحضور والغياب',
      titleEn: 'View Attendance Records',
      descAr: 'الاطلاع على أيام حضور وغياب الموظفين وعدد أيام الغياب وتفاصيل الأداء.',
      descEn: 'See daily attendance, absence counts, and progress logs.',
      icon: <CalendarCheck2 className="w-4 h-4 text-blue-400" />
    },
    {
      key: 'canEditAttendance',
      titleAr: 'تسجيل الحضور والغياب وتقييم المهام',
      titleEn: 'Record Attendance & Ratings',
      descAr: 'تسجيل حضور وغياب الموظفين وإعطاء النجوم والتقييمات للسرعة والجودة.',
      descEn: 'Mark daily attendance status, speed rating, and quality scores.',
      icon: <Clock className="w-4 h-4 text-purple-400" />
    },
    {
      key: 'canManageTeam',
      titleAr: 'إدارة الفريق والموظفين',
      titleEn: 'Manage Team Members',
      descAr: 'إضافة موظفين جدد، تعديل بياناتهم، أو حذفهم من النظام.',
      descEn: 'Add new staff, edit profile information, and delete members.',
      icon: <Users className="w-4 h-4 text-orange-400" />
    },
    {
      key: 'canMakeTrialDecisions',
      titleAr: 'اتخاذ قرارات فترات التجربة والتثبيت',
      titleEn: 'Make Trial & Contract Decisions',
      descAr: 'ترقية الموظف إلى عقد 3 أشهر أو إنهاء فترة التجربة وإرسال إشعارات القرار.',
      descEn: 'Upgrade candidate to 3-month contract or terminate trial.',
      icon: <Award className="w-4 h-4 text-yellow-400" />
    },
    {
      key: 'canExportReports',
      titleAr: 'تصدير التقارير وكشوفات Excel',
      titleEn: 'Export Excel & Reports',
      descAr: 'تحميل كشوفات الحضور والأداء والرواتب كملفات Excel وCSV.',
      descEn: 'Download attendance spreadsheets and reports to CSV.',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-400" />
    },
    {
      key: 'canAccessSettings',
      titleAr: 'الوصول لصفحة الإعدادات وتفويض المشرفين',
      titleEn: 'Access Settings & Supervisor Management',
      descAr: 'الدخول للإعدادات والتحكم بالنظام وإضافة مشرفين آخرين.',
      descEn: 'Access this settings tab and configure platform options.',
      icon: <SettingsIcon className="w-4 h-4 text-pink-400" />
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateAuthorizedAdmin(admin.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password: password.trim() || undefined,
      permissions: role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : permissions
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">
                {isAr ? 'تعديل بيانات وحساب المشرف / المدير' : 'Edit Supervisor & Admin Account'}
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {isAr ? 'تعديل الاسم، البريد، كلمة المرور، وتخصيص الصلاحيات' : 'Update name, email, password, and permissions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Email Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'اسم المدير / المشرف' : 'Name'}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@domain.com"
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Role & Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'الرتبة الإدارية' : 'Role'}</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'super_admin' | 'supervisor')}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="supervisor">{isAr ? 'مشرف بصلاحيات مخصصة' : 'Supervisor (Custom Permissions)'}</option>
                <option value="super_admin">{isAr ? 'مدير عام كامل الصلاحيات' : 'Super Admin (Full Access)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span>{isAr ? 'كلمة المرور' : 'Password'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-[#9CA3AF] hover:text-[#FFFFFF] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}</span>
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAr ? 'أدخل كلمة مرور جديدة أو اتركها كما هي' : 'Enter password...'}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Granular Permissions Section (For Supervisors) */}
          {role === 'supervisor' && (
            <div className="space-y-2.5 pt-2 border-t border-[#2D3039]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FB923C] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تخصيص الصلاحيات الممنوحة:' : 'Custom Permissions:'}</span>
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPermissions({ ...SUPER_ADMIN_PERMISSIONS })}
                    className="text-[#E06D28] hover:underline cursor-pointer"
                  >
                    {isAr ? 'تفعيل الكل' : 'Select All'}
                  </button>
                  <span className="text-[#6B7280]">•</span>
                  <button
                    type="button"
                    onClick={() => setPermissions({ ...DEFAULT_SUPERVISOR_PERMISSIONS })}
                    className="text-[#9CA3AF] hover:underline cursor-pointer"
                  >
                    {isAr ? 'الافتراضي (حجب الرواتب)' : 'Default (Mask Salaries)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionDefinitions.map((perm) => {
                  const isChecked = Boolean(permissions[perm.key]);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-[#17181D] border-[#E06D28]/40 shadow-sm' 
                          : 'bg-[#141518] border-[#2D3039] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setPermissions(prev => ({
                            ...prev,
                            [perm.key]: e.target.checked
                          }));
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#E06D28] focus:ring-0 focus:outline-none accent-[#E06D28] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {perm.icon}
                          <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-[#9CA3AF]'}`}>
                            {isAr ? perm.titleAr : perm.titleEn}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">
                          {isAr ? perm.descAr : perm.descEn}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2D3039]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-white bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

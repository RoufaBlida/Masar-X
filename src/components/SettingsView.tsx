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
  Database,
  RefreshCw,
  Globe,
  UserPlus2,
  Trash2,
  KeyRound,
  Lock,
  UserCheck,
  ShieldAlert,
  Crown,
  Eye,
  EyeOff,
  Sliders,
  Check,
  X,
  FileSpreadsheet,
  Users,
  Award,
  CalendarCheck2
} from 'lucide-react';
import { 
  DeductionType, 
  AdminAccount, 
  AdminPermissions, 
  DEFAULT_SUPERVISOR_PERMISSIONS, 
  SUPER_ADMIN_PERMISSIONS 
} from '../types';

export const SettingsView: React.FC = () => {
  const { 
    authUser,
    settings, 
    updateSettings, 
    resetToDefaultData, 
    clearAllLocalData,
    addAuthorizedAdmin,
    updateAuthorizedAdminPermissions,
    removeAuthorizedAdmin,
    updateMasterAdminPassword,
    lang, 
    t,
    isCloudConnected,
    isCloudSyncing,
    lastSyncedTime,
    syncWithCloud,
    setIsVercelSyncModalOpen
  } = useApp();
  const isAr = lang === 'ar';
  const isSuperAdmin = authUser?.adminRole === 'super_admin';

  // Basic Settings State
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'Roufablida90@gmail.com');
  const [weekendDays, setWeekendDays] = useState<number[]>(settings.defaultWeekendDays || [5, 6]);
  const [defaultSalary, setDefaultSalary] = useState(settings.defaultSalary || 250);
  const [deductionType, setDeductionType] = useState<DeductionType>(settings.defaultDeductionType || 'daily_divided');
  const [fixedRate, setFixedRate] = useState(settings.fixedDeductionRate || 10);
  const [companyName, setCompanyName] = useState(settings.companyName || 'منظومة مسار');

  // Master Admin Password State
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [masterPassSaved, setMasterPassSaved] = useState(false);

  // Add Supervisor State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'supervisor'>('supervisor');
  const [newAdminPerms, setNewAdminPerms] = useState<AdminPermissions>({ ...DEFAULT_SUPERVISOR_PERMISSIONS });

  // Selected Supervisor for in-depth Permission Editing
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<AdminPermissions | null>(null);

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

  const handleSaveMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPassword.trim()) return;
    updateMasterAdminPassword(newMasterPassword.trim());
    setMasterPassSaved(true);
    setNewMasterPassword('');
    setTimeout(() => setMasterPassSaved(false), 3000);
  };

  const handleCreateSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    addAuthorizedAdmin({
      name: newAdminName.trim() || (isAr ? 'مشرف متابعة' : 'Supervisor'),
      email: newAdminEmail.trim().toLowerCase(),
      role: newAdminRole,
      password: newAdminPassword.trim() || undefined,
      permissions: newAdminRole === 'super_admin' ? { ...SUPER_ADMIN_PERMISSIONS } : { ...newAdminPerms }
    });

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setNewAdminPerms({ ...DEFAULT_SUPERVISOR_PERMISSIONS });
    setIsAddAdminOpen(false);
  };

  const startEditingPermissions = (admin: AdminAccount) => {
    setEditingAdminId(admin.id);
    setEditingPerms({ ...(admin.permissions || DEFAULT_SUPERVISOR_PERMISSIONS) });
  };

  const saveEditedPermissions = (adminId: string) => {
    if (!editingPerms) return;
    updateAuthorizedAdminPermissions(adminId, editingPerms);
    setEditingAdminId(null);
    setEditingPerms(null);
  };

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
                ? 'إدارة حسابات المشرفين، تخصيص الصلاحيات الدقيقة لكل إداري، قواعد الرواتب، وبريد الإشعارات.'
                : 'Manage admin accounts, assign custom granular permissions, configure salary rules, and cloud sync.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section: Admin Access & Granular Permissions Management (Security Core) */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3039]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'إدارة المشرفين والمدراء وتخصيص الصلاحيات' : 'Admin & Supervisor Access Control'}</span>
              </h2>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {isAr 
                  ? 'أنت كمدير عام تحدد لكل مشرف بدقة: هل يرى كم باقي له راتب، كم غاب، تسجيل الحضور، أو إدارة الفريق.'
                  : 'As Super Admin, configure exact permissions for each manager (salaries, attendance, team management).'}
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsAddAdminOpen(!isAddAdminOpen)}
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <UserPlus2 className="w-3.5 h-3.5" />
              <span>{isAddAdminOpen ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'إضافة مشرف جديد' : 'Add Supervisor')}</span>
            </button>
          )}
        </div>

        {/* Master Admin Info & Password Setting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#FB923C]" />
                <span>{isAr ? 'المدير العام الرئيسي (Master Super Admin)' : 'Master Super Admin'}</span>
              </span>
              <span className="text-[10px] font-bold text-[#FB923C] bg-[#FB923C]/10 border border-[#FB923C]/30 px-2 py-0.5 rounded-full">
                {isAr ? 'المالك الأساسي' : 'Primary Owner'}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-[#FB923C]">Roufablida90@gmail.com</p>
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
              {isAr 
                ? 'الحساب الإداري الأساسي المصرح له بالدخول والتحكم الكامل في جميع بيانات النظام وتفويض المشرفين وتحديد صلاحياتهم.' 
                : 'Primary authorized owner with full administrative access and permissions governance.'}
            </p>
          </div>

          {/* Change Master Password */}
          <form onSubmit={handleSaveMasterPassword} className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-2 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'تعيين / تغيير كلمة مرور المدير العام' : 'Set Master Password'}</span>
              </label>
              <input
                type="password"
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
                placeholder={isAr ? 'أدخل كلمة مرور قوية جديدة...' : 'Enter new strong password...'}
                className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-1.5 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              {masterPassSaved && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                </span>
              )}
              <button
                type="submit"
                disabled={!newMasterPassword.trim()}
                className="py-1 px-3 rounded-lg text-xs font-bold text-white bg-[#262831] hover:bg-[#323642] border border-[#3F4350] disabled:opacity-40 transition-colors cursor-pointer ms-auto"
              >
                {isAr ? 'حفظ كلمة المرور' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Add Supervisor Form with Granular Permissions */}
        {isAddAdminOpen && isSuperAdmin && (
          <form onSubmit={handleCreateSupervisor} className="p-4 sm:p-5 rounded-xl bg-[#17181D] border border-[#E06D28]/40 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <UserPlus2 className="w-4 h-4 text-[#E06D28]" />
                <span>{isAr ? 'تفويض مشرف جديد وتحديد صلاحياته الدقيقة' : 'Authorize New Supervisor with Custom Permissions'}</span>
              </h3>
              <span className="text-[10px] text-[#9CA3AF]">
                {isAr ? 'حدد ما يحق له رؤيته أو تعديله' : 'Configure permissions below'}
              </span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#E2E8F0] mb-1">{isAr ? 'اسم المشرف' : 'Name'}</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder={isAr ? 'مثال: خالد المنصور' : 'e.g. David Smith'}
                  className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-1.5 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E2E8F0] mb-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="supervisor@company.com"
                  className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-1.5 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E2E8F0] mb-1">{isAr ? 'الرتبة العامة' : 'Role'}</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as 'super_admin' | 'supervisor')}
                  className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="supervisor">{isAr ? 'مشرف بصلاحيات محددة' : 'Supervisor (Custom Permissions)'}</option>
                  <option value="super_admin">{isAr ? 'مدير عام كامل الصلاحيات' : 'Super Admin (Full Access)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E2E8F0] mb-1">{isAr ? 'كلمة المرور' : 'Password'}</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-1.5 px-3 text-xs text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>
            </div>

            {/* Permissions Toggles Grid */}
            {newAdminRole === 'supervisor' && (
              <div className="space-y-2 pt-2 border-t border-[#2D3039]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FB923C] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تخصيص الصلاحيات الممنوحة لهذا المشرف:' : 'Grant Specific Permissions:'}</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewAdminPerms({ ...SUPER_ADMIN_PERMISSIONS })}
                      className="text-[#E06D28] hover:underline cursor-pointer"
                    >
                      {isAr ? 'تفعيل الكل' : 'Select All'}
                    </button>
                    <span className="text-[#6B7280]">•</span>
                    <button
                      type="button"
                      onClick={() => setNewAdminPerms({ ...DEFAULT_SUPERVISOR_PERMISSIONS })}
                      className="text-[#9CA3AF] hover:underline cursor-pointer"
                    >
                      {isAr ? 'الافتراضي (حجب الرواتب)' : 'Default (Mask Salaries)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {permissionDefinitions.map((perm) => {
                    const isChecked = Boolean(newAdminPerms[perm.key]);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-[#1F2127] border-[#E06D28]/40 shadow-sm' 
                            : 'bg-[#17181D] border-[#2D3039] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setNewAdminPerms(prev => ({
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
                          <p className="text-[10px] text-[#6B7280] mt-0.5 leading-relaxed">
                            {isAr ? perm.descAr : perm.descEn}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2D3039]">
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(false)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-white bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ وتفويض المشرف' : 'Authorize Supervisor'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Authorized Admins List & Permissions Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#9CA3AF]">
              {isAr ? 'قائمة المشرفين المصرح لهم وصلاحياتهم:' : 'Authorized Supervisors & Permission Status:'}
            </h3>
            <span className="text-[10px] text-[#6B7280]">
              {settings.authorizedAdmins?.length || 0} {isAr ? 'مشرفين' : 'supervisors'}
            </span>
          </div>

          {(!settings.authorizedAdmins || settings.authorizedAdmins.length === 0) ? (
            <div className="p-5 rounded-xl bg-[#17181D] border border-[#2D3039] text-center text-xs text-[#9CA3AF] space-y-1">
              <p>{isAr ? 'لا يوجد مشرفين إضافيين حالياً.' : 'No additional supervisors yet.'}</p>
              <p className="text-[11px] text-[#6B7280]">
                {isAr ? 'انقر على "إضافة مشرف جديد" أعلاه لتفويض زميل وتحديد صلاحياته بدقة.' : 'Click Add Supervisor to invite team leads with custom view/edit rights.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.authorizedAdmins.map(admin => {
                const isEditingThis = editingAdminId === admin.id;
                const p = admin.permissions || DEFAULT_SUPERVISOR_PERMISSIONS;

                return (
                  <div key={admin.id} className="rounded-xl bg-[#17181D] border border-[#2D3039] overflow-hidden transition-all">
                    {/* Header Row */}
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#262831] border border-[#3F4350] flex items-center justify-center font-bold text-xs text-[#FB923C]">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{admin.name}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              admin.role === 'super_admin'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            }`}>
                              {admin.role === 'super_admin' ? (isAr ? 'مدير عام كامل' : 'Super Admin') : (isAr ? 'مشرف محدد الصلاحيات' : 'Supervisor')}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#9CA3AF]">{admin.email}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isSuperAdmin && admin.role !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingThis) {
                                setEditingAdminId(null);
                                setEditingPerms(null);
                              } else {
                                startEditingPermissions(admin);
                              }
                            }}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isEditingThis 
                                ? 'bg-[#E06D28] text-white shadow-sm' 
                                : 'bg-[#262831] hover:bg-[#323642] text-[#E2E8F0] border border-[#3F4350]'
                            }`}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>{isEditingThis ? (isAr ? 'إغلاق الصلاحيات' : 'Close') : (isAr ? 'تعديل الصلاحيات' : 'Edit Permissions')}</span>
                          </button>
                        )}

                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(isAr ? `هل أنت متأكد من حذف صلاحيات المشرف ${admin.name}؟` : `Remove supervisor ${admin.name}?`)) {
                                removeAuthorizedAdmin(admin.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title={isAr ? 'حذف المشرف' : 'Remove supervisor'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions Badges Row */}
                    <div className="px-3.5 pb-3 flex flex-wrap gap-1.5 pt-1 border-t border-[#262831]">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        p.canViewSalaries 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {p.canViewSalaries ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-zinc-400" />}
                        <span>{isAr ? 'رؤية الرواتب' : 'Salaries'}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        p.canViewAttendance 
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {p.canViewAttendance ? <Check className="w-3 h-3 text-blue-400" /> : <X className="w-3 h-3 text-zinc-400" />}
                        <span>{isAr ? 'سجل الحضور' : 'Attendance'}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        p.canEditAttendance 
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {p.canEditAttendance ? <Check className="w-3 h-3 text-purple-400" /> : <X className="w-3 h-3 text-zinc-400" />}
                        <span>{isAr ? 'تسجيل وتقييم المهام' : 'Evaluation'}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        p.canManageTeam 
                          ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {p.canManageTeam ? <Check className="w-3 h-3 text-orange-400" /> : <X className="w-3 h-3 text-zinc-400" />}
                        <span>{isAr ? 'إدارة الفريق' : 'Team Mgmt'}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        p.canMakeTrialDecisions 
                          ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {p.canMakeTrialDecisions ? <Check className="w-3 h-3 text-yellow-400" /> : <X className="w-3 h-3 text-zinc-400" />}
                        <span>{isAr ? 'قرارات التثبيت' : 'Trial Decisions'}</span>
                      </span>
                    </div>

                    {/* Inline Permissions Live Editor */}
                    {isEditingThis && editingPerms && (
                      <div className="p-4 bg-[#141518] border-t border-[#2D3039] space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#FB923C] flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            <span>{isAr ? `تعديل صلاحيات ${admin.name}:` : `Edit Permissions for ${admin.name}:`}</span>
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {isAr ? 'التعديلات تسري فور تسجيل دخوله' : 'Takes effect on next login'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {permissionDefinitions.map((perm) => {
                            const isChecked = Boolean(editingPerms[perm.key]);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked 
                                    ? 'bg-[#1F2127] border-[#E06D28]/40 shadow-sm' 
                                    : 'bg-[#17181D] border-[#2D3039] opacity-75 hover:opacity-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setEditingPerms(prev => prev ? ({
                                      ...prev,
                                      [perm.key]: e.target.checked
                                    }) : null);
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
                                  <p className="text-[10px] text-[#6B7280] mt-0.5 leading-relaxed">
                                    {isAr ? perm.descAr : perm.descEn}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAdminId(null);
                              setEditingPerms(null);
                            }}
                            className="py-1 px-3 rounded-lg text-xs text-[#9CA3AF] hover:text-white bg-[#1F2127] border border-[#2D3039] cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditedPermissions(admin.id)}
                            className="py-1 px-4 rounded-lg text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isAr ? 'حفظ الصلاحيات للمشرف' : 'Save Permissions'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Form for System Parameters */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Admin & Notification Settings */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <span>{isAr ? 'إعدادات الإشعارات والبريد التلقائي' : 'Notifications & Email Configuration'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                {isAr ? 'بريد المدير المستلم للتقارير الأسبوعية' : 'Admin Summary Recipient Email'}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-[#FFFFFF] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">
                {isAr 
                  ? 'البريد الذي سيستلم تقرير ملخص إنجاز الفريق كل يوم خميس الساعة 8:00 مساءً.' 
                  : 'Email where weekly summary reports will be delivered every Thursday at 8:00 PM.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                {isAr ? 'اسم المنشأة / الفريق' : 'Company or Team Name'}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-[#FFFFFF] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Weekend Off Days */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
              <span>{isAr ? 'أيام العطلة الأسبوعية (بدون خصم)' : 'Default Weekend Days (No Deduction)'}</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {isAr
                ? 'الأيام المحددة هنا لا تحتسب أيام غياب ولا يطبق عليها أي خصم مالي للموظفين.'
                : 'Selected days are marked as weekend off, preserving salary without deduction.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {daysOfWeek.map(d => {
              const isSelected = weekendDays.includes(d.day);
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleWeekendDay(d.day)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/30 font-bold'
                      : 'bg-[#17181D] text-[#9CA3AF] hover:text-[#FFFFFF] border border-[#2D3039]'
                  }`}
                >
                  {isAr ? d.ar : d.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Salary & Deduction Rules */}
        <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#E06D28] stroke-[1.75]" />
            <span>{isAr ? 'قواعد احتساب الرواتب والخصومات' : 'Salary & Deduction Rules'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                {isAr ? 'الراتب الشهري الافتراضي للموظف الجديد ($)' : 'Default Base Monthly Salary ($)'}
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={defaultSalary}
                onChange={(e) => setDefaultSalary(Number(e.target.value))}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-[#FFFFFF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                {isAr ? 'نوع احتساب خصم الغياب' : 'Absence Deduction Formula'}
              </label>
              <select
                value={deductionType}
                onChange={(e) => setDeductionType(e.target.value as DeductionType)}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="daily_divided">{isAr ? 'تقسيم الراتب الشهري على 30 يوماً' : 'Divide monthly salary by 30 days'}</option>
                <option value="fixed_amount">{isAr ? 'مبلغ خصم ثابت لكل يوم غياب' : 'Fixed USD deduction amount per day'}</option>
              </select>
            </div>
          </div>

          {deductionType === 'fixed_amount' && (
            <div className="pt-2 max-w-xs">
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                {isAr ? 'مبلغ الخصم الثابت بالدولار ($)' : 'Fixed Deduction Rate ($)'}
              </label>
              <input
                type="number"
                min="0"
                value={fixedRate}
                onChange={(e) => setFixedRate(Number(e.target.value))}
                className="w-full bg-[#17181D] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 px-3 text-xs text-[#FFFFFF] focus:outline-none transition-colors"
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

        {/* Section 5: Data Management (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-[#FFFFFF]">{isAr ? 'حذف وتهيئة جميع البيانات' : 'Purge All Database Records'}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {isAr ? 'حذف جميع الموظفين وسجلات الحضور والتقييمات للبدء بقاعدة بيانات نظيفة 100%.' : 'Permanently remove all employees and attendance logs for a 100% clean database.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف جميع الموظفين وسجلات الحضور والبدء من الصفر؟' : 'Are you sure you want to delete all data and start completely fresh?')) {
                  clearAllLocalData();
                }
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{isAr ? 'حذف جميع البيانات وتصفير النظام' : 'Purge All Records'}</span>
            </button>
          </div>
        )}

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

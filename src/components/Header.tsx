import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Users, 
  Award, 
  BellRing, 
  Settings, 
  UserCircle2, 
  ShieldCheck, 
  Globe2, 
  FileSpreadsheet, 
  Plus,
  LogOut,
  Database,
  Cloud
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenWeeklySummary: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const { 
    authUser,
    logout,
    activeTab, 
    setActiveTab, 
    lang, 
    setLang, 
    t, 
    isEmployeePortal, 
    setIsEmployeePortal,
    employees,
    attendanceRecords,
    currentDate,
    settings,
    isCloudConnected,
    isCloudSyncing,
    setIsVercelSyncModalOpen
  } = useApp();

  const isSuperAdmin = authUser?.adminRole === 'super_admin';
  const perms = authUser?.permissions;

  const canAccessSettings = isSuperAdmin || perms?.canAccessSettings !== false;
  const canMakeTrialDecisions = isSuperAdmin || perms?.canMakeTrialDecisions !== false;
  const canManageTeam = isSuperAdmin || perms?.canManageTeam !== false;
  const canExportReports = isSuperAdmin || perms?.canExportReports !== false;

  const allNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; visible: boolean }[] = [
    { id: 'dashboard', label: lang === 'ar' ? 'الإحصائيات' : 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 stroke-[1.75]" />, visible: true },
    { id: 'daily_log', label: lang === 'ar' ? 'السجل اليومي' : 'Daily Log', icon: <CalendarCheck2 className="w-4 h-4 stroke-[1.75]" />, visible: true },
    { id: 'team', label: lang === 'ar' ? 'الفريق' : 'Team', icon: <Users className="w-4 h-4 stroke-[1.75]" />, visible: true },
    { id: 'trial_decisions', label: lang === 'ar' ? 'قرارات التجربة' : 'Trial Decisions', icon: <Award className="w-4 h-4 stroke-[1.75]" />, visible: canMakeTrialDecisions },
    { id: 'notifications_log', label: lang === 'ar' ? 'الإشعارات' : 'Notifications', icon: <BellRing className="w-4 h-4 stroke-[1.75]" />, visible: true },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: <Settings className="w-4 h-4 stroke-[1.75]" />, visible: canAccessSettings },
  ];

  const navItems = allNavItems.filter(item => item.visible);

  const handleExportCSV = () => {
    exportToCSV(employees, attendanceRecords, currentDate, settings, lang);
  };

  const isAdmin = authUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#17181D]/95 backdrop-blur-md border-b border-[#2D3039] px-4 sm:px-6 py-3 no-print shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title with Signature Logo (Word, Meaning, Work) */}
        <div className="shrink-0">
          <BrandLogo size="md" showText={true} lang={lang} />
        </div>

        {/* Zone 2: Navigation Links (Single functional row) - Visible for Admins */}
        {isAdmin && !isEmployeePortal && (
          <nav className="hidden md:flex items-center gap-1 bg-[#1F2127] p-1 rounded-xl border border-[#2D3039]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E06D28] text-white shadow-sm shadow-[#E06D28]/25 font-bold'
                      : 'text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'تبديل للإنجليزية' : 'Switch to Arabic'}
          >
            <Globe2 className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Cloud Database & Vercel Sync Trigger */}
          {isAdmin && !isEmployeePortal && (
            <button
              onClick={() => setIsVercelSyncModalOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] hover:border-[#E06D28]/40 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'المزامنة السحابية وقاعدة البيانات و Vercel' : 'Cloud Database & Vercel Sync'}
            >
              <Database className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden lg:inline text-[#E2E8F0]">{lang === 'ar' ? 'قاعدة البيانات' : 'Cloud DB'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>
          )}

          {/* Quick Excel Export */}
          {isAdmin && !isEmployeePortal && canExportReports && (
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-[#E06D28] bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title={t.exportExcel}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === 'ar' ? 'تصدير Excel' : 'Excel'}</span>
            </button>
          )}

          {/* Employee Portal / Admin Toggle (Admin only) */}
          {isAdmin && (
            <button
              onClick={() => setIsEmployeePortal(!isEmployeePortal)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all border cursor-pointer ${
                isEmployeePortal
                  ? 'bg-[#E06D28] text-white border-[#E06D28] shadow-sm shadow-[#E06D28]/30 font-bold'
                  : 'bg-[#1F2127] text-[#E2E8F0] border-[#2D3039] hover:border-[#3F4350]'
              }`}
            >
              {isEmployeePortal ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>{lang === 'ar' ? 'لوحة الإدارة' : 'Admin View'}</span>
                </>
              ) : (
                <>
                  <UserCircle2 className="w-3.5 h-3.5 text-[#E06D28] stroke-[1.75]" />
                  <span>{lang === 'ar' ? 'معاينة البوابة' : 'Portal View'}</span>
                </>
              )}
            </button>
          )}

          {/* Add Employee CTA */}
          {isAdmin && !isEmployeePortal && canManageTeam && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/30 whitespace-nowrap shrink-0 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.addEmployee}</span>
            </button>
          )}

          {/* User Profile & Prominent Logout Button */}
          {authUser && (
            <div className="flex items-center gap-2 ps-2 border-s border-[#2D3039]">
              <div className="hidden md:flex flex-col text-end">
                <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">
                  {authUser.name}
                </span>
                <span className="text-[9px] text-[#FB923C] font-semibold leading-tight">
                  {authUser.role === 'admin' 
                    ? (authUser.adminRole === 'super_admin' ? (lang === 'ar' ? 'المدير العام' : 'Super Admin') : (lang === 'ar' ? 'مشرف متابعة' : 'Supervisor'))
                    : (lang === 'ar' ? 'موظف' : 'Employee')}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer shadow-sm"
                title={lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'خروج' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sub-nav for Admins */}
      {isAdmin && !isEmployeePortal && (
        <div className="md:hidden flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E06D28] text-white shadow-sm font-bold'
                    : 'bg-[#1F2127] text-[#9CA3AF] hover:text-[#FFFFFF]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Database, 
  Globe, 
  ShieldCheck, 
  Server, 
  Download,
  AlertCircle
} from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

export const VercelSyncModal: React.FC = () => {
  const { 
    isVercelSyncModalOpen, 
    setIsVercelSyncModalOpen, 
    isCloudConnected, 
    isCloudSyncing, 
    lastSyncedTime, 
    syncWithCloud,
    employees,
    attendanceRecords,
    settings,
    lang,
    showToast 
  } = useApp();

  const [copiedEnv, setCopiedEnv] = useState(false);
  const isAr = lang === 'ar';

  if (!isVercelSyncModalOpen) return null;

  const vercelEnvText = `VITE_FIREBASE_API_KEY=${firebaseConfig.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
VITE_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
VITE_FIREBASE_DATABASE_ID=${firebaseConfig.firestoreDatabaseId}
VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
VITE_FIREBASE_APP_ID=${firebaseConfig.appId}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(vercelEnvText);
    setCopiedEnv(true);
    showToast(isAr ? 'تم نسخ متغيرات البيئة لـ Vercel بنجاح!' : 'Copied Vercel env variables!', 'success');
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      appName: 'Masar - مسار',
      exportedAt: new Date().toISOString(),
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      stats: {
        totalEmployees: employees.length,
        totalAttendanceRecords: attendanceRecords.length
      },
      settings,
      employees,
      attendanceRecords
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masar_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تصدير نسخة احتياطية من قاعدة البيانات بنجاح' : 'Database backup downloaded successfully', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 border border-[#E06D28]/30 flex items-center justify-center text-[#E06D28]">
              <Database className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'المزامنة السحابية وقاعدة البيانات (Firebase & Vercel)' : 'Cloud Database & Vercel Sync'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isCloudConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {isCloudConnected ? (isAr ? 'قاعدة البيانات متصلة' : 'Cloud Connected') : (isAr ? 'المزامنة المحلية نشطة' : 'Local Fallback')}
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {isAr ? 'إدارة قاعدة بيانات Firestore، المزامنة الفورية، والربط مع منصة Vercel' : 'Manage Firestore Database, live sync & Vercel deployment'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVercelSyncModalOpen(false)}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs">
          
          {/* Status & Sync Card */}
          <div className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3039]">
              <div>
                <span className="text-[11px] font-medium text-[#9CA3AF] block">
                  {isAr ? 'مشروع Firebase المربوط:' : 'Connected Firebase Project:'}
                </span>
                <span className="text-xs font-mono font-bold text-[#FB923C]">
                  {firebaseConfig.projectId}
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5 font-mono">
                  DB ID: {firebaseConfig.firestoreDatabaseId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncWithCloud()}
                  disabled={isCloudSyncing}
                  className="py-2 px-3.5 rounded-xl font-bold text-white bg-[#E06D28] hover:bg-[#F07935] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shadow-[#E06D28]/25 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span>{isCloudSyncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة السحابة الآن' : 'Sync Now')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="p-2.5 rounded-lg bg-[#1F2127] border border-[#2D3039]">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'الموظفين المسجلين' : 'Employees'}</span>
                <span className="text-sm font-bold text-white">{employees.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1F2127] border border-[#2D3039]">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'سجلات الحضور' : 'Attendance Logs'}</span>
                <span className="text-sm font-bold text-white">{attendanceRecords.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1F2127] border border-[#2D3039]">
                <span className="text-[10px] text-[#9CA3AF] block">{isAr ? 'آخر مزامنة' : 'Last Synced'}</span>
                <span className="text-xs font-bold text-[#10B981] truncate">{lastSyncedTime || (isAr ? 'تلقائي' : 'Auto')}</span>
              </div>
            </div>
          </div>

          {/* Vercel Integration Section */}
          <div className="p-4 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FB923C]" />
                <h3 className="font-bold text-white text-xs">
                  {isAr ? 'الربط والنشر على Vercel (Vercel Sync & Deployment)' : 'Sync & Deploy to Vercel'}
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#2D3039] text-[#9CA3AF]">
                vercel.json Ready
              </span>
            </div>

            <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
              {isAr
                ? 'تم إنشاء ملف vercel.json وضبط مسارات SPA بالكامل. عند رفع المشروع إلى مستودع GitHub وربطه بـ Vercel، يمكنك إضافة متغيرات البيئة التالية بنقرة واحدة:'
                : 'vercel.json has been configured for SPA routing. When connecting your GitHub repository to Vercel, copy and paste the environment variables below:'}
            </p>

            <div className="relative">
              <pre className="bg-[#0F1014] text-[#A5B4FC] font-mono text-[10px] p-3 rounded-lg border border-[#2D3039] overflow-x-auto leading-tight">
                {vercelEnvText}
              </pre>
              <button
                onClick={handleCopyEnv}
                className="absolute top-2 left-2 rtl:left-2 rtl:right-auto ltr:right-2 ltr:left-auto py-1 px-2.5 rounded-md bg-[#262831] hover:bg-[#323642] text-white text-[10px] font-semibold flex items-center gap-1 border border-[#3E424E] transition-all cursor-pointer"
              >
                {copiedEnv ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ المتغيرات' : 'Copy Env')}</span>
              </button>
            </div>

            {/* Quick steps checklist */}
            <div className="p-3 rounded-lg bg-[#1F2127] border border-[#2D3039] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{isAr ? '1. تم إعداد ملف vercel.json ودعم التوجيه السلس لـ React Router' : '1. vercel.json SPA rewrites configured'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{isAr ? '2. تم تفعيل قواعد أمان Firestore السحابية (firestore.rules)' : '2. Firestore security rules configured & deployed'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{isAr ? '3. مزامنة تلقائية مع LocalStorage كطبقة احتياطية عند انقطاع الاتصال' : '3. Auto-fallback to offline local cache'}</span>
              </div>
            </div>
          </div>

          {/* Database Backup & Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-semibold text-[#D1D5DB] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FB923C]" />
              <span>{isAr ? 'تنزيل نسخة احتياطية من البيانات (JSON Backup)' : 'Export Full JSON Backup'}</span>
            </button>

            <button
              onClick={() => setIsVercelSyncModalOpen(false)}
              className="w-full sm:w-auto py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#262831] hover:bg-[#323642] border border-[#3E424E] transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

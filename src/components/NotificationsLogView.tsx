import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BellRing, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Send, 
  Search, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';

interface NotificationsLogViewProps {
  onOpenWeeklySummary: () => void;
}

export const NotificationsLogView: React.FC<NotificationsLogViewProps> = ({ onOpenWeeklySummary }) => {
  const { notifications, settings, lang } = useApp();
  const isAr = lang === 'ar';

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.sentToEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType !== 'all' && notif.type !== filterType) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
            <BellRing className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
              {isAr ? 'سجل الإشعارات وقرارات الترقية والملخصات' : 'Notifications & Decision Dispatch Log'}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isAr
                ? `توثيق رسمي لجميع الإيميلات وقرارات الترقية والملخصات الأسبوعية المرسلة لـ ${settings.adminEmail}.`
                : `Official log of promotion emails, trial conclusions, and weekly digests sent to ${settings.adminEmail}.`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWeeklySummary}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 stroke-[2]" />
          <span>{isAr ? 'إرسال ملخص أسبوعي جديد' : 'Send Weekly Digest'}</span>
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
            placeholder={isAr ? 'بحث في الإشعارات أو البريد...' : 'Search notifications...'}
            className="w-full bg-[#17181D] border border-[#2D3039] rounded-lg pl-9 rtl:pr-9 rtl:pl-3 py-1.5 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'upgrade_3_months', label: isAr ? 'قرارات الترقية' : 'Promotions' },
            { id: 'weekly_summary', label: isAr ? 'الملخصات الأسبوعية' : 'Weekly Digests' },
            { id: 'terminate_trial', label: isAr ? 'إنهاء التجربة' : 'Terminations' },
            { id: 'custom_email', label: isAr ? 'الترحيب والتهيئة' : 'Onboarding' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`py-1 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#E06D28] text-white font-bold shadow-sm'
                  : 'bg-[#17181D] text-[#9CA3AF] hover:text-[#FFFFFF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl p-12 text-center text-xs text-[#9CA3AF]">
            {isAr ? 'لا توجد إشعارات مسجلة مطابقة لبحثك.' : 'No notifications match your query.'}
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const isUpgrade = notif.type === 'upgrade_3_months';
            const isWeekly = notif.type === 'weekly_summary';

            return (
              <div
                key={notif.id}
                className={`bg-[#1F2127] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                  isUpgrade
                    ? 'border-[#E06D28]/40 bg-[#251F1C]'
                    : isWeekly
                    ? 'border-[#FB923C]/40 bg-[#221C18]'
                    : 'border-[#2D3039]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#2D3039]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isUpgrade
                          ? 'bg-[#E06D28]/20 text-[#FB923C]'
                          : isWeekly
                          ? 'bg-[#FB923C]/20 text-[#FB923C]'
                          : 'bg-[#E06D28]/20 text-[#FB923C]'
                      }`}
                    >
                      <Mail className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#FFFFFF]">{notif.title}</h3>
                      <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#F3F4F6] font-medium">{notif.employeeName}</span>
                        <span>•</span>
                        <span className="font-mono text-[#9CA3AF]">{notif.sentToEmail}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Timestamp */}
                  <div className="flex items-center gap-2">
                    <span className="bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                      <span>{isAr ? 'تم الإرسال بنجاح' : 'Delivered'}</span>
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-mono">{notif.timestamp}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[#F3F4F6] leading-relaxed bg-[#17181D] p-3 rounded-xl border border-[#2D3039]">
                  {notif.message}
                </div>

                {notif.meta?.salary && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-[#FB923C] font-bold">
                    <span>{isAr ? 'الراتب المعتمد الجديد:' : 'Approved New Salary:'}</span>
                    <span>${notif.meta.salary} USD</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

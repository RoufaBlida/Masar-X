import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  UserPlus, 
  DollarSign, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  Sparkles, 
  CreditCard, 
  Globe2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { RoleType, DeductionType, ContractType, PayoutMethod } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#E06D28', // Signature Terracotta
  '#F97316', // Orange
  '#FB923C', // Amber Orange
  '#D97706', // Warm Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#6B7280', // Charcoal Slate
];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee, settings, lang, t } = useApp();
  const isAr = lang === 'ar';

  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleType>('video_editor');
  const [startDate, setStartDate] = useState(todayStr);
  const [baseSalary, setBaseSalary] = useState(settings.defaultSalary || 250);
  const [deductionType, setDeductionType] = useState<DeductionType>(settings.defaultDeductionType || 'daily_divided');
  const [fixedDeductionRate, setFixedDeductionRate] = useState(settings.fixedDeductionRate || 10);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [softwareTools, setSoftwareTools] = useState('Premiere Pro, After Effects');

  // Employee Custom Password
  const generateRandomPassword = () => `emp${Math.floor(1000 + Math.random() * 9000)}`;
  const [password, setPassword] = useState(generateRandomPassword());
  const [showPassword, setShowPassword] = useState(false);

  // Payout information
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('usdt_trc20');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('الجزائر');
  const [senderCountry, setSenderCountry] = useState('المملكة العربية السعودية');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const sDate = new Date(startDate);
    sDate.setDate(sDate.getDate() + 7);
    const trialEndDate = sDate.toISOString().split('T')[0];

    const initials = name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('');

    const toolsArray = softwareTools
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    addEmployee({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password: password.trim() || generateRandomPassword(),
      role,
      avatarColor,
      avatarInitial: initials,
      startDate,
      trialEndDate,
      contractType: '1_week_trial' as ContractType,
      baseSalary: Number(baseSalary) || 250,
      deductionType,
      fixedDeductionRate: deductionType === 'fixed_amount' ? Number(fixedDeductionRate) : undefined,
      status: 'active',
      notes: notes.trim() || undefined,
      softwareTools: toolsArray,
      payoutMethod,
      payoutDetails: payoutDetails.trim() || undefined,
      recipientCountry: recipientCountry.trim() || 'الجزائر',
      senderCountry: senderCountry.trim() || 'المملكة العربية السعودية'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F2127] border border-[#2D3039] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">{t.addEmployee}</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{isAr ? 'إضافة مبدع جديد لأسبوع التجربة الافتراضي' : 'Onboard candidate for 1-week trial'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#262831] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.employeeName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? 'مثال: أحمد خليل' : 'e.g. Alex Miller'}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.email} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@gmail.com"
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          {/* Role and Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.specialty} *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
              >
                <option value="video_editor">{t.role_video_editor}</option>
                <option value="motion_designer">{t.role_motion_designer}</option>
                <option value="thumbnail_designer">{t.role_thumbnail_designer}</option>
                <option value="scriptwriter">{t.role_scriptwriter}</option>
                <option value="sound_designer">{t.role_sound_designer}</option>
                <option value="social_media_manager">{t.role_social_media_manager}</option>
                <option value="developer">{t.role_developer}</option>
                <option value="other">{t.role_other}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.startDate} *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          {/* Salary and Deduction Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.baseSalary} (الافتراضي 250$)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#FB923C] absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 stroke-[1.75]" />
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs font-bold text-[#FB923C] focus:outline-none focus:border-[#E06D28]"
                />
              </div>
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

          {/* Fixed Deduction amount if selected */}
          {deductionType === 'fixed_amount' && (
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.fixedDeductionAmount}
              </label>
              <input
                type="number"
                min={1}
                value={fixedDeductionRate}
                onChange={(e) => setFixedDeductionRate(Number(e.target.value))}
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs font-bold text-[#FB7185] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          )}

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1.5">
              {isAr ? 'لون الهوية للموظف' : 'Avatar Color'}
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-lg transition-all cursor-pointer ${
                    avatarColor === color ? 'ring-2 ring-[#E06D28] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Employee Access Password Configuration */}
          <div className="p-3.5 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FB923C] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'كلمة المرور لبوابة الموظف (Password)' : 'Employee Portal Password'}</span>
              </span>

              <button
                type="button"
                onClick={() => setPassword(generateRandomPassword())}
                className="text-[11px] font-semibold text-[#9CA3AF] hover:text-[#FB923C] flex items-center gap-1 transition-colors cursor-pointer"
                title={isAr ? 'توليد كلمة سر عشوائية جديدة' : 'Generate random password'}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isAr ? 'توليد تلقائي' : 'Generate'}</span>
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAr ? 'مثال: emp4091 أو كلمة سر خاصة' : 'e.g. emp4091 or custom'}
                className="w-full bg-[#1F2127] border border-[#2D3039] focus:border-[#E06D28] rounded-xl py-2 ps-9 pe-10 text-xs font-mono font-bold text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-[#9CA3AF]">
              {isAr 
                ? '💡 يُسلّم هذا الرمز السري مع كود الموظف للمرشح ليتمكن من تسجيل الدخول لبوابته اليومية.' 
                : '💡 Share this password along with the access code for portal login.'}
            </p>
          </div>

          {/* Software & Tools */}
          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
              {isAr ? 'البرامج المتقنة (مفصولة بفاصلة)' : 'Software Tools (comma separated)'}
            </label>
            <input
              type="text"
              value={softwareTools}
              onChange={(e) => setSoftwareTools(e.target.value)}
              placeholder="Premiere Pro, After Effects, CapCut, Photoshop"
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
            />
          </div>

          {/* Payout & Transfer Configuration (For Fiche de Paie) */}
          <div className="p-3.5 rounded-xl bg-[#17181D] border border-[#2D3039] space-y-3">
            <span className="text-xs font-bold text-[#FB923C] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#E06D28]" />
              <span>{isAr ? 'إعدادات تحويل الراتب وقسيمة الدفع (Fiche de Paie)' : 'Payout & Payslip Settings'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                  {isAr ? 'وسيلة استلام الراتب' : 'Payout Method'}
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
                  className="w-full bg-[#1F2127] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] cursor-pointer"
                >
                  <option value="usdt_trc20">USDT (TRC20 / Crypto)</option>
                  <option value="wise">Wise (TransferWise)</option>
                  <option value="bank_transfer">{isAr ? 'تحويل بنكي مباشر' : 'Bank Transfer'}</option>
                  <option value="baridimob">BaridiMob / CCP ({isAr ? 'الجزائر' : 'Algeria'})</option>
                  <option value="paypal">PayPal</option>
                  <option value="payoneer">Payoneer</option>
                  <option value="western_union">Western Union</option>
                  <option value="cash">{isAr ? 'نقداً / تسليم يدوي' : 'Cash Delivery'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                  {isAr ? 'عنوان المحفظة / رقم الحساب / IBAN' : 'Account / Wallet Address'}
                </label>
                <input
                  type="text"
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={payoutMethod === 'usdt_trc20' ? 'TX...' : 'IBAN / Email / Account #'}
                  className="w-full bg-[#1F2127] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] font-mono focus:outline-none focus:border-[#E06D28]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                  {isAr ? 'البلد المرسل (المقر)' : 'Sender Country'}
                </label>
                <input
                  type="text"
                  value={senderCountry}
                  onChange={(e) => setSenderCountry(e.target.value)}
                  placeholder="المملكة العربية السعودية"
                  className="w-full bg-[#1F2127] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-1">
                  {isAr ? 'البلد المستقبل (الموظف)' : 'Recipient Country'}
                </label>
                <input
                  type="text"
                  value={recipientCountry}
                  onChange={(e) => setRecipientCountry(e.target.value)}
                  placeholder="الجزائر"
                  className="w-full bg-[#1F2127] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
              {isAr ? 'ملاحظات أولية عن الموظف' : 'Notes & Highlights'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'نقاط القوة، الروابط، نماذج الأعمال السابقة...' : 'Portfolio highlights, strengths...'}
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl p-2.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] resize-none"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-[#2D3039] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
            >
              {t.addEmployee}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

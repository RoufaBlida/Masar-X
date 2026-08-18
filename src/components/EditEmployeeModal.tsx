import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Edit3, DollarSign, Mail, Phone, Trash2, CreditCard, Globe2 } from 'lucide-react';
import { Employee, RoleType, DeductionType, PayoutMethod } from '../types';

interface EditEmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose }) => {
  const { updateEmployee, deleteEmployee, lang, t } = useApp();
  const isAr = lang === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleType>('video_editor');
  const [baseSalary, setBaseSalary] = useState(250);
  const [deductionType, setDeductionType] = useState<DeductionType>('daily_divided');
  const [fixedDeductionRate, setFixedDeductionRate] = useState(10);
  const [notes, setNotes] = useState('');
  const [softwareTools, setSoftwareTools] = useState('');
  
  // Payout information
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('usdt_trc20');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('الجزائر');
  const [senderCountry, setSenderCountry] = useState('المملكة العربية السعودية');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPhone(employee.phone || '');
      setRole(employee.role);
      setBaseSalary(employee.baseSalary);
      setDeductionType(employee.deductionType);
      setFixedDeductionRate(employee.fixedDeductionRate || 10);
      setNotes(employee.notes || '');
      setSoftwareTools((employee.softwareTools || []).join(', '));
      setPayoutMethod(employee.payoutMethod || 'usdt_trc20');
      setPayoutDetails(employee.payoutDetails || '');
      setRecipientCountry(employee.recipientCountry || 'الجزائر');
      setSenderCountry(employee.senderCountry || 'المملكة العربية السعودية');
    }
  }, [employee]);

  if (!employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const toolsArray = softwareTools
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateEmployee(employee.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      baseSalary: Number(baseSalary),
      deductionType,
      fixedDeductionRate: deductionType === 'fixed_amount' ? Number(fixedDeductionRate) : undefined,
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
        {/* Header */}
        <div className="p-5 bg-[#1F2127] border-b border-[#2D3039] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] border border-[#E06D28]/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">
                {isAr ? `تعديل بيانات: ${employee.name}` : `Edit Member: ${employee.name}`}
              </h2>
              <p className="text-xs text-[#FB923C] font-mono mt-0.5">{employee.accessCode}</p>
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
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.specialty}
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
                {isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
                {t.baseSalary} ($)
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

          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
              {isAr ? 'البرامج والأدوات' : 'Software Tools'}
            </label>
            <input
              type="text"
              value={softwareTools}
              onChange={(e) => setSoftwareTools(e.target.value)}
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

          <div>
            <label className="block text-xs font-bold text-[#F3F4F6] mb-1">
              {isAr ? 'الملاحظات' : 'Notes'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-xl p-2.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#E06D28] resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#2D3039] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm(isAr ? `هل أنت متأكد من حذف ${employee.name}؟` : `Delete ${employee.name}?`)) {
                  deleteEmployee(employee.id);
                  onClose();
                }
              }}
              className="p-2 text-[#FB7185] hover:bg-[#F43F5E]/20 rounded-xl transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-[1.75]" />
              <span>{t.delete}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#FFFFFF] bg-[#17181D] hover:bg-[#262831] border border-[#2D3039] cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] shadow-sm shadow-[#E06D28]/25 cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

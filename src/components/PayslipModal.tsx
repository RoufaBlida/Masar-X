import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Calendar, 
  DollarSign, 
  Building2, 
  UserCheck, 
  CreditCard, 
  Globe2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText
} from 'lucide-react';
import { Employee, AttendanceRecord, AppSettings } from '../types';
import { generateMonthlyPayslipData, MonthlyPayslipData, ARABIC_MONTH_NAMES, ENGLISH_MONTH_NAMES } from '../utils/payslipUtils';
import { formatDate } from '../utils/calculations';
import { BrandLogo } from './BrandLogo';

interface PayslipModalProps {
  employee: Employee | null;
  records: AttendanceRecord[];
  settings: AppSettings;
  currentDate: string;
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  employee,
  records,
  settings,
  currentDate,
  isOpen,
  onClose,
  lang = 'ar'
}) => {
  const isAr = lang === 'ar';
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Month navigation: Default to current date's month
  const currDateObj = new Date(currentDate);
  const [selectedYear, setSelectedYear] = useState<number>(currDateObj.getFullYear() || 2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currDateObj.getMonth() || 7);

  if (!isOpen || !employee) return null;

  const payslip: MonthlyPayslipData = generateMonthlyPayslipData(
    employee,
    records,
    selectedYear,
    selectedMonthIndex,
    settings,
    currentDate
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonthIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible animate-fadeIn">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl bg-[#17181D] border border-[#2D3039] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white print:w-full">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#1F2127] border-b border-[#2D3039] flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E06D28]/15 text-[#E06D28] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'قسيمة الراتب الشهرية الرسمية (Fiche de Paie)' : 'Monthly Payslip Document'}</span>
                <span className="text-[11px] font-normal text-[#9CA3AF] font-mono">({payslip.referenceNumber})</span>
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {employee.name} • {payslip.roleNameAr}
              </p>
            </div>
          </div>

          {/* Month Selector & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Month Switcher */}
            <div className="flex items-center bg-[#17181D] border border-[#2D3039] rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-[#2D3039] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                title={isAr ? 'الشهر السابق' : 'Previous Month'}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180 stroke-[2]" />
              </button>

              <span className="px-2.5 font-bold text-white whitespace-nowrap">
                {isAr ? ARABIC_MONTH_NAMES[selectedMonthIndex] : ENGLISH_MONTH_NAMES[selectedMonthIndex]} {selectedYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-[#2D3039] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                title={isAr ? 'الشهر التالي' : 'Next Month'}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180 stroke-[2]" />
              </button>
            </div>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E06D28] hover:bg-[#F07935] flex items-center gap-2 shadow-sm shadow-[#E06D28]/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2]" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#2D3039] transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Payslip Area */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-[#111216] print:p-0 print:bg-white print:overflow-visible">
          
          {/* A4 Sheet Surface */}
          <div
            ref={printContainerRef}
            className="payslip-sheet mx-auto max-w-3xl bg-white text-[#1E293B] rounded-xl shadow-lg border border-[#E2E8F0] p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:p-0 print:rounded-none print:w-full print:max-w-none font-sans"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header: Company Wordmark & Payslip Title */}
            <div className="flex flex-row items-start justify-between border-b-2 border-[#E06D28] pb-5 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1F2127] text-white flex items-center justify-center print:bg-[#1E293B]">
                    <BrandLogo size="sm" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] uppercase">
                      {settings.companyName || 'مسار للإنتاج الرقمي'}
                    </h1>
                    <span className="text-[10px] text-[#64748B] font-mono block tracking-wider uppercase">
                      MASAR DIGITAL CREATIVE HUB
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#475569]">
                  {settings.companyAddress || 'الرياض، المملكة العربية السعودية'} • {settings.adminEmail}
                </p>
              </div>

              <div className="text-left rtl:text-left ltr:text-right space-y-1">
                <div className="inline-block bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] font-bold text-xs px-3 py-1 rounded-md">
                  {isAr ? 'قسيمة راتب شهرية • Fiche de Paie' : 'Monthly Payslip • Pay Stub'}
                </div>
                <div className="text-[11px] text-[#64748B] font-mono">
                  <span>{isAr ? 'المرجع:' : 'Ref:'} </span>
                  <span className="font-bold text-[#0F172A]">{payslip.referenceNumber}</span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <span>{isAr ? 'تاريخ التحرير:' : 'Issued Date:'} </span>
                  <span className="font-semibold text-[#0F172A]">{formatDate(payslip.issueDate, lang)}</span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <span>{isAr ? 'فترة الاستحقاق:' : 'Pay Period:'} </span>
                  <span className="font-bold text-[#E06D28]">
                    {isAr ? ARABIC_MONTH_NAMES[selectedMonthIndex] : ENGLISH_MONTH_NAMES[selectedMonthIndex]} {selectedYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid: Employee Profile & Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Employee Information */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#E2E8F0] font-bold text-[#0F172A]">
                  <UserCheck className="w-4 h-4 text-[#E06D28]" />
                  <span>{isAr ? 'بيانات الموظف والمسمى الوظيفي' : 'Employee Details'}</span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#64748B]">{isAr ? 'الاسم الكامل:' : 'Full Name:'}</span>
                  <span className="col-span-2 font-bold text-[#0F172A]">{payslip.employeeName}</span>

                  <span className="text-[#64748B]">{isAr ? 'كود الموظف:' : 'Access Code:'}</span>
                  <span className="col-span-2 font-mono font-bold text-[#C2410C]">{payslip.accessCode}</span>

                  <span className="text-[#64748B]">{isAr ? 'التخصص والوظيفة:' : 'Role:'}</span>
                  <span className="col-span-2 font-semibold text-[#334155]">{payslip.roleNameAr}</span>

                  <span className="text-[#64748B]">{isAr ? 'القسم:' : 'Department:'}</span>
                  <span className="col-span-2 text-[#334155]">{payslip.department}</span>

                  <span className="text-[#64748B]">{isAr ? 'نوع العقد:' : 'Contract Type:'}</span>
                  <span className="col-span-2 font-semibold text-[#0F172A]">{payslip.contractTypeAr}</span>

                  <span className="text-[#64748B]">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <span className="col-span-2 font-mono text-[#334155]">{payslip.employeeEmail}</span>

                  {payslip.employeePhone && (
                    <>
                      <span className="text-[#64748B]">{isAr ? 'الهاتف:' : 'Phone:'}</span>
                      <span className="col-span-2 font-mono text-[#334155]">{payslip.employeePhone}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Box 2: Payment Method & Cross-Border Transfer */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#E2E8F0] font-bold text-[#0F172A]">
                  <CreditCard className="w-4 h-4 text-[#E06D28]" />
                  <span>{isAr ? 'بيانات التحويل واستلام المستحقات' : 'Payment & Transfer Details'}</span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#64748B]">{isAr ? 'البلد المرسل:' : 'Sender Country:'}</span>
                  <span className="col-span-2 font-bold text-[#0F172A] flex items-center gap-1">
                    <span>🇸🇦</span>
                    <span>{payslip.senderCountry}</span>
                  </span>

                  <span className="text-[#64748B]">{isAr ? 'البلد المستقبل:' : 'Receiver Country:'}</span>
                  <span className="col-span-2 font-bold text-[#0F172A] flex items-center gap-1">
                    <span>🌍</span>
                    <span>{payslip.recipientCountry}</span>
                  </span>

                  <span className="text-[#64748B]">{isAr ? 'وسيلة الدفع:' : 'Payout Method:'}</span>
                  <span className="col-span-2 font-bold text-[#C2410C]">{payslip.payoutMethodLabelAr}</span>

                  <span className="text-[#64748B]">{isAr ? 'الحساب / المحفظة:' : 'Wallet / IBAN:'}</span>
                  <span className="col-span-2 font-mono text-[11px] font-bold text-[#0F172A] break-all bg-white p-1 rounded border border-[#E2E8F0]">
                    {payslip.payoutDetails}
                  </span>

                  <span className="text-[#64748B]">{isAr ? 'حالة الصرف:' : 'Payment Status:'}</span>
                  <span className="col-span-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                      <span>{isAr ? 'مستحق ومعتمد للصرف' : 'Approved & Payable'}</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance & Performance Summary Strip */}
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between font-bold text-[#9A3412] mb-3 pb-1.5 border-b border-[#FDBA74]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#EA580C]" />
                  <span>{isAr ? 'ملخص الحضور والالتزام خلال الشهر' : 'Monthly Attendance & Performance Summary'}</span>
                </div>
                <span className="text-[11px] font-mono">
                  {payslip.periodStartDate} {isAr ? 'إلى' : 'to'} {payslip.periodEndDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-[#FED7AA]">
                  <span className="text-[10px] text-[#64748B] block">{isAr ? 'أيام الشهر الكلية' : 'Calendar Days'}</span>
                  <span className="text-sm font-extrabold text-[#0F172A] font-mono">{payslip.totalCalendarDays}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#FED7AA]">
                  <span className="text-[10px] text-[#64748B] block">{isAr ? 'أيام العمل المقررة' : 'Working Days'}</span>
                  <span className="text-sm font-extrabold text-[#0F172A] font-mono">{payslip.totalWorkingDays}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#BBF7D0]">
                  <span className="text-[10px] text-[#15803D] block font-semibold">{isAr ? 'أيام الحضور' : 'Present Days'}</span>
                  <span className="text-sm font-extrabold text-[#15803D] font-mono">{payslip.presentDays}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#FECDD3]">
                  <span className="text-[10px] text-[#BE123C] block font-semibold">{isAr ? 'أيام الغياب' : 'Absent Days'}</span>
                  <span className="text-sm font-extrabold text-[#BE123C] font-mono">{payslip.absentDays}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#FED7AA]">
                  <span className="text-[10px] text-[#64748B] block">{isAr ? 'نسبة الالتزام' : 'Attendance Rate'}</span>
                  <span className="text-sm font-extrabold text-[#EA580C] font-mono">{payslip.attendanceRate}%</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-[#FED7AA]">
                  <span className="text-[10px] text-[#64748B] block">{isAr ? 'تقييم الجودة' : 'Avg Rating'}</span>
                  <span className="text-sm font-extrabold text-[#EA580C] font-mono">⭐ {payslip.averageRating} / 5</span>
                </div>
              </div>
            </div>

            {/* Financial Computation Table (Earnings & Deductions) */}
            <div className="border border-[#CBD5E1] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-[#0F172A] text-white font-bold text-[11px]">
                    <th className="p-2.5">{isAr ? 'البند / البيان المالي' : 'Financial Item'}</th>
                    <th className="p-2.5 text-center">{isAr ? 'المعدل / الحساب' : 'Calculation Basis'}</th>
                    <th className="p-2.5 text-right rtl:text-left">{isAr ? 'المستحقات (+)' : 'Earnings (+)'}</th>
                    <th className="p-2.5 text-right rtl:text-left">{isAr ? 'الخصومات (-)' : 'Deductions (-)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {/* Row 1: Base Salary */}
                  <tr>
                    <td className="p-2.5 font-semibold text-[#0F172A]">
                      {isAr ? 'الراتب الأساسي الشهري المتفق عليه' : 'Agreed Monthly Base Salary'}
                    </td>
                    <td className="p-2.5 text-center text-[#64748B] font-mono">
                      {isAr ? `عقد ${payslip.contractTypeAr}` : payslip.contractTypeEn}
                    </td>
                    <td className="p-2.5 text-right rtl:text-left font-bold text-[#0F172A] font-mono">
                      ${payslip.baseSalary.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right rtl:text-left font-mono text-[#94A3B8]">—</td>
                  </tr>

                  {/* Row 2: Daily Rate Note */}
                  <tr className="bg-[#F8FAFC]">
                    <td className="p-2.5 text-[#475569]">
                      {isAr ? 'معدل أجر يوم العمل الواحد' : 'Daily Working Rate'}
                    </td>
                    <td className="p-2.5 text-center text-[#64748B] font-mono">
                      ${payslip.baseSalary} ÷ {payslip.totalWorkingDays} {isAr ? 'يوم' : 'days'}
                    </td>
                    <td className="p-2.5 text-right rtl:text-left font-mono text-[#64748B]">
                      ${payslip.dailyRate.toFixed(2)} / {isAr ? 'يوم' : 'day'}
                    </td>
                    <td className="p-2.5 text-right rtl:text-left font-mono text-[#94A3B8]">—</td>
                  </tr>

                  {/* Row 3: Total Deductions Summary */}
                  <tr>
                    <td className="p-2.5 font-semibold text-[#BE123C]">
                      {isAr ? 'إجمالي الخصومات المستقطعة (غياب / تأخير)' : 'Total Deductions (Absence / Penalties)'}
                    </td>
                    <td className="p-2.5 text-center text-[#BE123C] font-mono font-semibold">
                      {payslip.absentDays} {isAr ? 'أيام غياب مسجلة' : 'absent days'}
                    </td>
                    <td className="p-2.5 text-right rtl:text-left font-mono text-[#94A3B8]">—</td>
                    <td className="p-2.5 text-right rtl:text-left font-bold text-[#BE123C] font-mono">
                      -${payslip.totalDeductions.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Itemized Deductions Breakdown (Detailed reasons for each deduction) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>{isAr ? 'كشف تفاصيل أسباب الخصومات المسجلة خلال الشهر:' : 'Detailed Itemized Deductions & Reasons:'}</span>
              </h3>

              {payslip.deductionItems.length === 0 ? (
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  <span>{isAr ? 'سجل ناصع: لا توجد أي خصومات مسجلة على الموظف لهذا الشهر (التزام كامل 100%).' : 'Clean record: No deductions recorded for this employee this month.'}</span>
                </div>
              ) : (
                <div className="border border-[#CBD5E1] rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left rtl:text-right">
                    <thead>
                      <tr className="bg-[#F1F5F9] text-[#475569] font-bold text-[10px]">
                        <th className="p-2">{isAr ? 'تاريخ الواقعة' : 'Date'}</th>
                        <th className="p-2">{isAr ? 'نوع البند' : 'Type'}</th>
                        <th className="p-2">{isAr ? 'سبب الخصم التفصيلي والتوضيح' : 'Specific Reason / Manager Notes'}</th>
                        <th className="p-2 text-right rtl:text-left">{isAr ? 'المبلغ المخصوم' : 'Deduction Amount'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white text-[11px]">
                      {payslip.deductionItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="p-2">
                            <span className="bg-[#FFE4E6] text-[#BE123C] font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {isAr ? 'غياب غير مبرر' : 'Absence'}
                            </span>
                          </td>
                          <td className="p-2 text-[#334155]">
                            {item.reason}
                          </td>
                          <td className="p-2 text-right rtl:text-left font-mono font-bold text-[#BE123C] whitespace-nowrap">
                            -${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Net Salary Payable Callout Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md print:bg-white print:text-[#0F172A] print:border-2 print:border-[#0F172A]">
              <div>
                <span className="text-[11px] font-mono text-[#FDBA74] uppercase tracking-wider block font-bold">
                  {isAr ? 'صافي الراتب النهائي المستحق للصرف' : 'NET PAYABLE COMPENSATION'}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {isAr ? 'بعد احتساب أيام الحضور الفعلي وخصم الغيابات' : 'Calculated after attendance and deductions'}
                </span>
              </div>

              <div className="text-center sm:text-right rtl:sm:text-left">
                <div className="text-3xl font-extrabold font-mono text-[#FB923C] tracking-tight">
                  ${payslip.netPayable.toFixed(2)} <span className="text-sm font-normal text-white">USD</span>
                </div>
                <div className="text-[10px] text-[#CBD5E1] font-medium mt-0.5">
                  {isAr ? 'القيمة بالدولار الأمريكي' : 'United States Dollar (USD)'}
                </div>
              </div>
            </div>

            {/* Official Signatures & Verification Seal */}
            <div className="pt-6 border-t-2 border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#475569] items-end">
              {/* Manager Sign */}
              <div className="space-y-3">
                <span className="font-bold text-[#0F172A] block">{isAr ? 'توقيع الإدارة المالية:' : 'Finance & HR Approval:'}</span>
                <div className="h-10 border-b border-dashed border-[#94A3B8] flex items-center justify-center">
                  <span className="font-serif italic font-bold text-[#0F172A] text-sm">Masar Management</span>
                </div>
                <span className="text-[10px] text-[#64748B] block">{settings.companyName || 'مسار للإنتاج الرقمي'}</span>
              </div>

              {/* Digital Seal */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-[#E06D28] flex flex-col items-center justify-center text-[#E06D28] p-1 bg-[#FFF7ED]">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                  <span className="text-[7px] font-bold uppercase tracking-wider font-mono">MASAR VERIFIED</span>
                </div>
                <span className="text-[9px] text-[#94A3B8] font-mono block">REF: {payslip.referenceNumber}</span>
              </div>

              {/* Employee Acknowledgment */}
              <div className="space-y-3 text-left rtl:text-right">
                <span className="font-bold text-[#0F172A] block">{isAr ? 'توقيع واستلام الموظف:' : 'Employee Signature:'}</span>
                <div className="h-10 border-b border-dashed border-[#94A3B8] flex items-center justify-center">
                  <span className="text-[10px] text-[#94A3B8] italic">{payslip.employeeName}</span>
                </div>
                <span className="text-[10px] text-[#64748B] block">{isAr ? 'إقرار بالاستلام والموافقة' : 'Receipt & Acknowledgment'}</span>
              </div>
            </div>

            {/* Small Footer Notice */}
            <div className="text-center text-[9px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
              {isAr
                ? 'تم إنشاء هذه الوثيقة المالية رسمياً عبر منصة مسار لإدارة الإنتاج والرواتب الرقمية. جميع البيانات خاضعة للتدقيق المالي الداخلي.'
                : 'This document was electronically generated via MASAR Digital Production & Payroll System. All figures are verified.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

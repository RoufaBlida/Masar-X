import { Employee, AttendanceRecord, AppSettings, PayoutMethod } from '../types';
import { getWorkingDaysInMonth, getDaysInMonth, isWeekend, calculateDailyRate } from './calculations';

export interface PayslipDeductionItem {
  id: string;
  date: string;
  amount: number;
  reason: string;
  type: 'unexcused_absence' | 'delay' | 'admin_penalty' | 'other';
}

export interface MonthlyPayslipData {
  payslipId: string;
  referenceNumber: string;
  issueDate: string;
  
  // Period
  year: number;
  monthIndex: number; // 0 - 11
  monthNameAr: string;
  monthNameEn: string;
  periodStartDate: string;
  periodEndDate: string;
  
  // Employee Details
  employee: Employee;
  employeeName: string;
  employeeEmail: string;
  employeePhone?: string;
  accessCode: string;
  roleNameAr: string;
  roleNameEn: string;
  contractTypeAr: string;
  contractTypeEn: string;
  department: string;
  
  // Work & Attendance Stats
  totalCalendarDays: number;
  totalWorkingDays: number;
  totalWeekendDays: number;
  presentDays: number;
  absentDays: number;
  excusedDays: number;
  attendanceRate: number;
  averageRating: number;
  
  // Financial Figures
  baseSalary: number;
  dailyRate: number;
  earnedGross: number;
  totalDeductions: number;
  bonusAmount: number;
  netPayable: number;
  currency: string;
  
  // Deductions Breakdown
  deductionItems: PayslipDeductionItem[];
  
  // Transfer / Payout Info
  payoutMethod: PayoutMethod;
  payoutMethodLabelAr: string;
  payoutMethodLabelEn: string;
  payoutDetails: string;
  senderCountry: string;
  recipientCountry: string;
  
  // Company Info
  companyName: string;
  companyAddress: string;
  adminEmail: string;
}

export const ARABIC_MONTH_NAMES = [
  'يناير (جانفي)',
  'فبراير (فيفري)',
  'مارس',
  'أبريل (أفريل)',
  'مايو (ماي)',
  'يونيو (جوان)',
  'يوليو (جويلية)',
  'أغسطس (أوت)',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

export const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export function getPayoutMethodLabel(method?: PayoutMethod, lang: 'ar' | 'en' = 'ar'): string {
  const isAr = lang === 'ar';
  switch (method) {
    case 'usdt_trc20':
      return isAr ? 'عملة رقمية USDT (شبكة TRC20)' : 'USDT Crypto (TRC20 Network)';
    case 'binance_pay':
      return isAr ? 'بينانس باي (Binance Pay ID / Email)' : 'Binance Pay (ID / Email)';
    case 'wise':
      return isAr ? 'حساب وايز (Wise Transfer)' : 'Wise Account (Wise Transfer)';
    case 'paypal':
      return isAr ? 'بايبال (PayPal Account)' : 'PayPal Account';
    case 'bank_transfer':
      return isAr ? 'تحويل بنكي مباشر (IBAN / Wire)' : 'Direct Bank Transfer (IBAN / Wire)';
    case 'payoneer':
      return isAr ? 'بايونير (Payoneer Account)' : 'Payoneer Account';
    case 'western_union':
      return isAr ? 'ويسترن يونيون (Western Union)' : 'Western Union';
    case 'other':
    default:
      return isAr ? 'وسيلة استلام مخصصة' : 'Custom Payout Method';
  }
}

export function getRoleLabel(role: string, lang: 'ar' | 'en' = 'ar'): string {
  const isAr = lang === 'ar';
  switch (role) {
    case 'video_editor':
      return isAr ? 'مونتير فيديو محترف' : 'Senior Video Editor';
    case 'motion_designer':
      return isAr ? 'مصمم موشن جرافيك' : 'Motion Graphics Designer';
    case 'thumbnail_designer':
      return isAr ? 'مصمم صور مصغرة (CTR)' : 'Thumbnail Designer';
    case 'scriptwriter':
      return isAr ? 'كاتب سكريبت ومحتوى' : 'Creative Scriptwriter';
    case 'sound_designer':
      return isAr ? 'مهندس ومصمم صوتيات' : 'Sound Designer & Engineer';
    case 'social_media_manager':
      return isAr ? 'مدير وسائل التواصل' : 'Social Media Manager';
    case 'developer':
      return isAr ? 'مطور برمجيات وويب' : 'Software Developer';
    default:
      return isAr ? 'أخصائي رقمي' : 'Digital Specialist';
  }
}

export function getContractTypeLabel(type: string, lang: 'ar' | 'en' = 'ar'): string {
  const isAr = lang === 'ar';
  switch (type) {
    case '1_week_trial':
      return isAr ? 'فترة تجربة (أسبوع تقييمي)' : '1-Week Trial Contract';
    case '3_month_contract':
      return isAr ? 'عقد عمل رسمي (3 أشهر)' : 'Official 3-Month Contract';
    case 'permanent':
      return isAr ? 'عقد عمل دائم' : 'Permanent Contract';
    case 'terminated':
      return isAr ? 'منتهي العقد' : 'Terminated';
    default:
      return type;
  }
}

/**
 * Compiles a comprehensive Monthly Payslip (Fiche de Paie) for a given employee, year, and month
 */
export function generateMonthlyPayslipData(
  employee: Employee,
  records: AttendanceRecord[],
  year: number,
  monthIndex: number,
  settings: AppSettings,
  currentDateStr: string
): MonthlyPayslipData {
  const monthNameAr = ARABIC_MONTH_NAMES[monthIndex] || `شهر ${monthIndex + 1}`;
  const monthNameEn = ENGLISH_MONTH_NAMES[monthIndex] || `Month ${monthIndex + 1}`;
  
  const totalCalendarDays = getDaysInMonth(year, monthIndex);
  const periodStartDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
  const periodEndDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(totalCalendarDays).padStart(2, '0')}`;
  
  const totalWorkingDays = getWorkingDaysInMonth(year, monthIndex, employee.customWeekendDays, settings.defaultWeekendDays);
  const totalWeekendDays = totalCalendarDays - totalWorkingDays;
  
  // Filter attendance records in this month for this employee
  const monthRecords = records.filter(r => {
    if (r.employeeId !== employee.id) return false;
    const rDate = new Date(r.date);
    return rDate.getFullYear() === year && rDate.getMonth() === monthIndex;
  });

  const dailyRate = calculateDailyRate(employee, `${year}-${String(monthIndex + 1).padStart(2, '0')}-15`, settings);

  let presentDays = 0;
  let absentDays = 0;
  let excusedDays = 0;
  let totalDeductions = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  const deductionItems: PayslipDeductionItem[] = [];

  monthRecords.forEach(r => {
    if (r.status === 'present') {
      presentDays++;
    } else if (r.status === 'absent') {
      absentDays++;
      const deduction = r.deductionAmount > 0 ? r.deductionAmount : dailyRate;
      totalDeductions += deduction;

      deductionItems.push({
        id: r.id,
        date: r.date,
        amount: Math.round(deduction * 100) / 100,
        reason: r.deductionReason || r.adminFeedback || 'غياب غير مسجل / غير مبرر عن يوم العمل',
        type: 'unexcused_absence'
      });
    } else if (r.status === 'excused') {
      excusedDays++;
    }

    if (r.adminRating && r.adminRating > 0) {
      ratingSum += r.adminRating;
      ratingCount++;
    }
  });

  // Calculate gross and net
  // For monthly contract, baseSalary is full month baseline
  const baseSalary = employee.baseSalary;
  const earnedGross = baseSalary;
  const bonusAmount = 0;
  const netPayable = Math.max(0, Math.round((earnedGross - totalDeductions + bonusAmount) * 100) / 100);
  
  const recordedDays = presentDays + absentDays;
  const attendanceRate = recordedDays > 0 ? Math.round((presentDays / recordedDays) * 100) : 100;
  const averageRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 5.0;

  const monthCode = `${year}${String(monthIndex + 1).padStart(2, '0')}`;
  const referenceNumber = `MASAR-PAY-${monthCode}-${employee.accessCode || employee.id.toUpperCase()}`;
  const payslipId = `slip-${employee.id}-${monthCode}`;

  return {
    payslipId,
    referenceNumber,
    issueDate: currentDateStr,
    year,
    monthIndex,
    monthNameAr,
    monthNameEn,
    periodStartDate,
    periodEndDate,
    employee,
    employeeName: employee.name,
    employeeEmail: employee.email,
    employeePhone: employee.phone,
    accessCode: employee.accessCode,
    roleNameAr: employee.customRoleName || getRoleLabel(employee.role, 'ar'),
    roleNameEn: getRoleLabel(employee.role, 'en'),
    contractTypeAr: getContractTypeLabel(employee.contractType, 'ar'),
    contractTypeEn: getContractTypeLabel(employee.contractType, 'en'),
    department: employee.department || 'فريق الإنتاج الإبداعي وصناعة المحتوى',
    totalCalendarDays,
    totalWorkingDays,
    totalWeekendDays,
    presentDays,
    absentDays,
    excusedDays,
    attendanceRate,
    averageRating,
    baseSalary,
    dailyRate,
    earnedGross,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    bonusAmount,
    netPayable,
    currency: settings.currency || '$',
    deductionItems,
    payoutMethod: employee.payoutMethod || 'usdt_trc20',
    payoutMethodLabelAr: getPayoutMethodLabel(employee.payoutMethod, 'ar'),
    payoutMethodLabelEn: getPayoutMethodLabel(employee.payoutMethod, 'en'),
    payoutDetails: employee.payoutDetails || 'لم يُحدد الحساب بعد',
    senderCountry: employee.senderCountry || settings.senderCountry || 'المملكة العربية السعودية',
    recipientCountry: employee.recipientCountry || 'الجزائر',
    companyName: settings.companyName || 'مسار للإنتاج الرقمي',
    companyAddress: settings.companyAddress || 'الرياض، المملكة العربية السعودية',
    adminEmail: settings.adminEmail || 'Roufablida90@gmail.com'
  };
}

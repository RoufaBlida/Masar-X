import { Employee, AttendanceRecord, AppSettings, DeductionType } from '../types';

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Checks if a given date is a configured weekend day
 */
export function isWeekend(dateStr: string, employeeWeekendDays?: number[], defaultWeekendDays: number[] = [5, 6]): boolean {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const weekendDays = employeeWeekendDays && employeeWeekendDays.length > 0 ? employeeWeekendDays : defaultWeekendDays;
  return weekendDays.includes(dayOfWeek);
}

/**
 * Calculates total working days in the month for a specific employee
 */
export function getWorkingDaysInMonth(year: number, monthIndex: number, employeeWeekendDays?: number[], defaultWeekendDays: number[] = [5, 6]): number {
  const totalDays = getDaysInMonth(year, monthIndex);
  let workingDays = 0;
  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (!isWeekend(dStr, employeeWeekendDays, defaultWeekendDays)) {
      workingDays++;
    }
  }
  return workingDays || 22; // default fallback
}

/**
 * Calculates daily rate for deduction
 */
export function calculateDailyRate(employee: Employee, currentDateStr: string, settings: AppSettings): number {
  const date = new Date(currentDateStr);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (employee.deductionType === 'fixed_amount' && employee.fixedDeductionRate) {
    return employee.fixedDeductionRate;
  }

  // Divided by working days in current month
  const workingDays = getWorkingDaysInMonth(year, month, employee.customWeekendDays, settings.defaultWeekendDays);
  const rate = employee.baseSalary / workingDays;
  return Math.round(rate * 100) / 100;
}

/**
 * Calculates accrued salary for an employee up to the given date or current month
 */
export function calculateAccruedSalary(
  employee: Employee,
  records: AttendanceRecord[],
  currentDateStr: string,
  settings: AppSettings
): {
  accruedAmount: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalDeductions: number;
  dailyRate: number;
  baseSalary: number;
  ratingAverage: number;
} {
  const date = new Date(currentDateStr);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const currentDay = date.getDate();

  // Filter records for this employee in the current month
  const empRecords = records.filter(r => {
    if (r.employeeId !== employee.id) return false;
    const rDate = new Date(r.date);
    return rDate.getFullYear() === currentYear && rDate.getMonth() === currentMonth;
  });

  const dailyRate = calculateDailyRate(employee, currentDateStr, settings);

  let presentCount = 0;
  let absentCount = 0;
  let totalDeductions = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  empRecords.forEach(r => {
    if (r.status === 'present') {
      presentCount++;
    } else if (r.status === 'absent') {
      absentCount++;
      const deduction = r.deductionAmount > 0 ? r.deductionAmount : dailyRate;
      totalDeductions += deduction;
    }
    if (r.adminRating && r.adminRating > 0) {
      ratingSum += r.adminRating;
      ratingCount++;
    }
  });

  // Calculate accrued earned amount
  // For monthly contract: Base salary prorated by days elapsed minus deductions
  const workingDaysInMonth = getWorkingDaysInMonth(currentYear, currentMonth, employee.customWeekendDays, settings.defaultWeekendDays);
  
  // Count working days passed so far this month
  let workingDaysPassed = 0;
  for (let d = 1; d <= currentDay; d++) {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (!isWeekend(dStr, employee.customWeekendDays, settings.defaultWeekendDays)) {
      workingDaysPassed++;
    }
  }

  // Earned up to today = (workingDaysPassed * dailyRate) - (absentCount * dailyRate)
  // Which is equivalent to present working days * dailyRate
  let accrued = Math.max(0, (workingDaysPassed * dailyRate) - totalDeductions);
  accrued = Math.min(employee.baseSalary, Math.round(accrued * 100) / 100);

  const ratingAvg = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 5.0;

  return {
    accruedAmount: accrued,
    totalPresentDays: presentCount,
    totalAbsentDays: absentCount,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    dailyRate,
    baseSalary: employee.baseSalary,
    ratingAverage: ratingAvg
  };
}

/**
 * Calculates trial period progress (7 days)
 */
export function getTrialProgress(employee: Employee, currentDateStr: string): {
  daysPassed: number;
  daysRemaining: number;
  totalDays: number;
  isExpired: number; // 0 = in trial, 1 = expired / needs decision, -1 = already graduated/permanent
  percentage: number;
} {
  if (employee.contractType !== '1_week_trial') {
    return {
      daysPassed: 7,
      daysRemaining: 0,
      totalDays: 7,
      isExpired: -1,
      percentage: 100
    };
  }

  const start = new Date(employee.startDate).getTime();
  const current = new Date(currentDateStr).getTime();
  const diffTime = current - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const totalDays = 7;
  const daysPassed = Math.max(1, Math.min(totalDays, diffDays));
  const daysRemaining = Math.max(0, totalDays - diffDays);
  const percentage = Math.min(100, Math.max(0, Math.round((diffDays / totalDays) * 100)));

  return {
    daysPassed: diffDays,
    daysRemaining,
    totalDays,
    isExpired: diffDays >= totalDays ? 1 : 0,
    percentage
  };
}

/**
 * Formats a date nicely for Arabic or English
 */
export function formatDate(dateStr: string, lang: string = 'ar'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Short date e.g. "17 Aug" with standard Latin numbers 123456789
 */
export function formatShortDate(dateStr: string, lang: string = 'ar'): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

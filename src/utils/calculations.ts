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
 * Calculates daily rate based on 30-day standard month with paid weekends
 * Formula: Base Salary ÷ 30 days
 */
export function calculateDailyRate(employee: Employee, currentDateStr: string, settings: AppSettings): number {
  if (employee.deductionType === 'fixed_amount' && employee.fixedDeductionRate) {
    return employee.fixedDeductionRate;
  }

  // Monthly base salary divided by standard 30-day month (weekends are paid)
  const rate = (employee.baseSalary || 250) / 30;
  return Math.round(rate * 100) / 100;
}

/**
 * Calculates progressive accrued salary for an employee up to the given date:
 * - Daily Rate = Base Salary ÷ 30 days (weekends are fully paid)
 * - Each attended workday or paid weekend/excused day earns 1 daily rate ($10/day)
 * - Absent days are deducted
 * - Accrued compensation increases day by day (e.g. Day 1 = $10, Day 7 = $70)
 * - If terminated, shows exact settlement amount earned to date immediately
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
  totalWeekendDays: number;
  totalExcusedDays: number;
  totalDeductions: number;
  dailyRate: number;
  baseSalary: number;
  ratingAverage: number;
  daysPassedInPeriod: number;
} {
  const currDate = new Date(currentDateStr);
  const currentYear = currDate.getFullYear();
  const currentMonth = currDate.getMonth();
  const currentDay = currDate.getDate();

  // Determine starting date for calculation:
  // If employee started in this current month, start from their startDate day; otherwise day 1 of month
  let startDay = 1;
  if (employee.startDate) {
    const empStart = new Date(employee.startDate);
    if (empStart.getFullYear() === currentYear && empStart.getMonth() === currentMonth) {
      startDay = Math.max(1, Math.min(currentDay, empStart.getDate()));
    }
  }

  const dailyRate = calculateDailyRate(employee, currentDateStr, settings);

  // Filter records for this employee in the current month
  const empRecords = records.filter(r => {
    if (r.employeeId !== employee.id) return false;
    const rDate = new Date(r.date);
    return rDate.getFullYear() === currentYear && rDate.getMonth() === currentMonth;
  });

  let presentCount = 0;
  let absentCount = 0;
  let weekendCount = 0;
  let excusedCount = 0;
  let totalDeductions = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  // Track map of records by date
  const recordMap = new Map<string, AttendanceRecord>();
  empRecords.forEach(r => {
    recordMap.set(r.date, r);
    if (r.adminRating && r.adminRating > 0) {
      ratingSum += r.adminRating;
      ratingCount++;
    }
  });

  // Calculate day-by-day earned amounts from startDay to currentDay
  let earnedDays = 0;
  let daysPassed = 0;

  for (let d = startDay; d <= currentDay; d++) {
    daysPassed++;
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const rec = recordMap.get(dStr);
    const isWk = isWeekend(dStr, employee.customWeekendDays, settings.defaultWeekendDays);

    if (rec) {
      if (rec.status === 'present') {
        presentCount++;
        earnedDays += 1;
      } else if (rec.status === 'absent') {
        absentCount++;
        const deduction = rec.deductionAmount > 0 ? rec.deductionAmount : dailyRate;
        totalDeductions += deduction;
        // Absent day is 0 earnings
      } else if (rec.status === 'weekend') {
        weekendCount++;
        earnedDays += 1; // Weekends are paid
      } else if (rec.status === 'excused') {
        excusedCount++;
        earnedDays += 1; // Excused leave is paid
      }
    } else {
      // No explicit record logged yet
      if (isWk) {
        weekendCount++;
        earnedDays += 1; // Paid weekend
      } else {
        // Default unreviewed workday before today or today:
        // Counts as earned day unless explicitly marked absent
        presentCount++;
        earnedDays += 1;
      }
    }
  }

  // Accrued amount = Earned days × Daily Rate
  let accrued = Math.max(0, Math.round((earnedDays * dailyRate) * 100) / 100);
  
  // Cap accrued at baseSalary for the month
  accrued = Math.min(employee.baseSalary, accrued);

  const ratingAvg = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 5.0;

  return {
    accruedAmount: accrued,
    totalPresentDays: presentCount,
    totalAbsentDays: absentCount,
    totalWeekendDays: weekendCount,
    totalExcusedDays: excusedCount,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    dailyRate,
    baseSalary: employee.baseSalary,
    ratingAverage: ratingAvg,
    daysPassedInPeriod: daysPassed
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

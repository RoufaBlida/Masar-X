import { Employee, AttendanceRecord, AppSettings } from '../types';
import { calculateAccruedSalary, getTrialProgress } from './calculations';

/**
 * Exports team data and attendance records to Excel CSV with UTF-8 BOM
 */
export function exportToCSV(
  employees: Employee[],
  records: AttendanceRecord[],
  currentDateStr: string,
  settings: AppSettings,
  lang: 'ar' | 'en' = 'ar'
) {
  const isAr = lang === 'ar';
  
  const headers = isAr
    ? [
        'كود الموظف',
        'اسم الموظف',
        'البريد الإلكتروني',
        'التخصص',
        'نوع العقد',
        'الراتب الأساسي ($)',
        'أيام الحضور هذا الشهر',
        'أيام الغياب هذا الشهر',
        'إجمالي الخصومات ($)',
        'الراتب المستحق حتى اليوم ($)',
        'متوسط التقييم (من 5)',
        'تاريخ البدء',
        'الحالة'
      ]
    : [
        'Access Code',
        'Employee Name',
        'Email',
        'Role',
        'Contract Type',
        'Base Salary ($)',
        'Present Days',
        'Absent Days',
        'Total Deductions ($)',
        'Accrued Salary ($)',
        'Avg Rating (Out of 5)',
        'Start Date',
        'Status'
      ];

  const rows = employees.map(emp => {
    const stats = calculateAccruedSalary(emp, records, currentDateStr, settings);
    return [
      `"${emp.accessCode}"`,
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.email}"`,
      `"${emp.role}"`,
      `"${emp.contractType}"`,
      emp.baseSalary,
      stats.totalPresentDays,
      stats.totalAbsentDays,
      stats.totalDeductions,
      stats.accruedAmount,
      stats.ratingAverage,
      emp.startDate,
      emp.status
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `masar_team_payroll_${currentDateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print dialog which uses print CSS for PDF generation
 */
export function printPDFReport() {
  window.print();
}

import { Employee, AttendanceRecord, DecisionNotification, AppSettings } from '../types';

export const initialSettings: AppSettings = {
  adminEmail: 'roufablida360@gmail.com',
  defaultWeekendDays: [5, 6], // Friday (5) & Saturday (6)
  defaultSalary: 250,
  defaultDeductionType: 'daily_divided',
  fixedDeductionRate: 10,
  weeklySummaryDay: 4, // Thursday
  weeklySummaryTime: '20:00',
  currency: '$',
  companyName: 'مسار',
  senderCountry: 'المملكة العربية السعودية',
  companyAddress: 'الرياض، المملكة العربية السعودية'
};

// Clean default data - No mock records
export const initialEmployees: Employee[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [];
export const initialNotifications: DecisionNotification[] = [];

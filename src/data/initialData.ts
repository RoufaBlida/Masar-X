import { Employee, AttendanceRecord, DecisionNotification, AppSettings } from '../types';

export const initialSettings: AppSettings = {
  adminEmail: 'Roufablida90@gmail.com',
  authorizedAdmins: [],
  defaultWeekendDays: [5, 6], // Friday (5) & Saturday (6)
  defaultSalary: 250,
  defaultDeductionType: 'daily_divided',
  fixedDeductionRate: 10,
  weeklySummaryDay: 4, // Thursday
  weeklySummaryTime: '20:00',
  currency: '$',
  companyName: 'منظومة مسار',
  senderCountry: '',
  companyAddress: ''
};

// Clean default data - No mock records
export const initialEmployees: Employee[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [];
export const initialNotifications: DecisionNotification[] = [];

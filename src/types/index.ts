export type RoleType = 
  | 'video_editor'
  | 'motion_designer'
  | 'thumbnail_designer'
  | 'scriptwriter'
  | 'sound_designer'
  | 'social_media_manager'
  | 'developer'
  | 'other';

export type ContractType = 
  | '1_week_trial'
  | '3_month_contract'
  | 'permanent'
  | 'terminated';

export type AttendanceStatus = 'present' | 'absent' | 'weekend' | 'excused';

export type DeliverySpeed = 'delayed' | 'on_time' | 'fast' | 'exceptional';

export type DeductionType = 'daily_divided' | 'fixed_amount';

export type PayoutMethod = 
  | 'usdt_trc20'
  | 'binance_pay'
  | 'wise'
  | 'paypal'
  | 'bank_transfer'
  | 'payoneer'
  | 'western_union'
  | 'other';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  customRoleName?: string;
  avatarColor: string;
  avatarInitial?: string;
  startDate: string; // YYYY-MM-DD
  trialEndDate: string; // YYYY-MM-DD (calculated: startDate + 7 days for 1-week trial)
  contractType: ContractType;
  baseSalary: number; // in USD (default $250)
  deductionType: DeductionType;
  fixedDeductionRate?: number; // USD per day if fixed_amount
  customWeekendDays?: number[]; // [5, 6] for Fri/Sat
  accessCode: string; // e.g. EMP-2401 for employee login
  status: 'active' | 'graduated' | 'terminated';
  phone?: string;
  notes?: string;
  createdAt: string;
  upgradedAt?: string;
  terminatedAt?: string;
  portfolioUrl?: string;
  softwareTools?: string[];
  // Payment and Payslip details
  payoutMethod?: PayoutMethod;
  payoutDetails?: string; // Wallet address, IBAN, or account email
  recipientCountry?: string; // e.g. الجزائر, مصر, المغرب
  senderCountry?: string; // e.g. المملكة العربية السعودية
  department?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  adminRating?: number; // 1 - 5 stars
  adminDeliverySpeed?: DeliverySpeed;
  adminFeedback?: string;
  employeeTaskReport?: string;
  employeeSubmittedAt?: string;
  videoDeliverableUrl?: string;
  reportImages?: string[];
  deductionAmount: number;
  deductionReason?: string; // e.g. 'غياب غير مبرر', 'تأخير في تسليم المهمة', 'خصم إداري'
  updatedAt: string;
}

export interface DecisionNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'upgrade_3_months' | 'terminate_trial' | 'weekly_summary' | 'performance_warning' | 'custom_email';
  title: string;
  message: string;
  sentToEmail: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
  resendId?: string;
  meta?: {
    salary?: number;
    newContractType?: ContractType;
    attendanceRate?: number;
    adminNotes?: string;
  };
}

export interface AppSettings {
  adminEmail: string; // e.g. Roufablida90@gmail.com
  defaultWeekendDays: number[]; // [5, 6] = Friday (5) & Saturday (6)
  defaultSalary: number; // 250
  defaultDeductionType: DeductionType;
  fixedDeductionRate: number; // 10
  weeklySummaryDay: number; // 4 = Thursday
  weeklySummaryTime: string; // 20:00
  currency: string; // '$'
  companyName: string; // 'مسار'
  senderCountry: string; // 'المملكة العربية السعودية'
  companyAddress?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'daily_log'
  | 'team'
  | 'trial_decisions'
  | 'notifications_log'
  | 'settings';

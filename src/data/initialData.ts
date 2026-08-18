import { Employee, AttendanceRecord, DecisionNotification, AppSettings } from '../types';

export const initialSettings: AppSettings = {
  adminEmail: 'Roufablida90@gmail.com',
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

// Generate today date and past dates dynamically
const now = new Date();
const formatDateKey = (d: Date) => d.toISOString().split('T')[0];

const today = formatDateKey(now);
const dMinus1 = formatDateKey(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
const dMinus2 = formatDateKey(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
const dMinus3 = formatDateKey(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
const dMinus4 = formatDateKey(new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000));
const dMinus5 = formatDateKey(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000));
const dMinus6 = formatDateKey(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
const dMinus7 = formatDateKey(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'أحمد خليل السعدي',
    email: 'ahmed.khaleel.edit@gmail.com',
    role: 'video_editor',
    avatarColor: '#0EA5E9', // Luminous Sky Blue
    avatarInitial: 'أخ',
    startDate: dMinus7, // Exactly 7 days ago - trial period ready for decision!
    trialEndDate: today,
    contractType: '1_week_trial',
    baseSalary: 250,
    deductionType: 'daily_divided',
    accessCode: 'EMP-101',
    status: 'active',
    phone: '+213 555 12 34 56',
    notes: 'مبدع في قص الريلز وسرعة استيعاب التوجيهات، تقييماته ممتازة في الأسبوع الأول.',
    softwareTools: ['Premiere Pro', 'After Effects', 'CapCut Pro'],
    portfolioUrl: 'https://behance.net/ahmed_editor',
    createdAt: dMinus7,
    payoutMethod: 'usdt_trc20',
    payoutDetails: 'TYd87kLs92MnPqRtXvWa1992KlZa8831',
    recipientCountry: 'الجزائر',
    senderCountry: 'المملكة العربية السعودية',
    department: 'قسم المونتاج وصناعة الفيديو'
  },
  {
    id: 'emp-2',
    name: 'سارة عبد الرحمن',
    email: 'sara.motion.art@gmail.com',
    role: 'motion_designer',
    avatarColor: '#38BDF8', // Soft Cyan Blue
    avatarInitial: 'سع',
    startDate: dMinus4, // 4 days ago - 3 days remaining in trial
    trialEndDate: formatDateKey(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
    contractType: '1_week_trial',
    baseSalary: 280,
    deductionType: 'daily_divided',
    accessCode: 'EMP-102',
    status: 'active',
    phone: '+20 102 345 6789',
    notes: 'متخصصة موشن جرافيك ثنائي الأبعاد، شغفها عالي وملتزمة بمواعيد التسليم.',
    softwareTools: ['After Effects', 'Illustrator', 'Cinema 4D'],
    portfolioUrl: 'https://vimeo.com/sara_motion',
    createdAt: dMinus4,
    payoutMethod: 'wise',
    payoutDetails: 'sara.motion.payout@gmail.com',
    recipientCountry: 'مصر',
    senderCountry: 'المملكة العربية السعودية',
    department: 'قسم الموشن جرافيك والهويات'
  },
  {
    id: 'emp-3',
    name: 'عمر ياسين طاهر',
    email: 'omar.yaseen.video@gmail.com',
    role: 'video_editor',
    avatarColor: '#2563EB', // Sapphire Blue
    avatarInitial: 'عي',
    startDate: '2026-07-01',
    trialEndDate: '2026-07-08',
    contractType: '3_month_contract',
    baseSalary: 300,
    deductionType: 'daily_divided',
    accessCode: 'EMP-103',
    status: 'active',
    phone: '+20 100 456 7890',
    notes: 'تمت ترقيته لعقد 3 أشهر بعد اجتياز الأسبوع التجريبي بنجاح مبهر.',
    softwareTools: ['Premiere Pro', 'DaVinci Resolve', 'Audition'],
    portfolioUrl: 'https://drive.google.com/drive/folders/omar_edits',
    createdAt: '2026-07-01',
    upgradedAt: '2026-07-08',
    payoutMethod: 'binance_pay',
    payoutDetails: 'UID: 384910294 (Binance Pay)',
    recipientCountry: 'مصر',
    senderCountry: 'المملكة العربية السعودية',
    department: 'قسم المونتاج وصناعة الفيديو'
  },
  {
    id: 'emp-4',
    name: 'ريم منصور الدوسري',
    email: 'reem.thumbnails@gmail.com',
    role: 'thumbnail_designer',
    avatarColor: '#06B6D4', // Aqua Cyan
    avatarInitial: 'رد',
    startDate: '2026-07-15',
    trialEndDate: '2026-07-22',
    contractType: '3_month_contract',
    baseSalary: 250,
    deductionType: 'fixed_amount',
    fixedDeductionRate: 10,
    accessCode: 'EMP-104',
    status: 'active',
    phone: '+966 55 333 8899',
    notes: 'تصميم صور مصغرة ذات CTR مرتفع لليوتيوب وفيسبوك.',
    softwareTools: ['Photoshop', 'Midjourney', 'Figma'],
    createdAt: '2026-07-15',
    upgradedAt: '2026-07-22',
    payoutMethod: 'bank_transfer',
    payoutDetails: 'IBAN: SA0380000001234567890123 (Al Rajhi Bank)',
    recipientCountry: 'المملكة العربية السعودية',
    senderCountry: 'المملكة العربية السعودية',
    department: 'قسم التصميم الجرافيكي والثمنيلز'
  },
  {
    id: 'emp-5',
    name: 'محمد إبراهيم الزهراني',
    email: 'mohamed.script.creative@gmail.com',
    role: 'scriptwriter',
    avatarColor: '#6366F1', // Soft Indigo
    avatarInitial: 'مز',
    startDate: dMinus2, // 2 days in trial
    trialEndDate: formatDateKey(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)),
    contractType: '1_week_trial',
    baseSalary: 250,
    deductionType: 'daily_divided',
    accessCode: 'EMP-105',
    status: 'active',
    phone: '+212 661 23 45 67',
    notes: 'كتابة سكريبتات إعلانية وفيديوهات توثيقية قصيرة ومقنعة.',
    softwareTools: ['Notion', 'Google Docs', 'ChatGPT Pro'],
    createdAt: dMinus2,
    payoutMethod: 'paypal',
    payoutDetails: 'mohamed.script.creative@gmail.com',
    recipientCountry: 'المغرب',
    senderCountry: 'المملكة العربية السعودية',
    department: 'قسم كتابة المحتوى والسكريبت'
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  // Ahmed (emp-1) past records
  {
    id: 'att-1-today',
    employeeId: 'emp-1',
    date: today,
    status: 'present',
    adminRating: 5,
    adminDeliverySpeed: 'exceptional',
    adminFeedback: 'مونتاج الحلقة الختامية رائع جداً، تناغم الموسيقى ممتاز مع الـ Cut.',
    employeeTaskReport: 'أنهيت مونتاج فيديو اليوتيوب بالكامل (12 دقيقة)، قمت بتعديل الألوان والصوتيات ورفع النسخة النهائية على درايف.',
    employeeSubmittedAt: '14:30',
    videoDeliverableUrl: 'https://drive.google.com/file/d/sample-video-cut1',
    reportImages: [
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect width="800" height="450" fill="%231E2028"/%3E%3Crect x="20" y="20" width="760" height="300" rx="12" fill="%2317181D" stroke="%232D3039"/%3E%3Ctext x="400" y="170" fill="%23FB923C" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle"%3EPremiere Pro Timeline - Final Cut 12min%3C/text%3E%3Ctext x="400" y="210" fill="%239CA3AF" font-family="sans-serif" font-size="14" text-anchor="middle"%3EAll 8 video tracks synchronized + Color Graded%3C/text%3E%3Crect x="40" y="340" width="720" height="70" rx="8" fill="%23262831"/%3E%3Crect x="60" y="360" width="180" height="30" rx="6" fill="%23E06D28"/%3E%3Crect x="260" y="360" width="140" height="30" rx="6" fill="%230EA5E9"/%3E%3Crect x="420" y="360" width="200" height="30" rx="6" fill="%2310B981"/%3E%3C/svg%3E',
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect width="800" height="450" fill="%23181920"/%3E%3Crect x="20" y="20" width="760" height="410" rx="12" fill="%231F2127" stroke="%23E06D28" stroke-width="2"/%3E%3Ctext x="400" y="210" fill="%23FFFFFF" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle"%3ELumetri Color Scope & Sound Equalizer%3C/text%3E%3Ctext x="400" y="245" fill="%2310B981" font-family="sans-serif" font-size="14" text-anchor="middle"%3EExport rendered at 4K UHD 60FPS%3C/text%3E%3C/svg%3E'
    ],
    deductionAmount: 0,
    updatedAt: today
  },
  {
    id: 'att-1-d1',
    employeeId: 'emp-1',
    date: dMinus1,
    status: 'present',
    adminRating: 5,
    adminDeliverySpeed: 'fast',
    adminFeedback: 'تسليم سريع واستجابة فورية للتعديلات.',
    employeeTaskReport: 'تم تعديل أول 3 ريلز وفق الملاحظات، وجاري تقطيع الفيديو الطويل.',
    employeeSubmittedAt: '16:00',
    deductionAmount: 0,
    updatedAt: dMinus1
  },
  {
    id: 'att-1-d2',
    employeeId: 'emp-1',
    date: dMinus2,
    status: 'present',
    adminRating: 4,
    adminDeliverySpeed: 'on_time',
    adminFeedback: 'جودة جيدة، يرجى فقط الانتباه لضبط مستوى صوت الـ Sound Effects.',
    employeeTaskReport: 'مونتاج المسودة الأولى للفيديو الإعلاني وتطبيق الـ B-Rolls.',
    employeeSubmittedAt: '15:15',
    deductionAmount: 0,
    updatedAt: dMinus2
  },

  // Sara (emp-2) past records
  {
    id: 'att-2-today',
    employeeId: 'emp-2',
    date: today,
    status: 'present',
    adminRating: 5,
    adminDeliverySpeed: 'fast',
    adminFeedback: 'أنيميشن اللوجو وانتقالات النصوص متقنة للغاية.',
    employeeTaskReport: 'صممت 4 عناصر موشن جرافيك 2D للإنترو والآوترو، وحفظت البريست في After Effects.',
    employeeSubmittedAt: '13:45',
    videoDeliverableUrl: 'https://vimeo.com/preview-motion-sample',
    deductionAmount: 0,
    updatedAt: today
  },
  {
    id: 'att-2-d1',
    employeeId: 'emp-2',
    date: dMinus1,
    status: 'present',
    adminRating: 4,
    adminDeliverySpeed: 'on_time',
    adminFeedback: 'عمل جيد والتزام بالهوية البصرية.',
    employeeTaskReport: 'رسم المشاهد في الإلستريتور وتجهيز الطبقات للتحريك.',
    employeeSubmittedAt: '17:20',
    deductionAmount: 0,
    updatedAt: dMinus1
  },

  // Omar (emp-3) past records
  {
    id: 'att-3-today',
    employeeId: 'emp-3',
    date: today,
    status: 'present',
    adminRating: 5,
    adminDeliverySpeed: 'exceptional',
    adminFeedback: 'ركيزة أساسية في الفريق، أداء مستقر وعالي.',
    employeeTaskReport: 'تم إنجاز مونتاج حلقتين بودكاست ومزامنة الكاميرات المتعددة (Multicam).',
    employeeSubmittedAt: '12:10',
    deductionAmount: 0,
    updatedAt: today
  },
  {
    id: 'att-3-d1',
    employeeId: 'emp-3',
    date: dMinus1,
    status: 'absent',
    adminRating: 0,
    adminFeedback: 'غائب بدون إشعار مسبق - تم احتساب الخصم تلقائياً.',
    employeeTaskReport: '',
    deductionAmount: 13.64,
    updatedAt: dMinus1
  },

  // Reem (emp-4)
  {
    id: 'att-4-today',
    employeeId: 'emp-4',
    date: today,
    status: 'present',
    adminRating: 5,
    adminDeliverySpeed: 'fast',
    adminFeedback: 'الصور المصغرة تجذب العين وتناسق ألوان احترافي.',
    employeeTaskReport: 'تصميم 3 أشكال ثمنيلز للفيديو الجديد واختبار الـ A/B Testing.',
    employeeSubmittedAt: '15:00',
    deductionAmount: 0,
    updatedAt: today
  },

  // Mohamed (emp-5)
  {
    id: 'att-5-today',
    employeeId: 'emp-5',
    date: today,
    status: 'present',
    adminRating: 4,
    adminDeliverySpeed: 'on_time',
    adminFeedback: 'هيكل السكريبت قوي، يرجى تعزيز الهوك (Hook) في أول 5 ثوانٍ.',
    employeeTaskReport: 'كتابة سكريبت فيديو ترويجي لقسم الموشن جرافيك من 45 ثانية.',
    employeeSubmittedAt: '14:00',
    deductionAmount: 0,
    updatedAt: today
  }
];

export const initialNotifications: DecisionNotification[] = [
  {
    id: 'notif-1',
    employeeId: 'emp-3',
    employeeName: 'عمر ياسين طاهر',
    type: 'upgrade_3_months',
    title: 'ترقية رسمية لعقد 3 أشهر (تم الإرسال عبر Resend)',
    message: 'مبروك يا عمر! نظراً لالتزامك المتميز وجودة المونتاج خلال الأسبوع التجريبي، يسعدنا ترقيتك لعقد رسمي مدته 3 أشهر براتب 300$.',
    sentToEmail: 'omar.yaseen.video@gmail.com',
    status: 'delivered',
    timestamp: '2026-07-08 18:00',
    meta: {
      salary: 300,
      newContractType: '3_month_contract'
    }
  },
  {
    id: 'notif-2',
    employeeId: 'admin-summary',
    employeeName: 'الإدارة (Roufablida90@gmail.com)',
    type: 'weekly_summary',
    title: 'الملخص الأسبوعي التلقائي لأداء الفريق والرواتب',
    message: 'ملخص أسبوعي شامل: إجمالي الحضور 94%، الرواتب المستحقة حتى الآن 840$، وقرار تجربة معلق للموظف أحمد خليل.',
    sentToEmail: 'Roufablida90@gmail.com',
    status: 'delivered',
    timestamp: '2026-08-14 20:00'
  }
];

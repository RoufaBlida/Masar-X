import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  Employee, 
  AttendanceRecord, 
  DecisionNotification, 
  AppSettings, 
  ActiveTab, 
  AttendanceStatus, 
  DeliverySpeed, 
  ContractType,
  AuthUser
} from '../types';
import { 
  initialEmployees, 
  initialAttendanceRecords, 
  initialNotifications, 
  initialSettings 
} from '../data/initialData';
import { Language, translations } from '../utils/translations';
import { calculateDailyRate, isWeekend } from '../utils/calculations';
import { 
  testFirestoreConnection, 
  db, 
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  firebaseConfig 
} from '../firebase/config';
import { 
  saveEmployeeToCloud, 
  deleteEmployeeFromCloud, 
  saveAttendanceRecordToCloud, 
  saveSettingsToCloud, 
  syncAllToCloud, 
  fetchAllFromCloud,
  clearAllCloudData 
} from '../firebase/firestoreService';

interface AppContextType {
  // Authentication & Session
  authUser: AuthUser | null;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsEmployee: (accessCode: string) => Promise<{ success: boolean; error?: string; employee?: Employee }>;
  logout: () => void;
  clearAllLocalData: () => void;

  // Navigation & Mode
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations.ar;
  isEmployeePortal: boolean;
  setIsEmployeePortal: (v: boolean) => void;
  currentEmployeeId: string | null;
  setCurrentEmployeeId: (id: string | null) => void;
  
  // Date State
  currentDate: string;
  setCurrentDate: (date: string) => void;
  
  // Data
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  notifications: DecisionNotification[];
  settings: AppSettings;
  
  // Cloud Database & Vercel Sync
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  lastSyncedTime: string | null;
  syncWithCloud: () => Promise<boolean>;
  isVercelSyncModalOpen: boolean;
  setIsVercelSyncModalOpen: (open: boolean) => void;

  // Actions
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'accessCode'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Attendance actions
  getRecordForEmployeeAndDate: (empId: string, dateStr: string) => AttendanceRecord | undefined;
  updateAttendanceStatus: (empId: string, dateStr: string, status: AttendanceStatus) => void;
  updateAdminEvaluation: (
    empId: string, 
    dateStr: string, 
    evalData: { rating?: number; speed?: DeliverySpeed; feedback?: string }
  ) => void;
  updateEmployeeReport: (
    empId: string, 
    dateStr: string, 
    reportData: { reportText: string; deliverableUrl?: string; reportImages?: string[] }
  ) => void;
  markAllPresentToday: (dateStr: string) => void;
  
  // Decisions & Notifications
  promoteToThreeMonths: (empId: string, newSalary?: number, customNotes?: string) => void;
  endEmployeeTrial: (empId: string, reason?: string) => void;
  sendCustomNotification: (notif: Omit<DecisionNotification, 'id' | 'timestamp' | 'status'>) => void;
  sendWeeklySummaryEmail: () => void;
  
  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetToDefaultData: () => void;

  // Selected Employee Modal
  selectedEmployeeForDetail: Employee | null;
  setSelectedEmployeeForDetail: (emp: Employee | null) => void;
  
  // Decision Modal State
  decisionModalEmployee: Employee | null;
  setDecisionModalEmployee: (emp: Employee | null) => void;

  // Last action feedback banner / toast
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'masar_app_v4_';

// One-time legacy mock cleanup helper
const purgeLegacyLocalStorage = () => {
  try {
    const keysToRemove = [
      'masar_app_v1_employees',
      'masar_app_v1_attendance',
      'masar_app_v1_notifications',
      'masar_app_v2_employees',
      'masar_app_v2_attendance',
      'masar_app_v2_notifications',
      'masar_app_v3_employees',
      'masar_app_v3_attendance',
      'masar_app_v3_notifications'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }
};
purgeLegacyLocalStorage();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'lang') as Language) || 'ar';
  });

  const isAr = lang === 'ar';

  // Auth User State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isEmployeePortal, setIsEmployeePortal] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.role === 'employee';
    }
    return false;
  });

  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.employeeId || null;
    }
    return null;
  });
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(todayStr);

  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [decisionModalEmployee, setDecisionModalEmployee] = useState<Employee | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Cloud Sync State
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isVercelSyncModalOpen, setIsVercelSyncModalOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Employees - Clean starting state
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out legacy mock data if present
        return parsed.filter((e: Employee) => !['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(e.id));
      } catch {
        return [];
      }
    }
    return initialEmployees;
  });

  // Attendance Records - Clean starting state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'attendance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((r: AttendanceRecord) => !['att-1-today', 'att-1-d1', 'att-1-d2', 'att-2-today', 'att-2-d1', 'att-3-today', 'att-3-d1', 'att-4-today', 'att-5-today'].includes(r.id));
      } catch {
        return [];
      }
    }
    return initialAttendanceRecords;
  });

  // Notifications - Clean starting state
  const [notifications, setNotifications] = useState<DecisionNotification[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync authUser to localStorage
  useEffect(() => {
    if (authUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'auth_user');
    }
  }, [authUser]);

  // Test connection and attempt initial cloud hydrate on startup
  useEffect(() => {
    let isMounted = true;

    async function initCloud() {
      try {
        const isOnline = await testFirestoreConnection();
        if (isMounted) {
          setIsCloudConnected(isOnline);
        }

        if (isOnline) {
          const cloudData = await fetchAllFromCloud();
          if (isMounted && cloudData) {
            // Check if remote data only contains old mock employees
            const hasLegacyMock = cloudData.employees.some(e => ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(e.id));
            if (hasLegacyMock) {
              await clearAllCloudData();
              setEmployees([]);
              setAttendanceRecords([]);
            } else if (cloudData.employees.length > 0) {
              setEmployees(cloudData.employees);
              if (cloudData.attendanceRecords.length > 0) {
                setAttendanceRecords(cloudData.attendanceRecords);
              }
            }

            if (cloudData.settings) {
              setSettings(cloudData.settings);
            }
            setLastSyncedTime(new Date().toLocaleTimeString('ar-SA'));
          }
        }
      } catch (err) {
        console.warn('Initial cloud database connection check:', err);
      }
    }

    initCloud();
    return () => { isMounted = false; };
  }, []);

  // Manual cloud synchronization
  const syncWithCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const res = await syncAllToCloud(employees, attendanceRecords, settings);
      if (res.success) {
        setIsCloudConnected(true);
        const timeNow = new Date().toLocaleTimeString('ar-SA');
        setLastSyncedTime(timeNow);
        showToast(
          lang === 'ar' ? 'تمت المزامنة وحفظ البيانات في قاعدة بيانات Firebase بنجاح!' : 'Successfully synced data with Firebase Firestore!',
          'success'
        );
        setIsCloudSyncing(false);
        return true;
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      console.error('Cloud Sync failed:', err);
      showToast(
        lang === 'ar' ? 'تعذر إتمام المزامنة مع السحابة، جاري حفظ البيانات محلياً' : 'Could not sync with cloud, saving locally',
        'warning'
      );
      setIsCloudSyncing(false);
      return false;
    }
  };

  // Authentication methods
  const loginAsAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = (email || settings.adminEmail || 'roufablida360@gmail.com').trim();
      const userObj: AuthUser = {
        id: `admin-${Date.now()}`,
        name: isAr ? 'المشرف العام' : 'Administrator',
        email: cleanEmail,
        role: 'admin'
      };
      setAuthUser(userObj);
      setIsEmployeePortal(false);
      showToast(isAr ? `مرحباً بك، تم تسجيل الدخول كـ ${userObj.name}` : `Welcome back, ${userObj.name}!`, 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userObj: AuthUser = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || (isAr ? 'مدير النظام' : 'Admin'),
        email: user.email || '',
        role: 'admin',
        avatar: user.photoURL || undefined
      };
      setAuthUser(userObj);
      setIsEmployeePortal(false);
      showToast(isAr ? `تم تسجيل الدخول بنجاح بحساب Google: ${userObj.email}` : `Signed in with Google as ${userObj.email}`, 'success');
      return { success: true };
    } catch (err) {
      console.warn('Google Sign In:', err);
      return { 
        success: false, 
        error: isAr 
          ? 'تعذر إتمام تسجيل الدخول عبر Google. يمكنك استخدام الدخول المباشر بالبريد.' 
          : 'Google sign-in was canceled or failed. You can use direct email sign in.' 
      };
    }
  };

  const loginAsEmployee = async (accessCode: string): Promise<{ success: boolean; error?: string; employee?: Employee }> => {
    const code = accessCode.trim().toUpperCase();
    if (!code) {
      return { success: false, error: isAr ? 'يرجى إدخال كود الموظف' : 'Please enter employee access code' };
    }

    // Try finding employee in current state or fallback cloud list
    let targetEmp = employees.find(e => e.accessCode.trim().toUpperCase() === code);

    // If not found in state, try fetch latest cloud data
    if (!targetEmp) {
      try {
        const cloudData = await fetchAllFromCloud();
        targetEmp = cloudData.employees.find(e => e.accessCode.trim().toUpperCase() === code);
        if (targetEmp) {
          setEmployees(cloudData.employees);
        }
      } catch (e) {
        console.warn('Employee code check fallback error:', e);
      }
    }

    if (targetEmp) {
      const userObj: AuthUser = {
        id: targetEmp.id,
        name: targetEmp.name,
        email: targetEmp.email,
        role: 'employee',
        employeeId: targetEmp.id
      };
      setAuthUser(userObj);
      setCurrentEmployeeId(targetEmp.id);
      setIsEmployeePortal(true);
      showToast(isAr ? `مرحباً بك يا ${targetEmp.name} في بوابة إنجازك اليومي` : `Welcome ${targetEmp.name}!`, 'success');
      return { success: true, employee: targetEmp };
    } else {
      return { 
        success: false, 
        error: isAr 
          ? 'كود الموظف غير صحيح أو غير مسجل في النظام. تواصل مع الإدارة للحصول على كودك.' 
          : 'Invalid access code. Please check with administrator.' 
      };
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setAuthUser(null);
    setIsEmployeePortal(false);
    showToast(isAr ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
  };

  // Clear all mock data completely from everywhere
  const clearAllLocalData = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'employees');
    localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'attendance');
    localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'notifications');
    setEmployees([]);
    setAttendanceRecords([]);
    setNotifications([]);
    await clearAllCloudData();
    showToast(isAr ? 'تم حذف جميع البيانات الافتراضية وقاعدة البيانات بنجاح' : 'All default data deleted successfully', 'info');
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const t = translations[lang];

  // Helper to generate access code
  const generateAccessCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `EMP-${randomNum}`;
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt' | 'accessCode'>): Employee => {
    const newId = `emp-${Date.now()}`;
    const code = generateAccessCode();
    const newEmp: Employee = {
      ...empData,
      id: newId,
      accessCode: code,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setEmployees(prev => [newEmp, ...prev]);
    showToast(`${t.addEmployee}: ${newEmp.name}`, 'success');

    // Background sync to Firestore
    saveEmployeeToCloud(newEmp).catch(err => console.warn('Firestore employee save:', err));

    // Create initial notification for onboarding
    const notif: DecisionNotification = {
      id: `notif-${Date.now()}`,
      employeeId: newId,
      employeeName: newEmp.name,
      type: 'custom_email',
      title: `ترحيب بالموظف الجديد: ${newEmp.name}`,
      message: `تم إنشاء حساب الموظف براتب تجريبي $${newEmp.baseSalary} وكود دخول: ${code}. تم إرسال معلومات البدء عبر Resend إلى ${newEmp.email}.`,
      sentToEmail: newEmp.email,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE')
    };
    setNotifications(prev => [notif, ...prev]);

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updatedList = prev.map(emp => {
        if (emp.id === id) {
          const updatedEmp = { ...emp, ...updates };
          // Background sync to Firestore
          saveEmployeeToCloud(updatedEmp).catch(err => console.warn('Firestore employee update:', err));
          return updatedEmp;
        }
        return emp;
      });
      return updatedList;
    });
    showToast(t.autoSaved, 'success');
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.employeeId !== id));
    deleteEmployeeFromCloud(id).catch(err => console.warn('Firestore delete:', err));
    showToast(`تم حذف ${emp?.name || 'الموظف'} من النظام`, 'info');
  };

  const getRecordForEmployeeAndDate = (empId: string, dateStr: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(r => r.employeeId === empId && r.date === dateStr);
  };

  const updateAttendanceStatus = (empId: string, dateStr: string, status: AttendanceStatus) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const dailyRate = calculateDailyRate(emp, dateStr, settings);
    const deduction = status === 'absent' ? dailyRate : 0;

    let targetRecord: AttendanceRecord;

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === empId && r.date === dateStr);
      if (existingIndex >= 0) {
        const updated = [...prev];
        targetRecord = {
          ...updated[existingIndex],
          status,
          deductionAmount: deduction,
          updatedAt: new Date().toISOString()
        };
        updated[existingIndex] = targetRecord;
        return updated;
      } else {
        targetRecord = {
          id: `att-${empId}-${dateStr}`,
          employeeId: empId,
          date: dateStr,
          status,
          deductionAmount: deduction,
          updatedAt: new Date().toISOString()
        };
        return [targetRecord, ...prev];
      }
    });

    // Save to Firestore
    const recordToSave: AttendanceRecord = {
      id: `att-${empId}-${dateStr}`,
      employeeId: empId,
      date: dateStr,
      status,
      deductionAmount: deduction,
      updatedAt: new Date().toISOString()
    };
    saveAttendanceRecordToCloud(recordToSave).catch(err => console.warn('Firestore att save:', err));

    if (status === 'absent') {
      showToast(`تم تسجيل غياب ${emp.name} (خصم -$${dailyRate.toFixed(2)})`, 'warning');
    } else if (status === 'present') {
      showToast(`تم تأكيد حضور ${emp.name}`, 'success');
    }
  };

  const updateAdminEvaluation = (
    empId: string, 
    dateStr: string, 
    evalData: { rating?: number; speed?: DeliverySpeed; feedback?: string }
  ) => {
    let targetRec: AttendanceRecord;
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === empId && r.date === dateStr);
      if (existingIndex >= 0) {
        const updated = [...prev];
        targetRec = {
          ...updated[existingIndex],
          ...(evalData.rating !== undefined && { adminRating: evalData.rating }),
          ...(evalData.speed !== undefined && { adminDeliverySpeed: evalData.speed }),
          ...(evalData.feedback !== undefined && { adminFeedback: evalData.feedback }),
          updatedAt: new Date().toISOString()
        };
        updated[existingIndex] = targetRec;
        return updated;
      } else {
        targetRec = {
          id: `att-${empId}-${dateStr}`,
          employeeId: empId,
          date: dateStr,
          status: 'present',
          adminRating: evalData.rating || 5,
          adminDeliverySpeed: evalData.speed || 'on_time',
          adminFeedback: evalData.feedback || '',
          deductionAmount: 0,
          updatedAt: new Date().toISOString()
        };
        return [targetRec, ...prev];
      }
    });

    if (targetRec!) {
      saveAttendanceRecordToCloud(targetRec).catch(err => console.warn('Firestore eval save:', err));
    }
  };

  const updateEmployeeReport = (
    empId: string, 
    dateStr: string, 
    reportData: { reportText: string; deliverableUrl?: string; reportImages?: string[] }
  ) => {
    const timeNow = new Date().toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
    let targetRec: AttendanceRecord;

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === empId && r.date === dateStr);
      if (existingIndex >= 0) {
        const updated = [...prev];
        targetRec = {
          ...updated[existingIndex],
          employeeTaskReport: reportData.reportText,
          videoDeliverableUrl: reportData.deliverableUrl !== undefined ? reportData.deliverableUrl : updated[existingIndex].videoDeliverableUrl,
          reportImages: reportData.reportImages !== undefined ? reportData.reportImages : updated[existingIndex].reportImages,
          employeeSubmittedAt: timeNow,
          updatedAt: new Date().toISOString()
        };
        updated[existingIndex] = targetRec;
        return updated;
      } else {
        targetRec = {
          id: `att-${empId}-${dateStr}`,
          employeeId: empId,
          date: dateStr,
          status: 'present',
          employeeTaskReport: reportData.reportText,
          videoDeliverableUrl: reportData.deliverableUrl,
          reportImages: reportData.reportImages,
          employeeSubmittedAt: timeNow,
          deductionAmount: 0,
          updatedAt: new Date().toISOString()
        };
        return [targetRec, ...prev];
      }
    });

    if (targetRec!) {
      saveAttendanceRecordToCloud(targetRec).catch(err => console.warn('Firestore report save:', err));
    }
    showToast(t.reportSubmittedSuccess, 'success');
  };

  const markAllPresentToday = (dateStr: string) => {
    setAttendanceRecords(prev => {
      const updated = [...prev];
      employees.forEach(emp => {
        if (emp.status === 'terminated') return;
        const weekend = isWeekend(dateStr, emp.customWeekendDays, settings.defaultWeekendDays);
        const targetStatus: AttendanceStatus = weekend ? 'weekend' : 'present';
        
        const idx = updated.findIndex(r => r.employeeId === emp.id && r.date === dateStr);
        let rec: AttendanceRecord;
        if (idx >= 0) {
          rec = {
            ...updated[idx],
            status: targetStatus,
            deductionAmount: 0,
            updatedAt: new Date().toISOString()
          };
          updated[idx] = rec;
        } else {
          rec = {
            id: `att-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            status: targetStatus,
            deductionAmount: 0,
            updatedAt: new Date().toISOString()
          };
          updated.unshift(rec);
        }
        saveAttendanceRecordToCloud(rec).catch(err => console.warn('Firestore mark present:', err));
      });
      return updated;
    });
    showToast(t.allMarkedPresent, 'success');
  };

  const promoteToThreeMonths = (empId: string, newSalary?: number, customNotes?: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const salary = newSalary || emp.baseSalary;
    const updatedEmp: Employee = {
      ...emp,
      contractType: '3_month_contract' as ContractType,
      baseSalary: salary,
      upgradedAt: new Date().toISOString().split('T')[0],
      notes: customNotes ? `${emp.notes || ''} \n[ترقية 3 أشهر]: ${customNotes}` : emp.notes
    };

    setEmployees(prev => prev.map(e => (e.id === empId ? updatedEmp : e)));
    saveEmployeeToCloud(updatedEmp).catch(err => console.warn('Firestore promote save:', err));

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Add Resend email notification
    const notif: DecisionNotification = {
      id: `notif-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: 'upgrade_3_months',
      title: `ترقية رسمية لعقد 3 أشهر (Resend Email): ${emp.name}`,
      message: `مبروك يا ${emp.name}! اجتزت الأسبوع التجريبي بنجاح وتم تثبيتك بعقد 3 أشهر براتب شهري $${salary}. تم إرسال نسخة العقد والمباركة إلى بريدك (${emp.email}).`,
      sentToEmail: emp.email,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE'),
      meta: {
        salary,
        newContractType: '3_month_contract',
        adminNotes: customNotes
      }
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`تهانينا! تم ترقية ${emp.name} لعقد 3 أشهر وإرسال الإشعار عبر Resend`, 'success');
  };

  const endEmployeeTrial = (empId: string, reason?: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const updatedEmp: Employee = {
      ...emp,
      contractType: 'terminated' as ContractType,
      status: 'terminated',
      terminatedAt: new Date().toISOString().split('T')[0],
      notes: reason ? `${emp.notes || ''} \n[إنهاء التجربة]: ${reason}` : emp.notes
    };

    setEmployees(prev => prev.map(e => (e.id === empId ? updatedEmp : e)));
    saveEmployeeToCloud(updatedEmp).catch(err => console.warn('Firestore term save:', err));

    const notif: DecisionNotification = {
      id: `notif-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: 'terminate_trial',
      title: `إشعار نهاية الفترة التجريبية: ${emp.name}`,
      message: `نشكر ${emp.name} على المجهود المبذول خلال الأسبوع التجريبي. تم إنهاء التجربة مع تسوية المستحقات المالية المستحقة. تم إرسال الإشعار لـ ${emp.email}.`,
      sentToEmail: emp.email,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE')
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`تم إنهاء تجربة ${emp.name} وتسجيل الإشعار في النظام`, 'info');
  };

  const sendCustomNotification = (notifData: Omit<DecisionNotification, 'id' | 'timestamp' | 'status'>) => {
    const notif: DecisionNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE')
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`تم إرسال الإشعار بالبريد إلى ${notif.sentToEmail}`, 'success');
  };

  const sendWeeklySummaryEmail = () => {
    const notif: DecisionNotification = {
      id: `notif-weekly-${Date.now()}`,
      employeeId: 'admin-summary',
      employeeName: `الأدمن (${settings.adminEmail})`,
      type: 'weekly_summary',
      title: `الملخص الأسبوعي التلقائي (خميس) - منصة مسار`,
      message: `تم إرسال التقرير الأسبوعي الشامل بنجاح إلى ${settings.adminEmail} متضمناً تفاصيل الحضور والغياب لـ ${employees.length} موظف، إجمالي الرواتب المستحقة، وموجز الإنجازات اليومية.`,
      sentToEmail: settings.adminEmail,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE')
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`تم إرسال الملخص الأسبوعي بنجاح إلى ${settings.adminEmail}`, 'success');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettingsToCloud(updated).catch(err => console.warn('Firestore settings save:', err));
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const resetToDefaultData = () => {
    setEmployees(initialEmployees);
    setAttendanceRecords(initialAttendanceRecords);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    syncAllToCloud(initialEmployees, initialAttendanceRecords, initialSettings);
    showToast('تمت استعادة البيانات الافتراضية بنجاح', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        loginAsAdmin,
        loginWithGoogle,
        loginAsEmployee,
        logout,
        clearAllLocalData,
        activeTab,
        setActiveTab,
        lang,
        setLang,
        t,
        isEmployeePortal,
        setIsEmployeePortal,
        currentEmployeeId,
        setCurrentEmployeeId,
        currentDate,
        setCurrentDate,
        employees,
        attendanceRecords,
        notifications,
        settings,
        isCloudConnected,
        isCloudSyncing,
        lastSyncedTime,
        syncWithCloud,
        isVercelSyncModalOpen,
        setIsVercelSyncModalOpen,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getRecordForEmployeeAndDate,
        updateAttendanceStatus,
        updateAdminEvaluation,
        updateEmployeeReport,
        markAllPresentToday,
        promoteToThreeMonths,
        endEmployeeTrial,
        sendCustomNotification,
        sendWeeklySummaryEmail,
        updateSettings,
        resetToDefaultData,
        selectedEmployeeForDetail,
        setSelectedEmployeeForDetail,
        decisionModalEmployee,
        setDecisionModalEmployee,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

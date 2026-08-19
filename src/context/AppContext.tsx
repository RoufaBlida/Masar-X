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
  AuthUser,
  AdminAccount,
  AdminPermissions,
  DEFAULT_SUPERVISOR_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS
} from '../types';
import { 
  initialEmployees, 
  initialAttendanceRecords, 
  initialNotifications, 
  initialSettings 
} from '../data/initialData';
import { Language, translations } from '../utils/translations';
import { calculateDailyRate, isWeekend, calculateAccruedSalary } from '../utils/calculations';
import { soundEffects } from '../utils/soundEffects';
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
  // Auth State & Actions
  authUser: AuthUser | null;
  registerAdmin: (name: string, email: string, password?: string, companyName?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsEmployee: (accessCode: string, password?: string) => Promise<{ success: boolean; error?: string; employee?: Employee }>;
  logout: () => void;
  clearAllLocalData: () => void;
  addAuthorizedAdmin: (admin: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
  updateAuthorizedAdmin: (id: string, updates: Partial<AdminAccount>) => void;
  updateAuthorizedAdminPermissions: (id: string, permissions: AdminPermissions) => void;
  removeAuthorizedAdmin: (id: string) => void;
  updateMasterAdminPassword: (newPass: string) => void;
  updateMasterAdminInfo: (newEmail: string, newPassword?: string) => void;

  // Sound System
  toggleSound: () => void;

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
  restoreEmployee: (id: string) => void;
  
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
  endEmployeeTrial: (empId: string, reason?: string, notes?: string) => void;
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
      'masar_app_v3_employees',
      'masar_app_v3_attendance'
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.adminPassword) parsed.adminPassword = 'Masar@Admin2026';
        if (parsed.soundEnabled === undefined) parsed.soundEnabled = true;
        return parsed;
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  // Sound effects sync
  useEffect(() => {
    soundEffects.setEnabled(settings.soundEnabled !== false);
  }, [settings.soundEnabled]);

  // Employees - Clean starting state
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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

  // Initial cloud check and sync
  useEffect(() => {
    let isMounted = true;
    const initializeCloud = async () => {
      try {
        const connected = await testFirestoreConnection();
        if (!isMounted) return;
        setIsCloudConnected(connected);

        if (connected) {
          const cloudData = await fetchAllFromCloud();
          if (!isMounted) return;

          // Merge employees if cloud has records
          if (cloudData.employees && cloudData.employees.length > 0) {
            setEmployees(cloudData.employees);
          } else if (employees.length > 0) {
            // Push local clean data to cloud
            await syncAllToCloud(employees, attendanceRecords, settings);
          }

          if (cloudData.attendanceRecords && cloudData.attendanceRecords.length > 0) {
            setAttendanceRecords(cloudData.attendanceRecords);
          }

          if (cloudData.settings) {
            setSettings(prev => ({ ...prev, ...cloudData.settings }));
          }

          setLastSyncedTime(new Date().toLocaleTimeString('sv-SE'));
        }
      } catch (err) {
        console.warn('Initial cloud sync error (operating in secure local mode):', err);
      }
    };

    initializeCloud();
    return () => {
      isMounted = false;
    };
  }, []);

  // Manual cloud sync
  const syncWithCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const connected = await testFirestoreConnection();
      setIsCloudConnected(connected);

      if (!connected) {
        showToast(isAr ? 'تعذر الاتصال بقاعدة بيانات Firestore السحابية' : 'Firestore offline', 'warning');
        setIsCloudSyncing(false);
        return false;
      }

      await syncAllToCloud(employees, attendanceRecords, settings);
      setLastSyncedTime(new Date().toLocaleTimeString('sv-SE'));
      showToast(isAr ? 'تمت مزامنة البيانات السحابية مع Firestore بنجاح ☁️' : 'Synced with Firestore cloud', 'success');
      setIsCloudSyncing(false);
      return true;
    } catch (err) {
      console.error('Cloud sync error:', err);
      showToast(isAr ? 'فشلت المزامنة مع السحابة' : 'Sync failed', 'warning');
      setIsCloudSyncing(false);
      return false;
    }
  };

  // Auth Operations
  const registerAdmin = async (
    name: string, 
    email: string, 
    password?: string, 
    companyName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanName = name.trim() || (isAr ? 'المشرف العام' : 'Administrator');
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: isAr ? 'يرجى إدخال البريد الإلكتروني للمدير' : 'Admin email is required' };
      }

      const updatedSettings: AppSettings = {
        ...settings,
        adminEmail: cleanEmail,
        adminPassword: password?.trim() || settings.adminPassword || 'Masar@Admin2026',
        companyName: companyName?.trim() || settings.companyName || (isAr ? 'منظومة مسار' : 'Masar')
      };
      setSettings(updatedSettings);
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
      saveSettingsToCloud(updatedSettings);

      const userObj: AuthUser = {
        id: `admin-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: 'admin',
        adminRole: 'super_admin',
        permissions: SUPER_ADMIN_PERMISSIONS
      };
      setAuthUser(userObj);
      setIsEmployeePortal(false);
      showToast(
        isAr ? `تم تعيين المشرف العام بنجاح! أهلاً بك يا ${cleanName}` : `Master Admin set successfully! Welcome ${cleanName}`,
        'success'
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Setup failed' };
    }
  };

  const isMasterAdminEmail = (emailStr: string) => {
    const norm = emailStr.trim().toLowerCase();
    const configuredMaster = (settings.adminEmail || '').toLowerCase();
    return norm === 'roufablida90@gmail.com' || 
           norm === 'roufablida90@gmai.com' || 
           norm === 'roufablida360@gmail.com' || 
           (Boolean(configuredMaster) && norm === configuredMaster);
  };

  const loginAsAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const enteredPassword = password ? password.trim() : '';

      if (!cleanEmail) {
        return { success: false, error: isAr ? 'يرجى إدخال البريد الإلكتروني للإدارة' : 'Please enter admin email' };
      }

      // STRICT SECURITY: Require Password!
      if (!enteredPassword) {
        return { success: false, error: isAr ? 'يرجى إدخال كلمة المرور للمتابعة' : 'Password is required' };
      }

      // 1. Check Master Super Admin (Roufablida90@gmail.com / Master Account)
      if (isMasterAdminEmail(cleanEmail)) {
        const expectedMasterPass = (settings.adminPassword || 'Masar@Admin2026').trim();
        if (enteredPassword !== expectedMasterPass) {
          return { success: false, error: isAr ? 'كلمة المرور غير صحيحة لحساب الإدارة' : 'Incorrect password' };
        }

        const userObj: AuthUser = {
          id: 'master-admin',
          name: isAr ? 'المشرف العام' : 'Super Admin',
          email: cleanEmail,
          role: 'admin',
          adminRole: 'super_admin',
          permissions: SUPER_ADMIN_PERMISSIONS
        };
        setAuthUser(userObj);
        setIsEmployeePortal(false);
        showToast(isAr ? `مرحباً بك يا ${userObj.name}، لديك كامل الصلاحيات الإدارية` : `Welcome back ${userObj.name}!`, 'success');
        return { success: true };
      }

      // 2. Check Authorized Added Admins / Supervisors with Custom Granular Permissions
      const authorizedList = settings.authorizedAdmins || [];
      const match = authorizedList.find(a => a.email.toLowerCase() === cleanEmail);

      if (match) {
        const expectedPass = (match.password || settings.adminPassword || 'Masar@Admin2026').trim();
        if (enteredPassword !== expectedPass) {
          return { success: false, error: isAr ? 'كلمة المرور غير صحيحة لحساب المشرف' : 'Incorrect password' };
        }

        const userObj: AuthUser = {
          id: match.id,
          name: match.name,
          email: match.email,
          role: 'admin',
          adminRole: match.role,
          permissions: match.permissions || DEFAULT_SUPERVISOR_PERMISSIONS
        };
        setAuthUser(userObj);
        setIsEmployeePortal(false);
        showToast(isAr ? `مرحباً بك يا ${match.name}` : `Welcome back ${match.name}!`, 'success');
        return { success: true };
      }

      // 3. Unauthorized - SECURE: NEVER LEAK ADMIN EMAILS
      return { 
        success: false, 
        error: isAr 
          ? 'عذراً، هذا الحساب غير مصرح له بالدخول كإدارة للنظام. يرجى مراجعة إدارة المنظومة.' 
          : 'Unauthorized access. Please contact system management.' 
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = (user.email || '').trim().toLowerCase();

      // Check Master or Authorized
      const isMaster = isMasterAdminEmail(userEmail);
      const authorizedMatch = (settings.authorizedAdmins || []).find(a => a.email.toLowerCase() === userEmail);

      if (isMaster) {
        const userObj: AuthUser = {
          id: user.uid,
          name: user.displayName || (isAr ? 'المشرف العام' : 'Super Admin'),
          email: userEmail,
          role: 'admin',
          adminRole: 'super_admin',
          permissions: SUPER_ADMIN_PERMISSIONS,
          avatar: user.photoURL || undefined
        };
        setAuthUser(userObj);
        setIsEmployeePortal(false);
        showToast(isAr ? `تم تسجيل الدخول بحساب المشرف العام` : `Signed in as Super Admin`, 'success');
        return { success: true };
      }

      if (authorizedMatch) {
        const userObj: AuthUser = {
          id: user.uid,
          name: authorizedMatch.name,
          email: userEmail,
          role: 'admin',
          adminRole: authorizedMatch.role,
          permissions: authorizedMatch.permissions || DEFAULT_SUPERVISOR_PERMISSIONS,
          avatar: user.photoURL || undefined
        };
        setAuthUser(userObj);
        setIsEmployeePortal(false);
        showToast(isAr ? `تم تسجيل الدخول كـ ${userObj.name}` : `Signed in as ${userObj.name}`, 'success');
        return { success: true };
      }

      // Unauthorized Google account - SECURE: NEVER LEAK SENSITIVE EMAILS
      return {
        success: false,
        error: isAr
          ? `عذراً، حساب Google هذا غير مصرح له بالوصول الإداري. يرجى مراجعة إدارة المنظومة لتفويض الحساب أولاً.`
          : `This Google account is not authorized for administrative access.`
      };
    } catch (err) {
      console.warn('Google Sign In:', err);
      return { 
        success: false, 
        error: isAr 
          ? 'تعذر إتمام تسجيل الدخول عبر Google. يمكنك استخدام الدخول المباشر بالبريد وكلمة المرور.' 
          : 'Google sign-in was canceled or failed.' 
      };
    }
  };

  const addAuthorizedAdmin = (adminData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const newAdmin: AdminAccount = {
      ...adminData,
      permissions: adminData.permissions || (adminData.role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_SUPERVISOR_PERMISSIONS),
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedList = [...(settings.authorizedAdmins || []), newAdmin];
    const updatedSettings = { ...settings, authorizedAdmins: updatedList };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? `تمت إضافة وتفويض المشرف ${newAdmin.name} بنجاح` : `Supervisor ${newAdmin.name} authorized`, 'success');
  };

  const updateAuthorizedAdmin = (id: string, updates: Partial<AdminAccount>) => {
    const updatedList = (settings.authorizedAdmins || []).map(a => {
      if (a.id === id) {
        return {
          ...a,
          ...updates,
          email: updates.email ? updates.email.trim().toLowerCase() : a.email,
          name: updates.name ? updates.name.trim() : a.name,
          password: updates.password !== undefined ? updates.password.trim() : a.password,
          permissions: updates.permissions || (updates.role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : a.permissions)
        };
      }
      return a;
    });
    const updatedSettings = { ...settings, authorizedAdmins: updatedList };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? 'تم تحديث وتعديل بيانات وحساب المشرف بنجاح' : 'Admin details updated successfully', 'success');
  };

  const updateAuthorizedAdminPermissions = (id: string, permissions: AdminPermissions) => {
    const updatedList = (settings.authorizedAdmins || []).map(a => 
      a.id === id ? { ...a, permissions } : a
    );
    const updatedSettings = { ...settings, authorizedAdmins: updatedList };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? 'تم حفظ وتحديث صلاحيات المشرف بنجاح' : 'Permissions saved successfully', 'success');
  };

  const removeAuthorizedAdmin = (id: string) => {
    const updatedList = (settings.authorizedAdmins || []).filter(a => a.id !== id);
    const updatedSettings = { ...settings, authorizedAdmins: updatedList };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? 'تم حذف حساب المشرف' : 'Admin removed', 'info');
  };

  const updateMasterAdminPassword = (newPass: string) => {
    const pass = newPass.trim();
    if (!pass) return;
    const updatedSettings = { ...settings, adminPassword: pass };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? 'تم تحديث كلمة مرور الإدارة بنجاح 🔒' : 'Master password updated', 'success');
  };

  const updateMasterAdminInfo = (newEmail: string, newPassword?: string) => {
    const email = newEmail.trim().toLowerCase();
    const updatedSettings: AppSettings = {
      ...settings,
      adminEmail: email || settings.adminEmail,
      ...(newPassword && newPassword.trim() ? { adminPassword: newPassword.trim() } : {})
    };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(updatedSettings));
    saveSettingsToCloud(updatedSettings);
    showToast(isAr ? 'تم تحديث بيانات وبريد وحساب المدير العام بنجاح 🔒' : 'Master admin updated', 'success');
  };

  const toggleSound = () => {
    const updated = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: updated };
    setSettings(newSettings);
    soundEffects.setEnabled(updated);
    if (updated) soundEffects.playNotification();
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(newSettings));
    saveSettingsToCloud(newSettings);
    showToast(isAr ? (updated ? 'تم تفعيل صوت الإشعارات 🔔' : 'تم كتم صوت الإشعارات 🔕') : (updated ? 'Sound enabled' : 'Sound muted'), 'info');
  };

  const loginAsEmployee = async (accessCode: string, password?: string): Promise<{ success: boolean; error?: string; employee?: Employee }> => {
    const code = accessCode.trim().toUpperCase();
    const enteredPass = (password || '').trim();

    if (!code) {
      return { success: false, error: isAr ? 'يرجى إدخال كود الموظف' : 'Please enter employee access code' };
    }

    if (!enteredPass) {
      return { success: false, error: isAr ? 'يرجى إدخال كلمة المرور المخصصة لحسابك' : 'Please enter your password' };
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

    if (!targetEmp) {
      return { 
        success: false, 
        error: isAr 
          ? 'كود الموظف غير صحيح أو غير مسجل في النظام. تواصل مع الإدارة للحصول على كودك.' 
          : 'Invalid access code. Please check with administrator.' 
      };
    }

    if (targetEmp.status === 'terminated') {
      return {
        success: false,
        error: isAr ? 'تم إنهاء هذا الحساب من قبل الإدارة' : 'This account has been terminated'
      };
    }

    // Verify Password
    const expectedPassword = (targetEmp.password || `emp${targetEmp.accessCode.replace(/\D/g, '') || '123'}`).trim();
    if (enteredPass !== expectedPassword) {
      return {
        success: false,
        error: isAr ? 'كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور المسلمة لك من الإدارة.' : 'Incorrect password'
      };
    }

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
    if (settings.soundEnabled !== false) {
      if (type === 'success') {
        soundEffects.playSuccess();
      } else if (type === 'warning') {
        soundEffects.playWarning();
      } else {
        soundEffects.playNotification();
      }
    }
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
    const defaultPassword = `emp${code.replace(/\D/g, '') || '123'}`;
    const newEmp: Employee = {
      ...empData,
      id: newId,
      accessCode: code,
      password: (empData.password && empData.password.trim()) ? empData.password.trim() : defaultPassword,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setEmployees(prev => [newEmp, ...prev]);
    saveEmployeeToCloud(newEmp).catch(err => console.warn('Firestore employee save:', err));

    showToast(
      isAr 
        ? `تمت إضافة الموظف ${newEmp.name} بنجاح! كود الدخول: ${newEmp.accessCode} | كلمة المرور: ${newEmp.password}` 
        : `Employee added! Code: ${newEmp.accessCode} | Password: ${newEmp.password}`,
      'success'
    );
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updatedList = prev.map(emp => {
        if (emp.id === id) {
          const updatedEmp = { ...emp, ...updates };
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

  const restoreEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const updatedEmp: Employee = {
      ...emp,
      status: 'active',
      contractType: emp.contractType === 'terminated' ? '3_month_contract' : emp.contractType
    };

    setEmployees(prev => prev.map(e => (e.id === empId ? updatedEmp : e)));
    saveEmployeeToCloud(updatedEmp).catch(err => console.warn('Firestore restore save:', err));
    showToast(isAr ? `تمت استعادة ${emp.name} وإعادته إلى قائمة الفريق النشط` : `Employee restored successfully`, 'success');
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
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    let targetRecord: AttendanceRecord;

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === empId && r.date === dateStr);
      if (existingIndex >= 0) {
        const updated = [...prev];
        targetRecord = {
          ...updated[existingIndex],
          adminRating: evalData.rating !== undefined ? evalData.rating : updated[existingIndex].adminRating,
          adminDeliverySpeed: evalData.speed !== undefined ? evalData.speed : updated[existingIndex].adminDeliverySpeed,
          adminFeedback: evalData.feedback !== undefined ? evalData.feedback : updated[existingIndex].adminFeedback,
          updatedAt: new Date().toISOString()
        };
        updated[existingIndex] = targetRecord;
        return updated;
      } else {
        targetRecord = {
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
        return [targetRecord, ...prev];
      }
    });

    // Background sync to Firestore
    if (targetRecord!) {
      saveAttendanceRecordToCloud(targetRecord).catch(err => console.warn('Firestore eval save:', err));
    }
    showToast(t.evaluationSaved, 'success');
  };

  const updateEmployeeReport = (
    empId: string, 
    dateStr: string, 
    reportData: { reportText: string; deliverableUrl?: string; reportImages?: string[] }
  ) => {
    let targetRec: AttendanceRecord;

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === empId && r.date === dateStr);
      if (existingIndex >= 0) {
        const updated = [...prev];
        targetRec = {
          ...updated[existingIndex],
          employeeTaskReport: reportData.reportText,
          videoDeliverableUrl: reportData.deliverableUrl || updated[existingIndex].videoDeliverableUrl,
          reportImages: reportData.reportImages || updated[existingIndex].reportImages,
          employeeSubmittedAt: new Date().toISOString(),
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
          employeeSubmittedAt: new Date().toISOString(),
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

  const endEmployeeTrial = (empId: string, reason?: string, notes?: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const stats = calculateAccruedSalary(emp, attendanceRecords, currentDate, settings);
    const today = new Date().toISOString().split('T')[0];

    const updatedEmp: Employee = {
      ...emp,
      contractType: 'terminated' as ContractType,
      status: 'terminated',
      terminatedAt: today,
      terminationDate: today,
      terminationReason: reason || (isAr ? 'عدم اجتياز فترة التجربة' : 'Trial concluded'),
      terminationNotes: notes || '',
      terminatedBy: authUser?.name || (isAr ? 'المشرف العام' : 'Super Admin'),
      finalPayout: stats.accruedAmount,
      notes: reason ? `${emp.notes || ''} \n[إنهاء الخدمة]: ${reason} ${notes ? `(${notes})` : ''}` : emp.notes
    };

    setEmployees(prev => prev.map(e => (e.id === empId ? updatedEmp : e)));
    saveEmployeeToCloud(updatedEmp).catch(err => console.warn('Firestore term save:', err));

    const notif: DecisionNotification = {
      id: `notif-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: 'terminate_trial',
      title: isAr ? `إشعار إنهاء الخدمة: ${emp.name}` : `Contract Concluded: ${emp.name}`,
      message: isAr
        ? `نشكر ${emp.name} على المجهود المبذول. سبب الإنهاء: (${updatedEmp.terminationReason}). تم تسوية المستحقات المالية (${stats.accruedAmount.toFixed(0)}$). تم إرسال الإشعار لـ ${emp.email}.`
        : `Thank you ${emp.name} for your contribution during trial period.`,
      sentToEmail: emp.email,
      status: 'delivered',
      timestamp: new Date().toLocaleString('sv-SE')
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(isAr ? `تم إنهاء خدمة ${emp.name} ونقل الملف إلى سجل الأرشيف` : `Employee archived`, 'info');
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
        registerAdmin,
        loginAsAdmin,
        loginWithGoogle,
        loginAsEmployee,
        logout,
        clearAllLocalData,
        addAuthorizedAdmin,
        updateAuthorizedAdmin,
        updateAuthorizedAdminPermissions,
        removeAuthorizedAdmin,
        updateMasterAdminPassword,
        updateMasterAdminInfo,
        toggleSound,
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
        restoreEmployee,
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

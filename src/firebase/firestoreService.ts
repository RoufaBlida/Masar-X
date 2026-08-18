import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Employee, AttendanceRecord, AppSettings } from '../types';

const EMPLOYEES_COLLECTION = 'employees';
const ATTENDANCE_COLLECTION = 'attendance_records';
const SETTINGS_COLLECTION = 'app_settings';

/**
 * Save or update a single employee in Firestore
 */
export async function saveEmployeeToCloud(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, {
      ...employee,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete an employee from Firestore
 */
export async function deleteEmployeeFromCloud(employeeId: string): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employeeId}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update a daily attendance & report record in Firestore
 */
export async function saveAttendanceRecordToCloud(record: AttendanceRecord): Promise<void> {
  const path = `${ATTENDANCE_COLLECTION}/${record.id}`;
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, record.id);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save application settings to Firestore
 */
export async function saveSettingsToCloud(settings: AppSettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/main_settings`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'main_settings');
    await setDoc(docRef, {
      ...settings,
      id: 'main_settings',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Purge and delete all remote documents from employees and attendance_records
 */
export async function clearAllCloudData(): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);
    const employeesSnap = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    employeesSnap.forEach(d => {
      batch.delete(d.ref);
    });

    const attendanceSnap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    attendanceSnap.forEach(d => {
      batch.delete(d.ref);
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error clearing cloud data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

/**
 * Perform a full bidirectional sync or push of local state to Firestore
 */
export async function syncAllToCloud(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  settings: AppSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);

    // Sync settings
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'main_settings');
    batch.set(settingsRef, {
      ...settings,
      id: 'main_settings',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Clear remote deleted employees
    const employeesSnap = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    const currentEmpIds = new Set(employees.map(e => e.id));
    employeesSnap.forEach(d => {
      if (!currentEmpIds.has(d.id)) {
        batch.delete(d.ref);
      }
    });

    // Clear remote deleted attendance records
    const attendanceSnap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    const currentRecIds = new Set(attendanceRecords.map(r => r.id));
    attendanceSnap.forEach(d => {
      if (!currentRecIds.has(d.id)) {
        batch.delete(d.ref);
      }
    });

    // Sync employees
    for (const emp of employees) {
      const empRef = doc(db, EMPLOYEES_COLLECTION, emp.id);
      batch.set(empRef, {
        ...emp,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Sync attendance records
    for (const rec of attendanceRecords) {
      const recRef = doc(db, ATTENDANCE_COLLECTION, rec.id);
      batch.set(recRef, {
        ...rec,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error syncing all data to Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error'
    };
  }
}

/**
 * Fetch all remote data once from Firestore
 */
export async function fetchAllFromCloud(): Promise<{
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  settings: AppSettings | null;
}> {
  try {
    const employeesSnap = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    const attendanceSnap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));

    const employees: Employee[] = [];
    employeesSnap.forEach(docSnap => {
      employees.push(docSnap.data() as Employee);
    });

    const attendanceRecords: AttendanceRecord[] = [];
    attendanceSnap.forEach(docSnap => {
      attendanceRecords.push(docSnap.data() as AttendanceRecord);
    });

    let settings: AppSettings | null = null;
    settingsSnap.forEach(docSnap => {
      if (docSnap.id === 'main_settings') {
        settings = docSnap.data() as AppSettings;
      }
    });

    return { employees, attendanceRecords, settings };
  } catch (error) {
    console.error('Error fetching cloud data:', error);
    return { employees: [], attendanceRecords: [], settings: null };
  }
}

/**
 * Subscribe to real-time changes across Firestore collections
 */
export function subscribeToCloudUpdates(callbacks: {
  onEmployeesChange?: (employees: Employee[]) => void;
  onAttendanceChange?: (records: AttendanceRecord[]) => void;
  onSettingsChange?: (settings: AppSettings) => void;
}) {
  const unsubEmployees = onSnapshot(collection(db, EMPLOYEES_COLLECTION), (snap) => {
    if (callbacks.onEmployeesChange) {
      const emps: Employee[] = [];
      snap.forEach(d => emps.push(d.data() as Employee));
      callbacks.onEmployeesChange(emps);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, EMPLOYEES_COLLECTION);
  });

  const unsubAttendance = onSnapshot(collection(db, ATTENDANCE_COLLECTION), (snap) => {
    if (callbacks.onAttendanceChange) {
      const recs: AttendanceRecord[] = [];
      snap.forEach(d => recs.push(d.data() as AttendanceRecord));
      callbacks.onAttendanceChange(recs);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, ATTENDANCE_COLLECTION);
  });

  const unsubSettings = onSnapshot(collection(db, SETTINGS_COLLECTION), (snap) => {
    if (callbacks.onSettingsChange && !snap.empty) {
      snap.forEach(d => {
        if (d.id === 'main_settings') {
          callbacks.onSettingsChange?.(d.data() as AppSettings);
        }
      });
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, SETTINGS_COLLECTION);
  });

  return () => {
    unsubEmployees();
    unsubAttendance();
    unsubSettings();
  };
}

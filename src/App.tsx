import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DailyLogView } from './components/DailyLogView';
import { TeamManagementView } from './components/TeamManagementView';
import { TrialDecisionsView } from './components/TrialDecisionsView';
import { NotificationsLogView } from './components/NotificationsLogView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { SettingsView } from './components/SettingsView';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { DecisionActionModal } from './components/DecisionActionModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { VercelSyncModal } from './components/VercelSyncModal';
import { Employee } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatDate } from './utils/calculations';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isEmployeePortal, 
    toastMessage, 
    lang,
    employees,
    attendanceRecords,
    currentDate,
    settings
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#141518] bg-ambient-warm text-[#F3F4F6] flex flex-col selection:bg-[#E06D28]/30 selection:text-[#FFFFFF]">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenWeeklySummary={() => setIsWeeklySummaryOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isEmployeePortal ? (
          <EmployeePortalView />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenWeeklySummary={() => setIsWeeklySummaryOpen(true)}
                onOpenAddEmployee={() => setIsAddModalOpen(true)}
              />
            )}
            {activeTab === 'daily_log' && <DailyLogView />}
            {activeTab === 'team' && (
              <TeamManagementView
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenEditModal={(emp) => setEditingEmployee(emp)}
              />
            )}
            {activeTab === 'trial_decisions' && <TrialDecisionsView />}
            {activeTab === 'notifications_log' && (
              <NotificationsLogView onOpenWeeklySummary={() => setIsWeeklySummaryOpen(true)} />
            )}
            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn no-print">
          <div className="bg-[#1F2127] border border-[#E06D28]/40 text-[#FFFFFF] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 stroke-[2]" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0 stroke-[2]" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-[#E06D28] shrink-0 stroke-[2]" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditEmployeeModal
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      <EmployeeDetailModal />

      <DecisionActionModal />

      <WeeklySummaryModal
        isOpen={isWeeklySummaryOpen}
        onClose={() => setIsWeeklySummaryOpen(false)}
      />

      <VercelSyncModal />

      {/* Printable Report View (Visible only during window.print) */}
      <div className="hidden print-only p-8 bg-white text-black font-sans">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">مسار | MASAR - تقرير أداء وحضور الفريق والرواتب</h1>
          <p className="text-sm text-gray-600">التاريخ: {formatDate(currentDate, lang)} | المشرف: {settings.adminEmail}</p>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">كود</th>
              <th className="p-2">الاسم</th>
              <th className="p-2">التخصص</th>
              <th className="p-2">العقد</th>
              <th className="p-2">الراتب</th>
              <th className="p-2">حضور</th>
              <th className="p-2">غياب</th>
              <th className="p-2">المستحق</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b">
                <td className="p-2">{emp.accessCode}</td>
                <td className="p-2 font-bold">{emp.name}</td>
                <td className="p-2">{emp.role}</td>
                <td className="p-2">{emp.contractType}</td>
                <td className="p-2">${emp.baseSalary}</td>
                <td className="p-2">حاضر</td>
                <td className="p-2">0</td>
                <td className="p-2 font-bold">${emp.baseSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

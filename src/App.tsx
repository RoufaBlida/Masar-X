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
import { LoginView } from './components/LoginView';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { Employee } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatDate } from './utils/calculations';

const MainContent: React.FC = () => {
  const { 
    authUser,
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

  // If user is not authenticated, show modern login view
  if (!authUser) {
    return <LoginView />;
  }

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

      {/* Floating Support/Private Chat Widget */}
      <FloatingChatWidget />
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

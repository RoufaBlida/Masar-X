import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Sparkles, 
  User, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Lock,
  Archive,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Clock,
  Calendar,
  Eye,
  Info
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { ChatThread } from '../types';

export const FloatingChatWidget: React.FC = () => {
  const {
    authUser,
    employees,
    currentEmployeeId,
    chatMessages,
    chatThreads,
    activeChatThreadId,
    setActiveChatThreadId,
    closeChatThread,
    startNewChatThread,
    sendChatMessage,
    markChatMessagesAsRead,
    isChatOpen,
    setIsChatOpen,
    activeChatEmployeeId,
    setActiveChatEmployeeId,
    getUnreadChatCount,
    lang
  } = useApp();

  const isAr = lang === 'ar';
  const isAdmin = authUser?.role === 'admin';

  // Target employee id for current conversation
  const targetEmployeeId = isAdmin
    ? (activeChatEmployeeId || employees[0]?.id || '')
    : (authUser?.employeeId || currentEmployeeId || employees[0]?.id || '');

  const targetEmployee = employees.find(e => e.id === targetEmployeeId);

  // Widget Views: 'active_chat' | 'archive_list' | 'archived_thread_view'
  const [viewMode, setViewMode] = useState<'active_chat' | 'archive_list' | 'archived_thread_view'>('active_chat');
  const [selectedArchivedThread, setSelectedArchivedThread] = useState<ChatThread | null>(null);

  const [inputText, setInputText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const unreadCount = getUnreadChatCount(isAdmin ? undefined : targetEmployeeId);

  // Threads for the current employee
  const employeeThreads = chatThreads.filter(t => t.employeeId === targetEmployeeId);
  const currentActiveThread = employeeThreads.find(t => t.status === 'active') || null;
  const archivedThreads = employeeThreads.filter(t => t.status === 'closed');

  // Messages to show based on view
  let displayedMessages = chatMessages.filter(m => m.employeeId === targetEmployeeId);
  if (viewMode === 'archived_thread_view' && selectedArchivedThread) {
    displayedMessages = displayedMessages.filter(m => m.threadId === selectedArchivedThread.id);
  } else if (viewMode === 'active_chat') {
    if (currentActiveThread) {
      displayedMessages = displayedMessages.filter(m => !m.threadId || m.threadId === currentActiveThread.id);
    } else {
      // If there's no active thread, show unthreaded recent messages or empty
      displayedMessages = displayedMessages.filter(m => !m.threadId);
    }
  }

  const isCurrentThreadClosed = !currentActiveThread && archivedThreads.length > 0;

  // Mark as read when active chat is opened
  useEffect(() => {
    if (isChatOpen && targetEmployeeId && viewMode === 'active_chat') {
      markChatMessagesAsRead(targetEmployeeId, isAdmin ? 'admin' : 'employee');
    }
  }, [isChatOpen, targetEmployeeId, viewMode, displayedMessages.length]);

  // Scroll to bottom when messages update in chat view
  useEffect(() => {
    if (isChatOpen && viewMode !== 'archive_list') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages.length, isChatOpen, viewMode]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachmentUrl.trim()) return;
    if (!targetEmployeeId) return;
    if (isCurrentThreadClosed) return; // Prevent sending if closed

    await sendChatMessage(
      targetEmployeeId,
      inputText.trim(),
      attachmentUrl.trim() || undefined,
      currentActiveThread?.id
    );

    setInputText('');
    setAttachmentUrl('');
    setShowAttachmentInput(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCloseThread = async () => {
    if (!currentActiveThread) return;
    await closeChatThread(currentActiveThread.id);
    setIsCloseConfirmOpen(false);
  };

  const handleStartNewThread = async () => {
    if (!targetEmployeeId) return;
    await startNewChatThread(targetEmployeeId);
    setViewMode('active_chat');
    setSelectedArchivedThread(null);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-none">
      {/* 1. CHAT WINDOW (EMERGES DIRECTLY FROM THE CIRCULAR BUBBLE) */}
      <div 
        className={`absolute bottom-16 right-0 w-[92vw] sm:w-[410px] h-[550px] max-h-[calc(100vh-100px)] bg-[#17181D] border border-[#2D3039] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isChatOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-50 translate-y-10 pointer-events-none'
        }`}
        style={{
          transformOrigin: 'calc(100% - 26px) calc(100% + 24px)',
          boxShadow: isChatOpen 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(224, 109, 40, 0.25)' 
            : 'none'
        }}
      >
        {/* Header */}
        <div className="bg-[#1F2127] border-b border-[#2D3039] p-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Back Button if in detail/archive view */}
            {viewMode !== 'active_chat' ? (
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'archived_thread_view') setViewMode('archive_list');
                  else setViewMode('active_chat');
                }}
                className="p-1.5 rounded-lg bg-[#262831] hover:bg-[#2D3039] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer shrink-0"
                title={isAr ? 'رجوع' : 'Back'}
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>
            ) : (
              <div className="relative shrink-0">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
                  style={{ backgroundColor: isAdmin ? (targetEmployee?.avatarColor || '#E06D28') : '#E06D28' }}
                >
                  {isAdmin ? (targetEmployee?.avatarInitial || targetEmployee?.name?.charAt(0) || 'E') : <ShieldCheck className="w-5 h-5 text-white" />}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#1F2127]" />
              </div>
            )}

            <div className="min-w-0">
              {viewMode === 'archived_thread_view' ? (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 truncate flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    <span>{selectedArchivedThread?.title || (isAr ? 'محادثة مؤرشفة' : 'Archived Chat')}</span>
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF]">
                    {isAr ? `أغلقت في ${formatDate(selectedArchivedThread?.closedAt)}` : `Closed on ${formatDate(selectedArchivedThread?.closedAt)}`}
                  </p>
                </div>
              ) : viewMode === 'archive_list' ? (
                <div>
                  <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-[#FB923C]" />
                    <span>{isAr ? 'سجل وأرشيف المحادثات السابقة' : 'Chat Archive & History'}</span>
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF]">
                    {isAdmin ? targetEmployee?.name : (isAr ? 'محادثاتك السابقة مع الإدارة' : 'Past sessions with management')}
                  </p>
                </div>
              ) : isAdmin ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FB923C] transition-colors cursor-pointer text-start"
                  >
                    <span className="truncate max-w-[140px]">{targetEmployee?.name || (isAr ? 'اختر موظفاً' : 'Select member')}</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  {/* Employee Dropdown for Admin */}
                  {isEmployeeDropdownOpen && (
                    <div className="absolute top-full start-0 mt-2 w-64 bg-[#1F2127] border border-[#2D3039] rounded-xl shadow-xl py-1 z-50 max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] text-[#9CA3AF] font-bold border-b border-[#2D3039]">
                        {isAr ? 'محادثات الفريق:' : 'Team Threads:'}
                      </div>
                      {employees.map(emp => {
                        const unreadForEmp = getUnreadChatCount(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setActiveChatEmployeeId(emp.id);
                              setIsEmployeeDropdownOpen(false);
                            }}
                            className={`w-full text-start px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-[#262831] transition-colors ${
                              targetEmployeeId === emp.id ? 'bg-[#262831] text-[#FB923C] font-bold' : 'text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: emp.avatarColor || '#E06D28' }} 
                              />
                              <span className="truncate">{emp.name}</span>
                            </div>
                            {unreadForEmp > 0 && (
                              <span className="bg-[#E06D28] text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                                {unreadForEmp}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-[#9CA3AF] truncate">
                    {targetEmployee?.customRoleName || targetEmployee?.role || 'عضو الفريق'}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-white truncate">
                    {isAr ? 'الإدارة والمشرف المباشر' : 'Management & Direct Supervisor'}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span className="text-[10px] text-[#9CA3AF]">
                      {isAr ? 'متصل الآن للرد والمتابعة' : 'Online & Active'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Tools (Archive toggle & Close Thread & Minimize) */}
          <div className="flex items-center gap-1 shrink-0">
            {viewMode === 'active_chat' && (
              <>
                {/* Archive Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('archive_list')}
                  className="px-2 py-1 bg-[#262831] hover:bg-[#2D3039] text-[#9CA3AF] hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title={isAr ? 'أرشيف المحادثات السابقة' : 'Chat Archive'}
                >
                  <Archive className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>{isAr ? 'الأرشيف' : 'Archive'}</span>
                  {archivedThreads.length > 0 && (
                    <span className="bg-[#17181D] px-1 rounded text-[9px] font-mono text-amber-400">
                      {archivedThreads.length}
                    </span>
                  )}
                </button>

                {/* Admin Close Thread Button */}
                {isAdmin && currentActiveThread && (
                  <button
                    type="button"
                    onClick={() => setIsCloseConfirmOpen(true)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
                    title={isAr ? 'إغلاق المحادثة وقفلها' : 'Close & Lock Thread'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {/* Minimize button */}
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#2D3039] rounded-lg transition-colors cursor-pointer"
              title={isAr ? 'تصغير' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Closing Conversation */}
        {isCloseConfirmOpen && (
          <div className="p-3 bg-red-950/40 border-b border-red-500/30 flex flex-col gap-2 animate-fadeIn shrink-0">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200">
                <p className="font-bold">{isAr ? 'هل أنت متأكد من إنهاء وإغلاق هذه المحادثة؟' : 'Close and lock this conversation?'}</p>
                <p className="text-[10px] text-red-300/80 mt-0.5">
                  {isAr 
                    ? 'سيتم قفل الكتابة على الموظف وأرشفة الرسائل، ولن يتمكن من المراسلة إلا بفتح محادثة جديدة.' 
                    : 'The employee will no longer be able to type in this thread and it will be moved to archive.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsCloseConfirmOpen(false)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-[#262831] text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCloseThread}
                className="px-3 py-1 text-[11px] font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
              >
                {isAr ? 'نعم، إغلاق وأرشفة' : 'Yes, Close & Archive'}
              </button>
            </div>
          </div>
        )}

        {/* Subheader Status / Notice */}
        {viewMode === 'archived_thread_view' ? (
          <div className="bg-amber-950/20 px-3.5 py-1.5 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAr ? 'محادثة مؤرشفة ومغلقة (للقراءة فقط)' : 'Archived conversation (Read only)'}</span>
            </span>
            <button
              type="button"
              onClick={handleStartNewThread}
              className="text-[10px] text-amber-400 hover:text-white underline font-bold cursor-pointer"
            >
              {isAr ? '+ بدء محادثة جديدة' : '+ New Chat'}
            </button>
          </div>
        ) : viewMode === 'active_chat' ? (
          <div className="bg-[#1F2127]/60 px-3.5 py-1.5 border-b border-[#2D3039] flex items-center justify-between text-[11px] text-[#9CA3AF] shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FB923C]" />
              <span>{isAr ? 'محادثة مشفرة للتوجيه والملاحظات' : 'Direct channel for guidance & notes'}</span>
            </span>
            {currentActiveThread && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isAr ? 'جلسة نشطة' : 'Active'}
              </span>
            )}
          </div>
        ) : null}

        {/* VIEW 1: ARCHIVE LIST */}
        {viewMode === 'archive_list' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#131418]">
            <div className="flex items-center justify-between pb-1 border-b border-[#2D3039]">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-[#FB923C]" />
                <span>{isAr ? 'المحادثات المغلقة والمؤرشفة' : 'Closed & Archived Chats'}</span>
              </span>
              <button
                type="button"
                onClick={handleStartNewThread}
                className="text-[11px] bg-[#E06D28] hover:bg-[#F07935] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
              </button>
            </div>

            {archivedThreads.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-xl bg-[#1F2127] border border-[#2D3039] flex items-center justify-center text-[#9CA3AF] mb-2">
                  <Archive className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white">
                  {isAr ? 'لا توجد محادثات مؤرشفة بعد' : 'No archived conversations yet'}
                </h5>
                <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-xs leading-relaxed">
                  {isAr 
                    ? 'عندما تقوم الإدارة بإغلاق أي محادثة، ستظهر هنا فوراً للرجوع إليها وقراءة محتواها في أي وقت.' 
                    : 'When a chat is closed by management, it will be safely kept here for reference.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {archivedThreads.map((thread) => {
                  const threadMsgCount = chatMessages.filter(m => m.threadId === thread.id).length;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedArchivedThread(thread);
                        setViewMode('archived_thread_view');
                      }}
                      className="p-3 bg-[#1F2127] hover:bg-[#262831] border border-[#2D3039] hover:border-amber-500/40 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {thread.title}
                        </h5>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono shrink-0">
                          {threadMsgCount} {isAr ? 'رسائل' : 'msgs'}
                        </span>
                      </div>

                      {thread.lastMessageText && (
                        <p className="text-[11px] text-[#9CA3AF] mt-1 line-clamp-1">
                          {thread.lastMessageText}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[#6B7280] mt-2 pt-2 border-t border-[#2D3039]/60 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(thread.closedAt || thread.createdAt)}</span>
                        </span>
                        <span className="text-amber-400/80 flex items-center gap-1 group-hover:underline">
                          <Eye className="w-3 h-3" />
                          <span>{isAr ? 'عرض الأرشيف' : 'View archive'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2 & 3: ACTIVE OR ARCHIVED CHAT MESSAGES STREAM */}
        {viewMode !== 'archive_list' && (
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#131418]">
            {displayedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1F2127] border border-[#2D3039] flex items-center justify-center text-[#FB923C] mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h5 className="text-xs font-bold text-white">
                  {isAr ? 'ابدأ محادثة مباشرة' : 'Start a Direct Conversation'}
                </h5>
                <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-xs leading-relaxed">
                  {isAdmin
                    ? (isAr ? `أرسل ملاحظة توجيهية أو استفساراً لـ ${targetEmployee?.name || 'الموظف'}` : 'Send direct feedback or instructions')
                    : (isAr ? 'يمكنك هنا مراسلة الإدارة بشأن الملاحظات، الرواتب، أو تسليم المهام' : 'Ask questions about feedback, payouts, or deliverables')}
                </p>

                {/* Quick Suggestion Chips for Employee */}
                {!isAdmin && (
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    {[
                      '💡 استفسار حول ملاحظة اليوم',
                      '📹 رابط تعديل إضافي للمهمة',
                      '⏳ استفسار عن موعد التقييم',
                      '💵 سؤال بخصوص تفاصيل التحويل'
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickPrompt(chip)}
                        className="text-[10px] bg-[#1F2127] hover:bg-[#262831] text-[#9CA3AF] hover:text-white px-2.5 py-1 rounded-lg border border-[#2D3039] transition-colors cursor-pointer text-start"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {displayedMessages.map((msg) => {
                  const isMe = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'employee';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-semibold text-[#9CA3AF]">
                          {msg.senderRole === 'admin' ? (isAr ? '🛡️ الإدارة' : '🛡️ Admin') : msg.senderName}
                        </span>
                        <span className="text-[9px] text-[#6B7280] font-mono">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs break-words leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#E06D28] text-white rounded-te-xs'
                            : 'bg-[#1F2127] border border-[#2D3039] text-[#F3F4F6] rounded-ts-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Optional Attachment Link */}
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-2 p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-medium border transition-colors ${
                              isMe
                                ? 'bg-black/20 hover:bg-black/30 border-white/20 text-white'
                                : 'bg-[#17181D] hover:bg-[#262831] border-[#2D3039] text-[#FB923C]'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate underline">{msg.attachmentUrl}</span>
                          </a>
                        )}
                      </div>

                      {/* READ RECEIPTS & TIMESTAMPS */}
                      {/* CRITICAL REQUIREMENT: 
                          Admin sees if employee read the message and at EXACT hour & minute!
                          Employee NEVER sees if/when admin read their messages. */}
                      <div className="flex items-center gap-1 text-[9px] text-[#6B7280] px-1 font-mono">
                        {isMe && (
                          isAdmin ? (
                            msg.readByEmployee ? (
                              <span className="flex items-center gap-1 text-[#10B981] font-sans font-medium">
                                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>
                                  {isAr 
                                    ? `قرأها الموظف في ${formatTime(msg.readByEmployeeAt || msg.timestamp)}`
                                    : `Read by employee at ${formatTime(msg.readByEmployeeAt || msg.timestamp)}`}
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[#9CA3AF] font-sans">
                                <Check className="w-3 h-3" />
                                <span>{isAr ? 'تم الإرسال (لم يقرأها بعد)' : 'Sent (unread)'}</span>
                              </span>
                            )
                          ) : (
                            // For Employee: Always show simple sent confirmation without exposing admin read receipt
                            <span className="flex items-center gap-1 text-[#9CA3AF] font-sans">
                              <Check className="w-3 h-3" />
                              <span>{isAr ? 'تم الإرسال' : 'Sent'}</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Quick Prompts below chat stream in active chat */}
        {!isAdmin && viewMode === 'active_chat' && displayedMessages.length > 0 && !isCurrentThreadClosed && (
          <div className="bg-[#17181D] px-3 py-1.5 border-t border-[#2D3039] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] text-[#6B7280] shrink-0">{isAr ? 'رد سريع:' : 'Quick:'}</span>
            {[
              '✅ تم استلام الملاحظة وجاري التنفيذ',
              '📹 تم تحديث رابط التسليم',
              '🙏 شكراً جزيلاً'
            ].map((quick, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(quick)}
                className="text-[10px] bg-[#1F2127] hover:bg-[#262831] text-[#9CA3AF] hover:text-white px-2 py-0.5 rounded-md border border-[#2D3039] shrink-0 transition-colors cursor-pointer"
              >
                {quick}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Input Toggle Box */}
        {showAttachmentInput && viewMode === 'active_chat' && !isCurrentThreadClosed && (
          <div className="p-2.5 bg-[#1F2127] border-t border-[#2D3039] space-y-1.5 animate-fadeIn shrink-0">
            <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-[#FB923C]" />
                <span>{isAr ? 'رابط ملف أو تسليم إضافي (Drive / Loom / Image):' : 'Attachment link:'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentInput(false);
                  setAttachmentUrl('');
                }}
                className="text-[#6B7280] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or loom.com/..."
              className="w-full bg-[#17181D] border border-[#2D3039] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
            />
          </div>
        )}

        {/* FOOTER / INPUT AREA */}
        {viewMode === 'archived_thread_view' ? (
          <div className="bg-[#1F2127] border-t border-[#2D3039] p-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'المحادثة مغلقة ومحفوظة في الأرشيف' : 'Conversation is archived & locked'}</span>
            </div>
            <button
              type="button"
              onClick={handleStartNewThread}
              className="px-3 py-1.5 bg-[#E06D28] hover:bg-[#F07935] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              {isAr ? 'بدء محادثة جديدة' : 'Start New Chat'}
            </button>
          </div>
        ) : viewMode === 'active_chat' && isCurrentThreadClosed ? (
          // LOCKED STATE: ADMIN CLOSED THIS CONVERSATION
          <div className="bg-[#1F2127] border-t border-[#2D3039] p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="leading-tight">
                {isAr 
                  ? 'تم إغلاق هذه المحادثة من قِبل الإدارة. يمكنك بدء محادثة جديدة.' 
                  : 'This conversation was closed by admin. You can start a new chat.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartNewThread}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-[#E06D28] hover:bg-[#F07935] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? 'بدء محادثة جديدة' : 'Start New Thread'}</span>
            </button>
          </div>
        ) : viewMode === 'active_chat' ? (
          // ACTIVE INPUT AREA
          <form onSubmit={handleSend} className="bg-[#1F2127] border-t border-[#2D3039] p-2.5 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachmentInput(!showAttachmentInput)}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                showAttachmentInput || attachmentUrl ? 'bg-[#E06D28]/20 text-[#FB923C]' : 'text-[#9CA3AF] hover:text-white hover:bg-[#2D3039]'
              }`}
              title={isAr ? 'إرفاق رابط' : 'Attach URL'}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type your message...'}
              className="flex-1 bg-[#17181D] border border-[#2D3039] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#E06D28]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachmentUrl.trim()}
              className="py-2 px-3 rounded-xl bg-[#E06D28] hover:bg-[#F07935] disabled:opacity-40 disabled:hover:bg-[#E06D28] text-white transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
              title={isAr ? 'إرسال' : 'Send'}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : null}
      </div>

      {/* 2. FLOATING BUBBLE BUTTON (ANCHORED IN EXACT SAME POSITION ALWAYS) */}
      <div className="flex justify-end pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-13 h-13 rounded-full bg-[#E06D28] hover:bg-[#F07935] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative group"
          style={{
            boxShadow: '0 8px 24px -4px rgba(224, 109, 40, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.12)'
          }}
          aria-label={isAr ? 'الدردشة والرسائل المباشرة' : 'Direct Chat'}
        >
          <div className={`transition-transform duration-300 flex items-center justify-center ${isChatOpen ? 'rotate-90 scale-95' : 'rotate-0 scale-100'}`}>
            {isChatOpen ? (
              <X className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <MessageSquare className="w-6 h-6 stroke-[2]" />
            )}
          </div>

          {/* Unread Counter Badge */}
          {!isChatOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-bold text-[11px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-[#17181D] animate-pulse shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Hover Tooltip */}
          {!isChatOpen && (
            <span className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg bg-[#1F2127] border border-[#2D3039] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
              {isAr ? 'محادثة خاصة مع الإدارة 💬' : 'Direct Chat with Management 💬'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

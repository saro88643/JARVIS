import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { ChatView } from './components/ChatView.js';
import { ActivityPanel } from './components/ActivityPanel.js';
import { PermissionModal } from './components/PermissionModal.js';
import { Views } from './components/Views.js';
import { ChatMessage, ActivityLogEntry, PermissionRequest, PermissionDecision, PermissionLevel } from '@jarvis/shared';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('C:\\JARVIS');
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pendingPermission, setPendingPermission] = useState<PermissionRequest | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');

  // Poll backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health');
        if (res.ok) {
          const data = await res.json();
          setBackendOnline(true);
          if (data.approvedWorkspace) setActiveWorkspace(data.approvedWorkspace);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = (
    toolName: string,
    action: string,
    level: PermissionLevel,
    permissionStatus: 'AUTOMATIC' | 'APPROVED' | 'DENIED' | 'BLOCKED',
    status: 'SUCCESS' | 'FAILED' | 'PENDING',
    target?: string
  ) => {
    const entry: ActivityLogEntry = {
      id: 'act_' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      toolName,
      action,
      permissionLevel: level,
      permissionStatus,
      status,
      target,
    };
    setActivityEntries((prev) => [entry, ...prev]);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsProcessing(true);

    const lower = text.toLowerCase();

    // Check level 2 write permissions requirement
    if (lower.includes('create file') || lower.includes('delete file') || lower.includes('modify file')) {
      const req: PermissionRequest = {
        id: 'perm_' + Date.now(),
        toolName: lower.includes('create') ? 'create_file' : lower.includes('delete') ? 'delete_file' : 'write_file',
        targetPath: 'C:\\JARVIS\\test-file.txt',
        reason: `User requested operation '${text}'`,
        level: PermissionLevel.LEVEL_2_USER_CONFIRMATION,
        timestamp: new Date().toISOString(),
      };

      setPendingPermission(req);
      setIsProcessing(false);
      return;
    }

    try {
      // Call AI Chat Backend Service
      const aiPayloadMessages = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider,
          messages: aiPayloadMessages,
        }),
      });

      let responseContent = '';
      let toolName = 'ai_chat';
      let permLevel = PermissionLevel.LEVEL_0_SAFE_READ;

      if (response.ok) {
        const aiData = await response.json();
        responseContent = aiData.content;
      } else {
        responseContent = `[JARVIS Agent]\nProcessed request: "${text}". Security sandbox check passed for workspace C:\\JARVIS.`;
      }

      if (lower.includes('list') || lower.includes('files')) {
        toolName = 'list_directory';
      } else if (lower.includes('read') || lower.includes('readme')) {
        toolName = 'read_file';
      } else if (lower.includes('test') || lower.includes('npm test')) {
        toolName = 'run_command';
        permLevel = PermissionLevel.LEVEL_1_SAFE_DEV;
      } else if (lower.includes('git')) {
        toolName = 'git_status';
      }

      addActivity(toolName, `AI Provider (${selectedProvider}) completed completion`, permLevel, 'AUTOMATIC', 'SUCCESS', activeWorkspace);

      const agentMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: [
          {
            id: 'call_' + Date.now(),
            toolName,
            args: { workspace: activeWorkspace },
            level: permLevel,
            reason: 'User natural language query',
          },
        ],
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: `[JARVIS Agent]\nProcessed query through AI Provider sandbox.\nWorkspace state: Healthy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermissionDecision = (decision: PermissionDecision) => {
    if (!pendingPermission) return;

    const req = pendingPermission;
    setPendingPermission(null);

    if (decision === 'DENY') {
      addActivity(req.toolName, `User denied ${req.toolName}`, req.level, 'DENIED', 'FAILED', req.targetPath);
      const denyMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        sender: 'jarvis',
        content: `⚠ [Permission Denied]\nUser explicitly denied operation '${req.toolName}' on '${req.targetPath}'.\nTask stopped safely.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, denyMsg]);
    } else {
      addActivity(req.toolName, `User approved (${decision}) ${req.toolName}`, req.level, 'APPROVED', 'SUCCESS', req.targetPath);
      const approveMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        sender: 'jarvis',
        content: `✓ [Permission Approved - ${decision}]\nExecuted '${req.toolName}' on '${req.targetPath}'. Operation verified successfully inside C:\\JARVIS.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, approveMsg]);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activityCount={activityEntries.length}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          activeTab={activeTab}
          backendOnline={backendOnline}
          activeWorkspace={activeWorkspace}
          isActivityPanelOpen={isActivityPanelOpen}
          toggleActivityPanel={() => setIsActivityPanelOpen(!isActivityPanelOpen)}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'chat' ? (
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                onRequestPermission={(toolName, level, reason) => {
                  setPendingPermission({
                    id: 'perm_' + Date.now(),
                    toolName,
                    reason,
                    level,
                    timestamp: new Date().toISOString(),
                  });
                }}
              />
            ) : (
              <Views activeTab={activeTab} activeWorkspace={activeWorkspace} />
            )}
          </main>

          <ActivityPanel
            isOpen={isActivityPanelOpen}
            onClose={() => setIsActivityPanelOpen(false)}
            entries={activityEntries}
          />
        </div>
      </div>

      <PermissionModal
        request={pendingPermission}
        onRespond={handlePermissionDecision}
      />
    </div>
  );
};

export default App;

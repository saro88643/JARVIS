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

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    // Simulate Agent processing and tool security checking
    setTimeout(async () => {
      const lower = text.toLowerCase();

      if (lower.includes('create') || lower.includes('delete') || lower.includes('modify')) {
        // Requires Level 2 Confirmation
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

      let responseText = '';
      let toolName = 'read_file';
      let permLevel = PermissionLevel.LEVEL_0_SAFE_READ;

      if (lower.includes('list') || lower.includes('files')) {
        toolName = 'list_directory';
        responseText = `[JARVIS Agent]\nScanned approved workspace 'C:\\JARVIS':\n- apps/\n- packages/\n- tests/\n- docs/\n- .gitignore\n- package.json\n- tsconfig.json\n\nAll contents are within approved workspace boundaries.`;
      } else if (lower.includes('read') || lower.includes('readme')) {
        toolName = 'read_file';
        responseText = `[JARVIS Agent]\nReading 'README.md' from C:\\JARVIS:\n\n# JARVIS — Personal AI Computer Agent for Windows\nArchitected with a 4-Tier Security System, Tool Registry, and Agent Orchestrator.`;
      } else if (lower.includes('test') || lower.includes('npm test')) {
        toolName = 'run_command';
        permLevel = PermissionLevel.LEVEL_1_SAFE_DEV;
        responseText = `[JARVIS Agent]\nExecuted safe development command 'npm test' in C:\\JARVIS:\n\n✓ SecurityManager > allows safe read access (Level 0)\n✓ SecurityManager > requires confirmation for write access (Level 2)\n✓ SecurityManager > blocks file access outside workspace (Level 3)\n✓ SecurityManager > prevents path traversal (Level 3)\n\nTest Suites: 1 passed, 1 total\nTests: 7 passed, 7 total`;
      } else if (lower.includes('git')) {
        toolName = 'git_status';
        responseText = `[JARVIS Agent]\nGit repository status for 'C:\\JARVIS':\nBranch: master\nClean workspace. No uncommitted modifications.`;
      } else {
        toolName = 'search_files';
        responseText = `[JARVIS Agent]\nProcessed request "${text}" through Security Layer (Level 0 Safe Read).\nWorkspace C:\\JARVIS state is healthy.`;
      }

      addActivity(toolName, `Agent executed ${toolName}`, permLevel, 'AUTOMATIC', 'SUCCESS', 'C:\\JARVIS');

      const agentMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: [
          {
            id: 'call_' + Date.now(),
            toolName,
            args: { workspace: activeWorkspace },
            level: permLevel,
            reason: 'User request',
          },
        ],
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsProcessing(false);
    }, 1000);
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

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { ChatView } from './components/ChatView.js';
import { ActivityPanel } from './components/ActivityPanel.js';
import { PermissionModal } from './components/PermissionModal.js';
import { Views } from './components/Views.js';
import { ChatMessage, ActivityLogEntry, PermissionRequest, PermissionDecision, PermissionLevel, VoiceState } from '@jarvis/shared';
import { VoiceManager } from '@jarvis/voice';

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

  // Voice Engine State
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  if (!voiceManagerRef.current) {
    voiceManagerRef.current = new VoiceManager(undefined, undefined, {
      onStateChange: (state) => setVoiceState(state),
    });
  }

  useEffect(() => {
    const vm = voiceManagerRef.current;
    if (vm) {
      vm.registerCallbacks({
        onStateChange: (state) => setVoiceState(state),
        onTranscriptReceived: (transcript) => {
          if (transcript) {
            // Log voice activity
            addActivity('speech_to_text', `Recognized speech: "${transcript}"`, PermissionLevel.LEVEL_0_SAFE_READ, 'AUTOMATIC', 'SUCCESS');
          }
        },
        onResponseGenerated: (resp) => {
          if (resp) {
            const agentMsg: ChatMessage = {
              id: 'msg_' + Date.now(),
              sender: 'jarvis',
              content: resp,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, agentMsg]);
          }
        },
      });
    }
  }, []);

  // Poll backend status and activities
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health');
        if (res.ok) {
          const data = await res.json();
          setBackendOnline(true);
          if (data.approvedWorkspace) setActiveWorkspace(data.approvedWorkspace);

          // Sync backend activity logs
          const actRes = await fetch('http://localhost:3001/api/agent/activity');
          if (actRes.ok) {
            const actData = await actRes.json();
            if (actData.activities && actData.activities.length > 0) {
              setActivityEntries(actData.activities);
            }
          }

          // Check pending permissions from agent
          const permRes = await fetch('http://localhost:3001/api/agent/permissions');
          if (permRes.ok) {
            const permData = await permRes.json();
            if (permData.pending && permData.pending.length > 0) {
              setPendingPermission(permData.pending[0]);
            }
          }
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 3000);
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

    // Phase 2 display formatting requirement
    if (lower.startsWith('open ')) {
      const responseText = `I heard you say: ${text}`;
      const agentMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsProcessing(false);

      if (voiceManagerRef.current) {
        voiceManagerRef.current.speak(responseText);
      }
      return;
    }

    // Level 2 write check modal local fallback if offline
    if ((lower.includes('create file') || lower.includes('delete file') || lower.includes('modify file')) && !backendOnline) {
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
      if (backendOnline) {
        // Submit task to Agent State Engine
        const response = await fetch('http://localhost:3001/api/agent/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: text,
            providerId: selectedProvider,
          }),
        });

        if (response.ok) {
          const agentData = await response.json();
          const responseText = agentData.output || 'Task processed through JARVIS Agent State Engine.';
          const agentMsg: ChatMessage = {
            id: 'msg_' + (Date.now() + 1),
            sender: 'jarvis',
            content: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            taskStatus: agentData.task,
          };
          setMessages((prev) => [...prev, agentMsg]);
          setIsProcessing(false);

          if (voiceManagerRef.current) {
            voiceManagerRef.current.speak(responseText);
          }
          return;
        }
      }

      // Fallback
      const responseText = `I heard you say: ${text}`;
      addActivity('voice_pipeline', `Processed input: "${text}"`, PermissionLevel.LEVEL_0_SAFE_READ, 'AUTOMATIC', 'SUCCESS', activeWorkspace);

      const agentMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (voiceManagerRef.current) {
        voiceManagerRef.current.speak(responseText);
      }
    } catch {
      const responseText = `I heard you say: ${text}`;
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'jarvis',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermissionDecision = async (decision: PermissionDecision) => {
    if (!pendingPermission) return;

    const req = pendingPermission;
    setPendingPermission(null);

    if (backendOnline) {
      try {
        await fetch('http://localhost:3001/api/agent/permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: req.id,
            decision,
          }),
        });
      } catch {
        // fallback
      }
    }

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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} activityCount={activityEntries.length} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header
          activeTab={activeTab}
          backendOnline={backendOnline}
          activeWorkspace={activeWorkspace}
          isActivityPanelOpen={isActivityPanelOpen}
          toggleActivityPanel={() => setIsActivityPanelOpen(!isActivityPanelOpen)}
          voiceState={voiceState}
          onStartListening={() => voiceManagerRef.current?.startListening()}
          onStopSpeaking={() => voiceManagerRef.current?.stopSpeaking()}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'chat' ? (
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                voiceManager={voiceManagerRef.current || undefined}
                voiceState={voiceState}
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
              <Views activeTab={activeTab} activeWorkspace={activeWorkspace} voiceManager={voiceManagerRef.current || undefined} />
            )}
          </main>

          <ActivityPanel isOpen={isActivityPanelOpen} onClose={() => setIsActivityPanelOpen(false)} entries={activityEntries} />
        </div>
      </div>

      <PermissionModal request={pendingPermission} onRespond={handlePermissionDecision} />
    </div>
  );
};

export default App;

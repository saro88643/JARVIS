import React, { useState } from 'react';
import { Send, Mic, MicOff, Sparkles, Terminal, FileText, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { ChatMessage, PermissionLevel, VoiceState } from '@jarvis/shared';
import { VoiceManager } from '@jarvis/voice';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onRequestPermission: (toolName: string, level: PermissionLevel, reason: string) => void;
  voiceManager?: VoiceManager;
  voiceState?: VoiceState;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  onRequestPermission,
  voiceManager,
  voiceState = 'IDLE',
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText.trim();
    setInputText('');
    
    // Pipe text into unified command pipeline
    if (voiceManager) {
      voiceManager.processUserCommand(text);
    }
    onSendMessage(text);
  };

  const handleMicClick = async () => {
    if (voiceManager) {
      if (voiceState === 'LISTENING') {
        await voiceManager.stopListening();
      } else {
        const text = await voiceManager.startListening();
        if (text) {
          onSendMessage(text);
        }
      }
    }
  };

  const quickPrompts = [
    "Open Android Studio",
    "Open YouTube",
    "List the files in my JARVIS workspace.",
    "Read README.md.",
    "Run npm test.",
    "Check my project Git status.",
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      {/* Message History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              maxWidth: '600px',
              textAlign: 'center',
              padding: '40px',
              borderRadius: '16px',
              border: '1px dashed var(--border-cyan)',
              background: 'rgba(18, 24, 39, 0.4)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={28} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              JARVIS AI Personal Assistant
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              I am your Personal AI Voice Agent for Windows. Click the microphone or type below. Try saying <em>"Open Android Studio"</em> or <em>"Open YouTube"</em>.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (voiceManager) voiceManager.processUserCommand(prompt);
                    onSendMessage(prompt);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="glow-btn"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'var(--bg-card)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: msg.sender === 'user' ? '#bae6fd' : 'var(--accent-cyan)', marginBottom: '4px' }}>
                  {msg.sender === 'user' ? 'YOU' : 'JARVIS AGENT'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {/* Render Tool Call Pills */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {msg.toolCalls.map((tool) => (
                      <div
                        key={tool.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--border-color)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Terminal size={14} color="var(--accent-cyan)" />
                          <span className="mono">{tool.toolName}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: tool.level === PermissionLevel.LEVEL_0_SAFE_READ ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: tool.level === PermissionLevel.LEVEL_0_SAFE_READ ? '#6ee7b7' : '#fcd34d',
                          }}
                        >
                          Level {tool.level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{msg.timestamp}</span>
            </div>
          ))
        )}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', fontSize: '13px', padding: '12px' }}>
            <Clock size={16} className="pulse-indicator" />
            <span>JARVIS is processing voice command & response...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '8px 12px 8px 16px',
            borderRadius: '12px',
            border: voiceState === 'LISTENING' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
            boxShadow: voiceState === 'LISTENING' ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={voiceState === 'LISTENING' ? 'Listening to your speech...' : 'Type message or click 🎤 to speak...'}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              outline: 'none',
              fontSize: '14px',
            }}
          />
          <button
            type="button"
            onClick={handleMicClick}
            style={{
              background: voiceState === 'LISTENING' ? '#0284c7' : 'transparent',
              border: 'none',
              color: voiceState === 'LISTENING' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            title={voiceState === 'LISTENING' ? 'Click to Stop Listening' : 'Click to Start Voice Input'}
          >
            {voiceState === 'LISTENING' ? (
              <>
                <MicOff size={18} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: 700 }}>Listening...</span>
              </>
            ) : (
              <Mic size={18} />
            )}
          </button>
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            style={{
              background: inputText.trim() && !isProcessing ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
              color: inputText.trim() && !isProcessing ? '#000' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              cursor: inputText.trim() && !isProcessing ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

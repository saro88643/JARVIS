import React from 'react';
import { Cpu, Activity, FolderCheck, CheckCircle2, AlertCircle, Mic, Volume2, Square } from 'lucide-react';
import { NavTab } from './Sidebar.js';
import { VoiceState } from '@jarvis/shared';

interface HeaderProps {
  activeTab: NavTab;
  backendOnline: boolean;
  activeWorkspace: string;
  isActivityPanelOpen: boolean;
  toggleActivityPanel: () => void;
  voiceState?: VoiceState;
  onStopSpeaking?: () => void;
  onStartListening?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  backendOnline,
  activeWorkspace,
  isActivityPanelOpen,
  toggleActivityPanel,
  voiceState = 'IDLE',
  onStopSpeaking,
  onStartListening,
}) => {
  const getVoiceBadgeStyle = () => {
    switch (voiceState) {
      case 'LISTENING':
        return { bg: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', label: '🎙 Listening...' };
      case 'PROCESSING':
        return { bg: 'rgba(168, 85, 247, 0.2)', border: '1px solid #c084fc', color: '#c084fc', label: '◌ Thinking...' };
      case 'SPEAKING':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: '1px solid #4ade80', color: '#4ade80', label: '🔊 Speaking...' };
      case 'ERROR':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '1px solid #f87171', color: '#f87171', label: '⚠ Voice Unavailable' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#94a3b8', label: '● Voice Ready' };
    }
  };

  const badge = getVoiceBadgeStyle();

  return (
    <header
      style={{
        height: '60px',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Title & Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
          {activeTab}
        </h2>
        <span style={{ color: 'var(--border-color)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <FolderCheck size={14} color="var(--accent-cyan)" />
          <span className="mono">{activeWorkspace}</span>
        </div>
      </div>

      {/* Status Indicators & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Voice State Badge */}
        <div
          onClick={voiceState === 'IDLE' && onStartListening ? onStartListening : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '16px',
            background: badge.bg,
            border: badge.border,
            fontSize: '11px',
            color: badge.color,
            fontWeight: 700,
            cursor: voiceState === 'IDLE' ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          title={voiceState === 'IDLE' ? 'Click to Start Voice Input' : voiceState}
        >
          <span>{badge.label}</span>
        </div>

        {/* STOP SPEAKING Button */}
        {voiceState === 'SPEAKING' && onStopSpeaking && (
          <button
            onClick={onStopSpeaking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Square size={10} fill="#f87171" />
            <span>STOP SPEAKING</span>
          </button>
        )}

        {/* Model Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '11px',
            color: '#a5b4fc',
            fontWeight: 500,
          }}
        >
          <Cpu size={13} color="#818cf8" />
          <span>Gemini 2.5 Flash</span>
        </div>

        {/* Backend Online Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: backendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: backendOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
            fontSize: '11px',
            color: backendOnline ? '#6ee7b7' : '#fda4af',
            fontWeight: 500,
          }}
        >
          {backendOnline ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{backendOnline ? 'Backend Online' : 'Connecting...'}</span>
        </div>

        {/* Toggle Activity Drawer */}
        <button
          onClick={toggleActivityPanel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: isActivityPanelOpen ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: isActivityPanelOpen ? '#000' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={14} />
          <span>Activity Log</span>
        </button>
      </div>
    </header>
  );
};

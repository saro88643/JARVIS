import React from 'react';
import { ShieldAlert, Cpu, Activity, FolderCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavTab } from './Sidebar.js';

interface HeaderProps {
  activeTab: NavTab;
  backendOnline: boolean;
  activeWorkspace: string;
  isActivityPanelOpen: boolean;
  toggleActivityPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  backendOnline,
  activeWorkspace,
  isActivityPanelOpen,
  toggleActivityPanel,
}) => {
  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Model Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '16px',
          background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: '11px', color: '#a5b4fc', fontWeight: 500
        }}>
          <Cpu size={13} color="#818cf8" />
          <span>Gemini 2.5 Flash</span>
        </div>

        {/* Backend Online Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '16px',
          background: backendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: backendOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
          fontSize: '11px', color: backendOnline ? '#6ee7b7' : '#fda4af', fontWeight: 500
        }}>
          {backendOnline ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{backendOnline ? 'Backend Online' : 'Connecting...'}</span>
        </div>

        {/* Toggle Activity Drawer */}
        <button
          onClick={toggleActivityPanel}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '6px',
            background: isActivityPanelOpen ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: isActivityPanelOpen ? '#000' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            transition: 'all 0.15s ease'
          }}
        >
          <Activity size={14} />
          <span>Activity Log</span>
        </button>
      </div>
    </header>
  );
};

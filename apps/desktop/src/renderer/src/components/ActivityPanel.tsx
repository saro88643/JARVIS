import React from 'react';
import { X, Activity, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Terminal } from 'lucide-react';
import { ActivityLogEntry, PermissionLevel } from '@jarvis/shared';

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ActivityLogEntry[];
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ isOpen, onClose, entries }) => {
  if (!isOpen) return null;

  return (
    <aside style={{
      width: '320px', height: 'calc(100vh - 60px)', borderLeft: '1px solid var(--border-color)',
      background: 'var(--bg-main)', display: 'flex', flexDirection: 'column'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Activity & Audit Log</h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Audit Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
            No recent activity logged yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '12px', borderRadius: '8px', background: 'var(--bg-card)',
                border: '1px solid var(--border-color)', fontSize: '12px',
                display: 'flex', flexDirection: 'column', gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{entry.toolName}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{entry.timestamp.split('T')[1]?.slice(0, 8)}</span>
              </div>
              <div style={{ color: 'var(--text-main)' }}>{entry.action}</div>
              {entry.target && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">
                  Target: {entry.target}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: entry.permissionLevel === PermissionLevel.LEVEL_0_SAFE_READ ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: entry.permissionLevel === PermissionLevel.LEVEL_0_SAFE_READ ? '#6ee7b7' : '#fcd34d'
                }}>
                  Level {entry.permissionLevel} ({entry.permissionStatus})
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  color: entry.status === 'SUCCESS' ? '#6ee7b7' : entry.status === 'FAILED' ? '#fda4af' : '#fcd34d'
                }}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

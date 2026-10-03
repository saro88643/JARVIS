import React from 'react';
import { ShieldAlert, AlertTriangle, FileCode, Check, X, ShieldCheck } from 'lucide-react';
import { PermissionRequest, PermissionDecision } from '@jarvis/shared';

interface PermissionModalProps {
  request: PermissionRequest | null;
  onRespond: (decision: PermissionDecision) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ request, onRespond }) => {
  if (!request) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '520px', borderRadius: '16px',
        background: '#121827', border: '1px solid var(--accent-amber)',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px', background: 'rgba(245, 158, 11, 0.15)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <ShieldAlert size={24} color="var(--accent-amber)" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>User Confirmation Required</h3>
            <span style={{ fontSize: '11px', color: '#fcd34d' }}>LEVEL 2 PERMISSION EVALUATION</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Action Request:</span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
              JARVIS wants to execute: <code className="mono" style={{ color: 'var(--accent-cyan)' }}>{request.toolName}</code>
            </div>
          </div>

          {request.targetPath && (
            <div style={{
              padding: '12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-color)', fontSize: '12px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target File / Directory:</span>
              <div className="mono" style={{ color: '#fff', marginTop: '4px', wordBreak: 'break-all' }}>
                {request.targetPath}
              </div>
            </div>
          )}

          {request.command && (
            <div style={{
              padding: '12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-color)', fontSize: '12px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Command:</span>
              <div className="mono" style={{ color: '#6ee7b7', marginTop: '4px' }}>
                {request.command}
              </div>
            </div>
          )}

          <div style={{
            padding: '12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '13px', color: '#bae6fd'
          }}>
            <strong>Reason:</strong> {request.reason}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{
          padding: '16px 24px', background: 'var(--bg-main)', borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px'
        }}>
          <button
            onClick={() => onRespond('DENY')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--accent-rose)',
              background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', fontWeight: 600,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            Deny
          </button>
          <button
            onClick={() => onRespond('ALLOW_FOR_PROJECT')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 500,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            Allow for Project
          </button>
          <button
            onClick={() => onRespond('ALLOW_ONCE')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              background: 'var(--accent-cyan)', color: '#000', fontWeight: 700,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease'
            }}
            className="glow-btn"
          >
            Allow Once
          </button>
        </div>
      </div>
    </div>
  );
};

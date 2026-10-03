import React from 'react';
import { 
  FolderGit2, 
  ListTodo, 
  BrainCircuit, 
  Database, 
  Wrench, 
  ShieldCheck, 
  Settings,
  Plus,
  CheckCircle2,
  HardDrive,
  FileCode2,
  Lock
} from 'lucide-react';
import { NavTab } from './Sidebar.js';

interface ViewsProps {
  activeTab: NavTab;
  activeWorkspace: string;
}

export const Views: React.FC<ViewsProps> = ({ activeTab, activeWorkspace }) => {
  switch (activeTab) {
    case 'projects':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Approved Projects & Workspaces</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                JARVIS only accesses directories approved by you.
              </p>
            </div>
            <button style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: 'var(--accent-cyan)', color: '#000', fontWeight: 600,
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}>
              <Plus size={16} />
              <span>Approve New Directory</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            <div className="glass-panel-cyan" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FolderGit2 size={20} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>JARVIS Core</span>
                </div>
                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  ACTIVE WORKSPACE
                </span>
              </div>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeWorkspace}
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-dim)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <span>Git: Master</span>
                <span>Type: Monorepo</span>
                <span>Permission: L0-L2</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'tasks':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Agent Task State Engine</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Active agent executions, steps, and observation logs.
          </p>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <ListTodo size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-cyan)' }} />
            <p>No agent tasks currently in progress.</p>
          </div>
        </div>
      );

    case 'memory':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Long-Term & Short-Term Memory</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            SQLite persistent memory store for developer preferences and project architecture.
          </p>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
              <BrainCircuit size={20} />
              <strong style={{ color: '#fff' }}>Stored Preferences & Context</strong>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Primary Language: TypeScript / React</li>
              <li>Approved Root Path: <code className="mono">C:\JARVIS</code></li>
              <li>Security Mode: Strict Least-Privilege</li>
              <li>Secrets Guard: Excluded from memory & vectors</li>
            </ul>
          </div>
        </div>
      );

    case 'rag':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>RAG Codebase Knowledge Vector Index</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Semantic index of project files excluding secrets, node_modules, and binary assets.
          </p>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={20} color="var(--accent-cyan)" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Local Vector DB</span>
              </div>
              <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                Re-Index Codebase
              </button>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Status: Ready to index <code className="mono">C:\JARVIS</code> files upon first agent codebase request.
            </div>
          </div>
        </div>
      );

    case 'tools':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Registered Tool Registry</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Every tool is validated by the Security Sandwich before execution.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { name: 'read_file', level: 'Level 0 (Safe Read)', desc: 'Reads contents of approved workspace files' },
              { name: 'list_directory', level: 'Level 0 (Safe Read)', desc: 'Lists files and folders inside approved directories' },
              { name: 'search_files', level: 'Level 0 (Safe Read)', desc: 'Performs text/regex search across project files' },
              { name: 'run_command', level: 'Level 1-2 (Dev/Prompt)', desc: 'Executes validated shell commands with timeout' },
              { name: 'write_file', level: 'Level 2 (Confirmation)', desc: 'Creates or updates approved project files' },
              { name: 'git_status', level: 'Level 0 (Safe Read)', desc: 'Inspects Git status and uncommitted changes' },
              { name: 'git_commit', level: 'Level 2 (Confirmation)', desc: 'Commits staged project changes with message' },
            ].map((tool, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{tool.name}</span>
                  <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>
                    {tool.level}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'security':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Security & Permission Level Matrix</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            The 4-tier security system guarding your laptop from uncontrolled execution.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { level: 'Level 0 — Safe Read', color: '#10b981', desc: 'Read files inside approved project directories, search logs, read Git status.' },
              { level: 'Level 1 — Safe Development', color: '#3b82f6', desc: 'npm install, npm test, npm run dev/build inside approved directories.' },
              { level: 'Level 2 — User Confirmation', color: '#f59e0b', desc: 'File creation/modification/deletion, Git commit/push, arbitrary shell commands.' },
              { level: 'Level 3 — Blocked', color: '#f43f5e', desc: 'System directory access (C:\\Windows, System32), registry edits, format drives, credential theft.' },
            ].map((tier, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px', borderRadius: '10px', borderLeft: `4px solid ${tier.color}` }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: tier.color, marginBottom: '4px' }}>{tier.level}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tier.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'settings':
      return (
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>JARVIS Agent Settings</h2>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                AI Provider Interface
              </label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}>
                <option>Google Gemini Provider (gemini-2.5-flash)</option>
                <option>OpenAI Provider (gpt-4o)</option>
                <option>Local / Ollama Provider (llama3)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Approved Workspace Root
              </label>
              <input type="text" readOnly value={activeWorkspace} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} className="mono" />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

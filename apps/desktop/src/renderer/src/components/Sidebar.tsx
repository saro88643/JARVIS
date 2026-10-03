import React from 'react';
import { 
  MessageSquare, 
  FolderGit2, 
  ListTodo, 
  BrainCircuit, 
  Database, 
  Wrench, 
  Activity, 
  ShieldCheck, 
  Settings,
  Bot
} from 'lucide-react';

export type NavTab = 'chat' | 'projects' | 'tasks' | 'memory' | 'rag' | 'tools' | 'activity' | 'security' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activityCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activityCount }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo size={18} /> },
    { id: 'memory', label: 'Memory', icon: <BrainCircuit size={18} /> },
    { id: 'rag', label: 'RAG Knowledge', icon: <Database size={18} /> },
    { id: 'tools', label: 'Tools', icon: <Wrench size={18} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={18} />, badge: activityCount },
    { id: 'security', label: 'Permissions', icon: <ShieldCheck size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside style={{ width: '240px', display: 'flex', flexDirection: 'column', height: '100vh' }} className="glass-panel">
      {/* Brand Header */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
        }}>
          <Bot size={22} color="#000" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>JARVIS</h1>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 500 }}>AI AGENT OS v0.1</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span style={{
                    background: 'var(--accent-cyan)', color: '#000', fontSize: '10px',
                    fontWeight: 700, borderRadius: '10px', padding: '2px 6px'
                  }}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Security Status Footnote */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Security Sandwich Active</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
          Workspace: <code className="mono">C:\JARVIS</code>
        </div>
      </div>
    </aside>
  );
};

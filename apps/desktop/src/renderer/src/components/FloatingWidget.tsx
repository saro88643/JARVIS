import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Maximize2, Shield, Power } from 'lucide-react';

export const FloatingWidget: React.FC = () => {
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(true);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');

  useEffect(() => {
    // Check initial status from electron API if available
    if (window.jarvisApi?.getAgentStatus) {
      window.jarvisApi.getAgentStatus().then((status: boolean) => setIsAgentRunning(status));
    }
    if (window.jarvisApi?.onAgentStatusChange) {
      const cleanup = window.jarvisApi.onAgentStatusChange((status: boolean) => setIsAgentRunning(status));
      return cleanup;
    }
  }, []);

  const handleToggleAgent = async () => {
    if (window.jarvisApi?.toggleAgentStatus) {
      const newStatus = await window.jarvisApi.toggleAgentStatus();
      setIsAgentRunning(newStatus);
    } else {
      setIsAgentRunning(!isAgentRunning);
    }
  };

  const handleExpandStudio = () => {
    if (window.jarvisApi?.toggleMainWindow) {
      window.jarvisApi.toggleMainWindow();
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        userSelect: 'none',
        WebkitAppRegion: 'drag' as any,
      }}
    >
      <div
        style={{
          width: '240px',
          height: '56px',
          backgroundColor: 'rgba(13, 17, 23, 0.92)',
          backdropFilter: 'blur(16px)',
          border: isAgentRunning ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '28px',
          boxShadow: isAgentRunning
            ? '0 0 20px rgba(56, 189, 248, 0.25), 0 8px 32px rgba(0, 0, 0, 0.6)'
            : '0 0 15px rgba(239, 68, 68, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '10px',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Floating Indicator Glowing Orb */}
        <div
          onClick={handleToggleAgent}
          style={{
            WebkitAppRegion: 'no-drag' as any,
            cursor: 'pointer',
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isAgentRunning ? '#0284c7' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAgentRunning ? '0 0 12px #38bdf8' : 'none',
            transition: 'all 0.3s ease',
          }}
          title={isAgentRunning ? 'JARVIS Active (Click to Stop)' : 'JARVIS Stopped (Click to Start)'}
        >
          {isAgentRunning ? (
            <Mic size={16} color="#ffffff" className="animate-pulse" />
          ) : (
            <MicOff size={16} color="#f87171" />
          )}
        </div>

        {/* Text Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>JARVIS</span>
            <span
              style={{
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '8px',
                backgroundColor: isAgentRunning ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isAgentRunning ? '#4ade80' : '#f87171',
                fontWeight: 600,
              }}
            >
              {isAgentRunning ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAgentRunning ? 'Listening for "Hey JARVIS"' : 'Voice agent suspended'}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', WebkitAppRegion: 'no-drag' as any }}>
          <button
            onClick={handleExpandStudio}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            title="Open JARVIS Studio"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingWidget;

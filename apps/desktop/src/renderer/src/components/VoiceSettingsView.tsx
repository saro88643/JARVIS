import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Globe, Shield, Play, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VoiceManager } from '@jarvis/voice';
import { AudioDevice, VoiceSettings } from '@jarvis/shared';

interface VoiceSettingsViewProps {
  voiceManager: VoiceManager;
}

export const VoiceSettingsView: React.FC<VoiceSettingsViewProps> = ({ voiceManager }) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceManager.getSettings());
  const [microphones, setMicrophones] = useState<AudioDevice[]>([]);
  const [speakers, setSpeakers] = useState<AudioDevice[]>([]);
  const [voices, setVoices] = useState<{ uri: string; name: string; lang: string }[]>([]);
  const [testRunning, setTestRunning] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string>('');

  useEffect(() => {
    // Fetch audio devices and TTS voices
    voiceManager.getAvailableAudioDevices().then((res) => {
      setMicrophones(res.microphones);
      setSpeakers(res.speakers);
    });

    const availVoices = voiceManager.getAvailableTTSVoices();
    setVoices(availVoices);

    // Watch for window speechSynthesis voices load
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(voiceManager.getAvailableTTSVoices());
      };
    }
  }, [voiceManager]);

  const handleChange = (key: keyof VoiceSettings, value: any) => {
    const updated = { [key]: value };
    setSettings((prev) => ({ ...prev, ...updated }));
    voiceManager.updateSettings(updated);
  };

  const handleTestVoice = async () => {
    setTestRunning(true);
    setTestStatus('Voice system test started...');
    try {
      await voiceManager.runDeveloperVoiceTest();
      setTestStatus('Test completed successfully.');
    } catch (err: any) {
      setTestStatus(`Test failed: ${err.message || err}`);
    } finally {
      setTimeout(() => setTestRunning(false), 2000);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          Voice Engine Settings & Privacy
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure speech-to-text, text-to-speech, microphone hardware, and privacy controls.
        </p>
      </div>

      {/* Voice Toggle */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
            Enable Voice Engine
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Allows JARVIS to listen to your voice and speak responses aloud.
          </p>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.voiceEnabled}
            onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: settings.voiceEnabled ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              transition: '0.3s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                content: '""',
                height: '18px', width: '18px',
                left: settings.voiceEnabled ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                transition: '0.3s',
              }}
            />
          </span>
        </label>
      </div>

      {/* Hardware Configuration */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={18} color="var(--accent-cyan)" />
          Hardware & Voice Selection
        </h3>

        {/* Microphone Dropdown */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Microphone Device
          </label>
          <select
            value={settings.microphoneId}
            onChange={(e) => handleChange('microphoneId', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            {microphones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label}
              </option>
            ))}
          </select>
        </div>

        {/* Speaker Dropdown */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Speaker Output Device
          </label>
          <select
            value={settings.speakerId}
            onChange={(e) => handleChange('speakerId', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            {speakers.map((spk) => (
              <option key={spk.deviceId} value={spk.deviceId}>
                {spk.label}
              </option>
            ))}
          </select>
        </div>

        {/* Voice URI Dropdown */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Text-to-Speech Voice (Windows SAPI5 / Web Voices)
          </label>
          <select
            value={settings.voiceURI}
            onChange={(e) => handleChange('voiceURI', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            <option value="">System Default Voice</option>
            {voices.map((v) => (
              <option key={v.uri} value={v.uri}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Speech Recognition Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            <option value="en-US">English (United States) - en-US</option>
            <option value="en-GB">English (United Kingdom) - en-GB</option>
            <option value="en-IN">English (India) - en-IN</option>
            <option value="es-ES">Spanish - es-ES</option>
            <option value="fr-FR">French - fr-FR</option>
            <option value="de-DE">German - de-DE</option>
          </select>
        </div>
      </div>

      {/* Speed & Volume Sliders */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={18} color="var(--accent-cyan)" />
          Speech Speed & Volume Controls
        </h3>

        {/* Speed Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Speech Speed (Rate)</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{settings.speechSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speechSpeed}
            onChange={(e) => handleChange('speechSpeed', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        {/* Volume Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Speech Volume</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{Math.round(settings.speechVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={settings.speechVolume}
            onChange={(e) => handleChange('speechVolume', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>
      </div>

      {/* Developer Test & Privacy Status */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--accent-emerald)" />
              Voice Engine Privacy & Developer Test Mode
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Active Provider: <strong>{settings.sttProvider}</strong> / <strong>{settings.ttsProvider}</strong>. Microphone audio is recorded only upon user action and never continuously saved.
            </p>
          </div>

          <button
            onClick={handleTestVoice}
            disabled={testRunning}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: testRunning ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Play size={16} />
            <span>{testRunning ? 'Testing Voice...' : 'Test Voice Engine'}</span>
          </button>
        </div>

        {testStatus && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '12px',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={15} />
            <span>{testStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};

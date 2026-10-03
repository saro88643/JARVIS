import { VoiceState, VoiceSettings, AudioDevice, VoiceLog } from '@jarvis/shared';
import { SpeechToTextProvider } from './interfaces/stt-provider.js';
import { TextToSpeechProvider, VoiceOption } from './interfaces/tts-provider.js';
import { WebSpeechSTTProvider } from './providers/web-speech-stt.js';
import { WebSpeechTTSProvider } from './providers/web-speech-tts.js';

export interface VoiceManagerCallbacks {
  onStateChange?: (state: VoiceState) => void;
  onTranscriptReceived?: (transcript: string) => void;
  onResponseGenerated?: (responseText: string) => void;
  onLogAdded?: (log: VoiceLog) => void;
  onError?: (errorMessage: string) => void;
}

export class VoiceManager {
  private state: VoiceState = 'IDLE';
  private sttProvider: SpeechToTextProvider;
  private ttsProvider: TextToSpeechProvider;
  private callbacks: VoiceManagerCallbacks = {};

  private settings: VoiceSettings = {
    microphoneId: 'default',
    speakerId: 'default',
    voiceURI: '',
    speechSpeed: 1.0,
    speechVolume: 1.0,
    language: 'en-US',
    voiceEnabled: true,
    sttProvider: 'Web Speech STT',
    ttsProvider: 'Web Speech TTS',
  };

  private logs: VoiceLog[] = [];

  constructor(
    sttProvider?: SpeechToTextProvider,
    ttsProvider?: TextToSpeechProvider,
    callbacks?: VoiceManagerCallbacks
  ) {
    this.sttProvider = sttProvider || new WebSpeechSTTProvider();
    this.ttsProvider = ttsProvider || new WebSpeechTTSProvider();
    if (callbacks) this.callbacks = callbacks;

    this.loadSettings();
    this.addLog('info', 'VoiceManager initialized', `STT: ${this.sttProvider.getName()}, TTS: ${this.ttsProvider.getName()}`);
  }

  public registerCallbacks(callbacks: VoiceManagerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public getState(): VoiceState {
    return this.state;
  }

  private setState(newState: VoiceState) {
    if (this.state !== newState) {
      this.state = newState;
      this.addLog('info', `Voice state transitioned to ${newState}`);
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.addLog('info', 'Voice settings updated');
  }

  private loadSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_voice_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.settings = { ...this.settings, ...parsed };
        }
      } catch {
        // Fallback to default
      }
    }
  }

  private saveSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('jarvis_voice_settings', JSON.stringify(this.settings));
      } catch {
        // Fallback
      }
    }
  }

  public getLogs(): VoiceLog[] {
    return [...this.logs];
  }

  private addLog(level: 'info' | 'warn' | 'error', event: string, details?: string) {
    const entry: VoiceLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      level,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    if (this.callbacks.onLogAdded) {
      this.callbacks.onLogAdded(entry);
    }
  }

  public async getAvailableAudioDevices(): Promise<{ microphones: AudioDevice[]; speakers: AudioDevice[] }> {
    const microphones: AudioDevice[] = [];
    const speakers: AudioDevice[] = [];

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        devices.forEach((d, idx) => {
          const label = d.label || `${d.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${idx + 1}`;
          if (d.kind === 'audioinput') {
            microphones.push({ deviceId: d.deviceId || `mic_${idx}`, label, kind: 'audioinput' });
          } else if (d.kind === 'audiooutput') {
            speakers.push({ deviceId: d.deviceId || `speaker_${idx}`, label, kind: 'audiooutput' });
          }
        });
      } catch (err: any) {
        this.addLog('warn', 'Failed to enumerate audio devices', err.message);
      }
    }

    if (microphones.length === 0) {
      microphones.push({ deviceId: 'default', label: 'Default System Microphone', kind: 'audioinput' });
    }
    if (speakers.length === 0) {
      speakers.push({ deviceId: 'default', label: 'Default System Speaker', kind: 'audiooutput' });
    }

    return { microphones, speakers };
  }

  public getAvailableTTSVoices(): VoiceOption[] {
    return this.ttsProvider.getAvailableVoices();
  }

  /**
   * Start listening via STT
   */
  public async startListening(): Promise<string> {
    if (!this.settings.voiceEnabled) {
      this.setState('ERROR');
      const msg = 'Voice engine is currently disabled in settings.';
      this.addLog('error', 'Voice disabled', msg);
      if (this.callbacks.onError) this.callbacks.onError(msg);
      return '';
    }

    this.setState('LISTENING');
    this.addLog('info', 'voice session started', 'Microphone active');

    try {
      const transcript = await this.sttProvider.startListening((partialText) => {
        if (this.callbacks.onTranscriptReceived) {
          this.callbacks.onTranscriptReceived(partialText);
        }
      });

      this.addLog('info', 'voice session stopped', `Recognized length: ${transcript.length}`);

      if (!transcript || transcript.trim() === '') {
        this.setState('IDLE');
        const emptyMsg = "I couldn't hear anything. Please try again.";
        this.addLog('warn', 'transcription empty', emptyMsg);
        if (this.callbacks.onError) this.callbacks.onError(emptyMsg);
        return '';
      }

      this.addLog('info', 'transcription success');
      if (this.callbacks.onTranscriptReceived) {
        this.callbacks.onTranscriptReceived(transcript);
      }

      // Automatically pipeline into JARVIS Core Command Pipeline
      await this.processUserCommand(transcript);
      return transcript;
    } catch (err: any) {
      this.setState('ERROR');
      const errDetail = err.message || 'Speech recognition failed';
      this.addLog('error', 'transcription failure', errDetail);
      if (this.callbacks.onError) this.callbacks.onError(errDetail);
      return '';
    }
  }

  /**
   * Manual stop listening
   */
  public async stopListening(): Promise<string> {
    try {
      const transcript = await this.sttProvider.stopListening();
      this.addLog('info', 'voice session manually stopped');
      return transcript;
    } catch (err: any) {
      this.addLog('error', 'error stopping listening', err.message);
      return '';
    }
  }

  /**
   * Unified JARVIS Command Pipeline (Voice & Text both enter here!)
   */
  public async processUserCommand(textCommand: string): Promise<string> {
    if (!textCommand || !textCommand.trim()) return '';

    this.setState('PROCESSING');
    this.addLog('info', 'Command pipeline processing', `Command: "${textCommand}"`);

    // Standard Phase 2 Safe Response formatting
    const responseText = `I heard you say: ${textCommand.trim()}`;

    if (this.callbacks.onResponseGenerated) {
      this.callbacks.onResponseGenerated(responseText);
    }

    // Speak response if voice enabled
    if (this.settings.voiceEnabled && this.ttsProvider.isAvailable()) {
      await this.speak(responseText);
    } else {
      this.setState('IDLE');
    }

    return responseText;
  }

  /**
   * Speak text via TTS Provider
   */
  public async speak(text: string): Promise<void> {
    if (!text || !text.trim()) return;

    this.setState('SPEAKING');
    this.addLog('info', 'TTS started', `Speaking length: ${text.length}`);

    try {
      await this.ttsProvider.speak(text, {
        voiceURI: this.settings.voiceURI,
        rate: this.settings.speechSpeed,
        volume: this.settings.speechVolume,
        lang: this.settings.language,
      });

      this.addLog('info', 'TTS stopped', 'Completed cleanly');
      this.setState('IDLE');
    } catch (err: any) {
      this.setState('ERROR');
      const errDetail = err.message || 'TTS failure';
      this.addLog('error', 'provider errors', errDetail);
      if (this.callbacks.onError) this.callbacks.onError(errDetail);
    }
  }

  /**
   * Immediately interrupt / stop JARVIS speaking
   */
  public stopSpeaking(): void {
    this.ttsProvider.stop();
    this.addLog('info', 'STOP SPEAKING triggered', 'Speech canceled by user interruption');
    this.setState('IDLE');
  }

  /**
   * Developer Test Mode ("Test Voice")
   */
  public async runDeveloperVoiceTest(): Promise<void> {
    this.addLog('info', 'Developer voice test started');
    
    // 1. Announce test start
    await this.speak('Voice system test started.');

    // 2. Start listening
    await this.startListening();
  }
}

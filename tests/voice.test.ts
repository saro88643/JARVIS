import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VoiceManager, WebSpeechSTTProvider, WebSpeechTTSProvider } from '../packages/voice/src/index.js';
import { VoiceState } from '../packages/shared/src/types.js';

describe('VoiceManager Engine (Phase 2)', () => {
  let manager: VoiceManager;
  let statesObserved: VoiceState[];

  beforeEach(() => {
    statesObserved = [];
    manager = new VoiceManager(new WebSpeechSTTProvider(), new WebSpeechTTSProvider(), {
      onStateChange: (state) => statesObserved.push(state),
    });
  });

  it('initializes in IDLE state with default settings', () => {
    expect(manager.getState()).toBe('IDLE');
    const settings = manager.getSettings();
    expect(settings.voiceEnabled).toBe(true);
    expect(settings.language).toBe('en-US');
  });

  it('enumerates available audio devices with fallbacks', async () => {
    const devices = await manager.getAvailableAudioDevices();
    expect(devices.microphones.length).toBeGreaterThan(0);
    expect(devices.speakers.length).toBeGreaterThan(0);
    expect(devices.microphones[0].kind).toBe('audioinput');
    expect(devices.speakers[0].kind).toBe('audiooutput');
  });

  it('updates and persists voice settings', () => {
    manager.updateSettings({ speechSpeed: 1.5, speechVolume: 0.8, language: 'en-GB' });
    const settings = manager.getSettings();
    expect(settings.speechSpeed).toBe(1.5);
    expect(settings.speechVolume).toBe(0.8);
    expect(settings.language).toBe('en-GB');
  });

  it('processes user command through pipeline and formats response', async () => {
    let generatedResponse = '';
    manager.registerCallbacks({
      onResponseGenerated: (resp) => {
        generatedResponse = resp;
      },
    });

    const resp = await manager.processUserCommand('Open Android Studio');
    expect(resp).toBe('I heard you say: Open Android Studio');
    expect(generatedResponse).toBe('I heard you say: Open Android Studio');
  });

  it('handles speech interruption gracefully via stopSpeaking()', () => {
    manager.speak('This is a long sentence being spoken by JARVIS.');
    expect(manager.getState()).toBe('SPEAKING');

    manager.stopSpeaking();
    expect(manager.getState()).toBe('IDLE');
  });

  it('prevents voice activation when voice is disabled in settings', async () => {
    let errorReceived = '';
    manager.registerCallbacks({
      onError: (err) => {
        errorReceived = err;
      },
    });

    manager.updateSettings({ voiceEnabled: false });
    const transcript = await manager.startListening();

    expect(transcript).toBe('');
    expect(manager.getState()).toBe('ERROR');
    expect(errorReceived).toContain('disabled');
  });

  it('executes developer voice test mode cleanly', async () => {
    await manager.runDeveloperVoiceTest();
    expect(['IDLE', 'SPEAKING', 'PROCESSING']).toContain(manager.getState());
  });
});

import { TextToSpeechProvider, VoiceOption } from '../interfaces/tts-provider.js';

export class WebSpeechTTSProvider implements TextToSpeechProvider {
  private currentUtterance: any = null;

  public getName(): string {
    return 'Web Speech TTS';
  }

  public isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public getAvailableVoices(): VoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [
        { uri: 'default-david', name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
        { uri: 'default-zira', name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
      ];
    }

    const voices = window.speechSynthesis.getVoices();
    return voices.map((v) => ({
      uri: v.voiceURI,
      name: v.name,
      lang: v.lang,
    }));
  }

  public speak(
    text: string,
    options?: {
      voiceURI?: string;
      rate?: number;
      volume?: number;
      lang?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        // Fallback for non-browser/test env
        setTimeout(() => resolve(), 50);
        return;
      }

      this.stop(); // Stop any ongoing speech

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options?.rate ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;
        utterance.lang = options?.lang ?? 'en-US';

        if (options?.voiceURI) {
          const voices = window.speechSynthesis.getVoices();
          const selected = voices.find((v) => v.voiceURI === options.voiceURI);
          if (selected) utterance.voice = selected;
        }

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (e) => {
          this.currentUtterance = null;
          if (e.error === 'canceled' || e.error === 'interrupted') {
            resolve();
          } else {
            reject(new Error(`TTS SpeechSynthesis error: ${e.error}`));
          }
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        reject(new Error(`Failed to initialize speech synthesis: ${err.message || err}`));
      }
    });
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }
}

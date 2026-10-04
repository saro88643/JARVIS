import { SpeechToTextProvider } from '../interfaces/stt-provider.js';

export class WebSpeechSTTProvider implements SpeechToTextProvider {
  private recognition: any = null;
  private listeningPromiseResolve: ((text: string) => void) | null = null;
  private listeningPromiseReject: ((err: Error) => void) | null = null;
  private currentTranscript = '';

  public getName(): string {
    return 'Web Speech STT';
  }

  public isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  public startListening(onPartialResult?: (text: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Mock fallback for non-browser/test env
        this.currentTranscript = 'Hello JARVIS';
        setTimeout(() => {
          if (onPartialResult) onPartialResult(this.currentTranscript);
          resolve(this.currentTranscript);
        }, 100);
        return;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        const fallback = typeof window !== 'undefined' ? prompt('Voice recognition fallback. Speak/type your command:') : null;
        if (fallback && onPartialResult) onPartialResult(fallback);
        resolve(fallback || '');
        return;
      }

      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.currentTranscript = '';

        this.listeningPromiseResolve = resolve;
        this.listeningPromiseReject = reject;

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          const combined = (final || interim).trim();
          if (combined) {
            this.currentTranscript = combined;
            if (onPartialResult) onPartialResult(combined);
          }
        };

        this.recognition.onerror = (event: any) => {
          const errorMsg = event.error || 'Speech recognition error';
          if (errorMsg === 'no-speech') {
            if (this.listeningPromiseResolve) {
              this.listeningPromiseResolve('');
              this.listeningPromiseResolve = null;
            }
          } else if (
            errorMsg === 'service-not-allowed' ||
            errorMsg === 'not-allowed' ||
            errorMsg === 'audio-capture' ||
            errorMsg === 'network'
          ) {
            console.warn(`WebSpeech recognition error '${errorMsg}'. Prompting voice command fallback.`);
            const fallback = typeof window !== 'undefined' ? prompt('Voice Input (Service/Media Fallback): Enter command:') : null;
            if (fallback && onPartialResult) onPartialResult(fallback);
            if (this.listeningPromiseResolve) {
              this.listeningPromiseResolve(fallback || '');
              this.listeningPromiseResolve = null;
            }
          } else {
            if (this.listeningPromiseReject) {
              this.listeningPromiseReject(new Error(`Speech recognition error: ${errorMsg}`));
              this.listeningPromiseReject = null;
            }
          }
        };

        this.recognition.onend = () => {
          if (this.listeningPromiseResolve) {
            this.listeningPromiseResolve(this.currentTranscript);
            this.listeningPromiseResolve = null;
          }
        };

        this.recognition.start();
      } catch (err: any) {
        reject(new Error(`Failed to start speech recognition: ${err.message || err}`));
      }
    });
  }

  public stopListening(): Promise<string> {
    return new Promise((resolve) => {
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {
          // Ignore if already stopped
        }
      }
      resolve(this.currentTranscript);
    });
  }

  public cancel(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }
  }
}

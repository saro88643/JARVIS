export interface VoiceOption {
  uri: string;
  name: string;
  lang: string;
}

export interface TextToSpeechProvider {
  getName(): string;
  isAvailable(): boolean;
  getAvailableVoices(): VoiceOption[];
  speak(
    text: string,
    options?: {
      voiceURI?: string;
      rate?: number;
      volume?: number;
      lang?: string;
    }
  ): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
}

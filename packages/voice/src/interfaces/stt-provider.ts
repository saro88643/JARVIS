export interface SpeechToTextProvider {
  getName(): string;
  isAvailable(): boolean;
  startListening(onPartialResult?: (text: string) => void): Promise<string>;
  stopListening(): Promise<string>;
  cancel(): void;
}

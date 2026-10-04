# Voice Engine Documentation (`@jarvis/voice`)

The Voice Engine handles microphone speech recognition (STT) and Windows text-to-speech synthesis (TTS).

## Provider Architecture

```
VoiceManager
   ├── SpeechToTextProvider (WebSpeechSTTProvider)
   └── TextToSpeechProvider (WebSpeechTTSProvider)
```

## Voice States

- `IDLE`: Microphone inactive, ready for voice activation.
- `LISTENING`: Microphone capturing user speech.
- `PROCESSING`: Transcribing speech to text and running command pipeline.
- `SPEAKING`: JARVIS speaking response aloud via Windows SAPI5 voice.
- `ERROR`: Voice service or microphone unavailable.

## Privacy & Safety

- **Event-Driven Recording**: Audio capture occurs only after user click or activation.
- **No Continuous Cloud Streaming**: Raw microphone audio is never uploaded continuously.
- **Interruption Support**: Clicking **STOP SPEAKING** immediately cancels active speech synthesis.

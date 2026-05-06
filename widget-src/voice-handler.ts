type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { [0]: { [0]: { transcript: string } } } }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
};

export class VoiceHandler {
  private recognition: ReturnType<SpeechRecognitionCtor> | null = null;
  private onResult: (text: string) => void;
  private onStart: () => void;
  private onEnd: () => void;

  constructor(opts: {
    onResult: (text: string) => void;
    onStart: () => void;
    onEnd: () => void;
  }) {
    this.onResult = opts.onResult;
    this.onStart = opts.onStart;
    this.onEnd = opts.onEnd;

    const w = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "es-AR";

      this.recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        if (transcript) this.onResult(transcript);
      };
      this.recognition.onstart = () => this.onStart();
      this.recognition.onend = () => this.onEnd();
    }
  }

  isSupported() { return this.recognition !== null; }

  start() {
    if (this.recognition) {
      try { this.recognition.start(); } catch { /* already started */ }
    }
  }

  stop() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* already stopped */ }
    }
  }
}

export async function playAudio(audioBuffer: ArrayBuffer): Promise<void> {
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(audioBuffer);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  return new Promise((resolve) => {
    source.onended = () => { ctx.close(); resolve(); };
    source.start();
  });
}

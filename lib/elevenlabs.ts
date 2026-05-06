export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
}

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

async function elevenLabsRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${ELEVENLABS_BASE}${path}`, {
    ...options,
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
      ...options.headers,
    },
  });
}

export async function textToSpeech(
  text: string,
  voiceId: string
): Promise<ArrayBuffer> {
  const response = await elevenLabsRequest(`/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  return response.arrayBuffer();
}

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const response = await elevenLabsRequest("/voices");
  if (!response.ok) return [];
  const data = (await response.json()) as { voices: ElevenLabsVoice[] };
  return data.voices ?? [];
}

export async function textToSpeechStream(
  text: string,
  voiceId: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await elevenLabsRequest(
    `/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs stream error: ${response.status}`);
  }

  return response.body!;
}

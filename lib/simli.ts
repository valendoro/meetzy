const SIMLI_BASE = "https://api.simli.ai";

export interface SimliSession {
  session_token: string;
  session_id: string;
}

export async function createSimliSession(
  avatarId: string,
  voiceId: string
): Promise<SimliSession> {
  const response = await fetch(`${SIMLI_BASE}/startAudioToVideoSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.SIMLI_API_KEY ?? "",
    },
    body: JSON.stringify({
      faceId: avatarId,
      isJPG: false,
      syncAudio: true,
      voiceId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Simli session error: ${response.status}`);
  }

  return response.json() as Promise<SimliSession>;
}

export async function sendAudioToSimli(
  sessionToken: string,
  audioData: ArrayBuffer
): Promise<void> {
  const response = await fetch(`${SIMLI_BASE}/sendAudioData`, {
    method: "POST",
    headers: {
      "Content-Type": "audio/pcm",
      "X-Session-Token": sessionToken,
    },
    body: audioData,
  });

  if (!response.ok) {
    throw new Error(`Simli audio error: ${response.status}`);
  }
}

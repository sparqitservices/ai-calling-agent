import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const greeting =
    "Hey, main hoon. Bas thoda sa check kar raha tha. Batao, aaj tum kaisi feel kar rahi ho?";

  const host = req.headers.get("host");

  const ttsUrl = `https://${host}/api/voice?text=${encodeURIComponent(
    greeting
  )}`;

  const twiml = `
<Response>
  <Play>${ttsUrl}</Play>
  <Gather input="speech" action="/api/process" method="POST" speechTimeout="auto"/>
  <Hangup/>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

// STREAM ElevenLabs audio
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");

  if (!text) {
    return new NextResponse("Missing text", { status: 400 });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.25,
          similarity_boost: 0.85,
          style: 0.7,
          use_speaker_boost: true,
        },
      }),
    }
  );

  const audio = await response.arrayBuffer();

  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}

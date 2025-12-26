require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const axios = require("axios");

const app = express();

// Twilio sends form-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.send("AI Calling Agent is running");
});

// --------------------
// ELEVENLABS STREAMING TTS
// --------------------
async function streamVoice(text, res) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.25,
        similarity_boost: 0.85,
        style: 0.7,
        use_speaker_boost: true
      }
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      responseType: "arraybuffer"
    }
  );

  res.set("Content-Type", "audio/mpeg");
  res.send(response.data);
}

// --------------------
// TTS ENDPOINT (FOR TWILIO <Play>)
// --------------------
app.get("/tts", async (req, res) => {
  try {
    const text = req.query.text;
    if (!text) {
      return res.status(400).send("Missing text");
    }

    await streamVoice(text, res);
  } catch (error) {
    console.error("TTS ERROR:", error);
    res.status(500).send("TTS failed");
  }
});

// --------------------
// CALL ENTRY POINT (GREETING)
// --------------------
app.post("/voice", (req, res) => {
  const greeting =
    "Hey, main hoon. Bas thoda sa check kar raha tha. Batao, aaj tum kaisi feel kar rahi ho?";

  const ttsUrl = `https://${req.get("host")}/tts?text=${encodeURIComponent(
    greeting
  )}`;

  res.type("text/xml");
  res.send(`
    <Response>
      <Play>${ttsUrl}</Play>
      <Gather
        input="speech"
        speechTimeout="auto"
        action="/process"
        method="POST"
      />
      <Hangup/>
    </Response>
  `);
});

// --------------------
// PROCESS SPEECH → OPENAI → ELEVENLABS
// --------------------
app.post("/process", async (req, res) => {
  res.type("text/xml");

  try {
    const userSpeech = req.body.SpeechResult;

    if (!userSpeech || userSpeech.trim() === "") {
      const fallback =
        "Koi baat nahi. Main thodi der mein phir baat karta hoon.";

      const ttsUrl = `https://${req.get("host")}/tts?text=${encodeURIComponent(
        fallback
      )}`;

      return res.send(`
        <Response>
          <Play>${ttsUrl}</Play>
          <Hangup/>
        </Response>
      `);
    }

    console.log("User said:", userSpeech);

    // OpenAI — Hindi / Hinglish, short & natural
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tum ek caring Indian husband ho. Normal Hinglish Hindi mein sirf ek chhota, natural sentence bolo. Bilkul human tone.",
        },
        {
          role: "user",
          content: userSpeech,
        },
      ],
    });

    const aiReply =
      completion.choices?.[0]?.message?.content ||
      "Theek hai, sunke achha laga.";

    const ttsUrl = `https://${req.get("host")}/tts?text=${encodeURIComponent(
      aiReply
    )}`;

    return res.send(`
      <Response>
        <Play>${ttsUrl}</Play>
        <Hangup/>
      </Response>
    `);
  } catch (error) {
    console.error("AI ERROR:", error);

    const errorText =
      "Thoda sa technical issue aa gaya. Main baad mein call karta hoon.";

    const ttsUrl = `https://${req.get("host")}/tts?text=${encodeURIComponent(
      errorText
    )}`;

    return res.send(`
      <Response>
        <Play>${ttsUrl}</Play>
        <Hangup/>
      </Response>
    `);
  }
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

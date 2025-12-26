require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs-extra");
const axios = require("axios");

const app = express();

// Twilio sends form-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve generated audio files publicly
app.use("/audio", express.static(path.join(__dirname, "audio")));

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
// ELEVENLABS VOICE GENERATOR
// --------------------
async function generateVoice(text, filename) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`;

  const response = await axios.post(
    url,
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.25,          // natural, confident
        similarity_boost: 0.85,  // close to cloned voice
        style: 0.7,              // conversational
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

  const filePath = path.join(__dirname, "audio", filename);
  await fs.writeFile(filePath, response.data);

  return filePath;
}

// --------------------
// CALL ENTRY (GREETING)
// --------------------
app.post("/voice", async (req, res) => {
  res.type("text/xml");

  try {
    const greetingText =
      "Hey, main hoon. Bas thoda sa check kar raha tha. Batao, aaj tum kaisi feel kar rahi ho?";

    const fileName = `greeting-${Date.now()}.mp3`;
    await generateVoice(greetingText, fileName);

    const audioUrl = `${req.protocol}://${req.get("host")}/audio/${fileName}`;

    res.send(`
      <Response>
        <Play>${audioUrl}</Play>

        <Gather
          input="speech"
          speechTimeout="auto"
          action="/process"
          method="POST"
        >
          <Say voice="alice"> </Say>
        </Gather>

        <Hangup/>
      </Response>
    `);
  } catch (error) {
    console.error("Greeting error:", error);

    res.send(`
      <Response>
        <Say voice="alice">
          Thoda sa issue aa gaya hai. Main baad mein call karta hoon.
        </Say>
        <Hangup/>
      </Response>
    `);
  }
});

// --------------------
// PROCESS SPEECH → OPENAI → ELEVENLABS
// --------------------
app.post("/process", async (req, res) => {
  res.type("text/xml");

  try {
    const userSpeech = req.body.SpeechResult;

    if (!userSpeech || userSpeech.trim() === "") {
      const fallbackText =
        "Koi baat nahi. Main thodi der mein phir baat karta hoon.";

      const fileName = `fallback-${Date.now()}.mp3`;
      await generateVoice(fallbackText, fileName);

      const audioUrl = `${req.protocol}://${req.get("host")}/audio/${fileName}`;

      return res.send(`
        <Response>
          <Play>${audioUrl}</Play>
          <Hangup/>
        </Response>
      `);
    }

    console.log("User said:", userSpeech);

    // 🔹 OpenAI — Hinglish / Hindi response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tum ek caring Indian husband ho. Normal Hinglish Hindi mein baat karo. Sirf ek chhota, natural sentence bolo. Bilkul normal Indian tone mein.",
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

    // 🔹 ElevenLabs audio
    const fileName = `reply-${Date.now()}.mp3`;
    await generateVoice(aiReply, fileName);

    const audioUrl = `${req.protocol}://${req.get("host")}/audio/${fileName}`;

    return res.send(`
      <Response>
        <Play>${audioUrl}</Play>
        <Pause length="1"/>
        <Play>${audioUrl}</Play>
        <Hangup/>
      </Response>
    `);
  } catch (error) {
    console.error("AI / ELEVENLABS ERROR:", error);

    const errorText =
      "Thoda sa technical issue aa gaya. Main baad mein call karta hoon.";

    const fileName = `error-${Date.now()}.mp3`;
    await generateVoice(errorText, fileName);

    const audioUrl = `${req.protocol}://${req.get("host")}/audio/${fileName}`;

    return res.send(`
      <Response>
        <Play>${audioUrl}</Play>
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

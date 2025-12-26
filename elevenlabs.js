const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function generateVoice(text, filename) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`;

  const response = await axios.post(
    url,
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.35,        // lower = more natural
        similarity_boost: 0.75, // closer to cloned voice
        style: 0.6,
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

module.exports = { generateVoice };

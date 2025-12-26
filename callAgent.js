const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function makeCall() {
  await client.calls.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.WIFE_PHONE_NUMBER,
    url: "https://ai-calling-agent-chi.vercel.app/voice"
  });

  console.log("Call placed successfully");
}

makeCall();

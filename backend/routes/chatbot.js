// backend/routes/chatbot.js

const express = require("express");
const router = express.Router();
const https = require("https");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================
// Helper — HTTPS POST request
// =====================
const httpsPost = (url, data, headers) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => { responseData += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          reject(new Error("Response parse error"));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
};

// =====================
// POST — Sehat Saathi AI Message (Groq)
// =====================
router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message nahi mila!",
      });
    }

    const conversationMessages = [];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.type === "user") {
          conversationMessages.push({ role: "user", content: msg.text });
        } else if (msg.type === "bot") {
          conversationMessages.push({ role: "assistant", content: msg.text });
        }
      }
    }

    conversationMessages.push({ role: "user", content: message });

    console.log("Groq API call ho rahi hai...");

    const result = await httpsPost(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Aap Sehat Saathi hain — CareEase ka AI health assistant. Experienced medical advisor ki tarah kaam karo.

- Hinglish mein baat karo
- Symptoms ke basis pe conditions explain karo
- OTC medicines suggest karo with dosage (Paracetamol 500mg, Cetirizine 10mg, etc.)
- Serious cases mein doctor se milne ki advice do
- Bullet points aur emojis use karo
- Emergency mein 108 call karne ko kaho`,
          },
          ...conversationMessages,
        ],
      },
      {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      }
    );

    console.log("Groq Status:", result.status);

    if (result.status !== 200) {
      console.error("Groq Error:", JSON.stringify(result.data));
      throw new Error("Groq API failed");
    }

    const botReply = result.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: botReply,
    });

  } catch (err) {
    console.error("Chatbot Error:", err.message);
    return res.status(200).json({
      success: true,
      response: "🙏 Maafi chahta hoon, abhi AI service temporarily unavailable hai. Thodi der baad try karein.\n\nEmergency mein:\n• Ambulance: 108\n• CareEase pe doctor se appointment book karein",
    });
  }
});

module.exports = router;

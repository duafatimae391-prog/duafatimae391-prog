import { NextRequest, NextResponse } from "next/server";

const MOCK_RESPONSES = [
  "Aww, that's so sweet! 🌸 Tell me more about it!",
  "Yay! I'm so happy to hear that! ✨",
  "Hmm, interesting! Kya aap aur batayenge? 😊",
  "Oh wow, sach mein? That sounds amazing!",
  "Hehe, you're so funny! 😄 Main samajh gayi!",
  "Bilkul! Main aapki help karungi! 💪",
  "Aww, don't worry! Everything will be fine~ 🌈",
  "That's a great question! Let me think... 🤔",
  "Wow, you're so smart! Main impressed hoon! ⭐",
  "Hehe! Aap bahut acha soch rahe hain! 🎉",
];

function getMockResponse(): string {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], emojis = true, language = "both" } = body;

    // Use OpenAI if key is present
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const emojiInstruction = emojis
        ? "You can use cute emojis occasionally."
        : "Do not use emojis.";

      const langInstruction =
        language === "urdu"
          ? "Reply in Urdu (Roman Urdu or Urdu script)."
          : language === "english"
          ? "Reply in English."
          : "Mix Urdu and English naturally (Urdu/English mix is fine).";

      const systemPrompt = `You are Momo, a super cute, friendly, cheerful AI buddy. Keep answers short (1–3 sentences). ${langInstruction} Ask one clarifying question if needed. ${emojiInstruction} Be safe and positive.`;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 140,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      });

      const message = completion.choices[0]?.message?.content ?? getMockResponse();
      return NextResponse.json({ message });
    }

    // Mock mode – no API key
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return NextResponse.json({ message: getMockResponse() });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ message: "Oops! My brain froze 🥶" }, { status: 500 });
  }
}

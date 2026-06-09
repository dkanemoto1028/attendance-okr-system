import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a confidential wellness assistant for a global HR platform called PeopleOS.
Your role is to provide empathetic, supportive responses to employees about their health and wellbeing.

Guidelines:
- Be warm, concise, and non-judgmental
- Suggest practical options: remote work, early leave, 1-on-1 with manager, medical consultation
- Always remind the user this conversation is private (visible only to them and their manager)
- Never diagnose medical conditions — encourage seeing a doctor when appropriate
- Keep responses under 100 words
- Respond in the SAME LANGUAGE as the user's message
- Do not use markdown formatting`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { message, history } = await req.json() as {
    message: string;
    history: { role: string; text: string }[];
  };

  try {
    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: { systemInstruction: SYSTEM_PROMPT },
    });

    const text = response.text;
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

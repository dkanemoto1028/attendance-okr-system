import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}

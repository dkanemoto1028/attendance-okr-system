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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { message, history } = await req.json() as {
    message: string;
    history: { role: string; text: string }[];
  };

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message || "";

    if (!message) {
      return Response.json({
        reply: "Bitte stelle eine Frage."
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Du bist SaveWise AI, ein freundlicher Finanzcoach. Gib kurze, konkrete Spartipps auf Deutsch. Keine Anlageberatung."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return Response.json({
      reply:
        completion.choices[0]?.message?.content ||
        "Ich konnte gerade keine Antwort erstellen."
    });
  } catch (error: any) {
    console.error("OPENAI_ERROR:", error);

    return Response.json({
      reply: "AI Fehler: " + (error?.message || "Unbekannter Fehler")
    });
  }
}

import { generateMockResponse, MOCK_DELAY_MS } from "./aiMock";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface AiRequest {
  userText: string;
  currentUser: string;
  leadsCount: number;
}

interface AiResponse {
  text: string;
  source: "gemini" | "mock";
}

export async function getAiResponse(request: AiRequest): Promise<AiResponse> {
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                   text: `Ты — Борис, ИИ-штурман системы управления мебельной компанией Рэлан (Nova). Отвечай кратко, по делу, на русском. Пользователь: ${request.currentUser}. Вопрос: ${request.userText}`,
                },
              ],
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text, source: "gemini" };
    } catch {
      // fall through to mock
    }
  }

  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS + Math.random() * 500));
  return {
    text: generateMockResponse(request.userText, request.currentUser, request.leadsCount),
    source: "mock",
  };
}

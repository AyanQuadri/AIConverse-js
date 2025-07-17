import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function stripMarkdown(text: string): string {
    return text
        .replace(/[*_`~>#+-]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/!\[(.*?)\]\(.*?\)/g, '')
        .replace(/^\s*>+/gm, '')
        .replace(/-{2,}/g, '')
        .trim();
}

export async function getGeminiResponse(prompt: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const result = await model.generateContent(
            `Respond in plain text only without any markdown formatting. Do not use asterisks, backticks, or any special formatting.\n\n${prompt}`
        );

        const response = result.response;
        const raw = await response.text();

        return stripMarkdown(raw);
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to fetch response from Gemini");
    }
}

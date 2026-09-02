import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
}

export const gemini = new GoogleGenAI({
    apiKey,
});

export async function generateGeminiContent(
    prompt: string,
    primaryModel = "gemini-3.6-flash",
    fallbackModel = "gemini-3.5-flash-lite"
) {
    try {
        return await gemini.models.generateContent({
            model: primaryModel,
            contents: prompt,
        });
    } catch (error) {
        const status =
            typeof error === "object" &&
            error !== null &&
            "status" in error
                ? error.status
                : undefined;

        if (status !== 503) {
            throw error;
        }

        console.warn(
            `Gemini ${primaryModel} indisponível. Tentando ${fallbackModel}...`
        );

        return await gemini.models.generateContent({
            model: fallbackModel,
            contents: prompt,
        });
    }
}
import { gemini } from "./gemini-client";
import type { AIRepositoryAnalysis } from "@/lib/github/github.types";
import { buildRepositoryAnalysisPrompt } from "./gemini-prompts";

interface RepositoryFile {
    path: string;
    content: string;
}
export async function analyzeRepositoryWithGemini(
    repositoryName: string,
    files: RepositoryFile[]
): Promise<AIRepositoryAnalysis> {
    const prompt = buildRepositoryAnalysisPrompt(
        repositoryName,
        files
    );
    const response = await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
    });
    const text = response.text?.trim();
    if (!text) {
        throw new Error(
            "O Gemini não retornou uma análise."
        );
    }
    const cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    let analysis: AIRepositoryAnalysis;
    try {
        analysis = JSON.parse(
            cleanedText
        ) as AIRepositoryAnalysis;
    } catch {
        throw new Error(
            "O Gemini retornou uma resposta em formato inválido."
        );
    }
    if (
        typeof analysis.overview !== "string" ||
        typeof analysis.architecture !== "string" ||
        !Array.isArray(analysis.strengths) ||
        !Array.isArray(analysis.weaknesses) ||
        !Array.isArray(analysis.recommendations)
    ) {
        throw new Error(
            "A resposta do Gemini não possui o formato esperado."
        );
    }
    return analysis;
}
import { generateGeminiContent } from "./gemini-client";
import type { AIRepositoryAnalysis, AIRepositoryAnalysisTranslation } from "@/lib/github/github.types";
import { buildRepositoryAnalysisPrompt } from "./gemini-prompts";

interface RepositoryFile {
    path: string;
    content: string;
}
function isValidAnalysisTranslation(
    analysis: unknown
): analysis is AIRepositoryAnalysisTranslation {
    if (
        typeof analysis !== "object" ||
        analysis === null
    ) {
        return false;
    }
    const value = analysis as AIRepositoryAnalysisTranslation;
    return (
        typeof value.overview === "string" &&
        typeof value.architecture === "string" &&
        Array.isArray(value.strengths) &&
        Array.isArray(value.weaknesses) &&
        Array.isArray(value.recommendations) &&
        value.strengths.every(
            (item) => typeof item === "string"
        ) &&
        value.weaknesses.every(
            (item) => typeof item === "string"
        ) &&
        value.recommendations.every(
            (item) => typeof item === "string"
        )
    );
}
function isValidRepositoryAnalysis(
    analysis: unknown
): analysis is AIRepositoryAnalysis {
    if (
        typeof analysis !== "object" ||
        analysis === null
    ) {
        return false;
    }
    const value =
        analysis as AIRepositoryAnalysis;
    return (
        isValidAnalysisTranslation(value.pt) &&
        isValidAnalysisTranslation(value.en) &&
        isValidAnalysisTranslation(value.es)
    );
}
export async function analyzeRepositoryWithGemini(
    repositoryName: string,
    files: RepositoryFile[]
): Promise<AIRepositoryAnalysis> {
    const prompt = buildRepositoryAnalysisPrompt(
        repositoryName,
        files
    );
    const response = await generateGeminiContent(
        prompt,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite"
    );
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
    if (!isValidRepositoryAnalysis(analysis)) {
        throw new Error(
            "A resposta do Gemini não possui as três análises no formato esperado."
        );
    }
    return analysis;
}
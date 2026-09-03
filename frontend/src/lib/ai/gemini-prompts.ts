export type SupportedLanguage = "pt" | "en" | "es";

const languageInstructions: Record<SupportedLanguage, string> = {
    pt: "Responda toda a análise em português do Brasil.",
    en: "Write the entire analysis in English.",
    es: "Escribe todo el análisis en español.",
};

export function buildRepositoryAnalysisPrompt(
    repositoryName: string,
    files: {
        path: string;
        content: string;
    }[],
    language: SupportedLanguage
): string {
    const repositoryCode = files
        .map(
            (file) => `
==============================
ARQUIVO: ${file.path}
==============================

${file.content}
`
        )
        .join("\n");

    return `
Você é um arquiteto de software especialista em análise de código.

Analise o repositório "${repositoryName}" exclusivamente com base nos arquivos fornecidos abaixo.

IDIOMA DA RESPOSTA:
${languageInstructions[language]}

IMPORTANTE:
- A resposta inteira deve estar no idioma selecionado acima.
- Não misture idiomas na resposta.
- Os valores dos campos do JSON também devem estar no idioma selecionado.
- As chaves do JSON devem permanecer exatamente em inglês.
- Não traduza nem altere os nomes das chaves do JSON.
- Não invente tecnologias, bibliotecas, frameworks, padrões arquiteturais ou funcionalidades.
- Só mencione algo se houver evidência nos arquivos fornecidos.
- Se não houver informação suficiente para afirmar algo, não faça a afirmação.
- Não faça suposições com base apenas no nome dos arquivos.
- Não utilize conhecimento externo sobre o repositório.
- A análise deve refletir exclusivamente o código recebido.

Retorne SOMENTE um JSON válido seguindo exatamente este formato:

{
  "overview": "string",
  "architecture": "string",
  "strengths": [
    "string"
  ],
  "weaknesses": [
    "string"
  ],
  "recommendations": [
    "string"
  ]
}

Regras para cada campo:

- "overview":
  Explique resumidamente como o projeto funciona e quais são suas principais características técnicas identificadas no código.

- "architecture":
  Descreva a arquitetura e a organização estrutural encontradas no código. Considere separação de responsabilidades, módulos, camadas, componentes, serviços e outros padrões somente quando houver evidência.

- "strengths":
  Liste pontos positivos reais encontrados no código.
  Cada item deve representar uma característica concreta observada.

- "weaknesses":
  Liste problemas, limitações ou pontos que poderiam ser melhorados e que sejam identificáveis no código fornecido.
  Não invente problemas.

- "recommendations":
  Sugira melhorias técnicas relacionadas diretamente aos problemas ou limitações identificados.
  Não recomende tecnologias sem justificativa baseada no código.

Regras gerais:

- Retorne entre 2 e 5 itens em "strengths".
- Retorne entre 2 e 5 itens em "weaknesses".
- Retorne entre 2 e 5 itens em "recommendations".
- Não utilize Markdown.
- Não inclua comentários fora do JSON.
- Não inclua blocos de código.
- Seja técnico, objetivo e específico.
- Não repita a mesma informação em campos diferentes.
- Baseie toda a análise exclusivamente nos arquivos fornecidos.

CÓDIGO DO REPOSITÓRIO:

${repositoryCode}
`;
}
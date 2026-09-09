export function buildRepositoryAnalysisPrompt(
    repositoryName: string,
    files: {
        path: string;
        content: string;
    }[]
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

IMPORTANTE:

- Gere a mesma análise em três idiomas: português do Brasil, inglês e espanhol.
- As três versões devem apresentar exatamente os mesmos fatos, conclusões, pontos fortes, pontos fracos e recomendações.
- A única diferença entre as versões deve ser o idioma.
- Não omita informações em nenhuma das versões.
- Não adicione informações que não existam nas outras versões.
- Os valores dos campos do JSON devem estar no idioma correspondente.
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
  "pt": {
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
  },
  "en": {
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
  },
  "es": {
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
}

REGRAS PARA CADA IDIOMA:

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

REGRAS GERAIS:

- Retorne entre 2 e 5 itens em "strengths" para cada idioma.
- Retorne entre 2 e 5 itens em "weaknesses" para cada idioma.
- Retorne entre 2 e 5 itens em "recommendations" para cada idioma.
- As listas dos três idiomas devem representar os mesmos pontos.
- Não utilize Markdown.
- Não inclua comentários fora do JSON.
- Não inclua blocos de código.
- Seja técnico, objetivo e específico.
- Não repita a mesma informação desnecessariamente.
- Baseie toda a análise exclusivamente nos arquivos fornecidos.

CÓDIGO DO REPOSITÓRIO:

${repositoryCode}
`;
}
import type { OpenAPIV3 } from "openapi-types";

export const swaggerSpec: OpenAPIV3.Document = {
    openapi: "3.0.3",

    info: {
        title: "GitHub Analyzer API",
        version: "1.0.0",
        description:
            "API responsável por analisar repositórios do GitHub utilizando processamento de arquivos, Redis e inteligência artificial com Gemini.",
    },

    servers: [
        {
            url: "https://analisadordegithub.vercel.app",
            description: "Ambiente de produção",
        },
    ],

    tags: [
        {
            name: "GitHub",
            description:
                "Endpoints relacionados à análise de repositórios do GitHub.",
        },
        {
            name: "Chat",
            description:
                "Endpoints relacionados ao chat com o repositório analisado.",
        },
    ],

    paths: {
        "/api/github/repository": {
            post: {
                tags: ["GitHub"],
                summary: "Analisa um repositório do GitHub",
                description:
                    "Consulta um repositório do GitHub, identifica sua estrutura, filtra e processa os arquivos relevantes, cria chunks para RAG, realiza a análise com Gemini e armazena os resultados no Redis.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RepositoryRequest",
                            },

                            example: {
                                url: "https://github.com/facebook/react",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Repositório analisado com sucesso.",

                        headers: {
                            "X-Cache": {
                                description:
                                    "Indica se o resultado foi recuperado do cache. Pode ser HIT, HIT-AI-MISS ou MISS.",

                                schema: {
                                    type: "string",
                                },
                            },

                            "X-Repository-SHA": {
                                description:
                                    "SHA da árvore do repositório utilizada na análise.",

                                schema: {
                                    type: "string",
                                },
                            },

                            "X-RateLimit-Limit": {
                                description:
                                    "Quantidade máxima de análises permitidas dentro da janela de rate limit.",

                                schema: {
                                    type: "integer",
                                },
                            },

                            "X-RateLimit-Remaining": {
                                description:
                                    "Quantidade de análises restantes para o cliente.",

                                schema: {
                                    type: "integer",
                                },
                            },
                        },

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RepositoryAnalysis",
                                },
                            },
                        },
                    },

                    "400": {
                        description:
                            "URL do repositório não informada ou URL inválida.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                examples: {
                                    missingUrl: {
                                        summary:
                                            "URL não informada",

                                        value: {
                                            error:
                                                "URL do repositório não informada.",
                                        },
                                    },

                                    invalidUrl: {
                                        summary:
                                            "URL inválida",

                                        value: {
                                            error:
                                                "URL inválida do GitHub.",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "413": {
                        description:
                            "O repositório ou o arquivo ZIP excede o tamanho máximo permitido.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RepositoryTooLargeResponse",
                                },

                                examples: {
                                    repositoryTooLarge: {
                                        summary:
                                            "Repositório muito grande",

                                        value: {
                                            error:
                                                "Este repositório é muito grande para ser analisado. Estamos selecionando apenas os arquivos mais relevantes para a análise.",

                                            code:
                                                "REPOSITORY_TOO_LARGE",

                                            repository: {
                                                id: 10270250,
                                                name: "example",
                                                full_name:
                                                    "owner/example",
                                                description:
                                                    "Example repository",
                                                private: false,
                                                html_url:
                                                    "https://github.com/owner/example",
                                                stargazers_count: 100,
                                                forks_count: 20,
                                                language: "TypeScript",
                                                default_branch:
                                                    "main",
                                                size: 500000,
                                            },

                                            languages: [
                                                "TypeScript",
                                                "JavaScript",
                                            ],
                                        },
                                    },

                                    zipTooLarge: {
                                        summary:
                                            "ZIP muito grande",

                                        value: {
                                            error:
                                                "O ZIP do repositório excede o tamanho máximo permitido.",

                                            code:
                                                "ZIP_TOO_LARGE",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "429": {
                        description:
                            "Limite de requisições ou limite de análises simultâneas atingido.",

                        headers: {
                            "Retry-After": {
                                description:
                                    "Quantidade de segundos que o cliente deve aguardar antes de tentar novamente.",

                                schema: {
                                    type: "integer",
                                },
                            },

                            "X-RateLimit-Limit": {
                                description:
                                    "Quantidade máxima de requisições permitidas.",

                                schema: {
                                    type: "integer",
                                },
                            },

                            "X-RateLimit-Remaining": {
                                description:
                                    "Quantidade de requisições restantes.",

                                schema: {
                                    type: "integer",
                                },
                            },
                        },

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                examples: {
                                    rateLimit: {
                                        summary:
                                            "Rate limit excedido",

                                        value: {
                                            error:
                                                "Limite de análises atingido. Tente novamente mais tarde.",

                                            code:
                                                "RATE_LIMIT_EXCEEDED",

                                            retryAfterSeconds: 60,
                                        },
                                    },

                                    concurrencyLimit: {
                                        summary:
                                            "Limite de análises simultâneas",

                                        value: {
                                            error:
                                                "O servidor está processando muitas análises simultaneamente. Tente novamente em alguns segundos.",

                                            code:
                                                "ANALYSIS_CONCURRENCY_LIMIT",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Erro interno durante o processamento do repositório.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                example: {
                                    error:
                                        "Erro interno ao consultar o GitHub.",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/github/chat": {
            post: {
                tags: ["Chat"],
                summary:
                    "Conversa com um repositório analisado",
                description:
                    "Envia uma pergunta sobre um repositório previamente analisado. A API recupera os chunks armazenados no Redis, seleciona os mais relevantes para a pergunta e utiliza o Gemini para gerar a resposta no idioma solicitado.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ChatRequest",
                            },

                            examples: {
                                portuguese: {
                                    summary:
                                        "Pergunta em português",

                                    value: {
                                        url: "https://github.com/facebook/react",
                                        message:
                                            "Como está organizada a arquitetura desse projeto?",
                                        language: "pt",
                                    },
                                },

                                english: {
                                    summary:
                                        "Pergunta em inglês",

                                    value: {
                                        url: "https://github.com/facebook/react",
                                        message:
                                            "How is the architecture of this project organized?",
                                        language: "en",
                                    },
                                },

                                spanish: {
                                    summary:
                                        "Pergunta em espanhol",

                                    value: {
                                        url: "https://github.com/facebook/react",
                                        message:
                                            "¿Cómo está organizada la arquitectura de este proyecto?",
                                        language: "es",
                                    },
                                },
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Pergunta respondida com sucesso.",

                        headers: {
                            "X-Repository-SHA": {
                                description:
                                    "SHA da análise do repositório utilizada para responder à pergunta.",

                                schema: {
                                    type: "string",
                                },
                            },

                            "X-RAG-Chunks": {
                                description:
                                    "Quantidade de chunks selecionados pelo mecanismo RAG para gerar a resposta.",

                                schema: {
                                    type: "integer",
                                },
                            },
                        },

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ChatResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        description:
                            "Dados inválidos enviados na requisição.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                examples: {
                                    missingUrl: {
                                        summary:
                                            "URL não informada",

                                        value: {
                                            error:
                                                "URL do repositório não informada.",
                                        },
                                    },

                                    emptyMessage: {
                                        summary:
                                            "Pergunta vazia",

                                        value: {
                                            error:
                                                "A pergunta não pode estar vazia.",
                                        },
                                    },

                                    invalidLanguage: {
                                        summary:
                                            "Idioma inválido",

                                        value: {
                                            error:
                                                "Idioma de resposta inválido.",
                                        },
                                    },

                                    invalidUrl: {
                                        summary:
                                            "URL inválida",

                                        value: {
                                            error:
                                                "URL inválida do GitHub.",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "A análise ou os chunks do repositório não foram encontrados no Redis.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                examples: {
                                    analysisNotFound: {
                                        summary:
                                            "Análise não encontrada",

                                        value: {
                                            error:
                                                "A análise do repositório não foi encontrada no Redis.",
                                        },
                                    },

                                    chunksNotFound: {
                                        summary:
                                            "Chunks não encontrados",

                                        value: {
                                            error:
                                                "Os chunks do repositório não foram encontrados no Redis.",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Erro interno durante o processamento da pergunta.",

                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },

                                example: {
                                    error:
                                        "Erro interno ao conversar com o repositório.",
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    components: {
        schemas: {
            RepositoryRequest: {
                type: "object",

                required: ["url"],

                properties: {
                    url: {
                        type: "string",
                        format: "uri",
                        description:
                            "URL pública do repositório no GitHub.",

                        example:
                            "https://github.com/facebook/react",
                    },
                },
            },

            ChatRequest: {
                type: "object",

                required: ["url", "message", "language"],

                properties: {
                    url: {
                        type: "string",
                        format: "uri",
                        description:
                            "URL pública do repositório do GitHub.",

                        example:
                            "https://github.com/facebook/react",
                    },

                    message: {
                        type: "string",
                        minLength: 1,
                        description:
                            "Pergunta que será enviada para a IA sobre o repositório.",

                        example:
                            "Como está organizada a arquitetura desse projeto?",
                    },

                    language: {
                        type: "string",
                        enum: ["pt", "en", "es"],
                        description:
                            "Idioma no qual a IA deve responder.",

                        example: "pt",
                    },
                },
            },

            RepositoryAnalysis: {
                type: "object",

                required: [
                    "repository",
                    "languages",
                    "branch",
                    "sha",
                    "structure",
                    "analysis",
                    "files",
                    "skippedFiles",
                    "aiAnalysis",
                ],

                properties: {
                    repository: {
                        $ref: "#/components/schemas/GitHubRepository",
                    },

                    languages: {
                        type: "array",
                        items: {
                            type: "string",
                        },

                        example: [
                            "TypeScript",
                            "JavaScript",
                            "CSS",
                        ],
                    },

                    branch: {
                        type: "string",
                        example: "main",
                    },

                    sha: {
                        type: "string",
                        example:
                            "abc1234567890abcdef",
                    },

                    structure: {
                        $ref: "#/components/schemas/RepositoryStructure",
                    },

                    analysis: {
                        $ref: "#/components/schemas/RepositoryAnalysisStatus",
                    },

                    files: {
                        type: "array",

                        items: {
                            $ref: "#/components/schemas/ProcessedFile",
                        },
                    },

                    skippedFiles: {
                        type: "array",

                        items: {
                            type: "string",
                        },

                        example: [
                            "node_modules/example.js",
                            "package-lock.json",
                        ],
                    },

                    aiAnalysis: {
                        nullable: true,

                        allOf: [
                            {
                                $ref: "#/components/schemas/AIRepositoryAnalysis",
                            },
                        ],
                    },
                },
            },

            GitHubRepository: {
                type: "object",

                required: [
                    "id",
                    "name",
                    "full_name",
                    "description",
                    "private",
                    "html_url",
                    "stargazers_count",
                    "forks_count",
                    "language",
                    "default_branch",
                    "size",
                ],

                properties: {
                    id: {
                        type: "integer",
                        example: 10270250,
                    },

                    name: {
                        type: "string",
                        example: "react",
                    },

                    full_name: {
                        type: "string",
                        example: "facebook/react",
                    },

                    description: {
                        type: "string",
                        nullable: true,
                        example:
                            "The library for web and native user interfaces.",
                    },

                    private: {
                        type: "boolean",
                        example: false,
                    },

                    html_url: {
                        type: "string",
                        format: "uri",
                        example:
                            "https://github.com/facebook/react",
                    },

                    stargazers_count: {
                        type: "integer",
                        example: 230000,
                    },

                    forks_count: {
                        type: "integer",
                        example: 47000,
                    },

                    language: {
                        type: "string",
                        nullable: true,
                        example: "JavaScript",
                    },

                    default_branch: {
                        type: "string",
                        example: "main",
                    },

                    size: {
                        type: "integer",
                        description:
                            "Tamanho do repositório informado pelo GitHub em KB.",

                        example: 120000,
                    },
                },
            },

            RepositoryStructure: {
                type: "object",

                required: [
                    "totalFiles",
                    "relevantFiles",
                    "analyzedFiles",
                    "skippedFiles",
                    "truncated",
                ],

                properties: {
                    totalFiles: {
                        type: "integer",
                        example: 500,
                    },

                    relevantFiles: {
                        type: "integer",
                        example: 150,
                    },

                    analyzedFiles: {
                        type: "integer",
                        example: 120,
                    },

                    skippedFiles: {
                        type: "integer",
                        example: 30,
                    },

                    truncated: {
                        type: "boolean",
                        example: false,
                    },
                },
            },

            RepositoryAnalysisStatus: {
                type: "object",

                required: ["limited", "reason"],

                properties: {
                    limited: {
                        type: "boolean",
                        example: false,
                    },

                    reason: {
                        type: "string",
                        nullable: true,

                        example: null,
                    },
                },
            },

            ProcessedFile: {
                type: "object",

                properties: {
                    path: {
                        type: "string",
                        example: "src/app/page.tsx",
                    },

                    content: {
                        type: "string",
                        example:
                            'export default function Page() { return <main>Hello</main>; }',
                    },
                },
            },

            AIRepositoryAnalysis: {
                type: "object",

                required: ["pt", "en", "es"],

                properties: {
                    pt: {
                        $ref: "#/components/schemas/AIRepositoryAnalysisTranslation",
                    },

                    en: {
                        $ref: "#/components/schemas/AIRepositoryAnalysisTranslation",
                    },

                    es: {
                        $ref: "#/components/schemas/AIRepositoryAnalysisTranslation",
                    },
                },
            },

            AIRepositoryAnalysisTranslation: {
                type: "object",

                required: [
                    "overview",
                    "architecture",
                    "strengths",
                    "weaknesses",
                    "recommendations",
                ],

                properties: {
                    overview: {
                        type: "string",
                    },

                    architecture: {
                        type: "string",
                    },

                    strengths: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },

                    weaknesses: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },

                    recommendations: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },
                },
            },

            ChatResponse: {
                type: "object",

                required: [
                    "message",
                    "messages",
                    "sha",
                ],

                properties: {
                    message: {
                        $ref: "#/components/schemas/ChatMessage",
                    },

                    messages: {
                        type: "array",

                        items: {
                            $ref: "#/components/schemas/ChatMessage",
                        },
                    },

                    sha: {
                        type: "string",
                        example:
                            "abc1234567890abcdef",
                    },
                },
            },

            ChatMessage: {
                type: "object",

                required: [
                    "id",
                    "role",
                    "content",
                    "createdAt",
                ],

                properties: {
                    id: {
                        type: "string",
                        format: "uuid",

                        example:
                            "550e8400-e29b-41d4-a716-446655440000",
                    },

                    role: {
                        type: "string",
                        enum: ["user", "assistant"],

                        example: "assistant",
                    },

                    content: {
                        type: "string",

                        example:
                            "A arquitetura utiliza componentes desacoplados organizados por domínio.",
                    },

                    createdAt: {
                        type: "string",
                        format: "date-time",

                        example:
                            "2026-09-08T20:00:00.000Z",
                    },
                },
            },

            ErrorResponse: {
                type: "object",

                required: ["error"],

                properties: {
                    error: {
                        type: "string",

                        example:
                            "URL inválida do GitHub.",
                    },

                    code: {
                        type: "string",
                        nullable: true,

                        example:
                            "RATE_LIMIT_EXCEEDED",
                    },

                    retryAfterSeconds: {
                        type: "integer",
                        nullable: true,

                        example: 60,
                    },
                },
            },

            RepositoryTooLargeResponse: {
                type: "object",

                properties: {
                    error: {
                        type: "string",
                    },

                    code: {
                        type: "string",
                        enum: [
                            "REPOSITORY_TOO_LARGE",
                            "ZIP_TOO_LARGE",
                        ],
                    },

                    repository: {
                        $ref: "#/components/schemas/GitHubRepository",
                    },

                    languages: {
                        type: "array",

                        items: {
                            type: "string",
                        },
                    },
                },
            },
        },
    },
};
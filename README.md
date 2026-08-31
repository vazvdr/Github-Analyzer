# GitHub Analyzer

> Análise automatizada de repositórios GitHub com processamento inteligente, cache distribuído e análise arquitetural baseada em IA.

O **GitHub Analyzer** é uma aplicação web desenvolvida para analisar repositórios públicos do GitHub, processando sua estrutura, arquivos, tecnologias e características arquiteturais.

O projeto utiliza **Next.js, TypeScript, Redis e Gemini**, com uma arquitetura orientada à eficiência e redução de processamento desnecessário.

Um dos principais objetivos do projeto é evitar que o mesmo repositório seja processado repetidamente quando sua versão não sofreu alterações.

---

## 🚀 Fluxo de funcionamento

O processamento de um repositório segue o fluxo abaixo:

```text
┌─────────────────────────┐
│ Usuário informa URL     │
│ do repositório GitHub   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│        useHero.ts       │
│                         │
│ POST /api/github/       │
│ repository              │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ API valida o repositório│
│                         │
│ • URL                   │
│ • existência            │
│ • tamanho               │
│ • branch                │
│ • SHA atual             │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│        Redis            │
│                         │
│ owner + repository +    │
│ SHA                     │
└────────────┬────────────┘
             │
       ┌─────┴─────┐
       │           │
    CACHE HIT   CACHE MISS
       │           │
       ▼           ▼
┌────────────┐  ┌──────────────────┐
│ Retorna    │  │ Baixa e processa │
│ análise    │  │ o repositório    │
│ do Redis   │  │                  │
└─────┬──────┘  └────────┬─────────┘
      │                  │
      │                  ▼
      │          ┌──────────────────┐
      │          │ Valida tamanho   │
      │          │ do conteúdo ZIP  │
      │          └────────┬─────────┘
      │                   │
      │                   ▼
      │          ┌──────────────────┐
      │          │ Processa apenas  │
      │          │ arquivos         │
      │          │ permitidos       │
      │          └────────┬─────────┘
      │                   │
      │                   ▼
      │          ┌──────────────────┐
      │          │ Salva análise    │
      │          │ no Redis         │
      │          │ TTL: 24 horas    │
      │          └────────┬─────────┘
      │                   │
      └──────────┬────────┘
                 ▼
       ┌────────────────────┐
       │     useHero.ts     │
       │                    │
       │ sessionStorage     │
       └──────────┬─────────┘
                  │
                  ▼
       ┌────────────────────┐
       │      Dashboard     │
       │                    │
       │     useDashboard   │
       └────────────────────┘
```

---

## 🔄 1. Entrada do repositório

O usuário informa a URL de um repositório GitHub e seleciona **"Analisar repositório"**.

O `useHero.ts` inicia o processo realizando uma requisição:

```http
POST /api/github/repository
```

O backend recebe a URL e inicia as validações necessárias antes de qualquer processamento.

---

## 🔍 2. Validação do repositório

A API verifica se a URL fornecida corresponde a um repositório válido do GitHub.

Depois disso, são obtidas informações importantes para identificar exatamente qual versão do repositório será analisada:

* Owner
* Nome do repositório
* Branch padrão
* SHA atual do commit
* Tamanho do repositório

O **SHA** é especialmente importante porque representa uma versão específica do código.

Isso permite que o sistema diferencie:

```text
Repository
     │
     ├── SHA A → versão antiga
     │
     └── SHA B → versão nova
```

Dessa forma, o cache não depende apenas do nome do repositório.

---

# ⚡ 3. Estratégia de cache com Redis

O Redis é utilizado como camada de cache para evitar o processamento repetido dos mesmos repositórios.

A identificação da análise utiliza:

```text
owner + repository + SHA
```

Conceitualmente:

```text
github-analyzer:analysis:{owner}:{repository}:{sha}
```

Isso significa que uma análise está diretamente relacionada a uma versão específica do repositório.

---

## ✅ CACHE HIT

Se o Redis encontrar uma análise armazenada para aquele:

```text
owner
repository
SHA
```

o sistema retorna imediatamente os dados armazenados.

```text
Usuário
   │
   ▼
API
   │
   ▼
Redis
   │
   └── Análise encontrada
             │
             ▼
        CACHE HIT
             │
             ▼
       Resposta imediata
```

Nesse cenário, o GitHub não precisa ser baixado e o processamento dos arquivos não precisa ser executado novamente.

Isso reduz:

* tempo de resposta;
* chamadas à API do GitHub;
* processamento;
* consumo de recursos;
* custo da infraestrutura.

---

# ❌ CACHE MISS

Quando não existe uma análise para aquele SHA, ocorre um **CACHE MISS**.

Nesse caso, o sistema precisa processar o repositório.

```text
API
 │
 ▼
Redis
 │
 └── Nenhuma análise encontrada
             │
             ▼
        CACHE MISS
             │
             ▼
     Download do projeto
             │
             ▼
      Processamento
             │
             ▼
        Redis Cache
```

---

# 📦 4. Download e processamento

Quando ocorre um `CACHE MISS`, o sistema baixa o repositório para processamento.

O conteúdo é analisado sem executar o código do projeto.

O processamento verifica os arquivos existentes e aplica os filtros e limites definidos pela aplicação.

Além disso, o conteúdo do arquivo ZIP é validado antes do processamento para impedir que um repositório excessivamente grande consuma recursos além do limite estabelecido.

Caso o conteúdo ultrapasse o limite permitido, o sistema processa somente a quantidade de conteúdo que pode ser analisada com segurança.

---

# 💾 5. Armazenamento da análise

Após o processamento, o resultado é salvo no Redis.

O cache possui:

```text
TTL = 24 horas
```

Portanto, uma análise pode ser reutilizada durante esse período enquanto o SHA do repositório permanecer o mesmo.

---

# 🧠 6. Análise com IA

Depois que os arquivos relevantes são processados, eles podem ser enviados para o mecanismo de análise com IA.

A análise utiliza o **Google Gemini** para interpretar o código e gerar informações arquiteturais, como:

* Visão geral;
* Organização do projeto;
* Pontos positivos;
* Pontos de atenção;
* Recomendações.

A IA recebe exclusivamente o conteúdo dos arquivos que foram selecionados pelo pipeline de análise.

Isso evita enviar arquivos desnecessários para o modelo e mantém o processamento controlado.

---

# 💻 7. Persistência no navegador

Depois que a API retorna o resultado completo para o `useHero.ts`, os dados são armazenados no:

```text
sessionStorage
```

O fluxo passa a ser:

```text
API
 │
 ▼
useHero.ts
 │
 ▼
sessionStorage
 │
 ▼
Dashboard
```

O `useDashboard.ts` não precisa executar novamente a análise do GitHub.

Ele simplesmente recupera os dados armazenados no `sessionStorage` e utiliza essas informações para renderizar a interface.

---

# 📊 8. Dashboard

O Dashboard apresenta os dados obtidos durante o processo de análise.

Entre as informações exibidas estão:

* Informações do repositório;
* Stars;
* Forks;
* Linguagem principal;
* Branch;
* Estrutura do projeto;
* Arquivos analisados;
* Tecnologias identificadas;
* Análise arquitetural gerada pela IA;
* Recomendações técnicas.

---

# 🔁 9. O que acontece quando o repositório muda?

O SHA é o mecanismo utilizado para identificar uma versão específica do repositório.

### Mesmo repositório + mesmo SHA

Se o usuário analisar novamente o mesmo repositório dentro das 24 horas:

```text
Repository
    +
Mesmo SHA
    ↓
Redis
    ↓
CACHE HIT
    ↓
Retorno imediato
```

Nenhum novo processamento é necessário.

### Mesmo repositório + novo SHA

Se um novo commit for realizado:

```text
Repository
    +
Novo SHA
    ↓
Redis
    ↓
CACHE MISS
    ↓
Nova análise
```

Mesmo que ainda não tenham passado 24 horas desde a análise anterior, o sistema identifica que o SHA mudou.

Portanto, uma nova versão do código gera uma nova análise.

---

# ⏱️ Estratégia de cache

A combinação entre **SHA + TTL** permite controlar tanto a versão do código quanto o tempo de retenção do resultado.

| Situação                                     | Resultado           |
| -------------------------------------------- | ------------------- |
| Mesmo repositório + mesmo SHA + cache válido | ⚡ CACHE HIT         |
| Mesmo repositório + novo SHA                 | 🔄 Nova análise     |
| Cache expirado                               | 🔄 Nova análise     |
| Repositório nunca analisado                  | 🆕 Primeira análise |

---

# 🏗️ Arquitetura

```text
┌──────────────────────────────────────┐
│              Frontend                │
│                                      │
│  Next.js + React + TypeScript        │
│                                      │
│  ┌──────────────┐                    │
│  │   useHero    │                    │
│  └──────┬───────┘                    │
│         │                             │
│         ▼                             │
│  /api/github/repository               │
│                                      │
│  ┌──────────────┐                    │
│  │ useDashboard │                    │
│  └──────┬───────┘                    │
│         │                             │
│         ▼                             │
│    sessionStorage                    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│             API / Backend            │
│                                      │
│  Validação                           │
│  GitHub API                          │
│  Download                            │
│  Processamento                       │
│  Limites de segurança                │
└──────────────────┬───────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │      Redis      │
          │                 │
          │ owner           │
          │ repository      │
          │ SHA             │
          │                 │
          │ TTL: 24 horas   │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Google Gemini  │
          │                 │
          │ Análise         │
          │ arquitetural    │
          └─────────────────┘
```

---

# 🛠️ Tecnologias

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Redis**
* **Google Gemini**
* **GitHub API**
* **Session Storage**

---

# 🎯 Objetivos do projeto

O GitHub Analyzer foi desenvolvido com foco em:

* Analisar automaticamente repositórios GitHub;
* Identificar a estrutura e tecnologias utilizadas;
* Gerar análises arquiteturais utilizando IA;
* Evitar processamento duplicado através de cache;
* Identificar versões do projeto através do SHA;
* Controlar o consumo de recursos;
* Processar repositórios grandes de maneira limitada e segura;
* Criar uma base para futuramente implementar um pipeline de **RAG**.

---

# 🔮 Próximos passos

A arquitetura atual foi construída pensando na evolução do projeto.

Entre os próximos passos está a implementação de um pipeline de **RAG (Retrieval-Augmented Generation)** utilizando os dados já processados.

A estratégia planejada prioriza uma arquitetura de baixo custo, utilizando **Redis** para armazenar e recuperar os dados necessários ao pipeline, evitando inicialmente a necessidade de uma infraestrutura adicional dedicada a um banco vetorial.

---

## 📌 Fluxo resumido

```text
URL do GitHub
     │
     ▼
useHero.ts
     │
     ▼
POST /api/github/repository
     │
     ▼
Validação
     │
     ▼
Owner + Repository + SHA
     │
     ▼
Redis
     │
     ├───────────────┐
     │               │
 CACHE HIT       CACHE MISS
     │               │
     ▼               ▼
Retorna         Download
dados           Processamento
     │               │
     │               ▼
     │          Salva Redis
     │          TTL 24h
     │               │
     └───────┬───────┘
             ▼
         useHero.ts
             │
             ▼
      sessionStorage
             │
             ▼
         Dashboard
             │
             ▼
       Google Gemini
             │
             ▼
    Análise arquitetural
```

---

## 👨‍💻 Autor

Desenvolvido por **Vanderson Azevedo**.

Projeto desenvolvido com foco em arquitetura de software, processamento de código, cache distribuído, integração com APIs e inteligência artificial.

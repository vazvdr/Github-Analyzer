# GitHub Analyzer

> Plataforma de análise inteligente de repositórios GitHub utilizando IA, processamento de código e Redis como fonte central de dados.

O **GitHub Analyzer** é uma aplicação web desenvolvida para analisar repositórios do GitHub e transformar sua base de código em informações estruturadas sobre arquitetura, tecnologias, organização e qualidade do projeto.

A aplicação utiliza **Next.js, TypeScript, GitHub API, Redis e Google Gemini**, combinando processamento determinístico do código com análise realizada por inteligência artificial.

O projeto foi desenvolvido com foco em **arquitetura simples, baixo custo operacional, segurança no processamento de código e reutilização de dados através de cache baseado na versão exata do repositório**.

---

## ✨ Funcionalidades

* 🔗 Análise de repositórios através da URL do GitHub
* 🌳 Análise da estrutura de arquivos
* 💻 Identificação das principais tecnologias utilizadas
* 🤖 Análise arquitetural utilizando Google Gemini
* 🌎 Análise de IA em português, inglês e espanhol
* 💾 Cache completo utilizando Redis
* 🧩 Processamento e divisão do código em chunks
* 🔐 Validação e processamento seguro de arquivos
* ⚡ Reutilização automática de análises já processadas
* 💬 Chat com IA sobre o código do repositório
* 🛡️ Proteção contra excesso de requisições e análises simultâneas
* 📊 Dashboard com informações estruturadas do projeto

---

# 🏗️ Arquitetura

A arquitetura foi projetada para que o **GitHub seja a fonte de entrada**, enquanto o **Redis seja a fonte de verdade dos dados processados**.

```text
                         ┌─────────────────────┐
                         │      GitHub API     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Repository API    │
                         │      Next.js        │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
                   ▼                                 ▼
          ┌─────────────────┐              ┌─────────────────┐
          │ Repository Data │              │  SHA / Version  │
          └────────┬────────┘              └────────┬────────┘
                   │                                 │
                   └────────────────┬────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │  File Processing    │
                         │                     │
                         │ • filtering         │
                         │ • validation        │
                         │ • size limits       │
                         │ • ZIP security      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Code Chunking     │
                         │                     │
                         │ 100 lines / chunk   │
                         │ 10 lines overlap    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Redis         │
                         │                     │
                         │ Analysis            │
                         │ Chunks              │
                         │ AI Analysis         │
                         │ Chat History        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Google Gemini    │
                         │                     │
                         │ PT / EN / ES        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Dashboard      │
                         └─────────────────────┘
```

---

# 🔑 SHA como identidade da versão

Um dos pontos centrais da arquitetura é que uma análise não é identificada apenas pelo nome do repositório.

Ela é identificada por:

```text
owner + repository + SHA
```

Por exemplo:

```text
github-analyzer:analysis:vazvdr:github-analyzer:a8f4c92...
```

O SHA representa a versão exata do código analisado.

Isso permite diferenciar:

```text
vazvdr/project
        │
        ├── SHA A → versão analisada anteriormente
        │
        └── SHA B → nova versão do projeto
```

Se o usuário analisar novamente o mesmo repositório sem alterações no código, o SHA continuará sendo o mesmo e os dados já processados poderão ser reutilizados.

Se houver um novo commit, o SHA muda e uma nova versão da análise será criada.

### Benefícios

* Evita processamento duplicado
* Evita chamadas desnecessárias ao Gemini
* Mantém análises associadas à versão correta do código
* Permite armazenar diferentes versões do mesmo repositório
* Torna o cache determinístico

---

# 💾 Redis como fonte de verdade

O projeto não utiliza PostgreSQL, pgvector ou uma segunda base de dados para armazenar o estado da análise.

O **Redis é responsável por armazenar os dados processados do repositório**.

A estrutura principal utiliza três tipos de chave:

```text
github-analyzer:analysis:{owner}:{repository}:{sha}

github-analyzer:chunks:{owner}:{repository}:{sha}

github-analyzer:chat:{owner}:{repository}:{sha}
```

## Analysis

Armazena informações gerais e o resultado da análise de IA:

```text
repository
languages
branch
sha
structure
analysis
files
skippedFiles
aiAnalysis
```

## Chunks

Armazena partes processadas do código:

```text
repository
path
content
startLine
endLine
```

## Chat

Armazena o histórico da conversa relacionada àquela versão do repositório.

```text
github-analyzer:chat:{owner}:{repository}:{sha}
```

Dessa forma, todos os dados relacionados a uma determinada versão ficam vinculados ao mesmo SHA.

---

# 🔄 Fluxo de análise

Quando o usuário informa uma URL:

```text
https://github.com/usuario/repositorio
```

o frontend envia:

```http
POST /api/github/repository
```

com:

```json
{
  "action": "analyze",
  "url": "https://github.com/usuario/repositorio"
}
```

O backend então executa o seguinte fluxo:

```text
URL
 │
 ▼
Validação do repositório
 │
 ▼
GitHub API
 │
 ▼
Identificação do SHA
 │
 ▼
Consulta Redis
 │
 ├── HIT ───────────────► reutiliza dados
 │
 └── MISS
       │
       ▼
  Download do código
       │
       ▼
  Validação do ZIP
       │
       ▼
  Processamento dos arquivos
       │
       ▼
  Criação dos chunks
       │
       ▼
  Persistência no Redis
       │
       ▼
  Google Gemini
       │
       ▼
  Análise PT / EN / ES
       │
       ▼
  Persistência no Redis
       │
       ▼
  Dashboard
```

---

# ⚡ Cache HIT e MISS

A aplicação sempre tenta consultar o Redis antes de iniciar um novo processamento pesado.

### Cache HIT

Quando existe uma análise completa para:

```text
owner + repository + SHA
```

o sistema reutiliza os dados armazenados.

```text
GitHub
  ↓
SHA
  ↓
Redis
  ↓
ANÁLISE EXISTENTE
  ↓
Dashboard
```

Nesse cenário não é necessário:

* baixar novamente o repositório;
* processar novamente os arquivos;
* criar novamente os chunks;
* chamar o Gemini novamente.

### Cache MISS

Quando não existe uma análise para aquele SHA:

```text
GitHub
  ↓
SHA
  ↓
Redis
  ↓
NÃO ENCONTRADO
  ↓
Processamento
  ↓
Chunks
  ↓
Gemini
  ↓
Redis
  ↓
Dashboard
```

---

# 🧩 Processamento do código

O código do repositório não é enviado diretamente para a IA sem processamento.

Antes disso, existe uma etapa responsável por selecionar e preparar os arquivos.

O processador possui mecanismos para:

* ignorar diretórios desnecessários;
* ignorar arquivos gerados;
* ignorar arquivos de dependências;
* limitar quantidade de arquivos;
* limitar tamanho individual;
* limitar tamanho total;
* normalizar caminhos;
* detectar arquivos ignorados;
* evitar processamento de conteúdo excessivamente grande.

Arquivos e diretórios como:

```text
node_modules
.git
dist
build
.next
coverage
*.lock
*.map
```

podem ser descartados antes da análise.

Isso reduz o volume de dados processados e evita enviar conteúdo irrelevante para o modelo.

---

# 🔐 Segurança no processamento

O repositório é obtido como conteúdo para leitura e análise.

O código recebido **não é executado** pelo sistema.

O fluxo é baseado em:

```text
Download
   ↓
Validação
   ↓
Extração
   ↓
Leitura
   ↓
Processamento
```

Também existem verificações relacionadas ao ZIP e aos caminhos dos arquivos para evitar problemas como caminhos malformados ou conteúdo fora do diretório esperado.

A aplicação também possui limites para controlar:

* tamanho do repositório;
* quantidade de arquivos;
* tamanho dos arquivos;
* tamanho total do conteúdo;
* quantidade de análises simultâneas;
* frequência de requisições.

---

# ✂️ Chunking

Depois do processamento, os arquivos são divididos em partes menores.

A estratégia atual utiliza:

```text
100 linhas por chunk
10 linhas de overlap
```

Exemplo:

```text
Chunk 1
linhas 1 → 100

Chunk 2
linhas 91 → 190

Chunk 3
linhas 181 → 280
```

O overlap permite preservar contexto entre o final de um chunk e o início do próximo.

Cada chunk possui uma identificação determinística:

```text
src/example.ts:1-100
src/example.ts:91-190
src/example.ts:181-280
```

Isso facilita a reutilização e a localização do código durante consultas futuras.

---

# 🤖 Análise com Google Gemini

A análise arquitetural é realizada pelo Google Gemini.

Um ponto importante da arquitetura é que **uma única chamada de IA gera as três versões linguísticas da análise**.

A resposta possui a estrutura:

```json
{
  "pt": {
    "overview": "...",
    "architecture": "...",
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  },
  "en": {
    "overview": "...",
    "architecture": "...",
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  },
  "es": {
    "overview": "...",
    "architecture": "...",
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  }
}
```

A IA é instruída a manter os mesmos fatos entre os idiomas, alterando apenas a língua utilizada.

Isso evita fazer uma nova chamada ao Gemini sempre que o usuário alterar o idioma.

---

# 🌎 Internacionalização da análise

Existem dois conceitos diferentes no frontend:

### `initialLanguage`

É o idioma selecionado pelo usuário no momento em que ele inicia a análise.

Exemplo:

```text
Landing
   │
   ├── idioma = EN
   │
   ▼
Analyze
   │
   ▼
Dashboard inicia em EN
```

Esse valor é armazenado apenas no estado da interface/sessionStorage.

**Ele não é armazenado no Redis.**

### `currentLanguage`

É o idioma atual selecionado pelo usuário no Dashboard.

Se o usuário fizer:

```text
EN → PT → ES
```

o frontend simplesmente seleciona:

```text
aiAnalysis.en
aiAnalysis.pt
aiAnalysis.es
```

respectivamente.

Nenhuma nova chamada ao Gemini é necessária.

---

# 💬 Chat com o repositório

O chat é tratado como uma camada diferente da análise inicial.

A análise arquitetural é relativamente estática para um determinado SHA.

Já o chat é dinâmico:

```text
Pergunta do usuário
        ↓
Histórico
        ↓
Análise arquitetural
        ↓
Seleção dos chunks relevantes
        ↓
Google Gemini
        ↓
Resposta
        ↓
Histórico no Redis
```

O objetivo é evitar enviar todo o código do repositório a cada pergunta.

Em vez disso, o sistema trabalha com os chunks previamente processados e seleciona apenas os trechos mais relevantes para a pergunta.

A estrutura conceitual é:

```text
Repository
     │
     ▼
Chunks armazenados no Redis
     │
     ▼
Pergunta
     │
     ▼
Seleção de chunks relevantes
     │
     ├── Architecture Analysis
     ├── Relevant Code
     └── Chat History
              │
              ▼
         Google Gemini
              │
              ▼
           Response
```

O histórico também é associado ao SHA:

```text
github-analyzer:chat:{owner}:{repository}:{sha}
```

Assim, uma conversa não é misturada com outra versão do mesmo projeto.

---

# 🛡️ Proteção de requisições

Analisar um repositório é uma operação mais pesada que uma requisição comum.

Por isso existe uma camada específica de proteção.

Ela controla:

### Rate limiting

Limita a frequência de requisições por IP.

### Concurrency control

Limita a quantidade de análises pesadas executadas simultaneamente.

```text
Request
   │
   ▼
Request Protection
   │
   ├── Rate limit
   │
   └── Analysis slot
          │
          ▼
      Repository
```

O chat não precisa utilizar o mesmo slot de processamento pesado da análise inicial.

---

# 🖥️ Fluxo do Frontend

O frontend possui três momentos principais:

```text
Landing
   │
   ▼
useHero
   │
   ▼
POST /api/github/repository
   │
   ▼
sessionStorage
   │
   ▼
Dashboard
   │
   ├── Repository
   ├── Statistics
   ├── Technologies
   ├── Architecture
   ├── Chat
   └── Project Structure
```

O `sessionStorage` é utilizado para transportar o resultado da análise entre Landing e Dashboard.

Ele funciona como estado temporário da interface.

O Redis é a fonte de verdade do backend.

---

# 🧱 Responsabilidades

## `app/api/github`

Responsável pelas entradas HTTP relacionadas ao GitHub.

A rota principal concentra a lógica de análise do repositório e, progressivamente, também as operações relacionadas ao chat.

---

## `lib/github`

Responsável pelo processamento relacionado ao GitHub:

* comunicação com a API;
* validação de URLs;
* análise da árvore de arquivos;
* filtros;
* limites;
* segurança do ZIP;
* processamento do conteúdo;
* criação dos chunks.

---

## `lib/redis`

Centraliza a persistência e recuperação dos dados no Redis.

A camada possui responsabilidades como:

```text
Redis Client
     ↓
Redis Cache
     ↓
Repository Cache
```

Isso evita espalhar chamadas diretas ao Redis pela aplicação.

---

## `lib/ai`

Responsável pela comunicação com o Gemini.

Separação atual:

```text
gemini-client.ts
        │
        ├── gemini-analysis.ts
        │
        └── gemini-chat.ts
```

O client concentra a comunicação com o modelo, enquanto os módulos específicos cuidam dos prompts e regras de cada tipo de operação.

---

## `hooks`

Contém a lógica de estado do frontend.

Exemplos:

```text
useHero
   ↓
Landing / análise

useDashboard
   ↓
Dashboard / dados da análise

useRepositoryChat
   ↓
Chat / perguntas
```

---

# 🛠️ Stack

### Frontend / Backend

* Next.js
* React
* TypeScript
* Tailwind CSS

### IA

* Google Gemini
* `@google/genai`

### Dados

* Redis

### Integrações

* GitHub API

### Internacionalização

* i18next
* react-i18next

---

# 🔐 Variáveis de ambiente

Crie um arquivo `.env.local`:

```env
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
REDIS_PUBLIC_URL=your_redis_url
```

As credenciais não devem ser versionadas no repositório.

---

# 🚀 Instalação

Clone o projeto:

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

Instale as dependências:

```bash
npm install
```

Configure o `.env.local`.

Depois execute:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

---

# 📌 Princípios arquiteturais

O projeto segue alguns princípios importantes:

### 1. GitHub é a fonte de entrada

O código original vem do GitHub.

### 2. Redis é a fonte de verdade

Tudo que foi processado e precisa ser reutilizado fica no Redis.

### 3. SHA representa a versão

Cada análise está vinculada à versão exata do código.

### 4. Processar uma vez, reutilizar várias

O sistema evita repetir operações caras quando os dados já existem.

### 5. IA não deve ser chamada desnecessariamente

Mudanças de idioma não geram novas chamadas para a análise arquitetural.

### 6. Processamento seguro

O código do usuário é tratado como conteúdo, não como código executável.

### 7. Separação entre análise e chat

A análise inicial é persistida e reutilizada.

O chat é uma interação dinâmica baseada nos dados já processados.

### 8. Estado de interface não é estado persistente

Informações como `initialLanguage` pertencem ao frontend e não fazem parte da persistência da análise.

---

# 🗺️ Evolução da arquitetura

A arquitetura foi construída para permitir evolução sem alterar o princípio central:

```text
                    ┌───────────────────┐
                    │     GitHub API    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Repository Layer  │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ File Processing   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │      Chunks       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │      Redis        │
                    │                   │
                    │ Analysis          │
                    │ Chunks            │
                    │ Chat              │
                    └─────────┬─────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
          ┌───────────────┐       ┌───────────────┐
          │ Gemini        │       │ Chat          │
          │ Analysis      │       │ Context       │
          └───────┬───────┘       └───────┬───────┘
                  │                       │
                  └───────────┬───────────┘
                              ▼
                       ┌──────────────┐
                       │  Dashboard   │
                       └──────────────┘
```

A arquitetura permite que novas estratégias de recuperação de contexto sejam adicionadas futuramente sem abandonar o Redis como fonte de verdade.

---

# 📄 Licença

Este projeto é de uso pessoal e experimental.

Consulte o arquivo `LICENSE` para mais informações.

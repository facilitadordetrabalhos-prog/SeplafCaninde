# Seplaf Canindé

Portal da **Secretaria Municipal de Finanças de Canindé/CE**.

- **Reforma Tributária:** guias, cronograma, perguntas frequentes e vídeos, sempre com a base legal. Inclui as notícias oficiais do Comitê Gestor do IBS (CGIBS), capturadas automaticamente.
- **NFS-e Nacional:** ambiente para preparar os prestadores de serviço para o Emissor Nacional, com primeiro acesso, guia ilustrado tela por tela, PDFs oficiais, vídeos, agendamento presencial e oficinas.
- **Fale com a Secretaria:** dúvidas com protocolo e respostas por e-mail; perguntas de eventos (ex.: Conexão Empresarial) respondidas por tema.
- **Serviços online:** atalhos para 2ª via do IPTU, ISS Eletrônico, certidão, débitos/DAM e os contatos da Diretoria de Arrecadação.
- **Área da equipe:** monitor do CGIBS, caixa de dúvidas, conteúdo com aprovação, prazos, NFS-e, serviços, módulos, configurações e usuários.

| Pasta | O que é |
|---|---|
| `backend/` | API em **NestJS + TypeORM** (porta 3000, prefixo `/api`). Em produção também serve o site. |
| `frontend/` | Site em **React + Vite + TypeScript**. |
| `docs/API.md` | Contrato da API: entidades, rotas, perfis, variáveis de ambiente. |
| `prototipo/` | Protótipo navegável aprovado (HTML único), referência visual. |

## Rodar no computador

Requer Node.js 20 ou mais novo.

```bash
npm run instalar
cp backend/.env.example backend/.env   # preencha JWT_SECRET, ADMIN_EMAIL e ADMIN_SENHA
npm run dev:backend                    # http://localhost:3000/api
npm run dev:frontend                   # http://localhost:5173 (em outro terminal)
```

No desenvolvimento o banco é um arquivo local (`backend/data/seplaf.sqlite`, `DB_TYPE=sqljs`), sem instalar nada.
Na primeira inicialização o sistema cria o gestor definido em `ADMIN_EMAIL`/`ADMIN_SENHA` e carrega o conteúdo inicial (serviços, prazos, guia, perguntas frequentes, temas do evento).

## Publicar na Hostinger (Node.js)

1. **Banco:** no hPanel, crie um banco **MySQL** e anote host, usuário, senha e nome do banco.
2. **Importar o repositório:** em *Websites → Adicionar → Node.js App → Importar repositório Git*, escolha este repositório e a branch `main`.
3. **Configurações de build:**
   - Versão do Node: **20** ou **22**
   - Comando de build: `npm run build`
   - Comando de início: `npm start` (arquivo de entrada: `backend/dist/main.js`)
4. **Variáveis de ambiente:**

   | Variável | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DB_TYPE` | `mysql` |
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | dados do banco do passo 1 (porta normalmente `3306`) |
   | `DB_SYNC` | `true` **na primeira implantação** (cria as tabelas); depois pode voltar para `false` |
   | `JWT_SECRET` | texto longo e aleatório |
   | `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA` | primeiro gestor da área da equipe |
   | `PUBLIC_URL` | endereço do portal (ex.: `https://financas.caninde.ce.gov.br`) |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | e-mail para enviar respostas e protocolos (sem isso, os e-mails só ficam no log) |

   A Hostinger define a `PORT` sozinha. Lista completa em `backend/.env.example`.

5. Depois do deploy, entre em `/equipe/login` com o gestor e troque a senha em *Usuários*.

## Dados pessoais

As planilhas de inscrição de eventos e de prestadores contêm dados pessoais. Elas **são importadas pela área da equipe** e **nunca entram no repositório**: o `.gitignore` bloqueia `*.csv` e `*.xlsx`.
Na página pública de um evento aparecem só a pergunta e o segmento do participante, nunca nome ou contato.

## Fontes do conteúdo

- **Normas:** LC 214/2025 e EC 132/2023 (texto do Planalto); Resolução CGSN 194.
- **Notícias:** cgibs.gov.br, sincronizadas a cada 2 horas.
- **NFS-e:** Guia do Emissor Público Nacional Web v1.2 e e-book “Passo a passo: cadastramento e emissão de NFS-e” (Sebrae/Receita Federal); vídeos do canal oficial do Sebrae.

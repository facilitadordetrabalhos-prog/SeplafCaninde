# Seplaf Canindé — contrato da API

Portal da Secretaria de Finanças de Canindé/CE: Reforma Tributária, notícias oficiais do Comitê Gestor do IBS (CGIBS),
dúvidas dos contribuintes, ambiente NFS-e Nacional, serviços online e eventos. Protótipo de referência: `prototipo/index.html`.

## Arquitetura

```
backend/   NestJS 10 + TypeORM  — porta 3000, prefixo /api
frontend/  React 18 + Vite + TypeScript + react-router — porta 5173, proxy /api -> 3000
```

- Banco: `DB_TYPE=sqljs` (padrão no desenvolvimento, arquivo `backend/data/seplaf.sqlite`, sem dependência nativa)
  ou `DB_TYPE=postgres` com `DATABASE_URL` (produção). `synchronize: true` só quando `NODE_ENV!=='production'`.
- Em produção o Nest serve o build do frontend (`frontend/dist`) em `/` (ServeStaticModule, excluindo `/api`).
- Datas: ISO 8601. Datas sem hora (prazos, agendamentos): `YYYY-MM-DD`.
- Erros: formato padrão do Nest (`{ statusCode, message, error }`), mensagens em português.
- Validação com `class-validator` (`ValidationPipe({ whitelist: true, transform: true })`).
- Nada de dados pessoais em seeds. Planilhas de inscrição são importadas pela área administrativa e nunca versionadas.

## Variáveis de ambiente (backend/.env — nunca versionado; `.env.example` versionado)

```
PORT=3000
NODE_ENV=development
DB_TYPE=sqljs                 # ou postgres
DATABASE_URL=                 # postgres://...
JWT_SECRET=                   # obrigatório
ADMIN_NOME=Administrador
ADMIN_EMAIL=                  # cria o primeiro gestor no boot se não existir nenhum usuário
ADMIN_SENHA=
SMTP_HOST= SMTP_PORT=587 SMTP_USER= SMTP_PASS= SMTP_FROM="Secretaria de Finanças de Canindé <...>"
                              # sem SMTP_HOST, e-mails são apenas registrados no log
CGIBS_SYNC_CRON=0 */2 * * *   # sincronização das notícias do CGIBS
CGIBS_SYNC_ATIVO=true
```

## Perfis

| perfil   | pode |
|----------|------|
| `gestor` | tudo; aprovar conteúdo e temas de evento; módulos, serviços, configurações, usuários |
| `editor` | criar/editar conteúdo (vai para aprovação), curadoria do monitor CGIBS, prazos |
| `equipe` | responder dúvidas, dúvidas de evento, agendamentos e oficinas NFS-e, prestadores |

Rotas `/api/admin/*` exigem `Authorization: Bearer <token>`; restrições por perfil indicadas como `[gestor]`, `[gestor,editor]`.
Sem indicação = qualquer perfil autenticado.

---

## Entidades

**Usuario** id, nome, email (único), senhaHash (bcryptjs), perfil, ativo, criadoEm

**Config** chave (PK), valor (texto/JSON). Chaves iniciais (seed):
- `contatos` → `{ orgao:"Diretoria de Arrecadação", endereco:"Rua Valdery Uchoa, 597 (esquina com a Rua Gervásio Martins, 134) · Centro · Canindé-CE · 62700-000", horario:"seg. a qui., 7h30 às 17h · sex., 7h30 às 13h30", email:"setortributoscaninde@gmail.com", telefone:"(85) 9 8193-4279", telefoneLink:"tel:+5585981934279", mapaUrl:"https://www.google.com/maps/search/?api=1&query=Rua+Valdery+Uchoa%2C+597%2C+Centro%2C+Caninde+CE", portalServicosUrl:"https://servicos2.speedgov.com.br/caninde" }`
- `nfse` → `{ dataInicio:null, emissorUrl:"https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2femissornacional", issMunicipalUrl:"https://iss.speedgov.com.br/caninde/login", prazoSubstituicaoDias:null, prazoCancelamentoDias:null }`
- `cgibs` → `{ autoPublicarTituloLink:true, fontes:{noticias:true} , ultimaVerificacao:null }`

**Modulo** chave (PK), nome, descricao, ativo, publico (bool). Seed: `reforma` (ativo), `noticias-cgibs` (ativo), `duvidas` (ativo),
`nfse` (ativo), `servicos` (ativo), `eventos` (ativo).

**ServicoOnline** id, titulo, descricao, url, icone (emoji), aviso (texto|null), avisoTipo (`mudanca`|`boa`|null), destaque (bool, aparece nos atalhos da home), ordem, ativo.
Seed (do protótipo): 2ª via do IPTU (aviso boa: pagamento com cartão de crédito), ISS Eletrônico de Canindé (aviso mudanca: em breve só não optantes do Simples),
Emissor Nacional da NFS-e, Certidão da empresa, Regularização de débitos e DAM (Portal de Serviços).

**NoticiaOficial** id, link (único), titulo, resumo, data, tipo (`noticia`|`comunicado`|`legislacao`), imagemUrl|null, status (`nova`|`publicada`|`ignorada`),
publico (texto|null), temPrazo (bool), prazoAlterado (bool), explicacaoLocal (texto|null), capturadaEm, publicadaEm|null.

**Prazo** id, titulo, quem, ate (date), fonte, ativo, noticiaId|null. Seed: 4 prazos do protótipo (15/10, 30/10, 30/10, 31/10/2026).

**Conteudo** id, tipo (`guia`|`dica`|`noticia_local`|`video`|`material`|`faq`), titulo, slug (único), publico (`todos`|`mei`|`empresa`|`servico`|`contador`|`cidadao`),
resumo, corpo (HTML), baseOficial, videoUrl|null, anexoUrl|null, destaque (bool), status (`rascunho`|`aguardando`|`publicado`), autorId, criadoEm, atualizadoEm, publicadoEm|null.
Seed: guia “Simples puro ou híbrido” e os itens de FAQ do protótipo (status publicado).

**Duvida** id, protocolo (único, `DUV-AAAA-NNNNN`), nome, email, telefone|null, perfil, assunto, segmento|null, texto, autorizaPublicar (bool),
origem (`portal`|`nfse`|`evento`), eventoId|null, tema|null, status (`nova`|`em_resposta`|`respondida`|`publicada`|`incompleta`),
responsavelId|null, resposta|null, baseOficial|null, criadoEm, respondidoEm|null.

**Evento** id, slug (único), nome, data, descricao, imagemUrl, totalInscritos, totalPessoas. Seed: `conexao-empresarial-2026`, “Conexão Empresarial Canindé”, 2026-09-19, imagem `/img/conexao-empresarial.webp`, totais 0.

**TemaEvento** id, eventoId, chave, titulo, resposta (HTML), baseOficial, links (JSON `[{rotulo, rota}]`), ordem, aprovado (bool).
Seed: os 7 temas de `EVENTO_TEMAS` em `prototipo/index.html` (geral, simples, mei, precos, servicos, exterior, incompleta), aprovado=false.

**Oficina** id, titulo, data, hora, local, publico, vagas, ativo. **InscricaoOficina** id, oficinaId, nome, email, telefone|null, criadoEm.

**Agendamento** id, cpfCnpj, nome, email|null, telefone|null, motivo, dataPreferida, turno (`manha`|`tarde`), status (`agendado`|`atendido`|`faltou`|`cancelado`), observacao|null, criadoEm.

**Prestador** id, nome, cpfCnpj (único), perfil (`MEI`|`Simples`|`Presumido`|`Real`|`Outro`), situacao (`sem_acesso`|`acessou`|`emitindo`|`bloqueado`), contador|null, email|null, atualizadoEm.

---

## Rotas públicas

| método | rota | corpo / query | resposta |
|---|---|---|---|
| GET | `/api/config/publica` | | `{ contatos, nfse:{dataInicio, emissorUrl, issMunicipalUrl, prazoSubstituicaoDias, prazoCancelamentoDias}, modulos:[{chave,nome,ativo}] }` |
| GET | `/api/servicos` | | `ServicoOnline[]` ativos, por `ordem` |
| GET | `/api/noticias` | `tipo?`, `prazo?=true`, `local?=true`, `limite?` | `NoticiaOficial[]` publicadas, mais recentes primeiro, com campo calculado `nova` (publicada há ≤ 7 dias) |
| GET | `/api/noticias/sincronizacao` | | `{ ultimaVerificacao }` |
| GET | `/api/prazos` | | `Prazo[]` ativos com `ate >= hoje`, por data |
| GET | `/api/conteudos` | `tipo?`, `publico?`, `destaque?` | `Conteudo[]` publicados (sem `corpo`) |
| GET | `/api/conteudos/:slug` | | `Conteudo` publicado |
| GET | `/api/faq` | `publico?`, `q?` | `[{id, pergunta, resposta, publico, baseOficial, atualizadoEm}]` (conteúdos tipo `faq` publicados) |
| POST | `/api/duvidas` | `{nome, email, perfil, assunto, texto, autorizaPublicar, origem?: 'portal'|'nfse'}` | `201 {protocolo}` |
| GET | `/api/duvidas/protocolo/:protocolo` | | `{protocolo, status, criadoEm, respondidoEm}` (sem dados pessoais nem resposta) |
| GET | `/api/eventos` | | `[{id, slug, nome, data, descricao, imagemUrl, totalPessoas, totalPerguntas}]` |
| GET | `/api/eventos/:slug` | | `{...evento, totalPerguntas, temas:[{id, chave, titulo, resposta, baseOficial, links, qtd, citacoes:[{pergunta, segmento}]}]}` — só temas `aprovado` e ≠ `incompleta`; até 3 citações com pergunta > 12 caracteres; **nunca nome/e-mail** |
| GET | `/api/nfse/oficinas` | | `[{id, titulo, data, hora, local, publico, vagas, inscritos}]` ativas e futuras |
| POST | `/api/nfse/oficinas/:id/inscricoes` | `{nome, email, telefone?}` | `201 {ok:true}`; 409 se lotada |
| POST | `/api/nfse/agendamentos` | `{cpfCnpj, nome, email?, telefone?, motivo, dataPreferida, turno}` | `201 {id, mensagem}` (mensagem inclui endereço e horário de `contatos`) |

## Autenticação

| POST | `/api/auth/login` | `{email, senha}` | `{token, usuario:{id, nome, email, perfil}}` — 401 se inválido |
| GET | `/api/auth/eu` | (Bearer) | `{id, nome, email, perfil}` |

## Rotas administrativas (`/api/admin`, Bearer)

| método | rota | perfis | corpo / resposta |
|---|---|---|---|
| GET | `/resumo` | todos | `{duvidasNovas, duvidasEmResposta, noticiasNovas, conteudosAguardando, agendamentosHoje, perguntasEventoPendentes}` |
| GET | `/noticias` | gestor,editor | `?status=` → `NoticiaOficial[]` |
| PATCH | `/noticias/:id` | gestor,editor | `{status?, publico?, temPrazo?, prazoAlterado?, explicacaoLocal?, prazo?:{titulo, quem, ate, fonte}}` → noticia (cria Prazo se `prazo`) |
| POST | `/noticias/sincronizar` | gestor,editor | → `{novas, total, ultimaVerificacao}` |
| GET/POST | `/prazos` | gestor,editor | lista / cria |
| PATCH/DELETE | `/prazos/:id` | gestor,editor | |
| GET | `/conteudos` | gestor,editor | `?status=&tipo=` → todos |
| POST | `/conteudos` | gestor,editor | `{tipo, titulo, publico, resumo, corpo, baseOficial, videoUrl?, anexoUrl?, destaque?, enviarParaAprovacao?}` → status `aguardando` ou `rascunho`; gestor pode mandar `publicar:true` |
| PATCH | `/conteudos/:id` | gestor,editor | parcial |
| POST | `/conteudos/:id/aprovar` | gestor | → publicado |
| DELETE | `/conteudos/:id` | gestor | |
| GET | `/duvidas` | todos | `?status=&origem=&eventoId=` → `Duvida[]` (com e-mail, só para equipe) |
| GET/PATCH | `/duvidas/:id` | todos | PATCH `{status?, responsavelId?, tema?}` |
| POST | `/duvidas/:id/responder` | todos | `{resposta, baseOficial?, publicarNoFaq?, publicoFaq?}` → envia e-mail, status `respondida` (ou `publicada` + cria Conteudo faq **aguardando** se `publicarNoFaq` e `autorizaPublicar`) |
| GET | `/usuarios` | todos | lista resumida `{id, nome, perfil}` (para atribuir responsável) |
| POST/PATCH | `/usuarios`, `/usuarios/:id` | gestor | `{nome, email, perfil, senha?, ativo?}` |
| GET | `/eventos` | todos | lista |
| POST | `/eventos` | gestor | cria |
| POST | `/eventos/:id/importar` | gestor,equipe | multipart `arquivo` (CSV `;`, colunas do formulário: `full_name, email, phone, segment, company_name, role_title, attendees_count, tax_question, consent`) → `{inscricoes, pessoas, comPergunta, novas}`; cria Duvida origem `evento` para cada linha com `tax_question`, tema `null`; atualiza totais do evento; idempotente por e-mail+pergunta |
| GET | `/eventos/:id/perguntas` | todos | `[{id, nome, segmento, pergunta, tema, status}]` |
| PATCH | `/eventos/perguntas/:duvidaId` | todos | `{tema}` (`incompleta` → status `incompleta`) |
| GET | `/eventos/:id/temas` | todos | `TemaEvento[]` com `qtd` |
| PUT | `/eventos/:id/temas/:temaId` | gestor,editor | `{titulo?, resposta?, baseOficial?, links?}` → volta `aprovado=false` |
| POST | `/eventos/:id/temas/aprovar` | gestor | aprova todos os temas → publica na página do evento |
| POST | `/eventos/:id/enviar-respostas` | gestor,equipe | envia, a cada participante com tema aprovado ainda não respondido, e-mail com a resposta do tema + link da página do evento; marca `respondida` → `{enviadas}` |
| GET/PATCH | `/nfse/agendamentos`, `/nfse/agendamentos/:id` | todos | `?data=&status=` ; PATCH `{status, observacao}` |
| GET/POST/PATCH/DELETE | `/nfse/oficinas[/:id]` | todos | GET inclui `inscricoes` |
| GET | `/nfse/prestadores` | todos | `?situacao=` → lista + `{funil:{total, acessou, emitindo, bloqueados}}` |
| POST | `/nfse/prestadores/importar` | todos | multipart CSV `nome;cpf_cnpj;perfil;situacao;contador;email` → `{importados, atualizados}` |
| GET/POST/PATCH/DELETE | `/servicos[/:id]` | gestor | |
| GET/PUT | `/config/:chave` | gestor | valor JSON |
| GET/PATCH | `/modulos`, `/modulos/:chave` | gestor | `{ativo}` |

## Sincronização CGIBS

Fonte: `GET https://www.cgibs.gov.br/_service/conteudo/pagedlistfilho?id=104&templatename=pagina.listanoticias.cards&currentPage=1&pageSize=20&fields%5B%5D=Titulo&fields%5B%5D=TituloCurto&fields%5B%5D=Texto&form%5Bordem%5D=RECENTES`
→ JSON `{recordcount, body}`; `body` é HTML. Cada item: `.artigo__listapaginas__item`; data em `time[datetime]`; título em `h3 a`; link `href` relativo a `https://www.cgibs.gov.br`;
resumo em `p.artigo__listapaginas__item__descricao`; imagem em `img[src]`. Parse com `cheerio`. Itens novos (link inédito) entram como `nova`;
se `cgibs.autoPublicarTituloLink` → `publicada` direto (sem explicação). Heurística `temPrazo`: título/resumo contém “prazo”. Atualiza `cgibs.ultimaVerificacao`.
Falha de rede não derruba a aplicação (log e segue). Cron em `CGIBS_SYNC_CRON`; também roda 10 s após o boot se a tabela estiver vazia.

## Frontend — rotas

Público (layout com faixa ilustrada, topo com logo, menu lateral, rodapé com contatos de `/api/config/publica`):
`/` início · `/reforma/entenda` · `/reforma/cronograma` · `/reforma/noticias` · `/reforma/guias/:slug` · `/reforma/perguntas` (FAQ + formulário de dúvida + consulta de protocolo) ·
`/reforma/videos` · `/servicos` · `/eventos/:slug` ·
NFS-e (menu próprio, banner escuro): `/nfse` · `/nfse/primeiro-acesso` · `/nfse/emitir` · `/nfse/guia-ilustrado` · `/nfse/depois-de-emitir` · `/nfse/problemas` · `/nfse/materiais`

Equipe (`/equipe/*`, login em `/equipe/login`, token em `localStorage` com try/catch): painel · monitor CGIBS · dúvidas · dúvidas de evento (importar CSV, classificar, editar/aprovar temas, enviar) ·
conteúdo · prazos · NFS-e (agendamentos, oficinas, prestadores) · serviços · módulos · configurações · usuários.

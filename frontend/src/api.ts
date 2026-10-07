/* Cliente da API do Seplaf Canindé (contrato em docs/API.md).
   Base /api — em desenvolvimento o Vite faz proxy para http://localhost:3000. */

// ---------------------------------------------------------------- tipos

export type Perfil = 'gestor' | 'editor' | 'equipe';
export type TipoNoticia = 'noticia' | 'comunicado' | 'legislacao' | 'video' | 'material';
export type StatusNoticia = 'nova' | 'publicada' | 'ignorada';
export type PublicoConteudo = 'todos' | 'mei' | 'empresa' | 'servico' | 'contador' | 'cidadao';
export type TipoConteudo = 'guia' | 'dica' | 'noticia_local' | 'video' | 'material' | 'faq';
export type StatusConteudo = 'rascunho' | 'aguardando' | 'publicado';
export type StatusDuvida = 'nova' | 'em_resposta' | 'respondida' | 'publicada' | 'incompleta';
export type OrigemDuvida = 'portal' | 'nfse' | 'evento';
export type StatusAgendamento = 'agendado' | 'atendido' | 'faltou' | 'cancelado';
export type SituacaoPrestador = 'sem_acesso' | 'acessou' | 'emitindo' | 'bloqueado';

export interface Contatos {
  orgao: string;
  endereco: string;
  horario: string;
  email: string;
  telefone: string;
  telefoneLink: string;
  mapaUrl: string;
  portalServicosUrl: string;
}

export interface ConfigNfse {
  dataInicio: string | null;
  emissorUrl: string;
  issMunicipalUrl: string;
  prazoSubstituicaoDias: number | null;
  prazoCancelamentoDias: number | null;
}

export interface ModuloPublico {
  chave: string;
  nome: string;
  ativo: boolean;
}

export interface ConfigPublica {
  contatos: Contatos;
  nfse: ConfigNfse;
  /** true quando o servidor de e-mail está configurado (as respostas realmente saem por e-mail). */
  emailAtivo: boolean;
  modulos: ModuloPublico[];
}

export interface ServicoOnline {
  id: number;
  titulo: string;
  descricao: string;
  url: string;
  icone: string;
  aviso: string | null;
  avisoTipo: 'mudanca' | 'boa' | null;
  destaque: boolean;
  ordem: number;
  ativo: boolean;
}

export interface NoticiaOficial {
  id: number;
  link: string;
  titulo: string;
  resumo: string;
  data: string;
  tipo: TipoNoticia;
  imagemUrl: string | null;
  status: StatusNoticia;
  publico: string | null;
  temPrazo: boolean;
  prazoAlterado: boolean;
  explicacaoLocal: string | null;
  capturadaEm: string;
  publicadaEm: string | null;
  nova?: boolean;
}

export interface Prazo {
  id: number;
  titulo: string;
  quem: string;
  ate: string;
  fonte: string;
  ativo: boolean;
  noticiaId: number | null;
}

export interface Conteudo {
  id: number;
  tipo: TipoConteudo;
  titulo: string;
  slug: string;
  publico: PublicoConteudo;
  resumo: string;
  corpo?: string;
  baseOficial: string;
  videoUrl: string | null;
  anexoUrl: string | null;
  destaque: boolean;
  status: StatusConteudo;
  autorId?: number | null;
  criadoEm: string;
  atualizadoEm: string;
  publicadoEm: string | null;
}

export interface ItemFaq {
  id: number;
  pergunta: string;
  resposta: string;
  publico: PublicoConteudo;
  baseOficial: string;
  atualizadoEm: string;
}

export interface NovaDuvida {
  nome: string;
  email: string;
  perfil: string;
  assunto: string;
  texto: string;
  autorizaPublicar: boolean;
  origem?: 'portal' | 'nfse';
}

export interface SituacaoProtocolo {
  protocolo: string;
  status: StatusDuvida;
  criadoEm: string;
  respondidoEm: string | null;
  /** O e-mail informado confere com o da pergunta (só então vem a resposta). */
  emailConfere?: boolean;
  resposta?: string | null;
  baseOficial?: string | null;
}

export interface EventoResumo {
  id: number;
  slug: string;
  nome: string;
  data: string;
  descricao: string;
  imagemUrl: string;
  totalPessoas: number;
  totalPerguntas: number;
  totalInscritos?: number;
  /** Temas com resposta aprovada e publicada na página do evento. */
  temasPublicados?: number;
}

export interface LinkTema {
  rotulo: string;
  rota: string;
}

export interface TemaPublico {
  id: number;
  chave: string;
  titulo: string;
  resposta: string;
  baseOficial: string;
  links: LinkTema[];
  qtd: number;
  citacoes: { pergunta: string; segmento: string | null }[];
}

export interface EventoDetalhe extends EventoResumo {
  totalInscritos?: number;
  temas: TemaPublico[];
}

export interface OficinaPublica {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  local: string;
  publico: string;
  vagas: number;
  inscritos: number;
}

export interface NovoAgendamento {
  cpfCnpj: string;
  nome: string;
  email?: string;
  telefone?: string;
  motivo: string;
  dataPreferida: string;
  turno: 'manha' | 'tarde';
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo?: boolean;
}

export interface Resumo {
  duvidasNovas: number;
  duvidasEmResposta: number;
  noticiasNovas: number;
  conteudosAguardando: number;
  agendamentosHoje: number;
  perguntasEventoPendentes: number;
}

export interface Duvida {
  id: number;
  protocolo: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: string;
  assunto: string;
  segmento: string | null;
  texto: string;
  autorizaPublicar: boolean;
  origem: OrigemDuvida;
  eventoId: number | null;
  tema: string | null;
  status: StatusDuvida;
  responsavelId: number | null;
  resposta: string | null;
  baseOficial: string | null;
  criadoEm: string;
  respondidoEm: string | null;
}

export interface PerguntaEvento {
  id: number;
  nome: string;
  segmento: string | null;
  pergunta: string;
  tema: string | null;
  status: StatusDuvida;
}

export interface TemaEvento {
  id: number;
  eventoId: number;
  chave: string;
  titulo: string;
  resposta: string;
  baseOficial: string;
  links: LinkTema[];
  ordem: number;
  aprovado: boolean;
  qtd?: number;
}

export interface ResultadoImportacaoEvento {
  inscricoes: number;
  pessoas: number;
  comPergunta: number;
  novas: number;
}

export interface Agendamento {
  id: number;
  cpfCnpj: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  motivo: string;
  dataPreferida: string;
  turno: 'manha' | 'tarde';
  status: StatusAgendamento;
  observacao: string | null;
  criadoEm: string;
}

export interface InscricaoOficina {
  id: number;
  oficinaId: number;
  nome: string;
  email: string;
  telefone: string | null;
  criadoEm: string;
}

export interface Oficina {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  local: string;
  publico: string;
  vagas: number;
  ativo: boolean;
  inscricoes?: InscricaoOficina[] | number;
}

export interface Prestador {
  id: number;
  nome: string;
  cpfCnpj: string;
  perfil: 'MEI' | 'Simples' | 'Presumido' | 'Real' | 'Outro';
  situacao: SituacaoPrestador;
  contador: string | null;
  email: string | null;
  atualizadoEm: string;
}

export interface Funil {
  total: number;
  acessou: number;
  emitindo: number;
  bloqueados: number;
}

export interface Modulo {
  chave: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  publico: boolean;
}

// ---------------------------------------------------------------- token

const CHAVE_TOKEN = 'seplaf-token';
const CHAVE_USUARIO = 'seplaf-usuario';

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarSessao(token: string, usuario: Usuario) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    /* armazenamento indisponível: a sessão vale só nesta aba */
  }
  tokenMemoria = token;
}

export function lerUsuarioGuardado(): Usuario | null {
  try {
    const t = localStorage.getItem(CHAVE_USUARIO);
    return t ? (JSON.parse(t) as Usuario) : null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  tokenMemoria = null;
  try {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
  } catch {
    /* nada */
  }
}

let tokenMemoria: string | null = null;
function tokenAtual() {
  return lerToken() ?? tokenMemoria;
}

// ---------------------------------------------------------------- requisições

export class ApiError extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export const EVENTO_NAO_AUTORIZADO = 'seplaf:nao-autorizado';

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function query(params?: Record<string, string | number | boolean | undefined | null>) {
  if (!params) return '';
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function req<T>(metodo: Metodo, caminho: string, corpo?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenAtual();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (corpo instanceof FormData) body = corpo;
  else if (corpo !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(corpo);
  }

  let resp: Response;
  try {
    resp = await fetch(`/api${caminho}`, { method: metodo, headers, body });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Tente novamente em alguns minutos.');
  }

  if (resp.status === 204) return undefined as T;
  const texto = await resp.text();
  let dados: unknown = undefined;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resp.ok) {
    let msg = 'Ocorreu um erro. Tente novamente.';
    if (dados && typeof dados === 'object' && 'message' in dados) {
      const m = (dados as { message: unknown }).message;
      if (Array.isArray(m)) msg = m.join(' · ');
      else if (typeof m === 'string') msg = m;
    }
    if (resp.status >= 500 && !(dados && typeof dados === 'object')) {
      // proxy do Vite sem backend, gateway fora do ar etc.
      msg = 'O servidor está indisponível no momento. Tente novamente em alguns minutos.';
    }
    if (resp.status === 502 || resp.status === 503 || resp.status === 504) {
      msg = 'O servidor está indisponível no momento. Tente novamente em alguns minutos.';
    }
    if (resp.status === 401 && (caminho.startsWith('/admin') || caminho.startsWith('/auth/eu'))) {
      limparSessao();
      window.dispatchEvent(new Event(EVENTO_NAO_AUTORIZADO));
    }
    throw new ApiError(resp.status, msg);
  }
  return dados as T;
}

export function mensagemErro(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Ocorreu um erro inesperado.';
}

// ---------------------------------------------------------------- rotas públicas

export const api = {
  configPublica: () => req<ConfigPublica>('GET', '/config/publica'),
  servicos: () => req<ServicoOnline[]>('GET', '/servicos'),
  /** `tipo` aceita um ou mais tipos separados por vírgula (ex.: 'noticia,comunicado'). */
  noticias: (p?: { tipo?: string; prazo?: boolean; local?: boolean; limite?: number }) =>
    req<NoticiaOficial[]>('GET', `/noticias${query(p)}`),
  sincronizacao: () => req<{ ultimaVerificacao: string | null }>('GET', '/noticias/sincronizacao'),
  prazos: () => req<Prazo[]>('GET', '/prazos'),
  conteudos: (p?: { tipo?: TipoConteudo; publico?: PublicoConteudo; destaque?: boolean }) =>
    req<Conteudo[]>('GET', `/conteudos${query(p)}`),
  conteudo: (slug: string) => req<Conteudo>('GET', `/conteudos/${encodeURIComponent(slug)}`),
  faq: (p?: { publico?: string; q?: string }) => req<ItemFaq[]>('GET', `/faq${query(p)}`),
  enviarDuvida: (d: NovaDuvida) => req<{ protocolo: string }>('POST', '/duvidas', d),
  consultarProtocolo: (p: string, email?: string) =>
    req<SituacaoProtocolo>(
      'GET',
      `/duvidas/protocolo/${encodeURIComponent(p.trim().toUpperCase())}${email?.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`,
    ),
  eventos: () => req<EventoResumo[]>('GET', '/eventos'),
  evento: (slug: string) => req<EventoDetalhe>('GET', `/eventos/${encodeURIComponent(slug)}`),
  oficinas: () => req<OficinaPublica[]>('GET', '/nfse/oficinas'),
  inscreverOficina: (id: number, d: { nome: string; email: string; telefone?: string }) =>
    req<{ ok: boolean }>('POST', `/nfse/oficinas/${id}/inscricoes`, d),
  agendar: (d: NovoAgendamento) => req<{ id: number; mensagem: string }>('POST', '/nfse/agendamentos', d),

  // autenticação
  login: (email: string, senha: string) =>
    req<{ token: string; usuario: Usuario }>('POST', '/auth/login', { email, senha }),
  eu: () => req<Usuario>('GET', '/auth/eu'),
};

// ---------------------------------------------------------------- rotas administrativas

export const admin = {
  resumo: () => req<Resumo>('GET', '/admin/resumo'),

  noticias: (status?: StatusNoticia) => req<NoticiaOficial[]>('GET', `/admin/noticias${query({ status })}`),
  atualizarNoticia: (
    id: number,
    d: {
      status?: StatusNoticia;
      publico?: string | null;
      temPrazo?: boolean;
      prazoAlterado?: boolean;
      explicacaoLocal?: string | null;
      prazo?: { titulo: string; quem: string; ate: string; fonte: string };
    },
  ) => req<NoticiaOficial>('PATCH', `/admin/noticias/${id}`, d),
  sincronizar: () =>
    req<{ novas: number; total: number; ultimaVerificacao: string | null; erro?: string }>('POST', '/admin/noticias/sincronizar'),

  prazos: () => req<Prazo[]>('GET', '/admin/prazos'),
  criarPrazo: (d: Partial<Prazo>) => req<Prazo>('POST', '/admin/prazos', d),
  atualizarPrazo: (id: number, d: Partial<Prazo>) => req<Prazo>('PATCH', `/admin/prazos/${id}`, d),
  removerPrazo: (id: number) => req<void>('DELETE', `/admin/prazos/${id}`),

  conteudos: (p?: { status?: StatusConteudo; tipo?: TipoConteudo }) =>
    req<Conteudo[]>('GET', `/admin/conteudos${query(p)}`),
  criarConteudo: (d: Record<string, unknown>) => req<Conteudo>('POST', '/admin/conteudos', d),
  atualizarConteudo: (id: number, d: Record<string, unknown>) => req<Conteudo>('PATCH', `/admin/conteudos/${id}`, d),
  aprovarConteudo: (id: number) => req<Conteudo>('POST', `/admin/conteudos/${id}/aprovar`),
  removerConteudo: (id: number) => req<void>('DELETE', `/admin/conteudos/${id}`),

  duvidas: (p?: { status?: string; origem?: string; eventoId?: number }) =>
    req<Duvida[]>('GET', `/admin/duvidas${query(p)}`),
  duvida: (id: number) => req<Duvida>('GET', `/admin/duvidas/${id}`),
  atualizarDuvida: (id: number, d: { status?: StatusDuvida; responsavelId?: number | null; tema?: string | null }) =>
    req<Duvida>('PATCH', `/admin/duvidas/${id}`, d),
  responderDuvida: (
    id: number,
    d: { resposta: string; baseOficial?: string; publicarNoFaq?: boolean; publicoFaq?: string },
  ) => req<Duvida>('POST', `/admin/duvidas/${id}/responder`, d),

  usuariosResumo: () => req<{ id: number; nome: string; perfil: Perfil; email?: string; ativo?: boolean; criadoEm?: string }[]>('GET', '/admin/usuarios'),
  criarUsuario: (d: { nome: string; email: string; perfil: Perfil; senha?: string; ativo?: boolean }) =>
    req<Usuario>('POST', '/admin/usuarios', d),
  atualizarUsuario: (id: number, d: Partial<{ nome: string; email: string; perfil: Perfil; senha: string; ativo: boolean }>) =>
    req<Usuario>('PATCH', `/admin/usuarios/${id}`, d),

  eventos: () => req<EventoResumo[]>('GET', '/admin/eventos'),
  importarEvento: (id: number, arquivo: File) => {
    const f = new FormData();
    f.append('arquivo', arquivo);
    return req<ResultadoImportacaoEvento>('POST', `/admin/eventos/${id}/importar`, f);
  },
  perguntasEvento: (id: number) => req<PerguntaEvento[]>('GET', `/admin/eventos/${id}/perguntas`),
  classificarPergunta: (duvidaId: number, tema: string | null) =>
    req<unknown>('PATCH', `/admin/eventos/perguntas/${duvidaId}`, { tema }),
  temasEvento: (id: number) => req<TemaEvento[]>('GET', `/admin/eventos/${id}/temas`),
  salvarTema: (id: number, temaId: number, d: Partial<Pick<TemaEvento, 'titulo' | 'resposta' | 'baseOficial' | 'links'>>) =>
    req<TemaEvento>('PUT', `/admin/eventos/${id}/temas/${temaId}`, d),
  aprovarTemas: (id: number) => req<unknown>('POST', `/admin/eventos/${id}/temas/aprovar`),
  enviarRespostas: (id: number) => req<{ enviadas: number }>('POST', `/admin/eventos/${id}/enviar-respostas`),

  agendamentos: (p?: { data?: string; status?: string }) =>
    req<Agendamento[]>('GET', `/admin/nfse/agendamentos${query(p)}`),
  atualizarAgendamento: (id: number, d: { status: StatusAgendamento; observacao?: string | null }) =>
    req<Agendamento>('PATCH', `/admin/nfse/agendamentos/${id}`, d),

  oficinas: () => req<Oficina[]>('GET', '/admin/nfse/oficinas'),
  criarOficina: (d: Partial<Oficina>) => req<Oficina>('POST', '/admin/nfse/oficinas', d),
  atualizarOficina: (id: number, d: Partial<Oficina>) => req<Oficina>('PATCH', `/admin/nfse/oficinas/${id}`, d),
  removerOficina: (id: number) => req<void>('DELETE', `/admin/nfse/oficinas/${id}`),

  prestadores: (situacao?: SituacaoPrestador) =>
    req<{ prestadores: Prestador[]; funil: Funil }>(
      'GET',
      `/admin/nfse/prestadores${query({ situacao })}`,
    ),
  importarPrestadores: (arquivo: File) => {
    const f = new FormData();
    f.append('arquivo', arquivo);
    return req<{ importados: number; atualizados: number }>('POST', '/admin/nfse/prestadores/importar', f);
  },

  servicos: () => req<ServicoOnline[]>('GET', '/admin/servicos'),
  criarServico: (d: Partial<ServicoOnline>) => req<ServicoOnline>('POST', '/admin/servicos', d),
  atualizarServico: (id: number, d: Partial<ServicoOnline>) => req<ServicoOnline>('PATCH', `/admin/servicos/${id}`, d),
  removerServico: (id: number) => req<void>('DELETE', `/admin/servicos/${id}`),

  config: <T = unknown>(chave: string) => req<T>('GET', `/admin/config/${encodeURIComponent(chave)}`),
  salvarConfig: (chave: string, valor: unknown) => req<unknown>('PUT', `/admin/config/${encodeURIComponent(chave)}`, valor),

  modulos: () => req<Modulo[]>('GET', '/admin/modulos'),
  atualizarModulo: (chave: string, ativo: boolean) =>
    req<Modulo>('PATCH', `/admin/modulos/${encodeURIComponent(chave)}`, { ativo }),
};

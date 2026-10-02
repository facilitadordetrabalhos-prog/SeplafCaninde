import { useState } from 'react';
import { Link } from 'react-router-dom';
import { admin, mensagemErro, type Conteudo as TConteudo, type PublicoConteudo, type StatusConteudo, type TipoConteudo } from '../../api';
import { useAuth } from '../../components/AuthContext';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { formatarData, ROTULO_PUBLICO, useApi } from '../../util';

const TIPOS: [TipoConteudo, string][] = [
  ['guia', 'Guia'],
  ['dica', 'Dica'],
  ['noticia_local', 'Notícia local'],
  ['video', 'Vídeo'],
  ['material', 'Palestra / material'],
  ['faq', 'Pergunta frequente'],
];
const NOME_TIPO = Object.fromEntries(TIPOS);

const SITUACAO: Record<StatusConteudo, [string, string]> = {
  rascunho: ['parado', 'Rascunho'],
  aguardando: ['espera', 'Aguardando aprovação'],
  publicado: ['ok', 'Publicado'],
};

interface Form {
  tipo: TipoConteudo;
  titulo: string;
  publico: PublicoConteudo;
  resumo: string;
  corpo: string;
  baseOficial: string;
  videoUrl: string;
  anexoUrl: string;
  destaque: boolean;
}

const VAZIO: Form = { tipo: 'guia', titulo: '', publico: 'todos', resumo: '', corpo: '', baseOficial: '', videoUrl: '', anexoUrl: '', destaque: false };

function paraForm(c: TConteudo): Form {
  return {
    tipo: c.tipo,
    titulo: c.titulo,
    publico: c.publico,
    resumo: c.resumo ?? '',
    corpo: c.corpo ?? '',
    baseOficial: c.baseOficial ?? '',
    videoUrl: c.videoUrl ?? '',
    anexoUrl: c.anexoUrl ?? '',
    destaque: !!c.destaque,
  };
}

function ConteudoPagina() {
  const { pode } = useAuth();
  const gestor = pode('gestor');
  const [status, setStatus] = useState<StatusConteudo | ''>('');
  const lista = useApi(() => admin.conteudos({ status: status || undefined }), [status]);
  const [form, setForm] = useState<Form>(VAZIO);
  const [editando, setEditando] = useState<TConteudo | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const novo = () => {
    setEditando(null);
    setForm(VAZIO);
    setErro(null);
    setOk(null);
  };

  const editar = async (c: TConteudo) => {
    setErro(null);
    setOk(null);
    setEditando(c);
    setForm(paraForm(c));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvar = async (acao: 'rascunho' | 'aprovacao' | 'publicar') => {
    setErro(null);
    setOk(null);
    if (!form.titulo.trim()) {
      setErro('Informe o título.');
      return;
    }
    if (acao !== 'rascunho' && !form.baseOficial.trim()) {
      setErro('Todo conteúdo publicado precisa informar a base oficial.');
      return;
    }
    setOcupado(true);
    const dados: Record<string, unknown> = {
      ...form,
      titulo: form.titulo.trim(),
      videoUrl: form.videoUrl.trim() || null,
      anexoUrl: form.anexoUrl.trim() || null,
    };
    try {
      if (editando) {
        const extra: Record<string, unknown> = {};
        if (acao === 'aprovacao') extra.status = 'aguardando';
        if (acao === 'rascunho' && editando.status !== 'publicado') extra.status = 'rascunho';
        await admin.atualizarConteudo(editando.id, { ...dados, ...extra });
        if (acao === 'publicar' && gestor) await admin.aprovarConteudo(editando.id);
      } else {
        await admin.criarConteudo({
          ...dados,
          enviarParaAprovacao: acao === 'aprovacao',
          ...(acao === 'publicar' && gestor ? { publicar: true } : {}),
        });
      }
      setOk(acao === 'publicar' ? 'Conteúdo publicado.' : acao === 'aprovacao' ? 'Enviado para aprovação do gestor.' : 'Rascunho salvo.');
      if (!editando) setForm(VAZIO);
      lista.recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  const aprovar = async (c: TConteudo) => {
    try {
      await admin.aprovarConteudo(c.id);
      lista.recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    }
  };

  const remover = async (c: TConteudo) => {
    if (!window.confirm(`Excluir “${c.titulo}”? Esta ação não pode ser desfeita.`)) return;
    try {
      await admin.removerConteudo(c.id);
      if (editando?.id === c.id) novo();
      lista.recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    }
  };

  return (
    <>
      <Banner
        variante="escuro"
        icone="lapis"
        titulo="Publicar conteúdo"
        texto="Guias, dicas, vídeos, palestras e perguntas frequentes da Secretaria. Todo conteúdo informa a base oficial."
      />
      <div className="duas meio">
        <div className="painel">
          <h3>
            {editando ? 'Editar conteúdo' : 'Novo conteúdo'}
            {editando && <span className={`tag ${SITUACAO[editando.status][0]}`}>{SITUACAO[editando.status][1]}</span>}
          </h3>
          <div className="filtros" role="group" aria-label="Tipo de conteúdo">
            {TIPOS.map(([t, r]) => (
              <button key={t} type="button" className={`chip${form.tipo === t ? ' ativo' : ''}`} aria-pressed={form.tipo === t} onClick={() => set('tipo', t)}>
                {r}
              </button>
            ))}
          </div>
          <div className="campo">
            <label htmlFor="c-titulo">{form.tipo === 'faq' ? 'Pergunta' : 'Título'}</label>
            <input id="c-titulo" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="c-publico">Público</label>
            <select id="c-publico" value={form.publico} onChange={(e) => set('publico', e.target.value as PublicoConteudo)}>
              {Object.entries(ROTULO_PUBLICO).map(([v, r]) => (
                <option key={v} value={v}>
                  {v === 'todos' ? 'Todos' : r}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="c-resumo">Resumo</label>
            <input id="c-resumo" value={form.resumo} onChange={(e) => set('resumo', e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="c-corpo">{form.tipo === 'faq' ? 'Resposta (HTML simples)' : 'Texto (HTML simples: <p>, <b>, <ul>, <h3>)'}</label>
            <textarea id="c-corpo" className="codigo" value={form.corpo} onChange={(e) => set('corpo', e.target.value)} style={{ minHeight: 160 }} />
          </div>
          <div className="campo">
            <label htmlFor="c-base">Base oficial</label>
            <input id="c-base" value={form.baseOficial} onChange={(e) => set('baseOficial', e.target.value)} placeholder="Ex.: Resolução CGSN 194 · notícia CGIBS de 30/09/2026" />
          </div>
          <div className="form-linha">
            <div className="campo">
              <label htmlFor="c-video">Vídeo (link do YouTube)</label>
              <input id="c-video" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtube.com/…" />
            </div>
            <div className="campo">
              <label htmlFor="c-anexo">Anexo (link do PDF/PPTX)</label>
              <input id="c-anexo" value={form.anexoUrl} onChange={(e) => set('anexoUrl', e.target.value)} placeholder="https://… ou /materiais/…" />
            </div>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.destaque} onChange={(e) => set('destaque', e.target.checked)} /> Destacar na página inicial
          </label>
          <div className="acoes">
            <button className="botao peq" onClick={() => salvar('aprovacao')} disabled={ocupado}>
              Enviar para aprovação
            </button>
            <button className="botao vazio peq" onClick={() => salvar('rascunho')} disabled={ocupado}>
              Salvar rascunho
            </button>
            {gestor && (
              <button className="botao preto peq" onClick={() => salvar('publicar')} disabled={ocupado}>
                Publicar agora
              </button>
            )}
            {editando && (
              <button className="botao vazio peq" onClick={novo} disabled={ocupado}>
                Cancelar edição
              </button>
            )}
          </div>
          {erro && (
            <div className="erro-box" role="alert">
              {erro}
            </div>
          )}
          {ok && (
            <div className="mensagem-ok" role="status">
              {ok}
            </div>
          )}
        </div>

        <div className="painel">
          <h3>Publicações da Secretaria</h3>
          <div className="filtros">
            {(['', 'rascunho', 'aguardando', 'publicado'] as const).map((s) => (
              <button key={s || 'todas'} className={`chip${status === s ? ' ativo' : ''}`} onClick={() => setStatus(s)}>
                {s ? SITUACAO[s][1] : 'Todas'}
              </button>
            ))}
          </div>
          {lista.carregando && !lista.dados ? (
            <Carregando />
          ) : lista.erro ? (
            <AvisoApi mensagem={lista.erro} />
          ) : !(lista.dados ?? []).length ? (
            <p className="sub">Nenhum conteúdo nesta situação.</p>
          ) : (
            <div className="tabela-scroll">
              <table className="lista">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Situação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(lista.dados ?? []).map((c) => (
                    <tr key={c.id} className={editando?.id === c.id ? 'sel' : undefined}>
                      <td>
                        {c.titulo}
                        <br />
                        <small style={{ color: 'var(--tinta-fraca)' }}>atualizado em {formatarData(c.atualizadoEm)}</small>
                      </td>
                      <td>{NOME_TIPO[c.tipo] ?? c.tipo}</td>
                      <td>
                        <span className={`tag ${SITUACAO[c.status]?.[0] ?? 'parado'}`}>{SITUACAO[c.status]?.[1] ?? c.status}</span>
                      </td>
                      <td>
                        <div className="acoes" style={{ marginTop: 0 }}>
                          <button className="botao vazio peq" onClick={() => editar(c)}>
                            Editar
                          </button>
                          {gestor && c.status === 'aguardando' && (
                            <button className="botao peq" onClick={() => aprovar(c)}>
                              Aprovar
                            </button>
                          )}
                          {c.status === 'publicado' && c.tipo !== 'faq' && (
                            <Link className="botao vazio peq" to={`/reforma/guias/${c.slug}`} target="_blank">
                              Ver
                            </Link>
                          )}
                          {gestor && (
                            <button className="botao vazio peq" onClick={() => remover(c)}>
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Conteudo() {
  return (
    <SoPara perfis={['gestor', 'editor']}>
      <ConteudoPagina />
    </SoPara>
  );
}

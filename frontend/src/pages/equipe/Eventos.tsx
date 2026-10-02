import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin, mensagemErro, type ResultadoImportacaoEvento, type TemaEvento } from '../../api';
import { useAuth } from '../../components/AuthContext';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { formatarData, normalizarLinks, useApi } from '../../util';
import { SITUACAO_DUVIDA } from './Duvidas';

function linksParaTexto(links: unknown) {
  return normalizarLinks(links)
    .map((l) => `${l.rota} | ${l.rotulo}`)
    .join('\n');
}

function textoParaLinks(t: string) {
  return t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [rota, ...r] = l.split('|');
      return { rota: rota.trim(), rotulo: (r.join('|').trim() || rota.trim()) };
    });
}

function EditorTema({ eventoId, tema, aoSalvar }: { eventoId: number; tema: TemaEvento; aoSalvar: (t: TemaEvento) => void }) {
  const { pode } = useAuth();
  const [titulo, setTitulo] = useState(tema.titulo);
  const [resposta, setResposta] = useState(tema.resposta);
  const [base, setBase] = useState(tema.baseOficial ?? '');
  const [links, setLinks] = useState(linksParaTexto(tema.links));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const podeEditar = pode('gestor', 'editor');

  const salvar = async () => {
    setErro(null);
    setOk(false);
    setSalvando(true);
    try {
      const dados = { titulo: titulo.trim(), resposta, baseOficial: base.trim(), links: textoParaLinks(links) };
      const r = await admin.salvarTema(eventoId, tema.id, dados);
      aoSalvar(r && r.id ? { ...tema, ...r } : { ...tema, ...dados, aprovado: false });
      setOk(true);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <div className="campo">
        <label htmlFor="t-titulo">Título do tema</label>
        <input id="t-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} disabled={!podeEditar} />
      </div>
      <div className="campo">
        <label htmlFor="t-resposta">Resposta (HTML: use &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;&lt;li&gt;)</label>
        <textarea id="t-resposta" className="codigo" value={resposta} onChange={(e) => setResposta(e.target.value)} disabled={!podeEditar} />
      </div>
      <div className="campo">
        <label htmlFor="t-base">Base oficial</label>
        <input id="t-base" value={base} onChange={(e) => setBase(e.target.value)} disabled={!podeEditar} />
      </div>
      <div className="campo">
        <label htmlFor="t-links">Links da resposta (um por linha: rota | rótulo — ex.: /reforma/entenda | Entenda a reforma)</label>
        <textarea id="t-links" value={links} onChange={(e) => setLinks(e.target.value)} disabled={!podeEditar} style={{ minHeight: 70 }} />
      </div>
      {podeEditar && (
        <button className="botao peq" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar tema'}
        </button>
      )}
      {!podeEditar && <p className="ajuda">Somente gestor ou editor podem alterar a resposta do tema.</p>}
      {erro && (
        <div className="erro-box" role="alert">
          {erro}
        </div>
      )}
      {ok && (
        <div className="mensagem-ok" role="status">
          Tema salvo. Ele volta a precisar de aprovação do gestor antes de aparecer na página do evento.
        </div>
      )}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Pré-visualizar a resposta</summary>
        <div className="resposta-tema" style={{ marginTop: 8 }} dangerouslySetInnerHTML={{ __html: resposta }} />
      </details>
    </div>
  );
}

export default function Eventos() {
  const { pode } = useAuth();
  const eventos = useApi(() => admin.eventos());
  const [eventoId, setEventoId] = useState<number | null>(null);
  useEffect(() => {
    if (eventoId === null && eventos.dados?.length) setEventoId(eventos.dados[0].id);
  }, [eventos.dados, eventoId]);
  const evento = eventos.dados?.find((e) => e.id === eventoId) ?? null;

  const perguntas = useApi(() => (eventoId ? admin.perguntasEvento(eventoId) : Promise.resolve([])), [eventoId]);
  const temas = useApi(() => (eventoId ? admin.temasEvento(eventoId) : Promise.resolve([] as TemaEvento[])), [eventoId]);

  const [filtro, setFiltro] = useState('todos');
  const [temaSel, setTemaSel] = useState<number | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [importacao, setImportacao] = useState<ResultadoImportacaoEvento | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [msgAcao, setMsgAcao] = useState<string | null>(null);
  const [enviadas, setEnviadas] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erroLinha, setErroLinha] = useState<string | null>(null);

  const listaTemas = temas.dados ?? [];
  const listaPerguntas = perguntas.dados ?? [];
  const nomeTema = Object.fromEntries(listaTemas.map((t) => [t.chave, t.titulo]));
  const temaAtual = listaTemas.find((t) => t.id === temaSel) ?? listaTemas[0] ?? null;
  const aprovados = listaTemas.filter((t) => t.aprovado).length;
  const visiveis = listaPerguntas.filter((p) => filtro === 'todos' || (filtro === 'sem' ? !p.tema : p.tema === filtro));

  const importar = async () => {
    if (!eventoId || !arquivo) return;
    setImportando(true);
    setErroAcao(null);
    setImportacao(null);
    try {
      setImportacao(await admin.importarEvento(eventoId, arquivo));
      perguntas.recarregar();
      temas.recarregar();
      eventos.recarregar();
    } catch (e) {
      setErroAcao(mensagemErro(e));
    } finally {
      setImportando(false);
    }
  };

  const classificar = async (duvidaId: number, tema: string) => {
    setErroLinha(null);
    const valor = tema || null;
    perguntas.setDados((l) =>
      (l ?? []).map((p) => (p.id === duvidaId ? { ...p, tema: valor, status: valor === 'incompleta' ? 'incompleta' : p.status } : p)),
    );
    try {
      await admin.classificarPergunta(duvidaId, valor);
      temas.recarregar();
    } catch (e) {
      setErroLinha(mensagemErro(e));
      perguntas.recarregar();
    }
  };

  const aprovar = async () => {
    if (!eventoId) return;
    setOcupado(true);
    setErroAcao(null);
    setMsgAcao(null);
    try {
      await admin.aprovarTemas(eventoId);
      setMsgAcao('Respostas aprovadas e publicadas na página do evento.');
      temas.recarregar();
    } catch (e) {
      setErroAcao(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  const enviar = async () => {
    if (!eventoId) return;
    if (!window.confirm('Enviar por e-mail a resposta do tema a cada participante com tema aprovado ainda não respondido?')) return;
    setOcupado(true);
    setErroAcao(null);
    setMsgAcao(null);
    try {
      const r = await admin.enviarRespostas(eventoId);
      setEnviadas(r.enviadas);
      setMsgAcao(`${r.enviadas} resposta${r.enviadas === 1 ? '' : 's'} enviada${r.enviadas === 1 ? '' : 's'} por e-mail.`);
      perguntas.recarregar();
    } catch (e) {
      setErroAcao(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <Banner
        variante="escuro"
        icone="pessoas"
        titulo="Dúvidas de eventos"
        texto="Perguntas deixadas na inscrição dos eventos. Classifique por tema, aprove a resposta do tema e envie a resposta a cada participante por e-mail."
      />
      {eventos.carregando && !eventos.dados ? (
        <Carregando />
      ) : eventos.erro ? (
        <AvisoApi mensagem={eventos.erro} />
      ) : !eventos.dados?.length ? (
        <p className="sub">Nenhum evento cadastrado.</p>
      ) : (
        <>
          <div className="painel">
            <div className="form-linha">
              <div className="campo">
                <label htmlFor="ev-sel">Evento</label>
                <select
                  id="ev-sel"
                  value={eventoId ?? ''}
                  onChange={(e) => {
                    setEventoId(Number(e.target.value));
                    setTemaSel(null);
                    setFiltro('todos');
                    setImportacao(null);
                    setEnviadas(null);
                  }}
                >
                  {eventos.dados.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome} · {formatarData(e.data)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {evento && (
              <p className="ajuda" style={{ margin: 0 }}>
                Página pública:{' '}
                <Link to={`/eventos/${evento.slug}`} style={{ color: 'var(--laranja)', fontWeight: 600 }}>
                  /eventos/{evento.slug}
                </Link>
              </p>
            )}
          </div>

          <div className="kpis">
            <div className="kpi">
              <span>Pessoas inscritas</span>
              <b>{evento?.totalPessoas ?? 0}</b>
            </div>
            <div className="kpi">
              <span>Com pergunta</span>
              <b>{listaPerguntas.length}</b>
            </div>
            <div className="kpi">
              <span>Temas aprovados</span>
              <b>
                {aprovados}/{listaTemas.length}
              </b>
            </div>
            <div className="kpi">
              <span>Respostas enviadas agora</span>
              <b>{enviadas ?? 0}</b>
            </div>
          </div>

          {pode('gestor', 'equipe') && (
            <div className="painel">
              <h3>Importar planilha de inscrições</h3>
              <p className="ajuda">
                Arquivo CSV separado por ponto e vírgula, com as colunas do formulário de inscrição (full_name, email, phone, segment,
                company_name, role_title, attendees_count, tax_question, consent). Cada linha com pergunta vira uma dúvida do evento. Pode
                importar de novo: linhas repetidas não são duplicadas.
              </p>
              <div className="acoes" style={{ alignItems: 'center' }}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  aria-label="Planilha CSV de inscrições"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                  style={{ maxWidth: '100%' }}
                />
                <button className="botao peq" onClick={importar} disabled={!arquivo || importando} style={{ marginTop: 0 }}>
                  {importando ? 'Importando…' : 'Importar'}
                </button>
              </div>
              {importacao && (
                <div className="mensagem-ok" role="status">
                  Importação concluída: <b>{importacao.inscricoes}</b> inscrições · <b>{importacao.pessoas}</b> pessoas ·{' '}
                  <b>{importacao.comPergunta}</b> com pergunta · <b>{importacao.novas}</b> perguntas novas.
                </div>
              )}
              <p className="ajuda" style={{ marginBottom: 0 }}>
                Proteção de dados (LGPD): no portal público aparecem só a pergunta e o segmento do participante, nunca o nome. E-mail e
                telefone ficam guardados apenas para enviar a resposta. A planilha não é guardada no servidor.
              </p>
            </div>
          )}

          {(erroAcao || msgAcao) && (
            <div className={erroAcao ? 'erro-box' : 'mensagem-ok'} role={erroAcao ? 'alert' : 'status'} style={{ marginTop: 0, marginBottom: 16 }}>
              {erroAcao ?? msgAcao}
            </div>
          )}

          <div className="painel">
            <h3>
              Perguntas por participante{' '}
              {listaTemas.length > 0 && aprovados < listaTemas.length && <span className="tag espera">respostas aguardando aprovação</span>}
            </h3>
            <div className="filtros">
              <button className={`chip${filtro === 'todos' ? ' ativo' : ''}`} onClick={() => setFiltro('todos')}>
                Todas ({listaPerguntas.length})
              </button>
              <button className={`chip${filtro === 'sem' ? ' ativo' : ''}`} onClick={() => setFiltro('sem')}>
                Sem tema ({listaPerguntas.filter((p) => !p.tema).length})
              </button>
              {listaTemas.map((t) => (
                <button key={t.chave} className={`chip${filtro === t.chave ? ' ativo' : ''}`} onClick={() => setFiltro(t.chave)}>
                  {t.titulo} ({listaPerguntas.filter((p) => p.tema === t.chave).length})
                </button>
              ))}
            </div>
            {erroLinha && (
              <div className="erro-box" role="alert" style={{ marginBottom: 10 }}>
                {erroLinha}
              </div>
            )}
            {perguntas.carregando && !perguntas.dados ? (
              <Carregando />
            ) : perguntas.erro ? (
              <AvisoApi mensagem={perguntas.erro} />
            ) : visiveis.length === 0 ? (
              <p className="sub">Nenhuma pergunta aqui. Importe a planilha de inscrições do evento.</p>
            ) : (
              <div className="tabela-scroll">
                <table className="lista">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Segmento</th>
                      <th>Pergunta</th>
                      <th>Tema</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((p) => {
                      const [c, r] = SITUACAO_DUVIDA[p.status] ?? ['parado', p.status];
                      return (
                        <tr key={p.id}>
                          <td>{p.nome}</td>
                          <td>{p.segmento ?? '—'}</td>
                          <td>{p.pergunta}</td>
                          <td>
                            <select aria-label={`Tema da pergunta de ${p.nome}`} value={p.tema ?? ''} onChange={(e) => classificar(p.id, e.target.value)}>
                              <option value="">(sem tema)</option>
                              {listaTemas.map((t) => (
                                <option key={t.chave} value={t.chave}>
                                  {t.titulo}
                                </option>
                              ))}
                              {!nomeTema['incompleta'] && <option value="incompleta">Pergunta incompleta</option>}
                            </select>
                          </td>
                          <td>
                            {p.tema === 'incompleta' ? <span className="tag erro">Ligar para completar</span> : <span className={`tag ${c}`}>{r}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="acoes" style={{ marginTop: 12 }}>
              {pode('gestor') && (
                <button className="botao peq" onClick={aprovar} disabled={ocupado || !listaTemas.length}>
                  Aprovar respostas e publicar na página do evento
                </button>
              )}
              {pode('gestor', 'equipe') && (
                <button className="botao vazio peq" onClick={enviar} disabled={ocupado}>
                  Enviar resposta por e-mail a cada participante
                </button>
              )}
            </div>
          </div>

          <div className="painel">
            <h3>Respostas por tema</h3>
            {temas.carregando && !temas.dados ? (
              <Carregando />
            ) : temas.erro ? (
              <AvisoApi mensagem={temas.erro} />
            ) : !listaTemas.length ? (
              <p className="sub">Este evento ainda não tem temas.</p>
            ) : (
              <>
                <div className="filtros">
                  {listaTemas.map((t) => (
                    <button key={t.id} className={`chip${temaAtual?.id === t.id ? ' ativo' : ''}`} onClick={() => setTemaSel(t.id)}>
                      {t.titulo} {t.aprovado ? '✔' : ''}
                    </button>
                  ))}
                </div>
                {temaAtual && eventoId && (
                  <>
                    <p className="ajuda">
                      {temaAtual.aprovado ? (
                        <span className="tag ok">Aprovado e publicado</span>
                      ) : (
                        <span className="tag espera">Rascunho — aguardando aprovação</span>
                      )}{' '}
                      · {temaAtual.qtd ?? listaPerguntas.filter((p) => p.tema === temaAtual.chave).length} pergunta(s) neste tema
                    </p>
                    <EditorTema
                      key={temaAtual.id}
                      eventoId={eventoId}
                      tema={temaAtual}
                      aoSalvar={(t) => temas.setDados((l) => (l ?? []).map((x) => (x.id === t.id ? t : x)))}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

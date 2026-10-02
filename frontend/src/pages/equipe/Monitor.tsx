import { useEffect, useState } from 'react';
import { admin, api, mensagemErro, type NoticiaOficial, type StatusNoticia } from '../../api';
import { AvisoApi, Banner, Carregando, Externo } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { descreverVerificacao, formatarData, ROTULO_PUBLICO, ROTULO_TIPO_NOTICIA, useApi } from '../../util';

const FILTROS: [StatusNoticia | '', string][] = [
  ['nova', 'Novas'],
  ['publicada', 'Publicadas'],
  ['ignorada', 'Ignoradas'],
  ['', 'Todas'],
];

function Situacao({ n }: { n: NoticiaOficial }) {
  if (n.status === 'nova') return <span className="tag erro">Nova</span>;
  if (n.status === 'ignorada') return <span className="tag parado">Ignorada</span>;
  return n.explicacaoLocal ? <span className="tag ok">Publicada + explicação</span> : <span className="tag azul">Publicada (título e link)</span>;
}

function Curadoria({ n, aoSalvar }: { n: NoticiaOficial; aoSalvar: (n: NoticiaOficial) => void }) {
  const [publico, setPublico] = useState(n.publico ?? '');
  const [temPrazo, setTemPrazo] = useState(n.temPrazo);
  const [prazoAlterado, setPrazoAlterado] = useState(n.prazoAlterado);
  const [explicacao, setExplicacao] = useState(n.explicacaoLocal ?? '');
  const [criarPrazo, setCriarPrazo] = useState(false);
  const [prazo, setPrazo] = useState({ titulo: '', quem: '', ate: '', fonte: `CGIBS, ${formatarData(n.data)}` });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const salvar = async (status: StatusNoticia) => {
    setErro(null);
    setOk(null);
    if (criarPrazo && (!prazo.titulo.trim() || !prazo.ate)) {
      setErro('Para criar o prazo, informe ao menos o título e a data.');
      return;
    }
    setSalvando(true);
    try {
      const r = await admin.atualizarNoticia(n.id, {
        status,
        publico: publico || null,
        temPrazo,
        prazoAlterado,
        explicacaoLocal: explicacao.trim() || null,
        ...(criarPrazo ? { prazo: { ...prazo, titulo: prazo.titulo.trim(), quem: prazo.quem.trim(), fonte: prazo.fonte.trim() } } : {}),
      });
      setOk(status === 'ignorada' ? 'Notícia ignorada.' : 'Publicada no portal.');
      setCriarPrazo(false);
      aoSalvar(r ?? { ...n, status });
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="painel">
      <h3>
        Curadoria <Situacao n={n} />
      </h3>
      <div className="pergunta-orig">
        <div className="quem">
          CGIBS · {ROTULO_TIPO_NOTICIA[n.tipo] ?? n.tipo} · {formatarData(n.data)}
        </div>
        <div style={{ fontWeight: 600 }}>{n.titulo}</div>
        {n.resumo && <div style={{ fontSize: 13, color: 'var(--tinta-fraca)', marginTop: 4 }}>{n.resumo}</div>}
        <Externo href={n.link} style={{ fontSize: 12.5, color: 'var(--azul)', fontWeight: 600, display: 'inline-block', marginTop: 6 }}>
          Abrir no site oficial ↗
        </Externo>
      </div>
      <div className="campo">
        <label htmlFor="m-publico">Público</label>
        <select id="m-publico" value={publico} onChange={(e) => setPublico(e.target.value)}>
          <option value="">Não definido</option>
          {Object.entries(ROTULO_PUBLICO).map(([v, r]) => (
            <option key={v} value={v}>
              {v === 'todos' ? 'Todos' : r}
            </option>
          ))}
        </select>
      </div>
      <label className="check">
        <input type="checkbox" checked={temPrazo} onChange={(e) => setTemPrazo(e.target.checked)} /> Tem prazo: marcar a notícia com a
        etiqueta “tem prazo”
      </label>
      <label className="check">
        <input type="checkbox" checked={prazoAlterado} onChange={(e) => setPrazoAlterado(e.target.checked)} /> O prazo desta notícia foi
        alterado depois (mostrar “prazo alterado”)
      </label>
      <div className="campo">
        <label htmlFor="m-explicacao">O que isso significa para Canindé (opcional)</label>
        <textarea id="m-explicacao" value={explicacao} onChange={(e) => setExplicacao(e.target.value)} />
      </div>
      <label className="check">
        <input type="checkbox" checked={criarPrazo} onChange={(e) => setCriarPrazo(e.target.checked)} /> Criar um prazo no quadro “Prazos
        que estão correndo”
      </label>
      {criarPrazo && (
        <div className="form-linha">
          <div className="campo">
            <label htmlFor="m-p-titulo">O que</label>
            <input id="m-p-titulo" value={prazo.titulo} onChange={(e) => setPrazo({ ...prazo, titulo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="m-p-quem">Para quem</label>
            <input id="m-p-quem" value={prazo.quem} onChange={(e) => setPrazo({ ...prazo, quem: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="m-p-ate">Até</label>
            <input id="m-p-ate" type="date" value={prazo.ate} onChange={(e) => setPrazo({ ...prazo, ate: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="m-p-fonte">Fonte</label>
            <input id="m-p-fonte" value={prazo.fonte} onChange={(e) => setPrazo({ ...prazo, fonte: e.target.value })} />
          </div>
        </div>
      )}
      <div className="acoes">
        <button className="botao peq" disabled={salvando} onClick={() => salvar('publicada')}>
          {n.status === 'publicada' ? 'Salvar e manter publicada' : 'Publicar no portal'}
        </button>
        {n.status !== 'ignorada' && (
          <button className="botao vazio peq" disabled={salvando} onClick={() => salvar('ignorada')}>
            Ignorar
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
  );
}

function MonitorConteudo() {
  const [status, setStatus] = useState<StatusNoticia | ''>('nova');
  const lista = useApi(() => admin.noticias(status || undefined), [status]);
  const sinc = useApi(() => api.sincronizacao());
  const [selId, setSelId] = useState<number | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [msgSinc, setMsgSinc] = useState<string | null>(null);
  const [erroSinc, setErroSinc] = useState<string | null>(null);

  const itens = lista.dados ?? [];
  const sel = itens.find((n) => n.id === selId) ?? null;

  useEffect(() => {
    if (itens.length && !itens.some((n) => n.id === selId)) setSelId(itens[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.dados]);

  const sincronizar = async () => {
    setSincronizando(true);
    setMsgSinc(null);
    setErroSinc(null);
    try {
      const r = await admin.sincronizar();
      if (r.erro) setErroSinc(`Não foi possível ler o site do CGIBS agora: ${r.erro}`);
      else setMsgSinc(`Verificação concluída: ${r.novas} nova${r.novas === 1 ? '' : 's'} de ${r.total} lida${r.total === 1 ? '' : 's'}.`);
      lista.recarregar();
      sinc.recarregar();
    } catch (e) {
      setErroSinc(mensagemErro(e));
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <>
      <Banner
        variante="escuro"
        icone="sincronizar"
        titulo="Monitor do Comitê Gestor"
        texto="Tudo o que sai em cgibs.gov.br chega aqui automaticamente. A equipe decide o público, marca prazos e escreve o que muda para Canindé."
      />
      <div className="painel" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="sinc">
          Última verificação: {descreverVerificacao(sinc.dados?.ultimaVerificacao) || (sinc.erro ? 'indisponível' : 'ainda não feita')}
        </span>
        <button className="botao peq preto" onClick={sincronizar} disabled={sincronizando} style={{ marginTop: 0, marginLeft: 'auto' }}>
          {sincronizando ? 'Sincronizando…' : 'Sincronizar agora'}
        </button>
        {msgSinc && <span className="tag ok" style={{ whiteSpace: 'normal' }}>{msgSinc}</span>}
        {erroSinc && <span className="tag erro" style={{ whiteSpace: 'normal' }}>{erroSinc}</span>}
      </div>
      <div className="duas larga">
        <div className="painel">
          <h3>
            Capturadas do CGIBS <span className="sinc">verificação automática várias vezes ao dia</span>
          </h3>
          <div className="filtros">
            {FILTROS.map(([f, r]) => (
              <button key={r} className={`chip${status === f ? ' ativo' : ''}`} onClick={() => setStatus(f)}>
                {r}
              </button>
            ))}
          </div>
          {lista.carregando && !lista.dados ? (
            <Carregando />
          ) : lista.erro ? (
            <AvisoApi mensagem={lista.erro} />
          ) : itens.length === 0 ? (
            <p className="sub">Nenhuma notícia nesta situação.</p>
          ) : (
            <div className="tabela-scroll">
              <table className="lista clicavel">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Título no CGIBS</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((n) => (
                    <tr
                      key={n.id}
                      className={n.id === selId ? 'sel' : undefined}
                      onClick={() => setSelId(n.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelId(n.id)}
                    >
                      <td style={{ whiteSpace: 'nowrap' }}>{formatarData(n.data)}</td>
                      <td>{n.titulo}</td>
                      <td>
                        <Situacao n={n} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {sel ? (
          <Curadoria
            key={sel.id}
            n={sel}
            aoSalvar={(nova) => lista.setDados((l) => (l ?? []).map((x) => (x.id === nova.id ? { ...x, ...nova } : x)))}
          />
        ) : (
          <div className="painel">
            <h3>Curadoria</h3>
            <p className="sub" style={{ margin: 0 }}>
              Selecione uma notícia na lista.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default function Monitor() {
  return (
    <SoPara perfis={['gestor', 'editor']}>
      <MonitorConteudo />
    </SoPara>
  );
}

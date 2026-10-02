import { useEffect, useState } from 'react';
import { admin, mensagemErro, type Duvida, type StatusDuvida } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { formatarData, ROTULO_PUBLICO, useApi } from '../../util';

export const SITUACAO_DUVIDA: Record<StatusDuvida, [string, string]> = {
  nova: ['erro', 'Nova'],
  em_resposta: ['espera', 'Em resposta'],
  respondida: ['ok', 'Respondida'],
  publicada: ['azul', 'Publicada no FAQ'],
  incompleta: ['parado', 'Incompleta'],
};

const ORIGEM: Record<string, string> = { portal: 'Portal', nfse: 'NFS-e', evento: 'Evento' };

const BASES_SUGERIDAS = ['Resolução CGSN 194', 'LC 214/2025', 'EC 132/2023', 'Guia do Emissor Nacional v1.2'];

function Tag({ s }: { s: StatusDuvida }) {
  const [c, r] = SITUACAO_DUVIDA[s] ?? ['parado', s];
  return <span className={`tag ${c}`}>{r}</span>;
}

function Detalhe({
  d,
  usuarios,
  aoAtualizar,
}: {
  d: Duvida;
  usuarios: { id: number; nome: string; perfil: string }[];
  aoAtualizar: (d: Duvida) => void;
}) {
  const [resposta, setResposta] = useState(d.resposta ?? '');
  const [base, setBase] = useState(d.baseOficial ?? '');
  const [publicar, setPublicar] = useState(d.autorizaPublicar);
  const [publicoFaq, setPublicoFaq] = useState('todos');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const patch = async (dados: { status?: StatusDuvida; responsavelId?: number | null }) => {
    setErro(null);
    setOk(null);
    setOcupado(true);
    try {
      const r = await admin.atualizarDuvida(d.id, dados);
      aoAtualizar({ ...d, ...dados, ...(r ?? {}) });
      setOk('Alteração salva.');
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  const responder = async () => {
    setErro(null);
    setOk(null);
    if (!resposta.trim()) {
      setErro('Escreva a resposta.');
      return;
    }
    if (publicar && !base.trim()) {
      setErro('Informe a base oficial para publicar no FAQ.');
      return;
    }
    setOcupado(true);
    try {
      const r = await admin.responderDuvida(d.id, {
        resposta: resposta.trim(),
        baseOficial: base.trim() || undefined,
        publicarNoFaq: publicar && d.autorizaPublicar,
        publicoFaq: publicar ? publicoFaq : undefined,
      });
      aoAtualizar(r && r.id ? { ...d, ...r } : { ...d, resposta, baseOficial: base, status: publicar && d.autorizaPublicar ? 'publicada' : 'respondida' });
      setOk(
        publicar && d.autorizaPublicar
          ? 'Resposta enviada por e-mail. A pergunta foi para o FAQ e aguarda aprovação do gestor.'
          : 'Resposta enviada por e-mail.',
      );
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="painel">
      <h3>
        {d.protocolo} <Tag s={d.status} />
      </h3>
      <div className="pergunta-orig">
        <div className="quem">
          {d.nome} · {d.perfil} · {ORIGEM[d.origem] ?? d.origem} · enviada em {formatarData(d.criadoEm)} ·{' '}
          {d.autorizaPublicar ? 'autorizou publicar' : 'não autorizou publicar'}
          <br />
          <a href={`mailto:${d.email}`} style={{ color: 'var(--azul)', overflowWrap: 'anywhere' }}>
            {d.email}
          </a>
          {d.telefone ? ` · ${d.telefone}` : ''}
        </div>
        {d.assunto && (
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
            Assunto: {d.assunto}
            {d.segmento ? ` · segmento ${d.segmento}` : ''}
          </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap' }}>{d.texto}</div>
      </div>
      <div className="campo">
        <label htmlFor="d-resp">Responsável</label>
        <select
          id="d-resp"
          value={d.responsavelId ?? ''}
          disabled={ocupado}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            patch({ responsavelId: v, ...(d.status === 'nova' && v ? { status: 'em_resposta' as StatusDuvida } : {}) });
          }}
        >
          <option value="">Ninguém</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="d-resposta">Resposta</label>
        <textarea id="d-resposta" placeholder="Escreva a resposta que vai por e-mail" value={resposta} onChange={(e) => setResposta(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="d-base">Base oficial (obrigatório para publicar no FAQ)</label>
        <input id="d-base" list="bases-sugeridas" value={base} onChange={(e) => setBase(e.target.value)} />
        <datalist id="bases-sugeridas">
          {BASES_SUGERIDAS.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>
      <label className="check">
        <input type="checkbox" checked={publicar && d.autorizaPublicar} disabled={!d.autorizaPublicar} onChange={(e) => setPublicar(e.target.checked)} />
        Publicar também nas perguntas frequentes (sem identificar o autor)
        {!d.autorizaPublicar && ' — o autor não autorizou'}
      </label>
      {publicar && d.autorizaPublicar && (
        <div className="campo">
          <label htmlFor="d-publico">Público da pergunta no FAQ</label>
          <select id="d-publico" value={publicoFaq} onChange={(e) => setPublicoFaq(e.target.value)}>
            {Object.entries(ROTULO_PUBLICO).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="acoes">
        <button className="botao peq" onClick={responder} disabled={ocupado}>
          Responder por e-mail
        </button>
        {d.status === 'nova' && (
          <button className="botao vazio peq" onClick={() => patch({ status: 'em_resposta' })} disabled={ocupado}>
            Marcar “em resposta”
          </button>
        )}
        {d.status !== 'incompleta' && d.status !== 'respondida' && d.status !== 'publicada' && (
          <button className="botao vazio peq" onClick={() => patch({ status: 'incompleta' })} disabled={ocupado}>
            Marcar como incompleta
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

export default function Duvidas() {
  const [status, setStatus] = useState('');
  const [origem, setOrigem] = useState('');
  const lista = useApi(() => admin.duvidas({ status: status || undefined, origem: origem || undefined }), [status, origem]);
  const usuarios = useApi(() => admin.usuariosResumo());
  const [selId, setSelId] = useState<number | null>(null);
  const itens = lista.dados ?? [];
  const sel = itens.find((d) => d.id === selId) ?? null;

  useEffect(() => {
    if (itens.length && !itens.some((d) => d.id === selId)) setSelId(itens[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.dados]);

  const novas = itens.filter((d) => d.status === 'nova').length;
  const emResposta = itens.filter((d) => d.status === 'em_resposta').length;

  return (
    <>
      <Banner
        variante="escuro"
        icone="caixa"
        titulo="Caixa de dúvidas"
        texto="Responda por e-mail e, se for útil para outros, publique como pergunta frequente com a base oficial."
      />
      <div className="kpis">
        <div className="kpi">
          <span>Novas (nesta lista)</span>
          <b>{novas}</b>
        </div>
        <div className="kpi">
          <span>Em resposta</span>
          <b>{emResposta}</b>
        </div>
        <div className="kpi">
          <span>Total listado</span>
          <b>{itens.length}</b>
        </div>
        <div className="kpi">
          <span>Prazo de resposta</span>
          <b>5 dias úteis</b>
        </div>
      </div>
      <div className="duas larga">
        <div className="painel">
          <h3>Fila</h3>
          <div className="filtros">
            {(['', 'nova', 'em_resposta', 'respondida', 'publicada', 'incompleta'] as const).map((s) => (
              <button key={s || 'todas'} className={`chip${status === s ? ' ativo' : ''}`} onClick={() => setStatus(s)}>
                {s ? SITUACAO_DUVIDA[s][1] : 'Todas'}
              </button>
            ))}
          </div>
          <div className="campo" style={{ maxWidth: 240 }}>
            <label htmlFor="f-origem">Origem</label>
            <select id="f-origem" value={origem} onChange={(e) => setOrigem(e.target.value)}>
              <option value="">Todas</option>
              <option value="portal">Portal</option>
              <option value="nfse">NFS-e</option>
              <option value="evento">Evento</option>
            </select>
          </div>
          {lista.carregando && !lista.dados ? (
            <Carregando />
          ) : lista.erro ? (
            <AvisoApi mensagem={lista.erro} />
          ) : itens.length === 0 ? (
            <p className="sub">Nenhuma dúvida com estes filtros.</p>
          ) : (
            <div className="tabela-scroll">
              <table className="lista clicavel">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Dúvida</th>
                    <th>Perfil</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((d) => (
                    <tr
                      key={d.id}
                      className={d.id === selId ? 'sel' : undefined}
                      onClick={() => setSelId(d.id)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelId(d.id)}
                    >
                      <td style={{ whiteSpace: 'nowrap' }}>{d.protocolo}</td>
                      <td>{d.texto.length > 110 ? d.texto.slice(0, 110) + '…' : d.texto}</td>
                      <td>{d.perfil}</td>
                      <td>
                        <Tag s={d.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {sel ? (
          <Detalhe
            key={sel.id}
            d={sel}
            usuarios={usuarios.dados ?? []}
            aoAtualizar={(nova) => lista.setDados((l) => (l ?? []).map((x) => (x.id === nova.id ? nova : x)))}
          />
        ) : (
          <div className="painel">
            <h3>Detalhe</h3>
            <p className="sub" style={{ margin: 0 }}>
              Selecione uma dúvida na fila.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

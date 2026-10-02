import { Fragment, useState } from 'react';
import { admin, mensagemErro, type Agendamento, type Oficina, type SituacaoPrestador, type StatusAgendamento } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { formatarData, useApi } from '../../util';

const STATUS_AG: Record<StatusAgendamento, [string, string]> = {
  agendado: ['espera', 'Agendado'],
  atendido: ['ok', 'Atendido'],
  faltou: ['erro', 'Faltou'],
  cancelado: ['parado', 'Cancelado'],
};

const SITUACAO_PR: Record<SituacaoPrestador, [string, string]> = {
  sem_acesso: ['erro', 'Sem acesso'],
  acessou: ['espera', 'Acessou, não emitiu'],
  emitindo: ['ok', 'Emitindo'],
  bloqueado: ['parado', 'Bloqueado'],
};

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Agendamentos() {
  const [data, setData] = useState('');
  const [status, setStatus] = useState('');
  const lista = useApi(() => admin.agendamentos({ data: data || undefined, status: status || undefined }), [data, status]);
  const [erro, setErro] = useState<string | null>(null);

  const mudar = async (a: Agendamento, novo: StatusAgendamento) => {
    setErro(null);
    try {
      await admin.atualizarAgendamento(a.id, { status: novo, observacao: a.observacao });
      lista.setDados((l) => (l ?? []).map((x) => (x.id === a.id ? { ...x, status: novo } : x)));
    } catch (e) {
      setErro(mensagemErro(e));
    }
  };

  const observar = async (a: Agendamento) => {
    const obs = window.prompt('Observação do atendimento:', a.observacao ?? '');
    if (obs === null) return;
    try {
      await admin.atualizarAgendamento(a.id, { status: a.status, observacao: obs || null });
      lista.setDados((l) => (l ?? []).map((x) => (x.id === a.id ? { ...x, observacao: obs || null } : x)));
    } catch (e) {
      setErro(mensagemErro(e));
    }
  };

  return (
    <div className="painel">
      <h3>Cadastros presenciais agendados</h3>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor="ag-f-data">Data</label>
          <input id="ag-f-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="ag-f-status">Situação</label>
          <select id="ag-f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(STATUS_AG).map(([v, [, r]]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="acoes" style={{ marginTop: 0, marginBottom: 12 }}>
        <button className="botao vazio peq" onClick={() => setData(hoje())}>
          Só hoje
        </button>
        <button className="botao vazio peq" onClick={() => setData('')}>
          Todas as datas
        </button>
      </div>
      {erro && (
        <div className="erro-box" role="alert" style={{ marginBottom: 10 }}>
          {erro}
        </div>
      )}
      {lista.carregando && !lista.dados ? (
        <Carregando />
      ) : lista.erro ? (
        <AvisoApi mensagem={lista.erro} />
      ) : !(lista.dados ?? []).length ? (
        <p className="sub">Nenhum agendamento.</p>
      ) : (
        <div className="tabela-scroll">
          <table className="lista">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Contribuinte</th>
                <th>Motivo</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {(lista.dados ?? []).map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatarData(a.dataPreferida)}
                    <br />
                    <small>{a.turno === 'manha' ? 'manhã' : 'tarde'}</small>
                  </td>
                  <td>
                    {a.nome}
                    <br />
                    <small style={{ color: 'var(--tinta-fraca)' }}>
                      {a.cpfCnpj}
                      {a.telefone ? ` · ${a.telefone}` : ''}
                      {a.email ? ` · ${a.email}` : ''}
                    </small>
                  </td>
                  <td>
                    {a.motivo}
                    {a.observacao && (
                      <>
                        <br />
                        <small style={{ color: 'var(--tinta-fraca)' }}>Obs.: {a.observacao}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <select aria-label={`Situação do agendamento de ${a.nome}`} value={a.status} onChange={(e) => mudar(a, e.target.value as StatusAgendamento)}>
                      {Object.entries(STATUS_AG).map(([v, [, r]]) => (
                        <option key={v} value={v}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <br />
                    <button className="link-acao" style={{ fontSize: 12.5, marginTop: 4 }} onClick={() => observar(a)}>
                      observação
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type FormOficina = { titulo: string; data: string; hora: string; local: string; publico: string; vagas: number; ativo: boolean };
const OF_VAZIA: FormOficina = { titulo: '', data: '', hora: '', local: '', publico: '', vagas: 20, ativo: true };

function qtdInscritos(o: Oficina) {
  return Array.isArray(o.inscricoes) ? o.inscricoes.length : typeof o.inscricoes === 'number' ? o.inscricoes : 0;
}

function Oficinas() {
  const lista = useApi(() => admin.oficinas());
  const [form, setForm] = useState<FormOficina>(OF_VAZIA);
  const [editando, setEditando] = useState<number | null>(null);
  const [aberta, setAberta] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!form.titulo.trim() || !form.data) {
      setErro('Informe título e data.');
      return;
    }
    setOcupado(true);
    try {
      const dados = { ...form, vagas: Number(form.vagas) || 0 };
      if (editando) await admin.atualizarOficina(editando, dados);
      else await admin.criarOficina(dados);
      setForm(OF_VAZIA);
      setEditando(null);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setOcupado(false);
    }
  };

  const remover = async (o: Oficina) => {
    if (!window.confirm(`Excluir a oficina “${o.titulo}”?`)) return;
    try {
      await admin.removerOficina(o.id);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  };

  return (
    <>
      <form className="painel" onSubmit={salvar}>
        <h3>{editando ? 'Editar oficina' : 'Nova oficina'}</h3>
        <div className="form-linha">
          <div className="campo">
            <label htmlFor="of-titulo">Título</label>
            <input id="of-titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="of-data">Data</label>
            <input id="of-data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="of-hora">Hora</label>
            <input id="of-hora" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} placeholder="9h" />
          </div>
          <div className="campo">
            <label htmlFor="of-local">Local</label>
            <input id="of-local" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="of-publico">Público</label>
            <input id="of-publico" value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} placeholder="MEI, empresas, contadores…" />
          </div>
          <div className="campo">
            <label htmlFor="of-vagas">Vagas</label>
            <input id="of-vagas" type="number" min={0} value={form.vagas} onChange={(e) => setForm({ ...form, vagas: Number(e.target.value) })} />
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativa (aparece no portal)
        </label>
        <div className="acoes">
          <button className="botao peq" type="submit" disabled={ocupado}>
            {editando ? 'Salvar alterações' : 'Criar oficina'}
          </button>
          {editando && (
            <button
              type="button"
              className="botao vazio peq"
              onClick={() => {
                setEditando(null);
                setForm(OF_VAZIA);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
        {erro && (
          <div className="erro-box" role="alert">
            {erro}
          </div>
        )}
      </form>
      <div className="painel">
        <h3>Oficinas</h3>
        {lista.carregando && !lista.dados ? (
          <Carregando />
        ) : lista.erro ? (
          <AvisoApi mensagem={lista.erro} />
        ) : !(lista.dados ?? []).length ? (
          <p className="sub">Nenhuma oficina cadastrada.</p>
        ) : (
          <div className="tabela-scroll">
            <table className="lista">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Oficina</th>
                  <th>Inscritos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(lista.dados ?? []).map((o) => (
                  <Fragment key={o.id}>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatarData(o.data)}
                        <br />
                        <small>{o.hora}</small>
                      </td>
                      <td>
                        {o.titulo} {!o.ativo && <span className="tag parado">inativa</span>}
                        <br />
                        <small style={{ color: 'var(--tinta-fraca)' }}>
                          {[o.local, o.publico].filter(Boolean).join(' · ')}
                        </small>
                      </td>
                      <td>
                        <b>{qtdInscritos(o)}</b> / {o.vagas}
                      </td>
                      <td>
                        <div className="acoes" style={{ marginTop: 0 }}>
                          {Array.isArray(o.inscricoes) && o.inscricoes.length > 0 && (
                            <button className="botao vazio peq" onClick={() => setAberta(aberta === o.id ? null : o.id)}>
                              {aberta === o.id ? 'Ocultar inscritos' : 'Ver inscritos'}
                            </button>
                          )}
                          <button
                            className="botao vazio peq"
                            onClick={() => {
                              setEditando(o.id);
                              setForm({
                                titulo: o.titulo,
                                data: o.data?.slice(0, 10) ?? '',
                                hora: o.hora ?? '',
                                local: o.local ?? '',
                                publico: o.publico ?? '',
                                vagas: o.vagas ?? 0,
                                ativo: o.ativo,
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            Editar
                          </button>
                          <button className="botao vazio peq" onClick={() => remover(o)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                    {aberta === o.id && Array.isArray(o.inscricoes) && (
                      <tr>
                        <td colSpan={4}>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                            {o.inscricoes.map((i) => (
                              <li key={i.id}>
                                {i.nome} · {i.email}
                                {i.telefone ? ` · ${i.telefone}` : ''}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Prestadores() {
  const [situacao, setSituacao] = useState<SituacaoPrestador | ''>('');
  const dados = useApi(() => admin.prestadores(situacao || undefined), [situacao]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const funil = dados.dados?.funil;
  const lista = dados.dados?.prestadores ?? [];
  const pct = (n: number) => (funil && funil.total ? Math.round((n / funil.total) * 100) : 0);

  const importar = async () => {
    if (!arquivo) return;
    setImportando(true);
    setErro(null);
    setResultado(null);
    try {
      const r = await admin.importarPrestadores(arquivo);
      setResultado(`${r.importados} importado(s) e ${r.atualizados} atualizado(s).`);
      dados.recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setImportando(false);
    }
  };

  return (
    <>
      {funil && (
        <div className="kpis">
          <div className="kpi">
            <span>Prestadores cadastrados</span>
            <b>{funil.total.toLocaleString('pt-BR')}</b>
          </div>
          <div className="kpi">
            <span>Já fizeram o primeiro acesso</span>
            <b>{funil.acessou.toLocaleString('pt-BR')}</b>
          </div>
          <div className="kpi">
            <span>Já emitem no Emissor Nacional</span>
            <b>{funil.emitindo.toLocaleString('pt-BR')}</b>
          </div>
          <div className="kpi">
            <span>Bloqueados</span>
            <b>{funil.bloqueados.toLocaleString('pt-BR')}</b>
          </div>
        </div>
      )}
      <div className="duas larga">
        <div className="painel">
          <h3>Prestadores</h3>
          <div className="filtros" style={{ marginBottom: 10 }}>
            <button className={`chip${situacao === '' ? ' ativo' : ''}`} onClick={() => setSituacao('')}>
              Todos
            </button>
            {(Object.keys(SITUACAO_PR) as SituacaoPrestador[]).map((s) => (
              <button key={s} className={`chip${situacao === s ? ' ativo' : ''}`} onClick={() => setSituacao(s)}>
                {SITUACAO_PR[s][1]}
              </button>
            ))}
          </div>
          {dados.carregando && !dados.dados ? (
            <Carregando />
          ) : dados.erro ? (
            <AvisoApi mensagem={dados.erro} />
          ) : !lista.length ? (
            <p className="sub">Nenhum prestador nesta situação. Importe a planilha ao lado.</p>
          ) : (
            <div className="tabela-scroll">
              <table className="lista">
                <thead>
                  <tr>
                    <th>Contribuinte</th>
                    <th>Perfil</th>
                    <th>Situação</th>
                    <th>Contador</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.nome}
                        <br />
                        <small style={{ color: 'var(--tinta-fraca)' }}>{p.cpfCnpj}</small>
                      </td>
                      <td>{p.perfil}</td>
                      <td>
                        <span className={`tag ${SITUACAO_PR[p.situacao]?.[0] ?? 'parado'}`}>{SITUACAO_PR[p.situacao]?.[1] ?? p.situacao}</span>
                      </td>
                      <td>{p.contador || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          {funil && (
            <div className="painel">
              <h3>Funil de preparação</h3>
              <div className="barra-funil">
                <div>
                  <span>Prestadores cadastrados</span>
                  <span className="trilho">
                    <i style={{ width: funil.total ? '100%' : '0%' }} />
                  </span>
                  <b>{funil.total}</b>
                </div>
                <div>
                  <span>Fizeram o primeiro acesso</span>
                  <span className="trilho">
                    <i style={{ width: `${pct(funil.acessou)}%` }} />
                  </span>
                  <b>{funil.acessou}</b>
                </div>
                <div>
                  <span>Emitiram ao menos uma nota</span>
                  <span className="trilho">
                    <i style={{ width: `${pct(funil.emitindo)}%` }} />
                  </span>
                  <b>{funil.emitindo}</b>
                </div>
              </div>
            </div>
          )}
          <div className="painel">
            <h3>Importar planilha</h3>
            <p className="ajuda">
              CSV separado por ponto e vírgula com as colunas: nome;cpf_cnpj;perfil;situacao;contador;email. Prestadores já cadastrados
              (mesmo CPF/CNPJ) são atualizados.
            </p>
            <input type="file" accept=".csv,text/csv" aria-label="Planilha CSV de prestadores" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} style={{ maxWidth: '100%' }} />
            <div className="acoes">
              <button className="botao peq" onClick={importar} disabled={!arquivo || importando}>
                {importando ? 'Importando…' : 'Importar'}
              </button>
            </div>
            {resultado && (
              <div className="mensagem-ok" role="status">
                {resultado}
              </div>
            )}
            {erro && (
              <div className="erro-box" role="alert">
                {erro}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const ABAS = ['Agendamentos', 'Oficinas', 'Prestadores'] as const;

export default function Nfse() {
  const [aba, setAba] = useState<(typeof ABAS)[number]>('Agendamentos');
  return (
    <>
      <Banner
        variante="escuro"
        icone="documento"
        titulo="Migração para a NFS-e Nacional"
        texto="Acompanhe quais prestadores de Canindé já estão prontos para emitir, organize os atendimentos presenciais e as oficinas."
      />
      <div className="passos-tab" role="tablist">
        {ABAS.map((a) => (
          <button key={a} role="tab" aria-selected={aba === a} className={aba === a ? 'ativo' : undefined} onClick={() => setAba(a)}>
            {a}
          </button>
        ))}
      </div>
      {aba === 'Agendamentos' && <Agendamentos />}
      {aba === 'Oficinas' && <Oficinas />}
      {aba === 'Prestadores' && <Prestadores />}
    </>
  );
}

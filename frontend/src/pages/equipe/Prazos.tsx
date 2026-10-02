import { useState } from 'react';
import { admin, mensagemErro, type Prazo } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { diasAte, formatarData, useApi } from '../../util';

type FormPrazo = { titulo: string; quem: string; ate: string; fonte: string; ativo: boolean };
const VAZIO: FormPrazo = { titulo: '', quem: '', ate: '', fonte: '', ativo: true };

function PrazosPagina() {
  const lista = useApi(() => admin.prazos());
  const [form, setForm] = useState<FormPrazo>(VAZIO);
  const [editando, setEditando] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!form.titulo.trim() || !form.ate) {
      setErro('Informe ao menos o título e a data.');
      return;
    }
    setOcupado(true);
    try {
      const dados = { ...form, titulo: form.titulo.trim(), quem: form.quem.trim(), fonte: form.fonte.trim() };
      if (editando) await admin.atualizarPrazo(editando, dados);
      else await admin.criarPrazo(dados);
      setForm(VAZIO);
      setEditando(null);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setOcupado(false);
    }
  };

  const editar = (p: Prazo) => {
    setEditando(p.id);
    setForm({ titulo: p.titulo, quem: p.quem ?? '', ate: p.ate?.slice(0, 10) ?? '', fonte: p.fonte ?? '', ativo: p.ativo });
  };

  const alternar = async (p: Prazo) => {
    try {
      await admin.atualizarPrazo(p.id, { ativo: !p.ativo });
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  };

  const remover = async (p: Prazo) => {
    if (!window.confirm(`Excluir o prazo “${p.titulo}”?`)) return;
    try {
      await admin.removerPrazo(p.id);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  };

  return (
    <>
      <Banner
        variante="escuro"
        icone="calendario"
        titulo="Prazos que estão correndo"
        texto="Os prazos ativos e futuros aparecem no quadro da página inicial, com contagem regressiva."
      />
      <form className="painel" onSubmit={salvar}>
        <h3>{editando ? 'Editar prazo' : 'Novo prazo'}</h3>
        <div className="form-linha">
          <div className="campo">
            <label htmlFor="p-titulo">O que</label>
            <input id="p-titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="p-quem">Para quem</label>
            <input id="p-quem" value={form.quem} onChange={(e) => setForm({ ...form, quem: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="p-ate">Até</label>
            <input id="p-ate" type="date" value={form.ate} onChange={(e) => setForm({ ...form, ate: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="p-fonte">Fonte</label>
            <input id="p-fonte" value={form.fonte} onChange={(e) => setForm({ ...form, fonte: e.target.value })} placeholder="Ex.: CGIBS / Receita Federal, 30/09/2026" />
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo (mostrar no portal)
        </label>
        <div className="acoes">
          <button className="botao peq" type="submit" disabled={ocupado}>
            {editando ? 'Salvar alterações' : 'Criar prazo'}
          </button>
          {editando && (
            <button
              type="button"
              className="botao vazio peq"
              onClick={() => {
                setEditando(null);
                setForm(VAZIO);
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
        <h3>Prazos cadastrados</h3>
        {lista.carregando && !lista.dados ? (
          <Carregando />
        ) : lista.erro ? (
          <AvisoApi mensagem={lista.erro} />
        ) : !(lista.dados ?? []).length ? (
          <p className="sub">Nenhum prazo cadastrado.</p>
        ) : (
          <div className="tabela-scroll">
            <table className="lista">
              <thead>
                <tr>
                  <th>Até</th>
                  <th>O que</th>
                  <th>Para quem</th>
                  <th>Situação</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(lista.dados ?? []).map((p) => {
                  const d = diasAte(p.ate);
                  return (
                    <tr key={p.id} className={editando === p.id ? 'sel' : undefined}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatarData(p.ate)}</td>
                      <td>
                        {p.titulo}
                        {p.fonte && (
                          <>
                            <br />
                            <small style={{ color: 'var(--tinta-fraca)' }}>{p.fonte}</small>
                          </>
                        )}
                      </td>
                      <td>{p.quem}</td>
                      <td>
                        {!p.ativo ? (
                          <span className="tag parado">Inativo</span>
                        ) : d !== null && d < 0 ? (
                          <span className="tag parado">Encerrado</span>
                        ) : (
                          <span className="tag ok">No portal</span>
                        )}
                      </td>
                      <td>
                        <div className="acoes" style={{ marginTop: 0 }}>
                          <button className="botao vazio peq" onClick={() => editar(p)}>
                            Editar
                          </button>
                          <button className="botao vazio peq" onClick={() => alternar(p)}>
                            {p.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="botao vazio peq" onClick={() => remover(p)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function Prazos() {
  return (
    <SoPara perfis={['gestor', 'editor']}>
      <PrazosPagina />
    </SoPara>
  );
}

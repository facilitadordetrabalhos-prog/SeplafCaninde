import { useState } from 'react';
import { admin, mensagemErro, type ServicoOnline } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { useApi } from '../../util';

type Form = {
  titulo: string;
  descricao: string;
  url: string;
  icone: string;
  aviso: string;
  avisoTipo: '' | 'mudanca' | 'boa';
  destaque: boolean;
  ordem: number;
  ativo: boolean;
};
const VAZIO: Form = { titulo: '', descricao: '', url: '', icone: '🔗', aviso: '', avisoTipo: '', destaque: false, ordem: 0, ativo: true };

function Pagina() {
  const lista = useApi(() => admin.servicos());
  const [form, setForm] = useState<Form>(VAZIO);
  const [editando, setEditando] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!form.titulo.trim() || !/^https?:\/\//.test(form.url.trim())) {
      setErro('Informe o título e um endereço começando com http:// ou https://.');
      return;
    }
    setOcupado(true);
    const dados: Partial<ServicoOnline> = {
      ...form,
      titulo: form.titulo.trim(),
      url: form.url.trim(),
      aviso: form.aviso.trim() || null,
      avisoTipo: form.aviso.trim() ? form.avisoTipo || 'boa' : null,
      ordem: Number(form.ordem) || 0,
    };
    try {
      if (editando) await admin.atualizarServico(editando, dados);
      else await admin.criarServico(dados);
      setForm(VAZIO);
      setEditando(null);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setOcupado(false);
    }
  };

  const remover = async (s: ServicoOnline) => {
    if (!window.confirm(`Excluir o serviço “${s.titulo}”?`)) return;
    try {
      await admin.removerServico(s.id);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  };

  return (
    <>
      <Banner variante="escuro" icone="cartao" titulo="Serviços online" texto="Atalhos do portal para o sistema tributário do município e para o Emissor Nacional." />
      <form className="painel" onSubmit={salvar}>
        <h3>{editando ? 'Editar serviço' : 'Novo serviço'}</h3>
        <div className="form-linha">
          <div className="campo">
            <label htmlFor="s-titulo">Título</label>
            <input id="s-titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="s-url">Endereço (URL)</label>
            <input id="s-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="campo">
            <label htmlFor="s-icone">Ícone (emoji)</label>
            <input id="s-icone" value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="s-ordem">Ordem</label>
            <input id="s-ordem" type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="s-desc">Descrição</label>
          <textarea id="s-desc" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={{ minHeight: 70 }} />
        </div>
        <div className="form-linha">
          <div className="campo">
            <label htmlFor="s-aviso">Aviso (opcional)</label>
            <input id="s-aviso" value={form.aviso} onChange={(e) => setForm({ ...form, aviso: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="s-aviso-tipo">Tipo do aviso</label>
            <select id="s-aviso-tipo" value={form.avisoTipo} onChange={(e) => setForm({ ...form, avisoTipo: e.target.value as Form['avisoTipo'] })}>
              <option value="">—</option>
              <option value="boa">Novidade (verde)</option>
              <option value="mudanca">Mudança (amarelo)</option>
            </select>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} /> Atalho na página inicial
        </label>
        <label className="check">
          <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo
        </label>
        <div className="acoes">
          <button className="botao peq" type="submit" disabled={ocupado}>
            {editando ? 'Salvar alterações' : 'Criar serviço'}
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
        <h3>Serviços cadastrados</h3>
        {lista.carregando && !lista.dados ? (
          <Carregando />
        ) : lista.erro ? (
          <AvisoApi mensagem={lista.erro} />
        ) : (
          <div className="tabela-scroll">
            <table className="lista">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Serviço</th>
                  <th>Situação</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(lista.dados ?? []).map((s) => (
                  <tr key={s.id} className={editando === s.id ? 'sel' : undefined}>
                    <td>{s.ordem}</td>
                    <td>
                      {s.icone} {s.titulo}
                      <br />
                      <small style={{ color: 'var(--tinta-fraca)' }}>{s.url}</small>
                    </td>
                    <td>
                      {s.ativo ? <span className="tag ok">Ativo</span> : <span className="tag parado">Inativo</span>}{' '}
                      {s.destaque && <span className="tag lar">Atalho</span>}
                    </td>
                    <td>
                      <div className="acoes" style={{ marginTop: 0 }}>
                        <button
                          className="botao vazio peq"
                          onClick={() => {
                            setEditando(s.id);
                            setForm({
                              titulo: s.titulo,
                              descricao: s.descricao ?? '',
                              url: s.url,
                              icone: s.icone ?? '',
                              aviso: s.aviso ?? '',
                              avisoTipo: s.avisoTipo ?? '',
                              destaque: s.destaque,
                              ordem: s.ordem,
                              ativo: s.ativo,
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Editar
                        </button>
                        <button className="botao vazio peq" onClick={() => remover(s)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function ServicosAdmin() {
  return (
    <SoPara perfis={['gestor']}>
      <Pagina />
    </SoPara>
  );
}

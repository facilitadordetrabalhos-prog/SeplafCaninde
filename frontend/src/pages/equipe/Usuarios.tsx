import { useState } from 'react';
import { admin, mensagemErro, type Perfil } from '../../api';
import { useAuth } from '../../components/AuthContext';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { formatarData, useApi } from '../../util';

const PERFIS: [Perfil, string, string][] = [
  ['gestor', 'Gestor', 'tudo; aprova conteúdo e temas; módulos, serviços, configurações e usuários'],
  ['editor', 'Editor', 'cria e edita conteúdo, curadoria do monitor CGIBS e prazos'],
  ['equipe', 'Equipe técnica', 'responde dúvidas, dúvidas de evento, agendamentos, oficinas e prestadores'],
];
const NOME = Object.fromEntries(PERFIS.map(([p, n]) => [p, n]));

type Form = { nome: string; email: string; perfil: Perfil; senha: string; ativo: boolean };
const VAZIO: Form = { nome: '', email: '', perfil: 'equipe', senha: '', ativo: true };

function Pagina() {
  const { usuario } = useAuth();
  const lista = useApi(() => admin.usuariosResumo());
  const [form, setForm] = useState<Form>(VAZIO);
  const [editando, setEditando] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setOk(null);
    if (!form.nome.trim() || !form.email.trim()) {
      setErro('Informe nome e e-mail.');
      return;
    }
    if (!editando && form.senha.length < 8) {
      setErro('A senha inicial precisa ter ao menos 8 caracteres.');
      return;
    }
    setOcupado(true);
    try {
      const dados = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        perfil: form.perfil,
        ativo: form.ativo,
        ...(form.senha ? { senha: form.senha } : {}),
      };
      if (editando) await admin.atualizarUsuario(editando, dados);
      else await admin.criarUsuario(dados);
      setOk(editando ? 'Usuário atualizado.' : 'Usuário criado. Informe a senha inicial pessoalmente ao servidor.');
      setForm(VAZIO);
      setEditando(null);
      lista.recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <Banner variante="escuro" icone="usuario" titulo="Usuários e perfis" texto="Quem acessa a área da equipe e o que cada perfil pode fazer." />
      <div className="duas">
        <div className="painel">
          <h3>Usuários</h3>
          {lista.carregando && !lista.dados ? (
            <Carregando />
          ) : lista.erro ? (
            <AvisoApi mensagem={lista.erro} />
          ) : (
            <div className="tabela-scroll">
              <table className="lista">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Perfil</th>
                    <th>Situação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(lista.dados ?? []).map((u) => (
                    <tr key={u.id} className={editando === u.id ? 'sel' : undefined}>
                      <td>
                        {u.nome}
                        {u.email && (
                          <>
                            <br />
                            <small style={{ color: 'var(--tinta-fraca)' }}>{u.email}</small>
                          </>
                        )}
                        {u.criadoEm && (
                          <>
                            <br />
                            <small style={{ color: 'var(--tinta-fraca)' }}>desde {formatarData(u.criadoEm)}</small>
                          </>
                        )}
                      </td>
                      <td>{NOME[u.perfil] ?? u.perfil}</td>
                      <td>{u.ativo === false ? <span className="tag parado">Inativo</span> : <span className="tag ok">Ativo</span>}</td>
                      <td>
                        <button
                          className="botao vazio peq"
                          onClick={() => {
                            setEditando(u.id);
                            setForm({ nome: u.nome, email: u.email ?? '', perfil: u.perfil, senha: '', ativo: u.ativo !== false });
                            setOk(null);
                            setErro(null);
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <form className="painel" onSubmit={salvar}>
          <h3>{editando ? 'Editar usuário' : 'Novo usuário'}</h3>
          <div className="campo">
            <label htmlFor="u-nome">Nome</label>
            <input id="u-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="u-email">E-mail</label>
            <input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          </div>
          <div className="campo">
            <label htmlFor="u-perfil">Perfil</label>
            <select id="u-perfil" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}>
              {PERFIS.map(([p, n]) => (
                <option key={p} value={p}>
                  {n}
                </option>
              ))}
            </select>
            <small className="ajuda" style={{ display: 'block', margin: '4px 0 0' }}>
              {PERFIS.find(([p]) => p === form.perfil)?.[2]}
            </small>
          </div>
          <div className="campo">
            <label htmlFor="u-senha">{editando ? 'Nova senha (deixe vazio para manter)' : 'Senha inicial'}</label>
            <input id="u-senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} autoComplete="new-password" />
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={form.ativo}
              disabled={editando === usuario?.id}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />{' '}
            Ativo (pode entrar na área da equipe)
          </label>
          <div className="acoes">
            <button className="botao peq" type="submit" disabled={ocupado}>
              {editando ? 'Salvar alterações' : 'Criar usuário'}
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
          {ok && (
            <div className="mensagem-ok" role="status">
              {ok}
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export default function Usuarios() {
  return (
    <SoPara perfis={['gestor']}>
      <Pagina />
    </SoPara>
  );
}

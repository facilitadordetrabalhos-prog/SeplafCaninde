import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, mensagemErro } from '../../api';
import { useAuth } from '../../components/AuthContext';

export default function Login() {
  const { entrar, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de || '/equipe';
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to={destino} replace />;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError && err.status === 401 ? 'E-mail ou senha incorretos.' : mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="faixa-topo" aria-hidden="true" />
      <header className="topo">
        <Link to="/" aria-label="Voltar ao portal">
          <img src="/img/logo-secretaria.webp" alt="Prefeitura Municipal de Canindé — Secretaria de Finanças" />
        </Link>
        <div className="topo-acoes">
          <Link className="cracha" to="/">
            Voltar ao portal
          </Link>
        </div>
      </header>
      <main className="conteudo">
        <div className="login-box">
          <div className="form-card">
            <div className="cabeca">Área da equipe — Secretaria de Finanças</div>
            <form className="corpo" onSubmit={enviar}>
              <div className="campo">
                <label htmlFor="login-email">E-mail</label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </div>
              <div className="campo">
                <label htmlFor="login-senha">Senha</label>
                <input
                  id="login-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button className="botao" type="submit" style={{ width: '100%' }} disabled={enviando}>
                {enviando ? 'Entrando…' : 'Entrar'}
              </button>
              {erro && (
                <div className="erro-box" role="alert">
                  {erro}
                </div>
              )}
              <p className="sub" style={{ margin: '12px 0 0' }}>
                Acesso restrito aos servidores da Secretaria. Esqueceu a senha? Fale com o gestor do portal.
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

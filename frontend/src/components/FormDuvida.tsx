import { useState, type FormEvent, type ReactNode } from 'react';
import { api, mensagemErro, type StatusDuvida } from '../api';
import { formatarData } from '../util';
import { useConfig } from './ConfigContext';
import { Link } from 'react-router-dom';

const PERFIS = ['Cidadão', 'MEI', 'Empresa do Simples Nacional', 'Empresa (Lucro Presumido/Real)', 'Contador', 'Servidor público'];
const ASSUNTOS = ['Simples Nacional 2027', 'ISS e nota de serviço', 'IBS e CBS — geral', 'IPTU e taxas', 'Outro'];
const ETAPAS_NFSE = [
  'Primeiro acesso / senha',
  'Configuração e favoritos',
  'Preenchimento da nota',
  'Código do serviço',
  'Cancelar ou substituir',
  'Aplicativo',
];
const PERFIS_NFSE = ['MEI', 'Empresa do Simples Nacional', 'Empresa (Lucro Presumido/Real)', 'Autônomo', 'Contador', 'Recebo notas (tomador)'];

/** Formulário "Envie sua dúvida" (portal) ou "Pergunte sobre NFS-e" (origem nfse). */
export function FormDuvida({ origem = 'portal', titulo, rodape }: { origem?: 'portal' | 'nfse'; titulo: string; rodape?: ReactNode }) {
  const nfse = origem === 'nfse';
  const { config } = useConfig();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState(nfse ? PERFIS_NFSE[0] : PERFIS[0]);
  const [assunto, setAssunto] = useState(nfse ? ETAPAS_NFSE[0] : ASSUNTOS[0]);
  const [texto, setTexto] = useState('');
  const [autoriza, setAutoriza] = useState(!nfse);
  const [enviando, setEnviando] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!nome.trim() || !email.trim() || !texto.trim()) {
      setErro('Preencha nome, e-mail e a sua dúvida.');
      return;
    }
    setEnviando(true);
    try {
      const r = await api.enviarDuvida({
        nome: nome.trim(),
        email: email.trim(),
        perfil,
        assunto,
        texto: texto.trim(),
        autorizaPublicar: autoriza,
        origem,
      });
      setProtocolo(r.protocolo);
      setTexto('');
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  };

  const idp = `duv-${origem}`;
  return (
    <div className="form-card" id={nfse ? 'pergunte-nfse' : 'enviar-duvida'}>
      <div className="cabeca">{titulo}</div>
      <form className="corpo" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor={`${idp}-nome`}>Nome</label>
          <input id={`${idp}-nome`} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" />
        </div>
        <div className="campo">
          <label htmlFor={`${idp}-email`}>{config.emailAtivo ? 'E-mail (para receber a resposta)' : 'E-mail (para consultar a resposta)'}</label>
          <input
            id={`${idp}-email`}
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="campo">
          <label htmlFor={`${idp}-perfil`}>Você é</label>
          <select id={`${idp}-perfil`} value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            {(nfse ? PERFIS_NFSE : PERFIS).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor={`${idp}-assunto`}>{nfse ? 'Em que etapa você está?' : 'Assunto'}</label>
          <select id={`${idp}-assunto`} value={assunto} onChange={(e) => setAssunto(e.target.value)}>
            {(nfse ? ETAPAS_NFSE : ASSUNTOS).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor={`${idp}-texto`}>Sua dúvida</label>
          <textarea
            id={`${idp}-texto`}
            placeholder={nfse ? 'Se apareceu uma mensagem de erro, copie aqui' : 'Escreva com o máximo de detalhes possível'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />
        </div>
        <label className="check">
          <input type="checkbox" checked={autoriza} onChange={(e) => setAutoriza(e.target.checked)} /> Autorizo publicar a resposta nas
          perguntas frequentes, sem meu nome.
        </label>
        <p className="aviso-privacidade">
          Seus dados são usados só para responder a esta dúvida. <Link to="/privacidade">Aviso de privacidade</Link>
        </p>
        <button className="botao" type="submit" style={{ width: '100%' }} disabled={enviando}>
          {enviando ? 'Enviando…' : nfse ? 'Enviar' : 'Enviar dúvida'}
        </button>
        {erro && (
          <div className="erro-box" role="alert">
            {erro}
          </div>
        )}
        {protocolo && (
          <div className="sucesso ver" role="status">
            Dúvida recebida! Seu protocolo é <b>{protocolo}</b>. <b>Anote esse número.</b>
            <br />
            {config.emailAtivo
              ? 'A resposta chega no seu e-mail em até 5 dias úteis. Você também pode consultá-la pelo protocolo.'
              : 'Em até 5 dias úteis, consulte a resposta em “Acompanhe pelo protocolo”, informando este número e o seu e-mail.'}
          </div>
        )}
        {rodape}
      </form>
    </div>
  );
}

const SITUACAO: Record<StatusDuvida, [string, string]> = {
  nova: ['espera', 'Recebida — aguardando a equipe'],
  em_resposta: ['azul', 'Em resposta pela equipe'],
  respondida: ['ok', 'Respondida'],
  publicada: ['ok', 'Respondida e publicada nas perguntas frequentes'],
  incompleta: ['erro', 'Incompleta — a equipe vai entrar em contato'],
};

export function ConsultaProtocolo() {
  const [protocolo, setProtocolo] = useState('');
  const [email, setEmail] = useState('');
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof api.consultarProtocolo>> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const consultar = async (e: FormEvent) => {
    e.preventDefault();
    if (!protocolo.trim()) return;
    setErro(null);
    setResultado(null);
    setBuscando(true);
    try {
      setResultado(await api.consultarProtocolo(protocolo, email));
    } catch (err) {
      const m = mensagemErro(err);
      setErro(/não encontrad|not found/i.test(m) ? 'Protocolo não encontrado. Confira o número (ex.: DUV-2026-00143).' : m);
    } finally {
      setBuscando(false);
    }
  };

  const sit = resultado ? SITUACAO[resultado.status] ?? ['parado', resultado.status] : null;

  return (
    <div className="caixa-lateral" id="protocolo" style={{ marginTop: 14 }}>
      <h4>Acompanhe pelo protocolo</h4>
      <p style={{ margin: 0 }}>Informe o número do protocolo e o e-mail usado na pergunta para ver a resposta.</p>
      <form className="consulta-protocolo" onSubmit={consultar}>
        <input
          aria-label="Número do protocolo"
          placeholder="DUV-2026-00000"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
        />
        <input
          aria-label="E-mail usado na pergunta"
          type="email"
          placeholder="seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button className="botao peq preto" type="submit" disabled={buscando} style={{ marginTop: 0 }}>
          {buscando ? 'Consultando…' : 'Consultar'}
        </button>
      </form>
      {erro && (
        <div className="erro-box" role="alert">
          {erro}
        </div>
      )}
      {resultado && sit && (
        <div className="mensagem-ok" role="status" style={{ background: '#fff', border: '1px solid var(--linha)', color: 'var(--tinta)' }}>
          <b>{resultado.protocolo}</b> <span className={`tag ${sit[0]}`} style={{ whiteSpace: 'normal' }}>{sit[1]}</span>
          <br />
          <small style={{ color: 'var(--tinta-fraca)' }}>
            Enviada em {formatarData(resultado.criadoEm)}
            {resultado.respondidoEm ? ` · respondida em ${formatarData(resultado.respondidoEm)}` : ''}
          </small>
          {resultado.resposta && (
            <div className="resposta-protocolo">
              <div className="resp-rotulo">Resposta da Secretaria de Finanças</div>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{resultado.resposta}</p>
              {resultado.baseOficial && <div className="base">Base oficial: {resultado.baseOficial}</div>}
            </div>
          )}
          {(resultado.status === 'respondida' || resultado.status === 'publicada') && !resultado.emailConfere && (
            <p className="sub" style={{ margin: '8px 0 0' }}>
              Para ver a resposta, informe também o e-mail usado ao enviar a dúvida.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

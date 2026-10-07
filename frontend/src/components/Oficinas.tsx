import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { api, ApiError, mensagemErro, type OficinaPublica } from '../api';
import { diaMes } from '../util';

export function DataTurma({ data }: { data: string }) {
  const { dia, mes } = diaMes(data);
  return (
    <div className="dt">
      <b>{dia}</b>
      <small>{mes}</small>
    </div>
  );
}

function detalhes(o: OficinaPublica, comVagas: boolean) {
  const partes = [o.local, o.hora, o.publico];
  if (comVagas && o.vagas) {
    const restam = Math.max(0, o.vagas - (o.inscritos ?? 0));
    partes.push(restam > 0 ? `${restam} vaga${restam > 1 ? 's' : ''}` : 'lotada');
  }
  return partes.filter(Boolean).join(' · ');
}

/** Lista resumida (sem inscrição), para a página inicial do ambiente NFS-e. */
export function TurmasResumo({ oficinas }: { oficinas: OficinaPublica[] }) {
  return (
    <div className="turmas">
      {oficinas.map((o) => (
        <div className="turma" key={o.id}>
          <DataTurma data={o.data} />
          <div className="txt">
            {o.titulo}
            <small>{detalhes(o, false)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormInscricao({ oficina, aoConcluir }: { oficina: OficinaPublica; aoConcluir: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setErro('Informe nome e e-mail.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await api.inscreverOficina(oficina.id, { nome: nome.trim(), email: email.trim(), telefone: telefone.trim() || undefined });
      setOk(true);
      aoConcluir();
    } catch (err) {
      setErro(err instanceof ApiError && err.status === 409 ? 'Esta oficina está lotada. Escolha outra data.' : mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  };

  if (ok)
    return (
      <div className="sucesso ver" role="status" style={{ width: '100%' }}>
        Inscrição confirmada em <b style={{ fontSize: 'inherit' }}>{oficina.titulo}</b>. Anote a data, o horário e o local.
      </div>
    );

  return (
    <form onSubmit={enviar} style={{ width: '100%', marginTop: 8 }}>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor={`of-${oficina.id}-nome`}>Nome</label>
          <input id={`of-${oficina.id}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
        </div>
        <div className="campo">
          <label htmlFor={`of-${oficina.id}-email`}>E-mail</label>
          <input id={`of-${oficina.id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="campo">
          <label htmlFor={`of-${oficina.id}-tel`}>Telefone (opcional)</label>
          <input id={`of-${oficina.id}-tel`} type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="tel" />
        </div>
      </div>
      <p className="aviso-privacidade">
        Seus dados são usados só para este atendimento. <Link to="/privacidade">Aviso de privacidade</Link>
      </p>
      <button className="botao peq" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Confirmar inscrição'}
      </button>
      {erro && (
        <div className="erro-box" role="alert">
          {erro}
        </div>
      )}
    </form>
  );
}

/** Lista com botão "Inscrever" e formulário de inscrição. */
export function TurmasInscricao({ oficinas, aoInscrever }: { oficinas: OficinaPublica[]; aoInscrever: () => void }) {
  const [aberta, setAberta] = useState<number | null>(null);
  return (
    <div className="turmas">
      {oficinas.map((o) => {
        const lotada = o.vagas > 0 && (o.inscritos ?? 0) >= o.vagas;
        return (
          <div className="turma" key={o.id} style={{ flexWrap: 'wrap' }}>
            <DataTurma data={o.data} />
            <div className="txt">
              {o.titulo}
              <small>{detalhes(o, true)}</small>
            </div>
            {aberta !== o.id && (
              <button className="botao peq" disabled={lotada} onClick={() => setAberta(o.id)} style={{ marginTop: 0 }}>
                {lotada ? 'Lotada' : 'Inscrever'}
              </button>
            )}
            {aberta === o.id && <FormInscricao oficina={o} aoConcluir={aoInscrever} />}
          </div>
        );
      })}
    </div>
  );
}

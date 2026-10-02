import { useState } from 'react';
import { admin, mensagemErro, type Modulo } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';
import { useApi } from '../../util';

function Pagina() {
  const lista = useApi(() => admin.modulos());
  const [erro, setErro] = useState<string | null>(null);

  const alternar = async (m: Modulo) => {
    setErro(null);
    lista.setDados((l) => (l ?? []).map((x) => (x.chave === m.chave ? { ...x, ativo: !m.ativo } : x)));
    try {
      await admin.atualizarModulo(m.chave, !m.ativo);
    } catch (e) {
      setErro(mensagemErro(e));
      lista.recarregar();
    }
  };

  return (
    <>
      <Banner
        variante="escuro"
        icone="modulos"
        titulo="Módulos do portal"
        texto="Cada serviço da Secretaria é um módulo. Ligar coloca no menu e na página inicial; desligar tira do ar sem apagar nada."
      />
      {erro && (
        <div className="erro-box" role="alert" style={{ marginBottom: 14 }}>
          {erro}
        </div>
      )}
      {lista.carregando && !lista.dados ? (
        <Carregando />
      ) : lista.erro ? (
        <AvisoApi mensagem={lista.erro} />
      ) : (
        <div className="modulos">
          {(lista.dados ?? []).map((m) => (
            <div className="modulo" key={m.chave}>
              <div className="cab">
                <h4>{m.nome}</h4>
                <button
                  className={`chave${m.ativo ? ' on' : ''}`}
                  role="switch"
                  aria-checked={m.ativo}
                  aria-label={`${m.ativo ? 'Desligar' : 'Ligar'} o módulo ${m.nome}`}
                  onClick={() => alternar(m)}
                />
              </div>
              {m.descricao && <p>{m.descricao}</p>}
              <span className="pub">
                {m.ativo ? <span className="tag ok">Ativo</span> : <span className="tag parado">Desligado</span>} ·{' '}
                {m.publico ? 'público' : 'só equipe'}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function Modulos() {
  return (
    <SoPara perfis={['gestor']}>
      <Pagina />
    </SoPara>
  );
}

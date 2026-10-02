import { useEffect, useState } from 'react';
import { admin, mensagemErro } from '../../api';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { SoPara } from '../../layouts/EquipeLayout';

type Valor = Record<string, unknown>;

interface Campo {
  chave: string;
  rotulo: string;
  tipo?: 'texto' | 'url' | 'data' | 'numero' | 'email';
  ajuda?: string;
}

const CAMPOS: Record<string, { titulo: string; texto: string; campos: Campo[] }> = {
  contatos: {
    titulo: 'Contatos da Arrecadação',
    texto: 'Aparecem no rodapé, na página de serviços, no ambiente NFS-e e na mensagem de confirmação dos agendamentos.',
    campos: [
      { chave: 'orgao', rotulo: 'Órgão' },
      { chave: 'endereco', rotulo: 'Endereço' },
      { chave: 'horario', rotulo: 'Horário de atendimento' },
      { chave: 'email', rotulo: 'E-mail', tipo: 'email' },
      { chave: 'telefone', rotulo: 'Telefone (como aparece)' },
      { chave: 'telefoneLink', rotulo: 'Link do telefone', ajuda: 'Formato tel:+5585999999999' },
      { chave: 'mapaUrl', rotulo: 'Link do mapa', tipo: 'url' },
      { chave: 'portalServicosUrl', rotulo: 'Portal de Serviços', tipo: 'url' },
    ],
  },
  nfse: {
    titulo: 'NFS-e Nacional',
    texto: 'Datas e endereços usados no ambiente NFS-e. Campos vazios aparecem no portal como “a definir” ou “definido pela Prefeitura”.',
    campos: [
      { chave: 'dataInicio', rotulo: 'Início do Emissor Nacional para o Simples em Canindé', tipo: 'data' },
      { chave: 'emissorUrl', rotulo: 'Endereço do Emissor Nacional', tipo: 'url' },
      { chave: 'issMunicipalUrl', rotulo: 'Endereço do ISS Eletrônico de Canindé', tipo: 'url' },
      { chave: 'prazoSubstituicaoDias', rotulo: 'Prazo para substituir a nota (dias)', tipo: 'numero' },
      { chave: 'prazoCancelamentoDias', rotulo: 'Prazo para cancelar a nota (dias)', tipo: 'numero' },
    ],
  },
};

function desembrulhar(v: unknown): Valor {
  if (v && typeof v === 'object' && 'valor' in v && 'chave' in v) {
    const inner = (v as { valor: unknown }).valor;
    if (typeof inner === 'string') {
      try {
        return JSON.parse(inner) as Valor;
      } catch {
        return {};
      }
    }
    return (inner as Valor) ?? {};
  }
  return (v as Valor) ?? {};
}

function FormConfig({ chave }: { chave: keyof typeof CAMPOS }) {
  const def = CAMPOS[chave];
  const [valor, setValor] = useState<Valor | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    admin
      .config(chave)
      .then((v) => setValor(desembrulhar(v)))
      .catch((e) => setErroCarga(mensagemErro(e)));
  }, [chave]);

  const set = (k: string, v: unknown) => setValor((x) => ({ ...(x ?? {}), [k]: v }));

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor) return;
    setSalvando(true);
    setErro(null);
    setOk(false);
    try {
      await admin.salvarConfig(chave, valor);
      setOk(true);
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className="painel" onSubmit={salvar}>
      <h3>{def.titulo}</h3>
      <p className="ajuda">{def.texto}</p>
      {erroCarga ? (
        <AvisoApi mensagem={erroCarga} />
      ) : !valor ? (
        <Carregando />
      ) : (
        <>
          {def.campos.map((c) => {
            const id = `cfg-${chave}-${c.chave}`;
            const atual = valor[c.chave];
            return (
              <div className="campo" key={c.chave}>
                <label htmlFor={id}>{c.rotulo}</label>
                {c.tipo === 'numero' ? (
                  <input
                    id={id}
                    type="number"
                    min={0}
                    value={atual === null || atual === undefined ? '' : String(atual)}
                    onChange={(e) => set(c.chave, e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="vazio = definido pela Prefeitura"
                  />
                ) : c.tipo === 'data' ? (
                  <input id={id} type="date" value={typeof atual === 'string' ? atual.slice(0, 10) : ''} onChange={(e) => set(c.chave, e.target.value || null)} />
                ) : (
                  <input
                    id={id}
                    type={c.tipo === 'email' ? 'email' : c.tipo === 'url' ? 'url' : 'text'}
                    value={typeof atual === 'string' ? atual : ''}
                    onChange={(e) => set(c.chave, e.target.value)}
                  />
                )}
                {c.ajuda && <small className="ajuda" style={{ display: 'block', margin: '4px 0 0' }}>{c.ajuda}</small>}
              </div>
            );
          })}
          <button className="botao peq" type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          {erro && (
            <div className="erro-box" role="alert">
              {erro}
            </div>
          )}
          {ok && (
            <div className="mensagem-ok" role="status">
              Configuração salva. O portal mostra os novos dados na próxima vez que a página for aberta.
            </div>
          )}
        </>
      )}
    </form>
  );
}

export default function Configuracoes() {
  return (
    <SoPara perfis={['gestor']}>
      <Banner variante="escuro" icone="engrenagem" titulo="Configurações" texto="Contatos e parâmetros do ambiente NFS-e exibidos no portal." />
      <div className="duas meio">
        <FormConfig chave="contatos" />
        <FormConfig chave="nfse" />
      </div>
    </SoPara>
  );
}

import { useState } from 'react';
import { Banner, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { URLS } from '../../conteudo/links';

function prazo(dias: number | null) {
  if (dias === null || dias === undefined) return 'definido pela Prefeitura';
  return `${dias} dia${dias === 1 ? '' : 's'} após a emissão`;
}

export default function NfseDepois() {
  const { config } = useConfig();
  const [chave, setChave] = useState('');

  const consultar = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(URLS.consultaPublicaNfse, '_blank', 'noopener');
  };

  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL"
        titulo="Depois de emitir: corrigir, cancelar e conferir"
        texto="Onde encontrar suas notas, o que fazer quando errou e como conferir as notas que você recebe."
      />
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Depois de emitir']} />

      <div className="bloco">
        <h3>Errei na nota. E agora?</h3>
        <p className="sub">Em “NFS-e emitidas”, cada nota tem as opções Visualizar, Substituir, Cancelar, Baixar XML e Baixar DANFSe.</p>
        <div className="decisao">
          <div>
            <h4>🔁 Substituir</h4>
            <p>Quando o serviço aconteceu, mas algum dado está errado (valor, descrição, cliente…).</p>
            <ul>
              <li>Gera uma nota nova com os dados corrigidos</li>
              <li>A nota original é cancelada automaticamente</li>
              <li>As duas ficam ligadas, e o emissor mostra o comparativo</li>
            </ul>
          </div>
          <div>
            <h4>✖ Cancelar</h4>
            <p>Quando o serviço não aconteceu ou a nota não devia existir.</p>
            <ul>
              <li>Informe o motivo e a justificativa</li>
              <li>
                Fora do prazo, o cancelamento vira <b>pedido de análise fiscal</b> e vai para a Prefeitura decidir
              </li>
            </ul>
          </div>
        </div>
        <div className="campo-guia" style={{ marginTop: 12 }}>
          <div className="nome">Prazos em Canindé</div>
          <div>
            <p>Cada município define se há prazo máximo para substituir e cancelar e quantos dias são.</p>
            <div className="preencha">
              Prazo para substituição: <b>{prazo(config.nfse.prazoSubstituicaoDias)}</b> · prazo para cancelamento:{' '}
              <b>{prazo(config.nfse.prazoCancelamentoDias)}</b>. Fora desses prazos, o pedido é analisado pela Secretaria de Finanças.
            </div>
          </div>
        </div>
      </div>

      <div className="bloco">
        <h3>Notas que você recebe</h3>
        <p className="sub">Em “NFS-e recebidas” aparecem as notas em que você é o cliente (tomador) ou intermediário.</p>
        <div className="decisao">
          <div>
            <h4>✔ Confirmar</h4>
            <p>Você reconhece o serviço e concorda com os dados da nota.</p>
          </div>
          <div>
            <h4>⚠ Rejeitar</h4>
            <p>Você não reconhece a nota ou discorda dos dados. Informe o motivo.</p>
          </div>
        </div>
        <p className="sub" style={{ margin: '10px 0 0' }}>
          As duas ações exigem assinatura e ficam registradas na nota.
        </p>
      </div>

      <div className="bloco">
        <h3>Conferir se uma nota é verdadeira</h3>
        <p className="sub">
          Qualquer pessoa pode consultar uma NFS-e na <b>Consulta Pública</b> do portal nacional, usando a chave de acesso ou os dados da DPS.
        </p>
        <form className="busca-grande" style={{ margin: 0 }} onSubmit={consultar}>
          <input
            aria-label="Chave de acesso da NFS-e"
            placeholder="Chave de acesso da NFS-e (50 dígitos)"
            inputMode="numeric"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
          />
          <button className="botao peq preto" type="submit" style={{ marginTop: 0 }}>
            Consultar no portal nacional ↗
          </button>
        </form>
        <p className="sub" style={{ margin: '8px 0 0', fontSize: 12.5 }}>
          A consulta abre no portal nacional da NFS-e, em nova aba. Copie a chave e cole no campo de consulta de lá.
        </p>
      </div>
      <div className="base">Fonte: Guia do Emissor Público Nacional Web v1.2, itens 5, 6 e 9</div>
    </>
  );
}

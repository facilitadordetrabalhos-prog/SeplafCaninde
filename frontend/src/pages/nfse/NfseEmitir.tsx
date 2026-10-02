import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner, Trilha } from '../../components/Comuns';
import { Yt } from '../../components/Yt';
import { VIDEOS_NFSE } from '../../conteudo/links';
import { ABAS_EMITIR, PERGUNTAS_ISS, type CampoGuia } from '../../conteudo/nfseEmitir';

export function CampoGuiaView({ c }: { c: CampoGuia }) {
  return (
    <div className="campo-guia">
      <div className="nome">
        {c.nome}
        <small>{c.nota}</small>
      </div>
      <div>
        <p dangerouslySetInnerHTML={{ __html: c.texto }} />
        {c.preencha && <div className="preencha" dangerouslySetInnerHTML={{ __html: c.preencha }} />}
        {c.atencao && <div className="atencao" dangerouslySetInnerHTML={{ __html: c.atencao }} />}
        {c.local && <div className="local" dangerouslySetInnerHTML={{ __html: c.local }} />}
      </div>
    </div>
  );
}

export default function NfseEmitir() {
  const [aba, setAba] = useState(0);
  const [video, setVideo] = useState({ id: VIDEOS_NFSE.web, auto: false });
  const refVideo = useRef<HTMLDivElement>(null);

  const verApp = () => {
    setVideo({ id: VIDEOS_NFSE.app, auto: true });
    refVideo.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL · PASSO A PASSO"
        titulo="Emitindo a nota, campo a campo"
        texto="A emissão completa tem quatro telas. Veja o que significa cada campo e o que preencher em Canindé."
      />
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Emitir a nota']} />

      <div className="decisao" style={{ marginBottom: 16 }}>
        <div>
          <h4>Emissão simplificada</h4>
          <p>
            Para <b>MEI</b>. Poucos campos: escolhe o serviço favorito, o cliente e o valor. Também dá para emitir pelo aplicativo{' '}
            <b>NFS-e Mobile</b> (App Store e Google Play).
          </p>
        </div>
        <div>
          <h4>Emissão completa</h4>
          <p>
            Para <b>todos</b>. Obrigatória em alguns casos, como exportação de serviço e serviço em que o ISS é devido no município do
            cliente. É a que está detalhada abaixo.
          </p>
        </div>
      </div>

      <div className="bloco">
        <div className="video-lado">
          <div ref={refVideo}>
            <Yt key={video.id} id={video.id} autoplay={video.auto} rotulo="Emissão de NFS-e pelo Emissor Nacional" />
          </div>
          <div>
            <span className="tag oficial">Vídeo Sebrae</span>
            <h3 style={{ margin: '8px 0 6px', fontSize: 18 }}>A emissão no Emissor Web, do início ao fim</h3>
            <p className="sub" style={{ margin: '0 0 10px' }}>
              Assista e depois use o guia abaixo, campo a campo.
            </p>
            <p className="sub" style={{ margin: 0 }}>
              Vai emitir pelo celular?{' '}
              <button type="button" className="link-acao" onClick={verApp}>
                Ver o vídeo do aplicativo NFS-e Mobile
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="aviso boa" style={{ marginBottom: 14 }}>
        📷{' '}
        <span>
          Prefere ver as telas? Abra o{' '}
          <Link to="/nfse/guia-ilustrado" style={{ fontWeight: 700, textDecoration: 'underline' }}>
            guia ilustrado, tela por tela
          </Link>
          .
        </span>
      </div>

      <div className="passos-tab" role="tablist" aria-label="Telas da emissão">
        {ABAS_EMITIR.map((a, i) => (
          <button
            key={a.rotulo}
            role="tab"
            id={`aba-${i}`}
            aria-selected={aba === i}
            aria-controls={`painel-${i}`}
            className={aba === i ? 'ativo' : undefined}
            onClick={() => setAba(i)}
          >
            <b>{i + 1}</b>
            {a.rotulo}
          </button>
        ))}
      </div>

      {ABAS_EMITIR.map((a, i) => (
        <div
          key={a.rotulo}
          role="tabpanel"
          id={`painel-${i}`}
          aria-labelledby={`aba-${i}`}
          className={`passo-conteudo${aba === i ? ' ativo' : ''}`}
        >
          {a.campos.map((c, j) => (
            <div key={c.nome}>
              <CampoGuiaView c={c} />
              {i === 2 && j === 2 && (
                <>
                  <h3 style={{ margin: '16px 0 4px', fontSize: 15.5 }}>As três perguntas sobre o ISS</h3>
                  <div className="perguntas-iss">
                    {PERGUNTAS_ISS.map((p) => (
                      <div key={p.pergunta}>
                        <h5>{p.pergunta}</h5>
                        <span className="resp-padrao">Normalmente: NÃO</span>
                        <p>{p.texto}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="base">
        Fontes: Guia do Emissor Público Nacional Web v1.2, item 4 · E-book “Passo a passo: cadastramento e emissão de NFS-e”
        (Sebrae/Receita Federal, fev/2023)
      </div>
    </>
  );
}

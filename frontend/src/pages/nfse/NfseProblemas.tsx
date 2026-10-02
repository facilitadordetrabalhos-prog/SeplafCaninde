import { Link } from 'react-router-dom';
import { Banner, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { FormDuvida } from '../../components/FormDuvida';
import { PROBLEMAS_NFSE } from '../../conteudo/nfse';

export default function NfseProblemas() {
  const { config } = useConfig();
  const c = config.contatos;
  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL"
        titulo="Problemas comuns e como resolver"
        texto="As mensagens de erro que mais aparecem e o que fazer em cada caso."
      />
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Problemas comuns']} />
      <div className="duas">
        <div>
          {PROBLEMAS_NFSE.map((p, i) => (
            <details className="faq" key={p.pergunta} open={i === 0}>
              <summary>
                {p.pergunta}
                <span className="tag lar">{p.etiqueta}</span>
              </summary>
              <div className="resp">
                <span dangerouslySetInnerHTML={{ __html: p.resposta }} />
                {p.link && (
                  <>
                    {' '}
                    <Link to={p.link.rota} style={{ color: 'var(--laranja)', fontWeight: 600 }}>
                      {p.link.rotulo}
                    </Link>
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
        <FormDuvida
          origem="nfse"
          titulo="Pergunte sobre NFS-e"
          rodape={
            <p className="sub" style={{ margin: '12px 0 0' }}>
              Em Canindé:{' '}
              <a href={`mailto:${c.email}`} style={{ color: 'var(--laranja)', fontWeight: 600, overflowWrap: 'anywhere' }}>
                {c.email}
              </a>{' '}
              ·{' '}
              <a href={c.telefoneLink} style={{ color: 'var(--laranja)', fontWeight: 600 }}>
                {c.telefone}
              </a>
              <br />
              Atendimento nacional: <b style={{ overflowWrap: 'anywhere' }}>atendimento.nfs-e@rfb.gov.br</b> · Sebrae: <b>0800 570 0800</b>
            </p>
          }
        />
      </div>
    </>
  );
}

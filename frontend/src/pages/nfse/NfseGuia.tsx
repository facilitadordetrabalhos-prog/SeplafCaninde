import { useCallback, useState } from 'react';
import { Banner, Externo, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { Lightbox } from '../../components/Lightbox';
import { PDF_EBOOK_SEBRAE, PDF_GUIA_OFICIAL } from '../../conteudo/links';
import { GUIA_NFSE } from '../../conteudo/nfseGuia';

export default function NfseGuia() {
  const { config } = useConfig();
  const [zoom, setZoom] = useState<{ src: string; legenda: string } | null>(null);
  const fechar = useCallback(() => setZoom(null), []);

  const irPara = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL · GUIA ILUSTRADO"
        titulo="Como emitir a nota fiscal no Emissor Nacional, tela por tela"
        texto="Passo a passo com as telas reais do sistema, tirado dos guias oficiais do Sistema Nacional da NFS-e e do Sebrae/Receita Federal. Clique em qualquer imagem para ampliar."
      >
        <Externo className="botao" href={config.nfse.emissorUrl} style={{ marginTop: 14, background: 'var(--amarelo)', color: '#111' }}>
          Abrir o Emissor Nacional ↗
        </Externo>
      </Banner>
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Guia ilustrado']} />

      <div className="downloads">
        <a className="download" href={PDF_GUIA_OFICIAL} target="_blank" rel="noopener" download>
          <span className="pdf">PDF</span>
          <span>
            <b>Guia do Emissor Público Nacional Web — v1.2</b>
            <small>Oficial · Sistema Nacional NFS-e · 104 páginas · 4,6 MB</small>
          </span>
          <span className="baixar">Baixar ⬇</span>
        </a>
        <a className="download" href={PDF_EBOOK_SEBRAE} target="_blank" rel="noopener" download>
          <span className="pdf">PDF</span>
          <span>
            <b>Passo a passo: cadastramento e emissão de NFS-e</b>
            <small>Sebrae / Receita Federal · web e celular · 23 páginas · 7,7 MB</small>
          </span>
          <span className="baixar">Baixar ⬇</span>
        </a>
      </div>

      <nav className="sumario" aria-label="Sumário do guia">
        {GUIA_NFSE.map((s) => {
          const [num, ...resto] = s.titulo.split('. ');
          return (
            <a href={`#${s.id}`} className="sum-item" key={s.id} onClick={irPara(s.id)}>
              <b>{num}</b>
              {resto.join('. ')}
              <small>{s.passos.length} passos</small>
            </a>
          );
        })}
      </nav>

      {GUIA_NFSE.map((s) => (
        <div className="bloco" id={s.id} key={s.id}>
          <h3>{s.titulo}</h3>
          <p className="sub">{s.sub}</p>
          <div className={`lista-passos${s.celular ? ' grade-celular' : ''}`}>
            {s.passos.map((p, i) => (
              <div className={`passo-img${s.celular ? ' celular' : ''}`} key={p.img}>
                <figure>
                  <button
                    type="button"
                    onClick={() => setZoom({ src: `/img/nfse/${p.img}`, legenda: p.alt })}
                    aria-label={`Ampliar imagem: ${p.alt}`}
                    className="btn-zoom"
                  >
                    <img src={`/img/nfse/${p.img}`} alt={p.alt} loading="lazy" />
                  </button>
                </figure>
                <div>
                  <span className="num">{i + 1}</span>
                  <h4>{p.titulo}</h4>
                  {p.texto && <p dangerouslySetInnerHTML={{ __html: p.texto }} />}
                  {p.dica && <div className="dica" dangerouslySetInnerHTML={{ __html: `💡 ${p.dica}` }} />}
                </div>
              </div>
            ))}
          </div>
          <div className="base">{s.base}</div>
        </div>
      ))}

      <Lightbox src={zoom?.src ?? null} legenda={zoom?.legenda ?? ''} aoFechar={fechar} />
    </>
  );
}

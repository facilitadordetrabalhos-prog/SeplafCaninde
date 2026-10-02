import { Link } from 'react-router-dom';
import { api } from '../../api';
import { AvisoApi, Banner, Carregando, Externo, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { TurmasInscricao } from '../../components/Oficinas';
import { Yt } from '../../components/Yt';
import { PDF_EBOOK_SEBRAE, PDF_GUIA_OFICIAL, VIDEOS_NFSE } from '../../conteudo/links';
import { useApi } from '../../util';

function CartaoVideo({ id, ord, titulo }: { id: string; ord: string; titulo: string }) {
  return (
    <div className="video-card">
      <Yt id={id} ord={ord} rotulo={titulo} />
      <div className="info">
        <h4>{titulo}</h4>
        <div className="meta">
          <span className="tag oficial">Sebrae</span>vídeo
        </div>
      </div>
    </div>
  );
}

export default function NfseMateriais() {
  const { config } = useConfig();
  const c = config.contatos;
  const oficinas = useApi(() => api.oficinas());
  const enderecoCurto = c.endereco.split('(')[0].trim();

  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL"
        titulo="Materiais, links e oficinas"
        texto="Guias oficiais para baixar, endereços do sistema nacional e agenda de atendimento em Canindé."
      />
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Materiais e oficinas']} />
      <div className="duas meio">
        <div>
          <div className="videos" style={{ gridTemplateColumns: '1fr' }}>
            <a className="video" href={PDF_GUIA_OFICIAL} target="_blank" rel="noopener">
              <div className="info">
                <h4>📘 Guia do Emissor Público Nacional Web — v1.2</h4>
                <div className="meta">
                  <span className="tag oficial">Oficial</span>Sistema Nacional NFS-e · 104 páginas · set/2025
                </div>
              </div>
            </a>
            <a className="video" href={PDF_EBOOK_SEBRAE} target="_blank" rel="noopener">
              <div className="info">
                <h4>📗 Passo a passo: cadastramento e emissão de NFS-e (Web e Mobile)</h4>
                <div className="meta">
                  <span className="tag oficial">Sebrae / Receita</span>e-book · 23 páginas · fev/2023 · foco no MEI
                </div>
              </div>
            </a>
            <CartaoVideo id={VIDEOS_NFSE.cadastro} ord="1" titulo="Cadastro no Portal Nacional de Emissão de NFS-e" />
            <CartaoVideo id={VIDEOS_NFSE.web} ord="2" titulo="Emissão de NFS-e pelo Emissor Web" />
            <CartaoVideo id={VIDEOS_NFSE.app} ord="3" titulo="Emissão de NFS-e pelo app NFS-e Mobile" />
          </div>
          <div className="caixa-lateral" style={{ marginTop: 14 }}>
            <h4>Endereços oficiais</h4>
            <ul>
              <li>
                Emissor Web:{' '}
                <Externo href={config.nfse.emissorUrl} style={{ color: 'var(--laranja)', fontWeight: 700 }}>
                  nfse.gov.br/EmissorNacional ↗
                </Externo>
              </li>
              <li>Consulta pública de notas: portal nfse.gov.br</li>
              <li>
                Aplicativo: <b>NFS-e Mobile</b> (App Store e Google Play)
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="caixa-lateral">
            <h4>Oficinas e plantões em Canindé</h4>
            {oficinas.carregando && !oficinas.dados ? (
              <Carregando texto="Carregando a agenda…" />
            ) : oficinas.erro ? (
              <AvisoApi>Não foi possível carregar a agenda de oficinas agora. O plantão presencial continua funcionando.</AvisoApi>
            ) : (oficinas.dados ?? []).length === 0 ? (
              <p style={{ marginTop: 0 }}>Nenhuma oficina agendada no momento. Novas turmas são divulgadas aqui.</p>
            ) : (
              <TurmasInscricao oficinas={oficinas.dados ?? []} aoInscrever={oficinas.recarregar} />
            )}
            <div className="turmas" style={{ marginTop: 8 }}>
              <div className="turma">
                <div className="dt">
                  <b>SEG</b>
                  <small>a SEX</small>
                </div>
                <div className="txt">
                  Plantão de cadastro presencial
                  <small>
                    {c.orgao} · {enderecoCurto} · {c.horario}
                  </small>
                </div>
                <Link className="botao peq preto" to="/nfse/primeiro-acesso#agendar" style={{ marginTop: 0 }}>
                  Agendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

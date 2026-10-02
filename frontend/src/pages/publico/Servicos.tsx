import { Link } from 'react-router-dom';
import { api, type ServicoOnline } from '../../api';
import { AvisoApi, Banner, Carregando, Externo, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { useApi } from '../../util';

export function BlocoAtendimento() {
  const { config } = useConfig();
  const c = config.contatos;
  return (
    <div className="atendimento">
      <div className="at-item">
        <span className="ic">📍</span>
        <div>
          <b>Atendimento presencial</b>
          <small>
            {c.orgao} · {c.horario}
          </small>
          <p>{c.endereco}</p>
          <Externo href={c.mapaUrl}>Ver no mapa ↗</Externo>
        </div>
      </div>
      <div className="at-item">
        <span className="ic">✉️</span>
        <div>
          <b>E-mail</b>
          <small>atendimento digital</small>
          <p>
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </p>
        </div>
      </div>
      <div className="at-item">
        <span className="ic">📞</span>
        <div>
          <b>Telefone</b>
          <small>Setor de Tributos</small>
          <p>
            <a href={c.telefoneLink}>{c.telefone}</a>
          </p>
        </div>
      </div>
      <div className="at-item">
        <span className="ic">💻</span>
        <div>
          <b>Portal de Serviços de Canindé</b>
          <small>sem sair de casa</small>
          <p>2ª via do IPTU e de tributos, regularização de débitos e emissão de guias (DAM).</p>
          <Externo href={c.portalServicosUrl}>Acessar o portal ↗</Externo>
        </div>
      </div>
    </div>
  );
}

function ehNfseNacional(s: ServicoOnline) {
  return /nfse\.gov\.br/i.test(s.url);
}

function CartaoServico({ s }: { s: ServicoOnline }) {
  const federal = /\.gov\.br/i.test(s.url) && !/speedgov/i.test(s.url);
  const avisoNfse = (s.avisoTipo === 'mudanca' && /emissor nacional|simples/i.test(s.aviso ?? '')) || ehNfseNacional(s);
  return (
    <div className="servico-online">
      <div className="ic">{s.icone}</div>
      <div>
        <h3>{s.titulo}</h3>
        <p>{s.descricao}</p>
        {s.aviso && (
          <div className={`aviso ${s.avisoTipo ?? 'boa'}`}>
            {s.avisoTipo === 'mudanca' ? '⚠' : /cart[aã]o/i.test(s.aviso) ? '💳' : ehNfseNacional(s) ? '📘' : '✅'}{' '}
            <span>
              {s.aviso}
              {avisoNfse && (
                <>
                  {' '}
                  <Link to="/nfse" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                    {ehNfseNacional(s) ? 'Ver o passo a passo' : 'Prepare-se agora'}
                  </Link>
                </>
              )}
            </span>
          </div>
        )}
        {!s.aviso && ehNfseNacional(s) && (
          <div className="aviso boa">
            📘{' '}
            <span>
              Primeira vez? Veja antes o{' '}
              <Link to="/nfse" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                passo a passo da Secretaria
              </Link>
              .
            </span>
          </div>
        )}
      </div>
      <div>
        <Externo className="botao" href={s.url}>
          Acessar ↗
        </Externo>
        <div className="externo">{federal ? 'site do governo federal' : 'sistema da Prefeitura'}</div>
      </div>
    </div>
  );
}

export default function Servicos() {
  const servicos = useApi(() => api.servicos());
  return (
    <>
      <Banner
        icone="cartao"
        titulo="Serviços online da Secretaria de Finanças"
        texto="Emita nota fiscal, boleto do IPTU e certidão sem ir à Prefeitura. Os serviços abrem no sistema tributário do município."
      />
      <Trilha itens={[['Início', '/'], 'Serviços online']} />

      <h2 className="secao" style={{ marginTop: 6 }}>
        Fale com a Arrecadação
      </h2>
      <p className="sub">Resolva pela internet ou procure o atendimento presencial.</p>
      <BlocoAtendimento />

      {servicos.carregando && !servicos.dados ? (
        <Carregando texto="Carregando serviços…" />
      ) : servicos.erro ? (
        <AvisoApi mensagem={servicos.erro}>
          Não foi possível carregar a lista de serviços agora. Use o atendimento acima ou acesse o Portal de Serviços de Canindé.
        </AvisoApi>
      ) : (
        (servicos.dados ?? []).map((s) => <CartaoServico s={s} key={s.id} />)
      )}
    </>
  );
}

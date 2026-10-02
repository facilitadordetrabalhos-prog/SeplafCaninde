import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api';
import { AvisoApi, Carregando, Externo, Trilha } from '../../components/Comuns';
import { HtmlConteudo } from '../../components/HtmlConteudo';
import { formatarData, ROTULO_PUBLICO, useApi } from '../../util';

const ROTULO_TIPO: Record<string, string> = {
  guia: 'Guia',
  dica: 'Dica',
  noticia_local: 'Notícia local',
  video: 'Vídeo',
  material: 'Material',
  faq: 'Pergunta frequente',
};

/** Caixas laterais curadas do guia do Simples (conteúdo estático do protótipo). */
function LateralSimples() {
  return (
    <div>
      <div className="caixa-lateral">
        <h4>Quatro sinais de alerta para o MEI</h4>
        <ul>
          <li>Faturamento perto do limite</li>
          <li>Movimentação na conta sem nota fiscal</li>
          <li>Cliente empresa pedindo crédito</li>
          <li>A operação ficou mais complexa</li>
        </ul>
      </div>
      <div className="caixa-lateral">
        <h4>Fim do regime de caixa no Simples</h4>
        <p>
          A partir de 2027 o faturamento passa a ser reconhecido pelo documento fiscal, e não mais pelo recebimento. Isso afeta capital de
          giro e cobrança.
        </p>
      </div>
      <div className="caixa-lateral">
        <h4>Conteúdo baseado em</h4>
        <p>
          Palestra “Reforma Tributária para empresários — MEI e Simples Nacional”, Prof. Tiago Emerson (CRC-CE), realizada pela Secretaria
          de Finanças.
        </p>
      </div>
    </div>
  );
}

function LateralPadrao() {
  return (
    <div>
      <div className="caixa-lateral">
        <h4>Ficou com alguma dúvida?</h4>
        <p>Envie sua pergunta à Secretaria de Finanças. Você recebe um protocolo e a resposta por e-mail.</p>
        <Link className="botao peq" to="/reforma/perguntas#enviar-duvida" style={{ marginTop: 6 }}>
          Enviar dúvida
        </Link>
      </div>
    </div>
  );
}

export default function Guia() {
  const { slug = '' } = useParams();
  const { dados: c, erro, carregando } = useApi(
    () =>
      api.conteudo(slug).catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }),
    [slug],
  );

  const titulo = c?.titulo ?? 'Guia';

  return (
    <>
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Guias', titulo]} />
      {carregando && !c ? (
        <Carregando texto="Carregando o guia…" />
      ) : erro ? (
        <AvisoApi mensagem={erro} />
      ) : !c ? (
        <div className="bloco">
          <h3>Conteúdo não encontrado</h3>
          <p className="sub" style={{ margin: 0 }}>
            Este guia não existe ou ainda não foi publicado. <Link to="/" style={{ color: 'var(--laranja)', fontWeight: 600 }}>Voltar ao início</Link>
          </p>
        </div>
      ) : (
        <div className="duas">
          <article className="artigo">
            <span className="tag lar">{ROTULO_TIPO[c.tipo] ?? 'Guia'}</span>{' '}
            {c.publico && c.publico !== 'todos' && <span className="tag parado">{ROTULO_PUBLICO[c.publico] ?? c.publico}</span>}
            <h1>{c.titulo}</h1>
            <div className="por">Secretaria Municipal de Finanças · atualizado em {formatarData(c.atualizadoEm || c.publicadoEm)}</div>
            {c.corpo ? (
              <HtmlConteudo className="corpo-artigo" html={c.corpo} />
            ) : (
              c.resumo && <p>{c.resumo}</p>
            )}
            {c.baseOficial && !/class="base"/.test(c.corpo ?? '') && <div className="base">Base oficial: {c.baseOficial}</div>}
            {(c.videoUrl || c.anexoUrl) && (
              <div className="acoes" style={{ marginTop: 14 }}>
                {c.videoUrl && (
                  <Externo className="botao peq vazio" href={c.videoUrl}>
                    ▶ Assistir ao vídeo ↗
                  </Externo>
                )}
                {c.anexoUrl && (
                  <Externo className="botao peq vazio" href={c.anexoUrl}>
                    Baixar material ⬇
                  </Externo>
                )}
              </div>
            )}
            <div className="acoes" style={{ marginTop: 18 }}>
              <Link className="botao peq vazio" to="/reforma/videos">
                ▶ Palestra completa
              </Link>
              <Link className="botao peq vazio" to="/reforma/perguntas">
                Perguntas sobre o tema
              </Link>
            </div>
          </article>
          {slug === 'simples-puro-ou-hibrido' ? <LateralSimples /> : <LateralPadrao />}
        </div>
      )}
    </>
  );
}

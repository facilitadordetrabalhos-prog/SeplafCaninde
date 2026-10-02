import { Link } from 'react-router-dom';
import { api } from '../../api';
import { AvisoApi, Carregando, Externo } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { Icone } from '../../components/Icones';
import { NoticiaCard } from '../../components/NoticiaCard';
import { QuadroPrazos } from '../../components/Prazos';
import { descreverVerificacao, formatarData, useApi } from '../../util';

const COMECE = [
  { icone: 'livroSimples', titulo: 'Entenda a reforma', texto: 'IBS, CBS, cobrança no destino, nanoempreendedor e cashback, com a base legal de cada ponto.', botao: 'Entender', rota: '/reforma/entenda' },
  { icone: 'grafico', titulo: 'Simples “puro” ou “híbrido”?', texto: 'O guia da decisão de 2027 para micro e pequenas empresas, com os prazos novos.', botao: 'Ler o guia', rota: '/reforma/guias/simples-puro-ou-hibrido' },
  { icone: 'calendario', titulo: 'Cronograma 2026–2033', texto: 'Ano a ano, o que entra em vigor e o que acontece com o ISS de Canindé.', botao: 'Ver cronograma', rota: '/reforma/cronograma' },
  { icone: 'video', titulo: 'Vídeos e palestras', texto: 'Gravações da Secretaria, vídeos oficiais do CGIBS e materiais das palestras em Canindé.', botao: 'Assistir', rota: '/reforma/videos' },
  { icone: 'balao', titulo: 'Pergunte à Secretaria', texto: 'Não achou a resposta? Envie sua dúvida e receba um protocolo. A resposta chega por e-mail.', botao: 'Perguntar', rota: '/reforma/perguntas#enviar-duvida', preto: true },
];

const PASSOS = [
  ['Captura automática', 'O portal lê as notícias, comunicados, legislação e vídeos publicados no site do CGIBS.'],
  ['Leitura da equipe', 'A Secretaria classifica por público e marca o que tem prazo.'],
  ['Explicação local', 'Quando afeta Canindé, acrescentamos “o que isso significa para você”.'],
  ['Sempre com a fonte', 'Todo conteúdo mostra a base oficial e o link para o original.'],
];

export default function Inicio() {
  const { config, moduloAtivo } = useConfig();
  const servicos = useApi(() => api.servicos());
  const prazos = useApi(() => api.prazos());
  const noticias = useApi(() => api.noticias({ limite: 3 }));
  const sinc = useApi(() => api.sincronizacao());
  const eventos = useApi(() => api.eventos());

  const destaques = (servicos.dados ?? []).filter((s) => s.destaque);
  const evento = eventos.dados?.[0];
  const verificacao = descreverVerificacao(sinc.dados?.ultimaVerificacao);

  return (
    <>
      <div className="banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="faixa-slogan">
            <span>O TRABALHO</span>
            <span className="am">que</span>
            <span>TRANSFORMA!</span>
          </div>
          <h1>
            Reforma Tributária: tudo o que muda,
            <br />
            explicado para Canindé
          </h1>
          <p>
            Notícias e orientações sempre com base nas publicações oficiais do Comitê Gestor do IBS (CGIBS) e da Receita Federal,
            traduzidas pela Secretaria de Finanças para a realidade do município.
          </p>
        </div>
      </div>

      <div className="atalhos">
        {destaques.map((s) => (
          <Externo className="atalho" href={s.url} key={s.id}>
            <span className="ic">{s.icone}</span>
            <span>
              <b>{s.titulo}</b>
              {s.avisoTipo === 'boa' && s.aviso && /cart[aã]o/i.test(s.aviso) ? (
                <span className="selo-cartao">pague no cartão de crédito</span>
              ) : (
                <small>{s.descricao}</small>
              )}
            </span>
            <span className="seta-ext">↗</span>
          </Externo>
        ))}
        <Link className="atalho" to="/servicos">
          <span className="ic">☎️</span>
          <span>
            <b>Fale com a Arrecadação</b>
            <small>{config.contatos.telefone} · e-mail · presencial</small>
          </span>
          <span className="seta-ext">➜</span>
        </Link>
      </div>

      <QuadroPrazos prazos={prazos.dados} erro={prazos.erro} carregando={prazos.carregando} />

      {moduloAtivo('nfse') && (
        <Link className="banner nfse" to="/nfse" style={{ padding: '20px 26px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 'min(220px, 100%)' }}>
            <span className="selo-nfse">NOVO · NFS-e NACIONAL</span>
            <h1 style={{ fontSize: 22 }}>Prestador de serviço: prepare-se para emitir pelo Emissor Nacional</h1>
            <p>Primeiro acesso, passo a passo da nota, vídeos e atendimento presencial da Secretaria.</p>
          </div>
          <span className="botao" style={{ position: 'relative', zIndex: 1, background: 'var(--amarelo)', color: '#111', flex: 'none' }}>
            Entrar no ambiente ➜
          </span>
        </Link>
      )}

      {moduloAtivo('noticias-cgibs') && (
        <>
          <h2 className="secao">Últimas do Comitê Gestor do IBS</h2>
          <p className="sub">
            Capturadas automaticamente do site oficial <b>cgibs.gov.br</b>. Quando a notícia afeta Canindé, a Secretaria acrescenta uma explicação.
          </p>
          <div className="duas">
            <div className="noticias">
              {noticias.carregando && !noticias.dados ? (
                <Carregando texto="Carregando notícias…" />
              ) : noticias.erro ? (
                <AvisoApi mensagem={noticias.erro} />
              ) : (noticias.dados ?? []).length === 0 ? (
                <p className="sub">Nenhuma notícia publicada ainda.</p>
              ) : (
                (noticias.dados ?? []).slice(0, 3).map((n) => <NoticiaCard n={n} key={n.id} />)
              )}
            </div>
            <div>
              <div className="caixa-lateral">
                {verificacao && <span className="sinc">Sincronizado com cgibs.gov.br {verificacao}</span>}
                <p style={{ margin: verificacao ? '8px 0 0' : 0 }}>
                  O portal confere o site do Comitê Gestor várias vezes ao dia. Nenhuma notícia oficial fica de fora.
                </p>
                <Link className="botao peq preto" to="/reforma/noticias" style={{ marginTop: 10 }}>
                  Ver todas as notícias
                </Link>
              </div>
              <div className="caixa-lateral">
                <h4>Para quem é este portal</h4>
                <ul>
                  <li>
                    <b>MEI e Simples Nacional</b>: a decisão de 2027
                  </li>
                  <li>
                    <b>Prestadores de serviço</b>: ISS e NFS-e nacional
                  </li>
                  <li>
                    <b>Contadores</b>: legislação e comunicados
                  </li>
                  <li>
                    <b>Cidadão</b>: o que muda no dia a dia
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {evento && moduloAtivo('eventos') && (
        <Link className="evento-topo" to={`/eventos/${evento.slug}`} style={{ gridTemplateColumns: '110px 1fr' }}>
          <img src={evento.imagemUrl || '/img/conexao-empresarial.webp'} alt={evento.nome} />
          <div>
            <span className="tag lar">
              {evento.nome} · {formatarData(evento.data)}
            </span>
            <h3 style={{ margin: '6px 0 4px', fontSize: 17 }}>Respondemos as perguntas dos participantes</h3>
            <p style={{ margin: 0, fontSize: 13.5 }}>
              {evento.totalPerguntas > 0
                ? `${evento.totalPerguntas} pergunta${evento.totalPerguntas > 1 ? 's' : ''} sobre Simples Nacional, MEI, preços, serviços e nota fiscal, agrupadas por tema.`
                : evento.descricao}
            </p>
          </div>
        </Link>
      )}

      <h2 className="secao">Comece por aqui</h2>
      <p className="sub">Conteúdo produzido pela Secretaria de Finanças.</p>
      <div className="grade">
        {COMECE.map((c) => (
          <div className="servico" key={c.titulo}>
            <div className="quadro">
              <Icone nome={c.icone} tamanho={22} />
            </div>
            <h3>{c.titulo}</h3>
            <p>{c.texto}</p>
            <Link className={`botao peq${c.preto ? ' preto' : ''}`} to={c.rota}>
              {c.botao}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="secao">Como garantimos que a informação é oficial</h2>
      <p className="sub">&nbsp;</p>
      <div className="passos">
        {PASSOS.map(([t, p], i) => (
          <div className="passo" key={t}>
            <div className="n">{i + 1}</div>
            <h4>{t}</h4>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </>
  );
}

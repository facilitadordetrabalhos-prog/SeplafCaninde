import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api';
import { AvisoApi, Carregando, Externo, Trilha } from '../../components/Comuns';
import { HtmlConteudo } from '../../components/HtmlConteudo';
import { ehExterno, formatarData, normalizarLinks, rotaDoTema, useApi } from '../../util';

export default function Evento() {
  const { slug = '' } = useParams();
  const [filtro, setFiltro] = useState('todos');
  const { dados: ev, erro, carregando } = useApi(
    () =>
      api.evento(slug).catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }),
    [slug],
  );

  const temas = (ev?.temas ?? []).filter((t) => t.chave !== 'incompleta');
  const visiveis = temas.filter((t) => filtro === 'todos' || t.chave === filtro);

  return (
    <>
      <Trilha itens={[['Início', '/'], 'Fale com a Secretaria', ev?.nome ?? 'Evento']} />
      {carregando && !ev ? (
        <Carregando texto="Carregando o evento…" />
      ) : erro ? (
        <AvisoApi mensagem={erro} />
      ) : !ev ? (
        <div className="bloco">
          <h3>Evento não encontrado</h3>
          <p className="sub" style={{ margin: 0 }}>
            <Link to="/" style={{ color: 'var(--laranja)', fontWeight: 600 }}>
              Voltar ao início
            </Link>
          </p>
        </div>
      ) : (
        <>
          <div className="evento-topo">
            <img src={ev.imagemUrl || '/img/conexao-empresarial.webp'} alt={ev.nome} />
            <div>
              <span className="tag lar">Evento realizado em {formatarData(ev.data)}</span>
              <h1>{ev.nome}: suas perguntas respondidas</h1>
              <p>{ev.descricao}</p>
              <div className="numeros">
                {(ev.totalPessoas ?? 0) > 0 && (
                  <div>
                    <b>{ev.totalPessoas}</b>participantes inscritos
                  </div>
                )}
                {(ev.totalPerguntas ?? 0) > 0 && (
                  <div>
                    <b>{ev.totalPerguntas}</b>perguntas enviadas
                  </div>
                )}
                <div>
                  <b>{temas.length}</b>tema{temas.length === 1 ? '' : 's'} respondido{temas.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </div>

          {temas.length === 0 ? (
            <div className="caixa-lateral">
              <h4>Respostas em preparação</h4>
              <p style={{ margin: 0 }}>A Secretaria de Finanças está preparando as respostas por tema. Volte em breve.</p>
            </div>
          ) : (
            <>
              <div className="filtros" role="group" aria-label="Filtrar por tema">
                <button className={`chip${filtro === 'todos' ? ' ativo' : ''}`} aria-pressed={filtro === 'todos'} onClick={() => setFiltro('todos')}>
                  Todos os temas
                </button>
                {temas.map((t) => (
                  <button
                    key={t.chave}
                    className={`chip${filtro === t.chave ? ' ativo' : ''}`}
                    aria-pressed={filtro === t.chave}
                    onClick={() => setFiltro(t.chave)}
                  >
                    {t.titulo}
                  </button>
                ))}
              </div>
              <div>
                {visiveis.map((t, i) => (
                  <details className="tema" key={`${filtro}-${t.id}`} open={i === 0 || filtro !== 'todos'}>
                    <summary>
                      <h3>{t.titulo}</h3>
                      {t.qtd > 0 && (
                        <span className="qtd">
                          {t.qtd} pergunta{t.qtd > 1 ? 's' : ''}
                        </span>
                      )}
                    </summary>
                    <div className="corpo-tema">
                      {t.citacoes?.length > 0 && (
                        <div className="citacoes">
                          {t.citacoes.map((c, j) => (
                            <div className="citacao" key={j}>
                              “{c.pergunta}”
                              {c.segmento && <small>participante do segmento {c.segmento}</small>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="resp-rotulo">Resposta da Secretaria de Finanças</div>
                      <HtmlConteudo className="resposta-tema" html={t.resposta} />
                      {t.baseOficial && <div className="base">Base oficial: {t.baseOficial}</div>}
                      {normalizarLinks(t.links).length > 0 && (
                        <div className="links-tema">
                          {normalizarLinks(t.links).map((l) =>
                            ehExterno(l.rota) ? (
                              <Externo className="botao peq vazio" href={l.rota} key={l.rota}>
                                {l.rotulo} ↗
                              </Externo>
                            ) : (
                              <Link className="botao peq vazio" to={rotaDoTema(l.rota)} key={l.rota}>
                                {l.rotulo}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}

          <div className="caixa-lateral" style={{ marginTop: 14 }}>
            <h4>Participou do evento e ficou com outra dúvida?</h4>
            <p>Envie pelo formulário de dúvidas. Você recebe um protocolo e a resposta por e-mail.</p>
            <Link className="botao peq" to="/reforma/perguntas#enviar-duvida">
              Enviar nova dúvida
            </Link>
          </div>
        </>
      )}
    </>
  );
}

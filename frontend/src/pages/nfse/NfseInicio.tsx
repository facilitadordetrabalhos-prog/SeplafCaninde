import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Externo } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { TurmasResumo } from '../../components/Oficinas';
import { VideoCard } from '../../components/Yt';
import { PDF_GUIA_OFICIAL, VIDEOS_NFSE } from '../../conteudo/links';
import { CHECKLIST_NFSE, PERFIS_NFSE, ROTAS_PERFIL } from '../../conteudo/nfse';
import { formatarData, gravarLocal, lerLocal, useApi } from '../../util';

const CHAVE_CHECKLIST = 'nfse-checklist';

export default function NfseInicio() {
  const { config } = useConfig();
  const { nfse, contatos } = config;
  const [perfil, setPerfil] = useState<string | null>(null);
  const [feitos, setFeitos] = useState<Record<string, boolean>>(() => lerLocal(CHAVE_CHECKLIST, {}));
  const oficinas = useApi(() => api.oficinas());

  const marcar = (chave: string, valor: boolean) => {
    const novo = { ...feitos, [chave]: valor };
    setFeitos(novo);
    gravarLocal(CHAVE_CHECKLIST, novo);
  };
  const total = CHECKLIST_NFSE.length;
  const n = CHECKLIST_NFSE.filter((i) => feitos[i.chave]).length;
  const dataInicio = nfse.dataInicio ? formatarData(nfse.dataInicio) : null;
  const proximas = (oficinas.dados ?? []).slice(0, 3);
  const enderecoCurto = contatos.endereco.split('(')[0].trim().replace(/,$/, '');

  return (
    <>
      <div className="banner nfse">
        <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
          <span className="selo-nfse">NFS-e NACIONAL</span>
          <h1>Canindé vai emitir nota de serviço pelo Emissor Nacional</h1>
          <p>
            Tudo o que o prestador de serviço precisa para se preparar: primeiro acesso, configuração, emissão passo a passo, correção de
            notas e atendimento da Secretaria de Finanças.
          </p>
          <div className="contagem">
            <div>
              Início em Canindé<b>{dataInicio ?? 'a definir'}</b>
            </div>
            <div>
              Você já pode<b>fazer o cadastro</b>
            </div>
            <div>
              Atendimento<b>presencial e online</b>
            </div>
          </div>
          <Externo className="botao" href={nfse.emissorUrl} style={{ marginTop: 14, background: 'var(--amarelo)', color: '#111' }}>
            Acessar o Emissor Nacional ↗
          </Externo>
        </div>
      </div>

      <h2 className="secao">Onde eu emito a nota?</h2>
      <p className="sub">Hoje Canindé tem dois emissores. Veja qual é o seu.</p>
      <div className="qual-emissor">
        <div style={{ borderTop: '4px solid var(--amarelo)' }}>
          <h4>Empresa do Simples Nacional</h4>
          <p>
            Vai passar a emitir pelo <b>Emissor Nacional</b>. Faça o cadastro agora para não ser pego de surpresa.
          </p>
          <Link className="onde" to="/nfse/primeiro-acesso" style={{ color: 'var(--laranja)' }}>
            Como fazer o primeiro acesso ➜
          </Link>
          <br />
          <Externo className="onde" href={nfse.emissorUrl} style={{ color: 'var(--laranja)', marginTop: 4 }}>
            Acessar o Emissor Nacional ↗
          </Externo>
        </div>
        <div style={{ borderTop: '4px solid var(--preto)' }}>
          <h4>Empresa não optante pelo Simples</h4>
          <p>
            Continua emitindo no <b>ISS Eletrônico de Canindé</b>.
          </p>
          <Externo className="onde" href={nfse.issMunicipalUrl} style={{ color: 'var(--laranja)' }}>
            Acessar o ISS Eletrônico ↗
          </Externo>
        </div>
        <div style={{ borderTop: '4px solid var(--parado)' }}>
          <h4>MEI</h4>
          <p>
            Emite pelo <b>Emissor Nacional</b> (web ou aplicativo).
          </p>
          <Link className="onde" to="/nfse/emitir" style={{ color: 'var(--laranja)' }}>
            Ver o passo a passo ➜
          </Link>
          <br />
          <Externo className="onde" href={nfse.emissorUrl} style={{ color: 'var(--laranja)', marginTop: 4 }}>
            Acessar o Emissor Nacional ↗
          </Externo>
        </div>
      </div>
      <div className="aviso mudanca">
        ⚠{' '}
        {dataInicio ? (
          <span>
            Até lá, <b>continue emitindo onde você emite hoje</b>. Data em que o Simples Nacional passa para o Emissor Nacional em Canindé:{' '}
            <b>{dataInicio}</b>.
          </span>
        ) : (
          <span>
            Até a data de mudança ser anunciada, <b>continue emitindo onde você emite hoje</b>. Data em que o Simples Nacional passa para o
            Emissor Nacional em Canindé: <b>a definir pela Secretaria</b>.
          </span>
        )}
      </div>

      <h2 className="secao">Qual é o seu caso?</h2>
      <p className="sub">Escolha o seu perfil para ver o caminho mais curto.</p>
      <div className="perfis" role="group" aria-label="Escolha o seu perfil">
        {PERFIS_NFSE.map((p) => (
          <button
            type="button"
            key={p.chave}
            className={`perfil${perfil === p.chave ? ' sel' : ''}`}
            aria-pressed={perfil === p.chave}
            onClick={() => setPerfil(p.chave)}
            style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }}
          >
            <div className="ico">{p.ico}</div>
            <h4>{p.titulo}</h4>
            <p>{p.texto}</p>
          </button>
        ))}
      </div>
      {perfil && <div className="rota" style={{ display: 'block' }} aria-live="polite" dangerouslySetInnerHTML={{ __html: ROTAS_PERFIL[perfil] }} />}

      <h2 className="secao">Estou pronto para emitir?</h2>
      <p className="sub">Marque o que você já fez. O portal guarda o seu progresso neste aparelho.</p>
      <div className="duas">
        <div>
          <div className="progresso" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={n}>
            <i style={{ width: `${(n / total) * 100}%` }} />
          </div>
          <div className="checklist">
            {CHECKLIST_NFSE.map((i) => (
              <label className={`item-check${feitos[i.chave] ? ' feito' : ''}`} key={i.chave}>
                <input type="checkbox" checked={!!feitos[i.chave]} onChange={(e) => marcar(i.chave, e.target.checked)} />
                <div>
                  <b>{i.titulo}</b>
                  <p>
                    {i.texto}
                    {i.link && (
                      <>
                        {' '}
                        <Link to={i.link.rota}>{i.link.rotulo}</Link>
                      </>
                    )}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 10 }} aria-live="polite">
            {n === total ? 'Tudo pronto! Você já pode emitir pelo Emissor Nacional.' : `${n} de ${total} etapas concluídas.`}
          </p>
        </div>
        <div>
          <div className="caixa-lateral" style={{ border: '2px solid var(--amarelo)' }}>
            <h4>Não conseguiu criar o acesso?</h4>
            <p>
              Se os seus dados não batem com os da Receita ou você não tem título de eleitor nem recibos do IR, a <b>{contatos.orgao}</b> (
              {enderecoCurto}, {contatos.horario}) faz o seu cadastro presencialmente.
            </p>
            <Link className="botao peq preto" to="/nfse/primeiro-acesso#agendar" style={{ marginTop: 8 }}>
              Agendar atendimento
            </Link>
          </div>
          {proximas.length > 0 && (
            <div className="caixa-lateral">
              <h4>Próximas oficinas</h4>
              <TurmasResumo oficinas={proximas} />
              <Link className="botao peq vazio" to="/nfse/materiais" style={{ marginTop: 10 }}>
                Ver agenda completa
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="downloads" style={{ marginTop: 22 }}>
        <Link className="download" to="/nfse/guia-ilustrado" style={{ border: '2px solid var(--amarelo)' }}>
          <span className="pdf" style={{ background: 'var(--preto)' }}>
            📷
          </span>
          <span>
            <b>Guia ilustrado: tela por tela</b>
            <small>39 passos com as telas reais do Emissor Nacional, do cadastro à nota emitida</small>
          </span>
          <span className="baixar">Abrir ➜</span>
        </Link>
        <a className="download" href={PDF_GUIA_OFICIAL} target="_blank" rel="noopener" download>
          <span className="pdf">PDF</span>
          <span>
            <b>Guias oficiais em PDF</b>
            <small>Guia do Emissor Nacional v1.2 e e-book Sebrae/Receita</small>
          </span>
          <span className="baixar">Baixar ⬇</span>
        </a>
      </div>

      <h2 className="secao">Assista antes de começar</h2>
      <p className="sub">Vídeos oficiais do Sebrae, na ordem em que você vai usar.</p>
      <div className="trilha-videos">
        <VideoCard id={VIDEOS_NFSE.cadastro} ord="1 · Cadastro" titulo="Cadastro no Portal Nacional de Emissão de NFS-e — passo a passo" meta="todos os prestadores" />
        <VideoCard id={VIDEOS_NFSE.web} ord="2 · Emissor Web" titulo="Emissão de NFS-e pelo Emissor Web — passo a passo" meta="computador" />
        <VideoCard id={VIDEOS_NFSE.app} ord="3 · Aplicativo" titulo="Emissão de NFS-e pelo app NFS-e Mobile — passo a passo" meta="celular · MEI" />
      </div>

      <h2 className="secao">O caminho, do cadastro à nota</h2>
      <p className="sub">&nbsp;</p>
      <div className="passos">
        <Link className="passo" to="/nfse/primeiro-acesso">
          <div className="n">1</div>
          <h4>Primeiro acesso</h4>
          <p>Crie seu usuário em nfse.gov.br/EmissorNacional.</p>
        </Link>
        <Link className="passo" to="/nfse/primeiro-acesso">
          <div className="n">2</div>
          <h4>Configurações</h4>
          <p>Contato e forma de exibir os tributos.</p>
        </Link>
        <Link className="passo" to="/nfse/emitir">
          <div className="n">3</div>
          <h4>Emitir</h4>
          <p>Pessoas, serviço, valores e conferência.</p>
        </Link>
        <Link className="passo" to="/nfse/depois-de-emitir">
          <div className="n">4</div>
          <h4>Depois de emitir</h4>
          <p>Baixar, corrigir, cancelar e conferir notas recebidas.</p>
        </Link>
      </div>
    </>
  );
}

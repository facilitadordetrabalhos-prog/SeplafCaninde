import { Link } from 'react-router-dom';
import { admin, type Resumo } from '../../api';
import { useAuth } from '../../components/AuthContext';
import { AvisoApi, Banner, Carregando } from '../../components/Comuns';
import { useApi } from '../../util';

const CARTOES: { chave: keyof Resumo; rotulo: string; rota: string }[] = [
  { chave: 'duvidasNovas', rotulo: 'Dúvidas novas', rota: '/equipe/duvidas' },
  { chave: 'duvidasEmResposta', rotulo: 'Dúvidas em resposta', rota: '/equipe/duvidas' },
  { chave: 'noticiasNovas', rotulo: 'Notícias do CGIBS para ler', rota: '/equipe/monitor' },
  { chave: 'conteudosAguardando', rotulo: 'Conteúdos aguardando aprovação', rota: '/equipe/conteudo' },
  { chave: 'agendamentosHoje', rotulo: 'Atendimentos NFS-e hoje', rota: '/equipe/nfse' },
  { chave: 'perguntasEventoPendentes', rotulo: 'Perguntas de evento pendentes', rota: '/equipe/eventos' },
];

export default function Painel() {
  const { usuario } = useAuth();
  const resumo = useApi(() => admin.resumo());
  return (
    <>
      <Banner
        variante="escuro"
        icone="modulos"
        titulo={`Olá${usuario ? `, ${usuario.nome.split(' ')[0]}` : ''}`}
        texto="Resumo do que está esperando a equipe da Secretaria de Finanças."
      />
      {resumo.carregando && !resumo.dados ? (
        <Carregando />
      ) : resumo.erro ? (
        <AvisoApi mensagem={resumo.erro} />
      ) : resumo.dados ? (
        <div className="kpis">
          {CARTOES.map((c) => (
            <Link className="kpi" to={c.rota} key={c.chave}>
              <span>{c.rotulo}</span>
              <b>{resumo.dados?.[c.chave] ?? 0}</b>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}

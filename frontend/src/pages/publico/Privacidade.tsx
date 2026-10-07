import { Banner, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';

/** Aviso de privacidade do portal (LGPD — Lei 13.709/2018). */
export default function Privacidade() {
  const { config } = useConfig();
  const c = config.contatos;
  return (
    <>
      <Banner
        icone="livro"
        titulo="Aviso de privacidade"
        texto="Como o portal da Secretaria de Finanças de Canindé trata os dados pessoais que você informa, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
      />
      <Trilha itens={[['Início', '/'], 'Aviso de privacidade']} />

      <div className="bloco">
        <h3>Quem trata os seus dados</h3>
        <p>
          A <b>Prefeitura Municipal de Canindé</b> (CNPJ 07.963.259/0001-87), por meio da <b>Secretaria Municipal de Finanças</b>, é a
          responsável pelos dados pessoais informados neste portal.
        </p>
      </div>

      <div className="bloco">
        <h3>Quais dados coletamos e para quê</h3>
        <table className="lista">
          <thead>
            <tr>
              <th>Onde</th>
              <th>Dados</th>
              <th>Para quê</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Envie sua dúvida / Pergunte sobre NFS-e</td>
              <td>Nome, e-mail, perfil, assunto e a pergunta</td>
              <td>Responder à sua dúvida e permitir que você consulte a resposta pelo protocolo.</td>
            </tr>
            <tr>
              <td>Agendamento do cadastro presencial (NFS-e)</td>
              <td>CPF ou CNPJ, nome, e-mail ou telefone, motivo e data preferida</td>
              <td>Organizar o atendimento na Diretoria de Arrecadação e confirmar o horário com você.</td>
            </tr>
            <tr>
              <td>Inscrição em oficinas</td>
              <td>Nome, e-mail e telefone (opcional)</td>
              <td>Controlar as vagas e avisar sobre mudanças na oficina.</td>
            </tr>
            <tr>
              <td>Inscrição em eventos da Secretaria</td>
              <td>Dados do formulário de inscrição do evento</td>
              <td>Responder às perguntas deixadas na inscrição.</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          O tratamento se baseia na execução de políticas públicas e no atendimento ao contribuinte, atribuições legais do Município
          (art. 7º, inciso III, e art. 23 da LGPD).
        </p>
      </div>

      <div className="bloco">
        <h3>O que fica público</h3>
        <ul>
          <li>
            <b>Perguntas frequentes:</b> uma resposta só é publicada se você autorizar, e <b>sem o seu nome nem o seu e-mail</b>.
          </li>
          <li>
            <b>Páginas de eventos:</b> aparecem apenas o texto da pergunta e o segmento de atuação. Nome, telefone e e-mail nunca são
            exibidos.
          </li>
          <li>Os demais dados são vistos apenas pela equipe da Secretaria de Finanças, com acesso por login individual.</li>
        </ul>
      </div>

      <div className="bloco">
        <h3>Compartilhamento e armazenamento</h3>
        <ul>
          <li>Os seus dados não são vendidos nem cedidos a terceiros para fins comerciais.</li>
          <li>
            O portal e o banco de dados ficam em provedores de hospedagem e de banco de dados em nuvem contratados pelo Município,
            que guardam as informações em nome da Prefeitura.
          </li>
          <li>
            Os dados são mantidos pelo tempo necessário ao atendimento e às regras de guarda de documentos da administração pública.
          </li>
          <li>
            O portal não usa cookies de rastreamento nem ferramentas de publicidade. Só guarda neste aparelho, por exemplo, o progresso
            do checklist “Estou pronto para emitir?”.
          </li>
        </ul>
      </div>

      <div className="bloco">
        <h3>Os seus direitos</h3>
        <p>
          Você pode pedir para confirmar se tratamos os seus dados, acessá-los, corrigi-los ou pedir a eliminação do que não for mais
          necessário, entre outros direitos previstos no art. 18 da LGPD. Para isso, fale com a Secretaria de Finanças:
        </p>
        <ul>
          <li>
            E-mail: <a href={`mailto:${c.email}`}>{c.email}</a>
          </li>
          <li>
            Telefone: <a href={c.telefoneLink}>{c.telefone}</a>
          </li>
          <li>
            Presencialmente: {c.orgao}, {c.endereco} ({c.horario})
          </li>
        </ul>
      </div>
    </>
  );
}

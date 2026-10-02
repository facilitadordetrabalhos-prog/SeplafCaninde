import { useState, type FormEvent } from 'react';
import { api, mensagemErro } from '../../api';
import { Banner, Externo, Trilha } from '../../components/Comuns';
import { useConfig } from '../../components/ConfigContext';
import { Yt } from '../../components/Yt';
import { VIDEOS_NFSE } from '../../conteudo/links';
import { MOTIVOS_AGENDAMENTO } from '../../conteudo/nfse';

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function FormAgendamento() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS_AGENDAMENTO[0]);
  const [dataPreferida, setData] = useState('');
  const [turno, setTurno] = useState<'manha' | 'tarde'>('manha');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const digitos = cpfCnpj.replace(/\D/g, '');
    if (digitos.length !== 11 && digitos.length !== 14) {
      setErro('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).');
      return;
    }
    if (!nome.trim() || !dataPreferida) {
      setErro('Preencha o nome e o melhor dia.');
      return;
    }
    const dia = new Date(dataPreferida + 'T00:00:00').getDay();
    if (!email.trim() && !telefone.trim()) {
      setErro('Informe um e-mail ou um telefone para a Secretaria confirmar o atendimento.');
      return;
    }
    if (dia === 0 || dia === 6) {
      setErro('O atendimento presencial funciona de segunda a sexta. Escolha um dia útil.');
      return;
    }
    setEnviando(true);
    try {
      const r = await api.agendar({
        cpfCnpj: cpfCnpj.trim(),
        nome: nome.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        motivo,
        dataPreferida,
        turno,
      });
      setMensagem(r.mensagem || 'Agendado! Compareça no dia escolhido com documento com foto.');
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="bloco" style={{ margin: 0 }} id="agendar" onSubmit={enviar} noValidate>
      <h3>Agende seu cadastro presencial</h3>
      <p className="sub">Para quem não conseguiu criar o acesso pelo site ou está com o cadastro bloqueado.</p>
      <div className="campo">
        <label htmlFor="ag-doc">CPF ou CNPJ</label>
        <input id="ag-doc" placeholder="000.000.000-00" inputMode="numeric" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required />
      </div>
      <div className="campo">
        <label htmlFor="ag-nome">Nome</label>
        <input id="ag-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
      </div>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor="ag-email">E-mail</label>
          <input id="ag-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="campo">
          <label htmlFor="ag-tel">Telefone</label>
          <input id="ag-tel" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="tel" />
        </div>
      </div>
      <p className="sub" style={{ margin: '-4px 0 10px' }}>Informe pelo menos um contato: e-mail ou telefone.</p>
      <div className="campo">
        <label htmlFor="ag-motivo">Motivo</label>
        <select id="ag-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          {MOTIVOS_AGENDAMENTO.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor="ag-data">Melhor dia</label>
          <input id="ag-data" type="date" min={amanha()} value={dataPreferida} onChange={(e) => setData(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="ag-turno">Turno</label>
          <select id="ag-turno" value={turno} onChange={(e) => setTurno(e.target.value as 'manha' | 'tarde')}>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
          </select>
        </div>
      </div>
      <button className="botao preto" type="submit" disabled={enviando || !!mensagem}>
        {enviando ? 'Agendando…' : 'Agendar'}
      </button>
      {erro && (
        <div className="erro-box" role="alert">
          {erro}
        </div>
      )}
      {mensagem && (
        <div className="sucesso ver" role="status">
          {mensagem}
        </div>
      )}
    </form>
  );
}

export default function NfseAcesso() {
  const { config } = useConfig();
  return (
    <>
      <Banner
        variante="nfse"
        selo="NFS-e NACIONAL · PASSO 1"
        titulo="Primeiro acesso ao Emissor Nacional"
        texto={
          <>
            Antes de emitir a primeira nota é preciso criar o acesso em <b>nfse.gov.br/EmissorNacional</b>. Para usar o aplicativo, o
            cadastro no site vem primeiro.
          </>
        }
      >
        <Externo className="botao" href={config.nfse.emissorUrl} style={{ marginTop: 12, background: 'var(--amarelo)', color: '#111' }}>
          Abrir o Emissor Nacional ↗
        </Externo>
      </Banner>
      <Trilha itens={[['NFS-e Nacional', '/nfse'], 'Primeiro acesso']} />

      <div className="bloco">
        <div className="video-lado">
          <Yt id={VIDEOS_NFSE.cadastro} rotulo="Cadastro no Portal Nacional de Emissão de NFS-e" />
          <div>
            <span className="tag oficial">Vídeo Sebrae</span>
            <h3 style={{ margin: '8px 0 6px', fontSize: 18 }}>Veja o cadastro sendo feito</h3>
            <p className="sub" style={{ margin: 0 }}>
              Do “Fazer primeiro acesso” até o código de confirmação no e-mail.
            </p>
          </div>
        </div>
      </div>

      <div className="bloco">
        <h3>Escolha como entrar</h3>
        <p className="sub">São três formas de acesso. Quanto maior o nível, mais funções ficam liberadas.</p>
        <div className="acessos">
          <div className="acesso destaque">
            <span className="nivel">Nível 1 · recomendado</span>
            <h4>Usuário e senha</h4>
            <p>
              Clique em <b>“Fazer primeiro acesso”</b> e tenha em mãos:
            </p>
            <ul>
              <li>CPF ou CNPJ</li>
              <li>Data de nascimento do responsável</li>
              <li>Número do título de eleitor</li>
              <li>Se declarou IR: números dos recibos dos 2 últimos anos</li>
              <li>Um e-mail que você acessa (chega um código de confirmação)</li>
            </ul>
          </div>
          <div className="acesso">
            <span className="nivel">Nível 2</span>
            <h4>Cadastro presencial na Prefeitura</h4>
            <p>
              Para quem não conseguiu pelo site. A Secretaria confere seus documentos e libera o acesso. No primeiro login, o sistema pede
              para trocar a senha.
            </p>
          </div>
          <div className="acesso">
            <span className="nivel">Nível 3</span>
            <h4>Certificado digital</h4>
            <p>Quem tem certificado digital entra direto, sem cadastro de senha e sem ir à Prefeitura.</p>
          </div>
          <div className="acesso">
            <span className="nivel">Só para MEI</span>
            <h4>Conta gov.br</h4>
            <p>
              Aceita conta <b>prata ou ouro</b>. A conta bronze não é aceita. O CPF é ligado automaticamente ao CNPJ do MEI.
            </p>
          </div>
        </div>
        <div className="base">
          Fonte: Guia do Emissor Público Nacional Web, v1.2 (Receita Federal / Comitê Gestor da NFS-e), itens 1.1 e 10
        </div>
      </div>

      <div className="bloco">
        <h3>Depois de entrar: configure o emissor</h3>
        <p className="sub">O menu “Configurações” deve ser o primeiro a ser acessado.</p>
        <div className="campo-guia">
          <div className="nome">
            E-mail e telefone<small>opcionais</small>
          </div>
          <div>
            <p>São usados nas notas que você emitir. Só aparecem no PDF da nota (DANFSe) quando não existirem no cadastro oficial.</p>
          </div>
        </div>
        <div className="campo-guia">
          <div className="nome">
            Valor aproximado dos tributos<small>Lei 12.741/2012</small>
          </div>
          <div>
            <p>Define como a nota mostra o total aproximado de tributos federais, estaduais e municipais.</p>
            <div className="preencha">Em dúvida sobre qual opção marcar? Confirme com o seu contador ou com a Secretaria de Finanças.</div>
          </div>
        </div>
        <div className="campo-guia">
          <div className="nome">
            Serviços favoritos<small>MEI e aplicativo</small>
          </div>
          <div>
            <p>
              Cadastre os serviços que você mais presta: um apelido, o Código de Tributação Nacional, o item da NBS e a descrição. A
              emissão simplificada e o aplicativo só mostram serviços favoritos.
            </p>
          </div>
        </div>
      </div>

      <div className="duas">
        <FormAgendamento />
        <div className="caixa-lateral">
          <h4>Esqueceu a senha?</h4>
          <p>
            No Emissor Nacional, use “Esqueci minha senha”. O sistema pede os mesmos dados do primeiro acesso e envia o link para um dos
            e-mails cadastrados.
          </p>
          <h4 style={{ marginTop: 14 }}>Cadastro bloqueado?</h4>
          <p>Se aparecer aviso de bloqueio no cadastro (CNC), o sistema deixa entrar mas não emite. Procure a Secretaria de Finanças.</p>
        </div>
      </div>
    </>
  );
}

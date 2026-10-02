// Conteúdo inicial (textos do protótipo prototipo/index.html). Sem dados pessoais.
import { Conteudo, Modulo, Prazo, ServicoOnline } from '../entities';

export const CONFIG_SEED: Record<string, unknown> = {
  contatos: {
    orgao: 'Diretoria de Arrecadação',
    endereco:
      'Rua Valdery Uchoa, 597 (esquina com a Rua Gervásio Martins, 134) · Centro · Canindé-CE · 62700-000',
    horario: 'seg. a qui., 7h30 às 17h · sex., 7h30 às 13h30',
    email: 'setortributoscaninde@gmail.com',
    telefone: '(85) 9 8193-4279',
    telefoneLink: 'tel:+5585981934279',
    mapaUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Valdery+Uchoa%2C+597%2C+Centro%2C+Caninde+CE',
    portalServicosUrl: 'https://servicos2.speedgov.com.br/caninde',
  },
  nfse: {
    dataInicio: null,
    emissorUrl: 'https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2femissornacional',
    issMunicipalUrl: 'https://iss.speedgov.com.br/caninde/login',
    prazoSubstituicaoDias: null,
    prazoCancelamentoDias: null,
  },
  cgibs: {
    autoPublicarTituloLink: true,
    fontes: { noticias: true },
    ultimaVerificacao: null,
  },
};

export const MODULOS_SEED: Partial<Modulo>[] = [
  { chave: 'reforma', nome: 'Reforma Tributária', descricao: 'Entenda a reforma, cronograma, guias e vídeos.', ativo: true, publico: true },
  { chave: 'noticias-cgibs', nome: 'Notícias oficiais do CGIBS', descricao: 'Monitor das notícias do Comitê Gestor do IBS.', ativo: true, publico: true },
  { chave: 'duvidas', nome: 'Perguntas e dúvidas', descricao: 'Perguntas frequentes e envio de dúvidas com protocolo.', ativo: true, publico: true },
  { chave: 'nfse', nome: 'Ambiente NFS-e Nacional', descricao: 'Orientações, oficinas e agendamentos para o Emissor Nacional.', ativo: true, publico: true },
  { chave: 'servicos', nome: 'Serviços online', descricao: 'Atalhos para os serviços da Secretaria de Finanças.', ativo: true, publico: true },
  { chave: 'eventos', nome: 'Eventos', descricao: 'Páginas de eventos com as perguntas dos participantes respondidas.', ativo: true, publico: true },
];

export const SERVICOS_SEED: Partial<ServicoOnline>[] = [
  {
    titulo: '2ª via do IPTU',
    descricao: 'Imprima o boleto do IPTU informando a inscrição do imóvel ou o CPF/CNPJ do proprietário.',
    url: 'https://servicos2.speedgov.com.br/caninde/segunda_via/iptu',
    icone: '🏠',
    aviso: 'Novidade: o IPTU agora pode ser pago com cartão de crédito.',
    avisoTipo: 'boa',
    destaque: true,
    ordem: 1,
    ativo: true,
  },
  {
    titulo: 'ISS Eletrônico de Canindé',
    descricao:
      'Sistema próprio do município para emitir a nota fiscal de serviço (NFS-e). Entrada separada para empresa/autônomo e para contador/procurador.',
    url: 'https://iss.speedgov.com.br/caninde/login',
    icone: '🧾',
    aviso:
      'Mudança em breve: o ISS Eletrônico de Canindé vai atender apenas empresas não optantes pelo Simples Nacional. Empresas do Simples Nacional passarão a emitir pelo Emissor Nacional da NFS-e.',
    avisoTipo: 'mudanca',
    destaque: true,
    ordem: 2,
    ativo: true,
  },
  {
    titulo: 'Emissor Nacional da NFS-e',
    descricao:
      'Emissor do governo federal para a nota fiscal de serviço no padrão nacional. Já usado pelo MEI, e é para onde vão as empresas do Simples Nacional de Canindé.',
    url: 'https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2femissornacional',
    icone: '🇧🇷',
    aviso: 'Primeira vez? Veja antes o passo a passo da Secretaria.',
    avisoTipo: 'boa',
    destaque: false,
    ordem: 3,
    ativo: true,
  },
  {
    titulo: 'Certidão da empresa (cadastro econômico)',
    descricao:
      'Emita a certidão da sua empresa informando a inscrição econômica e o CPF/CNPJ. A inscrição econômica é o número do cadastro da empresa na Prefeitura de Canindé.',
    url: 'https://servicos2.speedgov.com.br/caninde/pages/certidao_economico',
    icone: '📄',
    aviso: null,
    avisoTipo: null,
    destaque: true,
    ordem: 4,
    ativo: true,
  },
  {
    titulo: 'Regularização de débitos e emissão de guias (DAM)',
    descricao:
      'Consulte e regularize débitos com a Prefeitura e emita o Documento de Arrecadação Municipal (DAM) pelo Portal de Serviços de Canindé. Com o acesso com senha do portal você vê todos os seus boletos, extratos, imóveis e empresas e faz requisições eletrônicas.',
    url: 'https://servicos2.speedgov.com.br/caninde',
    icone: '💰',
    aviso: null,
    avisoTipo: null,
    destaque: false,
    ordem: 5,
    ativo: true,
  },
];

const FONTE_CGSN = 'CGIBS/Receita Federal, 30/09/2026 — Resolução CGSN 194';
export const PRAZOS_SEED: Partial<Prazo>[] = [
  { ate: '2026-10-15', titulo: 'Entrar ou voltar ao Simples Nacional em 2027', quem: 'Micro e pequenas empresas', fonte: FONTE_CGSN, ativo: true },
  { ate: '2026-10-30', titulo: 'Optante do Simples escolher IBS/CBS fora do DAS', quem: 'Para jan–jun/2027', fonte: FONTE_CGSN, ativo: true },
  { ate: '2026-10-30', titulo: 'Regularizar pendências do pedido de opção', quem: 'Quem teve o pedido indeferido', fonte: FONTE_CGSN, ativo: true },
  {
    ate: '2026-10-31',
    titulo: 'Cooperativas: opção pelo regime específico',
    quem: 'Art. 271 da LC 214/2025',
    fonte: 'CGIBS/Receita Federal, 21/09/2026 — Orientação Conjunta para sociedades cooperativas',
    ativo: true,
  },
];

const GUIA_CORPO = `<p>O Simples Nacional continua existindo, o MEI mantém o tratamento simplificado e o limite geral continua em R$ 4,8 milhões. O que muda é que, a partir de 2027, o IBS e a CBS entram no Simples, e a empresa precisa escolher <b>como</b> vai recolher esses dois tributos.</p>
<h3>As duas trilhas</h3>
<div class="comparativo">
  <div><h4>Simples “puro”</h4><p>IBS e CBS dentro do DAS</p>
    <ul><li>Operação mais simples</li><li>Não aproveita créditos nas compras</li><li>Gera crédito menor para o cliente</li></ul></div>
  <div><h4>Simples “híbrido”</h4><p>IBS e CBS fora do DAS, no regime regular</p>
    <ul><li>Aproveita créditos nas compras</li><li>Gera crédito integral para o cliente</li><li>Exige mais controle e sistema preparado</li></ul></div>
</div>
<div class="caixa-dica"><b>A pergunta certa não é “qual imposto é menor?”.</b> É: meu cliente compra preço ou compra crédito? Quem vende para outras empresas (B2B) pode perder competitividade se não gerar crédito. Quem vende para o consumidor final (B2C) precisa olhar a margem e o preço.</div>
<h3>Os prazos (atualizados)</h3>
<table class="tabela-prazos">
  <thead><tr><th>O que</th><th>Prazo</th></tr></thead>
  <tbody>
    <tr><td>Pedir para entrar ou voltar ao Simples Nacional em 2027</td><td><b>até 15/10/2026</b></td></tr>
    <tr><td>Regularizar pendências se o pedido for indeferido</td><td><b>até 30/10/2026</b></td></tr>
    <tr><td>Optante do Simples escolher IBS/CBS pelo regime regular (“híbrido”) para jan–jun/2027</td><td><b>até 30/10/2026</b></td></tr>
    <tr><td>Desistir de qualquer das duas opções</td><td>03/11 a 20/12/2026</td></tr>
  </tbody>
</table>
<div class="base">Base oficial: Resolução CGSN nº 194 · notícia “Opção do contribuinte por Simples Nacional ou pelo regime regular de CBS e IBS para 2027 tem novos prazos”, CGIBS/Receita Federal, 30/09/2026 · <a href="/reforma/noticias">ver no portal</a></div>
<h3>Antes de decidir, separe estes dados</h3>
<ul>
  <li>Faturamento dos últimos 12 meses e anexo do Simples</li>
  <li>Quanto você vende para empresas e quanto para consumidor final</li>
  <li>De quem você compra e se esses fornecedores geram crédito</li>
  <li>Folha, margem, investimentos previstos e contratos</li>
</ul>
<p>Com esses dados, peça ao seu contador para simular pelo menos três cenários: Simples puro, híbrido e preço ajustado.</p>
<h3>Quatro sinais de alerta para o MEI</h3>
<ul><li>Faturamento perto do limite</li><li>Movimentação na conta sem nota fiscal</li><li>Cliente empresa pedindo crédito</li><li>A operação ficou mais complexa</li></ul>
<h3>Fim do regime de caixa no Simples</h3>
<p>A partir de 2027 o faturamento passa a ser reconhecido pelo documento fiscal, e não mais pelo recebimento. Isso afeta capital de giro e cobrança.</p>
<h3>Conteúdo baseado em</h3>
<p>Palestra “Reforma Tributária para empresários — MEI e Simples Nacional”, Prof. Tiago Emerson (CRC-CE), realizada pela Secretaria de Finanças.</p>`;

export const GUIA_SEED: Partial<Conteudo> = {
  tipo: 'guia',
  titulo: 'Simples “puro” ou “híbrido”: a decisão de 2027 para micro e pequenas empresas',
  slug: 'simples-puro-ou-hibrido',
  publico: 'mei',
  resumo:
    'A partir de 2027 o IBS e a CBS entram no Simples Nacional e a empresa precisa escolher como recolher esses tributos: dentro do DAS ou pelo regime regular. Prazo para optar até 30/10/2026.',
  corpo: GUIA_CORPO,
  baseOficial: 'Resolução CGSN nº 194 · CGIBS/Receita Federal, 30/09/2026',
  destaque: true,
  status: 'publicado',
};

export const FAQ_SEED: Partial<Conteudo>[] = [
  {
    titulo: 'Sou do Simples. Até quando posso escolher o IBS/CBS pelo regime regular?',
    slug: 'faq-simples-prazo-opcao-ibs-cbs-regime-regular',
    publico: 'mei',
    corpo:
      'Para o período de janeiro a junho de 2027, a opção pode ser feita até <b>30 de outubro de 2026</b>. Se mudar de ideia, dá para cancelar entre 3 de novembro e 20 de dezembro de 2026. Não confunda com o prazo para <b>entrar</b> no Simples, que vai até 15 de outubro.',
    baseOficial: 'Resolução CGSN 194 · CGIBS/Receita Federal, 30/09/2026',
    destaque: true,
  },
  {
    titulo: 'Sou MEI. O que muda para mim?',
    slug: 'faq-sou-mei-o-que-muda',
    publico: 'mei',
    corpo:
      'O regime do MEI foi preservado: continua simplificado e com recolhimento próprio. O ponto de atenção é a formalização: emissão de nota (NFS-e para serviço) e conta bancária compatível com o que você fatura.',
    baseOficial: 'LC 214/2025',
  },
  {
    titulo: 'O que são IBS e CBS?',
    slug: 'faq-o-que-sao-ibs-e-cbs',
    publico: 'todos',
    corpo:
      'São os dois novos tributos sobre o consumo. A CBS é federal e substitui PIS e Cofins. O IBS é compartilhado entre estados e municípios, administrado pelo Comitê Gestor, e substitui o ICMS e o ISS.',
    baseOficial: 'EC 132/2023 · LC 214/2025',
  },
  {
    titulo: 'Continuo pagando ISS para Canindé?',
    slug: 'faq-continuo-pagando-iss',
    publico: 'servico',
    corpo: 'Sim. O ISS é cobrado normalmente até 2028, começa a diminuir em 2029 e é extinto em 2033.',
    baseOficial: 'EC 132/2023',
  },
  {
    titulo: 'A reforma muda o IPTU?',
    slug: 'faq-reforma-muda-iptu',
    publico: 'cidadao',
    corpo: 'O IPTU continua sendo um imposto municipal e não é substituído pelo IBS.',
    baseOficial: 'EC 132/2023',
  },
];

export const EVENTO_SEED = {
  slug: 'conexao-empresarial-2026',
  nome: 'Conexão Empresarial Canindé',
  data: '2026-09-19',
  descricao:
    'Na inscrição do evento, os participantes deixaram dúvidas sobre a Reforma Tributária. Agrupamos as perguntas por tema e a Secretaria de Finanças responde cada um deles, sempre com a base na lei.',
  imagemUrl: '/img/conexao-empresarial.webp',
  totalInscritos: 0,
  totalPessoas: 0,
};

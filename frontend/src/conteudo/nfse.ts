/* Textos curados do ambiente NFS-e Nacional (protótipo aprovado). HTML simples, sem dados externos. */

export const PERFIS_NFSE = [
  { chave: 'mei', ico: '🧰', titulo: 'Sou MEI', texto: 'Emissão simplificada, pelo computador ou pelo celular.' },
  { chave: 'empresa', ico: '🏢', titulo: 'Sou empresa', texto: 'Simples Nacional, Lucro Presumido ou Real. Emissão completa.' },
  { chave: 'autonomo', ico: '👤', titulo: 'Sou autônomo', texto: 'Profissional pessoa física que presta serviço com CPF.' },
  { chave: 'contador', ico: '📊', titulo: 'Sou contador', texto: 'Vou preparar meus clientes e emitir por eles.' },
  { chave: 'tomador', ico: '🧾', titulo: 'Recebo notas', texto: 'Contrato serviços e quero conferir as notas que recebo.' },
];

export const ROTAS_PERFIL: Record<string, string> = {
  mei: '<b>MEI:</b><ol><li>Faça o primeiro acesso (pode ser pela conta gov.br prata ou ouro).</li><li>Em Configurações, preencha e-mail e telefone.</li><li>Cadastre seus <b>serviços favoritos</b>.</li><li>Emita pela <b>Emissão Simplificada</b> ou pelo aplicativo NFS-e Mobile.</li></ol>',
  empresa:
    '<b>Empresa:</b><ol><li>Faça o primeiro acesso com o CNPJ (usuário e senha ou certificado digital).</li><li>Confirme com o contador o <b>Código de Tributação Nacional</b> de cada serviço e as retenções.</li><li>Emita pela <b>Emissão Completa</b>.</li><li>Combine com o contador quem vai emitir e conferir as notas.</li></ol>',
  autonomo:
    '<b>Autônomo (CPF):</b><ol><li>Faça o primeiro acesso com o CPF: data de nascimento, título de eleitor e, se declarou IR, os recibos dos dois últimos anos.</li><li>Se os dados não baterem, agende o cadastro presencial.</li><li>Emita pela <b>Emissão Completa</b>.</li></ol>',
  contador:
    '<b>Contador:</b><ol><li>Peça à Secretaria a lista dos seus clientes que ainda não fizeram o primeiro acesso.</li><li>Defina com cada cliente o código de serviço, o regime e as retenções.</li><li>Inscreva-se no encontro com contadores.</li></ol>',
  tomador:
    '<b>Quem recebe notas:</b><ol><li>Faça o primeiro acesso para ver as notas emitidas para você em “NFS-e recebidas”.</li><li><b>Confirme</b> as notas corretas e <b>rejeite</b> as que não reconhece.</li><li>Confira qualquer nota na Consulta Pública pela chave de acesso.</li></ol>',
};

export interface ItemChecklist {
  chave: string;
  titulo: string;
  texto: string;
  link?: { rotulo: string; rota: string };
}

export const CHECKLIST_NFSE: ItemChecklist[] = [
  {
    chave: 'docs',
    titulo: 'Separei os dados de cadastro',
    texto:
      'CPF ou CNPJ, data de nascimento do responsável, número do título de eleitor e, se declarou Imposto de Renda, os números dos recibos dos dois últimos anos.',
  },
  {
    chave: 'acesso',
    titulo: 'Fiz o primeiro acesso no Emissor Nacional',
    texto: 'Criei usuário e senha (ou entrei com certificado digital ou gov.br, se for MEI).',
    link: { rotulo: 'Como fazer', rota: '/nfse/primeiro-acesso' },
  },
  { chave: 'config', titulo: 'Configurei o emissor', texto: 'Preenchi e-mail, telefone e a opção de valor aproximado dos tributos em “Configurações”.' },
  { chave: 'codigo', titulo: 'Sei qual é o código do meu serviço', texto: 'Conferi com meu contador o Código de Tributação Nacional da minha atividade.' },
  { chave: 'favoritos', titulo: 'Cadastrei meus serviços favoritos', texto: 'Obrigatório para quem vai usar a emissão simplificada ou o aplicativo.' },
  {
    chave: 'emiti',
    titulo: 'Treinei a emissão',
    texto: 'Segui o passo a passo e sei onde ficam as notas emitidas, como baixar o PDF e como corrigir.',
    link: { rotulo: 'Passo a passo', rota: '/nfse/emitir' },
  },
];

export const PROBLEMAS_NFSE: { pergunta: string; etiqueta: string; resposta: string; link?: { rotulo: string; rota: string } }[] = [
  {
    pergunta: '“A data de nascimento informada não corresponde ao CPF informado.”',
    etiqueta: 'Primeiro acesso',
    resposta:
      'A data digitada é diferente da que está no cadastro do CPF na Receita Federal. Confira a data. Se estiver certa, atualize o CPF no site da Receita ou agende o cadastro presencial na Secretaria.',
  },
  {
    pergunta: '“Não foi possível recuperar informações do Contribuinte.”',
    etiqueta: 'Primeiro acesso',
    resposta:
      'O CPF ou CNPJ não foi encontrado. Confira os números digitados. Se o CNPJ for novo, aguarde a atualização dos cadastros ou procure a Secretaria.',
  },
  {
    pergunta: '“Não foi possível criar seu usuário.”',
    etiqueta: 'Primeiro acesso',
    resposta:
      'Os dados de título de eleitor ou dos recibos do IR não conferem. Use o certificado digital ou faça o cadastro presencial na Secretaria de Finanças.',
  },
  {
    pergunta: 'Não aparece a opção “Emissão Simplificada”.',
    etiqueta: 'Emissão',
    resposta: 'A emissão simplificada está disponível para MEI. Os demais usam a Emissão Completa.',
  },
  {
    pergunta: 'O aplicativo não mostra o meu serviço.',
    etiqueta: 'Aplicativo',
    resposta: 'O aplicativo só mostra os <b>serviços favoritos</b>. Cadastre-os primeiro no Emissor Web, em “Serviços Favoritos”.',
  },
  {
    pergunta: 'Meu cadastro aparece como bloqueado.',
    etiqueta: 'Cadastro',
    resposta:
      'O sistema deixa entrar, mas não deixa emitir enquanto o cadastro estiver bloqueado. A regularização é feita pela Secretaria de Finanças.',
  },
  {
    pergunta: 'Preciso informar série e número da DPS?',
    etiqueta: 'Emissão',
    resposta: 'Não. Deixe a opção desmarcada que o emissor numera sozinho.',
  },
  {
    pergunta: 'Emiti com valor errado.',
    etiqueta: 'Correção',
    resposta: 'Use <b>Substituir</b>: o emissor gera a nota correta e cancela a anterior.',
    link: { rotulo: 'Veja como', rota: '/nfse/depois-de-emitir' },
  },
];

export const MOTIVOS_AGENDAMENTO = [
  'Não consegui fazer o primeiro acesso',
  'Data de nascimento ou dados não conferem',
  'Não tenho título de eleitor nem recibos do IR',
  'Meu cadastro aparece como bloqueado',
  'Esqueci a senha e não acesso mais o e-mail',
];

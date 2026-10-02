/* Campos da emissão completa da NFS-e (extraídos do protótipo aprovado). Textos em HTML simples e curado. */
export interface CampoGuia { nome: string; nota: string; texto: string; preencha?: string; atencao?: string; local?: string }

export const ABAS_EMITIR: { rotulo: string; campos: CampoGuia[] }[] = [
  { rotulo: "Pessoas", campos: [
    {
      "nome": "Data de competência",
      "nota": "obrigatório",
      "texto": "Data em que o serviço foi <b>prestado</b>, e não necessariamente a data de hoje."
    },
    {
      "nome": "Informar série e número da DPS",
      "nota": "opcional",
      "texto": "A DPS é a “declaração” que vira nota. O emissor numera sozinho.",
      "preencha": "Deixe <b>desmarcado</b>. Se marcar, passa a ser obrigatório preencher série e número."
    },
    {
      "nome": "Emitente da NFS-e",
      "nota": "obrigatório",
      "texto": "Quem está emitindo: Prestador, Tomador ou Intermediário.",
      "preencha": "Marque <b>Prestador</b>. Hoje só o prestador pode emitir."
    },
    {
      "nome": "Seus dados",
      "nota": "automáticos",
      "texto": "Nome, endereço, inscrição municipal e opção pelo Simples vêm do cadastro da Receita Federal e do município.",
      "atencao": "Se algum dado estiver errado, ele não se corrige na nota. Atualize o cadastro na Receita ou procure a Secretaria."
    },
    {
      "nome": "Regime de apuração (Simples)",
      "nota": "quando aparecer",
      "texto": "Se os tributos são apurados pelo Simples Nacional ou pela própria nota.",
      "preencha": "Confirme com seu contador antes de escolher."
    },
    {
      "nome": "Tomador do serviço",
      "nota": "o seu cliente",
      "texto": "Escolha Brasil ou Exterior e digite o CPF ou CNPJ. O nome aparece sozinho."
    },
    {
      "nome": "Intermediário",
      "nota": "raro",
      "texto": "Só quando uma agência ou plataforma intermediou o serviço.",
      "preencha": "Na maioria dos casos: <b>“Intermediário não informado”</b>."
    }
  ] },
  { rotulo: "Serviço", campos: [
    {
      "nome": "Local da prestação",
      "nota": "obrigatório",
      "texto": "País e município onde o serviço foi <b>concluído</b>. Digite 3 letras do município para buscar.",
      "atencao": "Define para qual município vai o ISS em alguns serviços. Não deixe “Canindé” por hábito se o serviço foi feito em outra cidade."
    },
    {
      "nome": "Código de Tributação Nacional",
      "nota": "obrigatório",
      "texto": "Classificação do serviço, igual em todo o Brasil. Digite 3 caracteres para buscar na lista nacional.",
      "atencao": "É o campo que mais gera erro. Confirme o código com o contador. Não copie código de exemplo de tutorial.",
      "local": "<b>Canindé:</b> a Secretaria vai publicar uma tabela “atividade → código nacional” para as atividades mais comuns do município."
    },
    {
      "nome": "Código complementar do município",
      "nota": "se houver",
      "texto": "Detalhamento que cada município pode criar dentro do código nacional.",
    },
    {
      "nome": "Imunidade, exportação ou não incidência",
      "nota": "obrigatório",
      "texto": "Se o serviço tem alguma situação especial de ISS.",
      "preencha": "Na maioria dos casos: <b>nenhuma</b>. Em caso especial, confirme com o contador."
    },
    {
      "nome": "Descrição do serviço",
      "nota": "obrigatório",
      "texto": "Texto livre, claro e objetivo.",
      "preencha": "Exemplo: “Manutenção elétrica no estabelecimento do cliente, realizada em 15/10/2026”."
    },
    {
      "nome": "Serviço de obra",
      "nota": "construção civil",
      "texto": "Informe o endereço da obra ou o número do <b>CNO</b> (Cadastro Nacional de Obras da Receita Federal)."
    }
  ] },
  { rotulo: "Valores", campos: [
    {
      "nome": "Valor do serviço",
      "nota": "obrigatório",
      "texto": "Valor total cobrado do cliente. É a base para o cálculo dos tributos."
    },
    {
      "nome": "Descontos",
      "nota": "opcionais",
      "texto": "<b>Incondicionado:</b> dado sem condição; reduz a base do ISS. <b>Condicionado:</b> depende de algo depois da emissão (ex.: pagar até tal dia); não reduz a base."
    },
    {
      "nome": "Regime especial de tributação",
      "nota": "obrigatório",
      "texto": "Opções como Nenhum, Ato cooperado e Sociedade de profissionais.",
      "preencha": "A maioria dos prestadores marca <b>Nenhum</b>. Sociedade de profissionais só para quem paga ISS fixo."
    },
    {
      "nome": "Alíquota do ISS",
      "nota": "calculada",
      "texto": "O sistema aplica a alíquota cadastrada pelo município para o código escolhido e calcula o ISS.",
    },
    {
      "nome": "Tributação federal",
      "nota": "PIS, Cofins, CSLL, IRRF, INSS",
      "texto": "Retenções federais dependem do tipo de cliente e do serviço.",
      "atencao": "Não use percentuais de tutoriais sem conferir. Defina com o contador."
    }
  ] },
  { rotulo: "Emitir", campos: [
    {
      "nome": "Conferência",
      "nota": "resumo",
      "texto": "O emissor mostra um resumo de tudo e o cálculo do imposto. Dá para voltar em <b>Editar Pessoas</b>, <b>Editar Serviço</b> ou <b>Editar Tributação</b>.",
      "preencha": "Confira o valor líquido e as retenções antes de clicar em <b>Emitir NFS-e</b>."
    },
    {
      "nome": "Nota gerada",
      "nota": "pronto",
      "texto": "Aparece a <b>chave de acesso</b> da nota. Dali você baixa o PDF (DANFSe) e o arquivo XML para enviar ao cliente."
    },
    {
      "nome": "Caiu a internet?",
      "nota": "rascunho",
      "texto": "O emissor salva um rascunho a cada 5 segundos. Retome em “Rascunhos” de onde parou."
    }
  ] }
];

export const PERGUNTAS_ISS = [
  { pergunta: 'A exigibilidade do ISS está suspensa?', texto: 'Só “sim” com decisão judicial ou processo administrativo.' },
  { pergunta: 'Há retenção do ISS pelo tomador?', texto: 'Alguns serviços prestados a empresas podem ter retenção, conforme a lei municipal.' },
  { pergunta: 'O serviço tem benefício municipal?', texto: 'Só se houver incentivo fiscal previsto em lei de Canindé.' },
];

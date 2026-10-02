// Gerado a partir de EVENTO_TEMAS em prototipo/index.html (sem perguntas de participantes).
import { LinkTema } from '../entities';

export interface TemaSeed {
  chave: string;
  titulo: string;
  resposta: string;
  baseOficial: string;
  links: LinkTema[];
  ordem: number;
}

export const TEMAS_EVENTO_SEED: TemaSeed[] = [
  {
    "chave": "geral",
    "titulo": "O que muda com a reforma, no geral",
    "resposta": "<p>Os cinco tributos sobre o consumo (PIS, Cofins, IPI, ICMS e ISS) dão lugar a dois: a <b>CBS</b>, federal, e o <b>IBS</b>, de estados e municípios. Também é criado o Imposto Seletivo para produtos prejudiciais à saúde e ao meio ambiente.</p><p>Para a empresa, as mudanças principais são três:</p><ul><li><b>Imposto “por fora”:</b> o valor do IBS e da CBS aparece separado na nota.</li><li><b>Crédito amplo:</b> quase tudo o que a empresa compra gera crédito para abater do imposto devido.</li><li><b>Cobrança no destino:</b> o imposto vai para o município onde está o cliente.</li></ul><p>A mudança é gradual: 2026 é ano de teste, a CBS vale integralmente em 2027, o ICMS e o ISS diminuem de 2029 a 2032 e o sistema novo fica completo em 2033.</p>",
    "baseOficial": "EC 132/2023 · LC 214/2025",
    "links": [
      {
        "rotulo": "Entenda a reforma",
        "rota": "/reforma/entenda"
      },
      {
        "rotulo": "Cronograma",
        "rota": "/reforma/cronograma"
      }
    ],
    "ordem": 1
  },
  {
    "chave": "simples",
    "titulo": "Simples Nacional e pequenos negócios",
    "resposta": "<p><b>O Simples Nacional continua.</b> A partir de 2027, o IBS e a CBS entram no DAS no lugar dos tributos antigos.</p><p>A novidade é uma escolha: a empresa do Simples pode recolher o IBS e a CBS <b>por fora do DAS</b>, no regime regular. Assim ela aproveita crédito nas compras e passa crédito integral para o cliente.</p><ul><li>Quem vende mais para <b>outras empresas</b> tende a ganhar com o recolhimento por fora, porque o cliente aproveita o crédito.</li><li>Quem vende mais para o <b>consumidor final</b> costuma ficar melhor no Simples “puro”, que é mais simples.</li></ul><p><b>Prazo para escolher</b> o recolhimento por fora para janeiro a junho de 2027: <b>até 30/10/2026</b>. Dá para desistir de 03/11 a 20/12/2026.</p><p><b>Como se preparar:</b> levante quanto você vende para empresas e quanto vende para consumidor, de quem você compra e qual é a sua margem. Depois simule os dois cenários com o seu contador.</p><p><b>Imposto “descontado direto da venda”:</b> a lei prevê o <i>split payment</i>. Nos pagamentos eletrônicos (cartão, Pix, boleto), a parte do imposto poderá ser separada e enviada direto ao governo no momento do pagamento. A implantação será gradual e ainda depende de regulamentação.</p>",
    "baseOficial": "LC 214/2025 · Resolução CGSN 194 · CGIBS/Receita Federal, 30/09/2026",
    "links": [
      {
        "rotulo": "Guia: Simples puro ou híbrido",
        "rota": "/reforma/guias/simples-puro-ou-hibrido"
      }
    ],
    "ordem": 2
  },
  {
    "chave": "mei",
    "titulo": "MEI",
    "resposta": "<p><b>O MEI continua.</b> O recolhimento segue mensal e em valor fixo, com o mesmo tratamento simplificado, e o MEI não precisa escolher regime.</p><p>Os pontos de atenção são os mesmos de hoje, só que com mais peso:</p><ul><li>emitir nota fiscal (para serviço, pelo Emissor Nacional);</li><li>manter a conta bancária compatível com o que fatura;</li><li>acompanhar o limite anual de faturamento.</li></ul><p><b>Uma empresa maior pode deixar de contratar um MEI porque ele não gera crédito?</b> A escolha de fornecedor é livre, então pode.</p><p>No sistema novo, quem compra aproveita como crédito o IBS e a CBS que o fornecedor de fato recolheu, inclusive quando o fornecedor é do Simples. Como o MEI recolhe valores fixos baixos, o crédito que ele gera é pequeno.</p><p>O que conta para o cliente é o <b>custo líquido</b>: preço menos crédito. Um MEI com preço competitivo continua sendo uma boa opção, principalmente para clientes que vendem ao consumidor final.</p>",
    "baseOficial": "LC 214/2025, art. 47, § 3º (crédito na compra de optante do Simples)",
    "links": [
      {
        "rotulo": "Ambiente NFS-e Nacional",
        "rota": "/nfse"
      }
    ],
    "ordem": 3
  },
  {
    "chave": "precos",
    "titulo": "Preços, custos e créditos",
    "resposta": "<p>Cada empresa vai sentir a reforma de um jeito. Na formação de preço, mudam quatro coisas:</p><ol><li><b>Preço sem imposto + imposto destacado.</b> O IBS e a CBS deixam de estar embutidos no preço.</li><li><b>Crédito amplo.</b> Insumos, energia, aluguel e serviços que a empresa compra geram crédito, desde que o fornecedor tenha recolhido o imposto.</li><li><b>Custo de compra é o custo líquido.</b> O que conta é o preço menos o crédito, e não só o menor preço.</li><li><b>Transição longa.</b> De 2027 a 2032 os dois sistemas convivem, e a carga efetiva muda a cada ano. Revise a precificação todo ano.</li></ol><p><b>Os preços vão mudar em todas as áreas?</b> Não de forma igual:</p><ul><li>a cesta básica nacional tem alíquota zero;</li><li>saúde e educação têm redução de 60%;</li><li>profissões regulamentadas, como advogados, contadores e arquitetos, têm redução de 30%;</li><li>serviços que compram poucos insumos podem ter aumento de carga, porque têm pouco crédito para abater.</li></ul><p><b>Construção civil</b> tem regime específico para operações com imóveis.</p><p><b>E no CPF?</b> O consumidor passa a ver o imposto na nota, e famílias de baixa renda no CadÚnico recebem cashback. A pessoa física com receita abaixo de 50% do limite do MEI (nanoempreendedor) não paga IBS nem CBS.</p>",
    "baseOficial": "LC 214/2025, arts. 26, 47, 112 a 118, 125, 127, 129 e 130",
    "links": [
      {
        "rotulo": "Entenda a reforma",
        "rota": "/reforma/entenda"
      }
    ],
    "ordem": 4
  },
  {
    "chave": "servicos",
    "titulo": "Prestação de serviço e nota fiscal",
    "resposta": "<p><b>O ISS continua integral até 2028.</b> De 2029 a 2032 ele cai para 90%, 80%, 70% e 60%, e em 2033 é extinto, enquanto o IBS sobe na mesma proporção. Algumas atividades terão alíquota reduzida, como saúde, educação e profissões regulamentadas.</p><p><b>Nota fiscal:</b> a NFS-e segue o padrão nacional. Em Canindé, as empresas do Simples Nacional vão passar a emitir pelo Emissor Nacional.</p><p><b>Recolher por dentro ou por fora?</b> Depende de quanto o cliente valoriza o crédito: vendas para empresas favorecem recolher por fora, vendas ao consumidor favorecem ficar por dentro. Simule margem, preço e caixa nos dois cenários antes de 30/10/2026.</p><p><b>Preenchimento da NFS-e a partir de 01/01/2027:</b> o leiaute nacional já tem campos para IBS e CBS. As regras de preenchimento para 2027 seguem as notas técnicas da NFS-e nacional, e a Secretaria vai publicar a orientação para Canindé quando elas forem definidas.</p>",
    "baseOficial": "EC 132/2023 · LC 214/2025 · Guia do Emissor Nacional v1.2",
    "links": [
      {
        "rotulo": "Ambiente NFS-e Nacional",
        "rota": "/nfse"
      },
      {
        "rotulo": "Guia do Simples",
        "rota": "/reforma/guias/simples-puro-ou-hibrido"
      }
    ],
    "ordem": 5
  },
  {
    "chave": "exterior",
    "titulo": "Operações com o exterior",
    "resposta": "<p><b>Exportação de bens e de serviços é imune</b> ao IBS e à CBS, e o exportador continua aproveitando os créditos do que comprou para exportar.</p><p>Na <b>importação</b>, bens e serviços passam a pagar IBS e CBS, para igualar a carga com o produto nacional.</p><p>Para contratos em andamento com empresas de outros países, vale revisar as cláusulas de preço e de tributos com o seu contador ou advogado.</p>",
    "baseOficial": "LC 214/2025, art. 79",
    "links": [],
    "ordem": 6
  },
  {
    "chave": "incompleta",
    "titulo": "Pergunta incompleta",
    "resposta": "<p>A pergunta chegou cortada no formulário de inscrição. A equipe vai entrar em contato com o participante para entender a dúvida.</p>",
    "baseOficial": "",
    "links": [],
    "ordem": 7
  }
];

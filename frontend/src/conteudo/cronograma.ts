export interface Marco {
  ano: string;
  agora?: boolean;
  etiqueta?: string;
  itens: string[];
  iss: string;
  base?: string;
}

export const MARCOS: Marco[] = [
  {
    ano: '2026',
    agora: true,
    etiqueta: 'ano de teste — estamos aqui',
    itens: [
      'CBS de 0,9% e IBS de 0,1% destacados na nota fiscal, em caráter de teste.',
      'Até 15/10: pedido de opção pelo Simples Nacional para 2027. Até 30/10: opção pelo IBS/CBS no regime regular (prazos prorrogados).',
    ],
    iss: 'nada muda na cobrança. Atenção à NFS-e no padrão nacional.',
    base: 'LC 214/2025 · Resolução CGSN 194',
  },
  {
    ano: '2027',
    itens: [
      'CBS entra em vigor; PIS e Cofins são extintos. Começa o Imposto Seletivo.',
      'IBS e CBS entram no Simples Nacional; fim do regime de caixa no Simples.',
    ],
    iss: 'continua integral.',
    base: 'EC 132/2023 · LC 214/2025',
  },
  {
    ano: '2028',
    itens: ['IBS segue com alíquota de teste.'],
    iss: 'último ano com alíquota integral.',
  },
  {
    ano: '2029 a 2032',
    itens: ['ICMS e ISS são reduzidos gradualmente (90%, 80%, 70% e 60%) e o IBS aumenta na mesma proporção.'],
    iss: 'alíquota diminui a cada ano. Começa a transição na forma como o IBS é repartido entre os municípios.',
    base: 'EC 132/2023',
  },
  {
    ano: '2033',
    itens: ['ICMS e ISS são extintos. IBS e CBS passam a valer integralmente.'],
    iss: 'deixa de existir. O município recebe sua parte do IBS, distribuída pelo Comitê Gestor.',
  },
];

import type { ConfigPublica } from '../api';

/** Valores usados enquanto /api/config/publica não responde (mesmos do seed do backend).
    Garantem que o rodapé e os contatos apareçam mesmo com a API fora do ar. */
export const CONFIG_PADRAO: ConfigPublica = {
  contatos: {
    orgao: 'Diretoria de Arrecadação',
    endereco: 'Rua Valdery Uchoa, 597 (esquina com a Rua Gervásio Martins, 134) · Centro · Canindé-CE · 62700-000',
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
  emailAtivo: false,
  modulos: [],
};

export const EVENTO_PADRAO_SLUG = 'conexao-empresarial-2026';

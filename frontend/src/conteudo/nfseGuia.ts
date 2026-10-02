/* Guia ilustrado do Emissor Nacional (extraído do protótipo aprovado). Textos em HTML simples e curado. */
export interface PassoGuia { img: string; alt: string; titulo: string; texto: string; dica?: string }
export interface SecaoGuia { id: string; titulo: string; sub: string; celular: boolean; base: string; passos: PassoGuia[] }

export const GUIA_NFSE: SecaoGuia[] = [
  {
    "id": "guia-a",
    "titulo": "1. Primeiro acesso",
    "sub": "Criar o seu usuário no Emissor Nacional. Faça uma vez só.",
    "celular": false,
    "base": "Imagens e instruções: Guia do Emissor Público Nacional Web v1.2 (Sistema Nacional NFS-e) · Passo a passo: cadastramento e emissão de NFS-e (Sebrae/Receita Federal, fev/2023)",
    "passos": [
      {
        "img": "a01-login.webp",
        "alt": "Abra o Emissor Nacional e clique em “Fazer primeiro acesso”",
        "titulo": "Abra o Emissor Nacional e clique em “Fazer primeiro acesso”",
        "texto": "Na tela de entrada aparecem três formas de acesso: usuário e senha, certificado digital e gov.br. Para criar usuário e senha, clique em <b>Fazer primeiro acesso</b>."
      },
      {
        "img": "a02-identificacao.webp",
        "alt": "Informe CPF ou CNPJ e a data de nascimento",
        "titulo": "Informe CPF ou CNPJ e a data de nascimento",
        "texto": "Escolha CPF ou CNPJ. Para empresa, informe o CNPJ, o CPF do responsável e a data de nascimento dele. Clique em <b>Avançar</b>."
      },
      {
        "img": "a03-titulo.webp",
        "alt": "Informe o número do título de eleitor",
        "titulo": "Informe o número do título de eleitor",
        "texto": "O sistema pede o título de eleitor do CPF informado."
      },
      {
        "img": "a04-recibos-ir.webp",
        "alt": "Se declarou Imposto de Renda, informe os recibos",
        "titulo": "Se declarou Imposto de Renda, informe os recibos",
        "texto": "Quem entregou a declaração de IR como pessoa física informa os números dos recibos dos <b>dois últimos anos</b>."
      },
      {
        "img": "a05-email-senha.webp",
        "alt": "Cadastre o e-mail e crie a senha",
        "titulo": "Cadastre o e-mail e crie a senha",
        "texto": "Informe um e-mail que você acessa e crie a senha seguindo as regras da tela."
      },
      {
        "img": "a06-codigo.webp",
        "alt": "Digite o código que chegou no e-mail",
        "titulo": "Digite o código que chegou no e-mail",
        "texto": "O sistema envia um código numérico para o e-mail cadastrado. Digite o código e clique em <b>Avançar</b>. Pronto: o acesso está criado."
      },
      {
        "img": "a07-erro-usuario.webp",
        "alt": "Apareceu “Não foi possível criar seu usuário”?",
        "titulo": "Apareceu “Não foi possível criar seu usuário”?",
        "texto": "Os dados informados não conferem com os da Receita Federal. Nesse caso, entre com <b>certificado digital</b> ou procure a <b>Secretaria de Finanças</b> para o cadastro presencial."
      },
      {
        "img": "a08-govbr.webp",
        "alt": "MEI: dá para entrar com a conta gov.br",
        "titulo": "MEI: dá para entrar com a conta gov.br",
        "texto": "O MEI pode clicar em <b>Entrar com gov.br</b>, sem criar senha. Precisa ser conta <b>prata ou ouro</b>."
      }
    ]
  },
  {
    "id": "guia-b",
    "titulo": "2. Configurar o emissor",
    "sub": "Ajustes que você faz antes da primeira nota.",
    "celular": false,
    "base": "Imagens e instruções: Passo a passo: cadastramento e emissão de NFS-e (Sebrae/Receita Federal, fev/2023)",
    "passos": [
      {
        "img": "b01-painel.webp",
        "alt": "Entre e abra as Configurações",
        "titulo": "Entre e abra as Configurações",
        "texto": "Faça login com CPF/CNPJ e senha. No primeiro acesso, abra as <b>Configurações</b> pelos ícones indicados no painel."
      },
      {
        "img": "b02-contato.webp",
        "alt": "Preencha e-mail e telefone",
        "titulo": "Preencha e-mail e telefone",
        "texto": "São os contatos usados nas notas que você emitir."
      },
      {
        "img": "b03-tributos.webp",
        "alt": "Escolha como mostrar o valor aproximado dos tributos",
        "titulo": "Escolha como mostrar o valor aproximado dos tributos",
        "texto": "Marque a opção que se aplica ao seu caso e clique em <b>Salvar</b>."
      },
      {
        "img": "b04-favoritos.webp",
        "alt": "Cadastre seus serviços favoritos",
        "titulo": "Cadastre seus serviços favoritos",
        "texto": "Abra <b>Serviços Favoritos</b> e clique em <b>Novo Serviço Favorito</b>. Obrigatório para quem vai usar a emissão simplificada ou o aplicativo."
      },
      {
        "img": "b05-codigo-servico.webp",
        "alt": "Dê um apelido e escolha o Código de Tributação Nacional",
        "titulo": "Dê um apelido e escolha o Código de Tributação Nacional",
        "texto": "O apelido ajuda você a achar o serviço depois. O <b>Código de Tributação Nacional</b> é a classificação do serviço, igual em todo o Brasil."
      },
      {
        "img": "b06-favorito-salvo.webp",
        "alt": "Serviço favorito cadastrado",
        "titulo": "Serviço favorito cadastrado",
        "texto": "Você pode cadastrar vários serviços favoritos."
      }
    ]
  },
  {
    "id": "guia-c",
    "titulo": "3. Emitir a nota (emissão completa)",
    "sub": "Disponível para todos os prestadores.",
    "celular": false,
    "base": "Imagens e instruções: Passo a passo: cadastramento e emissão de NFS-e (Sebrae/Receita Federal, fev/2023) · Guia do Emissor Público Nacional Web v1.2 (Sistema Nacional NFS-e)",
    "passos": [
      {
        "img": "c01-menu-emissao.webp",
        "alt": "Escolha o tipo de emissão",
        "titulo": "Escolha o tipo de emissão",
        "texto": "No menu de emissão, escolha <b>Emissão Completa</b>. A <b>Emissão Simplificada</b> é para o MEI."
      },
      {
        "img": "c02-competencia.webp",
        "alt": "Informe a data de competência",
        "titulo": "Informe a data de competência",
        "texto": "É a data em que o serviço foi prestado. Deixe <b>desmarcada</b> a opção “Informar série e número da DPS”."
      },
      {
        "img": "c03-prestador.webp",
        "alt": "Confira os seus dados",
        "titulo": "Confira os seus dados",
        "texto": "Marque que você é o <b>Prestador</b>. Os seus dados vêm preenchidos automaticamente pelo cadastro."
      },
      {
        "img": "c04-tomador.webp",
        "alt": "Informe o cliente (tomador)",
        "titulo": "Informe o cliente (tomador)",
        "texto": "Escolha Brasil ou Exterior e digite o CPF ou CNPJ do cliente. O nome aparece sozinho."
      },
      {
        "img": "c05-intermediario.webp",
        "alt": "Intermediário",
        "titulo": "Intermediário",
        "texto": "Na maioria dos casos, marque <b>“Intermediário não informado”</b> e clique em <b>Avançar</b>."
      },
      {
        "img": "c06-servico.webp",
        "alt": "Informe o serviço prestado",
        "titulo": "Informe o serviço prestado",
        "texto": "Informe o município onde o serviço foi prestado, escolha o Código de Tributação Nacional e escreva a descrição do serviço."
      },
      {
        "img": "c07-importar-favorito.webp",
        "alt": "Atalho: importe um serviço favorito",
        "titulo": "Atalho: importe um serviço favorito",
        "texto": "Se já cadastrou o serviço como favorito, é só importar e os campos são preenchidos."
      },
      {
        "img": "c08-valores.webp",
        "alt": "Informe os valores",
        "titulo": "Informe os valores",
        "texto": "Digite o valor do serviço. Na tributação municipal, a maioria dos prestadores marca o regime especial <b>Nenhum</b>."
      },
      {
        "img": "c09-perguntas-iss.webp",
        "alt": "Responda as perguntas sobre o ISS",
        "titulo": "Responda as perguntas sobre o ISS",
        "texto": "Exigibilidade suspensa? Retenção pelo tomador? Benefício municipal? Na maioria dos casos, a resposta é <b>Não</b>."
      },
      {
        "img": "c10-complementares.webp",
        "alt": "Informações complementares e avançar",
        "titulo": "Informações complementares e avançar",
        "texto": "Se precisar, escreva informações complementares. Clique em <b>Avançar</b> para conferir o resumo."
      },
      {
        "img": "c11-nota-gerada.webp",
        "alt": "Confira e emita",
        "titulo": "Confira e emita",
        "texto": "Revise o resumo. Dá para voltar e editar Pessoas, Serviço ou Valores. Clique em <b>Emitir NFS-e</b>. Depois, baixe o PDF (DANFSe) e o XML para enviar ao cliente."
      },
      {
        "img": "c12-simplificada.webp",
        "alt": "MEI: emissão simplificada",
        "titulo": "MEI: emissão simplificada",
        "texto": "Na emissão simplificada, você escolhe um serviço favorito, informa o cliente e o valor, e emite."
      }
    ]
  },
  {
    "id": "guia-d",
    "titulo": "4. Emitir pelo celular (aplicativo NFS-e Mobile)",
    "sub": "Para o MEI. O cadastro no site e os serviços favoritos vêm antes.",
    "celular": true,
    "base": "Imagens e instruções: Passo a passo: cadastramento e emissão de NFS-e (Sebrae/Receita Federal, fev/2023)",
    "passos": [
      {
        "img": "d01-app-login.webp",
        "alt": "Baixe o app e entre",
        "titulo": "Baixe o app e entre",
        "texto": "Baixe o <b>NFS-e Mobile</b> na App Store ou no Google Play e entre com o mesmo login e senha do site."
      },
      {
        "img": "d02-app-menu.webp",
        "alt": "Toque em “Emitir NFS-e”",
        "titulo": "Toque em “Emitir NFS-e”",
        "texto": ""
      },
      {
        "img": "d03-app-form.webp",
        "alt": "Escolha o serviço",
        "titulo": "Escolha o serviço",
        "texto": "O CPF/CNPJ do cliente é opcional. Aparecem os serviços cadastrados como favoritos no site."
      },
      {
        "img": "d04-app-preenchido.webp",
        "alt": "Informe o valor e emita",
        "titulo": "Informe o valor e emita",
        "texto": "Digite o valor do serviço e toque em <b>Emitir NFS-e</b>."
      },
      {
        "img": "d05-app-sucesso.webp",
        "alt": "Nota emitida",
        "titulo": "Nota emitida",
        "texto": "Pronto: a nota foi emitida com sucesso."
      },
      {
        "img": "d06-app-obra.webp",
        "alt": "Serviço de obra?",
        "titulo": "Serviço de obra?",
        "texto": "Em <b>Informações adicionais</b>, informe o endereço da obra ou o número do <b>CNO</b> e o município."
      }
    ]
  },
  {
    "id": "guia-e",
    "titulo": "5. Depois de emitir",
    "sub": "Consultar, corrigir, cancelar e conferir notas recebidas.",
    "celular": false,
    "base": "Imagens e instruções: Guia do Emissor Público Nacional Web v1.2 (Sistema Nacional NFS-e)",
    "passos": [
      {
        "img": "e01-emitidas.webp",
        "alt": "NFS-e emitidas",
        "titulo": "NFS-e emitidas",
        "texto": "Em <b>NFS-e emitidas</b>, cada nota tem um menu com Visualizar, Substituir, Cancelar, Download XML e Download DANFSe."
      },
      {
        "img": "e02-visualizar.webp",
        "alt": "Visualizar a nota",
        "titulo": "Visualizar a nota",
        "texto": "Mostra todos os dados da nota e os eventos ligados a ela, como cancelamento ou substituição."
      },
      {
        "img": "e03-analise-fiscal.webp",
        "alt": "Cancelamento fora do prazo",
        "titulo": "Cancelamento fora do prazo",
        "texto": "Se o cancelamento não for mais permitido, o sistema oferece a <b>Solicitação de Análise Fiscal</b>: informe o motivo e a justificativa. O pedido vai para a Prefeitura analisar."
      },
      {
        "img": "e04-recebidas.webp",
        "alt": "NFS-e recebidas",
        "titulo": "NFS-e recebidas",
        "texto": "Aqui aparecem as notas em que você é o cliente (tomador) ou intermediário."
      },
      {
        "img": "e05-confirmar.webp",
        "alt": "Confirmar uma nota recebida",
        "titulo": "Confirmar uma nota recebida",
        "texto": "Se você reconhece o serviço e concorda com os dados, clique em <b>Confirmar NFS-e</b>."
      },
      {
        "img": "e06-rejeitar.webp",
        "alt": "Rejeitar uma nota recebida",
        "titulo": "Rejeitar uma nota recebida",
        "texto": "Se não reconhece a nota ou discorda dos dados, informe o motivo e clique em <b>Rejeitar NFS-e</b>."
      },
      {
        "img": "e07-consulta-publica.webp",
        "alt": "Consulta pública",
        "titulo": "Consulta pública",
        "texto": "Qualquer pessoa pode conferir uma NFS-e pela <b>chave de acesso</b> ou pelos dados da DPS, no portal nacional."
      }
    ]
  }
];

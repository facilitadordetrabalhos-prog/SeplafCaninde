import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

const MENSAGENS: Record<string, string> = {
  isNotEmpty: 'é obrigatório',
  isDefined: 'é obrigatório',
  isEmail: 'deve ser um e-mail válido',
  isString: 'deve ser um texto',
  isBoolean: 'deve ser verdadeiro ou falso',
  isInt: 'deve ser um número inteiro',
  isNumber: 'deve ser um número',
  isIn: 'tem um valor não permitido',
  matches: 'está em formato inválido',
  maxLength: 'é longo demais',
  minLength: 'é curto demais',
  min: 'é menor que o permitido',
  isArray: 'deve ser uma lista',
  isUrl: 'deve ser um endereço válido',
  isObject: 'deve ser um objeto',
  whitelistValidation: 'não é permitido',
};

const PRIORIDADE = ['whitelistValidation', 'isDefined', 'isNotEmpty', 'isString', 'isBoolean', 'isInt', 'isNumber', 'isEmail', 'isIn'];

function achatar(erros: ValidationError[], prefixo = ''): string[] {
  const out: string[] = [];
  for (const e of erros) {
    const campo = prefixo ? `${prefixo}.${e.property}` : e.property;
    const chaves = Object.keys(e.constraints ?? {});
    if (chaves.length) {
      // Uma mensagem por campo, priorizando "obrigatório" e tipo antes de tamanho/formato.
      const chave = PRIORIDADE.find((p) => chaves.includes(p)) ?? chaves[0];
      out.push(`O campo "${campo}" ${MENSAGENS[chave] ?? 'é inválido'}.`);
    }
    if (e.children?.length) out.push(...achatar(e.children, campo));
  }
  return out;
}

export function criarValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (erros) => new BadRequestException(achatar(erros)),
  });
}

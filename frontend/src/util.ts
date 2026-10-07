import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemErro } from './api';

/** Converte 'YYYY-MM-DD' (sem fuso) ou ISO completo em Date local. */
export function paraData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const so = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (so) return new Date(Number(so[1]), Number(so[2]) - 1, Number(so[3]));
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

export function formatarData(valor: string | null | undefined): string {
  const d = paraData(valor);
  if (!d) return valor ?? '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarDataHora(valor: string | null | undefined): string {
  const d = paraData(valor);
  if (!d) return valor ?? '';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "hoje às 06:00", "ontem às 18:00" ou "02/10/2026 às 06:00". */
export function descreverVerificacao(valor: string | null | undefined): string {
  const d = paraData(valor);
  if (!d) return '';
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dia = new Date(d);
  dia.setHours(0, 0, 0, 0);
  const dif = Math.round((hoje.getTime() - dia.getTime()) / 864e5);
  if (dif === 0) return `hoje às ${hora}`;
  if (dif === 1) return `ontem às ${hora}`;
  return `${formatarData(valor)} às ${hora}`;
}

export function diasAte(valor: string): number | null {
  const d = paraData(valor);
  if (!d) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoje.getTime()) / 864e5);
}

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export function diaMes(valor: string): { dia: string; mes: string } {
  const d = paraData(valor);
  if (!d) return { dia: '', mes: '' };
  return { dia: String(d.getDate()).padStart(2, '0'), mes: MESES[d.getMonth()] };
}

export const ROTULO_PUBLICO: Record<string, string> = {
  todos: 'Geral',
  mei: 'MEI / Simples',
  empresa: 'Empresas',
  servico: 'Prestador de serviço',
  contador: 'Contadores',
  cidadao: 'Cidadão',
};

export const ROTULO_TIPO_NOTICIA: Record<string, string> = {
  noticia: 'Notícia',
  comunicado: 'Comunicado oficial',
  legislacao: 'Legislação',
  video: 'Vídeo',
  material: 'Guia / cartilha',
};

/** Links dos temas do evento guardam ids de telas do protótipo; aqui viram rotas reais. */
const ROTAS_PROTOTIPO: Record<string, string> = {
  inicio: '/',
  entenda: '/reforma/entenda',
  cronograma: '/reforma/cronograma',
  noticias: '/reforma/noticias',
  artigo: '/reforma/guias/simples-puro-ou-hibrido',
  faq: '/reforma/perguntas',
  videos: '/reforma/videos',
  servicos: '/servicos',
  'nfse-inicio': '/nfse',
  'nfse-acesso': '/nfse/primeiro-acesso',
  'nfse-emitir': '/nfse/emitir',
  'nfse-guia': '/nfse/guia-ilustrado',
  'nfse-depois': '/nfse/depois-de-emitir',
  'nfse-problemas': '/nfse/problemas',
  'nfse-materiais': '/nfse/materiais',
};

export function rotaDoTema(rota: string): string {
  if (!rota) return '/';
  if (/^https?:\/\//.test(rota) || rota.startsWith('/')) return rota;
  return ROTAS_PROTOTIPO[rota] ?? '/';
}

export function ehExterno(url: string) {
  return /^https?:\/\//.test(url);
}

/** Carrega dados da API com estado de carregamento/erro, sem nunca lançar para a tela. */
export function useApi<T>(carregar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const ref = useRef(carregar);
  ref.current = carregar;
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    ref
      .current()
      .then((d) => {
        if (!vivo) return;
        setDados(d);
        setErro(null);
      })
      .catch((e) => {
        if (!vivo) return;
        setErro(mensagemErro(e));
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { dados, erro, carregando, recarregar, setDados };
}

export function lerLocal<T>(chave: string, padrao: T): T {
  try {
    const t = localStorage.getItem(chave);
    return t ? (JSON.parse(t) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravarLocal(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento indisponível */
  }
}

/** Aceita links de tema como [{rotulo, rota}], [[rota, rotulo]] ou texto JSON. */
export function normalizarLinks(links: unknown): { rotulo: string; rota: string }[] {
  let v = links;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];
  return v
    .map((l) => {
      if (Array.isArray(l)) return { rota: String(l[0] ?? ''), rotulo: String(l[1] ?? l[0] ?? '') };
      if (l && typeof l === 'object') {
        const o = l as Record<string, unknown>;
        return { rota: String(o.rota ?? ''), rotulo: String(o.rotulo ?? o.rota ?? '') };
      }
      return { rota: '', rotulo: '' };
    })
    .filter((l) => l.rota);
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { AvisoApi, Banner, Carregando, Trilha } from '../../components/Comuns';
import { ConsultaProtocolo, FormDuvida } from '../../components/FormDuvida';
import { HtmlConteudo } from '../../components/HtmlConteudo';
import { formatarData, ROTULO_PUBLICO, useApi } from '../../util';

const FILTROS: [string, string][] = [
  ['todos', 'Todos'],
  ['cidadao', 'Cidadão'],
  ['mei', 'MEI / Simples'],
  ['empresa', 'Empresas'],
  ['servico', 'Prestador de serviço'],
  ['contador', 'Contadores'],
];

export default function Perguntas() {
  const [params] = useSearchParams();
  const [busca, setBusca] = useState(params.get('q') ?? '');
  const [termo, setTermo] = useState(busca);
  const [publico, setPublico] = useState('todos');

  // a busca do menu lateral chega por ?q=
  useEffect(() => {
    const q = params.get('q');
    if (q !== null) {
      setBusca(q);
      setTermo(q);
    }
  }, [params]);

  // espera o usuário parar de digitar antes de consultar a API
  useEffect(() => {
    const t = window.setTimeout(() => setTermo(busca.trim()), 300);
    return () => window.clearTimeout(t);
  }, [busca]);

  const faq = useApi(() => api.faq({ publico: publico === 'todos' ? undefined : publico, q: termo || undefined }), [publico, termo]);
  const lista = faq.dados ?? [];

  return (
    <>
      <Banner
        icone="pergunta"
        titulo="Perguntas frequentes"
        texto="Respostas da equipe da Secretaria de Finanças, sempre indicando a base oficial. Não encontrou a sua? Envie pelo formulário."
      />
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Perguntas frequentes']} />

      <div className="duas">
        <div>
          <form className="busca-grande" role="search" onSubmit={(e) => e.preventDefault()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              aria-label="Buscar nas perguntas frequentes"
              placeholder="Digite sua dúvida, ex.: MEI, Simples, nota fiscal, ISS…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </form>
          <div className="filtros" role="group" aria-label="Filtrar por público">
            {FILTROS.map(([f, r]) => (
              <button key={f} className={`chip${publico === f ? ' ativo' : ''}`} aria-pressed={publico === f} onClick={() => setPublico(f)}>
                {r}
              </button>
            ))}
          </div>

          {faq.carregando && !faq.dados ? (
            <Carregando texto="Carregando perguntas…" />
          ) : faq.erro ? (
            <AvisoApi mensagem={faq.erro}>
              Não foi possível carregar as perguntas frequentes agora. Você ainda pode enviar a sua dúvida pelo formulário.
            </AvisoApi>
          ) : lista.length === 0 ? (
            <p className="sub">Nenhuma pergunta encontrada. Envie a sua pelo formulário.</p>
          ) : (
            lista.map((f, i) => (
              <details className="faq" key={f.id} open={i === 0}>
                <summary>
                  {f.pergunta}
                  <span className="tag lar">{ROTULO_PUBLICO[f.publico] ?? f.publico}</span>
                </summary>
                <div className="resp">
                  <HtmlConteudo html={f.resposta} />
                  {f.baseOficial && <div className="base">Base oficial: {f.baseOficial}</div>}
                  {f.atualizadoEm && (
                    <div className="rodape">
                      <span>Atualizado em {formatarData(f.atualizadoEm)}</span>
                    </div>
                  )}
                </div>
              </details>
            ))
          )}
        </div>

        <div>
          <FormDuvida titulo="Envie sua dúvida" />
          <ConsultaProtocolo />
        </div>
      </div>
    </>
  );
}

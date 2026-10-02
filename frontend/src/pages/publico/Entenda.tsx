import { Link } from 'react-router-dom';
import { Banner, Trilha } from '../../components/Comuns';

const ANOS: { ano: string; novo: number; legenda: string }[] = [
  { ano: '2026', novo: 0, legenda: 'teste: CBS 0,9% · IBS 0,1%' },
  { ano: '2027', novo: 0, legenda: 'CBS integral · fim de PIS/Cofins' },
  { ano: '2028', novo: 0, legenda: 'ISS integral' },
  { ano: '2029', novo: 10, legenda: 'ISS e ICMS a 90%' },
  { ano: '2030', novo: 20, legenda: 'a 80%' },
  { ano: '2031', novo: 30, legenda: 'a 70%' },
  { ano: '2032', novo: 40, legenda: 'a 60%' },
  { ano: '2033', novo: 100, legenda: 'ISS e ICMS extintos' },
];

export default function Entenda() {
  return (
    <>
      <Banner
        icone="livro"
        titulo="Entenda a Reforma Tributária do consumo"
        texto="Guia explicativo para cidadãos e empresas. Cada bloco traz o artigo da lei em que se baseia."
      />
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Entenda a reforma']} />

      <div className="bloco">
        <h3>1. Cinco tributos viram dois (IVA dual)</h3>
        <p className="sub">Os tributos sobre o consumo são substituídos por uma única regra, igual em todo o país.</p>
        <div className="iva">
          <div className="antigos">
            <span>ISS <small>· municipal</small></span>
            <span>ICMS <small>· estadual</small></span>
            <span>PIS <small>· federal</small></span>
            <span>Cofins <small>· federal</small></span>
            <span>IPI <small>· federal</small></span>
          </div>
          <div className="seta">➜</div>
          <div className="novos">
            <div className="cbs">
              <b>CBS</b>
              <small>
                Contribuição sobre Bens e Serviços · <b style={{ display: 'inline', fontSize: 'inherit' }}>União</b>
                <br />
                substitui PIS e Cofins
              </small>
            </div>
            <div className="ibs">
              <b>IBS</b>
              <small>
                Imposto sobre Bens e Serviços · <b style={{ display: 'inline', fontSize: 'inherit' }}>Estados e Municípios</b>
                <br />
                substitui ICMS e ISS
              </small>
            </div>
            <div className="is">
              <b style={{ display: 'inline', fontSize: 'inherit' }}>Imposto Seletivo</b> · cobrado sobre produtos prejudiciais à saúde ou ao
              meio ambiente. O IPI é zerado, exceto para produtos que também são fabricados na Zona Franca de Manaus.
            </div>
          </div>
        </div>
        <div className="base">Base oficial: EC 132/2023 · LC 214/2025</div>
      </div>

      <div className="bloco">
        <h3>2. Os pilares da nova tributação</h3>
        <p className="sub">&nbsp;</p>
        <div className="pilares">
          <div className="pilar">
            <h4>Cobrança no destino</h4>
            <p>
              O IBS passa a pertencer ao município onde o bem ou serviço é consumido, e não mais onde fica a sede da empresa. Isso
              enfraquece a guerra fiscal entre municípios.
            </p>
            <p style={{ marginTop: 8, fontSize: 12.5, color: 'var(--tinta-fraca)' }}>
              A mudança na divisão da arrecadação entre municípios é gradual, de 2029 a 2077.
            </p>
          </div>
          <div className="pilar">
            <h4>Imposto “por fora” e visível na nota</h4>
            <p>O tributo deixa de vir embutido no preço. A nota mostra quanto foi pago de IBS e de CBS.</p>
            <div className="nota-fiscal">
              Produto ........ R$ 100,00
              <br />
              <b>CBS</b> ............ R$ X,XX (Y%)
              <br />
              <b>IBS</b> ............ R$ X,XX (Y%)
            </div>
          </div>
          <div className="pilar">
            <h4>Cadastro único: CPF, CNPJ e CIB</h4>
            <p>
              Pessoas físicas são identificadas pelo CPF, empresas pelo CNPJ e imóveis urbanos e rurais pelo <b>CIB</b> (Cadastro
              Imobiliário Brasileiro). Os dados são compartilhados entre União, estados e municípios.
            </p>
            <div className="base" style={{ marginTop: 8 }}>LC 214/2025, art. 59</div>
          </div>
        </div>
      </div>

      <div className="bloco">
        <h3>3. Simples Nacional, MEI e nanoempreendedor</h3>
        <p className="sub">&nbsp;</p>
        <div className="pilares">
          <div className="pilar">
            <h4>Simples e MEI continuam</h4>
            <p>Os pequenos negócios mantêm o recolhimento unificado no DAS, com simplicidade e carga favorecida.</p>
          </div>
          <div className="pilar">
            <h4>Opção “híbrida”</h4>
            <p>
              Empresa do Simples pode recolher IBS e CBS por fora do DAS, no regime regular, para gerar crédito integral para os clientes
              que são empresas.
            </p>
            <Link className="botao peq vazio" to="/reforma/guias/simples-puro-ou-hibrido" style={{ marginTop: 10 }}>
              Ver o guia e os prazos
            </Link>
          </div>
          <div className="pilar">
            <h4>Nanoempreendedor</h4>
            <p>
              Pessoa física com receita bruta abaixo de 50% do limite do MEI, e que não aderiu ao MEI, não é contribuinte de IBS e CBS.
            </p>
            <div className="base" style={{ marginTop: 8 }}>LC 214/2025, art. 26</div>
          </div>
        </div>
      </div>

      <div className="bloco">
        <h3>4. Cashback: devolução para famílias de baixa renda</h3>
        <p className="sub">
          Para famílias inscritas no CadÚnico com renda de até meio salário mínimo por pessoa, CPF regular e residência no Brasil.
        </p>
        <div className="cashback">
          <div className="cb">
            <div className="pct">
              <div><b>100%</b><small>da CBS</small></div>
              <div><b>20%</b><small>do IBS</small></div>
            </div>
            <h4>Serviços essenciais</h4>
            <p>Botijão de gás de até 13 kg, energia elétrica, água, esgoto, gás canalizado e telecomunicações.</p>
          </div>
          <div className="cb">
            <div className="pct">
              <div><b>20%</b><small>da CBS</small></div>
              <div><b>20%</b><small>do IBS</small></div>
            </div>
            <h4>Demais compras</h4>
            <p>Percentual mínimo de devolução nas outras compras de bens e serviços.</p>
          </div>
        </div>
        <div className="base">Base oficial: LC 214/2025, arts. 112 a 118 (percentuais no art. 118)</div>
      </div>

      <div className="bloco">
        <h3>5. Transição gradual: 2026 a 2033</h3>
        <p className="sub">Peso do ISS e do ICMS (cinza) frente ao IBS (laranja) em cada ano. A CBS vale integralmente desde 2027.</p>
        <div className="grafico" role="img" aria-label="Gráfico da transição do ISS e ICMS para o IBS de 2026 a 2033">
          {ANOS.map((a) => (
            <div className="ano" key={a.ano}>
              <div className="barra">
                {a.novo > 0 && <i className="novo" style={{ height: `${a.novo}%` }} />}
                {a.novo < 100 && <i className="antigo" style={{ height: `${100 - a.novo}%` }} />}
              </div>
              <b>{a.ano}</b>
              <small>{a.legenda}</small>
            </div>
          ))}
        </div>
        <div className="legenda">
          <span><i style={{ background: '#8a8378' }} />ISS / ICMS</span>
          <span><i style={{ background: 'var(--laranja-vivo)' }} />IBS</span>
        </div>
        <div className="base">
          Base oficial: EC 132/2023 · LC 214/2025 · <Link to="/reforma/cronograma">ver o cronograma detalhado</Link>
        </div>
      </div>
    </>
  );
}

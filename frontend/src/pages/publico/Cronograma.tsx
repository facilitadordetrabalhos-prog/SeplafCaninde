import { Banner, Trilha } from '../../components/Comuns';
import { MARCOS } from '../../conteudo/cronograma';

export default function Cronograma() {
  return (
    <>
      <Banner
        icone="calendario"
        titulo="Cronograma e prazos"
        texto="De 2026 a 2033 os tributos atuais dão lugar ao IBS (estados e municípios) e à CBS (União). Em cada ano, mostramos o que muda no ISS de Canindé."
      />
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Cronograma e prazos']} />
      <div className="crono">
        {MARCOS.map((m) => (
          <div className={`marco${m.agora ? ' agora' : ''}`} key={m.ano}>
            <h3>
              {m.ano} {m.etiqueta && <span className="tag espera">{m.etiqueta}</span>}
            </h3>
            <ul>
              {m.itens.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="iss">
              <b>ISS em Canindé:</b> {m.iss}
            </div>
            {m.base && <div className="base">Base oficial: {m.base}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

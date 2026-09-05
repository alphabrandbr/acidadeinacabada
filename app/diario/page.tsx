import type { Metadata } from "next";
import portarias from "@/portarias.json";
import { AssinaturaBoletim } from "@/app/componentes/AssinaturaBoletim";

type Publicacao = {
  numero: number;
  rotulo?: string;
  data: string;
  titulo: string;
  paragrafos: string[];
};

export const metadata: Metadata = {
  title: "Diário Oficial — A Cidade Inacabada",
  description: "Arquivo das portarias do Departamento de Términos e Aberturas.",
};

const fmtData = (iso: string) =>
  new Date(iso + "T12:00:00-03:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default function Diario() {
  // ordem cronológica: Ato de Instalação primeiro, depois as portarias em sequência
  const todas = portarias as Publicacao[];
  const lista = [...todas].sort((a, b) => a.numero - b.numero);
  const indice = lista;

  return (
    <>
      <div className="painel">
        Departamento de Términos e Aberturas &nbsp;·&nbsp; Diário Oficial
      </div>
      <main className="diario">
        <div className="cab">
          <div className="org">Boletim do Departamento</div>
          <div className="tit">Diário Oficial</div>
        </div>

        <div className="diario-grid">
          <aside className="diario-menu">
            <div className="menu-tit">Publicações</div>
            <nav>
              {indice.map((p) => (
                <a key={p.numero} href={`#p-${p.numero}`}>
                  <span className="rot">{p.rotulo ?? `Portaria nº ${p.numero}`}</span>
                  <span className="tt">{p.titulo}</span>
                </a>
              ))}
            </nav>
            <AssinaturaBoletim />
          </aside>

          <div className="diario-corpo">
        {lista.map((p) => (
          <article className="portaria" key={p.numero} id={`p-${p.numero}`}>
            <header>
              <span className="num">{p.rotulo ?? `Portaria nº ${p.numero}`}</span>
              <span className="data">{fmtData(p.data)}</span>
            </header>
            <h2>{p.titulo}</h2>
            {p.paragrafos.map((par, i) => (
              <p key={i}>{par}</p>
            ))}
          </article>
        ))}

          </div>
        </div>

        <p className="voltar"><a href="/">← Voltar à página do livro</a></p>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listarInscritos } from "@/lib/db";
import { TIRAGEM } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fila dos 42 · uso interno", robots: { index: false, follow: false } };

const pad = (n: number) => String(n).padStart(3, "0");
const fmtData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function Lista({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const { senha = "" } = await searchParams;
  const esperada = process.env.LISTA_SENHA;
  if (!esperada || senha !== esperada) notFound();

  const inscritos = await listarInscritos();
  const dentro = inscritos.filter((i) => i.posicao <= TIRAGEM).length;

  return (
    <>
      <div className="painel">Departamento de Términos e Aberturas &nbsp;·&nbsp; Setor de Arquivo &nbsp;·&nbsp; uso interno</div>
      <main className="relatorio">
        <div className="cabecalho">
          <div className="org">Relatório de requerimentos</div>
          <div className="tit">Fila do livro físico</div>
          <div className="lote">
            {pad(dentro)} / {pad(TIRAGEM)} no lote
            {inscritos.length > TIRAGEM && <> · {inscritos.length - TIRAGEM} na lista do segundo lote</>}
          </div>
        </div>

        <div className="acoes">
          <a className="botao" href={`/api/lista?senha=${encodeURIComponent(senha)}`}>Baixar CSV</a>
          <a className="botao escuro" href="/">Voltar à página</a>
        </div>

        {inscritos.length === 0 ? (
          <p className="vazio">Nenhum requerimento protocolado ainda.</p>
        ) : (
          <div className="tabela-scroll">
            <table>
              <thead>
                <tr><th>Nº</th><th>Nome</th><th>E-mail</th><th>Protocolado em</th></tr>
              </thead>
              <tbody>
                {inscritos.map((i) => (
                  <tr key={i.id} className={i.posicao > TIRAGEM ? "excedente" : undefined}>
                    <td className="pos">{pad(i.posicao)}</td>
                    <td>{i.nome || <em style={{ color: "var(--cinza)" }}>(não informado)</em>}</td>
                    <td><a href={`mailto:${i.email}`}>{i.email}</a></td>
                    <td className="data">{fmtData(i.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

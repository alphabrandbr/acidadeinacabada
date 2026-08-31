"use client";

import { useState, type FormEvent } from "react";
import { TIRAGEM } from "@/lib/config";

type Props = {
  /** Total já protocolado; null quando o banco ainda não está configurado. */
  totalInicial: number | null;
};

type Estado =
  | { fase: "aberto"; erro?: string }
  | { fase: "enviando" }
  | { fase: "protocolado"; posicao: number; jaConstava: boolean };

const pad = (n: number) => String(n).padStart(3, "0");

export function Contador({ total }: { total: number | null }) {
  if (total === null) return null;
  const completo = total >= TIRAGEM;
  const pct = Math.min(100, Math.round((total / TIRAGEM) * 100));
  return (
    <div className={`contador${completo ? " completo" : ""}`} aria-live="polite">
      <div className="numeros">
        <b>{pad(total)}</b> <small>/ {pad(TIRAGEM)}</small>
      </div>
      <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={TIRAGEM} aria-valuenow={Math.min(total, TIRAGEM)}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="legenda">
        {completo
          ? <>Lote completo · novos requerimentos<br />entram na lista do segundo lote</>
          : <>requerimentos protocolados<br />{TIRAGEM - total} exemplares ainda sem destinatário</>}
      </div>
    </div>
  );
}

export function FormReserva({ totalInicial }: Props) {
  const [total, setTotal] = useState<number | null>(totalInicial);
  const [estado, setEstado] = useState<Estado>({ fase: "aberto" });

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nome = (form.elements.namedItem("nome") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    setEstado({ fase: "enviando" });

    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "falha");
      if (typeof data.total === "number") setTotal(data.total);
      setEstado({ fase: "protocolado", posicao: data.posicao, jaConstava: Boolean(data.jaConstava) });
    } catch {
      setEstado({
        fase: "aberto",
        erro: "O guichê está fechado no momento. Tente de novo em alguns instantes.",
      });
    }
  }

  const enviando = estado.fase === "enviando";

  return (
    <form className="form-card" id="form" onSubmit={enviar}>
      <div className="cabecalho">
        <div className="org">Departamento de Términos e Aberturas</div>
        <div className="tit">Requerimento de Reserva</div>
        <div className="lote">Livro físico · lote único · {TIRAGEM} exemplares</div>
      </div>

      <Contador total={total} />

      {estado.fase === "protocolado" ? (
        <p className="msg ok">
          {estado.jaConstava ? "REQUERIMENTO JÁ CONSTAVA." : "REQUERIMENTO PROTOCOLADO."}
          <br />
          Protocolo nº {pad(estado.posicao)}
          {estado.posicao > TIRAGEM ? " · lista do segundo lote." : " · consta em nossos arquivos."}
          <br />
          O Departamento avisa quando o lote ficar pronto.
        </p>
      ) : (
        <>
          <label htmlFor="nome">Nome</label>
          <input type="text" id="nome" name="nome" autoComplete="name" required disabled={enviando} />

          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" autoComplete="email" required disabled={enviando} />

          <button className="botao" type="submit" disabled={enviando}>
            {enviando ? "Protocolando..." : "Entrar na fila do livro físico"}
          </button>

          {estado.fase === "aberto" && estado.erro && <p className="msg erro">{estado.erro}</p>}
        </>
      )}

      <div className="rodape-form">
        O requerimento não gera cobrança nem compromisso de compra.<br />
        O Departamento entra em contato uma única vez, quando o lote ficar pronto,<br />
        na ordem em que os requerimentos foram protocolados.<br />
        Não há mala direta. Não há penalidade. Não há pegadinha.
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";

/** Caixinha de assinatura do boletim, na lateral do Diário Oficial. */
export function AssinaturaBoletim() {
  const [estado, setEstado] = useState<"aberto" | "enviando" | "ok" | "ja" | "erro">("aberto");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value.trim();
    setEstado("enviando");
    try {
      const r = await fetch("/api/boletim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "falha");
      setEstado(data.jaAssinava ? "ja" : "ok");
    } catch {
      setEstado("erro");
    }
  }

  if (estado === "ok" || estado === "ja") {
    return (
      <div className="diario-assinar">
        <div className="menu-tit">Assinatura</div>
        <p className="assinado">
          {estado === "ja" ? "ESTA ASSINATURA JÁ CONSTAVA." : "ASSINATURA PROTOCOLADA."}
          <br />
          As próximas portarias chegam por e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="diario-assinar">
      <div className="menu-tit">Assinatura</div>
      <p className="chamada">Receba as portarias por e-mail, no dia em que forem publicadas.</p>
      <form onSubmit={enviar}>
        <input
          type="email"
          name="email"
          placeholder="seu e-mail"
          required
          disabled={estado === "enviando"}
          aria-label="Seu e-mail"
        />
        <button className="botao" type="submit" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Protocolando..." : "Assinar o Diário"}
        </button>
      </form>
      {estado === "erro" && <p className="erro">O guichê está fechado. Tente de novo.</p>}
    </div>
  );
}

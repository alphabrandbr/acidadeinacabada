"use client";

import { LINK_AMAZON, PRECO_EBOOK } from "@/lib/config";

/** Botão do ebook. Com LINK_AMAZON vazio, fica apagado e leva ao formulário. */
export function BotaoAmazon() {
  if (LINK_AMAZON) {
    return (
      <a className="botao" href={LINK_AMAZON} target="_blank" rel="noopener">
        Compre agora na Amazon · {PRECO_EBOOK}
      </a>
    );
  }

  return (
    <a
      className="botao apagado"
      href="#form"
      aria-disabled="true"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("nome")?.focus({ preventScroll: true });
      }}
    >
      Compre agora na Amazon · em liberação
    </a>
  );
}

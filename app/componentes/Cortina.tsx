"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sala de espera: cobre a página por ~5s na primeira visita da sessão, com
 * contador regressivo. No fim (ou num clique), a cortina fecha em círculo —
 * a portinhola da máquina de lavar — e o site entra girando como um tambor
 * que desacelera (classe "lavando" no <html>, animação no .palco).
 * Quem já foi atendido na aba nem a vê (script no layout marca o <html>
 * antes da primeira pintura). Sem JS, o fade tardio do CSS resolve.
 */
export function Cortina({ senha }: { senha: number }) {
  const [fase, setFase] = useState<"espera" | "saindo" | "fim">("espera");
  const [seg, setSeg] = useState(5);
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const iv = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  function atendido() {
    if (faseRef.current !== "espera") return;
    clearInterval(iv.current);
    timers.current.forEach(clearTimeout);
    try { sessionStorage.setItem("dta-atendido", "1"); } catch {}
    const html = document.documentElement;
    html.setAttribute("data-atendido", "1");
    html.classList.add("lavando");
    setFase("saindo");
    timers.current = [
      setTimeout(() => setFase("fim"), 850),
      setTimeout(() => html.classList.remove("lavando"), 1800),
    ];
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dta-atendido")) { setFase("fim"); return; }
    } catch {}
    iv.current = setInterval(() => setSeg((s) => Math.max(1, s - 1)), 1000);
    timers.current = [setTimeout(atendido, 5400)];
    return () => {
      clearInterval(iv.current);
      timers.current.forEach(clearTimeout);
      document.documentElement.classList.remove("lavando");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fase === "fim") return null;

  return (
    <div
      className={`cortina${fase === "saindo" ? " cortina-saindo" : ""}`}
      id="cortina"
      role="status"
      aria-label="Aguardando atendimento"
      onClick={atendido}
    >
      <div>
        <div className="cortina-org">Departamento de Términos e Aberturas · Guichê 08</div>
        <div className="cortina-rotulo">sua senha</div>
        <div className="cortina-senha">{String(senha).padStart(3, "0")}</div>
        <div className="cortina-linha">Um momento · aguardando atendimento...</div>
        <div className="cortina-linha demora">Você é o próximo da fila <span className="pisca">▮</span></div>
        <div className="cortina-conta">atendimento em <b>{seg}</b>s</div>
      </div>
    </div>
  );
}

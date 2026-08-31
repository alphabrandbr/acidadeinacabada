"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sala de espera: cobre a página por ~5s na primeira visita da sessão,
 * com contador regressivo. Some no fim, num clique, ou nem aparece se a
 * pessoa já foi atendida nesta aba (sessionStorage). Renderiza no servidor
 * já visível (sem flash); se o JS falhar, o fade-out do CSS resolve.
 */
export function Cortina({ senha }: { senha: number }) {
  const [visivel, setVisivel] = useState(true);
  const [seg, setSeg] = useState(5);
  const timers = useRef<{ iv?: ReturnType<typeof setInterval>; to?: ReturnType<typeof setTimeout> }>({});

  function atendido() {
    clearInterval(timers.current.iv);
    clearTimeout(timers.current.to);
    try { sessionStorage.setItem("dta-atendido", "1"); } catch {}
    setVisivel(false);
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dta-atendido")) { setVisivel(false); return; }
    } catch {}
    timers.current.iv = setInterval(() => setSeg((s) => Math.max(1, s - 1)), 1000);
    timers.current.to = setTimeout(atendido, 5600);
    return () => { clearInterval(timers.current.iv); clearTimeout(timers.current.to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visivel) return null;

  return (
    <div className="cortina" id="cortina" role="status" aria-label="Aguardando atendimento" onClick={atendido}>
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

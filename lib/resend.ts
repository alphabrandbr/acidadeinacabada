/**
 * Integração opcional com o Resend: guarda o contato numa audiência e
 * avisa o autor por e-mail. Nunca derruba o protocolo se falhar.
 */
const RESEND = "https://api.resend.com";

export async function registrarNoResend(nome: string, email: string, posicao: number) {
  const { RESEND_API_KEY, RESEND_AUDIENCE_ID, AVISO_PARA, AVISO_DE } = process.env;
  if (!RESEND_API_KEY) return;

  const auth = {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (RESEND_AUDIENCE_ID) {
    const partes = nome.split(/\s+/).filter(Boolean);
    try {
      const r = await fetch(`${RESEND}/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          email,
          first_name: partes[0] || "",
          last_name: partes.slice(1).join(" "),
          unsubscribed: false,
        }),
      });
      if (!r.ok) {
        const detalhe = await r.text();
        if (!/already exists|duplicate/i.test(detalhe)) {
          console.error("resend contacts:", r.status, detalhe);
        }
      }
    } catch (err) {
      console.error("resend contacts (rede):", err);
    }
  }

  if (AVISO_PARA && AVISO_DE) {
    try {
      await fetch(`${RESEND}/emails`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          from: AVISO_DE,
          to: [AVISO_PARA],
          subject: `Novo requerimento protocolado · nº ${String(posicao).padStart(3, "0")}: ${nome || email}`,
          text: `DEPARTAMENTO DE TERMINOS E ABERTURAS
Setor de Notificacoes

Consta novo requerimento na fila do livro fisico.

Protocolo: ${String(posicao).padStart(3, "0")}
Nome:      ${nome || "(nao informado)"}
E-mail:    ${email}
Data:      ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

Otoniel, do Departamento`,
        }),
      });
    } catch (err) {
      console.error("aviso ao autor:", err);
    }
  }
}

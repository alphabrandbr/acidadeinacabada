#!/usr/bin/env node
/**
 * Boletim do Departamento: envia uma portaria (de portarias.json) por e-mail
 * para todo mundo que está na fila do livro físico.
 *
 * SEM a flag --enviar ele só mostra quem receberia (ensaio, não manda nada).
 *
 * Uso:
 *   node --env-file=.env.local scripts/enviar-portaria.mjs 1            # ensaio
 *   node --env-file=.env.local scripts/enviar-portaria.mjs 1 --enviar   # manda de verdade
 *   node --env-file=.env.local scripts/enviar-portaria.mjs 1 --teste    # manda só pra contato@marcelinho.com.br
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DE = 'Otoniel, do Departamento <departamento@acidadeinacabada.com.br>';
const RESPONDER_PARA = "marcelinho.eu@gmail.com";

const numero = parseInt(process.argv[2], 10);
const enviar = process.argv.includes("--enviar");
const teste = process.argv.includes("--teste");
if (!numero) {
  console.error("Uso: node --env-file=.env.local scripts/enviar-portaria.mjs <numero> [--enviar | --teste]");
  process.exit(1);
}

const portarias = JSON.parse(readFileSync(join(raiz, "portarias.json"), "utf8"));
const p = portarias.find((x) => x.numero === numero);
if (!p) { console.error(`Portaria nº ${numero} não existe em portarias.json`); process.exit(1); }

const chave = (process.env.RESEND_API_KEY ?? "").trim();
if (!chave && (enviar || teste)) { console.error("RESEND_API_KEY ausente no .env.local"); process.exit(1); }

const num3 = String(p.numero).padStart(3, "0");
const assunto = `Portaria nº ${p.numero} — ${p.titulo}`;
const html = `<div style="background:#f6efe0;padding:24px 12px;font-family:Georgia,'Times New Roman',serif;color:#241f1b">
  <div style="max-width:600px;margin:0 auto;background:#fdfaf2;border:1px solid #ded2bb;padding:28px 32px 32px">
    <div style="text-align:center;border-bottom:1px solid #ded2bb;padding-bottom:14px;margin-bottom:24px;font-family:'Courier New',Courier,monospace">
      <div style="font-size:11px;letter-spacing:2px;color:#8a8178;text-transform:uppercase">Departamento de Términos e Aberturas</div>
      <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-top:6px">Boletim do Departamento</div>
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8c2b2b;margin-top:9px">Portaria nº ${num3}</div>
    </div>
    <p style="margin:0 0 18px;font-family:'Courier New',Courier,monospace;font-size:15px;letter-spacing:.5px"><strong>${p.titulo}</strong></p>
    ${p.paragrafos.map((t) => `<p style="margin:0 0 16px;line-height:1.65">${t}</p>`).join("\n    ")}
    <p style="margin:8px 0 0;font-family:'Courier New',Courier,monospace;font-size:13px;color:#8a8178">&mdash; Otoniel, do Departamento</p>
    <div style="border-top:1px solid #ded2bb;margin-top:26px;padding-top:14px;font-size:12px;color:#8a8178;line-height:1.6">
      Você recebe este boletim porque consta na fila dos 42, em
      <a href="https://acidadeinacabada.com.br" style="color:#8a8178">acidadeinacabada.com.br</a>.
      Para não receber mais, é só responder avisando.
    </div>
  </div>
</div>`;
const texto = `DEPARTAMENTO DE TÉRMINOS E ABERTURAS\nBoletim do Departamento · Portaria nº ${num3}\n\n${p.titulo}\n\n${p.paragrafos.join("\n\n")}\n\n— Otoniel, do Departamento\n\nVocê recebe este boletim porque consta na fila dos 42 (acidadeinacabada.com.br). Para não receber mais, é só responder avisando.`;

let destinatarios;
if (teste) {
  destinatarios = [{ nome: "Marcelinho (teste)", email: "contato@marcelinho.com.br" }];
} else {
  const sql = neon(process.env.DATABASE_URL);
  destinatarios = await sql`SELECT nome, email FROM fila_impresso ORDER BY id`;
}

console.log(`Portaria nº ${p.numero} — ${p.titulo}`);
console.log(`Destinatários (${destinatarios.length}):`);
for (const d of destinatarios) console.log(`  ${d.nome}  <${d.email}>`);

if (!enviar && !teste) {
  console.log("\nENSAIO — nada foi enviado. Para mandar de verdade: acrescente --enviar");
  process.exit(0);
}

const lote = destinatarios.map((d) => ({
  from: DE, to: [d.email], reply_to: RESPONDER_PARA, subject: assunto, html, text: texto,
}));
let ok = 0;
for (let i = 0; i < lote.length; i += 50) {
  const r = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify(lote.slice(i, i + 50)),
  });
  const resp = await r.json();
  if (r.ok) ok += resp.data.length;
  else console.error("Falha no lote:", JSON.stringify(resp));
}
console.log(`\n✓ ${ok} de ${lote.length} enviados.`);

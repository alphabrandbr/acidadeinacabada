#!/usr/bin/env node
/**
 * Envia o e-mail de confirmação de reserva (template emails/confirmacao-reserva.html)
 * pelo Resend, do remetente departamento@acidadeinacabada.com.br.
 * Busca o inscrito na fila pelo número do protocolo, recusa reenvio para quem
 * já recebeu (a menos que use --de-novo) e marca o envio no banco.
 *
 * Uso:
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs --teste
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs <protocolo> [tratamento] [--de-novo]
 *
 * Exemplos:
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs 1
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs 5 Prezada
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.resend.com";
const DE = 'Otoniel, do Departamento <departamento@acidadeinacabada.com.br>';

const chave = (process.env.RESEND_API_KEY ?? "").trim();
if (!chave) {
  console.error("RESEND_API_KEY ausente. Rode com: node --env-file=.env.local scripts/enviar-confirmacao.mjs ...");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const teste = process.argv.includes("--teste");
const deNovo = process.argv.includes("--de-novo");

let numero, nome, email, tratamento, assunto;
if (teste) {
  numero = "016"; nome = "Marcelinho"; email = "contato@marcelinho.com.br"; tratamento = "Prezado";
  assunto = `[TESTE — via Resend] Requerimento protocolado — nº ${numero}`;
} else {
  const protocolo = parseInt(args[0], 10);
  tratamento = args[1] ?? "Olá";
  if (!protocolo) {
    console.error("Uso: node --env-file=.env.local scripts/enviar-confirmacao.mjs <protocolo> [tratamento] [--de-novo]");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const fila = await sql`
    SELECT ROW_NUMBER() OVER (ORDER BY id)::int AS pos, nome, email, confirmado_em::text AS confirmado_em
    FROM fila_impresso ORDER BY id`;
  const pessoa = fila.find((p) => p.pos === protocolo);
  if (!pessoa) { console.error(`Não existe protocolo ${protocolo} na fila (${fila.length} inscritos).`); process.exit(1); }
  if (pessoa.confirmado_em && !deNovo) {
    console.error(`${pessoa.nome} <${pessoa.email}> JÁ recebeu a confirmação em ${pessoa.confirmado_em}.`);
    console.error("Para reenviar mesmo assim, acrescente --de-novo");
    process.exit(1);
  }
  numero = String(protocolo).padStart(3, "0");
  nome = pessoa.nome; email = pessoa.email;
  assunto = `Requerimento protocolado — nº ${numero}`;
}

let html = readFileSync(join(raiz, "emails/confirmacao-reserva.html"), "utf8")
  .replace(/^<!--[\s\S]*?-->\n/, "")
  .replaceAll("{{TRATAMENTO}}", tratamento)
  .replaceAll("{{NOME}}", nome)
  .replaceAll("{{NUMERO}}", numero);

const texto = `DEPARTAMENTO DE TÉRMINOS E ABERTURAS
Setor de Reservas · Lote único · 42 exemplares

${tratamento} ${nome},

Fica registrado que o seu requerimento de reserva foi protocolado nesta data sob o número ${numero}, referente ao lote único de quarenta e dois exemplares de A Cidade Inacabada.

Consta em nossos arquivos. Não há cobrança, não há compromisso e não há prazo a cumprir da sua parte.

O Departamento entra em contato com atualizações sobre a Edição Impressa, na ordem em que os requerimentos foram recebidos.

Até lá, nada precisa ser feito. É provavelmente a única fila do Brasil em que isso é verdade.

— Otoniel, do Departamento

Oi! Aqui é o Marcelinho, atrás do Otoniel. Obrigado de verdade por entrar nessa lista. Te aviso assim que os exemplares saírem da gráfica.

acidadeinacabada.com.br`;

const r = await fetch(`${API}/emails`, {
  method: "POST",
  headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: DE, to: [email], reply_to: "marcelinho.eu@gmail.com", subject: assunto, html, text: texto }),
});
const resp = await r.json();
if (resp.id) {
  console.log(`✓ Enviado para ${nome} <${email}> — protocolo nº ${numero} (id ${resp.id})`);
  if (!teste) {
    const sql = neon(process.env.DATABASE_URL);
    await sql`UPDATE fila_impresso SET confirmado_em = NOW() WHERE email = ${email}`;
    console.log("✓ Marcado no banco: confirmação enviada.");
  }
} else {
  console.error("Falha:", JSON.stringify(resp));
  process.exit(1);
}

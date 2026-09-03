#!/usr/bin/env node
/**
 * Envia o e-mail de confirmação de reserva (template emails/confirmacao-reserva.html)
 * pelo Resend, do remetente departamento@acidadeinacabada.com.br.
 *
 * Uso:
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs --teste
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs <numero> "<nome>" <email> [tratamento]
 *
 * Exemplos:
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs 016 "Tatiane Nobre" tatianenobre@yahoo.com.br
 *   node --env-file=.env.local scripts/enviar-confirmacao.mjs 017 "Luciana Souza" souzaaluciana@hotmail.com Prezada
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.resend.com";
const DE = 'Otoniel, do Departamento <departamento@acidadeinacabada.com.br>';

const chave = (process.env.RESEND_API_KEY ?? "").trim();
if (!chave) {
  console.error("RESEND_API_KEY ausente. Rode com: node --env-file=.env.local scripts/enviar-confirmacao.mjs ...");
  process.exit(1);
}

let [numero, nome, email, tratamento = "Olá"] = process.argv.slice(2);
let assunto;
if (numero === "--teste") {
  numero = "016"; nome = "Marcelinho"; email = "contato@marcelinho.com.br"; tratamento = "Prezado";
  assunto = `[TESTE — via Resend] Requerimento protocolado — nº ${numero}`;
} else {
  if (!numero || !nome || !email) {
    console.error('Uso: node --env-file=.env.local scripts/enviar-confirmacao.mjs <numero> "<nome>" <email> [tratamento]');
    process.exit(1);
  }
  numero = String(parseInt(numero, 10)).padStart(3, "0");
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

O Departamento entra em contato uma única vez, quando o lote ficar pronto, na ordem em que os requerimentos foram recebidos.

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
  console.log(`✓ Enviado para ${email} — protocolo nº ${numero} (id ${resp.id})`);
} else {
  console.error("Falha:", JSON.stringify(resp));
  process.exit(1);
}

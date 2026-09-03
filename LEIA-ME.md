# Página de lançamento — A Cidade Inacabada

Site em Next.js hospedado na Vercel. A página é estática exceto por uma coisa: o **contador da fila dos 42** e o **formulário de reserva do livro físico**, que gravam num banco Postgres (Neon).

```
app/page.tsx                  a página inteira (textos ficam aqui)
app/globals.css               todo o visual
app/componentes/FormReserva   formulário + contador
app/componentes/BotaoAmazon   botão do ebook (apagado até ter link)
app/lista                     página interna para ver os inscritos
app/api/waitlist              grava o cadastro (POST) e devolve o contador (GET)
app/api/lista                 exporta CSV
lib/config.ts                 LINK_AMAZON, TIRAGEM, PRECO_EBOOK
lib/db.ts                     banco (cria a tabela sozinho na primeira vez)
public/                       hero_page.jpg · capa_livro.png · foto-autor.png
```

---

## Rodar no computador

```
npm install
cp .env.example .env.local     # preenche o DATABASE_URL pra testar o formulário
npm run dev
```

Abre http://localhost:3000. Sem `DATABASE_URL` a página abre normal, só sem o contador, e o formulário responde "guichê fechado".

---

## Subir na Vercel

1. Vercel > **Add New > Project > Import** o repositório `alphabrandbr/acidadeinacabada`. Não precisa configurar nada: ela detecta Next.js.
2. No projeto, aba **Storage > Create Database > Neon** (plano gratuito). Ao conectar, a Vercel cria a variável `DATABASE_URL` sozinha.
3. Em **Settings > Environment Variables**, cadastra:

| Nome | Valor |
|---|---|
| `LISTA_SENHA` | uma senha sua, qualquer coisa longa. É o que abre a página `/lista`. |
| `RESEND_API_KEY` | opcional · chave `re_...` do Resend |
| `RESEND_AUDIENCE_ID` | opcional · id da audiência |
| `AVISO_PARA` | opcional · marcelinho.eu@gmail.com |
| `AVISO_DE` | opcional · remetente verificado no Resend |

4. **Redeploy**. Variável só entra em vigor no deploy seguinte.

A tabela `fila_impresso` é criada automaticamente na primeira visita. Não precisa rodar migração.

---

## Ver quem se inscreveu

`https://seu-dominio/lista?senha=A_SENHA_QUE_VOCÊ_CADASTROU`

Mostra a fila na ordem de protocolo, com número, nome, e-mail e data. O botão **Baixar CSV** exporta tudo (abre direto no Numbers/Excel/Google Sheets). Quem passou de 42 aparece em cinza, na lista do segundo lote.

Sem `LISTA_SENHA` configurada, a página nem existe (dá 404).

---

## O contador

Aparece no cartão do formulário (`017 / 042` com uma barrinha) e na linha embaixo dos botões (`25 ainda sem destinatário`). Atualiza a cada visita e na hora, logo depois de alguém se inscrever.

Quando chega em 42, vira "Lote completo · novos requerimentos entram na lista do segundo lote". O formulário continua aberto de propósito: excedente vira segundo lote ou lista do próximo livro.

Quem se inscreve duas vezes com o mesmo e-mail não duplica: recebe de volta o número original.

---

## Quando o ebook sair na Amazon

Uma linha só. Em `lib/config.ts`:

```ts
export const LINK_AMAZON = "";
```

Cola o link dentro das aspas, salva, `git push`. A Vercel publica sozinha. O botão fica ativo e a linha de status muda para "Disponível na Amazon".

---

## E-mail de confirmação (manual)

O template fica em `emails/confirmacao-reserva.html` e sai de `departamento@acidadeinacabada.com.br` (domínio verificado no Resend — a imagem do topo renderiza direto). Precisa do `RESEND_API_KEY` no `.env.local`.

```
cd site-lancamento
node --env-file=.env.local scripts/enviar-confirmacao.mjs <numero> "<nome>" <email> [tratamento]
```

Exemplo: `node --env-file=.env.local scripts/enviar-confirmacao.mjs 016 "Tatiane Nobre" tatianenobre@yahoo.com.br`
O tratamento padrão é "Olá"; passa "Prezada"/"Prezado" se quiser. `--teste` manda pra contato@marcelinho.com.br.

---

## Avisar a lista

Se o Resend estiver configurado, cada inscrito também entra na audiência de lá, e dá pra mandar o aviso em **Broadcasts**. Se não, baixa o CSV e usa onde preferir. Sugestão de assunto, no tom da casa:

> Processo 214 — liberado

E o corpo pode ser curto: uma linha do Otoniel, o link, e mais nada.

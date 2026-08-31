# Página de lançamento — A Cidade Inacabada

## Antes de subir

**As imagens.** A pasta já tem as duas que a página usa:

| arquivo | onde aparece |
|---|---|
| `hero_page.jpg` | o banner comprido do topo |
| `capa_livro.png` | o mockup do livro, na faixa logo abaixo |

Se trocar qualquer uma, mantém o mesmo nome que a página continua funcionando.

**Ajuste fino do estouro.** No CSS, procura `.objeto` e a linha `margin-top:-3rem`. É o quanto o livro sobe por cima do banner. `0` encosta, `-6rem` come o texto da arte.

**Conferir os textos.** Abre o `index.html` no navegador com dois cliques. Tudo é editável direto no arquivo, sem precisar de nada instalado.

---

## Configurar o Resend

**1.** Entra no painel do Resend e cria uma audiência em **Audiences > Create Audience**. Chama de `A Cidade Inacabada`. Copia o ID que aparece.

**2.** Em **API Keys**, cria uma chave nova com permissão de escrita. Copia. Ela só aparece uma vez.

**3.** O remetente precisa ser de um domínio verificado no Resend. Se você ainda não verificou nenhum, dá pra usar o endereço de teste do próprio Resend por enquanto — o aviso chega igual, só não é bonito.

---

## Subir no GitHub

O repositório é `github.com/alphabrandbr/acidadeinacabada`. No terminal, dentro desta pasta:

```
cd "06_A_CIDADE_INACABADA/site-lancamento"
git init
git add .
git commit -m "Página de lançamento"
git branch -M main
git remote add origin https://github.com/alphabrandbr/acidadeinacabada.git
git push -u origin main
```

Se o repositório já tiver um README criado pelo GitHub, o push vai reclamar. Nesse caso, roda `git pull --rebase origin main` antes do push.

---

## Ligar na Vercel

Vercel > **Add New > Project > Import Git Repository** e escolhe o `acidadeinacabada`.

Não precisa configurar build: é HTML estático com uma função em `/api`, e a Vercel detecta sozinha. O `package.json` com `"type": "module"` já está aí porque a função usa sintaxe moderna.

Depois do primeiro deploy, vai em **Settings > Environment Variables** e cadastra as quatro:

| Nome | Valor |
|---|---|
| `RESEND_API_KEY` | a chave que começa com `re_` |
| `RESEND_AUDIENCE_ID` | o id da audiência |
| `AVISO_PARA` | marcelinho.eu@gmail.com |
| `AVISO_DE` | o remetente verificado, ex. `departamento@seudominio.com` |

Faz um **Redeploy** depois de salvar. Variável de ambiente só entra em vigor no deploy seguinte.

---

## Testar

Abre a página publicada, preenche o formulário com o seu próprio e-mail e confere duas coisas:

- o seu contato aparece na audiência do Resend
- chega um e-mail no `AVISO_PARA` com o assunto "Novo requerimento protocolado"

Se der erro, o log fica em Vercel > Deployments > a função `api/waitlist`.

---

## Quando o ebook sair na Amazon

Uma linha só. No `index.html`, lá embaixo, no começo do `<script>`:

```js
const LINK_AMAZON = '';
```

Cola o link do livro dentro das aspas, salva, sobe. A página vira modo lançado sozinha: o botão fica ativo, o texto de status muda para "Liberado" e o selo do topo passa de "Lançamento · 2026" para "Disponível na Amazon".

Enquanto a constante estiver vazia, o botão aparece apagado, escrito "em liberação", e ao clicar ele leva a pessoa para o formulário. Ou seja: ninguém sai da página de mãos vazias.

---

## A lista dos 42

O formulário não é lista de espera do ebook. Ele é a fila da **edição impressa em tiragem única de 42 exemplares**, numerados à mão, sem reimpressão.

Isso muda a natureza da lista: não é gente esperando um link, é gente esperando um objeto que pode acabar. Vale manter assim mesmo depois do ebook no ar, porque é o que sustenta a página o ano inteiro.

Quando os exemplares ficarem prontos, você entra em contato na ordem de inscrição. Se passarem de 42, os excedentes viram lista do segundo lote ou do segundo livro. Não promete o que não dá pra cumprir: o texto do formulário já avisa que a inscrição não reserva nada em definitivo.

---

## Avisar a lista

No Resend, em **Broadcasts**, você monta o e-mail e escolhe a audiência. Sugestão de assunto, no tom da casa:

> Processo 214 — liberado

E o corpo pode ser curto: uma linha do Otoniel, o link, e mais nada.

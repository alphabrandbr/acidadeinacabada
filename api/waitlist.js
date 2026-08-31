// Endpoint da lista de espera — A Cidade Inacabada
// Roda como Serverless Function na Vercel (pasta /api).
//
// Variáveis de ambiente necessárias (Vercel > Settings > Environment Variables):
//   RESEND_API_KEY       chave da API do Resend (re_...)
//   RESEND_AUDIENCE_ID   id da audiência criada no Resend
//   AVISO_PARA           e-mail que recebe o aviso de cada novo inscrito
//   AVISO_DE             remetente verificado no Resend (ex.: departamento@seudominio.com)

const RESEND = 'https://api.resend.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'metodo nao permitido' });
  }

  const { RESEND_API_KEY, RESEND_AUDIENCE_ID, AVISO_PARA, AVISO_DE } = process.env;

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return res.status(500).json({ error: 'guiche sem configuracao' });
  }

  let nome = '';
  let email = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    nome  = String(body.nome  || '').trim().slice(0, 120);
    email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  } catch {
    return res.status(400).json({ error: 'requerimento ilegivel' });
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!emailValido) {
    return res.status(400).json({ error: 'endereco invalido' });
  }

  const auth = {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  };

  // separa "Nome Sobrenome" nos campos que o Resend usa
  const partes = nome.split(/\s+/).filter(Boolean);
  const first = partes[0] || '';
  const last  = partes.slice(1).join(' ');

  try {
    const r = await fetch(`${RESEND}/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        email,
        first_name: first,
        last_name: last,
        unsubscribed: false
      })
    });

    // o Resend devolve erro quando o contato já existe: isso não é falha para o usuário
    if (!r.ok) {
      const detalhe = await r.text();
      const jaExiste = /already exists|duplicate/i.test(detalhe);
      if (!jaExiste) {
        console.error('resend contacts:', r.status, detalhe);
        return res.status(502).json({ error: 'guiche indisponivel' });
      }
      return res.status(200).json({ ok: true, jaConstava: true });
    }
  } catch (err) {
    console.error('resend contacts (rede):', err);
    return res.status(502).json({ error: 'guiche indisponivel' });
  }

  // aviso para o autor — falha aqui não deve derrubar o protocolo do leitor
  if (AVISO_PARA && AVISO_DE) {
    try {
      await fetch(`${RESEND}/emails`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          from: AVISO_DE,
          to: [AVISO_PARA],
          subject: `Novo requerimento protocolado: ${nome || email}`,
          text:
`DEPARTAMENTO DE TERMINOS E ABERTURAS
Setor de Notificacoes

Consta novo requerimento na lista de espera.

Nome:  ${nome || '(nao informado)'}
E-mail: ${email}
Data:   ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

Otoniel, do Departamento`
        })
      });
    } catch (err) {
      console.error('aviso ao autor:', err);
    }
  }

  return res.status(200).json({ ok: true });
}

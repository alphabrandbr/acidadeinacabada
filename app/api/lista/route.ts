import { listarInscritos } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/lista?senha=... — exporta a fila em CSV. */
export async function GET(req: Request) {
  const senha = new URL(req.url).searchParams.get("senha") ?? "";
  const esperada = process.env.LISTA_SENHA;
  if (!esperada || senha !== esperada) {
    return new Response("Not found", { status: 404 });
  }

  const inscritos = await listarInscritos();
  const escapar = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const linhas = [
    ["posicao", "nome", "email", "protocolado_em"].join(";"),
    ...inscritos.map((i) => [i.posicao, i.nome, i.email, i.criado_em].map(escapar).join(";")),
  ];

  return new Response("﻿" + linhas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fila-dos-42.csv"',
      "Cache-Control": "no-store",
    },
  });
}

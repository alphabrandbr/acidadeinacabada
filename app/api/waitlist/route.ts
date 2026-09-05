import { NextResponse } from "next/server";
import { bancoConfigurado, contarInscritos, inscrever, marcarConfirmacaoEnviada } from "@/lib/db";
import { enviarConfirmacao, registrarNoResend } from "@/lib/resend";
import { TIRAGEM } from "@/lib/config";

export const dynamic = "force-dynamic";

/** GET: contador público. */
export async function GET() {
  const total = await contarInscritos();
  return NextResponse.json({ total, tiragem: TIRAGEM });
}

/** POST: protocola um requerimento na fila do livro físico. */
export async function POST(req: Request) {
  if (!bancoConfigurado()) {
    return NextResponse.json({ error: "guiche sem configuracao" }, { status: 500 });
  }

  let nome = "";
  let email = "";
  try {
    const body = await req.json();
    nome = String(body?.nome ?? "").trim().slice(0, 120);
    email = String(body?.email ?? "").trim().toLowerCase().slice(0, 200);
  } catch {
    return NextResponse.json({ error: "requerimento ilegivel" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "endereco invalido" }, { status: 400 });
  }

  try {
    const resultado = await inscrever(nome, email);
    if (!resultado.jaConstava) {
      if (await enviarConfirmacao(nome, email, resultado.posicao)) {
        await marcarConfirmacaoEnviada(email);
      }
      await registrarNoResend(nome, email, resultado.posicao);
    }
    return NextResponse.json({ ok: true, ...resultado });
  } catch (err) {
    console.error("inscrever:", err);
    return NextResponse.json({ error: "guiche indisponivel" }, { status: 502 });
  }
}

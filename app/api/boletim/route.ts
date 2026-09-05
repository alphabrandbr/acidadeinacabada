import { NextResponse } from "next/server";
import { assinarBoletim, bancoConfigurado } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST: assina o boletim do Diário Oficial. */
export async function POST(req: Request) {
  if (!bancoConfigurado()) {
    return NextResponse.json({ error: "guiche sem configuracao" }, { status: 500 });
  }
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase().slice(0, 200);
  } catch {
    return NextResponse.json({ error: "requerimento ilegivel" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "endereco invalido" }, { status: 400 });
  }
  try {
    const r = await assinarBoletim(email);
    return NextResponse.json({ ok: true, ...r });
  } catch (err) {
    console.error("assinarBoletim:", err);
    return NextResponse.json({ error: "guiche indisponivel" }, { status: 502 });
  }
}

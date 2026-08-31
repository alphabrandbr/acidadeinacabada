import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { SENHA_BASE, TIRAGEM } from "./config";

export type Inscrito = {
  id: number;
  posicao: number;
  nome: string;
  email: string;
  criado_em: string;
};

type Sql = ReturnType<typeof neon>;

let sqlCache: Sql | null = null;
let schemaPronto: Promise<void> | null = null;

/** Devolve o cliente do Neon, ou null se DATABASE_URL não estiver configurada. */
function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sqlCache) sqlCache = neon(url);
  return sqlCache;
}

/** Cria a tabela na primeira chamada de cada instância. */
async function db(): Promise<Sql | null> {
  const sql = getSql();
  if (!sql) return null;
  if (!schemaPronto) {
    schemaPronto = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS fila_impresso (
          id        SERIAL PRIMARY KEY,
          nome      TEXT NOT NULL DEFAULT '',
          email     TEXT NOT NULL UNIQUE,
          criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS visitas_unicas (
          ip_hash   TEXT PRIMARY KEY,
          criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err) => {
      schemaPronto = null;
      throw err;
    });
  }
  await schemaPronto;
  return sql;
}

export function bancoConfigurado(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Total de requerimentos protocolados. Null quando o banco não está configurado ou falhou. */
export async function contarInscritos(): Promise<number | null> {
  try {
    const sql = await db();
    if (!sql) return null;
    const rows = (await sql`SELECT COUNT(*)::int AS total FROM fila_impresso`) as { total: number }[];
    return rows[0]?.total ?? 0;
  } catch (err) {
    console.error("contarInscritos:", err);
    return null;
  }
}

export type ResultadoInscricao = {
  posicao: number;
  jaConstava: boolean;
  total: number;
  tiragem: number;
};

/**
 * Protocola um requerimento. Se o e-mail já constava, devolve a posição original
 * em vez de falhar — para quem preenche duas vezes, isso não é erro.
 */
export async function inscrever(nome: string, email: string): Promise<ResultadoInscricao> {
  const sql = await db();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  const inseridos = (await sql`
    INSERT INTO fila_impresso (nome, email)
    VALUES (${nome}, ${email})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `) as { id: number }[];

  let id: number;
  let jaConstava = false;

  if (inseridos.length > 0) {
    id = inseridos[0].id;
  } else {
    const existentes = (await sql`SELECT id FROM fila_impresso WHERE email = ${email}`) as { id: number }[];
    id = existentes[0].id;
    jaConstava = true;
  }

  const rows = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM fila_impresso WHERE id <= ${id}) AS posicao,
      (SELECT COUNT(*)::int FROM fila_impresso) AS total
  `) as { posicao: number; total: number }[];

  return { posicao: rows[0].posicao, jaConstava, total: rows[0].total, tiragem: TIRAGEM };
}

/** Lista completa, na ordem de protocolo. */
export async function listarInscritos(): Promise<Inscrito[]> {
  const sql = await db();
  if (!sql) return [];
  const rows = (await sql`
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY id)::int AS posicao,
      nome,
      email,
      criado_em::text AS criado_em
    FROM fila_impresso
    ORDER BY id
  `) as Inscrito[];
  return rows;
}

/**
 * Conta o visitante (um por IP — só o hash fica guardado) e devolve a senha
 * do painel: SENHA_BASE + visitantes únicos. Refresh não soma.
 * Null quando o banco não está configurado ou falhou.
 */
export async function registrarVisita(ip: string | null): Promise<number | null> {
  try {
    const sql = await db();
    if (!sql) return null;
    if (ip) {
      const hash = createHash("sha256").update("dta-guiche-08:" + ip).digest("hex").slice(0, 32);
      await sql`INSERT INTO visitas_unicas (ip_hash) VALUES (${hash}) ON CONFLICT (ip_hash) DO NOTHING`;
    }
    const rows = (await sql`SELECT COUNT(*)::int AS n FROM visitas_unicas`) as { n: number }[];
    return SENHA_BASE + (rows[0]?.n ?? 0);
  } catch (err) {
    console.error("registrarVisita:", err);
    return null;
  }
}

import { neon } from "@neondatabase/serverless";
import { TIRAGEM } from "./config";

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
        CREATE TABLE IF NOT EXISTS contadores (
          nome  TEXT PRIMARY KEY,
          valor BIGINT NOT NULL DEFAULT 0
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
 * Conta uma visita e devolve a senha do painel. A contagem nasce em 214
 * (o Departamento já tinha atendido o Distrito inteiro antes do site).
 * Null quando o banco não está configurado ou falhou.
 */
export async function registrarVisita(): Promise<number | null> {
  try {
    const sql = await db();
    if (!sql) return null;
    const rows = (await sql`
      INSERT INTO contadores (nome, valor) VALUES ('visitas', 215)
      ON CONFLICT (nome) DO UPDATE SET valor = contadores.valor + 1
      RETURNING valor::int AS valor
    `) as { valor: number }[];
    return rows[0]?.valor ?? null;
  } catch (err) {
    console.error("registrarVisita:", err);
    return null;
  }
}

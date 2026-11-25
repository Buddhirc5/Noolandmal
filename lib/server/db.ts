import "server-only";
// Minimal table store used by all business logic. Two backends:
//  • Supabase (service role, server-only — browsers never talk to tables directly)
//  • Local JSON file (demo/dev mode when Supabase env vars are missing)
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, useSupabase } from "./env";

export type Filter = Record<string, string | number | boolean | null>;
export interface QueryOpts {
  eq?: Filter;
  in?: { column: string; values: (string | number)[] };
  order?: { column: string; ascending?: boolean };
  limit?: number;
}

export interface Db {
  list<T>(table: string, opts?: QueryOpts): Promise<T[]>;
  get<T>(table: string, eq: Filter): Promise<T | null>;
  insert<T>(table: string, row: Partial<T> | Record<string, unknown>): Promise<T>;
  update<T>(table: string, eq: Filter, patch: Partial<T> | Record<string, unknown>): Promise<T[]>;
  remove(table: string, eq: Filter): Promise<void>;
}

const TOUCH_UPDATED = new Set(["designs", "orders", "price_settings"]);

// ── Supabase ───────────────────────────────────────────────────────────
let _sb: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (!_sb) _sb = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return _sb;
}

const supabaseDb: Db = {
  async list<T>(table: string, opts: QueryOpts = {}) {
    let q = supabaseAdmin().from(table).select("*");
    if (opts.eq) for (const [k, v] of Object.entries(opts.eq)) q = v === null ? q.is(k, null) : q.eq(k, v);
    if (opts.in) q = q.in(opts.in.column, opts.in.values);
    if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []) as T[];
  },
  async get<T>(table: string, eq: Filter) {
    const rows = await supabaseDb.list<T>(table, { eq, limit: 1 });
    return rows[0] ?? null;
  },
  async insert<T>(table: string, row: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin().from(table).insert(row).select("*").single();
    if (error) throw new Error(`${table}: ${error.message}`);
    return data as T;
  },
  async update<T>(table: string, eq: Filter, patch: Record<string, unknown>) {
    let q = supabaseAdmin()
      .from(table)
      .update(TOUCH_UPDATED.has(table) ? { ...patch, updated_at: new Date().toISOString() } : patch);
    for (const [k, v] of Object.entries(eq)) q = v === null ? q.is(k, null) : q.eq(k, v);
    const { data, error } = await q.select("*");
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []) as T[];
  },
  async remove(table: string, eq: Filter) {
    let q = supabaseAdmin().from(table).delete();
    for (const [k, v] of Object.entries(eq)) q = v === null ? q.is(k, null) : q.eq(k, v);
    const { error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
  },
};

// ── Local JSON store ───────────────────────────────────────────────────
type Store = Record<string, Record<string, unknown>[]>;
const dbFile = () => path.join(env.dataDir, "db.json");
let cache: { store: Store; mtime: number } | null = null;
let chain: Promise<unknown> = Promise.resolve();

async function seedStore(): Promise<Store> {
  const seed = await import("@/data/seed");
  return {
    palette_colors: seed.palette as never,
    fabrics: seed.fabrics as never,
    addon_groups: seed.addonGroups as never,
    addon_options: seed.addonOptions as never,
    addon_rules: seed.addonRules as never,
    size_options: seed.sizes as never,
    price_settings: [{ id: 1, data: seed.settings, updated_at: new Date().toISOString() }],
    designs: seed.designs as never,
    gallery_items: (await import("@/data/gallery")).galleryItems as never,
    design_regions: seed.designRegions as never,
  };
}

async function load(): Promise<Store> {
  const file = dbFile();
  try {
    const st = fs.statSync(file);
    if (cache && cache.mtime === st.mtimeMs) return cache.store;
    const store = JSON.parse(fs.readFileSync(file, "utf8")) as Store;
    cache = { store, mtime: st.mtimeMs };
    return store;
  } catch {
    const store = await seedStore();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(store));
    cache = { store, mtime: fs.statSync(file).mtimeMs };
    return store;
  }
}

function save(store: Store) {
  const file = dbFile();
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, file);
  cache = { store, mtime: fs.statSync(file).mtimeMs };
}

/** Serialise writes so concurrent requests can't clobber each other. */
function mutate<R>(fn: (s: Store) => R): Promise<R> {
  const next = chain.then(async () => {
    const s = await load();
    const r = fn(s);
    save(s);
    return r;
  });
  chain = next.catch(() => undefined);
  return next;
}

const match = (row: Record<string, unknown>, eq?: Filter) =>
  !eq || Object.entries(eq).every(([k, v]) => (v === null ? row[k] == null : row[k] === v));

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

const localDb: Db = {
  async list<T>(table: string, opts: QueryOpts = {}) {
    const s = await load();
    let rows = (s[table] ?? []).filter((r) => match(r, opts.eq));
    if (opts.in) rows = rows.filter((r) => opts.in!.values.includes(r[opts.in!.column] as never));
    if (opts.order) {
      const { column, ascending = true } = opts.order;
      rows = [...rows].sort((a, b) => {
        const x = a[column] as never;
        const y = b[column] as never;
        return (x < y ? -1 : x > y ? 1 : 0) * (ascending ? 1 : -1);
      });
    }
    if (opts.limit) rows = rows.slice(0, opts.limit);
    return clone(rows) as T[];
  },
  async get<T>(table: string, eq: Filter) {
    const rows = await localDb.list<T>(table, { eq, limit: 1 });
    return rows[0] ?? null;
  },
  insert<T>(table: string, row: Record<string, unknown>) {
    return mutate((s) => {
      const r = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row } as Record<string, unknown>;
      if (TOUCH_UPDATED.has(table) && !r.updated_at) r.updated_at = r.created_at;
      (s[table] ??= []).push(r);
      return clone(r) as T;
    });
  },
  update<T>(table: string, eq: Filter, patch: Record<string, unknown>) {
    return mutate((s) => {
      const out: Record<string, unknown>[] = [];
      for (const r of s[table] ?? []) {
        if (!match(r, eq)) continue;
        Object.assign(r, patch, TOUCH_UPDATED.has(table) ? { updated_at: new Date().toISOString() } : {});
        out.push(clone(r));
      }
      return out as T[];
    });
  },
  remove(table: string, eq: Filter) {
    return mutate((s) => {
      s[table] = (s[table] ?? []).filter((r) => !match(r, eq));
    });
  },
};

export const db: Db = useSupabase ? supabaseDb : localDb;
export const dbMode = useSupabase ? "supabase" : "local";

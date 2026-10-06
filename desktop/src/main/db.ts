import { app } from "electron";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

let instance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (instance) return instance;
  const dir = join(app.getPath("userData"), "data");
  mkdirSync(dir, { recursive: true });
  instance = new Database(join(dir, "blacksmile.db"));
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  instance.exec(`
    create table if not exists conversations (
      id text primary key,
      title text not null default 'New chat',
      created_at integer not null,
      updated_at integer not null
    );
    create table if not exists messages (
      id text primary key,
      conversation_id text not null references conversations(id) on delete cascade,
      role text not null check (role in ('user', 'assistant')),
      content text not null,
      created_at integer not null
    );
    create table if not exists memories (
      id text primary key,
      content text not null,
      created_at integer not null
    );
    create table if not exists todos (
      id text primary key,
      title text not null,
      done integer not null default 0,
      created_at integer not null
    );
    create table if not exists settings (
      key text primary key,
      value text not null
    );
  `);
  return instance;
}

export const now = () => Date.now();
export const id = () => crypto.randomUUID();

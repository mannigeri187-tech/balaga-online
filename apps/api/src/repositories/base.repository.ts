import { PersistentMap } from "../database/persistence.js";
import { supabase } from "../lib/supabase.js";

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: (item: T) => boolean): Promise<T[]>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: (item: T) => boolean): Promise<number>;
}

/**
 * BasePersistentRepository
 * In production: Supabase PostgreSQL is the authoritative datastore. All write errors throw.
 * In development: Local store (PersistentMap) operates as development fallback when keys are unconfigured.
 */
export class BasePersistentRepository<T extends Record<string, any>> implements IRepository<T> {
  protected store: Map<string, T> | PersistentMap<string, T>;
  protected tableName: string;
  protected idKey: keyof T;

  constructor(tableName: string, store: Map<string, T> | PersistentMap<string, T>, idKey: keyof T = "id" as keyof T) {
    this.tableName = tableName;
    this.store = store;
    this.idKey = idKey;
  }

  getTableName(): string {
    return this.tableName;
  }

  getIdKey(): keyof T {
    return this.idKey;
  }

  getStore(): Map<string, T> | PersistentMap<string, T> {
    return this.store;
  }

  isRemoteAuthoritative(): boolean {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return Boolean(key && key.trim().length > 20);
  }

  async hydrateAllFromRemote(): Promise<number> {
    if (!this.isRemoteAuthoritative()) {
      return this.store.size;
    }
    const { data, error } = await supabase.from(this.tableName).select("*");
    if (error) {
      console.warn(`[Repository ${this.tableName}] Remote hydration failed: ${error.message} (${error.code || "DB_ERR"})`);
      return this.store.size;
    }
    const remoteItems = (data || []) as T[];
    for (const item of remoteItems) {
      this.store.set(String(item[this.idKey]), item);
    }
    return remoteItems.length;
  }

  async findById(id: string): Promise<T | null> {
    if (this.isRemoteAuthoritative()) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq(String(this.idKey), id)
        .maybeSingle();

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL findById failed: ${error.message} (${error.code || "DB_ERR"})`);
      }
      if (data) {
        this.store.set(id, data as T);
        return data as T;
      }
      return null;
    }

    const item = this.store.get(id);
    return item ? { ...item } : null;
  }

  async findMany(filter?: (item: T) => boolean): Promise<T[]> {
    if (this.isRemoteAuthoritative()) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*");

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL findMany failed: ${error.message} (${error.code || "DB_ERR"})`);
      }
      const remoteItems = (data || []) as T[];
      for (const item of remoteItems) {
        this.store.set(String(item[this.idKey]), item);
      }
      return filter ? remoteItems.filter(filter) : remoteItems;
    }

    const all = Array.from(this.store.values());
    if (!filter) return all.map((i) => ({ ...i }));
    return all.filter(filter).map((i) => ({ ...i }));
  }

  async create(item: T): Promise<T> {
    const key = String(item[this.idKey]);

    // Authoritative PostgreSQL write
    if (this.isRemoteAuthoritative()) {
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(item as any);

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL write failed: ${error.message} (${error.code || "DB_ERR"})`);
      }
    }

    this.store.set(key, { ...item });
    return { ...item };
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };

    if (this.isRemoteAuthoritative()) {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(patch as any)
        .eq(String(this.idKey), id);

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL update failed: ${error.message} (${error.code || "DB_ERR"})`);
      }
    }

    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    if (this.isRemoteAuthoritative()) {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq(String(this.idKey), id);

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL delete failed: ${error.message} (${error.code || "DB_ERR"})`);
      }
    }

    return this.store.delete(id);
  }

  async count(filter?: (item: T) => boolean): Promise<number> {
    if (this.isRemoteAuthoritative()) {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        throw new Error(`[Repository ${this.tableName}] Remote PostgreSQL count failed: ${error.message}`);
      }
      return count || 0;
    }

    if (!filter) return this.store.size;
    return (await this.findMany(filter)).length;
  }

  /**
   * Synchronous store hook: ensures any direct store mutation passes through PostgreSQL check
   */
  syncCreateOrUpdate(key: string, item: T): void {
    if (this.isRemoteAuthoritative()) {
      supabase
        .from(this.tableName)
        .upsert(item as any)
        .then(({ error }) => {
          if (error) {
            console.error(`[Repository ${this.tableName}] Critical PostgreSQL write failure:`, error.message);
          }
        });
    }
  }

  syncDelete(key: string): void {
    if (this.isRemoteAuthoritative()) {
      supabase
        .from(this.tableName)
        .delete()
        .eq(String(this.idKey), key)
        .then(({ error }) => {
          if (error) {
            console.error(`[Repository ${this.tableName}] Critical PostgreSQL delete failure:`, error.message);
          }
        });
    }
  }
}

/**
 * RepositoryBoundMap: Map adapter that guarantees every store mutation passes through the repository
 */
export class RepositoryBoundMap<K extends string, V extends Record<string, any>> extends Map<K, V> {
  private repo?: BasePersistentRepository<V>;
  public tableName: string;

  constructor(tableName: string, entries?: readonly (readonly [K, V])[] | null) {
    super(entries || []);
    this.tableName = tableName;
  }

  bindRepository(repo: BasePersistentRepository<V>) {
    this.repo = repo;
  }

  set(key: K, value: V): this {
    super.set(key, value);
    if (this.repo) {
      this.repo.syncCreateOrUpdate(key, value);
    }
    return this;
  }

  delete(key: K): boolean {
    const res = super.delete(key);
    if (res && this.repo) {
      this.repo.syncDelete(key);
    }
    return res;
  }
}

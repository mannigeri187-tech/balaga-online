import fs from "fs";
import path from "path";

/**
 * Persistence Configuration
 * In production, Supabase PostgreSQL is the authoritative database.
 * Local JSON persistence serves strictly as a development-only fallback.
 */
const DATA_DIR = process.env.PERSISTENCE_DIR || path.resolve(process.cwd(), ".data");
const PERSISTENCE_FILE = process.env.PERSISTENCE_FILE || path.join(DATA_DIR, "platform_storage.json");

export function isTransientStorageMode(): boolean {
  return process.env.BALAGA_TRANSIENT_STORAGE === "true" || process.env.NODE_ENV === "test";
}

/**
 * A persistent Map that acts identically to standard ES6 Map,
 * but triggers disk synchronization whenever mutations occur in development fallback mode.
 */
export class PersistentMap<K extends string, V> extends Map<K, V> {
  public tableName: string;
  public persistenceEngine: PersistenceEngine;

  constructor(tableName: string, engine: PersistenceEngine, entries?: readonly (readonly [K, V])[] | null) {
    super(entries || []);
    this.tableName = tableName;
    this.persistenceEngine = engine;
  }

  set(key: K, value: V): this {
    super.set(key, value);
    if (this.persistenceEngine.isPersisting()) {
      this.persistenceEngine.saveAllSync();
    }
    return this;
  }

  delete(key: K): boolean {
    const res = super.delete(key);
    if (res && this.persistenceEngine.isPersisting()) {
      this.persistenceEngine.saveAllSync();
    }
    return res;
  }

  clear(): void {
    super.clear();
    if (this.persistenceEngine.isPersisting()) {
      this.persistenceEngine.saveAllSync();
    }
  }
}

/**
 * Persistence Engine managing disk storage and atomic writes (Development Fallback)
 */
export class PersistenceEngine {
  private dataDir: string;
  private filePath: string;
  private stores: Map<string, PersistentMap<any, any>> = new Map();
  private forcePersistence: boolean;

  constructor(storagePath: string = PERSISTENCE_FILE) {
    this.filePath = storagePath;
    this.dataDir = path.dirname(storagePath);
    this.forcePersistence = storagePath !== PERSISTENCE_FILE;
    if (this.isPersisting()) {
      this.ensureDataDir();
    }
  }

  public isPersisting(): boolean {
    return this.forcePersistence || !isTransientStorageMode();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err) {
      console.error("[PersistenceEngine] Failed to create data dir:", err);
    }
  }

  public registerStore<V>(tableName: string): PersistentMap<string, V> {
    if (this.stores.has(tableName)) {
      return this.stores.get(tableName)!;
    }

    const store = new PersistentMap<string, V>(tableName, this);
    this.stores.set(tableName, store);

    // Hydrate store from disk file if persisting
    if (this.isPersisting()) {
      this.loadStore(tableName, store);
    }

    return store;
  }

  private loadStore(tableName: string, store: PersistentMap<any, any>) {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const content = fs.readFileSync(this.filePath, "utf-8");
      if (!content || !content.trim()) return;

      const parsed: Record<string, [string, any][]> = JSON.parse(content);
      if (parsed[tableName]) {
        for (const [key, val] of parsed[tableName]) {
          Map.prototype.set.call(store, key, val);
        }
      }
    } catch (err) {
      console.error(`[PersistenceEngine] Error loading store ${tableName}:`, err);
    }
  }

  public markDirty(tableName: string) {
    if (this.isPersisting()) {
      this.saveAllSync();
    }
  }

  public saveAllSync() {
    if (!this.isPersisting()) return;
    this.saveAll();
  }

  private saveAll() {
    try {
      this.ensureDataDir();

      let serialized: Record<string, any[]> = {};
      if (fs.existsSync(this.filePath)) {
        try {
          const existing = fs.readFileSync(this.filePath, "utf-8");
          if (existing && existing.trim()) {
            serialized = JSON.parse(existing);
          }
        } catch {}
      }

      for (const [tableName, store] of this.stores.entries()) {
        serialized[tableName] = Array.from(store.entries());
      }

      const content = JSON.stringify(serialized, null, 2);
      try {
        const tempFile = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(tempFile, content, "utf-8");
        try {
          fs.renameSync(tempFile, this.filePath);
        } catch {
          fs.copyFileSync(tempFile, this.filePath);
          try { fs.unlinkSync(tempFile); } catch {}
        }
      } catch {
        fs.writeFileSync(this.filePath, content, "utf-8");
      }
    } catch (err) {
      console.error("[PersistenceEngine] Error saving storage to disk:", err);
    }
  }

  public loadAll() {
    if (!this.isPersisting()) return;
    try {
      if (!fs.existsSync(this.filePath)) return;
      const content = fs.readFileSync(this.filePath, "utf-8");
      if (!content || !content.trim()) return;

      const parsed: Record<string, [string, any][]> = JSON.parse(content);
      for (const [tableName, entries] of Object.entries(parsed)) {
        const store = this.stores.get(tableName);
        if (store) {
          for (const [key, val] of entries) {
            Map.prototype.set.call(store, key, val);
          }
        }
      }
    } catch (err) {
      console.error("[PersistenceEngine] Error loading storage from disk:", err);
    }
  }

  public resetStorage() {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      for (const store of this.stores.values()) {
        Map.prototype.clear.call(store);
      }
    } catch (err) {
      console.error("[PersistenceEngine] Error resetting storage:", err);
    }
  }
}

export const globalPersistence = new PersistenceEngine();

/**
 * LocalBrain — Sistema di memoria semantica e persistente su IndexedDB
 * 
 * Implementa la Fase 2 della roadmap: migrazione da localStorage a IndexedDB
 * e gestione di fatti, preferenze e riassunti.
 */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'preventivi_smart_brain';
const DB_VERSION = 1;

export interface MemoryEntry {
  id: string;
  type: 'fact' | 'preference' | 'summary' | 'episode';
  content: string;
  metadata?: Record<string, any>;
  timestamp: number;
  importance: number; // 0-1
}

class LocalBrain {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('memories')) {
          const store = db.createObjectStore('memories', { keyPath: 'id' });
          store.createIndex('by-type', 'type');
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }

  async remember(entry: Omit<MemoryEntry, 'timestamp'>): Promise<void> {
    const database = await this.db;
    await database.put('memories', {
      ...entry,
      timestamp: Date.now(),
    });
  }

  async recall(type?: MemoryEntry['type']): Promise<MemoryEntry[]> {
    const database = await this.db;
    if (type) {
      return database.getAllFromIndex('memories', 'by-type', type);
    }
    return database.getAll('memories');
  }

  async forget(id: string): Promise<void> {
    const database = await this.db;
    await database.delete('memories', id);
  }

  async search(query: string): Promise<MemoryEntry[]> {
    // Per ora ricerca testuale semplice, in Fase 3 integreremo embeddings
    const memories = await this.recall();
    const q = query.toLowerCase();
    return memories
      .filter(m => m.content.toLowerCase().includes(q))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async prune(maxEntries = 100): Promise<void> {
    const memories = await this.recall();
    if (memories.length <= maxEntries) return;

    const database = await this.db;
    // Elimina i più vecchi con minore importanza
    const toDelete = memories
      .sort((a, b) => {
        const scoreA = a.timestamp * a.importance;
        const scoreB = b.timestamp * b.importance;
        return scoreA - scoreB;
      })
      .slice(0, memories.length - maxEntries);

    for (const entry of toDelete) {
      await database.delete('memories', entry.id);
    }
  }
}

export const localBrain = new LocalBrain();

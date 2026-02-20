
import { neon } from '@neondatabase/serverless';

// الاعتماد على المتغير المعرف في vite.config.ts
const DATABASE_URL = process.env.VITE_DATABASE_URL;

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export const initDB = async () => {
  if (!sql) {
    console.warn("Neon Database URL not found. Running in local-only mode.");
    return false;
  }
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS app_storage (
        key TEXT PRIMARY KEY,
        value JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return true;
  } catch (error) {
    console.error("Failed to initialize DB:", error);
    return false;
  }
};

export const db = {
  getItem: async <T>(key: string, defaultValue: T): Promise<T> => {
    if (sql) {
      try {
        const result = await sql`SELECT value FROM app_storage WHERE key = ${key}`;
        if (result.length > 0) {
          return result[0].value as T;
        }
      } catch (error) {
        console.error(`Cloud fetch error for ${key}:`, error);
      }
    }
    
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : defaultValue;
  },

  setItem: async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));

    if (!sql) return;
    try {
      await sql`
        INSERT INTO app_storage (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = CURRENT_TIMESTAMP;
      `;
    } catch (error) {
      console.error(`Cloud save error for ${key}:`, error);
    }
  }
};

import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";
import { openDatabaseSync } from "expo-sqlite";

const DB_NAME = process.env.EXPO_PUBLIC_DB_NAME || "verse_life_app_db3.db";
console.log({ DB_NAME });

export const expoDb = openDatabaseSync(DB_NAME, {
  enableChangeListener: true,
});
export const db = drizzle(expoDb, {
  schema,
});

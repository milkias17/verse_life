import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";
import { openDatabaseSync } from "expo-sqlite";

import { getTableColumns, type SQL, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

const DB_NAME = process.env.EXPO_PUBLIC_DB_NAME || "verse_life_app_db3.db";
console.log({ DB_NAME });

export const expoDb = openDatabaseSync(DB_NAME, {
  enableChangeListener: true,
});
export const db = drizzle(expoDb, {
  schema,
});

export const buildConflictUpdateColumns = <
  T extends SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      if (!cls[column]) {
        return acc;
      }

      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

import { InferSelectModel } from "drizzle-orm";
import { API_URL } from "./constants";
import * as schema from "./db/schema";
import { buildConflictUpdateColumns, db } from "./db";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SyncPullResponse = {
  collections: InferSelectModel<typeof schema.collections>[];
  cards: InferSelectModel<typeof schema.cards>[];
  cardVerses: InferSelectModel<typeof schema.cardVerses>[];
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export async function pull() {
  const lastSync = await AsyncStorage.getItem("syncedAt");
  let url = `${API_URL}/sync/pull`;
  if (lastSync) {
    url += `?lastSync=${lastSync}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Pull failed");
  }

  const data = (await res.json()) as SyncPullResponse;

  let collections = data.collections.map((entity) => ({
    ...entity,
    createdDate: new Date(entity.createdDate),
    updatedDate: entity.updatedDate ? new Date(entity.updatedDate) : undefined,
  }));

  let cards = data.cards.map((entity) => ({
    ...entity,
    createdDate: new Date(entity.createdDate),
    updatedDate: entity.updatedDate ? new Date(entity.updatedDate) : undefined,
  }));

  let cardVerses = data.cardVerses.map((entity) => ({
    ...entity,
    createdDate: new Date(entity.createdDate),
    updatedDate: entity.updatedDate ? new Date(entity.updatedDate) : undefined,
  }));

  if (collections.length > 0) {
    await db
      .insert(schema.collections)
      .values(collections)
      .onConflictDoUpdate({
        target: schema.collections.id,
        set: buildConflictUpdateColumns(
          schema.collections,
          //@ts-ignore
          Object.keys(data.collections[0]),
        ),
      });
  }

  if (cards.length > 0) {
    await db
      .insert(schema.cards)
      .values(cards)
      .onConflictDoUpdate({
        target: schema.cards.id,
        set: buildConflictUpdateColumns(
          schema.cards,
          //@ts-ignore
          Object.keys(data.cards[0]),
        ),
      });
  }

  if (cardVerses.length > 0) {
    await db
      .insert(schema.cardVerses)
      .values(cardVerses)
      .onConflictDoUpdate({
        target: schema.cardVerses.id,
        set: buildConflictUpdateColumns(
          schema.cardVerses,
          //@ts-ignore
          Object.keys(cardVerses[0]),
        ),
      });
  }

  await AsyncStorage.setItem("syncedAt", formatDate(new Date()));
  console.log("Sync PULLED: ", data);
}

export async function push() {
  const lastSync = await AsyncStorage.getItem("syncedAt");
  let lastDate: Date | null = null;
  if (lastSync) {
    lastDate = new Date(lastSync);
  }

  const collections = await db.query.collections.findMany({
    where: (fields, operators) => {
      if (lastDate) {
        return operators.gt(fields.updatedDate, lastDate);
      } else {
        return undefined;
      }
    },
  });

  const cards = await db.query.cards.findMany({
    where: (fields, operators) => {
      if (lastDate) {
        return operators.gt(fields.updatedDate, lastDate);
      } else {
        return undefined;
      }
    },
  });

  const cardVerses = await db.query.cardVerses.findMany({
    where: (fields, operators) => {
      if (lastDate) {
        return operators.gt(fields.updatedDate, lastDate);
      } else {
        return undefined;
      }
    },
  });

  const res = await fetch(`${API_URL}/sync/push`, {
    method: "POST",
    body: JSON.stringify({
      collections,
      cards,
      cardVerses,
    }),
  });

  return res.ok;
}

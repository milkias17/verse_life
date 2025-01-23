import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import uuid from "react-native-uuid";

const date = (name: string) =>
  int(name, {
    mode: "timestamp",
  });

const baseModel = {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid.v4()),
  createdDate: date("created_date")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedDate: date("updated_date")
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
};

export const books = sqliteTable("books", {
  ...baseModel,
  name: text("name").notNull(),
});

export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(bibleChapters),
}));

export const bibleChapters = sqliteTable("bible_chapters", {
  ...baseModel,
  bookId: text("book_id")
    .references(() => books.id)
    .notNull(),
  chapterName: text("chapter_name"),
  chapterNumber: int("chapter_number").notNull(),
});

export const bibleChaptersRelations = relations(
  bibleChapters,
  ({ one, many }) => ({
    book: one(books, {
      fields: [bibleChapters.bookId],
      references: [books.id],
    }),
    verses: many(bibleVerses),
  }),
);

export const bibleVerses = sqliteTable("bible_verses", {
  ...baseModel,
  bibleChapterId: text("bible_chapter_id")
    .notNull()
    .references(() => bibleChapters.id),
  verseNumber: int("verse_number").notNull(),
});

export const bibleVersesRelations = relations(bibleVerses, ({ one, many }) => ({
  chapter: one(bibleChapters, {
    fields: [bibleVerses.bibleChapterId],
    references: [bibleChapters.id],
  }),
  translations: many(translations),
}));

export const languages = sqliteTable("languages", {
  ...baseModel,
  name: text("name").notNull(),
  version: text("version").notNull().unique(),
});

export const languagesRelations = relations(languages, ({ many }) => ({
  verseTranslations: many(translations),
}));

export const translations = sqliteTable("translations", {
  ...baseModel,
  verseId: text("verse_id")
    .notNull()
    .references(() => bibleVerses.id),
  languageId: text("language_id")
    .notNull()
    .references(() => languages.id),
  text: text("text").notNull(),
});

export const translationRelations = relations(translations, ({ one }) => ({
  verse: one(bibleVerses, {
    fields: [translations.verseId],
    references: [bibleVerses.id],
  }),
  language: one(languages, {
    fields: [translations.languageId],
    references: [languages.id],
  }),
}));

export const collections = sqliteTable("collections", {
  ...baseModel,
  name: text("name").notNull().unique(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  cards: many(cards),
}));

export const cards = sqliteTable("cards", {
  ...baseModel,
  collectionId: text("collection_id")
    .notNull()
    .references(() => collections.id),
  verseId: text("verse_id")
    .notNull()
    .references(() => bibleVerses.id),
  lastReviewDate: date("last_review_date")
    .notNull()
    .$defaultFn(() => new Date()),
  easeFactor: int("ease_factor")
    .notNull()
    .$defaultFn(() => 2.5),
  interval: int("interval").notNull().default(0),
  repetitionNumber: int("repetition_number").notNull().default(0),
});

export const cardsRelations = relations(cards, ({ one }) => ({
  collection: one(collections, {
    fields: [cards.collectionId],
    references: [collections.id],
  }),
  verse: one(bibleVerses, {
    fields: [cards.verseId],
    references: [bibleVerses.id],
  }),
}));

export const cardVerses = sqliteTable("card_verses", {
  ...baseModel,
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id),
  verseId: text("verse_id")
    .notNull()
    .references(() => bibleVerses.id),
});

export const cardVersesRelations = relations(cardVerses, ({ one }) => ({
  card: one(cards, {
    fields: [cardVerses.cardId],
    references: [cards.id],
  }),
  verse: one(bibleVerses, {
    fields: [cardVerses.verseId],
    references: [bibleVerses.id],
  }),
}));

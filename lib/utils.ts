import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { books, languages } from "./db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type VerseArgs = {
  language: string;
  version: string;
  book: string;
  chapter: string;
  verse: string;
};

export async function getVerse({
  language,
  version,
  book,
  chapter,
  verse,
}: VerseArgs) {
  const chapterNumber = Number(chapter);
  if (Number.isNaN(chapterNumber)) {
    throw new Error("Invalid chapter number");
  }

  const verseNumber = Number(verse);
  if (Number.isNaN(verseNumber)) {
    throw new Error("Invalid verse number");
  }

  const dbBook = await db.query.books.findFirst({
    where: eq(books.name, book),
    with: {
      chapters: {
        where: (fields, operators) =>
          operators.eq(fields.chapterNumber, chapterNumber),
        columns: {
          id: true,
        },
        with: {
          verses: {
            where: (fields, operators) =>
              operators.eq(fields.verseNumber, verseNumber),
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });
  if (!dbBook) {
    throw new Error("Book not found");
  }

  const verseId = dbBook.chapters[0].verses[0].id;

  const dbLanguage = await db.query.languages.findFirst({
    where: and(eq(languages.name, language), eq(languages.version, version)),
    with: {
      verseTranslations: {
        where: (fields, operators) => operators.eq(fields.verseId, verseId),
        columns: {
          text: true,
        },
      },
    },
  });

  const verseText = dbLanguage?.verseTranslations[0].text;
  if (!verseText) {
    throw new Error("Verse not found");
  }

  return { verseText, verseId };
}

const bibleBooks: { [key: string]: string } = {
  Gen: "Genesis",
  Exod: "Exodus",
  Lev: "Leviticus",
  Num: "Numbers",
  Deut: "Deuteronomy",
  Josh: "Joshua",
  Judg: "Judges",
  Ruth: "Ruth",
  "1 Sam": "1 Samuel",
  "2 Sam": "2 Samuel",
  "1 Kgs": "1 Kings",
  "2 Kgs": "2 Kings",
  "1 Chr": "1 Chronicles",
  "2 Chr": "2 Chronicles",
  Ezra: "Ezra",
  Neh: "Nehemiah",
  Esth: "Esther",
  Job: "Job",
  Ps: "Psalms",
  Prov: "Proverbs",
  Eccl: "Ecclesiastes",
  Song: "Song of Solomon",
  Isa: "Isaiah",
  Jer: "Jeremiah",
  Lam: "Lamentations",
  Ezek: "Ezekiel",
  Dan: "Daniel",
  Hos: "Hosea",
  Joel: "Joel",
  Amos: "Amos",
  Obad: "Obadiah",
  Jonah: "Jonah",
  Mic: "Micah",
  Nah: "Nahum",
  Hab: "Habakkuk",
  Zeph: "Zephaniah",
  Hag: "Haggai",
  Zech: "Zechariah",
  Mal: "Malachi",
  Matt: "Matthew",
  Mark: "Mark",
  Luke: "Luke",
  John: "John",
  Acts: "Acts",
  Rom: "Romans",
  "1 Cor": "1 Corinthians",
  "2 Cor": "2 Corinthians",
  Gal: "Galatians",
  Eph: "Ephesians",
  Phil: "Philippians",
  Col: "Colossians",
  "1 Thess": "1 Thessalonians",
  "2 Thess": "2 Thessalonians",
  "1 Tim": "1 Timothy",
  "2 Tim": "2 Timothy",
  Titus: "Titus",
  Phlm: "Philemon",
  Heb: "Hebrews",
  Jas: "James",
  "1 Pet": "1 Peter",
  "2 Pet": "2 Peter",
  "1 John": "1 John",
  "2 John": "2 John",
  "3 John": "3 John",
  Jude: "Jude",
  Rev: "Revelation",
};

export function getVerboseBookName(shortName: string): string {
  return bibleBooks[shortName] || "Unknown book";
}

export async function getUser() {
  try {
    return await AsyncStorage.getItem("session");
  } catch (e) {
    console.error(e);
    return null;
  }
}

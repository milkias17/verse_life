import json
from typing import Dict
import uuid
import sqlite3
from datetime import datetime

cur_date = datetime.now().timestamp()

json_file = open("verses-1769.json")

data = json.load(json_file)

conn = sqlite3.connect("verses.db")

cursor = conn.cursor()

book_abbreviations = {
    "Genesis": "Gen",
    "Exodus": "Exod",
    "Leviticus": "Lev",
    "Numbers": "Num",
    "Deuteronomy": "Deut",
    "Joshua": "Josh",
    "Judges": "Judg",
    "Ruth": "Ruth",
    "1 Samuel": "1 Sam",
    "2 Samuel": "2 Sam",
    "1 Kings": "1 Kgs",
    "2 Kings": "2 Kgs",
    "1 Chronicles": "1 Chr",
    "2 Chronicles": "2 Chr",
    "Ezra": "Ezra",
    "Nehemiah": "Neh",
    "Esther": "Esth",
    "Job": "Job",
    "Psalms": "Ps",
    "Proverbs": "Prov",
    "Ecclesiastes": "Eccl",
    "Solomon's Song": "Song",
    "Isaiah": "Isa",
    "Jeremiah": "Jer",
    "Lamentations": "Lam",
    "Ezekiel": "Ezek",
    "Daniel": "Dan",
    "Hosea": "Hos",
    "Joel": "Joel",
    "Amos": "Amos",
    "Obadiah": "Obad",
    "Jonah": "Jonah",
    "Micah": "Mic",
    "Nahum": "Nah",
    "Habakkuk": "Hab",
    "Zephaniah": "Zeph",
    "Haggai": "Hag",
    "Zechariah": "Zech",
    "Malachi": "Mal",
    "Matthew": "Matt",
    "Mark": "Mark",
    "Luke": "Luke",
    "John": "John",
    "Acts": "Acts",
    "Romans": "Rom",
    "1 Corinthians": "1 Cor",
    "2 Corinthians": "2 Cor",
    "Galatians": "Gal",
    "Ephesians": "Eph",
    "Philippians": "Phil",
    "Colossians": "Col",
    "1 Thessalonians": "1 Thess",
    "2 Thessalonians": "2 Thess",
    "1 Timothy": "1 Tim",
    "2 Timothy": "2 Tim",
    "Titus": "Titus",
    "Philemon": "Phlm",
    "Hebrews": "Heb",
    "James": "Jas",
    "1 Peter": "1 Pet",
    "2 Peter": "2 Pet",
    "1 John": "1 John",
    "2 John": "2 John",
    "3 John": "3 John",
    "Jude": "Jude",
    "Revelation": "Rev",
}


books: Dict[str, str] = {}
chapters: Dict[str, list[str]] = {}

chapter_to_id_mapper: Dict[str, str] = {}

language_id = str(uuid.uuid4())
cursor.execute(
    "INSERT INTO languages (id, created_date, updated_date, name, version) VALUES (?, ?, ?, ?, ?)",
    (language_id, cur_date, cur_date, "en", "KJV"),
)

for k, v in data.items():
    tmp_split = k.split(" ")
    book_name = book_abbreviations[" ".join(tmp_split[0 : len(tmp_split) - 1])]
    chapter, verse = tmp_split[len(tmp_split) - 1].split(":")
    if book_name not in books:
        gen_uuid = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO books (id, created_date, updated_date, name) VALUES(?, ?, ?, ?)",
            (gen_uuid, cur_date, cur_date, book_name),
        )
        books[book_name] = gen_uuid

    book_id = books[book_name]
    if book_id not in chapters:
        chapters[book_id] = []

    if chapter not in chapters[book_id]:
        chapters[book_id].append(chapter)
        gen_uuid = str(uuid.uuid4())
        cursor.execute(
            "INSERT into bible_chapters (id, created_date, updated_date, book_id, chapter_number) VALUES(?, ?, ?, ?, ?)",
            (gen_uuid, cur_date, cur_date, book_id, chapter),
        )
        chapter_to_id_mapper[chapter] = gen_uuid

    chapter_id = chapter_to_id_mapper[chapter]
    verse_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO bible_verses (id, created_date, updated_date, bible_chapter_id, verse_number) VALUES(?, ?, ?, ?, ?)",
        (verse_id, cur_date, cur_date, chapter_id, verse),
    )

    translation_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO translations (id, created_date, updated_date, verse_id, language_id, text) VALUES(?, ?, ?, ?, ?, ?)",
        (translation_id, cur_date, cur_date, verse_id, language_id, v),
    )
    print(f"Inserted verse: {k}")


conn.commit()

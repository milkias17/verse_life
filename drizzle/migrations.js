// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_round_squadron_sinister.sql';
import m0001 from './0001_seed-books.sql';
import m0002 from './0002_seed-chapters.sql';
import m0003 from './0003_seed-verses.sql';
import m0004 from './0004_seed-translations.sql';
import m0005 from './0005_deep_the_anarchist.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  
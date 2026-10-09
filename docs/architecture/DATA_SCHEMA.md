# Data Schema

All persistence goes through `StorageAdapter` (see `core/js/adapter/storage.js`). Values are stored as JSON strings. Keys are identical on every platform.

## Storage Keys (`core/js/storage.js → STORAGE_KEYS`)

| Key | Contents |
|---|---|
| `quran_memorization_config` | User configuration object |
| `quran_memorization_items` | Array of memorization items |
| `quran_memorization_current_view` | Last active view id |
| `quran_memorization_install_prompt_shown` | PWA install-prompt flag |
| `quran_surah_metadata` | Cached surah metadata from alquran.cloud API |
| `quran_memorization_backlog_queue` | Missed-review backlog queue |

## Config Schema

Written by `Storage.saveConfig()`:

```jsonc
{
  "unit_type": "page",          // page | verse | quarter_hizb | hizb | juz
  "total_units": 30,            // total units in the plan
  "start_date": "2026-01-01",   // memorization start date
  "progression_name": "",       // optional user label
  "language": "ar",             // ar | en
  "theme": "light",             // light | dark
  "morning_hour": 6,            // morning session boundary hour
  "evening_hour": 20,           // evening session boundary hour
  "start_page": 1,              // first page/unit of the plan
  "unit_size": null,            // only for unit_type === 'page' (partial-page size)
  "enable_haptics": true,
  "updated_at": "<ISO timestamp>"
}
```

Defaults come from `DEFAULT_CONFIG` in `core/js/constants.js`.

## Item Schema

Each memorized unit:

```jsonc
{
  "id": "item-<unitType>-<number>-<date>",   // stable ID pattern; duplicate-guarded in saveItem()
  "content_reference": { /* surah/page/unit reference */ },
  "number": 5,                 // unit number within the plan
  "date_memorized": "2026-01-01",
  "status": "active",          // active | archived  (ITEM_STATUS)
  "reviews_completed": ["1-2026-01-01", "2-2026-01-01", "4-2026-01-04"],
  "reviews_missed": []
}
```

### Review tracking format

A review entry is the string `"<stationNumber>-<YYYY-MM-DD>"`:

- Completing a review pushes `<station>-<today>` into `reviews_completed` and removes it from `reviews_missed`.
- Un-completing reverses this.
- Station numbers are 1–7 per the [7-station algorithm](../features/MemorizationRules.md); expected day offsets are `[0, 0, 1, 4, 11, 25, 55]` (`REVIEW_OFFSETS`).

## Backlog Queue

Managed by `core/js/backlog.js` using constants from `constants.js`:

```js
BACKLOG_SPREAD_OPTIONS = [3, 5, 7];        // days over which to spread missed reviews
BACKLOG_DAILY_CAPACITY = 5;                // max backlog tasks per day
BACKLOG_OVERDUE_THRESHOLD_DAYS = 2;
BACKLOG_STATION_PRIORITY = {3:1, 4:2, 5:3, 6:4, 7:5}; // earlier stations reprioritized first
```

## Task Priority (`PRIORITY`)

| Level | Meaning |
|---|---|
| 1 `NEW` | Today's new memorization |
| 2 `YESTERDAY` | Yesterday's maintenance review |
| 3 `SPACED` | Stations 4–7 spaced reviews due today |
| 4 `CATCHUP` | Overdue/backlog catch-up tasks |

## Export / Import

`Storage.exportData()` / `importData()` serialize config + items + backlog to/from a JSON payload — usable as manual backup and for migrating between platforms.

## Surah Metadata Cache

Raw response shape from `https://api.alquran.cloud/v1/surah` is cached under `quran_surah_metadata`; `QuranAPI._getSurahsArray()` normalizes both array and object response shapes.

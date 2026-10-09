# Styling & Design Guidelines

## Design Tokens

All colors are **HSL channel triplets** in CSS custom properties (`themes.css`), shadcn-style, consumed via `hsl(var(--token))`. Both light and dark palettes are defined; theme switching toggles the palette (handled by `core/js/theme.js`, persisted in config).

### Token Reference

| Token | Purpose |
|---|---|
| `--background` / `--foreground` | Page background / default text |
| `--card` / `--card-foreground` | Card surfaces |
| `--popover` / `--popover-foreground` | Menus/dialogs |
| `--primary` / `--primary-foreground` | Primary actions |
| `--secondary` / `--secondary-foreground` | Secondary elements |
| `--muted` / `--muted-foreground` | De-emphasized text/surfaces |
| `--accent` / `--accent-foreground` | Accents/highlights |
| `--destructive` / `--destructive-foreground` | Errors/danger actions |
| `--success` / `--success-foreground` | Completed states |
| `--border`, `--input`, `--ring` | Outlines, form inputs, focus rings |

**Rule:** never hard-code colors — always use tokens so dark mode and future themes work.

Example (light): `--background: 0 0% 100%`, `--primary: 222.2 47.4% 11.2%`; page `theme-color` meta is `#0f172a`.

## Stylesheet Layers

Load order matters (all in `core/css/`):

1. `fonts.css` — @font-face declarations
2. `themes.css` — token definitions (light + dark)
3. `components.css` — reusable component styles (cards, buttons, toggles, task items)
4. `styles.css` — global/base layout
5. `navigation.css` — bottom nav / view navigation

## Typography

Arabic-first Quranic typography via bundled fonts (`core/assets/fonts/`):

| Font | Use |
|---|---|
| **Amiri Regular** | Quranic text rendering |
| **Scheherazade New** (Regular/Bold) | Alternative Quranic text style |
| **IBM Plex Sans Arabic** (Regular/Bold) | UI text (Arabic + Latin) |

Fonts ship with every platform bundle (extensions include them under `assets/fonts/`) — no network font requests.

## Internationalization & RTL

- Default language: **Arabic**; English available (`i18n.js`).
- All static text uses `data-i18n="key"` attributes populated at runtime.
- RTL layout must be preserved: avoid directional margins/paddings where logical properties (`margin-inline-start`, etc.) work.
- Extension store listings also have ar/en locale files (`_locales/`).

## Component Conventions

- Cards use `.card`, titles `.card-title`, descriptions `.card-description`.
- Segmented option pickers use `.toggle-options` with `.toggle-option` buttons carrying `data-value` (seen in setup for unit type/language/theme).
- Form inputs use `.input` inside `.form-group`.
- Views are `.view` containers toggled with `.hidden`; ids match `VIEWS` constants (`setup-view`, `today-view`, ...).

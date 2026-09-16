# Migration Notes — Static Site → Laravel + Inertia/Vue Admin

This site is being built as plain HTML/CSS/JS on purpose (fast, no build step,
fits the 26 Sept deadline). It's structured so moving it into Laravel later
is a mechanical file move, not a rewrite. This doc is the map for that move.

## The core idea

The public diagram pages stay **vanilla JS forever** — only the admin panel
becomes Laravel+Inertia+Vue. The two meet at one point: the `TPRAF_CONTENT`
data object. Today it's hand-written in `content.js`. Later it's the same
shape of object, printed by Blade from a database. Nothing else about the
diagram rendering (`app.js`) needs to change.

## File-by-file mapping

| Today (static site) | Becomes (Laravel app) | Changes needed |
|---|---|---|
| `site/index.html` | `resources/views/index.blade.php` | Wrap `PAGE:CONTENT` block in `@extends('layouts.app')` / `@section('content')` |
| `site/diagram.html` | `resources/views/diagram.blade.php` | Same as above |
| `<header class="site-header">...</header>` (duplicated in both files, marked `LAYOUT:HEADER`) | `resources/views/layouts/app.blade.php` | Copy once into the shared layout; delete duplicates |
| `site/assets/css/style.css` | `public/assets/css/style.css` | None — copy as-is |
| `site/assets/js/app.js` | `public/assets/js/app.js` | None — copy as-is (see note in the file header) |
| `site/assets/js/content.js` | Database table(s) + a Controller | Rewritten — see below |
| Asset `href="assets/..."` paths | `{{ asset('assets/...') }}` | One-line swap per `<link>`/`<script>` tag |
| N/A | `resources/views/admin/*.blade.php` (Inertia+Vue pages) | New — the editing UI, doesn't exist yet |

## `content.js` → database

Each entry in `TPRAF_CONTENT` (e.g. `simple.boxes`, `simple.labels`,
`simple.arrows`) becomes rows in a table — roughly:

- `tpraf_views` (id, key e.g. `simple`/`extended`/`dsp`/`imp`, title, subtitle)
- `tpraf_boxes` (view_id, box_key, label, text, is_placeholder, handbook_url, pos_left, pos_top, pos_width, pos_height)
- `tpraf_labels` (view_id, label_key, label, text, is_placeholder, type, pos_left, pos_top, pos_width, pos_height)
- `tpraf_arrows` / `tpraf_feedback_paths` (view_id, points as JSON)

A Controller loads a view's rows, reshapes them back into the exact same
JSON shape `content.js` uses today, and the Blade view prints it:

```blade
<script>const TPRAF_CONTENT = @json($tprafContent);</script>
<script src="{{ asset('assets/js/app.js') }}"></script>
```

`app.js` doesn't know or care whether that object came from a static file
or a database — it just reads `TPRAF_CONTENT`.

## Admin panel (new, not a migration)

Built with Laravel + Inertia + Vue on top of the same tables above:
simple forms to edit box/label text, positions, and handbook links,
saving through normal Eloquent models. This is new work, not a port of
any existing file.

## Hosting

- Needs SSH + Composer access on SiteGround (confirm plan supports it) and a MySQL database.
- Static site today needs neither — just file upload to a subdomain folder.

## When this happens

Not before the 20 Sept working demo. Planned as Milestone B / post-launch
work — see `PLAN.md`.

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
| `site/index.html` | `resources/views/index.blade.php` | Wrap `PAGE:CONTENT` block in `@extends('layouts.app')` / `@section('content')`. Note it also hosts an embedded copy of the diagram markup — see below. |
| `site/diagram.html` | `resources/views/diagram.blade.php` | Same as above |
| `<header class="site-header">...</header>` (duplicated in both files, marked `LAYOUT:HEADER`) | `resources/views/layouts/app.blade.php` | Copy once into the shared layout; delete duplicates |
| `<footer class="site-footer">...</footer>` (duplicated in both files, marked `LAYOUT:FOOTER`) | Same layout partial | Copy once; delete duplicates |
| Diagram markup + `#modal-backdrop` (duplicated in both files: full version with level tabs on `diagram.html`, tabs removed on `index.html`) | `resources/views/partials/diagram.blade.php` | Extract once and `@include` it on both pages — this duplication is a candidate for collapsing at migration time |
| `site/assets/css/style.css` | `public/assets/css/style.css` | None — copy as-is |
| `site/assets/js/app.js` | `public/assets/js/app.js` | None — copy as-is (see note in the file header) |
| `site/assets/js/content.js` | Database table(s) + a Controller | Rewritten — see below |
| Asset `href="assets/..."` paths | `{{ asset('assets/...') }}` | One-line swap per `<link>`/`<script>` tag |
| N/A | `resources/views/admin/*.blade.php` (Inertia+Vue pages) | New — the editing UI, doesn't exist yet |

## The landing page embeds the diagram

`index.html` renders the Level 1 simple form itself, not a picture of it:
slide 2 asks for the simple form to feature on the landing page, with a
button into the extended form. It therefore loads `content.js` + `app.js`
and carries the same stage/guide/modal markup as `diagram.html`, minus the
level tabs, so it stays pinned to the `simple` view.

Two consequences worth knowing:

- **URL deep links.** `app.js` reads a `#view` hash on load (`#extended`,
  `#dsp`, `#imp`) and writes one on tab click, so the landing page's
  "Explore TPRAF" button (`diagram.html#extended`) lands on the extended
  form. Any hash that isn't a real view key is ignored, which keeps the
  landing page's own `#what-is-tpraf` anchor working.
- **Where `TPRAF_CONTENT` comes from.** Both pages read the same global, so
  the Blade change in the table below covers the embedded instance too —
  one `@json($tprafContent)` per page, nothing else.

When this becomes Blade, the duplicated block is the obvious thing to
collapse into one included partial rather than copied twice.

## `content.js` → database

Each entry in `TPRAF_CONTENT` (e.g. `simple.boxes`, `simple.labels`,
`simple.arrows`) becomes rows in a table — roughly:

- `tpraf_views` (id, key e.g. `simple`/`extended`/`dsp`/`imp`, title, subtitle, next_view_key nullable, next_view_label nullable — the per-view "go deeper" link)
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

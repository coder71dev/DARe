# DARe TPRAF — website and admin panel

The interactive TPRAF (Transport Performance and Risk Analysis Framework)
site for the DARe Hub: a home page and a diagram page with four levels
(Level 1 Simple and Extended, Level 2 DSP and IMP), plus an admin panel so
DARe can edit the content themselves.

- **Review site:** https://tpraf.coder71.com
- **Final home (planned):** https://www.dare.ac.uk/tpraf, on DARe's SiteGround hosting
- **Handbook it links to:** https://handbook.dare.ac.uk

## How it is built

| Part | What it is |
|---|---|
| Public pages | Blade templates (`resources/views`) plus plain JS/CSS in `public/assets` (`app.js` draws the diagrams and runs the tours) |
| Admin panel | Laravel 13 + Inertia + Vue (`resources/js/Pages/Admin`) |
| Database | SQLite (`database/database.sqlite`) |
| Diagram content | Tables `tpraf_views`, `tpraf_elements`, `tpraf_lessons`, `tpraf_case_studies`, turned into the page's `TPRAF_CONTENT` by `app/Services/TprafContentAssembler.php` |

Content fixes for the client are made as **data migrations** (see
`database/migrations/2026_11_*`), so they ship with a deploy and only
change what the admin hasn't already edited.

## What admins can do

- **Pages:** edit page blocks, header menu, images (Admin → Pages).
- **Diagrams:** edit box labels, popup text and handbook links (Admin → Diagrams).
- **Case studies:** add, edit, reorder, publish and delete the case-study
  walkthroughs on Level 1 Extended; each step picks the boxes it lights up
  (Admin → Case studies).
- **Live Edit:** click text and pictures on the public pages to edit them in
  place — including the case-study cards (name, intro, step heading, text,
  caption, pictures). Boxes and steps themselves are changed in the admin.

## Diagram features worth knowing

- A level can be hidden without deleting it (`tpraf_views.is_hidden`) — Level 3 – Example is hidden this way.
- Level 1 Extended shows **case studies** instead of "Take a tour" / "Play walkthrough". Only published case studies with at least one step appear.
- Every box can link to a handbook page or section (`handbook_url`, e.g. `/dsp/technical-processes/outcome-assessment#...`), joined onto `TPRAF_HANDBOOK_URL`.
- Script and style links carry a version stamp, so browsers and Cloudflare pick up changes straight away.

## Running it locally

```bash
composer setup        # install, .env, key, migrate, build
php artisan serve     # or: composer run dev
```

Tests: `php artisan test --compact` (`ExampleTest` is a known old failure — it
hits the home page without its seeded content).

## Settings (`.env`)

| Setting | Notes |
|---|---|
| `APP_URL` | The full public address, including a sub-folder if there is one (e.g. `https://www.dare.ac.uk/tpraf`). Links and pictures are built from it. |
| `TPRAF_HANDBOOK_URL` | Handbook address the box links join onto. Default `https://handbook.dare.ac.uk`. |
| `DB_CONNECTION=sqlite`, `SESSION_DRIVER=database` | The web server user must be able to **write** both the database file and its folder. |

## Deploying

The review site (tpraf.coder71.com) runs on aaPanel/nginx behind Cloudflare.

1. **Prefer file-only zips.** Once DARe edits content on the live site, a zip
   containing `database/database.sqlite` would overwrite their changes. Ship
   only the changed files; if a database change is needed, ship the migration
   and run `php artisan migrate --force` on the server.
2. Unzip over the site folder, then give files back to the web server user
   and clear Laravel's caches:
   ```bash
   chown -R www:www app public resources routes database storage bootstrap/cache
   php artisan optimize:clear
   ```
   Skipping the `chown` gives "attempt to write a readonly database".
3. Uploaded images are served by an nginx alias rather than `storage:link`
   (the host blocks `symlink`): `location ^~ /storage/ { alias <site>/storage/app/public/; }`.
4. Admin front-end changes need `npm run build` first; `public/build` is not in git.

### Moving to www.dare.ac.uk/tpraf (SiteGround)

Planned once DARe approves the review site. Their main site (WordPress) is on
the same hosting, so this is done once, at the end:

- Check the PHP version (8.4) and the extensions Laravel needs.
- Keep the app outside `public_html`; expose only its `public/` folder as `/tpraf`.
- Add `.htaccess` rules so WordPress doesn't catch `/tpraf` addresses.
- Set `APP_URL=https://www.dare.ac.uk/tpraf`, then migrate and check file permissions.
- The code already supports a sub-folder (site links, pictures, admin saves).

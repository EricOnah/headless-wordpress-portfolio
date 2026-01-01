# Headless WordPress Portfolio (Next.js + Composer Bedrock)

A Next.js + React portfolio wired for headless WordPress. It includes a Composer-based WordPress (Bedrock) backend, plus a frontend that consumes the WP REST API (or uses built-in demo data) and renders case studies.

## Prerequisites
- Node.js 20+ (project uses `nvm`; `npm install` already run)
- Docker (used to run the WordPress stack) or your own PHP/MySQL runtime

---
## Frontend (Next.js)
1) Install dependencies (already done once):
   ```bash
   npm install
   ```
2) Create `.env.local` with your WordPress base URL (no trailing slash):
   ```bash
   NEXT_PUBLIC_WORDPRESS_API_URL=https://your-site.com
   ```
3) Start the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

### How WordPress data is used
- `src/lib/wordpress.ts` fetches posts from `wp-json/wp/v2/posts?status=publish&_embed=1` and normalizes title, excerpt, content, featured media, and tags.
- If `NEXT_PUBLIC_WORDPRESS_API_URL` is missing, the UI uses curated mock projects so the site still renders.
- ISR: fetch calls revalidate every 5 minutes by default.

### App structure
- `src/app/page.tsx`: Hero + featured case + recent projects pulled from WordPress.
- `src/app/projects/page.tsx`: Archive of projects.
- `src/app/projects/[slug]/page.tsx`: Individual project detail with rich text rendering.
- `src/components/project-card.tsx`: Shared card for listing projects.
- `src/app/globals.css`: Theming and rich text defaults.

---
## Backend (Composer Bedrock WordPress)
- Location: `wordpress/` (created via `composer create-project roots/bedrock wordpress`).
- Config: `wordpress/.env` (already seeded with dev defaults and salts).

### Run locally with Docker
1) Ensure Docker is running.
2) From the repo root:
   ```bash
   docker compose up -d
   ```
   This starts:
   - `db` (MySQL 8) on port `3306`
   - `wordpress` (PHP-FPM) using the Bedrock codebase
   - `nginx` serving Bedrock on `http://localhost:8080`

3) Complete WordPress install:
   - Open `http://localhost:8080/wp/wp-admin/install.php` and set the site/admin user.
   - WP_HOME/WP_SITEURL are already set to `http://localhost:8080` in `wordpress/.env`.

### Adjusting config
- Update `wordpress/.env` for your own DB credentials, hostnames, or production settings.
- To point the frontend at this local instance, set:
  ```bash
  NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:8080
  ```

---
## Next steps
- Map additional WordPress fields (ACF or custom post types) in `src/lib/wordpress.ts`.
- Wire deploys (Vercel/Netlify for frontend; your host for Bedrock) and provide the matching env vars.

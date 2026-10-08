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
- Projects use the dedicated portfolio_project custom post type through src/lib/portfolio-projects.ts. CV-based fallback projects are used if the CMS is unavailable or no API URL is configured.
- Blog fetch calls revalidate every 5 minutes. Dashboard-managed profile, skills, experience, and project content are fetched without caching.

### App structure
- src/app/page.tsx: Hero, professional profile, skills, experience, featured projects, and recent posts.
- `src/app/projects/page.tsx`: Archive of projects.
- src/app/projects/[slug]/page.tsx: Individual project information from the same WordPress project entries.
- src/components/portfolio-projects-explorer.tsx: Filterable CMS project cards. project-card.tsx still serves the blog listing.
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

## Dashboard-managed profile picture
- In WordPress, open **Profile Pictures → Homepage profile picture**.
- Replace **Profile photo** (the featured image), then click **Update**.
- Edit **Display name** and **Headline** in the **Name and headline** box to change the two text lines beside the portrait throughout the navigation. Click **Update**, then refresh the frontend. The most recently modified published Profile Picture supplies both the portrait and these lines.
- The REST endpoint is `/wp-json/wp/v2/profile-pictures`. This works independently of the manual project/blog setting.
- The server uses `WORDPRESS_API_URL`, or `NEXT_PUBLIC_WORDPRESS_API_URL` when the former is absent. Both site-root and `/wp-json` URLs are accepted.
- `wordpress/web/app/mu-plugins/portfolio-profile-pictures.php` registers the content type automatically. Keep this file when deploying the WordPress backend.
- If WordPress is unavailable or the published entry has no photo, the supplied photo at `public/profile-picture.jpg` is used.

## Dashboard-managed professional profile
- Open **Professional Profiles → Homepage professional profile** in WordPress.
- Edit the summary heading, both paragraphs, availability, email, phone, LinkedIn/GitHub URLs, then click **Update**.
- Refresh the homepage to see your changes. The most recently modified published profile supplies this section.
- The REST endpoint is /wp-json/wp/v2/professional-profiles; the server fetches it without caching, independently of manual project/blog data.
- Keep wordpress/web/app/mu-plugins/portfolio-professional-profiles.php when deploying WordPress. If the CMS is unavailable or no published profile exists, the original content is used.

### Resume file
In the Professional Profile editor, use **Resume → Upload / select resume** to upload a PDF or Word document or choose one from the Media Library. Click **Update**. A **View resume** link appears in the homepage contact panel. **Remove resume**, followed by **Update**, hides the link and preserves the file in the Media Library.

## Dashboard-managed skills
- Open **Skills** in WordPress to edit, add, publish, or unpublish categories. The title is the card heading; **Order** controls placement (lower numbers first).
- Add skills one per line. Prefix a line with `*` to highlight that technology. Counts are calculated from published categories.
- Each category has a short filter label, subtitle, description, icon, accent color, optional proficiency meter, optional highlights (`Label | Value` per line), and footer text. A percentage of `0` hides the proficiency meter. The wide-card option spans two columns on desktop.
- Open **Skills → Section Content → Portfolio skills section** to edit the introduction, status labels, search placeholder, core stack, and callout. Core stack items use `Technology | Subtitle`, one per line.
- The callout uses the resume already selected in **Professional Profiles**. Its other button defaults to `/contact`.
- Click **Update**, then refresh the homepage or About page. Both use the same CMS content without caching. The most recently modified published Section Content entry is selected.
- REST endpoints: `/wp-json/wp/v2/skill-categories` and `/wp-json/wp/v2/skills-sections`. Keep `wordpress/web/app/mu-plugins/portfolio-skills.php` when deploying the backend.
- If the CMS is unavailable, the existing skill lists are used as a fallback. Unpublishing every category intentionally leaves the category grid empty.
- Reference: `stitch_skills_section_redesign/`. Fonts are served locally in `public/fonts/` with their license files.
### CMS plugin source and installation
The frontend and Bedrock WordPress configuration share this repository; `wordpress/` is a normal directory, not a submodule. Run `composer install` inside `wordpress/` after checkout to install WordPress core and dependencies. Portfolio plugin sources are maintained in `cms/mu-plugins/`; run `bash cms/install-mu-plugins.sh` from WSL after checkout or editing these sources to install them into the local Bedrock backend. Deploy the files in that source directory to the WordPress host's mu-plugins directory. Copy `wordpress/.env.example` to `wordpress/.env` and configure the environment separately. Credentials, installed dependencies, uploaded media, database exports, deployment archives, and local temporary files are excluded from Git; back up the database and uploads separately.
## Dashboard-managed experience
- Open **Experience** to edit or add roles. The post title is the job title. **Order** controls placement (lower first); publish/unpublish controls visibility.
- Edit company, dates, location, engagement, status badge, role overview, achievements, technology tags, and results panel. Enter achievements and tags one per line; prefix a tag with `*` to highlight it.
- The **Current / active role**, **Contract**, and **Remote** checkboxes control filters. Counts are calculated from published roles. Techlink keeps the resume's `2025–2026` date range; only the role explicitly dated Present is marked active initially.
- Optional progress fields accept a number from 0 to 100; 0 hides the bar. The displayed value can include units or explanatory text.
- Open **Experience → Section Content → Portfolio experience section** to change the introduction, filter labels, header metrics (`Label | Value | Caption` per line), delivery principles (`Title | Description` per line), and callout.
- The resume button uses the file selected in **Professional Profiles**. Click **Update**, then refresh the homepage or About page. Both use the same content without caching.
- Initial roles, dates, and achievement figures come from the uploaded `Eric_Onah_Resume_full-stack.pdf`. The reference's sample companies and unsupported benchmark claims are replaced with resume information.
- REST endpoints: `/wp-json/wp/v2/experience-roles` and `/wp-json/wp/v2/experience-sections`. The most recently updated published section entry is used; categories use Order.
- Plugin source: `cms/mu-plugins/portfolio-experience.php`. Run `bash cms/install-mu-plugins.sh` after changing it or checking out the project. If WordPress is unavailable, resume-based fallback content is used; an empty published role list stays empty.

## Dashboard-managed projects

- Open **Projects** in WordPress. Each published entry supplies a card on the Projects page.
- Edit the title, category, badge, description, technical highlight, tags (one per line), and **Live website / View URL**. The View button opens that URL in a new tab.
- Replace **Featured image** to change the preview. Entries without an image show a neutral project illustration.
- In the editor sidebar, open **Featured Project** and check **Show on homepage** to feature the project; uncheck to keep it only in the archive. Click **Update**. The project list has a **Featured Project** column so featured entries are easy to identify. **Order** controls placement (lower first).
- Open **Projects → Section Content → Projects Section** to edit the introduction, heading, filter/action labels, architecture principles, and callout. Principles use Title | Description, one per line.
- The resume action uses the file selected in **Professional Profiles**. Update and refresh the frontend to see edits.
- Seven CV projects are initially featured: OMONOIA Foundation, OMONOIA E-Shop, GREE Cyprus, GDM Architecture, Servbank, OfficeStar, and Ablebook. The archive adds Kriztech Agency, Four Day Clearance, OMONOIA FC, Prosperity Group, Great Place to Work Cyprus/Jordan, and ISK.
- Project-specific dates and performance figures are omitted because they are not supplied in the CV. Additional sites use short website descriptions rather than invented contributions.
- REST endpoints: /wp-json/wp/v2/portfolio-projects and /wp-json/wp/v2/project-sections. All published pages are loaded; categories and counts derive from CMS entries. An empty published collection stays empty.
- Plugin source: cms/mu-plugins/portfolio-projects.php; install using bash cms/install-mu-plugins.sh. The frontend uses WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL, accepting site-root or /wp-json URLs.
- To populate a fresh local backend, run ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-projects.php, then optionally run the same command for cms/seed-project-images.php. Seeders skip existing projects and featured images to preserve dashboard edits.
- Four site previews captured during implementation are stored in public/projects/ and imported into the local Media Library. Sites that blocked or declined browser access retain editable placeholders. The design reference is in Projects/.

## Dashboard-managed education & certifications

- Open **Education & Certifications → About education & certifications** in WordPress.
- Edit both section labels/headings, degree, institution, dates, and the certification badge text.
- Enter certifications one per line. Remove a line to remove a certification, or clear the list to show no certification cards.
- Click **Update**, then refresh the About page. The latest updated published entry supplies the section without caching.
- Plugin source: cms/mu-plugins/portfolio-education.php. Install using bash cms/install-mu-plugins.sh. REST endpoint: /wp-json/wp/v2/education-profiles.
- Fresh local installations can use ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-education.php. This preserves existing entries. Original content is used if WordPress is unavailable or no published profile exists.
## WordPress Posts page

- The redesigned Posts page uses only published, standard WordPress posts. Create or edit them under **Posts**, using title, article body, excerpt, categories, tags, and Featured image.
- All published posts are loaded across REST pages, ordered newest first. Drafts are excluded; password-protected article content stays private. No demo articles appear when the CMS is empty or unavailable.
- The **Latest WordPress notes** group uses sticky posts. Mark a post **Stick to the top of the blog** to select it for this group. When no posts are sticky, the four newest published posts are selected. Remaining posts appear once in the archive.
- Category pills and search filter the same collection. Counts and estimated reading times derive from actual content, with reading time estimated at 200 words per minute.
- Open **Posts → Page Content → Posts page content** to change the introduction, headings, status and filter labels, empty/error messages, publishing principles, and bottom callout. Principles use Title | Description | Footer, one per line.
- Click **Update** or **Publish**, then refresh. Post details, category pages, and the archive read WordPress without caching.
- The RSS feed is available at /posts/feed.xml and links to frontend article pages. The callout offers RSS and the configurable contact link; no newsletter service is implied.
- Plugin source: cms/mu-plugins/portfolio-posts.php. Install using bash cms/install-mu-plugins.sh. A fresh backend can seed page copy with ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-posts-section.php; existing page entries are preserved.
- Content endpoints: /wp-json/wp/v2/posts and /wp-json/wp/v2/posts-sections. The frontend uses WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL, accepting site-root or /wp-json URLs. The legacy manual post helpers are no longer used by Posts routes.
- Reference: Posts/DESIGN.md, Posts/code.html, and Posts/screen.png. Reference sample articles, benchmark claims, draft previews, and GraphQL infrastructure claims are replaced with real content and descriptions of the current publishing workflow.
## Dashboard-managed Contact page

- Open **Contact Page → Contact page content** in WordPress to edit the introduction, Direct lines heading, email, phone, WhatsApp URL, LinkedIn/GitHub links and labels, and project-focus list.
- Enter focus items one per line. Clear a social or WhatsApp URL to hide its link. The WhatsApp URL applies only to the icon; the phone number keeps its telephone link.
- Click **Update**, then refresh the Contact page. The latest updated published entry supplies the content without caching. Existing content is used as a fallback if WordPress is unavailable or no published entry exists.
- Form fields, submission behavior, and email delivery remain configured separately. Changing the displayed contact email does not change the form's recipient.
- Plugin source: cms/mu-plugins/portfolio-contact.php. Install using bash cms/install-mu-plugins.sh. REST endpoint: /wp-json/wp/v2/contact-pages.
- Seed a fresh backend with ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-contact-page.php. Existing entries are preserved.
## Dashboard-managed hero and Moving Work Signal

- Open **Hero & Work Signals → Homepage hero and work signals** in WordPress.
- Edit the section label, display name, professional title, description, button labels/URLs, image alternative text and caption, and Moving Work Signal heading.
- Button URLs accept site paths such as /projects or full http(s) URLs. Clearing a URL or button label hides that button.
- Select **Featured image** to replace the hero illustration. Removing it restores the original WordPress/Next.js illustration.
- Enter work signals as Title | Description, one per line. Add, remove, or reorder lines to control the ticker. Clearing the list hides it. The existing slower animation and pause on hover are preserved.
- Click **Update**, then refresh the homepage. The most recently updated published entry is fetched without caching. Existing content is used when WordPress is unavailable or no published entry exists.
- Plugin source: cms/mu-plugins/portfolio-hero.php. Install using bash cms/install-mu-plugins.sh. REST endpoint: /wp-json/wp/v2/homepage-heroes.
- Seed a fresh backend with ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-hero.php. Existing entries are preserved.
## Dashboard-managed footer

- Open **Footer → Site footer content** in WordPress to edit the display name, headline, email, phone, and LinkedIn/GitHub labels and URLs.
- Click **Update**, then refresh any page. The most recently updated published entry supplies the site-wide footer without caching.
- Clear email, phone, or a social URL to hide that link. Clearing a social label also hides its button.
- Existing footer content is used as a fallback when WordPress is unavailable or no published entry exists.
- Plugin source: cms/mu-plugins/portfolio-footer.php. Install using bash cms/install-mu-plugins.sh. REST endpoint: /wp-json/wp/v2/footer-contents.
- Seed a fresh backend with ddev wp --path=/var/www/html/wordpress/web/wp eval-file /var/www/html/cms/seed-footer.php. Existing entries are preserved.
## Semantic structure and keyboard navigation

- Each page has one focusable main-content landmark and a single page-level heading. The first keyboard link skips the navigation to this content.
- Sections and article cards use named headings. Navigation, certifications, work signals, and technology tags use lists; metrics use description lists; contact details use address elements.
- The hero illustration uses a figure and caption. Article publication dates use time elements. Repeated ticker items are hidden from assistive technology.
- The contact form has associated labels and autocomplete hints. The project-type dropdown supports arrow keys, Home/End, Enter/Space to choose, Escape to cancel, and Tab to leave.
- In WordPress article bodies, start section headings at Heading 2 because the frontend supplies the article title as Heading 1. Give meaningful images appropriate alternative text in the Media Library.

## Section selectors

Use the stable IDs to target or link to sections. Existing styling classes are retained.

| Section | ID |
| --- | --- |
| Hero | hero |
| Moving Work Signal | work-signals |
| Professional summary | professional-summary |
| Skills | skills |
| Core stack / skills callout | core-stack / skills-cta |
| Experience | experience |
| Experience methodology / callout | experience-methodology / experience-cta |
| Homepage featured projects | featured-project |
| Projects archive | projects |
| Project principles / callout | project-principles / projects-cta |
| Homepage contact callout | contact |
| About introduction | about |
| Education and certifications | education-certifications |
| Education / certifications columns | education / certifications |
| Contact introduction / form / direct lines | contact-intro / contact-form / direct-lines |
| Posts page / latest / archive | posts / latest-posts / posts-archive |
| Publishing principles / posts callout | publishing-principles / posts-cta |
| Article / related callout | post-article / next-steps |
| Project detail | project-detail |
| Site header / footer | site-header / footer |

For example, /#hero and /#featured-project target the homepage sections; /projects#projects targets the archive. Main content keeps main-content for the keyboard skip link.

All routes also expose a page class on main-content: home-page, about-page, contact-page, projects-page, posts-page, post-category-page, post-detail-page, project-detail-page, post-not-found-page, and project-not-found-page. Shared and repeated sections retain descriptive classes, including primary-navigation, mobile-navigation, footer-contact, contact-form, skills-card, experience-role, portfolio-card, and posts-note. Use page classes to scope CSS without changing shared section IDs.

## Lighthouse HTTPS audit

Browser-facing public WordPress media URLs are normalized to HTTPS in src/lib/wordpress-media.ts. Local DDEV uploads use the frontend media route so external phone previews can display them over the preview connection. This covers the profile portrait, hero image, project previews, article images, resume, and homepage contact illustration. Server-side API fetching keeps its configured URL.

The configured public WordPress host must serve valid HTTPS. The local wordpress-portfolio.ddev.site media endpoint was checked with certificate validation enabled. HTTP loopback API/media URLs and unrelated external project links are not rewritten.

For final Lighthouse measurements, audit a production build served over HTTPS. Development tooling can produce source-map diagnostics. Security-header, Trusted Types, and Baseline findings marked Unscored in the supplied report do not contribute to that score; configure production hardening separately with compatibility testing.

## Temporary phone preview

Run ngrok http 3000 while the Next.js development server and DDEV are running. The current preview host is allowed in next.config.ts; update allowedDevOrigins if a new tunnel uses another hostname.

Local WordPress uploads are served through /api/wordpress-media/year/month/file so phone browsers do not need to resolve the local DDEV hostname or trust its certificate. The route forwards only image and PDF files from the configured WordPress uploads directory, validates paths and media types, and exposes no WordPress dashboard routes. Public WordPress hosts continue to use HTTPS directly.

The external URL stays available while this computer, the dev server, DDEV, and the ngrok tunnel remain running.

# WordPress source control

WordPress uses the repository's existing Git history alongside the Next.js frontend. Do not initialize a separate repository inside `wordpress/`.

## Files to maintain

- `cms/mu-plugins/`: canonical portfolio plugin sources. Edit these files, then run `bash cms/install-mu-plugins.sh` from the repository root in WSL to update the local Bedrock installation. The installed `portfolio-*.php` copies are ignored.
- `cms/seed-*.php` and seed JSON files: scripts and initial content for setting up a backend.
- `wordpress/composer.json` and `wordpress/composer.lock`: dependency definitions and locked versions. Run `composer install` inside `wordpress/` after checkout.
- `wordpress/config/`, `wordpress/web/index.php`, `wordpress/web/wp-config.php`, `wordpress/wp-cli.yml`, and `wordpress/.env.example`: application configuration without credentials.
- Custom plugins and themes in `wordpress/web/app/plugins/`, `wordpress/web/app/mu-plugins/`, and `wordpress/web/app/themes/`: Git can track new files here. Prefer `cms/mu-plugins/` for portfolio MU plugins so the installation script includes them.

Installed third-party code is excluded by explicit directory rules in `wordpress/.gitignore`. When adding another third-party plugin or theme, add its installation directory to that file. Prefer Composer-managed dependencies and commit the manifest and lockfile together. Yoast Duplicate Post is currently installed separately; reinstall it through WordPress when restoring the backend.

## Review and record changes

From the repository root:

```bash
git status --short -- cms wordpress
git diff -- cms wordpress
git add cms wordpress
git diff --cached --stat
git commit -m "Update WordPress backend"
```

Review newly added files before committing. Local `.env` files, credentials, WordPress core, `vendor/`, uploads, caches, logs, database dumps, and deployment archives are ignored. The legacy standard WordPress installation directly inside `wordpress/` is also ignored; the active DDEV document root is `wordpress/web`.

Git records source files. Dashboard content, settings, and installed-plugin activation live in the database; media lives in uploads. Back up and restore the database and uploads separately.

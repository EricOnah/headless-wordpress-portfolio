# Resume click reporting

Resume links across the frontend send a small request to WordPress when activated, including middle-click and keyboard activation. The root layout installs one listener that survives frontend page navigation. It recognizes the configured Professional Profile resume URL as well as links marked `data-resume-link` (all existing resume buttons). Opening a page, hovering, or prefetching does not record a click.

## Deployment

1. Deploy the backend and run `bash cms/install-mu-plugins.sh` from the repository root. The plugin automatically creates a `portfolio_resume_clicks` table using the configured WordPress table prefix. No plugin activation is needed.
2. Set WordPress `PORTFOLIO_FRONTEND_URL` to the frontend origin without a trailing slash or path. The default is `https://ericonah.online`, which also accepts `https://www.ericonah.online`. For local testing, use the exact local frontend origin, including its port.
3. Deploy the frontend with the existing `WORDPRESS_API_URL` (or `NEXT_PUBLIC_WORDPRESS_API_URL`) pointing to the CMS site root or `/wp-json`. No additional credentials or GA4 configuration are required.
4. Click a resume link, then refresh **WordPress → Dashboard → Portfolio resume clicks** while logged in as an administrator. Check the source page and time. If hidden, enable the widget under Screen Options.

The report shows today's clicks in the WordPress timezone, the rolling last 28 days, all-time counts, the top ten source paths in the last 28 days, and the latest 30 click timestamps. Records are stored in WordPress and included in its database backups. Historical clicks before deployment cannot be recovered.

Only the source pathname and server timestamp are stored, without query strings, fragments, visitor IDs, or raw IP addresses. A temporary salted IP hash limits requests to approximately 60 per minute per source address (best effort; not a distributed abuse guarantee). The endpoint only permits requests with an allowed frontend Origin; this is a public analytics endpoint, and automated clients can still imitate clicks. Counts include repeat clicks, and describe link activations rather than unique people or completed PDF downloads. Tracking can be affected by disabled JavaScript, browser blocking, or network failures. The PDF always opens independently of tracking delivery.

The endpoint accepts POST JSON in a plain-text body at `/?rest_route=/portfolio/v1/resume-click`, allowing cross-origin beacons without a preflight. No public report endpoint is exposed; dashboard access requires `manage_options`.

# Frontend visitor tracking and WordPress reports

## Frontend

The Next.js layout uses GA4 measurement ID `G-GZV9FHM8XG`, overridable with `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel Production. The tag loads after hydration on production builds; events are sent only for `ericonah.online` and `www.ericonah.online`. Development and Vercel preview builds do not include the tag.

The integration sends one explicit `page_view` for the initial page and each pathname navigation, `generate_lead` after a successful contact submission with an empty honeypot, and `lets_talk_click` with the placement `desktop_header` or `mobile_floating`. It does not send submitted names, email addresses, project choices, or message contents. Explicit page locations omit URL query strings and fragments. Events recorded before the Google tag is ready, or blocked by the browser, may not be captured. Analytics cannot break form delivery or navigation.

In Google Analytics → Admin → Data streams → your web stream → Enhanced measurement settings:

- Disable Page views (including browser-history page changes). Our code sends page views explicitly, preventing duplicate navigation events.
- Disable Form interactions. Our successful-delivery event is more accurate than automatic form-submit detection and avoids tracking unsuccessful attempts.
- Other enhanced measurements can remain enabled according to your requirements. Review those separately if URLs could contain personal information.

After deploying, open the live frontend and check Google Analytics Realtime. Navigate between pages and confirm one page view per navigation. Mark `generate_lead` as a key event in GA4 if desired. Do not use a real contact submission merely to test page-view tracking.

This is standard GA4 tracking without an added consent manager. Configure a consent interface and privacy information appropriate to your audience before collecting analytics where consent is required. Advertising signals and ad personalization signals are disabled in our tag configuration.

## Read-only WordPress dashboard connection

1. Copy the **numeric property ID** from Google Analytics → Admin → Property details. The measurement ID beginning `G-` identifies a web stream and cannot be used here.
2. In Google Cloud Console, select your project and enable **Google Analytics Data API**. This is separate from PageSpeed Insights API.
3. Under IAM & Admin → Service Accounts, create a service account named `portfolio-analytics`. It does not need Google Cloud project roles for reading the GA4 property.
4. Open the service account → Keys → Add key → Create new key → JSON. Keep the downloaded file private. If your organization forbids key creation, do not bypass that policy; this integration will need a different authentication method.
5. Copy the service account email (`…@….iam.gserviceaccount.com`). In Google Analytics → Admin → Property access management, add that email with the **Viewer** role. No Editor or Administrator role is needed.
6. On the hosting server, create the private credentials directory:

   ```bash
   mkdir -p /home/ericonah/.config/portfolio
   chmod 700 /home/ericonah/.config/portfolio
   ```

   Upload the JSON file there as `ga4-service-account.json`, then run:

   ```bash
   chmod 600 /home/ericonah/.config/portfolio/ga4-service-account.json
   ```

   Keep it outside `public_html` and `wordpress/web`. Never upload it to the WordPress media library, paste it into chat, or commit it. PHP must run as a user allowed to read it.
7. Add these values to the hosting server's `wordpress/.env`:

   ```dotenv
   GA4_PROPERTY_ID=558211892
   GOOGLE_ANALYTICS_CREDENTIALS=/home/ericonah/.config/portfolio/ga4-service-account.json
   ```

8. After merging and pulling the code on the server, run `bash cms/install-mu-plugins.sh` from `/home/ericonah/domains/cms.ericonah.online`. This installs the new MU plugin automatically. No Composer packages or public REST reporting endpoint are required.
9. Sign in as a WordPress administrator. Dashboard → **Portfolio visitors · Google Analytics** shows visitors, sessions, page views, top pages, traffic channels, countries, and devices. It defaults to the last 28 complete days. Use **From**, **To**, and **Apply dates** for a custom range, or select the same date in both fields for a single day. **Reset** restores the default range. Dates include both endpoints and use the GA4 property time zone; selecting today still uses processed reporting data, not Realtime. If hidden, enable the widget under Screen Options.

The report filters hostnames to the live frontend, excluding the CMS domain. Data is read from GA4 using the readonly OAuth scope. Only users with `manage_options` can register or view the widget; credentials and tokens are never displayed. Successful reports are cached for one hour and report errors for five minutes, so repeatedly opening WordPress does not repeatedly call Google. There is no reporting API call during a public frontend request. Processed GA4 reports can lag behind Realtime; new properties may need 24–48 hours before reporting data appears. Event reports and the full analytics interface are available from the widget's Google Analytics link.

Official references: [GA4 page views](https://developers.google.com/analytics/devguides/collection/ga4/views), [Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart), [service-account authentication](https://developers.google.com/identity/protocols/oauth2/service-account).

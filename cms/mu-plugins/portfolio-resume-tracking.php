<?php
/**
 * Plugin Name: Portfolio Resume Clicks
 * Description: Records resume link clicks and shows an administrator dashboard report.
 */

function portfolio_resume_table() {
    global $wpdb;
    return $wpdb->prefix . 'portfolio_resume_clicks';
}

add_action('init', function () {
    if (get_option('portfolio_resume_schema') === '1') return;
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = portfolio_resume_table();
    $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE $table (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        page_path varchar(2048) NOT NULL,
        clicked_at datetime NOT NULL,
        PRIMARY KEY  (id),
        KEY clicked_at (clicked_at)
    ) $charset;");
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table))) === $table) {
        update_option('portfolio_resume_schema', '1', false);
    }
});

function portfolio_resume_permission($request) {
    $frontend = rtrim((string) (getenv('PORTFOLIO_FRONTEND_URL') ?: 'https://ericonah.online'), '/');
    $allowed = [$frontend];
    if ($frontend === 'https://ericonah.online') $allowed[] = 'https://www.ericonah.online';
    if (!in_array($request->get_header('origin'), $allowed, true)) {
        return new WP_Error('resume_origin', 'This origin is not allowed.', ['status' => 403]);
    }
    return true;
}

function portfolio_resume_record($request) {
    global $wpdb;
    $body = $request->get_body();
    if (strlen($body) > 4096) return new WP_Error('resume_size', 'Request too large.', ['status' => 413]);
    $data = json_decode($body, true);
    $page = is_array($data) ? ($data['page'] ?? null) : null;
    // Store paths only, never query parameters, fragments, or visitor identity.
    if (!is_string($page) || strlen($page) > 2048 || !preg_match('~^/(?!/)[^?#\x00-\x20\x7f]*$~D', $page)
        || strpos($page, '\\') !== false || !preg_match('//u', $page)) {
        return new WP_Error('resume_page', 'A valid page path is required.', ['status' => 400]);
    }
    // Best-effort abuse limit. Do not trust forwarded IP headers or store raw IPs.
    $key = 'portfolio_resume_rate_' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', wp_salt('auth'));
    $attempts = (int) get_transient($key);
    if ($attempts >= 60) return new WP_Error('resume_rate', 'Too many clicks.', ['status' => 429]);
    set_transient($key, $attempts + 1, MINUTE_IN_SECONDS);
    $inserted = $wpdb->insert(portfolio_resume_table(), [
        'page_path' => $page, 'clicked_at' => current_time('mysql', true),
    ], ['%s', '%s']);
    if (!$inserted) return new WP_Error('resume_storage', 'Tracking is temporarily unavailable.', ['status' => 503]);
    $response = new WP_REST_Response(['ok' => true], 201);
    $response->header('Cache-Control', 'no-store');
    return $response;
}

add_action('rest_api_init', function () {
    register_rest_route('portfolio/v1', '/resume-click', [
        'methods' => 'POST',
        'permission_callback' => 'portfolio_resume_permission',
        'callback' => 'portfolio_resume_record',
    ]);
});

function portfolio_resume_widget() {
    if (!current_user_can('manage_options')) return;
    global $wpdb;
    $table = portfolio_resume_table();
    if (get_option('portfolio_resume_schema') !== '1') {
        echo '<p>Resume tracking storage is unavailable. Check database table permissions.</p>';
        return;
    }
    $today = current_datetime()->setTime(0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    $since = gmdate('Y-m-d H:i:s', time() - 28 * DAY_IN_SECONDS);
    $totals = $wpdb->get_row($wpdb->prepare(
        "SELECT COUNT(*) AS total, COALESCE(SUM(clicked_at >= %s), 0) AS today,
        COALESCE(SUM(clicked_at >= %s), 0) AS recent FROM $table", $today, $since
    ));
    echo '<p><strong>Today:</strong> ' . esc_html(number_format_i18n((int) ($totals->today ?? 0)))
        . ' &nbsp; <strong>Last 28 days:</strong> ' . esc_html(number_format_i18n((int) ($totals->recent ?? 0)))
        . ' &nbsp; <strong>All time:</strong> ' . esc_html(number_format_i18n((int) ($totals->total ?? 0))) . '</p>';
    echo '<h4>Top source pages · last 28 days</h4><table class="widefat striped"><thead><tr><th>Page</th><th>Clicks</th></tr></thead><tbody>';
    $pages = $wpdb->get_results($wpdb->prepare(
        "SELECT page_path, COUNT(*) AS clicks FROM $table WHERE clicked_at >= %s GROUP BY page_path ORDER BY clicks DESC, page_path ASC LIMIT 10", $since
    ));
    foreach ($pages as $page) {
        echo '<tr><td style="overflow-wrap:anywhere">' . esc_html($page->page_path) . '</td><td>' . esc_html(number_format_i18n((int) $page->clicks)) . '</td></tr>';
    }
    if (!$pages) echo '<tr><td colspan="2">No resume clicks yet.</td></tr>';
    echo '</tbody></table><h4>Latest 30 clicks</h4><table class="widefat striped"><thead><tr><th>Clicked at</th><th>Source page</th></tr></thead><tbody>';
    $clicks = $wpdb->get_results("SELECT page_path, clicked_at FROM $table ORDER BY clicked_at DESC, id DESC LIMIT 30");
    foreach ($clicks as $click) {
        echo '<tr><td>' . esc_html(wp_date('j M Y, H:i:s', strtotime($click->clicked_at . ' UTC'))) . '</td><td style="overflow-wrap:anywhere">' . esc_html($click->page_path) . '</td></tr>';
    }
    if (!$clicks) echo '<tr><td colspan="2">No resume clicks yet.</td></tr>';
    echo '</tbody></table><p class="description">Times use the WordPress site timezone (' . esc_html(wp_timezone_string()) . '). Refresh to see new clicks. Counts represent link clicks, including repeat clicks, rather than completed downloads or unique visitors. Browser blocking and failed requests can affect counts.</p>';
}

add_action('wp_dashboard_setup', function () {
    if (current_user_can('manage_options')) {
        wp_add_dashboard_widget('portfolio_resume_clicks', 'Portfolio resume clicks', 'portfolio_resume_widget');
    }
});

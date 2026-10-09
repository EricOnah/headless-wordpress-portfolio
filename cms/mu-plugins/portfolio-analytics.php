<?php
/**
 * Plugin Name: Portfolio Analytics Dashboard
 * Description: Administrator-only GA4 reports for the separate portfolio frontend.
 */

function portfolio_analytics_credentials() {
    $file = realpath((string) getenv('GOOGLE_ANALYTICS_CREDENTIALS'));
    $webroot = realpath(dirname(WP_CONTENT_DIR));
    if (!$file || !$webroot || !is_file($file) || !is_readable($file)
        || $file === $webroot || strpos($file, $webroot . DIRECTORY_SEPARATOR) === 0) {
        return new WP_Error('analytics_credentials', 'Set GOOGLE_ANALYTICS_CREDENTIALS to a readable service-account JSON file outside the WordPress web directory.');
    }
    $credentials = json_decode(file_get_contents($file), true);
    if (!is_array($credentials) || ($credentials['type'] ?? '') !== 'service_account'
        || !is_string($credentials['private_key'] ?? null) || !is_string($credentials['client_email'] ?? null)
        || !is_email($credentials['client_email'])) {
        return new WP_Error('analytics_credentials', 'The configured file must contain Google service-account credentials.');
    }
    return $credentials;
}

function portfolio_analytics_token($credentials) {
    $key = 'portfolio_ga_token_' . hash('sha256', $credentials['client_email'] . $credentials['private_key']);
    $cached = get_transient($key);
    if ($cached) return $cached;
    if (!function_exists('openssl_sign')) return new WP_Error('analytics_crypto', 'PHP OpenSSL is required for Analytics authentication.');
    $encode = function ($value) { return rtrim(strtr(base64_encode($value), '+/', '-_'), '='); };
    $now = time();
    $claim = [
        'iss' => $credentials['client_email'],
        'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
        'aud' => 'https://oauth2.googleapis.com/token',
        'iat' => $now, 'exp' => $now + 3600,
    ];
    $unsigned = $encode(wp_json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' . $encode(wp_json_encode($claim));
    if (!@openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
        return new WP_Error('analytics_crypto', 'Unable to sign the Analytics authentication request. Check the service-account key.');
    }
    $response = wp_remote_post('https://oauth2.googleapis.com/token', [
        'timeout' => 10, 'redirection' => 0,
        'body' => ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $unsigned . '.' . $encode($signature)],
    ]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return new WP_Error('analytics_auth', 'Google authentication failed. Check the service-account key and server clock.');
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_string($data['access_token'] ?? null) || empty($data['access_token'])) {
        return new WP_Error('analytics_auth', 'Google returned an invalid authentication response.');
    }
    set_transient($key, $data['access_token'], max(1, min(3300, (int) ($data['expires_in'] ?? 3600) - 60)));
    return $data['access_token'];
}

function portfolio_analytics_reports() {
    if (!current_user_can('manage_options')) return new WP_Error('analytics_access', 'Administrator access is required.');
    $property = (string) getenv('GA4_PROPERTY_ID');
    if (!preg_match('/^[1-9][0-9]*$/', $property)) {
        return new WP_Error('analytics_config', 'Set GA4_PROPERTY_ID to the numeric ID from Google Analytics → Admin → Property details. The G- measurement ID is not the property ID.');
    }
    $credentials = portfolio_analytics_credentials();
    if (is_wp_error($credentials)) return $credentials;
    $cache_key = 'portfolio_ga_report_' . hash('sha256', $property . $credentials['client_email'] . $credentials['private_key']);
    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return isset($cached['error']) ? new WP_Error('analytics_api', $cached['error']) : $cached;
    }
    $token = portfolio_analytics_token($credentials);
    if (is_wp_error($token)) {
        set_transient($cache_key, ['error' => $token->get_error_message()], 5 * MINUTE_IN_SECONDS);
        return $token;
    }
    $filter = ['filter' => ['fieldName' => 'hostName', 'inListFilter' => ['values' => ['ericonah.online', 'www.ericonah.online']]]];
    $base = ['dateRanges' => [['startDate' => '28daysAgo', 'endDate' => 'yesterday']], 'dimensionFilter' => $filter];
    $requests = [$base + ['metrics' => array_map(function ($name) { return ['name' => $name]; }, ['totalUsers', 'sessions', 'screenPageViews'])]];
    foreach (['pagePath', 'sessionDefaultChannelGroup', 'country', 'deviceCategory'] as $dimension) {
        $metric = $dimension === 'pagePath' ? 'screenPageViews' : 'sessions';
        $requests[] = $base + [
            'dimensions' => [['name' => $dimension]], 'metrics' => [['name' => $metric]],
            'orderBys' => [['metric' => ['metricName' => $metric], 'desc' => true]], 'limit' => '5',
        ];
    }
    $response = wp_remote_post('https://analyticsdata.googleapis.com/v1beta/properties/' . $property . ':batchRunReports', [
        'timeout' => 15, 'redirection' => 0,
        'headers' => ['Authorization' => 'Bearer ' . $token, 'Content-Type' => 'application/json'],
        'body' => wp_json_encode(['requests' => $requests]),
    ]);
    $code = is_wp_error($response) ? 0 : wp_remote_retrieve_response_code($response);
    $data = is_wp_error($response) ? null : json_decode(wp_remote_retrieve_body($response), true);
    if ($code !== 200 || !is_array($data['reports'] ?? null) || count($data['reports']) !== 5) {
        $message = $code === 403
            ? 'Reporting access denied. Enable Google Analytics Data API and grant the service-account email Viewer access to this GA4 property.'
            : 'Analytics reports are temporarily unavailable. Check the property ID and Google Cloud configuration.';
        set_transient($cache_key, ['error' => $message], 5 * MINUTE_IN_SECONDS);
        return new WP_Error('analytics_api', $message);
    }
    $result = ['reports' => $data['reports'], 'fetched_at' => time()];
    set_transient($cache_key, $result, HOUR_IN_SECONDS);
    return $result;
}

function portfolio_analytics_widget() {
    if (!current_user_can('manage_options')) return;
    $result = portfolio_analytics_reports();
    if (is_wp_error($result)) {
        echo '<p>' . esc_html($result->get_error_message()) . '</p>';
        return;
    }
    echo '<p><strong>ericonah.online</strong> · Last 28 complete days · GA4 property time zone</p>';
    $values = $result['reports'][0]['rows'][0]['metricValues'] ?? [];
    if (!$values) echo '<p>No visitor data is available yet. Verify frontend tracking in GA4 Realtime; processed reports can take 24–48 hours.</p>';
    echo '<div style="display:flex;gap:24px;flex-wrap:wrap">';
    foreach (['Visitors', 'Sessions', 'Page views'] as $index => $label) {
        echo '<p>' . esc_html($label) . '<br><strong style="font-size:24px">' . esc_html(number_format_i18n((int) ($values[$index]['value'] ?? 0))) . '</strong></p>';
    }
    echo '</div>';
    foreach (['Top pages', 'Traffic channels', 'Countries', 'Devices'] as $index => $title) {
        echo '<h4>' . esc_html($title) . '</h4><table class="widefat striped"><thead><tr><th scope="col">' . esc_html($title) . '</th><th scope="col">' . ($index === 0 ? 'Page views' : 'Sessions') . '</th></tr></thead><tbody>';
        $rows = $result['reports'][$index + 1]['rows'] ?? [];
        foreach ($rows as $row) {
            echo '<tr><td>' . esc_html($row['dimensionValues'][0]['value'] ?? '') . '</td><td>' . esc_html(number_format_i18n((int) ($row['metricValues'][0]['value'] ?? 0))) . '</td></tr>';
        }
        if (!$rows) echo '<tr><td colspan="2">No data yet.</td></tr>';
        echo '</tbody></table>';
    }
    echo '<p class="description">Reports cached for one hour. Last fetched: ' . esc_html(wp_date('j M Y, H:i', $result['fetched_at'])) . '. Counts may be affected by consent choices, browser blocking, and Google reporting thresholds.</p>';
    echo '<p><a href="' . esc_url('https://analytics.google.com/analytics/web/#/p' . getenv('GA4_PROPERTY_ID') . '/reports/reportinghub') . '" target="_blank" rel="noopener noreferrer">Open full Google Analytics reports ↗</a></p>';
}

add_action('wp_dashboard_setup', function () {
    if (current_user_can('manage_options')) {
        wp_add_dashboard_widget('portfolio_analytics', 'Portfolio visitors · Google Analytics', 'portfolio_analytics_widget');
    }
});

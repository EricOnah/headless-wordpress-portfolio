<?php
/**
 * Plugin Name: Portfolio Lighthouse
 * Description: Refresh homepage lab scores every six hours and persist successful audits.
 */

add_filter('cron_schedules', function ($schedules) {
    $schedules['portfolio_six_hours'] = ['interval' => 6 * HOUR_IN_SECONDS, 'display' => 'Every six hours'];
    return $schedules;
});

add_action('init', function () {
    if (getenv('PAGESPEED_API_KEY') && !wp_next_scheduled('portfolio_lighthouse_refresh')) {
        wp_schedule_event(time() + 60, 'portfolio_six_hours', 'portfolio_lighthouse_refresh');
    }
});

function portfolio_lighthouse_audit($strategy, $site, $key) {
    $url = add_query_arg(['url' => $site, 'strategy' => $strategy, 'key' => $key],
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    $categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    foreach ($categories as $category) $url .= '&category=' . rawurlencode($category);
    $response = wp_remote_get($url, ['timeout' => 90, 'redirection' => 0]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) return null;
    $body = json_decode(wp_remote_retrieve_body($response), true);
    $result = $body['lighthouseResult'] ?? [];
    if (!empty($result['runtimeError']) || empty($result['fetchTime']) || strtotime($result['fetchTime']) === false) return null;
    $scores = [];
    foreach ($categories as $category) {
        $score = $result['categories'][$category]['score'] ?? null;
        if ((!is_int($score) && !is_float($score)) || !is_finite((float) $score) || $score < 0 || $score > 1) return null;
        $scores[$category] = (int) round($score * 100);
    }
    return ['url' => $site, 'strategy' => $strategy, 'auditedAt' => $result['fetchTime'], 'scores' => $scores];
}

add_action('portfolio_lighthouse_refresh', function () {
    $key = (string) getenv('PAGESPEED_API_KEY');
    $site = (string) (getenv('LIGHTHOUSE_SITE_URL') ?: 'https://ericonah.online/');
    if (!$key || wp_parse_url($site, PHP_URL_SCHEME) !== 'https') return;
    // Atomic lease, with recovery if an interrupted worker never released it.
    $now = time();
    $lease = (int) get_option('portfolio_lighthouse_lock', 0);
    if ($lease && $lease < $now - 600) delete_option('portfolio_lighthouse_lock');
    if (!add_option('portfolio_lighthouse_lock', $now, '', false)) return;
    try {
        foreach (['mobile', 'desktop'] as $strategy) {
            $report = portfolio_lighthouse_audit($strategy, $site, $key);
            if ($report) update_option('portfolio_lighthouse_' . $strategy, $report, false);
            else error_log('Portfolio Lighthouse: ' . $strategy . ' refresh failed; keeping previous scores.');
        }
    } finally {
        delete_option('portfolio_lighthouse_lock');
    }
});

add_action('rest_api_init', function () {
    register_rest_route('portfolio/v1', '/lighthouse', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            $reports = [];
            foreach (['mobile', 'desktop'] as $strategy) {
                $report = get_option('portfolio_lighthouse_' . $strategy);
                if (is_array($report)) $reports[$strategy] = $report;
            }
            $response = new WP_REST_Response(['reports' => (object) $reports]);
            $response->header('Cache-Control', 'no-store');
            return $response;
        },
    ]);
});

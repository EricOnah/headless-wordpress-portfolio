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

function portfolio_lighthouse_diagnostics($result) {
    $metric_ids = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
    $fields = array_flip(['title', 'description', 'score', 'scoreDisplayMode', 'displayValue',
        'numericValue', 'numericUnit', 'explanation', 'errorMessage', 'warnings', 'details', 'metricSavings']);
    $metrics = $audits = [];
    $refs = $result['categories']['performance']['auditRefs'] ?? [];
    $reference_by_id = [];
    foreach ($refs as $ref) {
        if (is_array($ref) && isset($ref['id'])) $reference_by_id[$ref['id']] = $ref;
    }
    // Include the five scoring metrics even if a future API response omits their references.
    foreach (array_unique(array_merge($metric_ids, array_keys($reference_by_id))) as $id) {
        // Image data is unnecessary for diagnosing the score and can be very large.
        if (in_array($id, ['screenshot-thumbnails', 'final-screenshot', 'full-page-screenshot'], true)) continue;
        $audit = $result['audits'][$id] ?? null;
        if (!is_array($audit)) continue;
        $summary = array_intersect_key($audit, $fields);
        $ref = $reference_by_id[$id] ?? [];
        foreach (['weight', 'group'] as $field) {
            if (isset($ref[$field])) $summary[$field] = $ref[$field];
        }
        if (in_array($id, $metric_ids, true)) $metrics[$id] = $summary;
        else $audits[$id] = $summary;
    }
    return [
        'lighthouseVersion' => $result['lighthouseVersion'] ?? null,
        'requestedUrl' => $result['requestedUrl'] ?? null,
        'finalUrl' => $result['finalDisplayedUrl'] ?? $result['finalUrl'] ?? null,
        'environment' => array_intersect_key($result['environment'] ?? [],
            array_flip(['networkUserAgent', 'hostUserAgent', 'benchmarkIndex'])),
        'configSettings' => array_intersect_key($result['configSettings'] ?? [],
            array_flip(['formFactor', 'emulatedFormFactor', 'locale', 'throttlingMethod', 'throttling', 'screenEmulation'])),
        'runWarnings' => $result['runWarnings'] ?? [],
        'metrics' => (object) $metrics,
        'audits' => (object) $audits,
    ];
}

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
    return ['url' => $site, 'strategy' => $strategy, 'auditedAt' => $result['fetchTime'],
        'scores' => $scores, 'diagnostics' => portfolio_lighthouse_diagnostics($result)];
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

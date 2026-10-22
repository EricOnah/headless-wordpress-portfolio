<?php
// Standalone checks: php -n tests/lighthouse-refresh.test.php
define('HOUR_IN_SECONDS', 3600);
$actions = $filters = $options = $requests = $events = [];
$fail_mobile = false;
function add_action($name, $callback) { global $actions; $actions[$name] = $callback; }
function add_filter($name, $callback) { global $filters; $filters[$name] = $callback; }
function wp_next_scheduled($hook) { global $events; return $events[$hook][0] ?? false; }
function wp_schedule_event($time, $schedule, $hook) { global $events; $events[$hook] = [$time, $schedule]; }
function get_option($name, $default = false) { global $options; return $options[$name] ?? $default; }
function add_option($name, $value, ...$unused) { global $options; if (isset($options[$name])) return false; $options[$name] = $value; return true; }
function delete_option($name) { global $options; unset($options[$name]); }
function update_option($name, $value, ...$unused) { global $options; $options[$name] = $value; }
function wp_parse_url($url, $component) { return parse_url($url, $component); }
function add_query_arg($args, $url) { return $url . '?' . http_build_query($args); }
function is_wp_error($response) { return false; }
function wp_remote_retrieve_response_code($response) { return $response['status']; }
function wp_remote_retrieve_body($response) { return json_encode($response['body']); }
function wp_remote_get($url, $args) {
    global $requests, $fail_mobile;
    $requests[] = $url;
    parse_str(parse_url($url, PHP_URL_QUERY), $query);
    $categories = [];
    foreach (['performance', 'accessibility', 'best-practices', 'seo'] as $name) $categories[$name] = ['score' => .98];
    if ($fail_mobile && $query['strategy'] === 'mobile') $categories['performance']['score'] = null;
    $categories['performance']['auditRefs'] = [
        ['id' => 'largest-contentful-paint', 'weight' => 25, 'group' => 'metrics'],
        ['id' => 'render-blocking-insight', 'weight' => 0, 'group' => 'insights'],
        ['id' => 'screenshot-thumbnails', 'weight' => 0],
    ];
    return ['status' => 200, 'body' => ['lighthouseResult' => [
        'fetchTime' => '2026-10-22T06:00:00Z', 'categories' => $categories,
        'lighthouseVersion' => '13.0.0', 'requestedUrl' => 'https://example.test/', 'finalUrl' => 'https://example.test/',
        'environment' => ['benchmarkIndex' => 1200],
        'configSettings' => ['formFactor' => $query['strategy'], 'throttlingMethod' => 'simulate', 'privateSetting' => 'test-private-key'],
        'runWarnings' => ['Test warning'],
        'audits' => [
            'largest-contentful-paint' => ['title' => 'Largest Contentful Paint', 'score' => .7, 'numericValue' => 3200, 'numericUnit' => 'millisecond', 'displayValue' => '3.2 s'],
            'cumulative-layout-shift' => ['score' => 1, 'numericValue' => 0, 'numericUnit' => 'unitless'],
            'render-blocking-insight' => ['title' => 'Render blocking requests', 'score' => 0, 'scoreDisplayMode' => 'metricSavings', 'metricSavings' => ['LCP' => 500], 'details' => ['type' => 'table', 'items' => [['url' => 'https://example.test/app.css']]]],
            'screenshot-thumbnails' => ['details' => ['type' => 'filmstrip', 'items' => ['large-image-data']]],
            'unrelated-accessibility-audit' => ['title' => 'Unrelated finding'],
        ],
    ]]];
}
function register_rest_route($namespace, $path, $args) { $GLOBALS['endpoint'] = $args; }
class WP_REST_Response {
    public $data;
    function __construct($data) { $this->data = $data; }
    function header(...$args) {}
}
function check($condition, $message) { if (!$condition) throw new Exception($message); }
require __DIR__ . '/../cms/mu-plugins/portfolio-lighthouse.php';
putenv('PAGESPEED_API_KEY=test-private-key');
putenv('LIGHTHOUSE_SITE_URL=https://example.test/');
check($filters['cron_schedules']([])['portfolio_six_hours']['interval'] === 21600, 'Six-hour interval');
$actions['init']();
$first = $events;
$actions['init']();
check($events === $first && $events['portfolio_lighthouse_refresh'][1] === 'portfolio_six_hours', 'No duplicate schedule');
$actions['portfolio_lighthouse_refresh']();
check(count($requests) === 2, 'Both strategies audited');
check($options['portfolio_lighthouse_desktop']['scores']['performance'] === 98, 'Scores stored as percentages');
check(!isset($options['portfolio_lighthouse_lock']), 'Lease released');
$diagnostics = $options['portfolio_lighthouse_desktop']['diagnostics'];
check($diagnostics['lighthouseVersion'] === '13.0.0', 'Lighthouse version saved');
check($diagnostics['configSettings']['formFactor'] === 'desktop', 'Audit device saved');
check($diagnostics['runWarnings'] === ['Test warning'], 'Run warnings saved');
check($diagnostics['metrics']->{'largest-contentful-paint'}['numericValue'] === 3200, 'Metric value saved');
check($diagnostics['metrics']->{'largest-contentful-paint'}['weight'] === 25, 'Scoring weight saved');
check($diagnostics['metrics']->{'cumulative-layout-shift'}['numericValue'] === 0, 'Zero metric retained even without a reference');
check($diagnostics['audits']->{'render-blocking-insight'}['metricSavings']['LCP'] === 500, 'Estimated savings saved');
check($diagnostics['audits']->{'render-blocking-insight'}['details']['items'][0]['url'] === 'https://example.test/app.css', 'Affected resources saved');
check(!isset($diagnostics['audits']->{'screenshot-thumbnails'}), 'Large screenshot data excluded');
check(!isset($diagnostics['audits']->{'unrelated-accessibility-audit'}), 'Only performance audits included');
check(strpos(json_encode($diagnostics), 'test-private-key') === false, 'Unselected settings excluded');
$empty = portfolio_lighthouse_diagnostics([]);
check(json_encode($empty['metrics']) === '{}' && json_encode($empty['audits']) === '{}', 'Missing optional diagnostics produce empty objects');
$previous = $options['portfolio_lighthouse_mobile'];
$options['portfolio_lighthouse_desktop']['auditedAt'] = '2026-10-19T06:00:00Z';
$fail_mobile = true;
$actions['portfolio_lighthouse_refresh']();
check($options['portfolio_lighthouse_mobile'] === $previous, 'Failed mobile audit retains previous report');
check($options['portfolio_lighthouse_desktop']['auditedAt'] === '2026-10-22T06:00:00Z', 'Desktop still refreshes');
$count = count($requests);
$options['portfolio_lighthouse_lock'] = time();
$actions['portfolio_lighthouse_refresh']();
check(count($requests) === $count, 'Concurrent refresh skipped');
$options['portfolio_lighthouse_lock'] = time() - 601;
$actions['portfolio_lighthouse_refresh']();
check(count($requests) === $count + 2, 'Expired lease recovered');
$actions['rest_api_init']();
check($endpoint['methods'] === 'GET' && $endpoint['permission_callback'] === '__return_true', 'Read-only public endpoint');
$response = $endpoint['callback']();
check(count((array) $response->data['reports']) === 2, 'Both reports exposed');
check($response->data['reports']->desktop['diagnostics'] == $diagnostics, 'Endpoint exposes diagnostics from saved audit');
check(strpos(json_encode($response->data), 'test-private-key') === false, 'API key never exposed');
echo "Lighthouse scheduler, retention, locking and endpoint checks passed.\n";

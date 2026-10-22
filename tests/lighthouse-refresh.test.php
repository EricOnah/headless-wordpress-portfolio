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
    return ['status' => 200, 'body' => ['lighthouseResult' => ['fetchTime' => '2026-10-22T06:00:00Z', 'categories' => $categories]]];
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
check(strpos(json_encode($response->data), 'test-private-key') === false, 'API key never exposed');
echo "Lighthouse scheduler, retention, locking and endpoint checks passed.\n";

<?php
// Standalone endpoint checks: php -n tests/resume-tracking.test.php
define('MINUTE_IN_SECONDS', 60);
function add_action(...$args) {}
class WP_Error {
    public $code;
    public $data;
    function __construct($code, $message, $data) { $this->code = $code; $this->data = $data; }
}
class WP_REST_Response {
    public $status;
    function __construct($data, $status) { $this->status = $status; }
    function header(...$args) {}
}
class ResumeRequest {
    private $body;
    private $origin;
    function __construct($body, $origin = 'https://ericonah.online') { $this->body = $body; $this->origin = $origin; }
    function get_body() { return $this->body; }
    function get_header($name) { return $this->origin; }
}
$rate = 0;
function get_transient($key) { global $rate; return $rate; }
function set_transient($key, $value, $ttl) { global $rate; $rate = $value; }
function wp_salt($scheme) { return 'test-salt'; }
function current_time($type, $utc) { return '2026-10-19 12:00:00'; }
function current_user_can($capability) { return false; }
$wpdb = new class {
    public $prefix = 'wp_';
    public $rows = [];
    public $fail = false;
    function insert($table, $data, $formats) {
        if ($this->fail) return false;
        $this->rows[] = $data;
        return 1;
    }
};
require __DIR__ . '/../cms/mu-plugins/portfolio-resume-tracking.php';
function check($condition, $message) {
    if (!$condition) throw new Exception($message);
}
putenv('PORTFOLIO_FRONTEND_URL=https://ericonah.online');
check(portfolio_resume_permission(new ResumeRequest('')) === true, 'Allow live frontend');
check(portfolio_resume_permission(new ResumeRequest('', 'https://www.ericonah.online')) === true, 'Allow www');
foreach (['', 'https://evil.test', 'https://ericonah.online.evil.test'] as $origin) {
    check(portfolio_resume_permission(new ResumeRequest('', $origin))->data['status'] === 403, 'Reject untrusted origin');
}
foreach (['not json', '{}', '{"page":[]}', '{"page":"//evil.test"}', '{"page":"/contact?email=private"}', '{"page":"/page#private"}', '{"page":"https://evil.test"}', '{"page":"/bad path"}', '{"page":"/bad\\\\path"}'] as $body) {
    check(portfolio_resume_record(new ResumeRequest($body))->data['status'] === 400, 'Reject malformed path');
}
check(count($wpdb->rows) === 0, 'Invalid requests must not write records');
check(portfolio_resume_record(new ResumeRequest(str_repeat('x', 4097)))->data['status'] === 413, 'Bound request size');
foreach (['/', '/projects', '/blog/example'] as $path) {
    check(portfolio_resume_record(new ResumeRequest(json_encode(['page' => $path])))->status === 201, 'Record click');
    check(end($wpdb->rows) === ['page_path' => $path, 'clicked_at' => '2026-10-19 12:00:00'], 'Only store page and UTC timestamp');
}
$rate = 60;
check(portfolio_resume_record(new ResumeRequest('{"page":"/"}'))->data['status'] === 429, 'Rate limit');
$rate = 0;
$wpdb->fail = true;
check(portfolio_resume_record(new ResumeRequest('{"page":"/"}'))->data['status'] === 503, 'Handle storage failure');
ob_start();
portfolio_resume_widget();
check(ob_get_clean() === '', 'Non-administrators cannot view report');
echo "Resume tracking endpoint checks passed.\n";

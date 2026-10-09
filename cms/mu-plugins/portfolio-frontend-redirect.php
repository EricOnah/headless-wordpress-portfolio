<?php
/**
 * Plugin Name: Portfolio frontend redirect
 * Description: Send public CMS pages to the portfolio while retaining WordPress services.
 */

add_action('template_redirect', function () {
    // Only redirect the hosted CMS; local WordPress previews remain available.
    $host = wp_parse_url('https://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
    if (!is_string($host) || strtolower($host) !== 'cms.ericonah.online') {
        return;
    }
    if (is_admin() || wp_doing_ajax() || wp_doing_cron()
        || (defined('REST_REQUEST') && REST_REQUEST)
        || (defined('WP_CLI') && WP_CLI)
        || isset($_GET['rest_route'])) {
        return;
    }
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        return;
    }
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    // Retain service routes even when a request falls through to a template.
    if (is_string($path) && preg_match('#^/(?:wp/)?(?:wp-admin(?:/|$)|wp-login\.php(?:/|$)|wp-cron\.php(?:/|$)|xmlrpc\.php(?:/|$)|wp-json(?:/|$)|wp-content(?:/|$)|wp-includes(?:/|$)|app(?:/|$))#i', $path)) {
        return;
    }
    $target = getenv('PORTFOLIO_FRONTEND_URL') ?: 'https://ericonah.online';
    $url = wp_parse_url($target);
    if (!is_array($url) || ($url['scheme'] ?? '') !== 'https'
        || empty($url['host']) || strtolower($url['host']) === 'cms.ericonah.online'
        || isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment'])) {
        return;
    }
    // Destination comes from server configuration; never forward query parameters.
    nocache_headers();
    if (wp_redirect(trailingslashit($target), 302, 'Portfolio frontend redirect')) {
        exit;
    }
}, 0);

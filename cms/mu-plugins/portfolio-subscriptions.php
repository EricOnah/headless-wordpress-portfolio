<?php
/**
 * Plugin Name: Portfolio Email Subscriptions
 * Description: Private confirmed subscriber list and queued new-post notifications.
 */

function portfolio_subscriptions_tables() {
    global $wpdb;
    return [$wpdb->prefix . 'portfolio_subscribers', $wpdb->prefix . 'portfolio_newsletter_queue'];
}

add_filter('cron_schedules', function ($schedules) {
    $schedules['portfolio_five_minutes'] = ['interval' => 300, 'display' => 'Every five minutes'];
    return $schedules;
});

add_action('init', function () {
    global $wpdb;
    [$subscribers, $queue] = portfolio_subscriptions_tables();
    if (get_option('portfolio_subscriptions_schema') !== '1') {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE $subscribers (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            email varchar(254) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            created_at datetime NOT NULL,
            consent_at datetime NOT NULL,
            confirmed_at datetime NULL,
            token_hash varchar(64) NULL,
            token_expires datetime NULL,
            last_request datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY email (email),
            KEY status (status),
            KEY token_hash (token_hash)
        ) $charset;");
        dbDelta("CREATE TABLE $queue (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            post_id bigint(20) unsigned NOT NULL,
            subscriber_id bigint(20) unsigned NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            attempts int unsigned NOT NULL DEFAULT 0,
            available_at datetime NOT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY delivery (post_id,subscriber_id),
            KEY ready (status,available_at)
        ) $charset;");
        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($subscribers))) === $subscribers
            && $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($queue))) === $queue) {
            update_option('portfolio_subscriptions_schema', '1', false);
        }
    }
    if (!wp_next_scheduled('portfolio_newsletter_delivery')) {
        wp_schedule_event(time() + 300, 'portfolio_five_minutes', 'portfolio_newsletter_delivery');
    }
});

function portfolio_subscriptions_frontend() {
    $url = rtrim((string) getenv('PORTFOLIO_FRONTEND_URL'), '/');
    if (!$url) return new WP_Error('subscriptions_config', 'The frontend URL is not configured.', ['status' => 503]);
    $parts = wp_parse_url($url);
    $local = in_array(wp_get_environment_type(), ['local', 'development'], true);
    if (!$parts || empty($parts['host']) || !in_array($parts['scheme'] ?? '', $local ? ['http', 'https'] : ['https'], true)
        || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) {
        return new WP_Error('subscriptions_config', 'The frontend URL is invalid.', ['status' => 503]);
    }
    return $url;
}

function portfolio_subscriptions_mail($email, $subject, $text) {
    $host = (string) getenv('NEWSLETTER_SMTP_HOST');
    $port = (int) getenv('NEWSLETTER_SMTP_PORT');
    $user = (string) getenv('NEWSLETTER_SMTP_USER');
    $pass = (string) getenv('NEWSLETTER_SMTP_PASS');
    $from = (string) (getenv('NEWSLETTER_FROM_EMAIL') ?: $user);
    if (!$host || $port < 1 || $port > 65535 || !$user || !$pass || !is_email($from) || !is_email($email)) return false;
    $configure = function ($mailer) use ($host, $port, $user, $pass, $from) {
        $mailer->isSMTP(); $mailer->Host = $host; $mailer->Port = $port;
        $mailer->SMTPAuth = true; $mailer->Username = $user; $mailer->Password = $pass;
        $mailer->SMTPSecure = $port === 465 ? 'ssl' : 'tls';
        $mailer->Timeout = 10; $mailer->SMTPDebug = 0;
        $mailer->setFrom($from, 'Eric Onah');
    };
    add_action('phpmailer_init', $configure);
    try {
        return wp_mail($email, preg_replace('/[\r\n\x00-\x1f\x7f]/', '', $subject), $text, ['Content-Type: text/plain; charset=UTF-8']);
    } finally {
        remove_action('phpmailer_init', $configure);
        // WordPress reuses PHPMailer. Do not leave newsletter SMTP credentials
        // attached to subsequent unrelated mail in the same PHP request.
        global $phpmailer;
        if (isset($phpmailer) && is_object($phpmailer)) $phpmailer->smtpClose();
        $phpmailer = null;
    }
}

function portfolio_subscriptions_unsubscribe_token($subscriber) {
    return $subscriber->id . '.' . hash_hmac('sha256', $subscriber->id . '|' . $subscriber->email . '|' . $subscriber->created_at, wp_salt('auth'));
}

function portfolio_subscriptions_reply() {
    $response = new WP_REST_Response(['ok' => true]);
    $response->header('Cache-Control', 'no-store');
    return $response;
}

function portfolio_subscriptions_request($request) {
    global $wpdb;
    [$table] = portfolio_subscriptions_tables();
    if (strlen($request->get_body()) > 8192) return new WP_Error('subscription_body', 'Request too large.', ['status' => 413]);
    $email = $request->get_param('email');
    if (!is_string($email) || strlen($email) > 254 || !is_email($email) || $request->get_param('consent') !== true) {
        return new WP_Error('subscription_email', 'Valid email and consent are required.', ['status' => 400]);
    }
    $email = strtolower(trim($email));
    $client = $request->get_param('client');
    $bucket = 'portfolio_sub_rate_' . hash_hmac('sha256', (is_string($client) ? substr($client, 0, 64) : 'unknown') . '|' . floor(time() / 600), wp_salt('auth'));
    $attempts = (int) get_transient($bucket);
    if ($attempts >= 5) return new WP_Error('subscription_rate', 'Too many attempts.', ['status' => 429]);
    set_transient($bucket, $attempts + 1, 600);
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE email=%s", $email));
    // Return the same response for existing subscribers and pending cooldowns.
    if ($row && ($row->status === 'active' || strtotime($row->last_request . ' UTC') > time() - 3600)) return portfolio_subscriptions_reply();
    $frontend = portfolio_subscriptions_frontend();
    if (is_wp_error($frontend)) return $frontend;
    $raw = bin2hex(random_bytes(32));
    $now = gmdate('Y-m-d H:i:s');
    $fields = ['status' => 'pending', 'confirmed_at' => null, 'consent_at' => $now, 'last_request' => $now, 'token_hash' => hash('sha256', $raw), 'token_expires' => gmdate('Y-m-d H:i:s', time() + DAY_IN_SECONDS)];
    if ($row) {
        $saved = $wpdb->update($table, $fields, ['id' => $row->id, 'last_request' => $row->last_request]);
        if ($saved === 0) return portfolio_subscriptions_reply();
    } else {
        $saved = $wpdb->insert($table, $fields + ['email' => $email, 'created_at' => $now]);
    }
    if ($saved === false) return new WP_Error('subscription_storage', 'Subscription is temporarily unavailable.', ['status' => 503]);
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE email=%s", $email));
    $confirm = $frontend . '/subscribe?action=confirm&token=' . rawurlencode($raw);
    $unsubscribe = $frontend . '/subscribe?action=unsubscribe&token=' . rawurlencode(portfolio_subscriptions_unsubscribe_token($row));
    $sent = portfolio_subscriptions_mail($email, 'Confirm your subscription to Eric Onah’s posts',
        "You requested new-post emails from Eric Onah.\n\nConfirm your email (link expires in 24 hours):\n$confirm\n\nYou will only receive new-post emails after confirming. If you did not request this, ignore this email or cancel here:\n$unsubscribe");
    if (!$sent) {
        $wpdb->update($table, ['token_hash' => null, 'token_expires' => null, 'last_request' => '1970-01-01 00:00:00'], ['id' => $row->id, 'token_hash' => hash('sha256', $raw)]);
        return new WP_Error('subscription_mail', 'Confirmation email could not be sent.', ['status' => 503]);
    }
    return portfolio_subscriptions_reply();
}

function portfolio_subscriptions_confirm($request) {
    global $wpdb; [$table] = portfolio_subscriptions_tables();
    $token = $request->get_param('token');
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) return new WP_Error('subscription_token', 'Invalid confirmation link.', ['status' => 400]);
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE token_hash=%s AND status='pending' AND token_expires >= %s", hash('sha256', $token), gmdate('Y-m-d H:i:s')));
    if (!$row) return new WP_Error('subscription_token', 'Invalid or expired confirmation link.', ['status' => 400]);
    $saved = $wpdb->update($table, ['status' => 'active', 'confirmed_at' => gmdate('Y-m-d H:i:s'), 'token_hash' => null, 'token_expires' => null], ['id' => $row->id, 'status' => 'pending', 'token_hash' => hash('sha256', $token)]);
    if ($saved === false) return new WP_Error('subscription_storage', 'Subscription is temporarily unavailable.', ['status' => 503]);
    if ($saved === 0) return new WP_Error('subscription_token', 'Confirmation link has already been used or cancelled.', ['status' => 400]);
    return portfolio_subscriptions_reply();
}

function portfolio_subscriptions_unsubscribe($request) {
    global $wpdb; [$table, $queue] = portfolio_subscriptions_tables();
    $token = $request->get_param('token');
    if (!is_string($token) || !preg_match('/^([1-9][0-9]*)\.([a-f0-9]{64})$/', $token, $parts)) return new WP_Error('subscription_token', 'Invalid unsubscribe link.', ['status' => 400]);
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id=%d", $parts[1]));
    if (!$row || !hash_equals(portfolio_subscriptions_unsubscribe_token($row), $token)) return new WP_Error('subscription_token', 'Invalid unsubscribe link.', ['status' => 400]);
    if ($wpdb->update($table, ['status' => 'unsubscribed', 'token_hash' => null, 'token_expires' => null], ['id' => $row->id]) === false) return new WP_Error('subscription_storage', 'Subscription is temporarily unavailable.', ['status' => 503]);
    $wpdb->update($queue, ['status' => 'skipped'], ['subscriber_id' => $row->id, 'status' => 'pending']);
    return portfolio_subscriptions_reply();
}

add_action('rest_api_init', function () {
    foreach (['request', 'confirm', 'unsubscribe'] as $action) {
        register_rest_route('portfolio/v1', '/subscriptions/' . $action, [
            'methods' => 'POST', 'callback' => 'portfolio_subscriptions_' . $action,
            'permission_callback' => function ($request) {
                $secret = (string) getenv('SUBSCRIPTIONS_API_SECRET');
                if (strlen($secret) < 32) return new WP_Error('subscription_config', 'Subscriptions are not configured.', ['status' => 503]);
                return hash_equals('Bearer ' . $secret, (string) $request->get_header('authorization'));
            },
        ]);
    }
});

add_action('transition_post_status', function ($new, $old, $post) {
    if ($new === 'publish' && $old !== 'publish' && $post->post_type === 'post' && !get_post_meta($post->ID, '_portfolio_newsletter_queued', true)
        && !wp_next_scheduled('portfolio_newsletter_queue_post', [$post->ID])) {
        if (!get_post_meta($post->ID, '_portfolio_newsletter_published_at', true)) update_post_meta($post->ID, '_portfolio_newsletter_published_at', gmdate('Y-m-d H:i:s'));
        wp_schedule_single_event(time() + 60, 'portfolio_newsletter_queue_post', [$post->ID]);
    }
}, 10, 3);

add_action('portfolio_newsletter_queue_post', function ($post_id) {
    global $wpdb; [$table, $queue] = portfolio_subscriptions_tables();
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'post' || $post->post_status !== 'publish') return;
    $now = gmdate('Y-m-d H:i:s');
    $published_at = get_post_meta($post_id, '_portfolio_newsletter_published_at', true) ?: $now;
    $result = $wpdb->query($wpdb->prepare("INSERT IGNORE INTO $queue (post_id,subscriber_id,status,available_at,created_at) SELECT %d,id,'pending',%s,%s FROM $table WHERE status='active' AND confirmed_at <= %s", $post_id, $now, $now, $published_at));
    if ($result !== false) update_post_meta($post_id, '_portfolio_newsletter_queued', '1');
    else wp_schedule_single_event(time() + 300, 'portfolio_newsletter_queue_post', [$post_id]);
});

add_action('portfolio_newsletter_delivery', function () {
    global $wpdb; [$table, $queue] = portfolio_subscriptions_tables();
    $frontend = portfolio_subscriptions_frontend();
    if (is_wp_error($frontend)) return;
    $started = microtime(true);
    $now = gmdate('Y-m-d H:i:s');
    $jobs = $wpdb->get_results($wpdb->prepare("SELECT * FROM $queue WHERE status='pending' AND available_at <= %s ORDER BY id LIMIT 5", $now));
    foreach ($jobs as $job) {
        if (microtime(true) - $started > 15) break;
        // A lease prevents overlapping cron workers from sending the same job.
        $leased = $wpdb->query($wpdb->prepare("UPDATE $queue SET attempts=attempts+1, available_at=%s WHERE id=%d AND status='pending' AND available_at <= %s", gmdate('Y-m-d H:i:s', time() + 300), $job->id, $now));
        if ($leased !== 1) continue;
        $subscriber = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id=%d AND status='active'", $job->subscriber_id));
        $post = get_post($job->post_id);
        if (!$subscriber || !$post || $post->post_status !== 'publish') { $wpdb->update($queue, ['status' => 'skipped'], ['id' => $job->id]); continue; }
        $title = wp_specialchars_decode(wp_strip_all_tags($post->post_title), ENT_QUOTES);
        $excerpt = wp_trim_words(wp_strip_all_tags($post->post_excerpt ?: strip_shortcodes($post->post_content)), 55);
        $link = $frontend . '/posts/' . rawurlencode($post->post_name);
        $unsubscribe = $frontend . '/subscribe?action=unsubscribe&token=' . rawurlencode(portfolio_subscriptions_unsubscribe_token($subscriber));
        $sent = portfolio_subscriptions_mail($subscriber->email, 'New post from Eric Onah: ' . $title, "$title\n\n$excerpt\n\nRead the article:\n$link\n\nYou subscribed to new-post emails from Eric Onah.\nUnsubscribe:\n$unsubscribe");
        $attempts = (int) $job->attempts + 1;
        $wpdb->update($queue, ['status' => $sent ? 'sent' : ($attempts >= 5 ? 'failed' : 'pending'), 'available_at' => gmdate('Y-m-d H:i:s', time() + min(3600, 300 * (2 ** $attempts)))], ['id' => $job->id]);
    }
});

add_action('admin_menu', function () {
    add_menu_page('Email subscribers', 'Subscribers', 'manage_options', 'portfolio-subscribers', 'portfolio_subscriptions_admin', 'dashicons-email-alt', 26);
});

function portfolio_subscriptions_admin() {
    if (!current_user_can('manage_options')) return;
    global $wpdb; [$table, $queue] = portfolio_subscriptions_tables();
    $status = isset($_GET['status']) && is_string($_GET['status']) ? sanitize_key($_GET['status']) : '';
    if (!in_array($status, ['pending', 'active', 'unsubscribed'], true)) $status = '';
    $search = isset($_GET['s']) && is_string($_GET['s']) ? sanitize_text_field(wp_unslash($_GET['s'])) : '';
    $page = max(1, isset($_GET['paged']) ? absint($_GET['paged']) : 1);
    $where = 'WHERE 1=1'; $values = [];
    if ($status) { $where .= ' AND status=%s'; $values[] = $status; }
    if ($search) { $where .= ' AND email LIKE %s'; $values[] = '%' . $wpdb->esc_like($search) . '%'; }
    $count_sql = "SELECT COUNT(*) FROM $table $where";
    $count = (int) $wpdb->get_var($values ? $wpdb->prepare($count_sql, $values) : $count_sql);
    $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table $where ORDER BY id DESC LIMIT 50 OFFSET %d", array_merge($values, [($page - 1) * 50])));
    echo '<div class="wrap"><h1>Email subscribers</h1><p>Only confirmed subscribers receive new-post emails. Dates below are UTC.</p><p>';
    foreach (['active' => 'Confirmed', 'pending' => 'Pending', 'unsubscribed' => 'Unsubscribed'] as $key => $label) {
        echo esc_html($label) . ': <strong>' . esc_html((string) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE status=%s", $key))) . '</strong> &nbsp; ';
    }
    echo '</p><p>Queued emails: ' . esc_html((string) $wpdb->get_var("SELECT COUNT(*) FROM $queue WHERE status='pending'")) . ' · Failed deliveries: ' . esc_html((string) $wpdb->get_var("SELECT COUNT(*) FROM $queue WHERE status='failed'")) . '</p>';
    echo '<form method="get"><input type="hidden" name="page" value="portfolio-subscribers"><label for="subscriber-search">Search email </label><input id="subscriber-search" name="s" value="' . esc_attr($search) . '"> <label for="subscriber-status">Status </label><select id="subscriber-status" name="status"><option value="">All statuses</option>';
    foreach (['active' => 'Confirmed', 'pending' => 'Pending', 'unsubscribed' => 'Unsubscribed'] as $key => $label) echo '<option value="' . esc_attr($key) . '" ' . selected($status, $key, false) . '>' . esc_html($label) . '</option>';
    echo '</select> <button class="button">Filter</button></form><br><table class="widefat striped"><thead><tr><th>Email</th><th>Status</th><th>Signed up</th><th>Confirmed</th><th>Manage</th></tr></thead><tbody>';
    foreach ($rows as $row) {
        echo '<tr><td>' . esc_html($row->email) . '</td><td>' . esc_html($row->status === 'active' ? 'Confirmed' : ucfirst($row->status)) . '</td><td>' . esc_html($row->created_at) . '</td><td>' . esc_html($row->confirmed_at ?: '—') . '</td><td><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="portfolio_delete_subscriber"><input type="hidden" name="id" value="' . esc_attr($row->id) . '">';
        wp_nonce_field('portfolio_delete_subscriber_' . $row->id);
        echo '<button class="button" type="submit">Delete</button></form></td></tr>';
    }
    if (!$rows) echo '<tr><td colspan="5">No subscribers found.</td></tr>';
    echo '</tbody></table><p>' . esc_html(number_format_i18n($count)) . ' matching subscribers</p>';
    if ($page > 1) echo '<a class="button" href="' . esc_url(add_query_arg(['page' => 'portfolio-subscribers', 'paged' => $page - 1, 'status' => $status, 's' => $search], admin_url('admin.php'))) . '">Previous</a> ';
    if ($page * 50 < $count) echo '<a class="button" href="' . esc_url(add_query_arg(['page' => 'portfolio-subscribers', 'paged' => $page + 1, 'status' => $status, 's' => $search], admin_url('admin.php'))) . '">Next</a>';
    echo '</div>';
}

add_action('admin_post_portfolio_delete_subscriber', function () {
    if (!current_user_can('manage_options')) wp_die('Administrator access required.', '', ['response' => 403]);
    $id = isset($_POST['id']) ? absint($_POST['id']) : 0;
    check_admin_referer('portfolio_delete_subscriber_' . $id);
    global $wpdb; [$table, $queue] = portfolio_subscriptions_tables();
    $wpdb->delete($table, ['id' => $id]);
    $wpdb->delete($queue, ['subscriber_id' => $id]);
    wp_safe_redirect(admin_url('admin.php?page=portfolio-subscribers')); exit;
});

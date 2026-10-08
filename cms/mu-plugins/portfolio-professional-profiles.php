<?php
/**
 * Plugin Name: Portfolio Professional Profiles
 * Description: Dashboard-managed professional summary, contact details.
 */
function portfolio_profile_fields() {
    return [
        'summary_heading' => ['Summary heading', 'text'],
        'summary_body' => ['Summary paragraph 1', 'textarea'],
        'summary_body2' => ['Summary paragraph 2', 'textarea'],
        'availability' => ['Availability label', 'text'],
        'email' => ['Email address', 'email'],
        'phone' => ['Phone number', 'text'],
        'linkedin' => ['LinkedIn URL', 'url'],
        'github' => ['GitHub URL', 'url'],
    ];
}
function portfolio_sanitize_profile_value($key, $value) {
    $fields = portfolio_profile_fields();
    $type = $fields[$key][1] ?? 'text';
    if ($type === 'email') return sanitize_email($value);
    if ($type === 'url') {
        $url = esc_url_raw($value, ['http', 'https']);
        return preg_match('#^https?://#i', $url) ? $url : '';
    }
    return $type === 'textarea' ? sanitize_textarea_field($value) : sanitize_text_field($value);
}
add_action('init', function () {
    register_post_type('professional_profile', [
        'labels' => [
            'name' => 'Professional Profiles',
            'singular_name' => 'Professional Profile',
            'add_new_item' => 'Add Professional Profile',
            'edit_item' => 'Edit Professional Profile',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'rest_base' => 'professional-profiles',
        'menu_icon' => 'dashicons-id',
        'supports' => ['title'],
    ]);
});
add_action('add_meta_boxes_professional_profile', function () {
    add_meta_box('portfolio-profile-details', 'Homepage professional profile', function ($post) {
        wp_nonce_field('portfolio_save_profile', 'portfolio_profile_nonce');
        echo '<p>The most recently updated published profile appears on the homepage. Update this entry, then refresh the frontend.</p>';
        foreach (portfolio_profile_fields() as $key => [$label, $type]) {
            $value = get_post_meta($post->ID, $key, true);
            echo '<p><label for="profile-' . esc_attr($key) . '"><strong>' . esc_html($label) . '</strong></label><br>';
            if ($type === 'textarea') {
                echo '<textarea class="widefat" rows="5" id="profile-' . esc_attr($key) . '" name="portfolio_profile[' . esc_attr($key) . ']">' . esc_textarea($value) . '</textarea>';
            } else {
                echo '<input class="widefat" type="' . esc_attr($type) . '" id="profile-' . esc_attr($key) . '" name="portfolio_profile[' . esc_attr($key) . ']" value="' . esc_attr($value) . '">';
            }
            echo '</p>';
        }
    }, 'professional_profile', 'normal', 'high');
});
add_action('save_post_professional_profile', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) return;
    if (!isset($_POST['portfolio_profile_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_profile_nonce'])), 'portfolio_save_profile')) return;
    $values = isset($_POST['portfolio_profile']) && is_array($_POST['portfolio_profile']) ? wp_unslash($_POST['portfolio_profile']) : [];
    foreach (portfolio_profile_fields() as $key => $field) {
        $value = isset($values[$key]) && is_string($values[$key]) ? $values[$key] : '';
        update_post_meta($post_id, $key, portfolio_sanitize_profile_value($key, $value));
    }
    if (isset($_POST['portfolio_resume_id']) && is_scalar($_POST['portfolio_resume_id'])) {
        $resume_id = absint($_POST['portfolio_resume_id']);
        if (!$resume_id || portfolio_valid_resume($resume_id)) {
            update_post_meta($post_id, 'resume_attachment_id', $resume_id);
        }
    }
});
add_action('rest_api_init', function () {
    register_rest_field('professional_profile', 'profile', [
        'get_callback' => function ($post) {
            $profile = [];
            foreach (portfolio_profile_fields() as $key => $field) {
                $profile[$key] = portfolio_sanitize_profile_value($key, get_post_meta($post['id'], $key, true));
            }
            $resume_id = absint(get_post_meta($post['id'], 'resume_attachment_id', true));
            $profile['resume_url'] = portfolio_valid_resume($resume_id) ? (wp_get_attachment_url($resume_id) ?: '') : '';
            return $profile;
        },
        'schema' => ['type' => 'object', 'readonly' => true, 'context' => ['view', 'edit']],
    ]);
});

function portfolio_valid_resume($attachment_id) {
    return get_post_type($attachment_id) === 'attachment' && in_array(get_post_mime_type($attachment_id), [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ], true);
}
add_action('add_meta_boxes_professional_profile', function () {
    add_meta_box('portfolio-resume', 'Resume', function ($post) {
        $id = absint(get_post_meta($post->ID, 'resume_attachment_id', true));
        $url = portfolio_valid_resume($id) ? wp_get_attachment_url($id) : '';
        echo '<p>Upload a PDF or Word document, or select one from the Media Library. Click Update to show it on the homepage.</p>';
        echo '<input type="hidden" id="portfolio-resume-id" name="portfolio_resume_id" value="' . esc_attr($id) . '">';
        echo '<p id="portfolio-resume-file">';
        if ($url) {
            echo '<a href="' . esc_url($url) . '" target="_blank" rel="noopener">' . esc_html(basename(get_attached_file($id))) . '</a>';
        } else {
            echo 'No resume selected';
        }
        echo '</p><button type="button" class="button" id="portfolio-resume-select">Upload / select resume</button> ';
        echo '<button type="button" class="button" id="portfolio-resume-remove">Remove resume</button>';
    }, 'professional_profile', 'normal', 'default');
});
add_action('admin_enqueue_scripts', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'professional_profile' || $screen->base !== 'post') return;
    wp_enqueue_media();
    wp_add_inline_script('media-editor', <<<'JS'
jQuery(function ($) {
    var frame;
    $('#portfolio-resume-select').on('click', function () {
        if (!frame) {
            frame = wp.media({
                title: 'Upload or select a resume',
                button: { text: 'Use this resume' },
                library: { type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
                multiple: false
            });
            frame.on('select', function () {
                var file = frame.state().get('selection').first().toJSON();
                var allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (allowed.indexOf(file.mime) === -1) {
                    window.alert('Please select a PDF or Word document.');
                    return;
                }
                $('#portfolio-resume-id').val(file.id);
                $('#portfolio-resume-file').empty().append(
                    $('<a>', { href: file.url, text: file.filename, target: '_blank', rel: 'noopener' })
                );
            });
        }
        frame.open();
    });
    $('#portfolio-resume-remove').on('click', function () {
        $('#portfolio-resume-id').val('0');
        $('#portfolio-resume-file').text('No resume selected');
    });
});
JS
    );
});
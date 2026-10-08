<?php
/**
 * Plugin Name: Portfolio Profile Pictures
 * Description: Manage the navbar portrait, name, and headline using the most recently updated published Profile Picture.
 */

add_action('init', function () {
    register_post_type('profile_picture', [
        'labels' => [
            'name' => 'Profile Pictures',
            'singular_name' => 'Profile Picture',
            'add_new_item' => 'Add Profile Picture',
            'edit_item' => 'Edit Profile Picture',
            'featured_image' => 'Profile photo',
            'set_featured_image' => 'Set profile photo',
            'remove_featured_image' => 'Remove profile photo',
        ],
        'description' => 'Set the profile photo, display name, and headline, then publish. The most recently updated published entry appears in the navbar.',
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'rest_base' => 'profile-pictures',
        'menu_icon' => 'dashicons-format-image',
        'supports' => ['title', 'thumbnail'],
    ]);
    add_post_type_support('profile_picture', 'thumbnail');
});

add_action('after_setup_theme', function () {
    add_theme_support('post-thumbnails');
});

add_action('rest_api_init', function () {
    register_rest_field('profile_picture', 'profile_image', [
        'get_callback' => function ($post) {
            $attachment_id = get_post_thumbnail_id($post['id']);
            $url = $attachment_id ? wp_get_attachment_image_url($attachment_id, 'full') : false;
            if (!$url) {
                return null;
            }
            return [
                'url' => $url,
                'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true) ?: get_the_title($post['id']),
            ];
        },
        'schema' => [
            'type' => ['object', 'null'],
            'readonly' => true,
            'context' => ['view', 'edit'],
            'properties' => [
                'url' => ['type' => 'string', 'format' => 'uri'],
                'alt' => ['type' => 'string'],
            ],
        ],
    ]);
});


add_action('add_meta_boxes_profile_picture', function () {
    add_meta_box('portfolio-profile-identity', 'Name and headline', function ($post) {
        wp_nonce_field('portfolio_save_profile_identity', 'portfolio_profile_identity_nonce');
        echo '<p>These two lines appear beside the profile photo in the navigation on every page. Click Update, then refresh the frontend.</p>';
        $fields = [
            'profile_name' => ['Display name', 'Eric Onah'],
            'profile_headline' => ['Headline', 'Full-stack Developer | WordPress | Headless CMS'],
        ];
        foreach ($fields as $key => [$label, $default]) {
            $value = metadata_exists('post', $post->ID, $key) ? get_post_meta($post->ID, $key, true) : $default;
            echo '<p><label for="'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            echo '<input class="widefat" type="text" id="'.esc_attr($key).'" name="'.esc_attr($key).'" value="'.esc_attr($value).'"></p>';
        }
    }, 'profile_picture', 'normal', 'high');
});

add_action('save_post_profile_picture', function ($id) {
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) return;
    if (!isset($_POST['portfolio_profile_identity_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_profile_identity_nonce'])), 'portfolio_save_profile_identity')) return;
    foreach (['profile_name', 'profile_headline'] as $key) {
        if (isset($_POST[$key]) && is_string($_POST[$key])) {
            update_post_meta($id, $key, wp_specialchars_decode(sanitize_text_field(wp_unslash($_POST[$key])), ENT_QUOTES));
        }
    }
});

add_action('rest_api_init', function () {
    register_rest_field('profile_picture', 'profile_identity', [
        'get_callback' => function ($post) {
            $data = [];
            foreach (['name' => 'profile_name', 'headline' => 'profile_headline'] as $field => $key) {
                if (metadata_exists('post', $post['id'], $key)) {
                    $data[$field] = wp_specialchars_decode(sanitize_text_field(get_post_meta($post['id'], $key, true)), ENT_QUOTES);
                }
            }
            return (object) $data;
        },
        'schema' => [
            'type' => 'object', 'readonly' => true, 'context' => ['view', 'edit'],
            'properties' => ['name' => ['type' => 'string'], 'headline' => ['type' => 'string']],
        ],
    ]);
});

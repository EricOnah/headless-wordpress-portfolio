<?php
/**
 * Plugin Name: Portfolio Button Labels
 * Description: Editable action labels grouped under their portfolio content sections.
 */

function portfolio_button_sections() {
    return [
        'header_content' => 'header', 'professional_profile' => 'profile',
        'skills_section' => 'skills', 'experience_section' => 'experience',
        'project_section' => 'projects', 'posts_section' => 'posts',
        'contact_page' => 'contact', 'footer_content' => 'footer',
    ];
}

function portfolio_button_defaults($type) {
    static $defaults;
    if ($defaults === null) {
        $defaults = json_decode(file_get_contents(__DIR__ . '/portfolio-button-labels.json'), true) ?: [];
    }
    $section = portfolio_button_sections()[$type] ?? '';
    return $defaults[$section] ?? [];
}

function portfolio_button_values($id, $type) {
    $values = portfolio_button_defaults($type);
    foreach ($values as $key => $fallback) {
        $saved = sanitize_text_field(get_post_meta($id, 'button_label_' . $key, true));
        $values[$key] = trim($saved) !== '' ? $saved : $fallback;
    }
    return $values;
}

add_action('init', function () {
    register_post_type('header_content', [
        'labels' => ['name' => 'Header', 'singular_name' => 'Header Content', 'add_new_item' => 'Add Header Content', 'edit_item' => 'Edit Header Content'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'rest_base' => 'header-contents', 'menu_icon' => 'dashicons-menu', 'supports' => ['title'],
    ]);
});

add_action('add_meta_boxes', function ($type) {
    if (!isset(portfolio_button_sections()[$type])) return;
    add_meta_box('portfolio-button-labels', 'Button and navigation labels', function ($post) {
        wp_nonce_field('portfolio_save_button_labels', 'portfolio_button_labels_nonce');
        echo '<p>Edit the action text for this section. Empty fields use the original wording. Publish or Update, then refresh the frontend. The most recently updated published entry is used. Links and button behavior stay the same.</p>';
        if ($post->post_type === 'professional_profile') {
            echo '<p>Home fields control the homepage contact callout. About fields control the About page buttons. Resume and social labels control the homepage profile panel and About social links.</p>';
        }
        if ($post->post_type === 'posts_section') {
            echo '<p>Article fields control individual articles. Subscription fields control the email signup, confirmation, and unsubscribe pages.</p>';
        }
        foreach (portfolio_button_values($post->ID, $post->post_type) as $key => $value) {
            $label = ucwords(str_replace('_', ' ', $key));
            echo '<p><label for="button-label-' . esc_attr($key) . '"><strong>' . esc_html($label) . '</strong></label><br>';
            echo '<input class="widefat" type="text" id="button-label-' . esc_attr($key) . '" name="portfolio_button_labels[' . esc_attr($key) . ']" value="' . esc_attr($value) . '"></p>';
        }
    }, $type, 'normal', 'default');
});

add_action('save_post', function ($id, $post) {
    if (!isset(portfolio_button_sections()[$post->post_type])) return;
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) return;
    if (!isset($_POST['portfolio_button_labels_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_button_labels_nonce'])), 'portfolio_save_button_labels')) return;
    $values = isset($_POST['portfolio_button_labels']) && is_array($_POST['portfolio_button_labels']) ? wp_unslash($_POST['portfolio_button_labels']) : [];
    foreach (portfolio_button_defaults($post->post_type) as $key => $fallback) {
        if (isset($values[$key]) && is_string($values[$key])) {
            update_post_meta($id, 'button_label_' . $key, sanitize_text_field($values[$key]));
        }
    }
}, 10, 2);

add_action('rest_api_init', function () {
    foreach (portfolio_button_sections() as $type => $section) {
        register_rest_field($type, 'button_labels', [
            'get_callback' => function ($post) use ($type) {
                return portfolio_button_values($post['id'], $type);
            },
            'schema' => ['type' => 'object', 'readonly' => true, 'context' => ['view', 'edit']],
        ]);
    }
});

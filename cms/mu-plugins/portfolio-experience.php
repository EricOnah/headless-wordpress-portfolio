<?php
/**
 * Plugin Name: Portfolio Experience
 * Description: Dashboard-managed resume roles and experience section content.
 */
function portfolio_experience_fields($type) {
    if ($type === 'experience_role') return [
        'company' => ['Company', 'text'], 'period' => ['Dates / period', 'text'],
        'location' => ['Location', 'text'], 'engagement' => ['Engagement / work arrangement', 'text'],
        'status' => ['Status badge', 'text'], 'active' => ['Current / active role', 'checkbox'],
        'contract' => ['Include in Contract filter', 'checkbox'], 'remote' => ['Include in Remote filter', 'checkbox'],
        'summary' => ['Role overview', 'textarea'], 'achievements' => ['Achievements (one per line)', 'textarea'],
        'tags' => ['Technology tags (one per line; prefix * to highlight)', 'textarea'],
        'accent' => ['Accent color', 'accent'],
        'highlight_label' => ['Results panel label', 'text'], 'highlight_value' => ['Result / metric', 'text'],
        'highlight_description' => ['Result description', 'textarea'],
        'progress_label' => ['Progress label (optional)', 'text'], 'progress_value' => ['Progress displayed value', 'text'],
        'progress_percent' => ['Progress percentage (0 to hide)', 'number'],
        'footer_label' => ['Results footer label', 'text'], 'footer_value' => ['Results footer value', 'text'],
    ];
    return [
        'eyebrow' => ['Section label', 'text'], 'heading' => ['Heading', 'text'],
        'heading_accent' => ['Highlighted heading text', 'text'], 'description' => ['Introduction', 'textarea'],
        'metrics' => ['Header metrics (one per line: Label | Value | Caption)', 'textarea'],
        'all_label' => ['All roles filter label', 'text'], 'active_label' => ['Active roles filter label', 'text'],
        'contract_label' => ['Contract filter label', 'text'], 'remote_label' => ['Remote filter label', 'text'],
        'status_label' => ['Filter toolbar status', 'text'],
        'methodology_label' => ['Methodology section label', 'text'], 'methodology_heading' => ['Methodology heading', 'text'],
        'principles' => ['Delivery principles (one per line: Title | Description)', 'textarea'],
        'cta_label' => ['Callout label', 'text'], 'cta_heading' => ['Callout heading', 'text'],
        'cta_description' => ['Callout description', 'textarea'], 'resume_label' => ['Resume button label', 'text'],
        'contact_label' => ['Contact button label', 'text'], 'contact_url' => ['Contact button URL', 'url'],
    ];
}
function portfolio_experience_clean($key, $value, $type) {
    $kind = portfolio_experience_fields($type)[$key][1] ?? 'text';
    if ($kind === 'number') return (string) min(100, max(0, (int) $value));
    if ($kind === 'checkbox') return $value === '1' ? '1' : '0';
    if ($kind === 'accent') return $value === 'cyan' ? 'cyan' : 'emerald';
    if ($kind === 'url') {
        if (strpos($value, '/') === 0 && strpos($value, '//') !== 0) return esc_url_raw($value);
        $url = esc_url_raw($value, ['http', 'https']);
        return preg_match('#^https?://#i', $url) ? $url : '';
    }
    return wp_specialchars_decode($kind === 'textarea' ? sanitize_textarea_field($value) : sanitize_text_field($value), ENT_QUOTES);
}
add_action('init', function () {
    register_post_type('experience_role', [
        'labels' => ['name' => 'Experience', 'singular_name' => 'Experience Role', 'add_new_item' => 'Add Experience Role', 'edit_item' => 'Edit Experience Role'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'rest_base' => 'experience-roles', 'menu_icon' => 'dashicons-businessperson',
        'supports' => ['title', 'page-attributes'],
    ]);
    register_post_type('experience_section', [
        'labels' => ['name' => 'Section Content', 'singular_name' => 'Experience Section', 'add_new_item' => 'Add Experience Section', 'edit_item' => 'Edit Experience Section'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'show_in_menu' => 'edit.php?post_type=experience_role',
        'rest_base' => 'experience-sections', 'supports' => ['title'],
    ]);
});
add_action('add_meta_boxes', function ($type) {
    if (!in_array($type, ['experience_role', 'experience_section'], true)) return;
    add_meta_box('portfolio-experience-details', 'Experience content', function ($post) {
        wp_nonce_field('portfolio_save_experience', 'portfolio_experience_nonce');
        echo '<p>The role title is the job title. Publish and refresh the frontend to see changes. Order controls role placement (lower first). The most recently updated published Section Content entry is used.</p>';
        foreach (portfolio_experience_fields($post->post_type) as $key => [$label, $kind]) {
            $value = wp_specialchars_decode(get_post_meta($post->ID, $key, true), ENT_QUOTES);
            $name = 'portfolio_experience[' . $key . ']';
            echo '<p><label for="experience-' . esc_attr($key) . '"><strong>' . esc_html($label) . '</strong></label><br>';
            if ($kind === 'textarea') {
                echo '<textarea class="widefat" rows="5" id="experience-' . esc_attr($key) . '" name="' . esc_attr($name) . '">' . esc_textarea($value) . '</textarea>';
            } elseif ($kind === 'accent') {
                echo '<select id="experience-' . esc_attr($key) . '" name="' . esc_attr($name) . '">';
                foreach (['emerald' => 'Emerald', 'cyan' => 'Cyan'] as $option => $text) echo '<option value="' . esc_attr($option) . '" ' . selected($value, $option, false) . '>' . esc_html($text) . '</option>';
                echo '</select>';
            } elseif ($kind === 'checkbox') {
                echo '<input type="hidden" name="' . esc_attr($name) . '" value="0"><input type="checkbox" id="experience-' . esc_attr($key) . '" name="' . esc_attr($name) . '" value="1" ' . checked($value, '1', false) . '>';
            } else {
                echo '<input class="widefat" type="' . ($kind === 'number' ? 'number' : 'text') . '" ' . ($kind === 'number' ? 'min="0" max="100"' : '') . ' id="experience-' . esc_attr($key) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '">';
            }
            echo '</p>';
        }
    }, $type, 'normal', 'high');
});
add_action('save_post', function ($id, $post) {
    if (!in_array($post->post_type, ['experience_role', 'experience_section'], true)) return;
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) return;
    if (!isset($_POST['portfolio_experience_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_experience_nonce'])), 'portfolio_save_experience')) return;
    $values = isset($_POST['portfolio_experience']) && is_array($_POST['portfolio_experience']) ? wp_unslash($_POST['portfolio_experience']) : [];
    foreach (portfolio_experience_fields($post->post_type) as $key => $field) {
        $value = isset($values[$key]) && is_string($values[$key]) ? $values[$key] : '';
        update_post_meta($id, $key, portfolio_experience_clean($key, $value, $post->post_type));
    }
}, 10, 2);
add_action('rest_api_init', function () {
    foreach (['experience_role', 'experience_section'] as $type) {
        register_rest_field($type, 'experience_data', [
            'get_callback' => function ($post) use ($type) {
                $data = ['title' => wp_specialchars_decode(get_the_title($post['id']), ENT_QUOTES)];
                foreach (portfolio_experience_fields($type) as $key => $field) $data[$key] = portfolio_experience_clean($key, get_post_meta($post['id'], $key, true), $type);
                return $data;
            },
            'schema' => ['type' => 'object', 'readonly' => true, 'context' => ['view', 'edit']],
        ]);
    }
});

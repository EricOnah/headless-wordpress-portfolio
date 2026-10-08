<?php
/**
 * Plugin Name: Portfolio Skills
 * Description: Manage skill categories and skills section content for the portfolio.
 */
function portfolio_skills_fields($type) {
    if ($type === 'skill_category') return [
        'filter_label' => ['Short filter label', 'text'],
        'eyebrow' => ['Category subtitle', 'text'],
        'description' => ['Description', 'textarea'],
        'items' => ['Skills (one per line; prefix a skill with * to highlight it)', 'textarea'],
        'icon' => ['Icon', 'icon'],
        'accent' => ['Accent color', 'accent'],
        'wide' => ['Wide card (spans two columns on desktop)', 'checkbox'],
        'meter_label' => ['Proficiency label (optional)', 'text'],
        'meter_score' => ['Proficiency percentage (0 to hide)', 'number'],
        'meter_note' => ['Proficiency note', 'text'],
        'highlights' => ['Highlights (one per line: Label | Value)', 'textarea'],
        'status' => ['Footer status', 'text'],
        'footer_note' => ['Footer note', 'text'],
    ];
    return [
        'eyebrow' => ['Section label', 'text'],
        'eyebrow_note' => ['Section label note', 'text'],
        'heading' => ['Heading', 'text'],
        'heading_accent' => ['Highlighted heading text', 'text'],
        'description' => ['Introduction', 'textarea'],
        'verification' => ['Header status', 'text'],
        'updated_label' => ['Header update label', 'text'],
        'readiness_label' => ['Metrics card heading', 'text'],
        'readiness_status' => ['Metrics card badge', 'text'],
        'count_caption' => ['Technology count caption', 'text'],
        'search_placeholder' => ['Search placeholder', 'text'],
        'core_eyebrow' => ['Core stack label', 'text'],
        'core_note' => ['Core stack note', 'text'],
        'core_heading' => ['Core stack heading', 'text'],
        'core_description' => ['Core stack description', 'textarea'],
        'core_items' => ['Core stack (one per line: Technology | Subtitle)', 'textarea'],
        'cta_heading' => ['Callout heading', 'text'],
        'cta_description' => ['Callout description', 'textarea'],
        'resume_label' => ['Resume button label (uses Professional Profile resume)', 'text'],
        'contact_label' => ['Contact button label', 'text'],
        'contact_url' => ['Contact button URL', 'url'],
    ];
}
function portfolio_skills_clean($key, $value, $type) {
    $kind = portfolio_skills_fields($type)[$key][1] ?? 'text';
    if ($kind === 'number') return (string) min(100, max(0, (int) $value));
    if ($kind === 'checkbox') return $value === '1' ? '1' : '0';
    if ($kind === 'icon') return in_array($value, ['cms', 'code', 'server', 'database', 'terminal'], true) ? $value : 'code';
    if ($kind === 'accent') return $value === 'cyan' ? 'cyan' : 'emerald';
    if ($kind === 'url') {
        if (strpos($value, '/') === 0 && strpos($value, '//') !== 0) return esc_url_raw($value);
        $url = esc_url_raw($value, ['http', 'https']);
        return preg_match('#^https?://#i', $url) ? $url : '';
    }
    return $kind === 'textarea' ? sanitize_textarea_field($value) : sanitize_text_field($value);
}
add_action('init', function () {
    register_post_type('skill_category', [
        'labels' => ['name' => 'Skills', 'singular_name' => 'Skill Category', 'add_new_item' => 'Add Skill Category', 'edit_item' => 'Edit Skill Category'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'rest_base' => 'skill-categories', 'menu_icon' => 'dashicons-editor-code',
        'supports' => ['title', 'page-attributes'],
    ]);
    register_post_type('skills_section', [
        'labels' => ['name' => 'Section Content', 'singular_name' => 'Skills Section', 'add_new_item' => 'Add Skills Section', 'edit_item' => 'Edit Skills Section'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'show_in_menu' => 'edit.php?post_type=skill_category',
        'rest_base' => 'skills-sections', 'supports' => ['title'],
    ]);
});
add_action('add_meta_boxes', function ($type) {
    if (!in_array($type, ['skill_category', 'skills_section'], true)) return;
    add_meta_box('portfolio-skills-details', 'Skills content', function ($post) {
        wp_nonce_field('portfolio_save_skills', 'portfolio_skills_nonce');
        echo '<p>Publish and refresh the frontend to see changes. Category order uses the Order field; lower numbers appear first. The most recently updated published Section Content entry is used.</p>';
        foreach (portfolio_skills_fields($post->post_type) as $key => [$label, $kind]) {
            $value = get_post_meta($post->ID, $key, true);
            echo '<p><label for="skills-' . esc_attr($key) . '"><strong>' . esc_html($label) . '</strong></label><br>';
            $name = 'portfolio_skills[' . $key . ']';
            if ($kind === 'textarea') {
                echo '<textarea class="widefat" rows="5" id="skills-' . esc_attr($key) . '" name="' . esc_attr($name) . '">' . esc_textarea($value) . '</textarea>';
            } elseif ($kind === 'icon' || $kind === 'accent') {
                $choices = $kind === 'icon' ? ['cms' => 'CMS', 'code' => 'Code', 'server' => 'Server', 'database' => 'Database', 'terminal' => 'Terminal'] : ['emerald' => 'Emerald', 'cyan' => 'Cyan'];
                echo '<select id="skills-' . esc_attr($key) . '" name="' . esc_attr($name) . '">';
                foreach ($choices as $option => $text) echo '<option value="' . esc_attr($option) . '" ' . selected($value, $option, false) . '>' . esc_html($text) . '</option>';
                echo '</select>';
            } elseif ($kind === 'checkbox') {
                echo '<input type="hidden" name="' . esc_attr($name) . '" value="0"><input type="checkbox" id="skills-' . esc_attr($key) . '" name="' . esc_attr($name) . '" value="1" ' . checked($value, '1', false) . '>';
            } else {
                echo '<input class="widefat" type="' . ($kind === 'number' ? 'number' : 'text') . '" ' . ($kind === 'number' ? 'min="0" max="100"' : '') . ' id="skills-' . esc_attr($key) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '">';
            }
            echo '</p>';
        }
    }, $type, 'normal', 'high');
});
add_action('save_post', function ($id, $post) {
    if (!in_array($post->post_type, ['skill_category', 'skills_section'], true)) return;
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) return;
    if (!isset($_POST['portfolio_skills_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_skills_nonce'])), 'portfolio_save_skills')) return;
    $values = isset($_POST['portfolio_skills']) && is_array($_POST['portfolio_skills']) ? wp_unslash($_POST['portfolio_skills']) : [];
    foreach (portfolio_skills_fields($post->post_type) as $key => $field) {
        $value = isset($values[$key]) && is_string($values[$key]) ? $values[$key] : '';
        update_post_meta($id, $key, portfolio_skills_clean($key, $value, $post->post_type));
    }
}, 10, 2);
add_action('rest_api_init', function () {
    foreach (['skill_category', 'skills_section'] as $type) {
        register_rest_field($type, 'skills_data', [
            'get_callback' => function ($post) use ($type) {
                $data = ["title" => wp_specialchars_decode(get_the_title($post["id"]), ENT_QUOTES)];
                foreach (portfolio_skills_fields($type) as $key => $field) $data[$key] = portfolio_skills_clean($key, get_post_meta($post['id'], $key, true), $type);
                return $data;
            },
            'schema' => ['type' => 'object', 'readonly' => true, 'context' => ['view', 'edit']],
        ]);
    }
});

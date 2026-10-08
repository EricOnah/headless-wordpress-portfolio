<?php
/**
 * Plugin Name: Portfolio Content Bundle
 * Description: Fresh published portfolio content in one WordPress bootstrap.
 */

function portfolio_content_collections() {
    return [
        'profile-pictures' => ['id', 'profile_image', 'profile_identity'],
        'professional-profiles' => ['id', 'profile'],
        'homepage-heroes' => ['id', 'hero_data'],
        'footer-contents' => ['id', 'footer_data'],
        'skills-sections' => ['id', 'skills_data'],
        'skill-categories' => ['id', 'skills_data'],
        'experience-sections' => ['id', 'experience_data'],
        'experience-roles' => ['id', 'experience_data'],
        'project-sections' => ['id', 'project_data'],
        'portfolio-projects' => ['id', 'slug', 'project_data'],
        'education-profiles' => ['id', 'education_data'],
        'contact-pages' => ['id', 'contact_data'],
    ];
}

add_action('rest_api_init', function () {
    register_rest_route('portfolio/v1', '/content', [
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'callback' => function () {
            $collections = [];
            $lists = ['skill-categories', 'experience-roles', 'portfolio-projects'];
            foreach (portfolio_content_collections() as $route => $fields) {
                $is_list = in_array($route, $lists, true);
                $request = new WP_REST_Request('GET', '/wp/v2/' . $route);
                $request->set_query_params([
                    'status' => 'publish',
                    'context' => 'view',
                    'orderby' => $is_list ? 'menu_order' : 'modified',
                    'order' => $is_list ? 'asc' : 'desc',
                    'per_page' => $is_list ? 100 : 1,
                    'page' => 1,
                    '_fields' => implode(',', $fields),
                ]);
                // Dispatch inside this bootstrap, without extra HTTP requests.
                $result = rest_do_request($request);
                $data = $result->get_data();
                if ($result->get_status() === 200 && is_array($data)) {
                    $allowed = array_fill_keys($fields, true);
                    $data = array_map(function ($entry) use ($allowed) {
                        return array_intersect_key($entry, $allowed);
                    }, $data);
                }
                $headers = $result->get_headers();
                $collections[$route] = [
                    'status' => $result->get_status(),
                    'body' => $data,
                    'total_pages' => (int) ($headers['X-WP-TotalPages'] ?? 1),
                ];
            }
            $response = new WP_REST_Response(['collections' => $collections]);
            $response->header('Cache-Control', 'no-store, max-age=0');
            return $response;
        },
    ]);
});

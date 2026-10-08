<?php
require_once ABSPATH.'wp-admin/includes/file.php';
require_once ABSPATH.'wp-admin/includes/media.php';
require_once ABSPATH.'wp-admin/includes/image.php';
foreach(['omonoia-foundation','omonoia-e-shop','gree-cyprus','gdm-architecture'] as $slug){
    $posts=get_posts(['post_type'=>'portfolio_project','name'=>$slug,'post_status'=>'publish','numberposts'=>1]);
    if(!$posts||has_post_thumbnail($posts[0]->ID)) continue;
    $source=dirname(__DIR__).'/public/projects/'.$slug.'.png';
    $temp=wp_tempnam($source);
    copy($source,$temp);
    $media=media_handle_sideload(['name'=>$slug.'.png','tmp_name'=>$temp],$posts[0]->ID,$posts[0]->post_title.' website preview');
    if(is_wp_error($media)) throw new Exception($media->get_error_message());
    update_post_meta($media,'_wp_attachment_image_alt',$posts[0]->post_title.' website preview');
    set_post_thumbnail($posts[0]->ID,$media);
    echo $slug.' '.$media."\n";
}
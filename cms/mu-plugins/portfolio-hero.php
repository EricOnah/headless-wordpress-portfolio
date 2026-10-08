<?php
/**
 * Plugin Name: Portfolio Hero and Work Signals
 * Description: Dashboard-managed homepage hero and moving work signals.
 */
function portfolio_hero_fields(){
    return [
        'label'=>['Hero section label','text'],
        'name'=>['Display name','text'],
        'role'=>['Professional title','text'],
        'description'=>['Hero description','textarea'],
        'primary_label'=>['Primary button label','text'],
        'primary_url'=>['Primary button URL','url'],
        'secondary_label'=>['Secondary button label','text'],
        'secondary_url'=>['Secondary button URL','url'],
        'image_alt'=>['Hero image alternative text','text'],
        'caption_heading'=>['Image caption heading','text'],
        'caption_body'=>['Image caption description','textarea'],
        'signals_heading'=>['Moving Work Signal heading','text'],
        'signals_items'=>['Work signals (Title | Description, one per line)','textarea'],
    ];
}
function portfolio_hero_clean($key,$value){
    $kind=portfolio_hero_fields()[$key][1]??'text';
    if($kind==='url'){
        if(preg_match('#^/(?!/)#',$value)) return esc_url_raw($value);
        $url=esc_url_raw($value,['http','https']);
        return preg_match('#^https?://#i',$url)?$url:'';
    }
    return wp_specialchars_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES);
}
add_action('init',function(){
    add_theme_support('post-thumbnails');
    register_post_type('homepage_hero',[
        'labels'=>['name'=>'Hero & Work Signals','singular_name'=>'Homepage Hero Content','add_new_item'=>'Add Homepage Hero Content','edit_item'=>'Edit Homepage Hero Content'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'homepage-heroes',
        'menu_icon'=>'dashicons-cover-image','supports'=>['title','thumbnail'],
    ]);
});
add_action('add_meta_boxes_homepage_hero',function(){
    add_meta_box('portfolio-hero-content','Hero and Moving Work Signal content',function($post){
        wp_nonce_field('portfolio_save_hero','portfolio_hero_nonce');
        echo '<p>The latest updated published entry supplies the homepage hero and moving work signals. Enter signals as Title | Description, one per line. Add, remove or reorder lines to control the ticker. Clearing all signals hides the ticker. Button URLs accept site paths (such as /projects) or full http(s) URLs; clear a URL to hide its button. Set Featured image to replace the hero illustration; without one the original illustration is used. Click Update and refresh the homepage.</p>';
        foreach(portfolio_hero_fields() as $key=>[$label,$kind]){
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_hero['.$key.']';
            echo '<p><label for="hero-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea') echo '<textarea class="widefat" rows="5" id="hero-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            else echo '<input class="widefat" type="'.esc_attr($kind==='url'?'text':$kind).'" id="hero-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            echo '</p>';
        }
    },'homepage_hero','normal','high');
});
add_action('save_post_homepage_hero',function($id){
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_hero_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_hero_nonce'])),'portfolio_save_hero')) return;
    $values=isset($_POST['portfolio_hero'])&&is_array($_POST['portfolio_hero'])?wp_unslash($_POST['portfolio_hero']):[];
    foreach(portfolio_hero_fields() as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_hero_clean($key,$value));
    }
});
add_action('rest_api_init',function(){
    register_rest_field('homepage_hero','hero_data',[
        'get_callback'=>function($post){
            $data=[];
            foreach(portfolio_hero_fields() as $key=>$field) $data[$key]=portfolio_hero_clean($key,get_post_meta($post['id'],$key,true));
            $image_id=get_post_thumbnail_id($post['id']);
            $data['image_url']=$image_id?(wp_get_attachment_image_url($image_id,'large')?:''):'';
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});

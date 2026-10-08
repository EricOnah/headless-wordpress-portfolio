<?php
/**
 * Plugin Name: Portfolio Footer
 * Description: Dashboard-managed site footer identity and contact links.
 */
function portfolio_footer_fields(){
    return [
        'name'=>['Display name','text'],
        'headline'=>['Headline','text'],
        'email'=>['Email','email'],
        'phone'=>['Phone','text'],
        'linkedin_label'=>['LinkedIn label','text'],
        'linkedin_url'=>['LinkedIn URL','url'],
        'github_label'=>['GitHub label','text'],
        'github_url'=>['GitHub URL','url'],
    ];
}
function portfolio_footer_clean($key,$value){
    $kind=portfolio_footer_fields()[$key][1]??'text';
    if($kind==='email') return sanitize_email($value);
    if($kind==='url'){
        $url=esc_url_raw($value,['http','https']);
        return preg_match('#^https?://#i',$url)?$url:'';
    }
    return wp_specialchars_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES);
}
add_action('init',function(){
    register_post_type('footer_content',[
        'labels'=>['name'=>'Footer','singular_name'=>'Footer Content','add_new_item'=>'Add Footer Content','edit_item'=>'Edit Footer Content'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'footer-contents',
        'menu_icon'=>'dashicons-align-center','supports'=>['title'],
    ]);
});
add_action('add_meta_boxes_footer_content',function(){
    add_meta_box('portfolio-footer-content','Footer content',function($post){
        wp_nonce_field('portfolio_save_footer','portfolio_footer_nonce');
        echo '<p>The latest updated published entry supplies the footer on every page. Edit the name, headline, contact details, and social link labels and URLs. Clearing email, phone, or a social URL hides that link. Click Update, then refresh the frontend.</p>';
        foreach(portfolio_footer_fields() as $key=>[$label,$kind]){
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_footer['.$key.']';
            echo '<p><label for="footer-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea') echo '<textarea class="widefat" rows="5" id="footer-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            else echo '<input class="widefat" type="'.esc_attr($kind).'" id="footer-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            echo '</p>';
        }
    },'footer_content','normal','high');
});
add_action('save_post_footer_content',function($id){
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_footer_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_footer_nonce'])),'portfolio_save_footer')) return;
    $values=isset($_POST['portfolio_footer'])&&is_array($_POST['portfolio_footer'])?wp_unslash($_POST['portfolio_footer']):[];
    foreach(portfolio_footer_fields() as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_footer_clean($key,$value));
    }
});
add_action('rest_api_init',function(){
    register_rest_field('footer_content','footer_data',[
        'get_callback'=>function($post){
            $data=[];
            foreach(portfolio_footer_fields() as $key=>$field) $data[$key]=portfolio_footer_clean($key,get_post_meta($post['id'],$key,true));
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});

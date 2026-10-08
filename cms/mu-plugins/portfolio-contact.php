<?php
/**
 * Plugin Name: Portfolio Contact Page
 * Description: Dashboard-managed Contact page introduction and direct contact details.
 */
function portfolio_contact_fields(){
    return [
        'page_label'=>['Page label','text'],
        'heading'=>['Heading','text'],
        'introduction'=>['Introduction','textarea'],
        'direct_lines_label'=>['Direct lines label','text'],
        'email_label'=>['Email label','text'],
        'email'=>['Email','email'],
        'phone_label'=>['Phone label','text'],
        'phone'=>['Phone','text'],
        'whatsapp_url'=>['WhatsApp URL','url'],
        'whatsapp_label'=>['WhatsApp icon label','text'],
        'linkedin_label'=>['LinkedIn label','text'],
        'linkedin_action'=>['LinkedIn action','text'],
        'linkedin_url'=>['LinkedIn URL','url'],
        'github_label'=>['GitHub label','text'],
        'github_action'=>['GitHub action','text'],
        'github_url'=>['GitHub URL','url'],
        'focus_heading'=>['Focus heading','text'],
        'focus_items'=>['Focus items (one per line)','textarea'],
    ];
}
function portfolio_contact_clean($key,$value){
    $kind=portfolio_contact_fields()[$key][1]??'text';
    if($kind==='email') return sanitize_email($value);
    if($kind==='url'){
        $url=esc_url_raw($value,['http','https']);
        return preg_match('#^https?://#i',$url)?$url:'';
    }
    return wp_specialchars_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES);
}
add_action('init',function(){
    register_post_type('contact_page',[
        'labels'=>['name'=>'Contact Page','singular_name'=>'Contact Page Content','add_new_item'=>'Add Contact Page Content','edit_item'=>'Edit Contact Page Content'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'contact-pages',
        'menu_icon'=>'dashicons-email-alt','supports'=>['title'],
    ]);
});
add_action('add_meta_boxes_contact_page',function(){
    add_meta_box('portfolio-contact-content','Contact page content',function($post){
        wp_nonce_field('portfolio_save_contact','portfolio_contact_nonce');
        echo '<p>The latest updated published entry supplies the Contact page introduction and Direct lines panel. Enter focus items one per line. Clearing a contact URL hides its link. Click Update and refresh the page. Form fields and email delivery are configured separately.</p>';
        foreach(portfolio_contact_fields() as $key=>[$label,$kind]){
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_contact['.$key.']';
            echo '<p><label for="contact-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea') echo '<textarea class="widefat" rows="5" id="contact-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            else echo '<input class="widefat" type="'.esc_attr($kind).'" id="contact-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            echo '</p>';
        }
    },'contact_page','normal','high');
});
add_action('save_post_contact_page',function($id){
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_contact_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_contact_nonce'])),'portfolio_save_contact')) return;
    $values=isset($_POST['portfolio_contact'])&&is_array($_POST['portfolio_contact'])?wp_unslash($_POST['portfolio_contact']):[];
    foreach(portfolio_contact_fields() as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_contact_clean($key,$value));
    }
});
add_action('rest_api_init',function(){
    register_rest_field('contact_page','contact_data',[
        'get_callback'=>function($post){
            $data=[];
            foreach(portfolio_contact_fields() as $key=>$field) $data[$key]=portfolio_contact_clean($key,get_post_meta($post['id'],$key,true));
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});

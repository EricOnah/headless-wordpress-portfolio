<?php
/**
 * Plugin Name: Portfolio Education & Certifications
 * Description: Dashboard-managed About page education and certifications.
 */
function portfolio_education_fields() {
    return [
        'education_label'=>['Education section label','text'],
        'education_heading'=>['Education heading','text'],
        'degree'=>['Degree / qualification','text'],
        'school'=>['School / institution','text'],
        'period'=>['Dates / period','text'],
        'certifications_label'=>['Certifications section label','text'],
        'certifications_heading'=>['Certifications heading','text'],
        'certifications'=>['Certifications (one per line; remove a line to remove an item)','textarea'],
        'certification_status'=>['Certification badge text','text'],
    ];
}
function portfolio_education_clean($key,$value) {
    $kind=portfolio_education_fields()[$key][1]??'text';
    return wp_specialchars_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES);
}
add_action('init',function(){
    register_post_type('education_profile',[
        'labels'=>['name'=>'Education & Certifications','singular_name'=>'Education Profile','add_new_item'=>'Add Education Profile','edit_item'=>'Edit Education & Certifications'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'education-profiles',
        'menu_icon'=>'dashicons-welcome-learn-more','supports'=>['title'],
    ]);
});
add_action('add_meta_boxes_education_profile',function(){
    add_meta_box('portfolio-education-content','About page education & certifications',function($post){
        wp_nonce_field('portfolio_save_education','portfolio_education_nonce');
        echo '<p>The latest updated published entry supplies the About page section. Add certifications one per line, or delete a line to remove an item. Click Update and refresh the About page.</p>';
        foreach(portfolio_education_fields() as $key=>[$label,$kind]){
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_education['.$key.']';
            echo '<p><label for="education-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea') {
                echo '<textarea class="widefat" rows="7" id="education-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            }else{
                echo '<input class="widefat" type="text" id="education-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            }
            echo '</p>';
        }
    },'education_profile','normal','high');
});
add_action('save_post_education_profile',function($id){
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_education_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_education_nonce'])),'portfolio_save_education')) return;
    $values=isset($_POST['portfolio_education'])&&is_array($_POST['portfolio_education'])?wp_unslash($_POST['portfolio_education']):[];
    foreach(portfolio_education_fields() as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_education_clean($key,$value));
    }
});
add_action('rest_api_init',function(){
    register_rest_field('education_profile','education_data',[
        'get_callback'=>function($post){
            $data=[];
            foreach(portfolio_education_fields() as $key=>$field) $data[$key]=portfolio_education_clean($key,get_post_meta($post['id'],$key,true));
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});
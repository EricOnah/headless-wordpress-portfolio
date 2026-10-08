<?php
/**
 * Plugin Name: Portfolio Posts
 * Description: WordPress-managed Posts page content and clean published article data.
 */
function portfolio_posts_section_fields(){
    return [
        'eyebrow'=>['Eyebrow','text'],
        'heading'=>['Heading','text'],
        'heading_accent'=>['Heading accent','text'],
        'description'=>['Description','textarea'],
        'source_label'=>['Source label','text'],
        'back_label'=>['Back label','text'],
        'feed_label'=>['Feed label','text'],
        'total_label'=>['Total label','text'],
        'read_time_label'=>['Read time label','text'],
        'publishing_label'=>['Publishing label','text'],
        'publishing_value'=>['Publishing value','text'],
        'all_label'=>['All label','text'],
        'latest_label'=>['Latest label','text'],
        'archive_label'=>['Archive label','text'],
        'search_placeholder'=>['Search placeholder','text'],
        'view_label'=>['View label','text'],
        'empty_heading'=>['Empty heading','text'],
        'empty_description'=>['Empty description','textarea'],
        'no_results'=>['No results','text'],
        'error_heading'=>['Error heading','text'],
        'error_description'=>['Error description','textarea'],
        'principles_label'=>['Principles label','text'],
        'principles_heading'=>['Principles heading','text'],
        'principles_description'=>['Principles description','textarea'],
        'principles'=>['Principles (Title | Description | Footer, one per line)','textarea'],
        'cta_label'=>['Cta label','text'],
        'cta_heading'=>['Cta heading','text'],
        'cta_description'=>['Cta description','textarea'],
        'feed_button_label'=>['Feed button label','text'],
        'contact_label'=>['Contact label','text'],
        'contact_url'=>['Contact url','url'],
    ];
}
function portfolio_posts_section_clean($key,$value){
    $kind=portfolio_posts_section_fields()[$key][1]??'text';
    if($kind==='url'){
        if(strpos($value,'/')===0 && strpos($value,'//')!==0) return esc_url_raw($value);
        $url=esc_url_raw($value,['http','https']);
        return preg_match('#^https?://#i',$url)?$url:'';
    }
    return html_entity_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES,'UTF-8');
}
add_action('init',function(){
    register_post_type('posts_section',[
        'labels'=>['name'=>'Page Content','singular_name'=>'Posts Page Content','add_new_item'=>'Add Posts Page Content','edit_item'=>'Edit Posts Page Content'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'posts-sections',
        'show_in_menu'=>'edit.php','supports'=>['title'],
    ]);
});
add_action('add_meta_boxes_posts_section',function(){
    add_meta_box('portfolio-posts-page-content','Posts page content',function($post){
        wp_nonce_field('portfolio_save_posts_section','portfolio_posts_section_nonce');
        echo '<p>Publish and refresh the Posts page. The latest updated published Page Content entry is used. Articles are managed in Posts; sticky posts appear in Latest notes, or the four newest posts are selected when none are sticky.</p>';
        foreach(portfolio_posts_section_fields() as $key=>[$label,$kind]){
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_posts_section['.$key.']';
            echo '<p><label for="posts-section-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea') echo '<textarea class="widefat" rows="5" id="posts-section-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            else echo '<input class="widefat" type="text" id="posts-section-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            echo '</p>';
        }
    },'posts_section','normal','high');
});
add_action('save_post_posts_section',function($id){
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_posts_section_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_posts_section_nonce'])),'portfolio_save_posts_section')) return;
    $values=isset($_POST['portfolio_posts_section'])&&is_array($_POST['portfolio_posts_section'])?wp_unslash($_POST['portfolio_posts_section']):[];
    foreach(portfolio_posts_section_fields() as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_posts_section_clean($key,$value));
    }
});
add_action('rest_api_init',function(){
    register_rest_field('posts_section','posts_section_data',[
        'get_callback'=>function($post){
            $data=[];
            foreach(portfolio_posts_section_fields() as $key=>$field) $data[$key]=portfolio_posts_section_clean($key,get_post_meta($post['id'],$key,true));
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
    register_rest_field('post','portfolio_post_data',[
        'get_callback'=>function($post){
            $entry=get_post($post['id']);
            if(post_password_required($entry)) return [
                'title'=>html_entity_decode(wp_strip_all_tags(get_the_title($entry)),ENT_QUOTES,'UTF-8'),
                'excerpt'=>'This article is password protected.','content'=>'','reading_minutes'=>1,
            ];
            $plain=function($html){return html_entity_decode(wp_strip_all_tags($html),ENT_QUOTES,'UTF-8');};
            $content=wp_kses_post(apply_filters('the_content',$entry->post_content));
            $text=preg_replace('/\s+/u',' ',trim($plain($content)));
            $words=preg_split('/\s+/u',$text,-1,PREG_SPLIT_NO_EMPTY);
            return [
                'title'=>$plain(get_the_title($entry)),
                'excerpt'=>trim($plain(get_the_excerpt($entry))),
                'content'=>$content,
                'reading_minutes'=>max(1,(int)ceil(count($words)/200)),
            ];
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});

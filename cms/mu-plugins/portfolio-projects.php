<?php
/**
 * Plugin Name: Portfolio Projects
 * Description: Dashboard-managed project cards and section content.
 */
function portfolio_projects_fields($type) {
    if ($type === 'portfolio_project') return [
        'category'=>['Filter category','text'], 'badge'=>['Card badge','text'],
        'description'=>['Project description','textarea'], 'highlight'=>['Technical highlight','text'],
        'tags'=>['Tags (one per line)','textarea'], 'url'=>['Live website / View URL','url'],
        'featured'=>['Featured project (show on homepage)','checkbox'], 'accent'=>['Accent color','accent'],
    ];
    return [
        'eyebrow'=>['Section label','text'], 'heading'=>['Heading','text'], 'heading_accent'=>['Highlighted heading','text'],
        'description'=>['Introduction','textarea'], 'all_label'=>['All projects filter label','text'],
        'archive_label'=>['Archive link label','text'], 'view_label'=>['View button label','text'],
        'principles_label'=>['Principles label','text'], 'principles_heading'=>['Principles heading','text'],
        'principles'=>['Principles (one per line: Title | Description)','textarea'],
        'cta_label'=>['Callout label','text'], 'cta_heading'=>['Callout heading','text'],
        'cta_description'=>['Callout description','textarea'], 'contact_label'=>['Contact button label','text'],
        'contact_url'=>['Contact button URL','url'], 'resume_label'=>['Resume button label','text'],
    ];
}
function portfolio_projects_clean($key,$value,$type) {
    $kind=portfolio_projects_fields($type)[$key][1]??'text';
    if($kind==='checkbox') return $value==='1'?'1':'0';
    if($kind==='accent') return $value==='cyan'?'cyan':'emerald';
    if($kind==='url'){
        if(strpos($value,'/')===0 && strpos($value,'//')!==0) return esc_url_raw($value);
        $url=esc_url_raw($value,['http','https']);
        return preg_match('#^https?://#i',$url)?$url:'';
    }
    return wp_specialchars_decode($kind==='textarea'?sanitize_textarea_field($value):sanitize_text_field($value),ENT_QUOTES);
}
add_action('init',function(){
    register_post_type('portfolio_project',[
        'labels'=>['name'=>'Projects','singular_name'=>'Portfolio Project','add_new_item'=>'Add Project','edit_item'=>'Edit Project'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'portfolio-projects',
        'menu_icon'=>'dashicons-portfolio','supports'=>['title','thumbnail','page-attributes'],
    ]);
    register_post_type('project_section',[
        'labels'=>['name'=>'Section Content','singular_name'=>'Projects Section'],
        'public'=>false,'show_ui'=>true,'show_in_rest'=>true,'rest_base'=>'project-sections',
        'show_in_menu'=>'edit.php?post_type=portfolio_project','supports'=>['title'],
    ]);
});
add_action('after_setup_theme',function(){add_theme_support('post-thumbnails');});
add_action('add_meta_boxes',function($type){
    if(!in_array($type,['portfolio_project','project_section'],true)) return;
    add_meta_box('portfolio-projects-details','Project content',function($post){
        wp_nonce_field('portfolio_save_projects','portfolio_projects_nonce');
        echo '<p>Set the title, featured image, details and live website link. Check Featured for homepage visibility. Order controls placement (lower first). Publish and refresh the frontend. The latest updated published Section Content entry is used.</p>';
        foreach(portfolio_projects_fields($post->post_type) as $key=>[$label,$kind]){
            if($post->post_type==='portfolio_project' && $key==='featured') continue;
            $value=get_post_meta($post->ID,$key,true);
            $name='portfolio_projects['.$key.']';
            echo '<p><label for="projects-'.esc_attr($key).'"><strong>'.esc_html($label).'</strong></label><br>';
            if($kind==='textarea'){
                echo '<textarea class="widefat" rows="5" id="projects-'.esc_attr($key).'" name="'.esc_attr($name).'">'.esc_textarea($value).'</textarea>';
            }elseif($kind==='checkbox'){
                echo '<input type="hidden" name="'.esc_attr($name).'" value="0"><input type="checkbox" id="projects-'.esc_attr($key).'" name="'.esc_attr($name).'" value="1" '.checked($value,'1',false).'>';
            }elseif($kind==='accent'){
                echo '<select id="projects-'.esc_attr($key).'" name="'.esc_attr($name).'">';
                foreach(['emerald'=>'Emerald','cyan'=>'Cyan'] as $option=>$text) echo '<option value="'.esc_attr($option).'" '.selected($value,$option,false).'>'.esc_html($text).'</option>';
                echo '</select>';
            }else{
                echo '<input class="widefat" type="'.('text').'" id="projects-'.esc_attr($key).'" name="'.esc_attr($name).'" value="'.esc_attr($value).'">';
            }
            echo '</p>';
        }
    },$type,'normal','high');
    if($type==='portfolio_project'){
        add_meta_box('portfolio-featured-project','Featured Project',function($post){
            $featured=get_post_meta($post->ID,'featured',true);
            echo '<input type="hidden" name="portfolio_projects[featured]" value="0">';
            echo '<p><label for="portfolio-featured-project-toggle"><input type="checkbox" id="portfolio-featured-project-toggle" name="portfolio_projects[featured]" value="1" '.checked($featured,'1',false).'> Show on homepage</label></p>';
            echo '<p class="description">Check to feature this project on the homepage. Uncheck to remove it from the homepage while keeping it on the Projects page. Click Update to save. Only published projects appear.</p>';
        },$type,'side','high');
    }
});
add_filter('manage_portfolio_project_posts_columns',function($columns){
    $updated=[];
    foreach($columns as $key=>$label){
        $updated[$key]=$label;
        if($key==='title') $updated['portfolio_featured']='Featured Project';
    }
    return $updated;
});
add_action('manage_portfolio_project_posts_custom_column',function($column,$id){
    if($column!=='portfolio_featured') return;
    echo get_post_meta($id,'featured',true)==='1' ? '<strong>Yes — homepage</strong>' : 'No';
},10,2);
add_action('save_post',function($id,$post){
    if(!in_array($post->post_type,['portfolio_project','project_section'],true)) return;
    if((defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)||wp_is_post_revision($id)||!current_user_can('edit_post',$id)) return;
    if(!isset($_POST['portfolio_projects_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['portfolio_projects_nonce'])),'portfolio_save_projects')) return;
    $values=isset($_POST['portfolio_projects'])&&is_array($_POST['portfolio_projects'])?wp_unslash($_POST['portfolio_projects']):[];
    foreach(portfolio_projects_fields($post->post_type) as $key=>$field){
        $value=isset($values[$key])&&is_string($values[$key])?$values[$key]:'';
        update_post_meta($id,$key,portfolio_projects_clean($key,$value,$post->post_type));
    }
},10,2);
add_action('rest_api_init',function(){
    foreach(['portfolio_project','project_section'] as $type) register_rest_field($type,'project_data',[
        'get_callback'=>function($post)use($type){
            $data=['title'=>wp_specialchars_decode(get_the_title($post['id']),ENT_QUOTES)];
            foreach(portfolio_projects_fields($type) as $key=>$field) $data[$key]=portfolio_projects_clean($key,get_post_meta($post['id'],$key,true),$type);
            if($type==='portfolio_project'){
                $image_id=get_post_thumbnail_id($post['id']);
                $data['image_url']=$image_id?(wp_get_attachment_image_url($image_id,'full')?:''):'';
                $data['image_alt']=$image_id?get_post_meta($image_id,'_wp_attachment_image_alt',true):'';
            }
            return $data;
        },
        'schema'=>['type'=>'object','readonly'=>true,'context'=>['view','edit']],
    ]);
});
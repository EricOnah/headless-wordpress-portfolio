<?php
$data=json_decode(file_get_contents(__DIR__.'/project-seed.json'),true);
foreach($data['projects'] as $index=>$p){
    if(get_posts(['post_type'=>'portfolio_project','name'=>$p['slug'],'post_status'=>'any','numberposts'=>1])) continue;
    $id=wp_insert_post(['post_type'=>'portfolio_project','post_status'=>'publish','post_title'=>$p['title'],'post_name'=>$p['slug'],'menu_order'=>$index],true);
    if(is_wp_error($id)) throw new Exception($id->get_error_message());
    foreach(portfolio_projects_fields('portfolio_project') as $key=>$field){
        $value=$p[$key]??'';
        if($key==='tags') $value=implode("\n",$value);
        if($key==='featured') $value=$value?'1':'0';
        update_post_meta($id,$key,portfolio_projects_clean($key,$value,'portfolio_project'));
    }
    echo $id.' '.$p['title']."\n";
}
if(!get_posts(['post_type'=>'project_section','post_status'=>'any','numberposts'=>1])){
    $id=wp_insert_post(['post_type'=>'project_section','post_status'=>'publish','post_title'=>'Projects Section'],true);
    foreach($data['section'] as $key=>$value) update_post_meta($id,$key,portfolio_projects_clean($key,$value,'project_section'));
    echo 'Section '.$id."\n";
}
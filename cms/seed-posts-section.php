<?php
if(get_posts(['post_type'=>'posts_section','post_status'=>'any','numberposts'=>1])) return;
$id=wp_insert_post(['post_type'=>'posts_section','post_status'=>'publish','post_title'=>'Posts page content'],true);
if(is_wp_error($id)) throw new Exception($id->get_error_message());
$data=json_decode(file_get_contents(__DIR__.'/posts-section-seed.json'),true);
foreach($data as $key=>$value) update_post_meta($id,$key,portfolio_posts_section_clean($key,$value));
echo 'Posts Page Content '.$id."\n";

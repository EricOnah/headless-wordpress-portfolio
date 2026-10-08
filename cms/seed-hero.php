<?php
if(get_posts(['post_type'=>'homepage_hero','post_status'=>'any','numberposts'=>1])) return;
$id=wp_insert_post(['post_type'=>'homepage_hero','post_status'=>'publish','post_title'=>'Homepage hero and work signals'],true);
if(is_wp_error($id)) throw new Exception($id->get_error_message());
$data=json_decode(file_get_contents(__DIR__.'/hero-seed.json'),true);
foreach($data as $key=>$value) update_post_meta($id,$key,portfolio_hero_clean($key,$value));
echo 'Homepage hero entry '.$id."\n";

<?php
if(get_posts(['post_type'=>'footer_content','post_status'=>'any','numberposts'=>1])) return;
$id=wp_insert_post(['post_type'=>'footer_content','post_status'=>'publish','post_title'=>'Site footer content'],true);
if(is_wp_error($id)) throw new Exception($id->get_error_message());
$data=json_decode(file_get_contents(__DIR__.'/footer-seed.json'),true);
foreach($data as $key=>$value) update_post_meta($id,$key,portfolio_footer_clean($key,$value));
echo 'Footer entry '.$id."\n";

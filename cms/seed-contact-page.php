<?php
if(get_posts(['post_type'=>'contact_page','post_status'=>'any','numberposts'=>1])) return;
$id=wp_insert_post(['post_type'=>'contact_page','post_status'=>'publish','post_title'=>'Contact page content'],true);
if(is_wp_error($id)) throw new Exception($id->get_error_message());
$data=json_decode(file_get_contents(__DIR__.'/contact-page-seed.json'),true);
foreach($data as $key=>$value) update_post_meta($id,$key,portfolio_contact_clean($key,$value));
echo 'Contact page entry '.$id."\n";

<?php
if(get_posts(['post_type'=>'education_profile','post_status'=>'any','numberposts'=>1])) return;
$id=wp_insert_post(['post_type'=>'education_profile','post_status'=>'publish','post_title'=>'About education & certifications'],true);
if(is_wp_error($id)) throw new Exception($id->get_error_message());
$data=[
    'education_label'=>'Education','education_heading'=>'Academic foundation',
    'degree'=>'Bachelor of Science — Human Physiology','school'=>'Madonna University','period'=>'2016 – 2020',
    'certifications_label'=>'Certifications','certifications_heading'=>'Proof of capability',
    'certifications'=>"WordPress Development & Management\nFull Stack Web Development\nPHP & MySQL Professional\nGit and GitHub Professional",
    'certification_status'=>'Earned',
];
foreach($data as $key=>$value) update_post_meta($id,$key,portfolio_education_clean($key,$value));
echo 'Education profile '.$id."\n";
<?php
$entries=get_posts(['post_type'=>'profile_picture','post_status'=>'any','numberposts'=>-1]);
foreach($entries as $entry){
    add_post_meta($entry->ID,'profile_name','Eric Onah',true);
    add_post_meta($entry->ID,'profile_headline','Full-stack Developer | WordPress | Headless CMS',true);
}
echo "Profile name and headline initialized; existing values preserved.\n";

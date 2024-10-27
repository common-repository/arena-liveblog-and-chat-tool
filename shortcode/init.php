<?php
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once 'cron.php'; // just cron setup

register_activation_hook(__FILE__, 'arena_activation');
add_action('admin_notices', 'arena_activation');
add_action('arena_events_update_date', 'do_arena_events_update_date');
function arena_activation() {
    if (! wp_next_scheduled ( 'arena_events_update_date' )) {
        do_action( 'qm/debug', 'defining the cron job to run every 2min');
        wp_schedule_event(time(), '2min', 'arena_events_update_date');
    }
}

register_deactivation_hook(__FILE__, 'arena_deactivation');
function arena_deactivation() {
    wp_clear_scheduled_hook('arena_events_update_date');
}

function do_arena_events_update_date() {
    $date_threshold = date(get_option('albfre_date_format'), get_option('albfre_max_date_to_live'));

    $args = array(
        'post_type'      => 'post', // Change to your custom post type if necessary
        'posts_per_page' => -1,
        'meta_query'     => array(
            array(
                'key'     => 'is_arena_blog',
                'value'   => 'yes',
                'compare' => '='
            )
        ),
    );

    $posts = get_posts($args);

    if ($posts) {
        foreach ($posts as $post) {
            $current_time = strtotime(save_post_arena_metada($post->ID));
            if ($current_time == false || $current_time == -1) {
              do_action( 'qm/debug', 'Invalid date: ' . $current_date );
              continue;
            }
            $gtm_date = date(get_option('albfre_date_format'), $current_time); // it cames from Arena in UTC time zone
            $current_date = get_date_from_gmt($gtm_date);
            do_action( 'qm/debug', 'Current date formatted to: ' . $current_date );
            update_post_meta($post->ID, 'arena_updated_at', $current_date);
            update_post_meta($post->ID, 'arena_updated_by', 'cron_job');

            $should_update = $post->post_date == null || $post->post_date == '' || $post->post_date == '0000-00-00 00:00:00' || $post->post_date > $date_threshold;
            do_action( 'qm/debug', 'Should update: ' . $should_update );
            if ($should_update) {
              // the date is already in GTM, we should update it to local thailand timezone.
              $gtm_date = get_gmt_from_date($current_date);
              $args = array(
                'ID' => $post->ID,
                'post_date' => $current_date,
                'post_modified' => $current_date,
                'post_modified_gtm' => $gtm_date,
                'post_date_gmt' => $gtm_date,
              );
              do_action('qm/debug', $args);
              wp_update_post($args, true);
            }
        }
    }
}

function arena_blog_embed_shortcode( $atts ) {
    $atts = shortcode_atts(
        array(
            'site' => '',
            'includeFrontend' => 'true',
            'blog' => ''
        ),
        $atts,
        'arenablog'
    );

    $data = fetch_arena_widget_metadata($atts['site'], $atts['blog'], 'ld-json');

    $frontend_embeded = '';

    if (get_option('albfre_debug')) {
      $frontend_embeded = $frontend_embeded
       . '<a href="https://dashboard.arena.im/live/' . $atts['blog'] . '">Arena Dashboard</a><br>'
       . 'Current sys date: ' . date(get_option('albfre_date_format')) . '<br>';
    }

    if ($atts['includeFrontend'] !== 'false') {
      $frontend_embeded = $frontend_embeded . '<div class="arena-liveblog" data-publisher="' . $atts['site'] . '" data-event="' . $atts['blog']  . '" data-version="2"></div><script async src="https://go.arena.im/public/js/arenalib.js?p=' . $atts['site'] . '&e=' . $atts['blog'] . '"></script>';
    }

    return $data . $frontend_embeded;
}
add_shortcode('arenablog', 'arena_blog_embed_shortcode');

function returns_date_matching_arena_last_update_filter($the_date, $d, $post): string {
    if (!has_shortcode($post->post_content, 'arenablog')) {
        return $the_date;
    }

    $pattern = '/\[arenablog\s+([^\]]*)\]/';
    $matches = array([]);
    preg_match_all($pattern, $post->post_content, $matches, PREG_SET_ORDER);
    if (count($matches) < 1) {
        return $the_date;
    }

    $first_match = $matches[0];
    $shortcode_atts = shortcode_parse_atts($first_match[1]);
    if (!isset($shortcode_atts['site']) || !isset($shortcode_atts['blog'])) {
        return $the_date;
    }

    $widget_metadata = json_decode(
        fetch_arena_widget_metadata(
            $shortcode_atts['site'], 
            $shortcode_atts['blog']
        ),
        true
    );
    if (json_last_error() != JSON_ERROR_NONE) {
        return $the_date;
    }

    if (is_array($widget_metadata['posts']) && count($widget_metadata['posts']) > 0) {
        $latest_liveblog_post = $widget_metadata['posts'][0];
        $timestamp_as_milliseconds = (int) (
            isset($latest_liveblog_post['updatedAt']) 
            ? $latest_liveblog_post['updatedAt'] 
            : $latest_liveblog_post['createdAt']
        );
    } else {
        $timestamp_as_milliseconds = (int) (
            isset($widget_metadata['eventInfo']['modifiedAt'])
            ? $widget_metadata['eventInfo']['modifiedAt']
            : $widget_metadata['eventInfo']['createdAt']
        );
    }

    $timestamp_as_seconds = $timestamp_as_milliseconds / 1000;
    return date(get_option('albfre_date_format'), $timestamp_as_seconds);
}

function fetch_arena_widget_metadata($site_slug, $blog_slug, $format = 'json') {
    $url = "https://cached-api.arena.im/v1/liveblog/" . $site_slug . "/" . $blog_slug;

    if ($format == 'ld-json') {
        $url .= "/ldjson";
    }

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return "Error retrieving blog data.";
    }

    if ($response['response']['code'] == 404) {
        return "Blog not found: " . $blog_slug;
    }

    return wp_remote_retrieve_body($response);
}

function cleanup_arena_metadata($post_id) {
  update_post_meta($post_id, 'is_arena_blog', 'no');
  update_post_meta($post_id, 'arena_site', '');
  update_post_meta($post_id, 'arena_blog', '');
}

function save_post_arena_metada($post_id) {
    $post = get_post($post_id);
    if (!has_shortcode($post->post_content, 'arenablog')) {
      cleanup_arena_metadata($post_id);
      return false;
    }
    update_post_meta($post_id, 'is_arena_blog', 'yes');

    $pattern = '/\[arenablog\s+([^\]]*)\]/';
    $matches = array([]);
    preg_match_all($pattern, $post->post_content, $matches, PREG_SET_ORDER);
    if (count($matches) < 1) {
        cleanup_arena_metadata($post_id);
        return false;
    }

    $first_match = $matches[0];
    $shortcode_atts = shortcode_parse_atts($first_match[1]);
    if (!isset($shortcode_atts['site']) || !isset($shortcode_atts['blog'])) {
        cleanup_arena_metadata($post_id);
        return false;
    }

    $site = $shortcode_atts['site'];
    $blog = $shortcode_atts['blog'];
    update_post_meta($post_id, 'arena_site', $site);
    update_post_meta($post_id, 'arena_blog', $blog);
    $last_updated = returns_date_matching_arena_last_update_filter($post->post_date, null, $post);
    return $last_updated;
}

/**
 * should be trigged after an post update to check if it is an Arena
 * post to make the update if need.
 */
function arena_check_post_update($post_ID, $post_after, $post_before) {
  $asArray = json_decode(json_encode($myObj), true);
  $asArray['ID'] = $post_ID;
  auto_update_date($asArray, $asArray);
}

// Function to update the post date
function auto_update_date( $data, $postarr ) {
    // Check if it's a post being updated
    do_action( 'qm/debug', 'running auto_update_date');
    do_action( 'qm/debug', $data);
    if (!array_key_exists('ID', $data) && !array_key_exists('ID', $postarr)) {
      do_action( 'qm/debug', 'This post date will not be updated because the parameter has no ID');
      return $data;
    }
    $post_id = $postarr['ID'];
    save_post_arena_metada($post_id);
    update_post_meta($post_id, 'arena_site_last_modified', 'starting update...');
    $current_date = save_post_arena_metada($data['ID']);
    if ($current_date == false) {
      do_action( 'qm/debug', 'This post is not a arena_blog');
      return $data;
    }

    update_post_meta($post_id, 'arena_site_last_modified', $current_date);
    update_post_meta($post_id, 'arena_updated_by', $data['post_author']);
    $data['post_date'] = $current_date;
    $data['post_modified'] = $current_date;
    $data['post_modified_gmt'] = get_gmt_from_date($current_date);

    return $data;
}

add_action( 'post_updated', 'arena_check_post_update', 10, 3 );

// this will update the post imediatelly after save
add_filter('wp_insert_post_data', 'auto_update_date', 10, 2);

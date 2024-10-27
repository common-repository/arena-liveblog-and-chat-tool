<?php
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

 // Adding a block opinion-stage for below elements
 add_filter( 'block_categories', 'albfre_block_categories', 10, 2 );
 function albfre_block_categories( $categories, $post ) {
	return array_merge(
		$categories,
		array(
			array(
				'slug' => 'arena-blocks',
				'title' => __( 'Interactive Content by Arena', 'arena-blocks' ),
			),
		)
	);
}

require( plugin_dir_path( __FILE__ ).'arena-block/src/init.php' );

function albfre_gutenberg_enqueue_scripts() {
	$ALBFRE_URL = 'https://go.arena.im';
	$ALBFRE_API_V2_BASE_URL = 'https://api.arena.im/v2';
	$ALBFRE_DASHBOARD_URL = 'https://dashboard.arena.im';
	$ALBFRE_ARENA_SETTINGS = admin_url('options-general.php?page=albfre_plugin');

	$albfre_site_id = sanitize_text_field(get_option('albfre_user_siteId'));
  $albfre_user_token = sanitize_text_field(get_option('albfre_user_token'));

	$images = array(
		'eventsLogoImage'	=> plugins_url( 'assets/albfre_logo-bg.png' , dirname(__FILE__) ),
		'eventsLogo2xImage' => plugins_url( 'assets/albfre_logo-bg@2x.png' , dirname(__FILE__) ),
		'logoImage'		=> plugins_url( 'assets/albfre_arena-im-logo.png' , dirname(__FILE__) ),
		'ionSearchIonicons' => plugins_url( 'assets/albfre_ion-search-ionicons.svg' , dirname(__FILE__) ),
		'iconReload' => plugins_url( 'assets/albfre_reload.svg' , dirname(__FILE__) ),
		'iconClose' => plugins_url( 'assets/albfre_icon-close.png' , dirname(__FILE__) ),
		'australian-rules-football' => plugins_url( 'assets/sports/albfre_australian-rules-football.png', dirname(__FILE__) ),
		'badminton' => plugins_url( 'assets/sports/albfre_badminton.png', dirname(__FILE__) ),
		'baseball' => plugins_url( 'assets/sports/albfre_baseball.png', dirname(__FILE__) ),
		'basketball' => plugins_url( 'assets/sports/albfre_basketball.png', dirname(__FILE__) ),
		'bboying' => plugins_url( 'assets/sports/albfre_bboying.png', dirname(__FILE__) ),
		'bjj' => plugins_url( 'assets/sports/albfre_bjj.png', dirname(__FILE__) ),
		'boxing' => plugins_url( 'assets/sports/albfre_boxing.png', dirname(__FILE__) ),
		'counter-strike' => plugins_url( 'assets/sports/albfre_counter-strike.png', dirname(__FILE__) ),
		'cricket' => plugins_url( 'assets/sports/albfre_cricket.png', dirname(__FILE__) ),
		'cyclism' => plugins_url( 'assets/sports/albfre_cyclism.png', dirname(__FILE__) ),
		'films-tv-shows' => plugins_url( 'assets/sports/albfre_films-tv-shows.png', dirname(__FILE__) ),
		'finance' => plugins_url( 'assets/sports/albfre_finance.png', dirname(__FILE__) ),
		'football' => plugins_url( 'assets/sports/albfre_football.png', dirname(__FILE__) ),
		'golf' => plugins_url( 'assets/sports/albfre_golf.png', dirname(__FILE__) ),
		'handball' => plugins_url( 'assets/sports/albfre_handball.png', dirname(__FILE__) ),
		'hockey' => plugins_url( 'assets/sports/albfre_hockey.png', dirname(__FILE__) ),
		'judo' => plugins_url( 'assets/sports/albfre_judo.png', dirname(__FILE__) ),
		'karate' => plugins_url( 'assets/sports/albfre_karate.png', dirname(__FILE__) ),
		'league-of-legends' => plugins_url( 'assets/sports/albfre_league-of-legends.png', dirname(__FILE__) ),
		'mma' => plugins_url( 'assets/sports/albfre_mma.png', dirname(__FILE__) ),
		'motor-racing' => plugins_url( 'assets/sports/albfre_motorsport.png', dirname(__FILE__) ),
		'news' => plugins_url( 'assets/sports/albfre_news.png', dirname(__FILE__) ),
		'other-sports' => plugins_url( 'assets/sports/albfre_other-sports.png', dirname(__FILE__) ),
		'others' => plugins_url( 'assets/sports/albfre_others.png', dirname(__FILE__) ),
		'poker' => plugins_url( 'assets/sports/albfre_poker.png', dirname(__FILE__) ),
		'politics' => plugins_url( 'assets/sports/albfre_politics.png', dirname(__FILE__) ),
		'pro-wrestling' => plugins_url( 'assets/sports/albfre_pro-wrestling.png', dirname(__FILE__) ),
		'rugby' => plugins_url( 'assets/sports/albfre_rugby.png', dirname(__FILE__) ),
		'running' => plugins_url( 'assets/sports/albfre_running.png', dirname(__FILE__) ),
		'soccer' => plugins_url( 'assets/sports/albfre_soccer.png', dirname(__FILE__) ),
		'sumo' => plugins_url( 'assets/sports/albfre_sumo.png', dirname(__FILE__) ),
		'surfing' => plugins_url( 'assets/sports/albfre_surfing.png', dirname(__FILE__) ),
		'technology' => plugins_url( 'assets/sports/albfre_technology.png', dirname(__FILE__) ),
		'tennis' => plugins_url( 'assets/sports/albfre_tennis.png', dirname(__FILE__) ),
		'volleyball' => plugins_url( 'assets/sports/albfre_volleyball.png', dirname(__FILE__) ),
		'weather' => plugins_url( 'assets/sports/albfre_weather.png', dirname(__FILE__) ),
		'wrestelling' => plugins_url( 'assets/sports/albfre_wrestelling.png', dirname(__FILE__) ),
	);

	$translations = array(
		'LIVE' => __('LIVE', 'albfre'),
		'UPCOMING' => __('UPCOMING', 'albfre'),
		'TODAY' => __('TODAY', 'albfre'),
		'ADD' => __('ADD', 'albfre'),
		'EMPTY_TITLE' => __("You haven't created any Event yet." , 'albfre'),
		'EMPTY_SUBTITLE' => __('But you can easily create a new one.', 'albfre'),
		'EMPTY_BUTTON' => __('CREATE NEW EVENT', 'albfre'),
		'Search' => __('Search', 'albfre'),
		'Add your events' => __('Add your events', 'albfre'),
		"In order to see the events you've created on Arena.im, you must log in on Settings > Arena." => __("In order to see the events you've created on Arena.im, you must log in on Settings > Arena.", 'albfre'),
		'After login,' => __('After login,', 'albfre'),
		'After login,' => __('this page.', 'albfre'),
	);

	$current_publisher = array(
		'siteId' => $albfre_site_id,
		'userToken' => $albfre_user_token,
	);

	$arena_config = array(
		'ALBFRE_URL' => $ALBFRE_URL,
		'ALBFRE_API_V2_BASE_URL' => $ALBFRE_API_V2_BASE_URL,
		'ALBFRE_DASHBOARD_URL' => $ALBFRE_DASHBOARD_URL,
		'ALBFRE_ARENA_SETTINGS' => $ALBFRE_ARENA_SETTINGS,
	);


  // Data to pass to gutenberg editor
  $dataToPass = array(
		'getImages'		=> $images,
		'getTranslations'	=> $translations,
		'getCurrentPublisher' => $current_publisher,
		'getArenaConfig' => $arena_config
  );
  wp_localize_script( 'arena_block-cgb-block-js', 'albfreGutenData', $dataToPass );
}

add_action( 'enqueue_block_editor_assets', 'albfre_gutenberg_enqueue_scripts' );
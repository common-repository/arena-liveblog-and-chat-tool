<?php
/*
Plugin Name: Arena.IM - Live Blogging for real-time events
Plugin URI: https://arena.im
Description: Arena is a live blogging platform for real-time events.
Version: 0.3.0
Author: Arena.im
Author URI: https://arena.im
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: albfre
*/

if (!class_exists('Albfre_Settings')) {

  class Albfre_Settings {
    const ALBFRE_URL = 'https://go.arena.im';
    const ALBFRE_API_V2_BASE_URL = 'https://api.arena.im/v2';
    const ALBFRE_DASHBOARD_URL = 'https://dashboard.arena.im';
    const ALBFRE_CACHE_API = 'https://cached-api.arena.im/v1';

    public function __construct() {
      add_action('init', array($this, 'albfre_liveblog_internationalization'));
      add_action('admin_notices', array(&$this, 'albfre_plugin_activation'));
      add_action('admin_menu', array(&$this, 'albfre_add_menu'));
      add_action('admin_enqueue_scripts', array($this,'albfre_settings_assets'));
      add_action('wp_ajax_albfre_user_action', array($this,'albfre_user_action'));
      add_action('wp_ajax_albfre_set_account_action', array($this,'albfre_set_account_action'));
      add_action('wp_ajax_albfre_logout_action', array($this,'albfre_logout_action'));

      /**
       * Used to enable plugin's debug information.
       */
      update_option('albfre_debug', false);
      /**
       * The amount of time to consider a post "live".
       * This TLL will be considered while searching by posts using the post_date field and check
       * if it is an Arena post. If it is an Arena post, it will search on Arena's API for the correctly
       * last update date.
       */
      update_option('albfre_max_date_to_live', strtotime('-35 days'));
      /**
       * Default date format: this is important to keep compatible with MySQL database date
       * format, what makes easy to insert the formatted date directly on database.
       */
      update_option('albfre_date_format', 'Y-m-d H:i:s');
    }

    public function albfre_plugin_activation() {
      global $hook_suffix;

      if ($hook_suffix == 'plugins.php' && !get_option('albfre_user_token')) {
        include(sprintf("%s/templates/albfre_notice.php", dirname(__FILE__)));
      }
    }

    public function albfre_liveblog_internationalization() {
      load_plugin_textdomain('albfre', false, basename(dirname(__FILE__)) . '/languages');
    }

    public function albfre_add_menu(){
			add_options_page(
				__('Arena Settings','albfre'),
				__('Arena','albfre'),
				'manage_options',
				'albfre_plugin',
				array(&$this, 'albfre_create_plugin_settings_page')
			);
    }

    public function albfre_create_plugin_settings_page(){
      global $wpdb;

      if(!current_user_can('manage_options'))	{
        wp_die(__('You do not have sufficient permissions to access this page.'));
      }

      include(sprintf("%s/templates/albfre_settings.php", dirname(__FILE__)));
    }

    public function albfre_settings_assets($hook){
      global $wpdb;

      wp_register_style('albfre_notice_style', plugins_url('assets/albfre_notice.css', __FILE__ ) );
      wp_enqueue_style('albfre_notice_style');

      if($hook != 'settings_page_albfre_plugin')
        return;
			wp_register_style('albfre_admin_style', plugins_url('assets/albfre_admin.css', __FILE__ ) );
      wp_enqueue_style('albfre_admin_style');
      wp_enqueue_script('albfre_admin_script', plugins_url( 'assets/albfre_admin.js' , __FILE__ ) );

      $albfre_api_signin_url = esc_url(self::ALBFRE_API_V2_BASE_URL . "/account/signinfirebase");
      $albfre_api_me_url = esc_url(self::ALBFRE_API_V2_BASE_URL . "/account/me");
      $albfre_user_token = sanitize_text_field(get_option('albfre_user_token'));
      $albfre_user_siteId = sanitize_text_field(get_option('albfre_user_siteId'));
      $albfre_user_accountId = sanitize_text_field(get_option('albfre_user_accountId'));

      wp_localize_script('albfre_admin_script', 'albfre_settings_object', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'albfre_api_signin_url' => $albfre_api_signin_url,
        'albfre_api_me_url' => $albfre_api_me_url,
        'albfre_user_token' => $albfre_user_token,
        'albfre_user_siteId' => $albfre_user_siteId,
        'albfre_user_accountId' => $albfre_user_accountId
      ));
    }

    public function albfre_set_account_action() {
      global $wpdb;

      $albfre_account = $_POST['albfre_account'];

      update_option('albfre_user_siteId', sanitize_text_field($albfre_account['siteId']));
      update_option('albfre_user_accountId', sanitize_text_field($albfre_account['accountId']));
    }

    public function albfre_user_action() {
      global $wpdb;
      $albfre_user = $_POST['albfre_user'];

      $json_accounts = str_replace('\"', '"', $albfre_user['accounts']);

      update_option('albfre_user_displayName', sanitize_text_field($albfre_user['displayName']));
      update_option('albfre_user_token', sanitize_text_field($albfre_user['arenaApiToken']));
      update_option('albfre_user_siteId', sanitize_text_field($albfre_user['siteId']));
      update_option('albfre_user_accountId', sanitize_text_field($albfre_user['accountId']));
      update_option('albfre_user_accounts', json_decode($json_accounts));
      update_option('albfre_user_json_accounts', str_replace('\"', "'", $albfre_user['accounts']));

      wp_die();
    }

    public function albfre_logout_action() {
      global $wpdb;
      delete_option('albfre_user_displayName');
      delete_option('albfre_user_token');
      delete_option('albfre_user_siteId');
      delete_option('albfre_user_accountId');
      delete_option('albfre_user_accounts');
      echo 'deleted!';
      wp_die();
    }
  }
}

if(!class_exists('Albfre')){
  require_once plugin_dir_path( __FILE__ ) . 'gutenberg/init.php';
  require_once plugin_dir_path( __FILE__ ) . 'shortcode/init.php';

  class Albfre {
    public function __construct(){
      $albfre_settings = new Albfre_Settings();

      add_action('init', array($this, 'albfre_liveblog_internationalization'));
      add_action('media_buttons', array(&$this, 'albfre_button_wizard'), 11);
      add_action('admin_menu', array(&$this, 'albfre_add_pages'));
      add_action('admin_enqueue_scripts', array($this,'albfre_events_assets'));
      add_shortcode('arena_embed', array($this, 'albfre_get_embed_func'));
      add_shortcode('arena_embed_amp', array($this, 'albfre_get_embed_amp_func'));
      add_shortcode('arena_embed_iframe', array($this, 'albfre_get_embed_iframe_func'));
    }

    public function albfre_liveblog_internationalization() {
      load_plugin_textdomain('albfre', false, basename(dirname(__FILE__)) . '/languages');
    }

    public function albfre_get_embed_func($atts) {
      $albfre_version = sanitize_text_field($atts['version']);
      $albfre_publisher = htmlspecialchars_decode(sanitize_text_field($atts['publisher']));
      $albfre_event = htmlspecialchars_decode(sanitize_text_field($atts['event']));
      $albfre_api_url = esc_url(Albfre_Settings::ALBFRE_URL . "/public/js/arenalib.js?p={$albfre_publisher}&e={$albfre_event}");

      $albere_seo_result_str = "";

      try {
        $albfre_seo_api_url = Albfre_Settings::ALBFRE_CACHE_API . "/liveblog" . "/" . $albfre_publisher . "/" . $albfre_event . "/ldjson";
        $albere_seo_result_str = $this->callSEOAPI($albfre_seo_api_url);
      } catch (Exception $e) {
        error_log('Exception: ' . $e->getMessage());
      }

      return "<div id='arena-live' data-publisher='{$albfre_publisher}' data-event='{$albfre_event}' data-version='{$albfre_version}'></div><script src='{$albfre_api_url}'></script>{$albere_seo_result_str}";
    }

    public function callSEOAPI($url) {
      $curl = curl_init();

      curl_setopt($curl, CURLOPT_URL, $url);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

      $result = curl_exec($curl);
      $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

      if ($httpcode >= 400) {
        curl_close($curl);
        throw new Exception('Cannot get seo info');
      }

      curl_close($curl);

      return $result;
    }

    public function albfre_get_embed_amp_func($atts) {
      $albfre_version = sanitize_text_field($atts['version']);
      $albfre_publisher = sanitize_text_field($atts['publisher']);
      $albfre_event = sanitize_text_field($atts['event']);
      $albfre_height = sanitize_text_field($atts['height']);
      if ($albfre_version == '2') {
        $albfre_api_url = esc_url(Albfre_Settings::ALBFRE_URL . "/embed/{$albfre_publisher}/{$albfre_event}?v=2");
      } else {
        $albfre_api_url = esc_url(Albfre_Settings::ALBFRE_URL . "/embed/{$albfre_publisher}/{$albfre_event}");
      }

      return "<amp-iframe src='{$albfre_api_url}' height='" . $albfre_height . "' layout='fixed-height' frameborder='0' sandbox='allow-scripts allow-same-origin allow-popups allow-forms allow-modals'><amp-img src='https://go.arena.im/public/imgs/empty-photo-cover-event.png' layout='fixed-height' height='" . $albfre_height . "' placeholder></amp-img></amp-iframe>";
    }

    public function albfre_get_embed_iframe_func($atts) {
      $albfre_version = sanitize_text_field($atts['version']);
      $albfre_publisher = sanitize_text_field($atts['publisher']);
      $albfre_event = sanitize_text_field($atts['event']);
      $albfre_width = sanitize_text_field($atts['width']);
      $albfre_height = sanitize_text_field($atts['height']);
      if ($albfre_version == '2') {
        $albfre_api_url = esc_url(Albfre_Settings::ALBFRE_URL . "/embed/{$albfre_publisher}/{$albfre_event}?v=2");
      } else {
        $albfre_api_url = esc_url(Albfre_Settings::ALBFRE_URL . "/embed/{$albfre_publisher}/{$albfre_event}");
      }
      return "<iframe src='{$albfre_api_url}' style='border: 0; width: " . $albfre_width . "; height: " . $albfre_height . "; border-radius: 4px;'></iframe>";
    }

    public function albfre_events_assets($hook){
      global $wpdb;
      if($hook != 'admin_page_albfre_list_events')
        return;

      $translations = array(
        'LIVE' => __('LIVE', 'albfre'),
        'UPCOMING' => __('UPCOMING', 'albfre'),
        'TODAY' => __('TODAY', 'albfre'),
        'ADD' => __('ADD', 'albfre'),
        'EMPTY_TITLE' => __("You haven't created any Event yet." , 'albfre'),
        'EMPTY_SUBTITLE' => __('But you can easily create a new one.', 'albfre'),
        'EMPTY_BUTTON' => __('CREATE NEW EVENT', 'albfre')
      );
      wp_enqueue_style('albfre_prefs_admin_wizard', plugins_url('assets/albfre_events.css', __FILE__));
      wp_enqueue_script('albfre_prefs_admin_script', plugins_url( 'assets/albfre_events.js' , __FILE__ ));

      $albfre_publisher = sanitize_text_field(get_option('albfre_user_siteId'));
      $albfre_user_token = sanitize_text_field(get_option('albfre_user_token'));
      $albfre_api_events_url = esc_url(Albfre_Settings::ALBFRE_API_V2_BASE_URL . "/account/sites/{$albfre_publisher}/events");
      wp_localize_script('albfre_prefs_admin_script', 'albfre_events_object', array( 'ajax_url' => admin_url('admin-ajax.php'), 'albfre_user_token' => $albfre_user_token, 'albfre_api_events_url' => $albfre_api_events_url, 'albfre_translations' => $translations, 'albfre_dashboard' => esc_url(Albfre_Settings::ALBFRE_DASHBOARD_URL) ));
    }

    public function albfre_add_pages() {
      add_submenu_page(null, 'Arena Wizard', 'Arena Wizard', 'manage_options', 'albfre_list_events', array(&$this, 'albfre_wizard'));
    }

    public function albfre_wizard() {
      global $wpdb;
      include(sprintf("%s/templates/albfre_list_events.php", dirname(__FILE__)));
    }
    // add arena button on post page
    public function albfre_button_wizard() {
      add_thickbox();
      $wizhref = admin_url('admin.php?page=albfre_list_events') .
      '&random=' . rand(1, 1000) .
      '&TB_iframe=true&width=950&height=800';
      ?>
        <a href="<?php echo $wizhref; ?>" class="thickbox button ytprefs_media_link" id="ytprefs_wiz_button" title="Arena Events"><div style="background: transparent url(<?php echo plugin_dir_url(__FILE__) . 'assets/albfre_logo.png'; ?>) no-repeat scroll top left;display: inline-block;height: 16px;margin: 5px 2px 0 0;vertical-align: top;width: 16px;"></div> Arena</a>
      <?php
    }
  }
}

if(class_exists('Albfre')){
  $albfre = new Albfre();
}

?>
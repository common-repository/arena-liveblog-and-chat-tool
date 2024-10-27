<?php

/**
 * @package Arena Notice
 * @author Arena
 * @copyright (C) 2017- Arena
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>

<div class="updated albfre-notice">
  <div class="albfre-notice--container">
    <div class="albfre-notice--info">
      <a href="<?php echo admin_url('options-general.php?page=albfre_plugin'); ?>" class="albfre-notice--info--button">
        <?php _e('SET UP YOUR ARENA ACCOUNT', 'albfre'); ?>
      </a>
      <div class="albfre-notice--info--text">
        <?php _e('Almost done! Login to Arena and set all your events on wordpress', 'albfre'); ?>
      </div>
    </div>
    <div>
      <img class="albfre-notice--logo" src="<?php echo plugins_url( 'assets/albfre_alpha_white.png' , dirname(__FILE__) ) ?>" />
    </div>
  </div>
</div>
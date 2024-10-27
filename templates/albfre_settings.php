<?php

/**
 * @package Arena Widget for Wordpress
 * @author Arena
 * @copyright (C) 2017- Arena
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
  <div class="albfre-settings">
    <div class="albfre-settings--header">
      <div class="albfre-settings--logo">
        <img src="<?php echo plugins_url( 'assets/albfre_logo-bg.png' , dirname(__FILE__) ) ?>" srcset="<?php echo plugins_url( 'assets/albfre_logo-bg@2x.png 2x' , dirname(__FILE__) ) ?>">
      </div>
    </div>
    <div class="albfre-settings--body">
      <div class="albfre-sp albfre-sp-circle albfre-settings--body--sp"></div>
<?php
if (!get_option('albfre_user_token')) {
?>
      <div class="albfre-settings--body--login">
        <div class="albfre-settings--body--title">
          <?php _e('Sign in to your Arena.im account', 'albfre'); ?>
        </div>
        <div class="albfre-settings--form">
          <div class="albfre-settings--form--group">
            <label class="albfre-settings--form--label">Email</label>
            <input class="albfre-settings--form--input albfre-settings--email" onkeydown="window.albfreWPPluginPreferences.arenaHandleKeydown(event)"  type="email" name="email" placeholder="Email" />
          </div>
          <div class="albfre-settings--form--group">
            <label class="albfre-settings--form--label"><?php _e('Password', 'albfre'); ?></label>
            <input class="albfre-settings--form--input albfre-settings--password" onkeydown="window.albfreWPPluginPreferences.arenaHandleKeydown(event)" type="password" name="password" placeholder="<?php _e("Password", 'albfre'); ?>" />
          </div>
          <button class="albfre-settings--form--button" onclick="window.albfreWPPluginPreferences.arenaLogin()"><?php _e('Login', 'albfre'); ?></button>
          <div class="albfre-form--error"><?php _e("The password you've entered is incorrect.", 'albfre'); ?></div>
        </div>
        <div><?php _e("Don't have an Arena.im account?", 'albfre'); ?> <?php _e('Go to', 'albfre'); ?> <a target="_blank" class="albfre-settings--arena--link" href="https://arena.im">Arena.im</a> <?php _e('and create one!', 'albfre'); ?></div>
      </div>
<?php
} else {
?>
  <script>
    window.albfreWPPluginPreferences.fetchUserAccounts()
  </script>
  <div class="albfre-settings--body--title">
    <?php printf(__('Welcome, %1$s!', 'albfre'), get_option('albfre_user_displayName')); ?>
  </div>
  <div class="albfre-settings--body--welcome">
    <?php _e('Now you can add your live events instantly to your website clicking on the Arena icon in the wordpress editor page. Simply create your events at dashboard.arena.im and insert to your blog post. Enjoy it!', 'albfre'); ?>
  </div>
  <div class="albfre-settings--body--accounts">
    <div class="albfre-settings--body--accounts--title">
      <?php _e('ACCOUNTS, ORGANIZATIONS AND SITES', 'albfre'); ?>
    </div>
    <div class="albfre-settings--body--accounts--form">
      <div class="albfre-settings--body--accounts--form--label">
        <?php _e('Select your account', 'albfre'); ?>
      </div>
      <select class="albfre-settings--body--accounts--form--select albfre-settings--body--accounts--form--select--acounts" onchange="window.albfreWPPluginPreferences.arenaSetAccount()">
      </select>
      <div class="albfre-settings--body--accounts--form--label">
        <?php _e('Select your site', 'albfre'); ?>
      </div>
      <select class="albfre-settings--body--accounts--form--select albfre-settings--body--accounts--form--select--sites">
      </select>
      <button class="albfre-settings--body--accounts--form--button" onclick="window.albfreWPPluginPreferences.arenaSaveAccountSite()">
        <?php _e('Save', 'albfre'); ?>
      </button>
      <div class="albfre-settings--body--accounts--form--success">
        <img class="albfre-settings--body--accounts--form--success--check" src="<?php echo plugins_url( 'assets/albfre_check.png' , dirname(__FILE__) ) ?>">
        <?php _e('Changes saved successfully', 'albfre'); ?>
      </div>
    </div>
  </div>
  <button class="albfre-settings--form--button albfre-settings--form--button-logout" onclick="window.albfreWPPluginPreferences.arenaLogout()"><?php _e('LOGOUT', 'albfre'); ?></button>
<?php
}
?>
    </div>
  </div>

<?php
if (get_option('albfre_debug')) {
?>
  <center>
    <h2>Debug</h2>
    <p>Current date: <?php echo date(get_option('albfre_date_format')) ?> </p>
    <p>GMT date: <?php echo get_gmt_from_date(date(get_option('albfre_date_format'))) ?> </p>
  </center>
<?php
}
?>

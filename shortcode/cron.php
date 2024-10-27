<?php
/**
 * Short description for cron.php
 *
 * @package cron
 * @version 0.1
 * @copyright Arena.im
 * @license private
 */

add_filter( 'cron_schedules', 'every_other_minute_schedule' );

const ONE_MINUTE = 60;

function every_other_minute_schedule( $schedules ) {
  $schedules['2min'] = array(
    'interval' => ONE_MINUTE * 2,
    'display' => __('Every 2 minutes')
  );
  return $schedules;
}

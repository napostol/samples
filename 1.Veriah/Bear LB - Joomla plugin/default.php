<?php

// do direct access
defined('_JEXEC') or die('Restricted access');
$canvas_not_support = '<p style="color: brown;"><strong>Your browser is out of date!<br>You are using an older '
    . 'version of Internet Explorer that does not support HTML 5 Canvas.<br>'
    . 'For the best experience, please update your browser to IE(9) or later.</strong></p>';
$currentUser = JFactory::getUser();

$is_registered_user = 0;
$change_status_val = '';

if ( $currentUser->guest === 0 ) {
    $is_registered_user = 1;
    $change_status_val = '<button type="button" id="change_status">TOGGLE STATUS';
}

$server_ip = $_SERVER['SERVER_ADDR'];
$pageuri = JURI::current();

if( strpos($pageuri,'search-engine' ) ){
    echo modVeriahHelper::loadSearchEngineForm();
    return;
}

if(isHomePageUri($pageuri)){
    echo modVeriahHelper::loadSearchEngineFormFront();
    echo modVeriahHelper::loadHotDeals();
    return;
}

/*
 * If GET contains parameters then strip the request part in order to obtain
 * the alias that defines which item has been requested to show.
 */
if( strpos( $pageuri, '?') !== -1 ) {
    $uri_parts = explode('?',$pageuri);
    $url_no_param = $uri_parts[0];
} else {
    $url_no_param = $pageuri;
}


$indx_pos = strrpos($url_no_param, "/");
$alias = substr($url_no_param, $indx_pos + 1);

$area_building_map = array(
    
    'b-smart'          => array('area' => 52, 'building' => 12 ),
    'factory-4376'     => array('area' => 51, 'building' => 11 ),
    'cube'             => array('area' => 53, 'building' => 1 ),
    'upark'            => array('area' => 54, 'building' => 1 )

);

if ( isset( $_GET ) ) {

    require_once('MapNavigation.php');
    $mapnav = new MapNavigation();
    if ( !parseGet( $mapnav, $alias, $area_building_map ) ) {
        echo '<h1>Page Not Found<h1>';
        return;
    }

    $navigation_level = $mapnav->getLevel();
    
    switch ($navigation_level) {
        case 'l0':
            $tmp_page_content = modVeriahHelper::goToArea($mapnav);
            break;
        case 'l2':
            $tmp_page_content = modVeriahHelper::goToFloor($mapnav);
            break;
        case 'l3':
            $tmp_page_content = modVeriahHelper::goToApartment($mapnav);
            break;
        default:
            $tmp_page_content = modVeriahHelper::goToBuilding($mapnav);
    }

    if ($navigation_level === 'l3') {
        $tmp_page_content = str_replace('{{change_status_button}}', $change_status_val, $tmp_page_content);
    }

    $tmp_page_content_1 = str_replace('{{server_ip}}', $server_ip, $tmp_page_content);
    $tmp_page_content_2 = str_replace('{{not_support_msg}}', $canvas_not_support, $tmp_page_content_1);
    $page_content = str_replace('{{pageuri}}', $pageuri, $tmp_page_content_2);

    echo $page_content . '<br />';
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function that parses the $_GET array. The result of the method is a 
 * MapNavigation object or in the case of a failure the object won't contain
 * any information.
 * 
 * Inputs: $alias (string) The last part of the URL of the Joomla item 
 *         requested.
 *         $area_building_map (2d array); Contains information about area and 
 *         building depending on the alias.
 * 
 * Output: true on success, false otherwise. Additionally, in case of success 
 * the MapNavigation object that is passed by reference is filled 
 * with information, that is required to navigate to the next level of the 
 * map.
 */
function parseGet(&$mapnav, &$alias, &$area_building_map) {

    $level = filter_input(INPUT_GET, 'nav');
    if (!$level) {
        if( strcmp( $alias,'district-s' ) === 0 ) {
            $mapnav->setLevel('l0');
        } else {
            $mapnav->setLevel('l1');
        }
    } else {
        $mapnav->setLevel($level);
    }

    $mapnav->setAreaId($area_building_map[$alias]['area']);
    $mapnav->setBuildingId($area_building_map[$alias]['building']);

    // Building navigation level
    if (strcmp($mapnav->getLevel(), 'l2') >= 0) {
        $floor_id = filter_input(INPUT_GET, 'floor', FILTER_VALIDATE_INT);
        if (!$floor_id) {
            return false;
        } else {
            $mapnav->setFloorId($floor_id);
        }
    }

    // Floor navigation level
    if (strcmp($mapnav->getLevel(), 'l3') >= 0) {
        $apartment_id = filter_input(INPUT_GET, 'apartment', FILTER_VALIDATE_INT);
        if (!$apartment_id) {
            return false;
        } else {
            $mapnav->setApartmentId($apartment_id);
        }
    }

    return true;
}

function isHomePageUri( $pageuri ) {
    $home_page_uris = array(
        'http://bear-lb.com',
        'http://bear-lb.com/',
        'http://bear-lb.com/index.php',
        'http://bear-lb.com/index.php/',
        'http://www.bear-lb.com',
        'http://www.bear-lb.com/',
        'http://www.bear-lb.com/index.php',
        'http://www.bear-lb.com/index.php/'
    );
    
    if(in_array( $pageuri, $home_page_uris ) ){
        return true;
    } else {
        return false;
    }
}

<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require_once('./BearLbProperty.php');
require_once './WebServiceDomain.php';
require_once './SearchEngineCriteria.php';

define( 'WEB_SERVICE_INVALID', 'Invalid Web Service Request' );
define( 'POST_PARAM_MISSING', 'POST parameter is missing'    );
define( 'POST_PARAM_INVALID', 'POST parameter is invalid'    );

if( ( $action = filter_input(INPUT_POST, 'action') ) ){
    
    $bearLbProperty = new BearLbProperty();
       $webServiceDomain = new WebServiceDomain("89.249.211.235",8082,"");
    $webServiceBaseUrl = $webServiceDomain->getWebServiceUrl();
    
    try{
        \isValidAction(trim( $action ));
        $reply = array();
        $fh = fopen('engine.log','a');
        fwrite($fh,"===== WEB SERVICE REQUEST ====\n");
        fwrite($fh,"Request Time: " . date( 'Y-m-d H:i:s' ) . "\n");
        foreach( $_POST as $k => $v ){
            fwrite($fh,"$k=>$v\n");
        }
        
        switch($action){
            case 'ws_re_cat':
                fwrite($fh,"Fetching Cities\n");
                $webServiceBaseUrl .= $action;
                fwrite($fh,"$webServiceBaseUrl\n");
                $results = ws_re_cat( $webServiceBaseUrl );
                
                fwrite($fh,"CURL INFO RESULTS\n");
                foreach ( $results['curl_info'] as $k => $v ) {
                    fwrite($fh,"$k = $v\n");
                }
                
                if( isset( $results['curl_error'] ) ) {
                    fwrite( $fh, "CURL ERROR: " . $results['curl_error'] . "\n" );
                } else {
                    fwrite( $fh, "CURL RESPONSE: " . $results['response'] . "\n" );
                }
                
                $xmlResults = file_get_contents($webServiceBaseUrl);
                $xmlResults = str_replace(array("\n", "\r", "\t"), '', $xmlResults);
                $xmlResults = trim(str_replace('"', "'", $xmlResults));
                
                $property_options = parsePropertiesXmlReply($xmlResults);
                $results = $property_options;
                
                break;
            case 'ws_re_city':
                fwrite($fh,"Fetching Cities\n");
                $webServiceBaseUrl .= $action;
                fwrite($fh,"$webServiceBaseUrl\n");
                $results = ws_re_city( $webServiceBaseUrl );
                
                fwrite($fh,"CURL INFO RESULTS\n");
                foreach ( $results['curl_info'] as $k => $v ) {
                    fwrite($fh,"$k = $v\n");
                }
                
                if( isset( $results['curl_error'] ) ) {
                    fwrite( $fh, "CURL ERROR: " . $results['curl_error'] . "\n" );
                } else {
                    fwrite( $fh, "CURL RESPONSE: " . $results['response'] . "\n" );
                }
                
                $xmlResults = file_get_contents($webServiceBaseUrl);
                $xmlResults = str_replace(array("\n", "\r", "\t"), '', $xmlResults);
                $xmlResults = trim(str_replace('"', "'", $xmlResults));
               
                $city_options = parseCitiesXmlReply($xmlResults);
                $results = $city_options;
                break;
            default:
                // Main Search Engine Query
                $searchEngineCriteria = new SearchEngineCriteria();
                validateBuyRent( $searchEngineCriteria );                       // OK
                validateBedrooms( $searchEngineCriteria );                      // OK
                validateBathrooms( $searchEngineCriteria );                     // OK
                validatePriceRange( $searchEngineCriteria );                    // OK
                validatePropertyType( $searchEngineCriteria );                  // OK
                fwrite($fh,"Fetching Cities\n");
                $webServiceBaseUrl .= $action;
                fwrite($fh,"$webServiceBaseUrl\n");
                fwrite( $fh, "FILTER SELECTION=" . $searchEngineCriteria->getFilterSelection() . "\n" );
                $results = ws_re_search( $webServiceBaseUrl, $searchEngineCriteria );
                
                $search_results = parseSearchXmlReply( $results );
                
                fwrite( $fh, $results );
                fwrite( $fh, "TOTAL RESUTLS=".count( $search_results ) . "\n" );
                break;
        }
        $reply['status'] = 1;
        $reply['data']   = $results;
        fclose($fh);
    } catch (Exception $ex) {
        fwrite($fh,$ex->getMessage());
        $reply['status'] = 0;
    }
    
    echo json_encode($reply);
    exit;
}

//+============================================================================+
//|                                                                            |
//|                             FORM VALIDATION                                |
//|                                                                            |
//+============================================================================+

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function that validates the web service action.
 * On failure it raises an exception.
 */
function isValidAction( $theAction ){
    $valid_ws_actions = array( 'ws_re_cat', 'ws_re_city', 'ws_re_search' );
    if( ! in_array( $theAction, $valid_ws_actions ) ) {
        throw new Exception(WEB_SERVICE_INVALID);
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function to validate the search engine criteria "Buy or Rent" form selection.
 * Input: An reference to //|                                                                            |an object of class type SearchEngineCriteria.
 * Output: none
 * NOTE: Depending on the input and if it is not missing and is invalid the
 * proper members of the argument object will be altered.
 */
function validateBuyRent( &$searchEngineCriteria ){
    $p_buy_type = trim(filter_input(INPUT_POST, 'p_buy_rent'));
    if( !$p_buy_type ) {
        throw new Exception(POST_PARAM_MISSING . ": p_buy_rent");
    } else {
        $valid_buy_rent_types = array( "ALL", "BUY", "RENT" );
        if( !in_array( $p_buy_type, $valid_buy_rent_types ) ) {
            throw new Exception(POST_PARAM_INVALID . ": p_buy_rent");
        }
        
        if( $p_buy_type === "BUY" ) {
            $searchEngineCriteria->addSelectionFilterValue( "p_sale=1" );
            return;
        }
        
        if( $p_buy_type === "RENT" ) {
            $searchEngineCriteria->addSelectionFilterValue( "p_rent=1" );
            return;
        }
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function to validate the search engine criteria "Bedrooms" form selection.
 * Input: An reference to an object of class type SearchEngineCriteria.
 * Output: none
 * NOTE: Depending on the input and if it is not missing and is invalid the
 * proper members of the argument object will be altered.
 */
function validateBedrooms(&$searchEngineCriteria ){
    $int_options = array( "options" => array( "min_range"=>0,"max_range"=>5 ) );
    $p_bedrooms = trim(filter_input( INPUT_POST, 'p_bedrooms', 
        FILTER_VALIDATE_INT, $int_options ) );
    if( $p_bedrooms === false ) {
        throw new Exception(POST_PARAM_INVALID . ": p_bedrooms");
    } else {
        $searchEngineCriteria->addSelectionFilterValue( "p_bedrooms=".$p_bedrooms );
        return;
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function to validate the search engine criteria "Bathrooms" form selection.
 * Input: An reference to an object of class type SearchEngineCriteria.
 * Output: none
 * NOTE: Depending on the input and if it is not missing and is invalid the
 * proper members of the argument object will be altered.
 */
function validateBathrooms(&$searchEngineCriteria ){
    $int_options = array( "options" => array( "min_range"=>0,"max_range"=>5 ) );
    $p_bathrooms = trim(filter_input( INPUT_POST, 'p_bathrooms', 
        FILTER_VALIDATE_INT, $int_options ) );
    if( $p_bathrooms === false ) {
        throw new Exception(POST_PARAM_INVALID . ": p_bathrooms");
    } else {
        $searchEngineCriteria->addSelectionFilterValue( "p_bathrooms=".$p_bathrooms );
        return;
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function to validate the search engine criteria "Price Range" form 
 * selections where the minimum & maximum price values are selected.
 * Input: An reference to an object of class type SearchEngineCriteria.
 * Output: none
 * NOTE: Depending on the inputs selected and if they are not missing 
 * nor they are invalid the proper members of the argument object will 
 * be altered.
 */
function validatePriceRange( &$searchEngineCriteria ){
    $p_buy_type = trim(filter_input(INPUT_POST, 'p_buy_rent'));
    $int_options = array( "options" => array( "min_range"=>0,"max_range"=>PHP_INT_MAX ) );
    
    $p_min_price = trim(filter_input( INPUT_POST, 'p_min_price', 
        FILTER_VALIDATE_INT, $int_options ) );
    if( $p_min_price === false ) {
        throw new Exception(POST_PARAM_INVALID . ": p_min_price");
    }
    
    $p_max_price = trim(filter_input( INPUT_POST, 'p_max_price', 
        FILTER_VALIDATE_INT, $int_options ) );
    if( $p_max_price === false ) {
        throw new Exception(POST_PARAM_INVALID . ": p_max_price");
    }
    
    // Depending on the "Buy or Rent" selection set the proper fields of the
    // input argument object.
      if ( $p_buy_type === "BUY" ) {
        $searchEngineCriteria->addSelectionFilterValue( "p_min_price=".$p_min_price );
        $searchEngineCriteria->addSelectionFilterValue( "p_max_price=".$p_max_price );
        return;
    }
      if ( $p_buy_type === "RENT" ) {
        $searchEngineCriteria->addSelectionFilterValue( "p_min_rent=".$p_min_price );
        $searchEngineCriteria->addSelectionFilterValue( "p_max_rent=".$p_max_price );
        return;
    }
    
    $searchEngineCriteria->addSelectionFilterValue( "p_min_price=".$p_min_price );
    $searchEngineCriteria->addSelectionFilterValue( "p_max_price=".$p_max_price );
    $searchEngineCriteria->addSelectionFilterValue( "p_min_rent=".$p_min_price );
    $searchEngineCriteria->addSelectionFilterValue( "p_max_rent=".$p_max_price );
    return;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * Function to validate the search engine criteria "Property Type" 
 * form selection.
 * Input: An reference to an object of class type SearchEngineCriteria.
 * Output: none
 * NOTE: Depending on the input and if it is not missing and is invalid the
 * proper members of the argument object will be altered.
 */
function validatePropertyType(&$searchEngineCriteria ){
    $searchEngineCriteria->setPType( $_POST['p_type'] );
}

//+============================================================================+
//|                                                                            |
//|                             WEB SERVICE CALLS                              |
//|                                                                            |
//+============================================================================+

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function ws_re_cat( $webServiceBaseUrl, $p_type ){
    $curl_obj = curl_init( 'http://89.249.211.235:8082/ws_re_cat' );
    
    if( !$curl_obj ) {
        return array( 'curl_error'  => 'Failed to create connection.', 'curl_info' => array() );
    }
    
    curl_setopt( $curl_obj, CURLOPT_RETURNTRANSFER, 1 );
    curl_setopt( $curl_obj, CURLOPT_CUSTOMREQUEST, 'GET' );    
    $response = curl_exec( $curl_obj );
    $web_serv_error = curl_error( $curl_obj );
    $error_code = curl_errno( $curl_obj );
    $curl_info = curl_getinfo( $curl_obj );
    curl_close( $curl_obj );
    
    if( $error_code ) {
        return array( 'curl_error'  => $web_serv_error, 'curl_info' => $curl_info );
    } else {
        return array( 'response' => $response, 'curl_info' => $curl_info );
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * 
 */
function ws_re_city( $webServiceBaseUrl ){
    $curl_obj = curl_init( 'http://89.249.211.235:8082/ws_re_city' );
    
    if( !$curl_obj ) {
        return array( 'curl_error'  => 'Failed to create connection.', 'curl_info' => array() );
    }
    
    curl_setopt( $curl_obj, CURLOPT_RETURNTRANSFER, 1 );
    curl_setopt( $curl_obj, CURLOPT_CUSTOMREQUEST, 'GET' );    
    $response = curl_exec( $curl_obj );
    $web_serv_error = curl_error( $curl_obj );
    $error_code = curl_errno( $curl_obj );
    $curl_info = curl_getinfo( $curl_obj );
    curl_close( $curl_obj );
    
    if( $error_code ) {
        return array( 'curl_error'  => $web_serv_error, 'curl_info' => $curl_info );
    } else {
        return array( 'response' => $response, 'curl_info' => $curl_info );
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * 
 */
function ws_re_search( $webServiceBaseUrl, &$searchEngineCriteria ){
    
    $url_string = $webServiceBaseUrl . '?';
    
    $url_string .= $searchEngineCriteria->getFilterSelection();
    $curl_obj = curl_init( $url_string );
    curl_setopt( $curl_obj, CURLOPT_RETURNTRANSFER, 1 );
    curl_setopt( $curl_obj, CURLOPT_CUSTOMREQUEST, 'GET' );
    $result = curl_exec( $curl_obj );
    curl_close( $curl_obj );
    return $result;
}
//+============================================================================+
//|                                                                            |
//|                             XML PARSERS                                    |
//|                                                                            |
//+============================================================================+

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function parseCitiesXmlReply ( $xmlResults ){
    $city_options = array();
    $root = simplexml_load_string($xmlResults);
    foreach( $root->children() as $a_row ){
        $city_id   = (string) $a_row['city'];
        $city_name = (string) $a_row['name'];
        
        array_push($city_options, array( 'value' => $city_id, 'name' => $city_name ));
    } 
    return $city_options;
}    
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * 
 */
function parsePropertiesXmlReply ( $xmlResults ){
    $property_options = array();
    $root = simplexml_load_string($xmlResults);
    foreach( $root->children() as $a_row ){
        $property_id   = (string) $a_row['category'];
        $property_name = (string) $a_row['name'];
        
        array_push($property_options, array( 'value' => $property_id, 'name' => $property_name ));
    } 
    return $property_options;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 * 
 */
function parseSearchXmlReply( $xmlResults ){
    $search_results = array();
    $root = simplexml_load_string($xmlResults);
    $count = 0;
    foreach( $root->children() as $a_row ){
        $count++;
        array_push( $search_results, $a_row );
    } 
    return $search_results;
}
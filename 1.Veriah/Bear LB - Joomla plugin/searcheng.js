/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var resultStorage = [];

jQuery(function(){
    var ajax_file = '/modules/mod_veriah/search_engine_ws.php';
    console.log(ajax_file);
    var brokers = [ "Eddy Noun", 
                    "Frederic Khalil", 
                    "Michelle Khabbaz", 
                    "Karen Zahar", 
                    "Carla Kaddoum", 
                    "Serge Kassatly"];
                    
    var links   = [ "http://bear-lb.com/index.php/aboutus/our-team/edouard-noun", 
                    "http://bear-lb.com/index.php/aboutus/our-team/frederic-khalil", 
                    "http://bear-lb.com/index.php/aboutus/our-team/michele-khabbaz", 
                    "http://bear-lb.com/index.php/aboutus/our-team/karen-zahar", 
                    "http://bear-lb.com/index.php/aboutus/our-team/carla-kaddoum", 
                    "http://bear-lb.com/index.php/aboutus/our-team/serge-kassatly" ];
    //var res = jQuery("#resultContainer");
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
     * 
     */
    
    jQuery('#search_properties').click(function(){
        console.log('Searching properties...');
        jQuery("#loading").show();
        localStorage.clear();
        var action      = 'ws_re_search'; 
        var p_buy_rent  = jQuery('#p_buy_rent').val();
        var p_min_price = jQuery('#p_min_price').val();
        var p_max_price = jQuery('#p_max_price').val();
        var p_bedrooms  = jQuery('#p_bedrooms').val();
        var p_bathrooms = jQuery('#p_bathrooms').val();
        var p_city      = jQuery('#p_city').val();
        var p_type      = jQuery('#p_type').val();
        
        jQuery.post( ajax_file, { 
            'action'      : action,
            'p_buy_rent'  : p_buy_rent,
            'p_min_price' : p_min_price,
            'p_max_price' : p_max_price,
            'p_bedrooms'  : p_bedrooms,
            'p_bathrooms' : p_bathrooms,
            'p_city'      : p_city,
            'p_type'      : p_type
        },
        function( reply ){
            var status = reply.status;
            if( status === 1 ) {
                   console.log("OK");
                   jQuery("#loading").hide();
                   jQuery("#resultContainer").show();
                    var text = reply.data;
                    function StringtoXML(text){
                        if (window.ActiveXObject){
                          var doc=new ActiveXObject('Microsoft.XMLDOM');
                          doc.async='false';
                          doc.loadXML(text);
                        } else {
                          var parser=new DOMParser();
                          var doc=parser.parseFromString(text,'text/xml');
                        }
                        return doc;
                    }

                var doc = StringtoXML(text);
                //get data
                var dataArray = doc.childNodes[0].childNodes;
                for ( var i=1; i<dataArray.length; i+=2 ) {
                    var dataCategory  = dataArray[i].getAttribute("category");
                    var dataCity      = dataArray[i].getAttribute("city");
                    var dataBroker    = dataArray[i].getAttribute("broker_name");
                    var dataArea      = dataArray[i].getAttribute("total_area");
                    var dataBedrooms  = dataArray[i].getAttribute("bedrooms");
                    var dataBathrooms = dataArray[i].getAttribute("bathrooms");
                    var dataRentPrice = dataArray[i].getAttribute("rent_price");
                    var dataSalePrice = dataArray[i].getAttribute("sale_price");
                    
                    if(dataBedrooms  === null) { dataBedrooms  = "n/a"; }
                    if(dataBathrooms === null) { dataBathrooms = "n/a"; }
                    if(dataRentPrice === null) { dataRentPrice = "n/a"; }
                    if(dataSalePrice === null) { dataSalePrice = "n/a"; }
                    
                    for( var j=0; j<brokers.length; j++ ) {
                        if ( dataBroker === brokers[j] ) {
                            var contactLink = links[j];
                            var linkText = "Contact Info"
                            j=brokers.length;
                        }
                        else {
                            contactLink = "#";
                            linkText = "";
                        }
                    }

                    resultStorage[i] = {
                        dataCategory  : dataCategory,
                        dataCity      : dataCity,
                        dataBroker    : dataBroker,
                        contactLink   : contactLink,
                        linkText      : linkText,
                        dataArea      : dataArea,
                        dataBedrooms  : dataBedrooms,
                        dataBathrooms : dataBathrooms,
                        dataRentPrice : dataRentPrice,
                        dataSalePrice : dataSalePrice
                    }

                    localStorage.setItem("resultStorage", JSON.stringify(resultStorage));
                    window.location.href = 'http://bear-lb.com/index.php/search-engine-2/search-engine/results';
                }
                
            } 
            else {
                alert("Connection Failed");
            }
        },'json');
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
     * 
     */
    jQuery('#p_type').change(function(){
        var action = 'ws_re_cat'; 
        var p_type = jQuery('#p_type').val();
        jQuery.post( ajax_file, { 
            'action' : action,
            'p_type' : p_type
        },
        function( reply ){
            var status = reply.status;
            if( status === 1 ) {
                ;
            } else {
                ;
            }
        },'json');
        
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
     * 
     */
    function fetch_cities(){
        var action    = 'ws_re_city'; 
        jQuery.post( ajax_file, { 
            'action' : action
        },
        function( reply ){
            var status = reply.status;
            if( status === 1 ) {
            var p_city = jQuery('#p_city');
            var cities = reply.data;
            for ( i=0; i<cities.length; i++ ) {
                var a_city = cities[i];
                p_city.append('<option value="'+ a_city.value +'">'+ a_city.name +'</option>');
            }
            } else {
                ;
            }
        },'json');
    }
    
    function fetch_property_types(){
        var action    = 'ws_re_cat'; 
        jQuery.post( ajax_file, { 
            'action' : action
        },
        function( reply ){
            var status = reply.status;
            if( status === 1 ) {
            var p_type = jQuery('#p_type');
            var property_types = reply.data;
            for ( i=0; i<property_types.length; i++ ) {
                var a_type = property_types[i];
                p_type.append('<option value="'+ a_type.value +'">'+ a_type.name +'</option>');
            }
            } else {
                ;
            }
        },'json');
    }
    
    // populate cities drop-down box
    fetch_cities();
    fetch_property_types();
});
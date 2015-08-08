<?php // do direct access
defined( '_JEXEC' ) or die( 'Restricted access' );
?>
<script type="text/javascript">
    jQuery(document).ready(function(){
        var str = document.URL;
        var n = str.lastIndexOf('/');
        var result = str.substring(n + 1);
        var pattern = /district-s/;
        var district_string = 'district-s';
        var districts = pattern.test(result);
        if (districts) {
            jQuery('.logo').attr('src', '/modules/mod_veriah/assets/logos/' + district_string + '.png');
        }
        else {
            jQuery('.logo').attr('src', '/modules/mod_veriah/assets/logos/' + result + '.png');
        }
    });
    
    jQuery('.text_container').css('padding-left', '345px');
    jQuery('.text_container').css('padding-top', '130px');
    jQuery('.item-page').css('display', 'none');
    
</script>
<img style="float:left;margin-top:20px" class="logo" src="" />
<h1 style="float:left;padding:30px;font-weight:lighter">{{building_name}}<br/>Project located in {{area_name}}</h1><br/>
<p style="float: left;clear: both">To view the plans, click on the floors</p>
<div style="margin-top:-30px;clear:left">
    <canvas id="buildingCanvas" width="850" height="500">
        {{not_support_msg}}
    </canvas>
</div>
<a class="back_to_area" href="{{pageuri}}" style="text-decoration=none;color:#000000;float:right;display:none">Back to area view</a>
<script>
    jQuery(function(){
        // [1] jQuery call to get the floors' path information.
        var floors_path_info = null;
        var ajax_file = '/modules/mod_veriah/get_building_info.php';
        var isDistrictS = false;
        var str = document.URL;
        var n = str.lastIndexOf('/');
        var result = str.substring(n + 1);
        console.log(result);

        var pattern = /district-s/;
        var districts = pattern.test(result);
        if (districts) {
            isDistrictS = true;
            var area_id     = getUrlParameter('area_id');    
            var building_id = getUrlParameter('building_id');
            jQuery('.back_to_area').show();
        }
        else {
            var area_id     = '{{area_id}}';
            var building_id = '{{building_id}}'; 
        }
            var url = window.location.href; 
            console.log("pg_building.php area_id="+area_id+" building_id="+building_id);
            
            var destX = 0;
            var destY = 0;
            var clearImageObj = new Image();
            
            var pageCanvas = jQuery('#buildingCanvas');
            var context = pageCanvas[0].getContext("2d");
            
            clearImageObj.onload = function(){ 
                context.drawImage( clearImageObj, destX, destY );
            };
            clearImageObj.src = "/modules/mod_veriah/assets/area"+area_id+"building"+building_id+".jpg";
            
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /*
         * 
         */
        pageCanvas.mousemove(function(evt){
            context.globalAlpha = 1;
            var rect = pageCanvas[0].getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
            console.log(isPointInFloorArea( x, y ));
            context.drawImage( clearImageObj, destX, destY );
            
            if( isPointInFloorArea( x, y ) !== null ) {
                if (isDistrictS) {
                    context.fillStyle = "black";
                }
                else {
                    context.fillStyle = "white";
                }
                context.globalAlpha = 0.55;
                context.fill();
            }
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /*
         * 
         */
        pageCanvas.click(function(evt){
            
            var rect = pageCanvas[0].getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
        
            var floor_id = isPointInFloorArea( x, y );
            
            if( floor_id !== null ) {
                var theurl = "{{pageuri}}"+
                        "?nav=l2"+
                        "&building="+building_id+
                        "&floor="+floor_id;
                window.location.assign(theurl);
            }
        });

        function getUrlParameter(sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) 
            {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) 
                {
                    return sParameterName[1];
                }
            }
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /*
         * 
         */
        function isPointInFloorArea( x, y ) {
            if( floors_path_info === null ) {
                return false;
            }
            for( var i = 0; i < floors_path_info.length; i++ ){
                context.beginPath();
                var floor_id    = floors_path_info[i].floor_id;
                var path_points = floors_path_info[i].points;
                for (var j = 0; j < path_points.length; j++) {
                    var point_coords = path_points[j];
                    if (j > 0) {
                        context.lineTo(point_coords.x, point_coords.y);
                    } else {
                        context.moveTo(point_coords.x, point_coords.y);
                    }
                }
                context.closePath();

                if (context.isPointInPath(x, y)) {
                    return floor_id;
                    console.log(floor_id);
                }
            }

            return null;
        };
        

        jQuery.post( ajax_file, { 
                'area_id'     : area_id,
                'building_id' : building_id
            },
            function( reply ){
                
                var status = reply.status;
                if( status === 1 ) {
                    floors_path_info = reply.floors_path_info;
                }
            },'json');    
    });
</script>
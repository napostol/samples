function reloadGrid(sceneId, playlistIndex){
	$('#'+ sceneId +'Videos').empty();
	window[sceneId + "VideosImages"] = [];
	window[sceneId + "id"] = [];
	var imagesTemp = [];
	var idTemp = [];
	var captionTemp = [];
	for (var i = 0; i < playlistVideos[playlistIndex].videos.length; i ++) {
		imagesTemp.push(playlistVideos[playlistIndex].videos[i].img);
		idTemp.push(playlistVideos[playlistIndex].videos[i].ytid);
		captionTemp.push(playlistVideos[playlistIndex].videos[i].title);
	}
	videosGrid.init(sceneId + "Videos", imagesTemp, idTemp, sceneId, captionTemp);
	window[sceneId + "VideosImages"] = imagesTemp;
	window[sceneId + "id"] = idTemp;
	window[sceneId + "VideosCaptions"] = captionTemp;
}

function focusOnGrid(sceneId, location){
	videosGridFocus = true;
	listFocus = false;
	$('#svecImage_'+ location +'_bg_list').removeClass('selected');
	$('#svecImage_'+ location +'_bg_videosGrid').addClass('selected');
	$('#'+ sceneId +'Categories').removeClass('selected');
	$('#'+ sceneId +'Categories').sfList('blur');
	videosGrid.focus(0);
}

function focusOnList(sceneId, location){
	listFocus = true;
	videosGridFocus = false;
	videosGrid.isFocused(videosGridFocus);
	$('#svecImage_'+ location +'_bg_list').addClass('selected');
	$('#svecImage_'+ location +'_bg_videosGrid').removeClass('selected');
	$('#'+ sceneId +'Categories').addClass('selected');
	$('#'+ sceneId +'Categories').sfList('focus');
}

function focusOnAd(sceneId){
	adFocus = true;
	listFocus = false;
	videosGridFocus = false;
	$('#'+ sceneId +'Categories').removeClass('selected');
	$('#'+ sceneId +'Ads').addClass('selected');
}

function clearScene(sceneId, locationCaps){
	window[locationCaps] = [];
	window[sceneId + "VideosImages"] = [];
	window[sceneId + "id"] = [];
	$('#'+ sceneId +'Categories').empty();
	$('#'+ sceneId +'Videos').empty();
	$('#Scenemy' + locationCaps).remove();
}

function resetGlobals(){
	isPlayer		  = false;
	listFocus     	  = true;
	overlay			  = false;
	playerlistFocus   = false;
	videosGridFocus   = false;
	playerGridFocus   = true;
	firstTimePlay     = true;
	selectedCategory  = 0;
	selectedChannel   = null;
	globalNavIndex	  = 0;
	currentPlaylistIndex = 0;
	CRETE_INDEX = 0;
	adBannerImages = [];
}

function smallFont(){
	var height = $('.sf-ui-popup .text').height();
	if ( height == 400 ) {
		$('.sf-ui-popup .text').css('font-size', '18px');
	}
}
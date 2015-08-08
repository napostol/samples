function ScenemyATHENS() {};

var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();
widgetAPI.sendReadyEvent();

ScenemyATHENS.prototype.initialize = function () {
	adBannerLoader("ATHENS");
	PlaylistLoader("ATHENS");	
	if ( playlistData.length == 0 ) {
		$('#svecImage_Athens_bg').sfImage({
			src:'images/bg-main.png'
		});
		$('#svecImage_Athens_logo').sfImage({
			src:'images/logo-myATHENS.png'
		});
		$('#svecLabel_Athens_title').sfLabel({
			text:'No videos available yet for this channel.'
		});
	}
	else {
		for (var i = 0; i < playlistData.length; i ++) {
			ATHENS.push(playlistData[i].title);
		}
		//Initialize videosGrid with data from 1st playlist
		for (var i = 0; i < playlistVideos[0].videos.length; i ++) {
			athVideosImages.push(playlistVideos[0].videos[i].img);
			athid.push(playlistVideos[0].videos[i].ytid);
			athVideosCaptions.push(playlistVideos[0].videos[i].title);
		}
		videosGrid.init("athVideos", athVideosImages, athid, "ath", athVideosCaptions);
		$('#svecImage_Athens_bg').sfImage({
			src:'images/bg-main.png'
		});
		$('#svecImage_Athens_logo').sfImage({
			src:'images/logo-myATHENS.png'
		});
		$('#athAds').sfImage({
			src: adBannerImages[0].url
		});
		$('#svecImage_Athens_bg_list').sfImage({
			src:'images/bg-list.png'
		});
		$('#overflow').sfImage({
			src: 'images/header-overflow.png'
		});
		$('#svecLabel_Athens_title').sfLabel({
			text:'Let us guide you around Athens!'
		});
		$('#svecImage_Athens_bg_videosGrid').sfImage({
			src:'images/bg-player-thumb.png'
		});
		$('#svecImage_Athens_bg_list').addClass('selected');
		$('#athCategories').sfList({ data: ATHENS, itemsPerPage: ATHENS.length});
		$('#athCategories').sfList('focus');
		
		$('#svecKeyHelp3').sfKeyHelp({
//			'red' : 'Select Language',
			'green' : 'Select location',
//			'yellow' : 'Videos',
			'blue' : 'Video Player',
		    'enter': 'Select / Play',
			'return':'Change Category / Back',
			'tools':'Fullscreen',
		});
		var $img = $("#athAds"), i = 0/*, speed = 2000*/;
		window.setInterval(function(){
			if ( i == adBannerImages.length ) { i = 0; }
			$img.attr("src", adBannerImages[i].url);
			i++;
		}, 5000);
	}
};

ScenemyATHENS.prototype.handleKeyDown = function (keyCode) {
	switch (keyCode) {
		case sf.key.RIGHT:
			if ( videosGridFocus == true ){ videosGrid.right(); }
			else if ( listFocus == true ){ focusOnGrid("ath", "Athens"); }
			break;
		case sf.key.LEFT:
			if ( videosGridFocus == true ){ 
				var isAtGridEdge = (globalNavIndex) % 4;
				if ( isAtGridEdge == 0 ){ focusOnList("ath", "Athens"); }
				else { videosGrid.left(); } 
			}
			break;
		case sf.key.DOWN:
			sf.key.preventDefault();
			if ( videosGridFocus == true ){ videosGrid.down(); }
			else {
				currentPlaylistIndex = $('#athCategories').sfList('getIndex');
				if ( currentPlaylistIndex == ATHENS.length - 1 ){
					focusOnAd("ath");
				}
				else {
					$('#athCategories').sfList('next');
				}
			}
			break;
		case sf.key.UP:
			sf.key.preventDefault();
			if ( videosGridFocus == true ){ videosGrid.up(); }
			else if ( adFocus == true ) { 
				$('#athAds').removeClass('selected');
				focusOnList("ath", "Athens");
				$('#athCategories').sfList('prev');
			}
			else $('#athCategories').sfList('prev');
			break;
		case sf.key.ENTER:
			if ( listFocus == true ) {
				currentPlaylistIndex = $('#athCategories').sfList('getIndex');
				//reloadGrid
				reloadGrid("ath", currentPlaylistIndex);
			}
			else if  ( videosGridFocus == true ){
				//Variables to pass to player
				playerListFocus   = false;
				playerGridFocus   = true;
				isPlayer = true;
				playId = $("img.focused").attr("id");
				selectedChannel  = "ATHENS";
				selectedCategory = currentPlaylistIndex;
				selectedVideo = $("img.focused").attr("name");
				sf.scene.hide('myATHENS');
				sf.scene.show('videoPlayer');
				sf.scene.focus('videoPlayer');
				
			}
//			else if  ( adFocus == true ){
//				widgetAPI.runSearchWidget("29_fullbrowser", "http://www.google.com");
//			}
			break;
		case sf.key.RETURN:
			sf.key.preventDefault();
			//clear scene
			clearScene("ath", "ATHENS");
			resetGlobals();
			sf.scene.show('homepage');
			sf.scene.focus('homepage');
			break;
		case sf.key.RED:
			location.reload();
			break;
		case sf.key.GREEN:
			clearScene("ath", "ATHENS");
			resetGlobals();
			sf.scene.show('homepage');
			sf.scene.focus('homepage');
			break;
		case sf.key.BLUE:
			//Variables to pass to player
			isPlayer = true;
			playId = $("athVideos").first().attr("id");
			selectedChannel  = "ATHENS";
			selectedCategory = "0";
			selectedVideo = "0";
			sf.scene.hide('myATHENS');
			sf.scene.show('videoPlayer');
			sf.scene.focus('videoPlayer');
			break;
		default:
			alert("handle default key event, key code(" + keyCode + ")");
			break;
	}
};

ScenemyATHENS.prototype.handleShow = function (data) {};
ScenemyATHENS.prototype.handleHide = function () {};
ScenemyATHENS.prototype.handleFocus = function () {};
ScenemyATHENS.prototype.handleBlur = function () {};

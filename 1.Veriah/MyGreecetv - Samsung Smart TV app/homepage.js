function Scenehomepage() {};

Scenehomepage.prototype.initialize = function () {
	$('#svecKeyHelp1').sfKeyHelp({
	    'updown': 'Up/Down',
	    'enter': 'Enter',
		'return':'Exit'
	});
	$('#svecImage_logo').sfImage({
		src:'images/logo-mygreece-home.png'
	});
	$('#svecImage_bg').sfImage({
		src:'images/bg-main.png'
	});
	$('#svecImage_overlay').sfImage({
		src:'images/overlay-0.png'
	});
	$('#locations').sfList({ data: LOCATIONS, itemsPerPage: LOCATIONS.length});
	$('#locations').sfList('focus');
};

Scenehomepage.prototype.handleKeyDown = function (keyCode) {
switch (keyCode) {
	case sf.key.LEFT:
	break;
	case sf.key.RIGHT:
	break;
		case sf.key.UP:
			$('#locations').sfList('prev');
			LOCATION_INDEX--;
			if ( LOCATION_INDEX < 0 ) { LOCATION_INDEX = LOCATIONS.length - 1; }
			$('#svecImage_overlay').sfImage({
				src:'images/overlay-' + LOCATION_INDEX + '.png'
			});
		break;
		case sf.key.DOWN:			
			$('#locations').sfList('next');
			LOCATION_INDEX++;
			if ( LOCATION_INDEX >= LOCATIONS.length ) { LOCATION_INDEX = 0; }
			$('#svecImage_overlay').sfImage({
				src:'images/overlay-' + LOCATION_INDEX + '.png'
			});
		break;
		case sf.key.ENTER:
			sf.scene.hide('homepage');
			sf.scene.show(LOCATIONS[LOCATION_INDEX]);
			sf.scene.focus(LOCATIONS[LOCATION_INDEX]);
		break;
		case sf.key.RETURN:
			
		break;
		default:
			alert("handle default key event, key code(" + keyCode + ")");
		break;
	}
};


Scenehomepage.prototype.handleShow = function () {};
Scenehomepage.prototype.handleHide = function () {};
Scenehomepage.prototype.handleFocus = function () {};
Scenehomepage.prototype.handleBlur = function () {};

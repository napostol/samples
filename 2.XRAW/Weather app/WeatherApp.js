//get user location
function getLocation() {
	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(showPosition, errorHandler);
	}
	else{
		alert("Geolocation is not supported by this browser");
	}
}

//error handler
function errorHandler(error) {
	switch(error.code) 
    	{
			case error.PERMISSION_DENIED:
				alert("User denied the request for Geolocation.");
				break;
			case error.POSITION_UNAVAILABLE:
				alert("Location information is unavailable.");
				break;
			case error.TIMEOUT:
				alert("The request to get user location timed out.");
				break;
			case error.UNKNOWN_ERROR:
				alert("An unknown error occurred.");
				break;
		}
}

//get coordinates
function showPosition(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	getWeather(lat, lon);
}

//get local weather
function getWeather(lat, lon) {
	var webService = new XMLHttpRequest();
	webService.open("GET", "http://api.wunderground.com/api/0834260442254b0d/conditions/astronomy/q/"+lat+","+lon+".xml", false);
	webService.send();
	var weatherData = webService.responseXML;
	console.log(weatherData);
	/* TODO: get time to determine sunrise, sunset, day or night */
	//structure conditions data
	var city = getTag(weatherData, "full");
	var weather = getTag(weatherData, "weather");
	var temperatureString = getTag(weatherData, "temperature_string");
	var humidity = getTag(weatherData, "relative_humidity");
	var icon = getTag(weatherData, "icon_url");
	var dateTime = getTag(weatherData, "local_time_rfc822");
	//structure astronomy data
	var moonPhase = getTag(weatherData, "ageOfMoon");
	var sunriseHour = getTagNested(weatherData, "sunrise", "hour");
	var sunriseMins = getTagNested(weatherData, "sunrise", "minute");
	var sunsetHour = getTagNested(weatherData, "sunset", "hour");
	var sunsetMins = getTagNested(weatherData, "sunset", "minute");
	var sunrise = sunriseHour + ":" + sunriseMins;
	var sunset = sunsetHour + ":" + sunsetMins;
	//handle data and create view
	var weatherLyric = selectWeatherMessage(weather);
	var timeLyric = selectTimeMessage(dateTime);
	createHTML(city, weather, weatherLyric, temperatureString, humidity, icon, sunrise, sunset);
}

function getTag(weatherData, element) {
	var tagName = weatherData.getElementsByTagName(element)[0].textContent;
	return tagName;
}

function getTagNested(weatherData, element1, element2) {
	var tagName = weatherData.getElementsByTagName(element1)[0];
	var nested = tagName.getElementsByTagName(element2)[0].textContent;
	return nested;
}

//select message according to weather
function selectWeatherMessage(weather) {
	var weather = weather;
	var weatherLyric = null;
	switch (weather) {
		case "Chance of Flurries" :
			weatherLyric = MessageSelector.CFLURRIES;
			break;
		case "Chance of Rain" :
			weatherLyric = MessageSelector.CRAIN;
			break;
		case "Chance of Freezing Rain" :
			weatherLyric = MessageSelector.CFRRAIN;
			break;
		case "Chance of Sleet" :
			weatherLyric = MessageSelector.CSLEET;
			break;
		case "Chance of Snow" :
			weatherLyric = MessageSelector.CSNOW;
			break;
		case "Chance of Tunderstorms" :
			weatherLyric = MessageSelector.CTHUNDERST;
			break;
		case "Chance of a Thunderstorm" :
			weatherLyric = MessageSelector.CTHUNDERST;
			break;		
		case "Clear" : 
			weatherLyric = MessageSelector.CLEAR;
			drizzlebreak;
		case "Cloudy" :
			weatherLyric = MessageSelector.CLOUDY;
			break;
		case "Flurries" :
			weatherLyric = MessageSelector.FLURRIES;
			break;
		case "Fog" :
			weatherLyric = MessageSelector.FOG;
			break;
		case "Haze" :
			weatherLyric = MessageSelector.HAZE;
			break;
		case "Mostly Cloudy" :
			weatherLyric = MessageSelector.MCLOUDY;
			break;
		case "Mostly Sunny" :
			weatherLyric = MessageSelector.MSUNNY;
			break;
		case "Partly Cloudy" :
			weatherLyric = MessageSelector.PCLOUDY;
			break;
		case "Freezing Rain" :
			weatherLyric = MessageSelector.FRAIN;
			break;
		case "Rain" :
			weatherLyric = MessageSelector.RAIN;
			break;
		case "Sleet" :
			weatherLyric = MessageSelector.SLEET;
			break;
		case "Snow" :
			weatherLyric = MessageSelector.SNOW;
			break;
		case "Sunny" :
			weatherLyric = MessageSelector.SUNNY;
			break;
		case "Thunderstorms" : 
			weatherLyric = MessageSelector.THUNDERST;
			break;
		case "Unknown" : 
			weatherLyric = MessageSelector.UNKNOWN;
			break;
		case "Overcast" :
			weatherLyric = MessageSelector.OVERCAST;
			break;
		case "Scattered Clouds":
			weatherLyric = MessageSelector.SCATCLOUDS;
			break;
		case "Light Drizzle":
			weatherLyric = MessageSelector.LDRIZZLE;
			break;	
		default :
			weatherLyric = "Couldn't fetch weather data";																
	}
	return weatherLyric;
}

//select message according to time of day
function selectTimeMessage(dateTime) {
	var dateTime = dateTime;
	var date = new Date(dateTime);
	var time = date.getHours	();
	console.log(time);
}

//element constructor
var DomInterface = {
	createH3 : function(id, text) {
		var h3 = document.createElement("h3");
		h3.id = id;
		h3.innerText = text;
		return h3;
	},
	createImg : function(id, src) {
		var img = document.createElement("img");
		img.id = id;
		img.src = src;
		return img;
	}
};

//HTML constructor
function createHTML(city, weather, lyric, temperature, humidity, weatherIcon, sunrise, sunset) {
	var cityTitle = DomInterface.createH3("cityTitle", city);
	var cityIcon = DomInterface.createImg("weatherImg", weatherIcon);
	var cityWeather = DomInterface.createH3("cityWeather", weather);
	var cityLyric = DomInterface.createH3("cityLyric", lyric);
	var cityTemperature = DomInterface.createH3("cityTemperature", temperature);
	var cityHumidity = DomInterface.createH3("cityHumidity", humidity);
	var sunrise = DomInterface.createH3("sunrise", sunrise);
	var sunset = DomInterface.createH3("sunset", sunset);
	
	document.body.appendChild(cityTitle);
	document.body.appendChild(cityIcon);
	document.body.appendChild(cityWeather);
	document.body.appendChild(cityLyric);
	document.body.appendChild(cityTemperature);
	document.body.appendChild(cityHumidity);
	document.body.appendChild(sunrise);
	document.body.appendChild(sunset);
}

getLocation();
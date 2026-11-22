/*
  weather.js - Stage 7: show the current weather (AJAX + JSON)

  Course topics: AJAX (week 10) and JSON (week 9).
  It uses the same free Open-Meteo API as Assignment 4 - no API key needed.

  =====================================================================
  MODERN: fetch() instead of XMLHttpRequest
  ---------------------------------------------------------------------
  The course (and your assignments) used XMLHttpRequest with 4 functions:

    makeAjaxQuery()            -> create the request, open(), send()
    readyStateChangeHandler()  -> wait until readyState == 4
    handleStatusSuccess()      -> status 200: JSON.parse(xhttp.responseText)
    handleStatusFailure()      -> any other status: show an error

  fetch() is the modern built-in way to do exactly the same job.
  Here is how each course step maps to the code below:

    makeAjaxQuery()            -> fetch(url)
    readyStateChangeHandler()  -> "await" (waits for the reply for us)
    handleStatusSuccess()      -> if (response.ok) ... await response.json()
    handleStatusFailure()      -> if (!response.ok) throw ... / catch (error)

  Why fetch: it is shorter, easier to read, and it is what every job
  and every modern tutorial uses. XMLHttpRequest still works, but new
  code is almost always written with fetch.
  =====================================================================

  Every other place that differs from the course style is marked with "MODERN:".
*/

const WEATHER_CITY_KEY = "studyhub-city";

// cities in the drop-down: name -> latitude / longitude
const CITIES = {
  wollongong: { name: "Wollongong", lat: -34.4278, lon: 150.8931 },
  sydney:     { name: "Sydney",     lat: -33.8688, lon: 151.2093 },
  melbourne:  { name: "Melbourne",  lat: -37.8136, lon: 144.9631 },
  brisbane:   { name: "Brisbane",   lat: -27.4698, lon: 153.0251 },
  perth:      { name: "Perth",      lat: -31.9505, lon: 115.8605 },
  dhaka:      { name: "Dhaka",      lat: 23.8103,  lon: 90.4125 }
};

// Open-Meteo sends a number "weather_code"; this turns it into words and an emoji
// (codes from the Open-Meteo documentation)
function describeWeather(code) {
  if (code === 0) return { text: "Clear sky", emoji: "☀️" };          // ☀️
  if (code <= 2) return { text: "Partly cloudy", emoji: "⛅" };              // ⛅
  if (code === 3) return { text: "Overcast", emoji: "☁️" };            // ☁️
  if (code <= 48) return { text: "Fog", emoji: "🌫️" };           // 🌫️
  if (code <= 57) return { text: "Drizzle", emoji: "🌦️" };       // 🌦️
  if (code <= 67) return { text: "Rain", emoji: "🌧️" };          // 🌧️
  if (code <= 77) return { text: "Snow", emoji: "❄️" };                // ❄️
  if (code <= 82) return { text: "Rain showers", emoji: "🌦️" };  // 🌦️
  if (code <= 86) return { text: "Snow showers", emoji: "🌨️" };  // 🌨️
  return { text: "Thunderstorm", emoji: "⛈️" };                        // ⛈️
}


// get the weather for a place and show it
// MODERN: "async" lets us use "await" inside this function (see below)
async function loadWeather(lat, lon, placeName) {
  const display = document.getElementById("weatherDisplay");
  display.textContent = "Loading weather…";

  // build the query URL (same idea as Assignment 4's queryUrl)
  const url = "https://api.open-meteo.com/v1/forecast"
            + `?latitude=${lat}&longitude=${lon}`
            + "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m"
            + "&timezone=auto";

  // MODERN: try / catch - if anything inside "try" goes wrong (no internet,
  // bad reply), the code jumps to "catch" instead of crashing.
  // This plays the role of handleStatusFailure().
  try {
    // MODERN: fetch(url) sends the request (= open() + send()).
    // "await" pauses this function until the reply arrives
    // (= waiting for readyState == 4), without freezing the page.
    const response = await fetch(url);

    // response.ok is true for status 200-299 (= checking xhttp.status == 200)
    if (!response.ok) {
      throw new Error("status " + response.status);
    }

    // turn the JSON text into an object (= JSON.parse(xhttp.responseText))
    const weatherObj = await response.json();

    // show it on the page (= the display function in Assignment 4)
    displayWeather(weatherObj, placeName);

  } catch (error) {
    display.textContent = "Couldn't load the weather (" + error.message + "). Check your internet and try again.";
  }
}


// build the weather display from the JSON object
function displayWeather(weatherObj, placeName) {
  const current = weatherObj.current;
  const units = weatherObj.current_units;
  const weather = describeWeather(current.weather_code);

  const display = document.getElementById("weatherDisplay");
  display.innerHTML = "";   // clear "Loading..."

  // MODERN: we build elements and use textContent (safe), like Stage 2,
  // instead of joining one long html string with += as in the course.
  const main = document.createElement("div");
  main.className = "weather-main";

  const emoji = document.createElement("span");
  emoji.className = "weather-emoji";
  emoji.textContent = weather.emoji;

  const temp = document.createElement("span");
  temp.className = "weather-temp";
  temp.textContent = Math.round(current.temperature_2m) + "°";   // °

  main.appendChild(emoji);
  main.appendChild(temp);

  const details = document.createElement("p");
  details.className = "weather-details";
  details.textContent =
    `${weather.text} in ${placeName}. Feels like ${Math.round(current.apparent_temperature)}${units.temperature_2m}, ` +
    `wind ${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}.`;

  display.appendChild(main);
  display.appendChild(details);
}


// the user picked a city from the drop-down
function chooseCity(cityKey) {
  const city = CITIES[cityKey];
  localStorage.setItem(WEATHER_CITY_KEY, cityKey);   // remember it for next time
  loadWeather(city.lat, city.lon, city.name);
}

// the user clicked "Use my location"
function useMyLocation() {
  const display = document.getElementById("weatherDisplay");

  // MODERN: the Geolocation API asks the browser (and the user) for the device's position
  if (!navigator.geolocation) {
    display.textContent = "Your browser can't share your location.";
    return;
  }

  display.textContent = "Finding your location…";

  navigator.geolocation.getCurrentPosition(
    // success: we got the position
    function (position) {
      loadWeather(position.coords.latitude, position.coords.longitude, "your area");
    },
    // failure: the user said no, or it timed out
    function () {
      display.textContent = "Location not available. Pick a city instead.";
    }
  );
}


// set up the widget (runs once when the page starts)
function setupWeather() {
  const citySelect = document.getElementById("citySelect");

  // MODERN: Object.keys(CITIES) gives ["wollongong", "sydney", ...]
  // so we can build the <option>s from the CITIES list instead of typing them in HTML
  Object.keys(CITIES).forEach(function (key) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = CITIES[key].name;
    citySelect.appendChild(option);
  });

  // start with the city saved last time, or Wollongong
  const savedCity = localStorage.getItem(WEATHER_CITY_KEY);
  const startCity = CITIES[savedCity] ? savedCity : "wollongong";
  citySelect.value = startCity;

  citySelect.addEventListener("change", function () {
    chooseCity(citySelect.value);
  });
  document.getElementById("locationButton").addEventListener("click", useMyLocation);

  chooseCity(startCity);
}

setupWeather();

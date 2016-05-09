# Map Project

This repository is for the Udacity Neighborhood Map Project. This code is hosted as a live web page at http://raphreyes.github.io/p5-map-project
To inspect this code simply git clone this repository.

The page should load and display a map, and a list of amusement parks.
On screens smaller than 960px wide, the interface displays a menu button at the top to toggle the list.
You can click a map marker, or click a list item to see information from wikipedia about that park.
If you enter a string in the filter field and click filter, the page will show a list of parks that contain the filter text in the park name or park location. It will also filter the map markers according to the same results.

## Google Maps API
The google map API key used in this code is authorized to run from http://raphreyes.github.io/p5-map-project.
If you wish to host this site from your own URL you must replace the API key with your own that is authorized to run under your url.
The API key should be replaced in the index.html file at the bottom script tag in the url where it calls the google maps API.

## Wikipedia API
The wikipedia API will return a result based on the park name. The infowindow in the map will show a link to the wikipedia page and a snippet from the page.
The page will present a timeout message if there is no response within 5 seconds.

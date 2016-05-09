// setup variables for api and data
var mapParkList;
var map; 
var infowindow;
var marker;
var markerList = [];
var filteredMarks = [];
var bouncer;
var wikiAPI;
var ww = window.innerWidth;
var textUrl1 = '<div id ="infoContent" class="infocontent"><a href="http://en.wikipedia.org/wiki/';
var textUrl2 = '" target="_blank">';
var textUrl3 = '</a></div>';

// Define a park
var Park = function(data){    
    this.name = ko.observable(data.name);
    this.location = ko.observable(data.location);
    this.geo = ko.observable(data.geo);
}

// api data routine
var apiControl = {
	data: function(tmp){

		// set search url
		wikiAPI = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + tmp + '&srlimit=1&format=json&callback=?';

		$.ajax({
			url: wikiAPI,
			dataType: 'jsonp',
            jsonp: 'parks',
            timeout: 5000,
			success: function(data){
				
                // Clear any api previous error message
                $('#apiError').html('');

				// format the data
				apiTitle = data.query.search[0].title;
				apiSnip = data.query.search[0].snippet;
				infoA = textUrl1 + apiTitle + textUrl2 + apiTitle + textUrl3;
				infoB = '<div>' + apiSnip + ' [...]</div>';
                
				// Display the infowindow
				infowindow.open(map);
				
				// Place data into the infoWindow
				$('#infoBubble').html(infoA+infoB);

		},
        error: function(){
			$('#apiError').html('<div class="apierror"><p>Could not fetch wikipedia content</p></div>');
			$('#infoBubble').html('<div class="apierror"><p>Could not fetch wikipedia content</p></div>');
        }
		});
//        .error(function(data){
//			$('#apiError').html('<div class="apierror"><p>Could not fetch wikipedia content</p></div>');
//			$('#infoBubble').html('<div class="apierror"><p>Could not fetch wikipedia content</p></div>');
//			});
	}
};

// setup park data and list/filter control
var operator = function(){
	
    // define variables
	var self = this;
    self.filter = ko.observable('');
    self.parkList = ko.observableArray([]);
    self.filteredParks = ko.observableArray([]);
    mapParkList = self.parkList();
    
	initialParkData.forEach(function(parkItem){
		self.parkList.push( new Park(parkItem));
        self.filteredParks.push( new Park(parkItem));
	});
	
    // This will set selected park when user clicks a park in the list
    self.changePark = function(park){

    	self.currentPark(park);

        // show the infowindow
        mapControl.infoWindow(park);

   	}

    // Set the initial selected park to the first park
	self.currentPark = ko.observable(this.parkList()[0]);

    // Create filtered park list
    self.makeList = function(data){

        var getList = ko.utils.arrayFilter(self.parkList(), function(input){
            var searchName = (
                self.filter().length == 0 ||
                input.name().toLowerCase().indexOf(self.filter().toLowerCase()) > -1
            )
            var searchLoc = (
                self.filter().length == 0 ||
                input.location().toLowerCase().indexOf(self.filter().toLowerCase()) > -1
            )

            return searchName + searchLoc;
        });

        self.filteredParks(getList);
    }

    
    
    
    //self.filterCheck = function(){
    //    console.log('checking');
    //    visibleList = self.filteredParks();
    //}



    
    // http://www.codeproject.com/Articles/822879/Searching-filtering-and-sorting-with-KnockoutJS-in    
    //self.filteredParks = (function(){
    //
    //    return ko.utils.arrayFilter(self.parkList(), function(input){
    //        var searchName = (
    //            self.filter().length == 0 ||
    //            input.name().toLowerCase().indexOf(self.filter().toLowerCase()) > -1
    //        )
    //
    //        var searchLoc = (
    //            self.filter().length == 0 ||
    //            input.location().toLowerCase().indexOf(self.filter().toLowerCase()) > -1
    //        )
    //
    //    return searchName + searchLoc;
    //
    //    });
    //});

};

ko.applyBindings(new operator());

// map setup - control
var mapControl = {
	init: function(){

        // define some initial variables and layouts
		var bounds = new google.maps.LatLngBounds();
		var position, geoloc; // remove vars from loops
		var mapDiv = document.getElementById('map');
		var infoString = '<div id="infobubble" class="infobubble"><p>Welcome to the 20 Best Entertainment Parks of North America</p><p>Click on a marker or list item</p></div>';
		var center = {lat: 36.797, lng: -98.684}; // Kansas

		// set dimensions
		ww = window.innerWidth;
		var mapWidth = mapControl.mapWidth(ww);
		var mapHeight = window.innerHeight - $('#title').innerHeight();
        var listHeight = mapHeight - $('#form').innerHeight();
		$('#map').attr('height', mapHeight);
		$('#map').attr('width', mapWidth);
        $('#control').attr('height', mapHeight);
        $('#list').attr('height', listHeight);
		// display the map. Our prefered zoom level is 4.
		map = new google.maps.Map(mapDiv, {
			center: center,
			zoom: 4,
            disableDefaultUI: true
		});

		// Define an infowindow
		infowindow = new google.maps.InfoWindow({
			content: infoString,
			maxWidth: 300,
			pixelOffset: new google.maps.Size(0, -24),
			position: center
		});

		// show welcome message
		infowindow.open(map);

		// loop - set the markers
 		$.each(mapParkList, function(geo){
 			geoloc = mapParkList[geo].geo();
			position = new google.maps.LatLng(geoloc);
			bounds.extend(position);

		marker = new google.maps.Marker({
			position: position,
			map: map,
            title: mapParkList[geo].name() + ', ' + mapParkList[geo].location()
			});
			// add the marker to markerList array
			markerList.push(marker);

		// show info window when a marker is clicked
		marker.addListener('click', function(){
			var geoCheck = this.getPosition();
			mapControl.getPark(geoCheck.lat());
			});
		});

		// setup event listener to close info windows
		// when any click occurs in map div outside of infowindow
        map.addListener('click', function(){
            infowindow.close(map);
        })
		
		// Frame all the markers visibly
		map.fitBounds(bounds);

	},
	infoWindow: function(park){

		// define variables
		var infoString = '<div id="infoBubble" class="infobubble">Loading...</div>';
		infowindow.setContent(infoString);
		var position = park.geo();
		var parkName = park.name();

        // Clear any displayed api error message bnner.
        $('#apiError').html('');
        
		// fetch data from wikipedia api
		apiControl.data(parkName);

		// identify the marker
		$.each(markerList, function(mark){
			if(markerList[mark].position.lat() == position.lat){
				bouncer = markerList[mark];
			}
		});

		// Position infowindow and content, show marker and set specific zoom level.
		infowindow.setPosition(position);
		map.panTo(position);
		//map.setZoom(4);

		// bounce the marker 3 sec., then set all markers animation null.
		mapControl.bounce(bouncer);

	},
	mapWidth: function(w){
		// if browser screen is less than 640
		if(w <=640){
			return w;
		} else {
			return Math.round(.66 * w);
			}
	},
	getPark: function(coord){
		// Get the park data and show infowindow
		$.each(mapParkList, function(park){
			if(mapParkList[park].geo().lat == coord){
				// pass this park to the infowindow and display
				mapControl.infoWindow(mapParkList[park]);
			}
		});
	},
	bounce: function(m){
        // First, stop all marker animation else we'll have previous markers bouncing
        // if click on next marker happens before the next marker is clicked.
        $.each(markerList, function(mark){
        markerList[mark].setAnimation(google.maps.Animation.NULL);	
        });
		
		// Bounce the correct marker
		m.setAnimation(google.maps.Animation.BOUNCE);

		// Stop it after 3 seconds
		setTimeout(function(){
            m.setAnimation(google.maps.Animation.NULL);	
			}, 3000);

	},
    filter: function(){
    	
    	// close InfoWindow when we process markers
    	infowindow.close(map);
    	
        // get filter input value
        var filterInput = $('#input').val();
        var resultHide = [];
        
        // filter for result of markers
        var resultShow = $.grep(markerList, function (park) {
                return park.title.toLowerCase().indexOf(filterInput.toLowerCase()) > -1;
            });

        var resultHide = $.grep(markerList, function (park) {
                return park.title.toLowerCase().indexOf(filterInput.toLowerCase()) > -1;
            }, true);

        // do hide show markers
        mapControl.show(resultShow);
        mapControl.hide(resultHide);

        // Frame locations
        filteredMarks = resultShow;
        mapControl.frameAll();

    },
    show: function(mrk){
        // show marker mrk
        $.each(mrk, function(marker){
            mrk[marker].setVisible(true);
        });
    },
    hide: function(mrk){
        // hide marker mrk
        $.each(mrk, function(marker){
            mrk[marker].setVisible(false);
        });
    },
    frameAll: function(){
        var bounds = new google.maps.LatLngBounds();
        var geoloc = {lat:'',lng:''};
        
        if (filteredMarks.length == 0) {
        	return;
        }

        $.each(filteredMarks, function(geo){
 			geoloc.lat = filteredMarks[geo].position.lat();
            geoloc.lng = filteredMarks[geo].position.lng();
            position = new google.maps.LatLng(geoloc);
			bounds.extend(position);
        });
        map.fitBounds(bounds);
    },
    menu: function(){
        var contr = $('#control').innerWidth();
        var check = ($('#control').attr('style'));

        // Hide or show list-filter 
        if (typeof check == 'undefined' || check == 'transform: translateX(0px)'){
            $('#control').attr('style' , 'transform: translateX(-'+contr+'px)');    
        } else {
            $('#control').attr('style' , 'transform: translateX(0px)');
        }

    }
};
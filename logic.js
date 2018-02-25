// Mapbox access token-
// pk.eyJ1IjoicHRlbmRvbGthcjEiLCJhIjoiY2pkaGp5OWdnMGN3azJxbzZkYndzcnI3MCJ9.L8dGyzsply287nDFOyqTYg

// data chosen - https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

//To create geoJSON object and add it to a map, use the code:
// L.geoJSON(geojsonFeature).addTo(map);

// var geojsonFeature = {   //geojsonFeature format
//   "type": "Feature",
//   "properties": {
//       "name": "Coors Field",
//       "amenity": "Baseball Stadium",
//       "popupContent": "This is where the Rockies play!"
//   },
//   "geometry": {
//       "type": "Point",
//       "coordinates": [-104.99404, 39.75621]
//   }
// };

function getColor(d) {
  return d > 5  ? '#BD0026' :
        d > 4  ? '#E31A1C' :
        d > 3  ? '#FC4E2A' :
        d > 2   ? '#FD8D3C' :
        d > 1   ? '#FEB24C' :
        d > 0   ? '#FED976' :
                    '#FFEDA0';
}

// Store our API endpoint inside earthquakeURL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform/execute a GET request to the earthquakeURL
d3.json(earthquakeURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

earthquakeData = [];
//--------------------------------------------------------------------------------------
function createFeatures(earthquakeData) {  //CREATE LAYER WITH POPUP INFO FOR ALL FEATURES.
  earthquakeData = earthquakeData;
  //console.log("Inside createFeatures.  earthquakeData = ", earthquakeData)
  // Define a function we want to run once for each feature in the features array

  // GIVE EACH FEATURE A POPUP describing the place and time of the earthquake
  function onEachFeature(feature, layer) {    // Function Definition 
    // console.log("Inside onEachFeature.  feature = ", feature);
    // console.log("Inside onEachFeature.  layer = ", layer);
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  } // For magnitude - feature.properties.mag -Earthquakes with higher magnitudes should appear larger and darker in color.
    // Create a legend that will provide context for your map data.

  // Create a GeoJSON layer containing the features array on the earthquakeData object, which 
  // is the data.features object from the URL.
  // Run the onEachFeature function once for each piece of data in the array
  

  function style(feature) {
    return {
        fillColor: getColor(feature.properties.mag),
        weight: 0.5,
        opacity: 1,
        color: '#BD0026',
        //dashArray: '3',
        fillOpacity: 0.7
    };
  }

  var geojsonMarkerOptions = {
    radius: 20,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      radius = feature.properties.mag
      geojsonMarkerOptions.radius = radius * 6;
      newMarker = L.circleMarker(latlng, geojsonMarkerOptions);
      // console.log ("geojsonMarkerOptions.radius = ", geojsonMarkerOptions.radius);
      // console.log("feature=", feature);
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    style: style
  }); //Now earthquakes layer holds popup info for all features.

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}
//----------------------------------------------------------------------------------------
function createMap(earthquakes) {
//console.log("earthquakes =", earthquakes)

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes  //'earthquakes' layer holds popup info for all features.
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  ////ADD LEGEND////
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5], 
          labels = ["Magnitude 0 to <1","Magnitude 1 to <2","Magnitude 2 to <3","Magnitude 3 to <4","Magnitude 4 to <5","Magnitude 5+"];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              labels[i] + '<br>';
              //grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);
}
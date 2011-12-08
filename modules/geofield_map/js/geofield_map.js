(function ($) {
  Drupal.behaviors.geofieldMap = {
    attach: function(context) {
      var settings = Drupal.settings.geofieldMap;

      $('.geofieldMap:not(.processed)').each(function(index, element) {
        var data = undefined;
        var map_settings = [];
        var pointCount = 0;

        for (var i in settings) {
          if (settings[i].map_id == $(element).attr('id')) {
            data = settings[i].data;
            map_settings = settings[i].map_settings;
            break;
          }
        }

        if (data != undefined) {
          var features = GeoJSON(data);

          // controltype
          var controltype = map_settings.controltype;
          if (controltype == 'default') { controltype = google.maps.ZoomControlStyle.DEFAULT; }
          else if (controltype == 'small') { controltype = google.maps.ZoomControlStyle.SMALL; }
          else if (controltype == 'large') { controltype = google.maps.ZoomControlStyle.LARGE; }
          else { controltype = false }

          // map type
          var maptype = map_settings.maptype;
          if (maptype) {
            if (maptype == 'map' && map_settings.baselayers_map) { maptype = google.maps.MapTypeId.ROADMAP; }
            if (maptype == 'satellite' && map_settings.baselayers_satellite) { maptype = google.maps.MapTypeId.SATELLITE; }
            if (maptype == 'hybrid' && map_settings.baselayers_hybrid) { maptype = google.maps.MapTypeId.HYBRID; }
            if (maptype == 'physical' && map_settings.baselayers_physical) { maptype = google.maps.MapTypeId.TERRAIN; }
          }
          else { maptype = google.maps.MapTypeId.ROADMAP; }

          // menu type
          var mtc = map_settings.mtc;
          if (mtc == 'standard') { mtc = google.maps.MapTypeControlStyle.HORIZONTAL_BAR; }
          else if (mtc == 'menu' ) { mtc = google.maps.MapTypeControlStyle.DROPDOWN_MENU; }
          else { mtc = false; }

          var myOptions = {
            zoom: parseInt(map_settings.zoom),
            mapTypeId: maptype,
            mapTypeControl: (mtc ? true : false),
            mapTypeControlOptions: {style: mtc},
            zoomControl: ((controltype !== false) ? true : false),
            zoomControlOptions: {style: controltype},
            panControl: (map_settings.pancontrol ? true : false),
            scrollwheel: (map_settings.scrollwheel ? true : false),
            draggable: (map_settings.draggable ? true : false),
            overviewMapControl: (map_settings.overview ? true : false),
            overviewMapControlOptions: {opened: (map_settings.overview_opened ? true : false)},
            streetViewControl: (map_settings.streetview_show ? true : false),
            scaleControl: (map_settings.scale ? true : false),
            scaleControlOptions: {style: google.maps.ScaleControlStyle.DEFAULT}
          };

          var map = new google.maps.Map(document.getElementById($(element).attr('id')), myOptions);

          var range = new google.maps.LatLngBounds();

          var infowindow = new google.maps.InfoWindow({
            content: ''
          });

          if (features.getPath || features.getPosition) {
            features.setMap(map);
            if (features.getPosition) {
              map.setCenter(features.getPosition());
            } else {
              var path = features.getPath();
              path.forEach(function(element) {
                range.extend(element);
              });
              map.fitBounds(range);
            }
          } else {
            for (var i in features) {
              features[i].setMap(map);
              if (features[i].getPosition) {
                range.extend(features[i].getPosition());
              } else {
                var path = features[i].getPath();
                path.forEach(function(element) {
                  range.extend(element);
                });
              }
            }
            map.fitBounds(range);
          }
        }

        $(element).addClass('processed');
      });
    }
  }
})(jQuery);

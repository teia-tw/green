
/**
 * @file
 * getlocations_gps.js
 * @author Bob Hutchinson http://drupal.org/user/52366
 * @copyright GNU GPL
 *
 * Javascript functions for getlocations_gps module for Drupal 7
 */

(function ($) {
  Drupal.getlocations_gps = {};
  Drupal.getlocations_gps.dolocation = function(key, settings) {
    active_throbber(key);
    $("#getlocations_gps_lat_" + key).html('');
    $("#getlocations_gps_lon_" + key).html('');
    var gps_marker = Drupal.getlocations.getIcon(settings.gps_marker);
    var gps_marker_title = settings.gps_marker_title;
    var gps_bubble = settings.gps_bubble;
    var gps_geocode = settings.gps_geocode;
    var gps_center = settings.gps_center;
    var gs = Drupal.getlocations_settings[key];
    var accuracies = [];
    accuracies['APPROXIMATE'] = Drupal.t('Approximate');
    accuracies['GEOMETRIC_CENTER'] = Drupal.t('Center');
    accuracies['RANGE_INTERPOLATED'] = Drupal.t('Interpolated');
    accuracies['ROOFTOP'] = Drupal.t('Exact');
    gs.markdone = gps_marker;
    var result = [];
    result['lat'] = '';
    result['lon'] = '';
    gps_in_dom(key, '', '');
    result['formatted_address'] = '';
    gs.markeraction = 0;
    gs.useLink = false;
    gs.useCustomContent = false;
    Drupal.getlocations_gps.marker = Drupal.getlocations_gps.marker || [];
    if (Drupal.getlocations_gps.marker[key] !== undefined) {
      Drupal.getlocations_gps.marker[key].setMap();
      Drupal.getlocations_gps.marker = [];
    }
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          result['lat'] = position.coords.latitude;
          result['lon'] = position.coords.longitude;
          var p = new google.maps.LatLng(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
          if (gps_geocode) {
            // start geocoder
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': p}, function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                result['formatted_address'] = results[0].formatted_address;
                result['lat'] = results[0].geometry.location.lat();
                result['lon'] = results[0].geometry.location.lng();
                gps_in_dom(key, result['lat'], result['lon']);
                var customContent = '';

                if (gps_bubble) {
                  customContent = '<div class="location vcard">';
                  customContent += '<h4>' + gps_marker_title + '</h4>';
                  customContent += '<div class="adr">' + result['formatted_address'].replace(/[,]/g, ',<br />');
                  if (results[0].geometry.location_type) {
                    customContent += '<br />' + Drupal.t('Accuracy') + ' : ' + accuracies[results[0].geometry.location_type];
                  }
                  customContent += '</div></div>';
                  gs.useCustomContent = true;
                  gs.useInfoBubble = (Drupal.settings.getlocations[key].markeraction == 2 ? true : false);
                  gs.markeraction = (Drupal.settings.getlocations[key].markeraction == 2 ? 2 : 1);
                }

                var ll = new google.maps.LatLng(parseFloat(result['lat']), parseFloat(result['lon']));
                Drupal.getlocations_gps.marker[key] = Drupal.getlocations.makeMarker(Drupal.getlocations_map[key], gs, result['lat'], result['lon'], 0, gps_marker_title, '', customContent, '', key);
                //Drupal.getlocations_gps.marker[key].setVisible(true);
                if (gps_center) {
                  Drupal.getlocations_map[key].setCenter(ll);
                }
                //gps_in_dom(key, result['lat'], result['lon']);
                // getlocations_search
                if (typeof(Drupal.getlocations_search) !== 'undefined') {
                  var mapid2 = key.replace("_", "-");
                  var distance = $("#edit-getlocations-search-distance-" + mapid2).val();
                  var units = $("#edit-getlocations-search-units-" + mapid2).val();
                  var type = $("#edit-getlocations-search-type-" + mapid2).val();
                  var limits = $("#edit-getlocations-search-limits-" + mapid2).val();
                  var accuracy = accuracies[results[0].geometry.location_type];
                  var address = result['formatted_address'];
                  Drupal.getlocations_search.getlocations_search_clear_results(key, gs);
                  Drupal.getlocations_search.getlocations_search_get_data(result['lat'], result['lon'], distance, units, type, limits, accuracy, address, gs, Drupal.getlocations_map[key], key);
                }
                deactive_throbber(key);
              }
              else {
                deactive_throbber(key);
                var prm = {'!b': Drupal.getlocations.getGeoErrCode(status) };
                var msg = Drupal.t('Geocode was not successful for the following reason: !b', prm);
                alert(msg);
              }
            });
          }
          else {
            gps_in_dom(key, result['lat'], result['lon']);
            // no geocode done
            if (Drupal.getlocations_gps.marker[key] !== undefined) {
              Drupal.getlocations_gps.marker[key].setPosition(p);
            }
            else {
              Drupal.getlocations_gps.marker[key] = Drupal.getlocations.makeMarker(Drupal.getlocations_map[key], gs, result['lat'], result['lon'], 0, gps_marker_title, '', '', '', key);
              //Drupal.getlocations_gps.marker[key].setVisible(true);
            }
            if (gps_center) {
              Drupal.getlocations_map[key].setCenter(p);
            }
            deactive_throbber(key);
            //gps_in_dom(key, result['lat'], result['lon']);
          }
        },
        function(error) {
          deactive_throbber(key);
          msg = Drupal.t("Sorry, I couldn't find your location using the browser") + ' ' + Drupal.getlocations.geolocationErrorMessages(error) + ".";
          alert(msg);
        },
        {
          maximumAge:10000
        }
      ); // end getCurrentPosition
    } // end if navigator
    else {
      msg = Drupal.t('Sorry, no browser navigator available.');
      alert(msg);
    }

    // functions
    function deactive_throbber(k) {
      $("#getlocations_gps_throbber_" + k, ".getlocations_gps_throbber").removeClass('getlocations_gps_throbber_active').addClass('getlocations_gps_throbber_inactive');
    }
    function active_throbber(k) {
      $("#getlocations_gps_throbber_" + k, ".getlocations_gps_throbber").removeClass('getlocations_gps_throbber_inactive').addClass('getlocations_gps_throbber_active');
    }

    function gps_in_dom(k, lat, lon) {
      if (! $("#getlocations_gps_lat_" + k).is('div')) {
        var lladd = '<div class="js-hide" id="getlocations_gps_lat_' + k + '"></div><div class="js-hide" id="getlocations_gps_lon_' + k + '"></div>';
        $("#getlocations_map_wrapper_" + k).append(lladd);
      }
      if (lat && lon) {
        $("#getlocations_gps_lat_" + k).html(lat);
        $("#getlocations_gps_lon_" + k).html(lon);
        if ($("#edit-distance-latitude").is('input')) {
          $("#edit-distance-latitude").val(lat);
          $("#edit-distance-longitude").val(lon);
        }
      }
    }
    // end functions
  };

  Drupal.behaviors.getlocations_gps = {
    attach: function (context, settings) {

      // doh
      if (typeof(settings.getlocations_gps == 'undefined')) {
        return;
      }

      $(".getlocations_map_canvas", context).once('getlocations-gps-map-processed', function(index, element) {
        var elemID = $(element).attr('id');
        var key = elemID.replace(/^getlocations_map_canvas_/, '');
        // is there really a map?
        if ($("#getlocations_map_canvas_" + key).is('div') && settings.getlocations_gps[key] !== undefined ) {
          var lladd = '<div class="js-hide" id="getlocations_gps_lat_' + key + '"></div><div class="js-hide" id="getlocations_gps_lon_' + key + '"></div>';
          $("#getlocations_map_wrapper_" + key).append(lladd);
          // gps button
          $("#getlocations_gps_show_" + key).click( function() {
            var s = {
              gps_marker: settings.getlocations_gps[key].gps_marker,
              gps_marker_title: settings.getlocations_gps[key].gps_marker_title,
              gps_bubble: settings.getlocations_gps[key].gps_bubble,
              gps_geocode: settings.getlocations_gps[key].gps_geocode,
              gps_center: settings.getlocations_gps[key]. gps_center
            };
            Drupal.getlocations_gps.dolocation(key, s);
          }); // end button click
        } //  end is there really a map?
      }); // end once
    } // end attach
  }; // end behaviors
}(jQuery));

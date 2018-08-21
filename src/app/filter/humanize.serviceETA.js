angular.module('searchApp')
  .filter('humanizeServiceETA', ['constants', function(constants) {
      return function(lob, etaObj, tzone, flag) {
          var msg = "";
          if (lob === 'rolloff' || lob === 'commercial') {
              switch (etaObj.reason_code) {
                  case 'ComputedETA':
                      var from_cust_tz = moment.utc(etaObj.from, 'HH:mm:ss:SSS').tz(tzone.zoneName);
                      var to_cust_tz = moment.utc(etaObj.to, 'HH:mm:ss:SSS').tz(tzone.zoneName);
                      msg = 'Your estimated pickup time is between ' + moment(from_cust_tz).format('h:mma') + ' to ' +
                          moment(to_cust_tz).format('h:mma') + ' ' + tzone.abbreviation +
                          '. However, times may vary so please have your items available for pick up between midnight and 6pm.';
                      if (flag === "truck-on-map") {
                          msg = 'Between ' + moment(from_cust_tz).format('h:mma') + ' and ' +
                              moment(to_cust_tz).format('h:mma') + ' ' + tzone.abbreviation;
                      }
                      break;
                  case 'MissingCustLat/Long':
                      // fallthrough
                  case 'RouteNotSequenced':
                      msg = 'You are scheduled for pickup today. Times may vary so please have your items available for pick up between midnight and 6pm.';
                      if (flag === "truck-on-map") {
                          msg = "End of day today.";
                      }
                      break;
                  case 'DownTimeStartedByDriver':
                      // fallthrough
                  case 'ConfirmStopNotFound':
                      // fallthrough
                  case 'RouteNotStarted':
                      msg = 'Service in your area is expected to begin later today. Please check back in a few hours as schedules are updated on a regular basis.';
                      if (flag === "truck-on-map") {
                          msg = "End of day today.";
                      }
                      break;
                  case 'AlreadyServiced':
                      var serviced_date_time_cust_tz = moment.utc(etaObj.serviced_date_time).tz(tzone.zoneName);
                      msg = 'Your pickup was completed at - ' + moment(serviced_date_time_cust_tz).format('h:mma') + ' ' + tzone.abbreviation + '.';
                      if (flag === "truck-on-map") {
                          msg = moment(serviced_date_time_cust_tz).format('h:mma') + ' ' + tzone.abbreviation + '.';
                      }
                      break;
                  default:
                      msg = 'Sorry, we are unable to process your request at this time.';
                      if (flag === "truck-on-map") {
                          msg = "Currently unavailable.";
                      }
                      break;
              }
          } else if (lob === 'residential') {
              switch (etaObj.reason_code) {
                  case 'ComputedETA':
                      // fallthrough
                  case 'MissingCustLat/Long':
                      // fallthrough
                  case 'RouteNotSequenced':
                      msg = 'You are scheduled for pickup today.';
                      if (flag === "truck-on-map") {
                          msg = "End of day today.";
                      }
                      break;
                  case 'DownTimeStartedByDriver':
                      // fallthrough
                  case 'ConfirmStopNotFound':
                      // fallthrough
                  case 'RouteNotStarted':
                      msg = 'Service in your area is expected to begin later today.';
                      if (flag === "truck-on-map") {
                          msg = "End of day today.";
                      }
                      break;
                  case 'AlreadyServiced':
                      msg = 'Your pickup was completed today.';
                      // if (flag === "truck-on-map") {
                      //     msg = "Already serviced.";
                      // }
                      break;
                  default:
                      msg = 'Sorry, we are unable to process your request at this time.';
                      if (flag === "truck-on-map") {
                          msg = "Currently unavailable";
                      }
                      break;
              }
          } else {
              msg = constants.whitespace; // space
          }

          return msg;
      };

  }]);

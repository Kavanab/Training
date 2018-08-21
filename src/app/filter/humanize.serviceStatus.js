angular.module('searchApp')
  .filter('humanizeServiceStatus', function() {
      return function(serviceStatus, lob, exceptionCode, forCSS) {
          var humanized = "";
          if (!!serviceStatus) {
              if(!forCSS){
                  if (serviceStatus == "Confirmed Positive" && lob == "residential" && resiNegativeException(exceptionCode)) {
                      humanized = "was not able to be serviced.";
                  } else if (serviceStatus == "Confirmed Positive") {
                      humanized = "was sucessfully serviced.";
                  } else if (serviceStatus == "Confirmed Negative") {
                      humanized = "was not able to be serviced.";
                  } else if (serviceStatus == "Confirmed Incomplete") {
                      humanized = "was partially serviced.";
                  }
              } else {
                  if (serviceStatus == "Confirmed Positive" && lob == "residential" && resiNegativeException(exceptionCode)) {
                      humanized = "status-failed";
                  } else if (serviceStatus == "Confirmed Positive") {
                      humanized = "status-success";
                  } else if (serviceStatus == "Confirmed Negative") {
                      humanized = "status-failed";
                  } else if (serviceStatus == "Confirmed Incomplete") {
                      humanized = "status-failed";
                  } else if (serviceStatus == "Planned") {
                      humanized = "status-planned";
                  } else if (serviceStatus == "In Progress") {
                      humanized = "status-planned";
                  } else if(serviceStatus == "--"){
                      humanized = "status-planned";
                  }
              }
          }
          return humanized;
      };

      function resiNegativeException(exceptionCode) {
          // returns true if exception code should display as negative confirmed with service icon and text
          var resiNegativeException = false;
          switch (exceptionCode) {
              case 'Not Out / Container Empty':
                  // fallthrough
              //case 'Misc Other Stuff':
                  // fallthrough
              //case 'Stuff':
                  resiNegativeException = true;
                  break;
              default:
                  resiNegativeException = false;
                  break;
          }
          return resiNegativeException;
      }
  });

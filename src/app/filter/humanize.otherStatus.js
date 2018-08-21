angular.module('searchApp')
  .filter('humanizeOtherStatus', function() {
      return function(status, type, forCSS) {
          var humanized = "";
          if (!!status && type === 'case') {
              if(!forCSS){
                  // to be added
              } else {
                  if (status.toUpperCase() === "CLOSED") {
                      humanized = "closed";
                  } else if (status.toUpperCase() !== "CLOSED") {
                      humanized = "open";
                  }
              }
          }
          else if (!!status && type === 'ticket') {
              if(!forCSS){
                  // to be added
              } else {
                  if (status.toUpperCase() === "CLOSED") {
                      humanized = "closed";
                  } else if (status.toUpperCase() !== "CLOSED") {
                      humanized = "open";
                  }
              }
          }
          return humanized;
      };
  });

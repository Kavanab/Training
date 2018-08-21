angular.module('searchApp')
    .filter('howLongAgo', ['Moments', function(Moments) {
        return function(timestamp, timezone) {
            return Moments.getHowLongAgo(timestamp, timezone).replace('few seconds', 'sec').replace('1 sec', 'Today').replace('in 1 sec', 'Today');
        };

    }]);

angular.module('searchApp')
    .filter('prettyTimeStamp', ['constants', function(constants) {
        return function(timestamp, timezone, dateOrTime) {
            // By passing a 2nd parameter of either 'date' or 'time', one apply this filter to display just the date or just the time with and without the time zone.
            // Not passing any value to dateOrTime will default to displaying both date and time.

            var theDateTime = moment(timestamp);
            if (!!timezone) {
                theDateTime = theDateTime.tz(timezone);
            }
            if (!!timestamp && !timezone && !dateOrTime) {
                return theDateTime.format("dddd MMMM Do YYYY [at] h:mma");
            } else if (!!timestamp && !!timezone && !dateOrTime) {
                return theDateTime.format("dddd MMMM Do YYYY [at] h:mma ") + theDateTime.tz(timezone).zoneAbbr();
            } else if (!!timestamp && !timezone && dateOrTime === 'time') {
                return theDateTime.format("h:mma");
            } else if (!!timestamp && !!timezone && dateOrTime === 'time') {
                return theDateTime.format("h:mma ") + theDateTime.tz(timezone).zoneAbbr();
            } else if (!!timestamp && !timezone && dateOrTime === 'date') {
                return theDateTime.format("dddd MMMM Do YYYY");
            } else if (!!timestamp && !!timezone && dateOrTime === 'date') {
                return theDateTime.format("dddd MMMM Do YYYY ") + theDateTime.tz(timezone).zoneAbbr();
            } else if (!!timestamp && !timezone && dateOrTime === 'datewithoutTime') {
                return theDateTime.format("dddd[, ]MMMM Do[, ]YYYY");
            } else if (!!timestamp && !timezone && dateOrTime === 'medium-date') {
                return theDateTime.format("MMMM Do, YYYY");
            } else if (!!timestamp && !!timezone && dateOrTime === 'medium-date') {
                return theDateTime.format("MMMM Do, YYYY ") + theDateTime.tz(timezone).zoneAbbr();
            } else {
                return constants.whitespace;
            }
        };
    }]);

angular.module('searchApp')
    .filter('prettyTimeStamp2', ['constants', function(constants) {
        return function(timestamp, timezone, dateOrTime) {
            // By passing a 2nd parameter of either 'date' or 'time', one apply this filter to display just the date or just the time with and without the time zone.
            // Not passing any value to dateOrTime will default to displaying both date and time.
            var theDateTime = moment(timestamp);
            if (!!timezone) {
                theDateTime = theDateTime.tz(timezone);
            }
            if (!!timestamp && !timezone && !dateOrTime) {
                return theDateTime.format("M/D/YYYY [at] h:mm a");
            } else if (!!timestamp && !!timezone && !dateOrTime) {
                return theDateTime.format("M/D/YYYY [at] h:mm a ") + theDateTime.tz(timezone).zoneAbbr();
            } else if (!!timestamp && !timezone && dateOrTime === 'date') {
                return theDateTime.format("M/D/YYYY ");
            } else if (!!timestamp && !!timezone && dateOrTime === 'date') {
                return theDateTime.format("M/D/YYYY ") + theDateTime.tz(timezone).zoneAbbr();
            } else {
                return constants.whitespace;
            }
        };
    }]);

angular.module('searchApp')
    .filter('abbreviateDayOfWeek', [function() {
        return function(day) {
            var abbr = day;
            switch (day) {
                case "SUNDAY":
                    abbr = "Su";
                    break;
                case "MONDAY":
                    abbr = "Mo";
                    break;
                case "TUESDAY":
                    abbr = "Tu";
                    break;
                case "WEDNESDAY":
                    abbr = "We";
                    break;
                case "THURSDAY":
                    abbr = "Th";
                    break;
                case "FRIDAY":
                    abbr = "Fr";
                    break;
                case "SATURDAY":
                    abbr = "Sa";
                    break;
            }
            return abbr;
        };
    }]);
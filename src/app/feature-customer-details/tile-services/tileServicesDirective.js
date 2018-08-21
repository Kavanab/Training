angular.module('searchApp.customer.overview.tileServices', [])
    .directive("tileServices", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/tile-services.html",
            replace: true,
            controller: function() {}, //'ActivityFeedController',
            link: function(scope, element, attrs) {
                // scope.$on('servicesLoaded', function() {
                    // setTimeout(function() {

                        // $('.services-list').flowtype({
                        //     fontRatio: 600,
                        //     minFont: 13,
                        //     maxFont: 22
                        //         // minimum   : 1200,
                        //         // maximum   : 1900
                        // });

                        // $('.services-list .title').flowtype({
                        //     fontRatio: 600,
                        //     minFont: 12
                        //         // minimum   : 1200,
                        //         // maximum   : 1900
                        // });
                        // $('.services-list .icon-wm-font').flowtype({
                        //     fontRatio: 6000,
                        //     minFont: 12,
                        //     // minimum   : 1200,
                        //     // maximum   : 1900
                        // });
                        // $('.services-list .frequency').flowtype({
                        //     minFont: 4,
                        //     maxFont: 120,
                        //     fontRatio: 400
                        // });
                    // }, 0, false);
                // });

            }
        };
    });

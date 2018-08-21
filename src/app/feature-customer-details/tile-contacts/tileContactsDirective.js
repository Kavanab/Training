angular.module('searchApp.customer.overview.tileContacts', [])
    .directive("tileContacts", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/tile-contacts.html",
            replace: true,
            controller: function() {},
            link: function(scope, element, attrs) {
                // scope.$on('servicesLoaded', function() {
                //     setTimeout(function() {
                //         $('.tile-contacts').flowtype({
                //             fontRatio: 2600,
                //             minFont: 3,
                //             maxFont: 22
                //                 // minimum   : 1200,
                //                 // maximum   : 1900
                //         });
                //     });
                // });
            }
        };
    });

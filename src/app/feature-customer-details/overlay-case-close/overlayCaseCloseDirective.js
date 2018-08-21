angular.module('searchApp.customer.overview.overlayCaseClose', [])
    .directive("overlayCaseClose", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-case-close.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();

            }
        };
    });

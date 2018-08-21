angular.module('searchApp.customer.overview.overlayServicesInfo', [])
    .directive("overlayServicesInfo", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-services-info.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();
                
            }
        };
    });
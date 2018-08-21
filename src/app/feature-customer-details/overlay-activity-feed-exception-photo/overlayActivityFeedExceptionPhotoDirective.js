angular.module('searchApp.customer.overview.overlayActivityFeedExceptionPhoto', [])
    .directive("overlayActivityFeedExceptionPhoto", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-activity-feed-exception-photo.html",
            replace: true,
            controller: function(){},
            link: function(scope, element, attrs) {
                // scope.bindTabs();
            }
        };
    });

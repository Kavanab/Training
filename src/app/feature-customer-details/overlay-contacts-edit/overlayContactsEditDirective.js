angular.module('searchApp.customer.overview.overlayContactsEdit', [])
    .directive("overlayContactsEdit", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-contacts-edit.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();
                
            }
        };
    });
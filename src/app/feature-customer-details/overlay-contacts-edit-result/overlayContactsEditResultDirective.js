angular.module('searchApp.customer.overview.overlayContactsEditResult', [])
    .directive("overlayContactsEditResult", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-contacts-edit-result.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();
                
            }
        };
    });
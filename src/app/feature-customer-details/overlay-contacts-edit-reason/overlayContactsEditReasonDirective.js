angular.module('searchApp.customer.overview.overlayContactsEditReason', [])
    .directive("overlayContactsEditReason", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-contacts-edit-reason.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();
                
            }
        };
    });
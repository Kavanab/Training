angular.module('searchApp.customer.overview.overlayContactsEditConfirm', [])
    .directive("overlayContactsEditConfirm", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-contacts-edit-confirm.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();
                
            }
        };
    });
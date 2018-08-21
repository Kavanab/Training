angular.module('searchApp.customer.overview.overlayNoteEditResult', [])
    .directive("overlayNoteEditResult", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-note-edit-result.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();

            }
        };
    });

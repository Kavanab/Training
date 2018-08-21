angular.module('searchApp.customer.overview.overlayNoteEdit', [])
    .directive("overlayNoteEdit", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-note-edit.html",
            replace: true,
            controller: function(){},//'ActivityFeedController',
            link: function(scope, element, attrs) {
                scope.bindTabs();

            }
        };
    });

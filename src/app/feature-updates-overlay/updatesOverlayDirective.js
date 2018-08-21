//search related directives

angular.module('searchApp.updatesOverlay')
    .directive("updatesOverlay", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/updates-overlay.html",
            replace: true,
            controller: 'UpdatesOverlayController',
            link: function(scope, element, attrs) {
                $(element).on('click', '.toggle-timestamp', function(e) {
                    $('.timestamp').toggleClass('relative');
                });
            }
        };
    });

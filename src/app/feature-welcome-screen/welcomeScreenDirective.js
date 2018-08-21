//search related directives

angular.module('searchApp')
    .directive("welcomeScreen", ['$localStorage', '$rootScope', function($localStorage, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: "partial/welcome-screen.html",
            replace: true,
            link: function(scope, element, attrs) {

                // show login overlay if user has never seen it before
                if (!$localStorage.hasSeenLoginOverlay) {
                    setTimeout(function(){
                      $rootScope.showLoginOverlay = true;
                      $localStorage.hasSeenLoginOverlay = true;
                    }, 1000);
                }
            }
        };
    }]);

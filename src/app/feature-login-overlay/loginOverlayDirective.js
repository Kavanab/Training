//search related directives

angular.module('searchApp.loginOverlay')
  .directive("loginOverlay", function() {
    return {
      restrict: 'E',
      templateUrl: "partial/login-overlay.html",
      replace: true,
      controller: 'LoginOverlayController',
    };
});
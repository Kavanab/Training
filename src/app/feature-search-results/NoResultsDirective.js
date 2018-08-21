// Allow 'debugger' statements
/*jshint -W087 */
angular.module('searchApp')
.directive("noSearchResults", [ '$routeParams', function($routeParams) {
  return {
    restrict: 'E',
    templateUrl: "partial/no-search-results.html",
    replace: true,
    controller: "NoResultsController",
    link: function(scope, element, attrs){
      // scope.initSetup();     
    }
    // expecting a results instance on a parent element
    // require: ['^results']
  };
}]);
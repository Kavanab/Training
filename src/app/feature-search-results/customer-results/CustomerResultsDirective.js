// Allow 'debugger' statements
/*jshint -W087 */
angular.module('searchApp.searchResults.customerResults')
.directive("customerCardList", [ '$routeParams', '$log', function($routeParams, $log) {
  return {
    restrict: 'E',
    templateUrl: "partial/customer-card-list.html",
    replace: true,
    controller: "CustomerSearchResultsController",
    link: function(scope, element, attrs){
      scope.$parent.initSetup();    
      $log.debug('[DIRECTIVE LINK] searchApp.searchResults.customerResults.customerCardList');
      $log.debug('calling scope.$parent.initSetup(): ',scope.$parent.initSetup);
    }
    // expecting a results instance on a parent element
    // require: ['^results']
  };
}]);
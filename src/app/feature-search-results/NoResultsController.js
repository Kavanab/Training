angular.module('searchApp.searchResults.noResults', [])
    .controller('NoResultsController', ['$scope', 'serverLog', function($scope,serverLog) {
        // serverLog.send({'results': 0, 'query': $scope.$parent.inputSearch});
    }]);

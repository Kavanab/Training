angular.module('searchApp.searchResults.customerResults', [])
    .controller('CustomerSearchResultsController', ['$scope', '$rootScope', 'serverLog', '$state', 'customerData', 'constants', function($scope, $rootScope, serverLog, $state, customerData, constants) {

        $scope.thisScopeIs = 'CustomerSearchResultsController';

        $scope.logSelectedResult = _.debounce(function(data) {
            serverLog.send({
                'query': $scope.inputSearch,
                'resultSelected': data,
            });
        }, 500, true);


        $scope.getField = function(data, field) {
            var customer = data._source.customer;
            return customerData.getField(customer, field);
        };

        $scope.viewCustomerCard = function(data) {

            var custid = $scope.getField(data, 'ezPayId');
            var state = $state;
            // $rootScope.viewingCustomer = true;
            // $rootScope.currentCustomer = data;
            setTimeout(function() {
                $rootScope.currentCustomer = data;
                state.go('app.customer.overview', {
                    "custid": custid,
                    "customer": data
                });
                // $rootScope.viewingCustomer = true;
            }, 4);
            return true;
        };


        $scope.getEmail = function(data) {
            return (data._source.customer.serviceContact.email || constants.whitespace); // \000 is a space
        };
    }]);
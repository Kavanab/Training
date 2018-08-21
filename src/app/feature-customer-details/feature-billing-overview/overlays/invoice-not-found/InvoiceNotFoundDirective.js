angular.module('searchApp.billing.overview.billingDetails')
    .directive('invoiceNotFound', function () {
        return {
            restrict: 'E',
            templateUrl: 'partial/invoice-not-found.html',
            replace: true,
            controller: 'BillingDetailsController',
            link: function (scope, element, attrs) {
                scope.closeSorryOverlay = function () {
                    scope.$emit('reveal', {
                        'id': 'overlay-invoice-not-found',
                        'action': "close",
                        'clickedID': ""
                    });
                };
            }
        };
    });
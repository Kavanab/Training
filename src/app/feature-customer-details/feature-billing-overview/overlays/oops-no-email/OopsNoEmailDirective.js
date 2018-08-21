angular.module('searchApp.billing.overview.billingDetails')
    .directive('oopsNoEmail', function () {
        return {
            restrict: 'E',
            templateUrl: 'partial/oops-no-email.html',
            replace: true,
            controller: 'BillingDetailsController',
            link: function (scope, element, attrs) {
                scope.closeOopsOverlay = function () {
                    scope.$emit('reveal', {
                        'id': 'overlay-oops-email',
                        'action': "close",
                        'clickedID': ""
                    });
                };
            }
        };
    });
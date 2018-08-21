angular.module('searchApp.billing.overview.billingCart')
    .directive('billingCart', function () {
        return {
            restrict: 'E',
            templateUrl: "partial/billing-cart.html",
            replace: true,
            controller: 'BillingCartController',
            link: function (scope, element, attrs) {

            }
        };
    });
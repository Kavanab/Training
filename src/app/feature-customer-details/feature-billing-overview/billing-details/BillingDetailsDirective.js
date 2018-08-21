angular.module('searchApp.billing.overview.billingDetails')
    .directive('billingDetails', function () {
        return {
            restrict: 'E',
            templateUrl: "partial/billing-details.html",
            replace: true,
            controller: 'BillingDetailsController',
            link: function (scope, element, attrs) {

            }
        };
    });
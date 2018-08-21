angular.module('searchApp.billing.overview.billingSummary')
    .directive('billingSummary', function () {
        return {
            restrict: 'E',
            templateUrl: "partial/billing-summary.html",
            replace: true,
            controller: 'BillingSummaryController',
            link: function (scope, element, attrs) {

            }
        };
    });
angular.module('searchApp.billing.overview.overlayPdfInvoice', [])
    .directive("overlayPdfInvoice", function () {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-pdf-invoice.html",
            replace: true,
            controller: 'BillingDetailsController',
            link: function (scope, element, attrs) {}
        };
    });
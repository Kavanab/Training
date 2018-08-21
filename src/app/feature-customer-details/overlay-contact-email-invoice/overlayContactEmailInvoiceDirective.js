angular.module('searchApp.customer.overview.overlayContactEmailInvoice', [])
    .directive("overlayContactEmailInvoice", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-contact-email-invoice.html",
            replace: true,
            controller:'BillingDetailsController',
            link: function(scope, element, attrs) {
                scope.bindTabs();

            }
        };
    });

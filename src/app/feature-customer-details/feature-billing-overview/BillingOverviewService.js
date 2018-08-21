angular.module('searchApp.customer.overview.billingOverview')
    .service('billingService', function () {

        var billingSummary = {},
            billingDetail = {},
            languageDetail = {};

        var setBillingSummary = function (newObj) {
            billingSummary = newObj;
        };

        var getBillingSummary = function () {
            return billingSummary;
        };

        var setBillingDetail = function (newObj) {
            billingDetail = newObj;
        };

        var getBillingDetail = function () {
            return billingDetail;
        };

        var setLanguageDetail = function (newObj) {
            languageDetail = newObj;

        };

        var getLanguageDetail = function () {
            return languageDetail;
        };


        return {
            setBillingSummary: setBillingSummary,
            getBillingSummary: getBillingSummary,
            setBillingDetail: setBillingDetail,
            getBillingDetail: getBillingDetail,
            setLanguageDetail: setLanguageDetail,
            getLanguageDetail: getLanguageDetail

        };

    });

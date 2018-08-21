angular.module('searchApp.customer.overview.billingOverview', ['angular-timeline'])
    .controller('BillingOverviewController', ['$scope', '$stateParams', 'Customer', 'billingService', 'accountData','serverLog',
        function ($scope, $stateParams, Customer, billingService, accountData,serverLog) {
            // console.log('Inside ----> BillingOverviewController');

            $scope.NO_AGING_AND_INVOICE_HISTORY_DATA_FLAG = false;
            $scope.INVOICE_HISTORY_MONTHS_INCREMENTOR = 6; // 6 months for now, can be configured
            $scope.INVOICE_HISTORY_MAXIMUM_MONTHS = 24; // Currently invoices displayed for past 2 years ONLY
            $scope.IS_AGING_DATA_FIRST_CALL_FLAG = true;
            $scope.IS_THIS_SUB_ACCOUNT_FLAG = false;
            $scope.MASTER_ACCOUNT_PATH = '';
            $scope.MASTER_ACCOUNT_NAME = '';

            if (accountData.isSubAccount) {
                $scope.IS_THIS_SUB_ACCOUNT_FLAG = true;
                $scope.MASTER_ACCOUNT_NAME = accountData.masterAccountName;
                $scope.MASTER_ACCOUNT_PATH = window.location.origin + '/customer/' + accountData.masterAccountId + '/billing';
            }

            var DF = 'YYYY-MM-DD'; // Date Format used for Invoice History API Call
            var CONST_INCREMENTOR = 6;

            $scope.dateRange = {
                toDate: moment().format(DF),
                fromDate: moment().subtract($scope.INVOICE_HISTORY_MONTHS_INCREMENTOR, 'months').format(DF)
            };

            $scope.fetchInvoices = function () {
                var ezPayId = $stateParams.custid;
                var getInvoices = Customer.Invoices.invoiceHistory(parseInt(ezPayId), $scope.dateRange.fromDate, $scope.dateRange.toDate).get({
                    'ezPayId': parseInt(ezPayId)
                });

                // console.log('fetchInvoices ()');
                // console.log('From Date: ---> ' + $scope.dateRange.fromDate);
                // console.log('To Date: -----> ' + $scope.dateRange.toDate);

                getInvoices.$promise.then(function (data) {

                    if ($scope.IS_AGING_DATA_FIRST_CALL_FLAG) {
                        // BillingSummaryController
                        if (data.balances !== undefined && Array.isArray(data.balances) && data.balances.length > 0) {
                            billingService.setBillingSummary(data);
                            $scope.$broadcast('AGING_DETAILS_LOADED', true);
                        } else {
                            $scope.$broadcast('AGING_DETAILS_LOADED', false);
                        }
                        // Flag turned off, Aging data will never update again with
                        // every Invoice History API call
                        $scope.IS_AGING_DATA_FIRST_CALL_FLAG = false;

                        serverLog.send({
                            'isBillingInfoPageVisited': true
                        });
                    }

                    // BillingDetailController
                    if (data.invoices !== undefined && Array.isArray(data.invoices) && data.invoices.length > 0) {
                        billingService.setBillingDetail(data);
                        $scope.$broadcast('INVOICE_HISTORY_LOADED', true);
                    } else {
                        $scope.$broadcast('INVOICE_HISTORY_LOADED', false);
                    }

                    serverLog.send({
                        'isInvoiceHistoryFetched': true,
                        'result': '[REST] Billing history successfull'
                        // 'data': data
                    });

                }).catch(function (error) {
                    if ($scope.IS_AGING_DATA_FIRST_CALL_FLAG) {
                        serverLog.send({
                            'isBillingInfoPageVisited': true,
                            'data': error
                        });
                    }
                    serverLog.send({
                        'isInvoiceHistoryFetched': false,
                        'result': '[REST] Billing history failed',
                        'data': error
                    });
                    if (error && (error.status === 500 || error.status === 503)) {
                        // Have to set the flag on various other conditions and status codes
                        $scope.NO_AGING_AND_INVOICE_HISTORY_DATA_FLAG = true;
                    }
                });
            };



            console.log("BillingOverviewController - isSubAccount - " + accountData.isSubAccount);
            if (!accountData.isSubAccount) {
                // Init Call with 6 months
                $scope.fetchInvoices();

            } else {
                $scope.NO_AGING_AND_INVOICE_HISTORY_DATA_FLAG = true;
            }

            $scope.$watch(function (scope) {
                return accountData.isSubAccount;
            }, function () {
                if (accountData.isSubAccount) {
                    $scope.IS_THIS_SUB_ACCOUNT_FLAG = true;
                    $scope.NO_AGING_AND_INVOICE_HISTORY_DATA_FLAG = true;
                    $scope.MASTER_ACCOUNT_NAME = accountData.masterAccountName;
                    $scope.MASTER_ACCOUNT_PATH = window.location.origin + '/customer/' + accountData.masterAccountId + '/billing';
                    console.log("BillingOverviewController - isSubAccount - " + accountData.isSubAccount);
                }
            });

            // Make one more subsequent API call and try to fetch Invoices here
            $scope.$on('TRY_LOADING_INVOICES_ONCE_MORE', function (event, data) {
                $scope.getMoreInvoices();
            });

            // Subsequent Calls
            $scope.getMoreInvoices = function () {
                if ($scope.INVOICE_HISTORY_MONTHS_INCREMENTOR <= $scope.INVOICE_HISTORY_MAXIMUM_MONTHS) {
                    if ($scope.INVOICE_HISTORY_MONTHS_INCREMENTOR !== $scope.INVOICE_HISTORY_MAXIMUM_MONTHS) {
                        $scope.INVOICE_HISTORY_MONTHS_INCREMENTOR += 6;
                        $scope.dateRange.toDate = moment($scope.dateRange.toDate, DF).subtract(1, 'days').subtract(CONST_INCREMENTOR, 'months').format(DF);
                        $scope.dateRange.fromDate = moment($scope.dateRange.fromDate, DF).subtract(1, 'days').subtract(CONST_INCREMENTOR, 'months').format(DF);
                        $scope.fetchInvoices();
                    }
                }
            };
        }
    ]);

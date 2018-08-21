angular.module('searchApp.billing.overview.billingSummary', ['angular-timeline'])
    .controller('BillingSummaryController', ['$scope', 'billingService', function ($scope, billingService) {

        // console.log('Inside ----> BillingSummaryController');

        $scope.accountSummary = [];
        $scope.loading_account_summary = 'Loading Account Summary';

        $scope.$on('AGING_DETAILS_LOADED', function (event, isThereAnyData) {
            if (isThereAnyData) {
                $scope.accountSummary = [];
                normalizeData(billingService.getBillingSummary(), 'BILLING_SUMMARY');
            } else {
                $scope.loading_account_summary = 'Sorry. No Account Summary data found for this Customer.';
            }
        });

        function normalizeData(data, type) {
            switch (type) {
                case 'BILLING_SUMMARY':
                    {
                        if (Array.isArray(data.balances) && data.balances.length > 0) {
                            _.each(data.balances, function (value) {
                                if (value.type === 'Current') {
                                    $scope.accountSummary.push({
                                        description: 'Current',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()

                                    });
                                }
                                if (value.type === '30Day') {
                                    $scope.accountSummary.push({
                                        description: '30 Days',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()
                                    });
                                }
                                if (value.type === '60Day') {
                                    $scope.accountSummary.push({
                                        description: '60 Days',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()
                                    });
                                }
                                if (value.type === '90Day') {
                                    $scope.accountSummary.push({
                                        description: '90 Days',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()
                                    });
                                }
                                if (value.type === '120Day') {
                                    $scope.accountSummary.push({
                                        description: '120 Days',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()
                                    });
                                }
                                if (value.type === 'Total') {
                                    $scope.accountSummary.push({
                                        description: 'Total Due',
                                        amount: Number(value.amount),
                                        symbol: data.currency.trim()
                                    });
                                }
                            });
                            $scope.MAX_AGING_DATA = _.max($scope.accountSummary, 'amount').amount;
                        }
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

    }]);
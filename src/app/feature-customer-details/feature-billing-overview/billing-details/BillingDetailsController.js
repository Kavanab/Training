angular.module('searchApp.billing.overview.billingDetails', ['angular-timeline'])
    .controller('BillingDetailsController', ['$scope', 'billingService', '$localStorage', '$sce', '$window', 'constants', '$stateParams', '$timeout', 'serverLog', 'Customer',
        function ($scope, billingService, $localStorage, $sce, $window, constants, $stateParams, $timeout, serverLog, Customer) {

            // console.log('Inside ----> BillingDetailsController');

            $scope.invoiceHistoryArray = [];
            $scope.invoiceDetailsArray = {};
            $scope.isInvoiceHistoryLoading = true;
            $scope.isInvoiceHistoryDetailsLoading = {};
            $scope.invoiceHistoryMoreButtonFlag = {};

            $scope.toggleTimeStamp = true;
            $scope.toggleDueField = true;

            $scope.invoice_due_terms = 'SEE INVOICE FOR DETAILS';
            $scope.invoiceDetailsCoulmns = ['Date', 'Service Description', 'Unit Cost', 'Quantity', 'Cost'];

            var PDF_VIEW_SETTINGS = [
                'view=FitH',
                'toolbar=0',
                'statusbar=0',
                'messages=0',
                'navpanes=0'
            ].join('&');

            $scope.$on('INVOICE_HISTORY_LOADED', function (event, isThereAnyData) {
                if (isThereAnyData) {
                    normalizeData(billingService.getBillingDetail(), 'BILLING_DETAIL');
                } else {
                    // Make one more subsequent API call and try to fetch Invoices here
                    if ($scope.invoiceHistoryArray.length === 0) {
                        $scope.$emit('TRY_LOADING_INVOICES_ONCE_MORE');
                    }
                    $scope.isInvoiceHistoryLoading = false;
                }
            });

            function normalizeData(data, type) {
                switch (type) {
                    case 'BILLING_DETAIL':
                        {
                            if (Array.isArray(data.invoices) && data.invoices.length > 0) {

                                // Sort by "Most Recent First" Order - Ascending
                                var latestInvoicesFirst = _.sortBy(data.invoices, function (object) {
                                    return new moment(object.date).format('YYYYMMDD');
                                }).reverse();

                                // For Descending Order -- .reverse();
                                _.each(latestInvoicesFirst, function (value, key) {
                                    if (value.id !== 'Unapply') {

                                        var thisData = value,
                                            RR_DONNELLEY_ID = '';

                                        thisData.uniqueID = '_' + Math.random().toString(36).substr(2, 9);
                                        thisData.timeStamp = moment(value.date + ' 06:00').format('dddd, MMMM Do YYYY, hh:mm A');
                                        thisData.howLongAgo = moment(value.date + ' 06:00').fromNow();
                                        thisData.date = moment(value.date).format('MM/DD/YYYY');
                                        thisData.symbol = data.currency.trim();

                                        // DUE_DATE is 'Upon Receipt' if invoice API doesn't return
                                        thisData.due_date = value.due_date === undefined ? 'Upon Receipt' : value.due_date;

                                        if (value.payment_info !== undefined) {
                                            thisData.payment_info.date = moment(value.payment_info.date).format('MM/DD/YYYY');
                                        }

                                        $scope.invoiceHistoryMoreButtonFlag[thisData.uniqueID] = true;
                                        $scope.isInvoiceHistoryDetailsLoading[thisData.uniqueID] = false;
                                        $scope.invoiceDetailsArray[thisData.uniqueID] = {};

                                        var isDueDateAString = thisData.due_date.indexOf('Upon') !== -1 ? true : false;

                                        if (!isDueDateAString) {
                                            // Due Date is a REAL-DATE
                                            thisData.canToggleDueField = false;
                                            thisData.due_date = moment(thisData.due_date).format('MM/DD/YYYY');
                                            thisData.due_date_howLongAgo = moment(thisData.due_date + ' 06:00').fromNow();
                                            thisData.lateFeeAssessment = moment(thisData.due_date).diff(thisData.date, 'days');
                                        } else {
                                            // Due Date is a Upon Receipt
                                            thisData.canToggleDueField = true;
                                            thisData.due_date_howLongAgo = moment(thisData.date + ' 06:00').fromNow();
                                            thisData.lateFeeAssessment = moment().diff(thisData.date, 'days');
                                        }

                                        if (thisData.metadata) {
                                            RR_DONNELLEY_ID = thisData.metadata.rrdonnelley_id.trim();
                                            if (RR_DONNELLEY_ID !== '') {
                                                thisData.pdfInvoiceURL = constants.pdfInvoiceBaseUrl + RR_DONNELLEY_ID;
                                                console.log('RR_DONNELLEY_ID ---> ' + RR_DONNELLEY_ID);
                                                if (thisData.symbol == 'CAD') {
                                                    thisData.pdfInvoiceURL = constants.pdfInvoiceBaseUrlCananda + RR_DONNELLEY_ID;
                                                }
                                            }
                                        }

                                        if (thisData.id !== 'Unapply' && thisData.due_date !== undefined) {

                                            var statusInfo = {
                                                leftStatusColor: '',
                                                leftStatusMessage: '',
                                                rightStatusColor: '',
                                                rightStatusMessage: '',
                                                additionalLable: '',
                                                additionalValue: ''
                                            };

                                            /* Available Status/Colors

                                                Left Status Colors
                                                `l-paid` or `l-partial` or `l-unpaid`

                                                Left Status Messages
                                                `PAID` or `PARTIAL PAID` or `UNPAID`

                                                Right Status Colors
                                                `l-paid` (same for `l-ontime`) or `l-30days` or `l-60days` or `l-90days` or `l-120days`

                                                Right Status Messages
                                                `ON TIME` or `30+ DAYS LATE` or `60+ DAYS LATE` or `90+ DAYS LATE` or `120+ DAYS LATE`

                                            */

                                            // Left Status
                                            if (parseFloat(thisData.balance_amount) <= parseFloat(0.0)) {
                                                statusInfo.leftStatusMessage = 'PAID';
                                                statusInfo.leftStatusColor = 'l-paid';
                                            } else if (parseFloat(thisData.balance_amount) < parseFloat(thisData.amount)) {
                                                statusInfo.leftStatusMessage = 'PARTIAL PAID';
                                                statusInfo.leftStatusColor = 'l-partial';
                                            } else {
                                                statusInfo.leftStatusMessage = 'UNPAID';
                                                statusInfo.leftStatusColor = 'l-unpaid';
                                            }

                                            var DAYS_LATE = '',
                                                MESSAGE = ' DAYS LATE',
                                                GRACE_DAYS = 30;

                                            // Right Status
                                            if (statusInfo.leftStatusMessage !== 'PAID') {
                                                // Logic for UNPAID and PARTIAL PAID

                                                if (!isDueDateAString) {

                                                    // Due Date is a REAL-DATE
                                                    // DAYS_LATE = Today's Date - Due Date
                                                    DAYS_LATE = moment().diff(thisData.due_date, 'days');
                                                    console.log('[' + statusInfo.leftStatusMessage + '] & DAYS_LATE --> ' + DAYS_LATE);
                                                    statusInfo.rightStatusMessage = DAYS_LATE + MESSAGE;

                                                    if (DAYS_LATE > 90) {
                                                        statusInfo.rightStatusColor = 'l-120days'; // #A20303
                                                    } else if (DAYS_LATE > 60 && DAYS_LATE <= 90) {
                                                        statusInfo.rightStatusColor = 'l-90days'; // #FF0000
                                                    } else if (DAYS_LATE > 30 && DAYS_LATE <= 60) {
                                                        statusInfo.rightStatusColor = 'l-60days'; // #FF8900
                                                    } else if (DAYS_LATE > 0 && DAYS_LATE <= 30) {
                                                        statusInfo.rightStatusColor = 'l-30days'; // #FFE200
                                                    } else {
                                                        statusInfo.rightStatusMessage = 'ON TIME';
                                                        statusInfo.rightStatusColor = 'l-paid'; // #BDE2B5
                                                    }

                                                } else if (isDueDateAString) {

                                                    // Due Date is a Upon Receipt
                                                    // DAYS_LATE = Today's Date - (Invoice Date + Grace Days)
                                                    DAYS_LATE = moment().diff(moment(thisData.date).add(30, 'days'), 'days');
                                                    console.log('[' + statusInfo.leftStatusMessage + '] & DAYS_LATE --> ' + DAYS_LATE);
                                                    statusInfo.rightStatusMessage = DAYS_LATE + MESSAGE;


                                                    if (DAYS_LATE > 90) {
                                                        statusInfo.rightStatusColor = 'l-120days'; // #A20303
                                                    } else if (DAYS_LATE > 60 && DAYS_LATE <= 90) {
                                                        statusInfo.rightStatusColor = 'l-90days'; // #FF0000
                                                    } else if (DAYS_LATE > 30 && DAYS_LATE <= 60) {
                                                        statusInfo.rightStatusColor = 'l-60days'; // #FF8900
                                                    } else if (DAYS_LATE > 0 && DAYS_LATE <= 30) {
                                                        statusInfo.rightStatusColor = 'l-30days'; // #FFE200
                                                    } else {
                                                        statusInfo.rightStatusMessage = 'ON TIME';
                                                        statusInfo.rightStatusColor = 'l-paid'; // #BDE2B5
                                                    }

                                                }

                                                // Additional Lable and Value Valculations
                                                statusInfo.additionalLable = 'DAYS ELAPSED';
                                                // Today - Invoice Date
                                                statusInfo.additionalValue = moment().diff(thisData.date, 'days') + ' DAYS';

                                            } else if (statusInfo.leftStatusMessage === 'PAID') {

                                                if (!isDueDateAString) {

                                                    // Due Date is a REAL-DATE
                                                    // DAYS_LATE = Payment Date - Due Date
                                                    DAYS_LATE = moment(thisData.payment_info.date).diff(thisData.due_date, 'days');
                                                    console.log('[' + statusInfo.leftStatusMessage + '] & DAYS_LATE --> ' + DAYS_LATE);
                                                    statusInfo.rightStatusMessage = DAYS_LATE + MESSAGE;


                                                    if (DAYS_LATE > 90) {
                                                        statusInfo.rightStatusColor = 'l-120days'; // #A20303
                                                    } else if (DAYS_LATE > 60 && DAYS_LATE <= 90) {
                                                        statusInfo.rightStatusColor = 'l-90days'; // #FF0000
                                                    } else if (DAYS_LATE > 30 && DAYS_LATE <= 60) {
                                                        statusInfo.rightStatusColor = 'l-60days'; // #FF8900
                                                    } else if (DAYS_LATE > 0 && DAYS_LATE <= 30) {
                                                        statusInfo.rightStatusColor = 'l-30days'; // #FFE200
                                                    } else {
                                                        statusInfo.rightStatusMessage = 'ON TIME';
                                                        statusInfo.rightStatusColor = 'l-paid'; // #BDE2B5
                                                    }

                                                } else if (isDueDateAString) {

                                                    // Due Date is a Upon Receipt
                                                    // DAYS_LATE = Payment Date - (Invoice Date + Grace Days)
                                                    DAYS_LATE = moment(thisData.payment_info.date).diff(moment(thisData.date).add(30, 'days'), 'days');
                                                    console.log('[' + statusInfo.leftStatusMessage + '] & DAYS_LATE --> ' + DAYS_LATE);
                                                    statusInfo.rightStatusMessage = DAYS_LATE + MESSAGE;

                                                    if (DAYS_LATE > 90) {
                                                        statusInfo.rightStatusColor = 'l-120days'; // #A20303
                                                    } else if (DAYS_LATE > 60 && DAYS_LATE <= 90) {
                                                        statusInfo.rightStatusColor = 'l-90days'; // #FF0000
                                                    } else if (DAYS_LATE > 30 && DAYS_LATE <= 60) {
                                                        statusInfo.rightStatusColor = 'l-60days'; // #FF8900
                                                    } else if (DAYS_LATE > 0 && DAYS_LATE <= 30) {
                                                        statusInfo.rightStatusColor = 'l-30days'; // #FFE200
                                                    } else {
                                                        statusInfo.rightStatusMessage = 'ON TIME';
                                                        statusInfo.rightStatusColor = 'l-paid'; // #BDE2B5
                                                    }

                                                }

                                                // Additional Lable and Value Valculations
                                                statusInfo.additionalLable = 'PAID IN';
                                                var PAYMENT_TO_INVOICE_DIFF = moment(thisData.payment_info.date).diff(thisData.date, 'days');
                                                if (PAYMENT_TO_INVOICE_DIFF < 0) {
                                                    statusInfo.additionalValue = 'SAME DAY';
                                                }
                                                statusInfo.additionalValue = PAYMENT_TO_INVOICE_DIFF + ' DAYS';

                                            }
                                            thisData.statusInfo = statusInfo;
                                        }
                                        $scope.invoiceHistoryArray.push(thisData);
                                    }

                                });

                                $scope.invoiceHistoryArray = _.sortBy($scope.invoiceHistoryArray, function (object) {
                                    return new moment(object.date).format('YYYYMMDD');
                                }).reverse();

                                if ($scope.invoiceHistoryArray.length === 0) {
                                    $scope.$emit('TRY_LOADING_INVOICES_ONCE_MORE');
                                    $scope.isInvoiceHistoryLoading = false;
                                }

                            }

                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
            }

            $scope.showPDF = function (pdfInvoiceURL) {

                if (typeof $localStorage.loginInfo !== 'object') {
                    $scope.$emit('show-login-to-unlock-modal');
                } else {
                    $scope.pdfInvoiceURL = $sce.trustAsResourceUrl(pdfInvoiceURL + '#' + PDF_VIEW_SETTINGS);
                    $scope.$emit('PDF_INVOICE_LOADED', $scope.pdfInvoiceURL);
                    $scope.$emit('reveal', {
                        'id': 'overlay-pdf-invoice',
                        'action': "open",
                        'clickedID': ""
                    });
                    serverLog.send({
                        'isViewInvoicePDFSuccessful': true,
                        'result': '[REST] PDF present for view.',
                        'data': pdfInvoiceURL
                    });
                }
            };

            $scope.showEmailInvoice = function (eventArr) {
                $scope.sendEmailmodal.isListShowing = false;
                if (typeof $localStorage.loginInfo !== 'object') {
                    $scope.$emit('show-login-to-unlock-modal');
                } else {
                    $scope.$emit('EMAIL_INVOICE_LOADED', eventArr);
                    $scope.$emit('reveal', {
                        'id': 'overlay-contact-email-invoice',
                        'action': "open",
                        'clickedID': ""
                    });
                }
            };

            $scope.invoiceNotFoundOverlayOpen = function () {
                $scope.$emit('reveal', {
                    'id': 'overlay-invoice-not-found',
                    'action': "open",
                    'clickedID': ""
                });
            };
            $scope.emailNotFoundOverlay = function () {
                $scope.$emit('reveal', {
                    'id': 'overlay-oops-email',
                    'action': "open",
                    'clickedID': ""
                });
            };

            $scope.appWindow = angular.element($window);
            $scope.appWindow.bind('resize', function () {
                if ($window.innerWidth <= 1024 || $window.innerHeight <= 550) {
                    $scope.$emit('reveal', {
                        'id': 'overlay-information-message',
                        'action': "open",
                        'clickedID': ""
                    });
                } else {
                    $scope.$emit('reveal', {
                        'id': 'overlay-information-message',
                        'action': "close",
                        'clickedID': ""
                    });
                }
            });

            $scope.toggleTimelineTimestamp = function () {
                if ($scope.toggleTimeStamp) {
                    $scope.toggleTimeStamp = false;
                } else if (!$scope.toggleTimeStamp) {
                    $scope.toggleTimeStamp = true;
                }
            };

            $scope.showInvoiceDetails = function (invoice) {
                $scope.invoiceHistoryMoreButtonFlag[invoice.uniqueID] = false;

                if (Object.keys($scope.invoiceDetailsArray[invoice.uniqueID]).length === 0) {
                    // Line Items Data NOT_FOUND for this Invoice
                    // Fetch from API

                    $scope.isInvoiceHistoryDetailsLoading[invoice.uniqueID] = true;

                    var ezPayId = parseInt($stateParams.custid),
                        invoiceId = parseInt(invoice.id),
                        getInvoiceDetails = Customer.InvoiceDetails.lineItems().get({
                            'ezPayId': ezPayId,
                            'invoiceId': invoiceId
                        });
                    getInvoiceDetails.$promise.then(function (data) {
                        var lineItemsArray = data.invoice.details;
                        if (Array.isArray(lineItemsArray) && lineItemsArray.length > 0) {

                            var recurringChargesTable = [],
                                oneTimeChargesTable = [];

                            _.each(lineItemsArray, function (lineItem, index) {
                                var oneLineItem = lineItem;
                                oneLineItem.date = moment(lineItem.date).format('MM/DD/YYYY');

                                if (lineItem.recurring && lineItem.recurring === 'true') {
                                    // The above field --> true/false is returned as type STRING not BOOLEAN
                                    recurringChargesTable.push(oneLineItem);
                                } else {
                                    oneTimeChargesTable.push(oneLineItem);
                                }
                            });

                            $scope.invoiceDetailsArray[invoice.uniqueID] = {
                                RC: recurringChargesTable,
                                OC: oneTimeChargesTable
                            };
                        } else {
                            // No Line Items FOUND for this Invoice
                        }
                        $scope.isInvoiceHistoryDetailsLoading[invoice.uniqueID] = false;
                    }).catch(function (error) {
                        if (error && (error.status === 500 || error.status === 503)) {
                            // Have to set the flag on various other conditions and status codes
                            $scope.isInvoiceHistoryDetailsLoading[invoice.uniqueID] = false;
                        }
                    });
                } else {
                    // Line Items Data FOUND for this Invoice
                    // Good to Display
                }
            };

            $scope.hideInvoiceDetails = function (invoice) {
                $scope.invoiceHistoryMoreButtonFlag[invoice.uniqueID] = true;
            };

            $scope.onToggleDueFieldClick = function () {
                $scope.toggleDueField = $scope.toggleDueField ? false : true;
            };

        }
    ]);
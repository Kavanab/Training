angular.module('searchApp.customer.overview.activityFeed', [])
    .controller("ActivityFeedController", [
        '$scope',
        '$rootScope',
        '$route',
        '$log',
        'serverLog',
        'Customer',
        'customerContract',
        '$sce',
        '$filter',
        'constants',
        'caseConfig',
        function(
            $scope,
            $rootScope,
            $route,
            $log,
            serverLog,
            Customer,
            customerContract,
            $sce,
            $filter,
            constants,
            caseConfig
        ) {

            $log.debug('[CONTROLLER] ActivityFeedController');
            $scope.thisScopeIs = 'ActivityFeedController';
            $scope.activityArrayLoadMoreStatus = 'loading';
            $scope.activityArrayLoadMoreCnt = 0;
            $scope.activityArrayLookbackMnthInc = 4;
            $scope.activityArrayLookbackMnthCnt = $scope.activityArrayLookbackMnthInc;
            $scope.activityArrayFromDate = moment().subtract($scope.activityArrayLookbackMnthCnt, 'months').format('YYYY-MM-DD');
            $scope.activityArrayToDate = moment().subtract(0, 'months').subtract(0, 'days').format('YYYY-MM-DD');
            //console.log("blahhhhhh::: "+$scope.activityArrayToDate);
            $scope.activityArrayDuration = moment.duration(moment($scope.activityArrayToDate).diff(moment($scope.activityArrayFromDate)));
            $scope.activityArrayDurationAsDays = Math.round($scope.activityArrayDuration.asDays());
            $scope.activityArray = [];
            $scope.activityTypesArray = [];
            $scope.activityArrayCharLimit = [];
            $scope.activityArrayExpanded = [];
            $scope.activityArrayLength = 0;
            $scope.baseCharLimit = 150;
            $scope.addToggle = false;

            var iniActivityArrayLookbackSettings = function() {
                $scope.activityArrayLoadMoreCnt = 0;
                $scope.activityArrayLookbackMnthInc = 4;
                $scope.activityArrayLookbackMnthCnt = $scope.activityArrayLookbackMnthInc;
                $scope.activityArrayFromDate = moment().subtract($scope.activityArrayLookbackMnthCnt, 'months').format('YYYY-MM-DD');
                $scope.activityArrayToDate = moment().subtract(0, 'months').subtract(0, 'days').format('YYYY-MM-DD');
                //console.log("iniActivityArrayLookbackSettings===>"+$scope.activityArrayToDate);
                $scope.activityArrayDuration = moment.duration(moment($scope.activityArrayToDate).diff(moment($scope.activityArrayFromDate)));
                $scope.activityArrayDurationAsDays = Math.round($scope.activityArrayDuration.asDays());
            };

            $scope.$on("mas-notes-added", function(e) {
                setTimeout(function() {
                    iniActivityArrayLookbackSettings();
                    $scope.clearActivityArray();
                    $scope.populate();
                    $route.reload();
                }, 5000);

            });

            $scope.$on("mas-case-closed", function(e) {
                setTimeout(function() {
                    iniActivityArrayLookbackSettings();
                    $scope.clearActivityArray();
                    $scope.populate();
                    $route.reload();
                }, 5000);

            });

            $scope.sendPhotoClick = function(index) {
                $scope.$emit("show-send-photo-modal", {
                    index: index,
                    $scope: $scope
                });
            };

            $scope.activity = {
                'all': {
                    'filter': true,
                },
                'emails': {
                    'loading': true,
                    'loadingMore': true,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'notes': {
                    'loading': true,
                    'loadingMore': true,
                    'delayNormalizeActivity': false,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'inquiries': {
                    'loading': true,
                    'loadingMore': true,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'tickets': {
                    'loading': true,
                    'loadingMore': true,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'cases': {
                    'loading': true,
                    'loadingMore': true,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'services': {
                    'loading': true,
                    'loadingMore': true,
                    'loadCount': 0,
                    'filter': false,
                    'activities': [],
                    // 'expanded': [],
                    // 'charLimit': []
                },
                'serviceExceptions': {
                    'loading': true,
                    'loadingMore': true,
                    'filter': false,
                    'activities': []
                        // 'expanded': [],
                        // 'charLimit': []
                }
            };

            _.each($scope.activity, function(val, key, list) {
                $scope.activityTypesArray.push(key);
            });
            $scope.activityTypesArray.shift(); //remove 'all' from the list

            // $scope.notesCharLimits = [];
            // $scope.loading = {
            //     'emails': true,
            //     'inquiries': true,
            //     'notes': true
            // };

            $scope.nothingForCurrentFilters = function() {
                var emptyActivityTypes = [];
                _.each($scope.activity, function(val, key, list) {
                    if (key !== 'all') {
                        if (!!val.filter && ($scope.activity[key].activities.length === 0) && !val.loading) {
                            emptyActivityTypes.push(key);
                        }
                    }
                });
                return emptyActivityTypes;
            };

            $scope.getTicket = function(unsortedIndex, ticketID) {
                ticketID = ticketID.trim();
                //only get ticket details if we haven't gotten them for this ticket yet
                if (!$scope.activityArray[unsortedIndex].details) {
                    var ezpayid = $scope.$parent.custData._id;
                    var lob = $scope.$parent.custData._source.customer.lob.toLowerCase();
                    // console.log();
                    var getTicket = Customer.Tickets.ticket(parseInt(ezpayid), ticketID, lob).get({
                        'ezPayId': parseInt(ezpayid),
                        'ticketId': ticketID
                    });

                    getTicket.$promise.then(function(data) {
                        $log.debug("[REST] loaded Ticket: ", data);
                        if (!!data.tickets) {

                            _.each($scope.activityArray, function(item, i) {
                                if (item.activityType === 'ticket') {
                                    if (item.id === ticketID) {
                                        item.lob = $scope.$parent.custData._source.customer.lob.toLowerCase();
                                        item.details = data.tickets[0]; //shove all the ticket details into the corresponding ticket in the activity feed
                                        var serviceCode;
                                        if (!!item.details.services_info && !!$scope.$parent.services) {
                                            item.details.prettyServiceName = customerContract.getPrettyServiceName($scope.$parent.services.all, item.details.services_info[0].code);
                                        }
                                        item.details.closed_date_time = moment(item.details.closed_date_time);
                                        item.details.created_date_time = moment(item.details.created_date_time);
                                        item.details.dispatch_date_time = moment(item.details.dispatch_date_time);


                                        if (item.details.closed_date_time.isValid()) {
                                            var nowMoment = moment(item.details.closed_date_time);
                                            var thenMoment;
                                            if (!!item.details.created_date_time.isValid()) {
                                                thenMoment = item.details.created_date_time;
                                            } else if (!!item.details.dispatch_date_time.isValid()) {
                                                thenMoment = item.details.dispatch_date_time;
                                            }
                                            if (!!thenMoment) {
                                                item.details.duration = moment.duration(nowMoment.diff(thenMoment)).humanize();
                                            }
                                        }

                                    }
                                }
                            });
                        } else {
                            // $scope.noNotesFound = true;
                        }

                    }).catch(function(error) {
                        $log.debug("[REST] loaded customer activity feed tickets ERROR ", error);
                        // $scope.noNotesFound = true;
                    }).finally(function() {
                        // $scope.activity.tickets.ticket.loading = false;
                        // $scope.loading.notes = false;
                    });

                }
            };

            $scope.getCase = function(unsortedIndex, caseId) {
                caseId = caseId.trim();
                //only get case details if we haven't gotten them for this ticket yet
                if (!$scope.activityArray[unsortedIndex].details) {

                    var ezpayid = $scope.$parent.custData._id;
                    var lob = $scope.$parent.custData._source.customer.lob.toLowerCase();
                    // console.log();
                    var getCase = Customer.Cases.case(parseInt(ezpayid), caseId, lob).get({
                        'ezPayId': parseInt(ezpayid),
                        'caseId': caseId
                    });

                    getCase.$promise.then(function(data) {
                        $log.debug("[REST] loaded Case: ", data);
                        if (!!data.cases) {

                            _.each($scope.activityArray, function(item, i) {
                                if (item.activityType === 'case') {
                                    if (item.id === caseId) {
                                        item.lob = $scope.$parent.custData._source.customer.lob.toLowerCase();

                                        var isclosable = (item.status === "ASSIGNED" || item.status === "NEW") && caseConfig.hasCaseCloseTemplate(item.category, item.sub_category);
                                        //var isclosable = caseConfig.hasCaseCloseTemplate(item.category, item.sub_category);
                                        item.isClosable = isclosable;

                                        item.details = data.cases; //shove all the ticket details into the corresponding ticket in the activity feed
                                        var serviceCode;
                                        if (!!item.details.services && item.details.services.length > 0 && item.details.services[0].code !== 'null' && !!$scope.$parent.services) {
                                            item.details.prettyServiceName = customerContract.getPrettyServiceName($scope.$parent.services.all, item.details.services[0].code);
                                        }
                                        item.details.requested_date_time = moment(item.details.requested_date_time);
                                        item.details.due_date_time = moment(item.details.due_date_time);
                                        // item.details.dispatch_date_time = moment(item.details.dispatch_date_time);


                                        if (!!item.details.closed_date_time && moment(item.details.closed_date_time).isValid()) {
                                            var nowMoment = moment(item.details.closed_date_time);
                                            var thenMoment;
                                            if (!!item.details.requested_date_time && moment(item.details.requested_date_time).isValid()) {
                                                thenMoment = moment(item.details.requested_date_time);
                                            }
                                            // else if (!!item.details.dispatch_date_time.isValid()) {
                                            //     thenMoment = item.details.dispatch_date_time;
                                            // }
                                            if (!!thenMoment) {
                                                item.details.duration = moment.duration(nowMoment.diff(thenMoment)).humanize();
                                            }
                                        }

                                    }
                                }
                            });
                        } else {
                            // $scope.noNotesFound = true;
                        }

                    }).catch(function(error) {
                        $log.debug("[REST] loaded customer activity feed tickets ERROR ", error);
                        // $scope.noNotesFound = true;
                    }).finally(function() {
                        // $scope.activity.tickets.ticket.loading = false;
                        // $scope.loading.notes = false;
                    });

                }
            };

            // $scope.sortNoteArray = function (ar) {
            //     ar.sort( function (x, y ){
            //         var n = y.created_date.localeCompare(x.created_date);
            //         if ( n !== 0) {
            //             return n;
            //         }
            //         return y.comment.toUpperCase().localeCompare(x.comment.toUpperCase());
            //     });
            //
            //     return ar;
            // };

            $scope.populateServiceExceptions = function(unsortedIndex, ezPayId, custorderNbr, custSvcNbr) {
                var isInputParamsOkay = ezPayId !== '' && custorderNbr !== '' && custSvcNbr !== '';
                if (isInputParamsOkay) {
                    var getServiceExceptions = Customer.Services.exceptions2(ezPayId, custorderNbr, custSvcNbr).get({
                        'ezPayId': parseInt(ezPayId)
                    });

                    getServiceExceptions.$promise.then(function(data) {
                        $log.debug("[REST] loaded service exceptions2: ", data);

                        var validExceptions = !!data.services.exceptions && data.services.exceptions.length > 0;
                        if (validExceptions) {
                            var item = $scope.activityArray[unsortedIndex];
                            item.exceptionData = data.services.exceptions;
                        } else {
                            $log.debug("[REST] loading service exception - no exceptions found");
                        }

                    }).catch(function(error) {
                        $log.debug("[REST] loading service exception ERROR ", error);
                    }).finally(function() {});
                }
            };

            $scope.populateETA = function(unsortedIndex, ezPayId, serviceId, lob, ticketNbr) {
                var isInputParamsOkay = ezPayId !== '' && serviceId !== '' && lob !== '';
                if (isInputParamsOkay) {
                    var getETA = Customer.Services.eta(ezPayId, serviceId, lob, ticketNbr).get({
                        'ezPayId': parseInt(ezPayId),
                        'serviceId': serviceId
                    });

                    getETA.$promise.then(function(data) {
                        $log.debug("[REST] loaded customer ETA: ", data);

                        var item = [];

                        var validETA = !!data.ETA;
                        if (validETA) {
                            item = $scope.activityArray[unsortedIndex];
                            item.eta = data.ETA[0]; // Assumes only 1 ETA can be returned ever
                            normalizeActivity(item, 'eta');

                        } else {
                            $log.debug("[REST] loading customer ETA - no ETA data returned");

                            // populate an invalid reason_code so that a message can be displayed to the user
                            // stating that an ETA could not be processed at this time
                            item = $scope.activityArray[unsortedIndex];
                            item.eta = { reason_code: 'APINoDataReturned' };
                            normalizeActivity(item, 'eta');

                        }

                    }).catch(function(error) {
                        $log.debug("[REST] loading customer ETA ERROR ", error);

                        // populate an invalid reason_code so that a message can be displayed to the user
                        // stating that an ETA could not be processed at this time
                        var item = $scope.activityArray[unsortedIndex];
                        item.eta = { reason_code: 'API500Error' };
                        normalizeActivity(item, 'eta');

                    }).finally(function() {});
                }
            };

            $scope.doCurrentFiltersHaveActivity = function() {
                var currentActivity = [];
                var currentFilters = [];
                var lengths = [];
                _.each($scope.activity, function(val, key, list) {
                    if (key !== 'all') {
                        lengths.push($scope.activity[key].activities.length);

                        if (!!val.filter && ($scope.activity[key].activities.length === 0) && !val.loading) {
                            currentActivity.push(key);
                        }
                        if (!!val.filter && !val.loading) {
                            currentFilters.push(key);
                        }

                    }
                });
                return (currentActivity.length === currentFilters.length) && (currentActivity.length !== 0); //{ "haveActivity": currentActivity, "activeFilters": currentFilters, "lengths": lengths};
            };

            $scope.noActivityFound = function() {
                var emails = (($scope.activity.emails.loading === false) && ($scope.activity.emails.activities.length === 0));
                var notes = (($scope.activity.notes.loading === false) && ($scope.activity.notes.activities.length === 0));
                var inquiries = (($scope.activity.inquiries.loading === false) && ($scope.activity.inquiries.activities.length === 0));
                var tickets = (($scope.activity.tickets.loading === false) && ($scope.activity.tickets.activities.length === 0));
                var cases = (($scope.activity.cases.loading === false) && ($scope.activity.cases.activities.length === 0));
                var services = (($scope.activity.services.loading === false) && ($scope.activity.services.activities.length === 0));
                var all = emails && notes && inquiries && tickets && cases && services;
                return {
                    'all': all,
                    'emails': emails,
                    'notes': notes,
                    'inquiries': inquiries,
                    'tickets': tickets,
                    'cases': cases,
                    'services': services
                };
            };

            $scope.updateCharLimit = function(index, limit) {
                // $scope.notesCharLimits[index] = limit;
                $scope.activityArrayCharLimit[index] = limit;
                if (limit === $scope.baseCharLimit) {
                    $scope.activityArrayExpanded[index].primary = false;
                } else {
                    $scope.activityArrayExpanded[index].primary = true;
                }
            };

            $scope.toggleExpand = function(index, activityType, toggle) {
                $scope.activityArrayExpanded[index].primary = toggle;

                if (!!toggle && (activityType === 'service')) {
                    var item = $scope.activityArray[index];
                    var ezpayid = $scope.$parent.custData._id;

                    // exceptions
                    var hasExceptions = !!item && (item.exception_reason_code !== '--');
                    if (hasExceptions) {
                        var custorderNbr = item.wm_metadata.customer_order_number;
                        var custSvcNbr = item.wm_metadata.customer_service_number;
                        $scope.populateServiceExceptions(index, ezpayid, custorderNbr, custSvcNbr);
                    }

                    // Populate ETA if planned for today
                    // use ordered_date instead of planned_date since ordered_date represents the actual scheduled service date
                    if (item.status === 'Planned' || item.status === 'In Progress') {
                        var orderDate = moment(item.ordered_date).toDate();
                        var todayDate = moment().startOf('day').toDate();
                        var todayPlan = !!item && (orderDate.getTime() === todayDate.getTime());

                        if (todayPlan) {
                            var serviceId = item.id;
                            var lob = item.line_of_business;
                            var ticketNbr = item.ticket_number;
                            $scope.populateETA(index, ezpayid, serviceId, lob, ticketNbr);
                        }
                    }
                }
                // $scope.showEmailPreview[index] = toggle;
                if (!!toggle && !$scope.activityArray[index].canvas && (activityType === 'email')) {
                    renderEmail(index);
                }
            };

            $scope.getExceptionPhotoCount = function(index) {
                var photoCount = 0;
                var images = [];
                var exceptionCount = $scope.activityArray[index].exceptionData.length;

                for (i = 0; i < exceptionCount; i++) {
                    images = images.concat($scope.activityArray[index].exceptionData[i].images);
                }

                if (!!images) photoCount = images.length;
                return photoCount;
            };

            $scope.showLargeExceptionPhoto = function() {
                $scope.$emit('reveal', {
                    'id': 'overlay-activity-feed-exception-photo',
                    'action': "open",
                    'clickedID': ""
                });

                serverLog.send({
                    'isViewHOCPhotoSuccessful': true,
                    'result': null
                });
            };

            $scope.closeLargeExceptionPhoto = function() {
                $scope.$emit('reveal', {
                    'id': 'overlay-activity-feed-exception-photo',
                    'action': "close",
                    'clickedID': ""
                });
            };

            $scope.handleExceptionPhotoClick = function(index) {
                // if(!!$scope.activityArrayExpanded[index].exceptionPhoto){
                // $scope.activityArrayExpanded[index].exceptionPhoto = !$scope.activityArrayExpanded[index].exceptionPhoto;
                // }else{
                // $scope.activityArrayExpanded[index].exceptionPhoto = false;
                // }


                $rootScope.exceptionDataImages = [];
                $rootScope.exceptionDataImages.images = [];
                $rootScope.exceptionDataImages.driver_name = [];
                var exceptionCount = $scope.activityArray[index].exceptionData.length;

                for (i = 0; i < exceptionCount; i++) {
                    $rootScope.exceptionDataImages.images = $rootScope.exceptionDataImages.images.concat($scope.activityArray[index].exceptionData[i].images);
                    $rootScope.exceptionDataImages.driver_name = $rootScope.exceptionDataImages.driver_name.concat($scope.activityArray[index].exceptionData[i].driver_name);
                }

                $rootScope.exceptionDataImages.unsortedIndex = index;
                $rootScope.exceptionDataImages.currentCarouselPage = 1;
                $rootScope.exceptionDataImages.carouselPaging = function(direction) {
                    if (direction === 'left') {
                        if ($rootScope.exceptionDataImages.currentCarouselPage > 1) {
                            $rootScope.exceptionDataImages.currentCarouselPage -= 1;
                        }
                    } else {
                        if ($rootScope.exceptionDataImages.currentCarouselPage < ($rootScope.exceptionDataImages.images.length)) {
                            $rootScope.exceptionDataImages.currentCarouselPage += 1;
                        }
                    }
                };
                $rootScope.exceptionDataImages.handleExceptionPhotoClick = function() {
                    $scope.closeLargeExceptionPhoto();
                };
                $rootScope.exceptionDataImages.sendPhotoClick = function(index) {
                    $scope.closeLargeExceptionPhoto();
                    $scope.sendPhotoClick(index);
                };

                $scope.showLargeExceptionPhoto();


            };

            $scope.$watch(function(scope) {
                return $scope.$parent.custData;
            }, function() {
                if (!!$scope.$parent.custData && !$scope.activityFeed) {
                    $scope.populate();

                }
            });

            $scope.setFilter = function(filter) {

                $scope.activity[filter].filter = !$scope.activity[filter].filter;

                if ($scope.activity.emails.filter && filter === 'emails') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.notes.filter && filter === 'notes') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.inquiries.filter && filter === 'inquiries') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.tickets.filter && filter === 'tickets') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.cases.filter && filter === 'cases') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.services.filter && filter === 'services') {
                    $scope.activity.all.filter = false;
                }
                if ($scope.activity.all.filter && filter === 'all') {
                    $scope.activity.emails.filter = false;
                    $scope.activity.notes.filter = false;
                    $scope.activity.inquiries.filter = false;
                    $scope.activity.tickets.filter = false;
                    $scope.activity.cases.filter = false;
                    $scope.activity.services.filter = false;
                }
            };

            $scope.populateMore = function(type) {
                // limit activity feed to max of 2 years or 24 months
                if ($scope.activityArrayLookbackMnthCnt < 24 && $scope.activityArray.length != 0) {
                    //console.log("populatemore in");
                    var loadingMoreCnt = $scope.filtersLoadingMore().length;
                    if (loadingMoreCnt === 0) {
                        $scope.activityArrayLoadMoreStatus = 'loading';
                        $scope.setFiltersAsLoadingMore();
                        $scope.setDateRange();
                        $scope.populate();

                    } else if (!!type && $scope.activityArrayLoadMoreStatus != 'queued') {
                        // queue up next load if scroll occurs while still loading from previous scroll at bottom
                        // unqueue if activity array length changes by more than 5
                        // this will produce a smoother user experience
                        $scope.activityArrayLoadMoreStatus = 'queued';
                        // console.log('i am queued for more loading!!!');

                    }
                }
            };

            $scope.$watch('activityArrayLength', function(newValue, oldValue) {
                if (newValue != oldValue && $scope.activityArrayLoadMoreStatus == 'queued') {
                    // console.log('unqueue');
                    $scope.activityArrayLoadMoreStatus = '';
                }
            });

            $scope.setDateRange = function() {
                var prevLookbackMnthCnt = $scope.activityArrayLookbackMnthCnt;
                $scope.activityArrayLookbackMnthCnt += $scope.activityArrayLookbackMnthInc;
                $scope.activityArrayFromDate = moment().subtract($scope.activityArrayLookbackMnthCnt, 'months').format('YYYY-MM-DD');
                $scope.activityArrayToDate = moment().subtract(prevLookbackMnthCnt, 'months').subtract(1, 'days').format('YYYY-MM-DD');
                //console.log("setDateRange---"+$scope.activityArrayToDate );
                $scope.activityArrayDuration = moment.duration(moment().diff(moment($scope.activityArrayFromDate)));
                $scope.activityArrayDurationAsDays = Math.round($scope.activityArrayDuration.asDays());
            };

            $scope.filtersLoadingMore = function() {
                var loadingMoreActivityTypes = [];
                _.each($scope.activity, function(val, key, list) {
                    if (key !== 'all' && key !== 'serviceExceptions') {
                        if (!!val.loadingMore) {
                            loadingMoreActivityTypes.push(key);
                        }
                    }
                });
                $scope.activityArrayLoadMoreCnt = loadingMoreActivityTypes.length;
                $scope.setLoadMoreStatus();

                return loadingMoreActivityTypes;
            };

            $scope.setFiltersAsLoadingMore = function() {
                _.each($scope.activity, function(val, key, list) {
                    if (key !== 'all' && key !== 'serviceExceptions') {
                        if (!val.loadingMore) {
                            $scope.activityArrayLoadMoreCnt += 1;
                            val.loadingMore = true;
                        }
                    }
                });
            };

            $scope.setLoadMoreStatus = function() {
                var loadingMoreCnt = $scope.activityArrayLoadMoreCnt;

                if (loadingMoreCnt === 0 && $scope.activityArrayLoadMoreStatus === 'loading') {
                    $scope.activityArrayLoadMoreStatus = '';
                } else if (loadingMoreCnt === 0 && $scope.activityArrayLoadMoreStatus === 'queued') {
                    $scope.activityArrayLoadMoreStatus = 'loading';
                    $scope.populateMore();
                }
            };

            $scope.populate = _.debounce(function() {
                // this shouldn't be dependant on parent data.  abstract to a service that hits elastic search if custData is not present
                var ezpayid = $scope.$parent.custData._id;
                var lob = $scope.$parent.custData._source.customer.lob.toLowerCase();
                var fromDate = $scope.activityArrayFromDate;
                var toDate = $scope.activityArrayToDate;
                var durationAsDays = $scope.activityArrayDurationAsDays;
                var mnthInc = $scope.activityArrayLookbackMnthInc;
                var mnthCnt = $scope.activityArrayLookbackMnthCnt;
                $scope.lob = lob;

                var getEmails = Customer.ActivityFeed.emails(ezpayid, fromDate, toDate).get({
                    'ezPayId': ezpayid
                });
                var getIssues = Customer.ActivityFeed.inquiries(ezpayid, fromDate, toDate).get({
                    'ezPayId': ezpayid
                });
                var getTickets = Customer.Tickets._(parseInt(ezpayid), lob, fromDate, toDate).get({
                    'ezPayId': parseInt(ezpayid)
                });
                //console.log("populate "+toDate);
                var getCases = Customer.Cases._(parseInt(ezpayid), lob, fromDate, toDate).get({
                    'ezPayId': parseInt(ezpayid)
                });
                var getNotes = Customer.ActivityFeed.notes(ezpayid, fromDate, toDate).get({
                    'ezPayId': ezpayid
                });
                var getServices = Customer.Services.stats(ezpayid, durationAsDays).get({
                    'ezPayId': ezpayid
                });

                var getPlannedServices = Customer.Services.plan(ezpayid).get({
                    'ezPayId': ezpayid
                });

                getEmails.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer activity feed Email: ", data);
                    if (!!data.activities) {
                        if (data.activities.length === 0) {
                            // $scope.noEmailsFound = true;
                        } else {
                            // $scope.noEmailsFound = false;
                            $scope.activity.emails.activities = data;
                            normalizeActivity(data, 'email', toDate);
                        }
                    } else {
                        // $scope.noEmailsFound = true;
                    }

                }).catch(function(error) {
                    $log.debug("[REST] loaded customer activity feed email ERROR ", error);
                    // $scope.noEmailsFound = true;
                }).finally(function() {
                    $scope.activity.emails.loading = false;
                    $scope.activity.emails.loadingMore = false;
                    $scope.filtersLoadingMore();
                    // $scope.loading.emails = false;
                });

                getIssues.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer activity feed Issues: ", data);
                    if (!!data.activities) {
                        if (data.activities.length === 0) {
                            // $scope.noIssuesFound = true;
                        } else {
                            // $scope.noIssuesFound = false;
                            normalizeActivity(data, 'inquiry', toDate);
                            $scope.activity.inquiries.activities = data;
                        }
                    } else {
                        // $scope.noIssuesFound = true;
                    }

                }).catch(function(error) {
                    $log.debug("[REST] loaded customer activity feed email ERROR ", error);
                    // $scope.noEmailsFound = true;
                }).finally(function() {
                    $scope.activity.inquiries.loading = false;
                    $scope.activity.inquiries.loadingMore = false;
                    $scope.filtersLoadingMore();
                    // $scope.loading.emails = false;
                });

                getNotes.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer activity feed Notes: ", data);
                    if (!!data.activities) {
                        if (data.activities.length === 0) {
                            // $scope.noNotesFound = true;

                        } else {
                            // $scope.noNotesFound = false;

                            // if geocode has not finished, delay loading activity array until zone abbrev becomes available
                            if (angular.equals($scope.customerClock, {})) {
                                $scope.activity.notes.delayNormalizeActivity = true;
                                $scope.$watch('customerClock.zone.abbreviation', function() {
                                    if (!angular.equals($scope.customerClock, {})) {

                                        normalizeActivity(data, 'note', toDate);
                                        $scope.activity.notes.loading = false;
                                        $scope.activity.notes.loadingMore = false;
                                        $scope.activity.notes.delayNormalizeActivity = false;
                                        $scope.filtersLoadingMore();

                                        // stop watching customerClock.zone.abbreviation
                                        var unregister = $scope.$watch('customerClock.zone.abbreviation', function() {
                                            unregister();
                                        });
                                    }
                                });

                                // setTimeout(function() {
                                //     normalizeActivity(data, 'note', toDate);
                                //     $scope.activity.notes.loading = false;
                                // }, 1000);

                            } else {
                                normalizeActivity(data, 'note', toDate);
                            }

                            $scope.activity.notes.activities = data;

                        }
                    } else {
                        // $scope.noNotesFound = true;
                    }

                }).catch(function(error) {
                    $log.debug("[REST] loaded customer activity feed notes ERROR ", error);
                    // $scope.noNotesFound = true;
                }).finally(function() {

                    if (!$scope.activity.notes.delayNormalizeActivity) {
                        $scope.activity.notes.loading = false;
                        $scope.activity.notes.loadingMore = false;
                        $scope.filtersLoadingMore();
                    }
                    // $scope.loading.notes = false;
                });

                getTickets.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer activity feed Tickets: ", data);
                    if (!!data.tickets) { //NON-FASTLANE
                        if (data.tickets.length === 0) {
                            // $scope.noNotesFound = true;
                        } else {
                            // $scope.noNotesFound = false;
                            data.activities = data.tickets;
                            normalizeActivity(data, 'ticket', toDate);
                            $scope.activity.tickets.activities = data;
                        }
                    } else if (!!data.Tickets) { //NON-FASTLANE
                        // $scope.noNotesFound = true;
                        if (data.Tickets.length === 0) {
                            // $scope.noNotesFound = true;
                        } else {
                            // $scope.noNotesFound = false;
                            data.activities = data.Tickets;
                            normalizeActivity(data, 'ticket', toDate);
                            $scope.activity.tickets.activities = data;
                        }
                    }

                }).catch(function(error) {
                    $log.debug("[REST] loaded customer activity feed tickets ERROR ", error);
                    // $scope.noNotesFound = true;
                }).finally(function() {
                    $scope.activity.tickets.loading = false;
                    $scope.activity.tickets.loadingMore = false;
                    $scope.filtersLoadingMore();
                    // $scope.loading.notes = false;
                });

                getCases.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer activity feed Cases: ", data);
                    if (!!data.cases) { //NON-FASTLANE
                        if (data.cases.length === 0) {
                            // $scope.noNotesFound = true;
                        } else {
                            data.activities = data.cases;
                            normalizeActivity(data, 'case', toDate);
                            $scope.activity.cases.activities = data;
                        }
                    } else if (!!data.Cases) { //NON-FASTLANE
                        // $scope.noNotesFound = true;
                        if (data.Cases.length === 0) {
                            // $scope.noNotesFound = true;
                        } else {
                            // $scope.noNotesFound = false;
                            data.activities = data.Cases;
                            normalizeActivity(data, 'case', toDate);
                            $scope.activity.cases.activities = data;
                        }
                    }

                }).catch(function(error) {
                    $log.debug("[REST] loaded customer activity feed cases ERROR ", error);
                    // $scope.noNotesFound = true;
                }).finally(function() {
                    $scope.activity.cases.loading = false;
                    $scope.activity.cases.loadingMore = false;
                    $scope.filtersLoadingMore();
                    // $scope.loading.notes = false;
                });

                $scope.$watch(function(scope) {
                    try {
                        return $scope.$parent.services.all;
                    } catch (e) {
                        return null;
                    }
                }, function() {

                    if (!!$scope.$parent.services) {
                        if (!!$scope.$parent.services.all) {

                            getServices.$promise.then(function(data) {
                                $log.debug("[REST] loaded customer service stats feed: ", data);
                                if (!!data.services) {
                                    if (data.services.length === 0) {
                                        // $scope.noNotesFound = true;
                                    } else {
                                        // $scope.noNotesFound = false;
                                        $scope.activity.services.activities = data;
                                        data.activities = data.services; //needs to be converted to match structure of "Activity" services
                                        normalizeActivity(data, 'service', toDate);

                                        // getServiceExceptions.$promise.then(function(data) {
                                        //     $log.debug("[REST] loaded customer service exceptions : ", data);
                                        //     if (!!data.exceptions) {
                                        //         if (data.exceptions.length === 0) {
                                        //             // $scope.noNotesFound = true;
                                        //         } else {
                                        //             // $scope.noNotesFound = false;
                                        //             $scope.activity.serviceExceptions.activities = data;
                                        //             data.activities = data.exceptions; //needs to be converted to match structure of "Activity" services
                                        //             _.each($scope.activityArray, function(item, i) {
                                        //                 if (item.activityType === 'service') {
                                        //                     _.each($scope.activity.serviceExceptions.activities.exceptions, function(exception, j) {
                                        //                         if (exception.wm_metadata.customer_order_number === item.wm_metadata.customer_order_number) {
                                        //                             item.exceptionData = exception;
                                        //                         }
                                        //                     });
                                        //                 }
                                        //             });
                                        //             // normalizeActivity(data, 'service', toDate);
                                        //         }
                                        //     } else {
                                        //         //no exceptions loaded
                                        //     }
                                        //
                                        // }).catch(function(error) {
                                        //     $log.debug("[REST] loaded customer service exceptions feed ERROR ", error);
                                        //     // $scope.noNotesFound = true;
                                        // }).finally(function() {
                                        //     $scope.activity.serviceExceptions.loading = false;
                                        //     // $scope.loading.notes = false;
                                        //
                                        // });
                                    }
                                } else {
                                    // $scope.noNotesFound = true;
                                }

                            }).catch(function(error) {
                                $log.debug("[REST] loaded customer service stats feed ERROR ", error);
                                // $scope.noNotesFound = true;
                            }).finally(function() {

                                // Set services.loading to false only after both service stats and service plan requests have finished
                                $scope.activity.services.loadCount++;
                                if ($scope.activity.services.loadCount > 1) {
                                    $scope.activity.services.loading = false;
                                    $scope.activity.services.loadingMore = false;
                                    $scope.filtersLoadingMore();
                                }
                                // $scope.loading.notes = false;
                            });

                            // only load planned services for initial activity array load
                            if (mnthInc === mnthCnt) {
                                getPlannedServices.$promise.then(function(data) {
                                    $log.debug("[REST] loaded customer plan feed: ", data);
                                    if (!!data.services) {
                                        if (data.services.length === 0) {
                                            // no planned services found, do nothing
                                        } else {
                                            $scope.activity.services.activities = data;
                                            data.activities = data.services; // needs to be converted to match structure of "Activity" services

                                            // search for completed services from API and remove from array before calling normalizeActivity function
                                            // the normalizeAcitivty function will push the remaining array elements to the activitiesArray
                                            for (var i = data.activities.length - 1; i >= 0; i--) {
                                                if (data.activities[i].status !== 'Planned' && data.activities[i].status !== 'In Progress') {
                                                    data.activities.splice(i, 1);
                                                }
                                            }


                                            // data.activities = $filter('orderBy')(data.activities, ['-planned_date', '-unsortedIndex']);
                                            data.activities = $filter('orderBy')(data.activities, ['-ordered_date', '-unsortedIndex']);

                                            normalizeActivity(data, 'plan');
                                        }
                                    } else {
                                        // no services found, do nothing
                                    }

                                }).catch(function(error) {
                                    $log.debug("[REST] loaded customer service plan feed ERROR ", error);
                                }).finally(function() {

                                    // Set services.loading to false only after both service stats and service plan requests have finished
                                    $scope.activity.services.loadCount++;
                                    if ($scope.activity.services.loadCount > 1) {
                                        $scope.activity.services.loading = false;
                                        $scope.activity.services.loadingMore = false;
                                        $scope.filtersLoadingMore();
                                    }
                                });
                            }
                        }
                    } else {
                        // didn't bother making these calls, since this account has no services
                        $scope.activity.services.loading = false;
                        $scope.activity.services.loadingMore = false;
                        $scope.activity.serviceExceptions.loading = false;
                        $scope.activity.serviceExceptions.loadingMore = false;
                        $scope.filtersLoadingMore();
                    }
                });


            }, 50);

            $scope.clearActivityArray = function() {
                $scope.activityArray = [];
            };

            $scope.toggleAddItemMenu = function() {

                $scope.addToggle = !($scope.addToggle);

                // Stopping event propagation means window.onclick won't get called when someone clicks
                // on the menu div. Without this, menu will be hidden immediately
                event.stopPropagation();

            };

            $scope.showAddItemMenu = function() {

                if ($scope.addToggleTimeout) {
                    clearTimeout($scope.addToggleTimeout);
                }

                $scope.addToggle = true;

                // Stopping event propagation means window.onclick won't get called when someone clicks
                // on the menu div. Without this, menu will be hidden immediately
                event.stopPropagation();
            };

            $scope.hideAddItemMenu = function() {

                $scope.addToggleTimeout = setTimeout(function() {
                    $scope.addToggle = false;
                }, 350);

            };

            window.onclick = function() {
                if ($scope.addToggle) {
                    $scope.addToggle = false;
                    $scope.$apply();
                }
            };


            function renderEmail(id) {
                var iframe = [];
                var iframedoc = [];
                iframe = document.createElement('iframe');
                var $iframe = $(iframe).addClass('iframe-email');
                $('body').append($iframe);
                iframedoc = iframe.contentDocument || iframe.contentWindow.document;
                $('body', $(iframedoc)).html($scope.activityArray[id].wm_metadata.html);
                html2canvas(iframedoc.body, {
                    onrendered: function(canvas) {
                        $scope.activityArray[id].canvas = canvas;
                        $('.email' + ($scope.activityArray[id].id)).append(canvas);
                        $('.iframe-email').remove();
                    },
                    allowTaint: true
                });
            }
            
            // startsWith() is a ES6 / ES2015 Function, not available on IE out-of-the-box
            // hence, adding method definition using prototypal-inheritance 
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function(searchString, position) {
                    position = position || 0;
                    return this.indexOf(searchString, position) === position;
                };
            }

            function normalizeActivity(data, type, toDate) {
                _.each(data.activities, function(item, i) {
                    var curIndex = $scope.activityArray.length;
                    toDate = toDate ? toDate : $scope.activityArrayToDate;
                    var serviceTime = moment().format('YYYY-MM-DD');
                    var duration = 0;
                    var durationAsDays = 0;

                    if (type === 'email') {
                        if (item.email_info.body.trim().toLowerCase() === 'null') {
                            item.email_info.body = "";
                        }
                    } else if (type === 'note') {
                        item.note_info.comment = item.note_info.comment.trim();
                        if (item.note_info.comment.toLowerCase().startsWith('caag ')) {
                            item.note_info.comment = item.note_info.comment.slice(5);
                        }
                    } else if (type === 'inquiries') {
                        item.issue_info.description = item.note_info.comment.trim();
                    } else if (type === 'service' || type === 'plan') {

                        // workaround for API not taking fromDate and toDate
                        // check and continue to next item if service come after the set toDate
                        if (type === 'service') {
                            serviceTime = moment(item.service_time).format('YYYY-MM-DD');
                            duration = moment.duration(moment(toDate).diff(moment(serviceTime)));
                            durationAsDays = Math.round(duration.asDays());
                            if (durationAsDays < 0) {
                                return;
                            }
                        }

                        item.serviceDetails = {};
                        item.count = null;
                        item.prettyEquipmentSize = "";
                        item.prettyServiceName = "";
                        item.serviceCssIconClass = "";
                        var matchingContract = _.find($scope.$parent.services.all, function(contract, i) {
                            var finalValue = '';
                            if (parseInt(item.id) === parseInt(contract.id)) {
                                // if ((contract.wm_metadata.service_code === item.wm_metadata.service_code) || (contract.equipment.id === item.wm_metadata.service_code)) {
                                return true;
                            }
                        });

                        //found a matching active contract
                        if (!!matchingContract) {
                            item.serviceDetails = matchingContract;
                            item.prettyEquipmentSize = customerContract.humanizeEquipmentSize(matchingContract); //$filter('humanizeServiceEquipment_sizeOnly')(item.serviceDetails.equipment);
                            item.count = customerContract.getEquipmentCount(matchingContract);
                            item.prettyServiceName = customerContract.humanizeServiceName(matchingContract); //$filter('humanizeServiceType')(item.serviceDetails.equipment.name);
                            item.serviceCssIconClass = customerContract.serviceCssIconClass(matchingContract);

                            // if (item.serviceDetails.equipment.name.toLowerCase() === 'null') {
                            //     item.prettyServiceName = item.serviceDetails.enterprise_catalog.description + " (" + item.wm_metadata.service_code + ")";
                            // }
                        } else {
                            // no match for the service/fee was found
                            //console.log("NO MATCH FOR: ", item.wm_metadata.service_code);
                            item.prettyServiceName = item.wm_metadata.service_code;
                        }

                        // identify last plan on list for services seperator
                        if (type === 'plan') {
                            if (data.activities.length === i + 1) {
                                item.lastPlanIndicator = 'last-planned-service';
                            }
                        }

                    } else if (type === 'ticket') {

                        // workaround for API bug causing results from outside the supplied toDate and fromDate to appear
                        toDate = $scope.activityArrayToDate;

                        if (!!item.created_date_time) {
                            serviceTime = moment(item.created_date_time).format('YYYY-MM-DD');
                        } else if (!!item.dispatch_date_time) {
                            serviceTime = moment(item.dispatch_date_time).format('YYYY-MM-DD');
                        }

                        duration = moment.duration(moment(toDate).diff(moment(serviceTime)));
                        durationAsDays = Math.round(duration.asDays());
                        if (durationAsDays < 0) {
                            return;
                        }

                    } else if (type === 'case') {
                        //
                    }

                    // console.log($scope.activityArray.length-1, item);
                    $scope.activityArray.push(item);
                    $scope.activityArrayCharLimit.push($scope.baseCharLimit);
                    // if (!$scope.activityArrayExpanded[i]) {
                    $scope.activityArrayExpanded.push({
                        'primary': false
                    });
                    // }
                    $scope.activityArray[curIndex].activityType = type.replace('plan', 'service');
                    $scope.activityArray[curIndex].unsortedIndex = curIndex;

                    if (type === 'email') {
                        $scope.activityArray[curIndex].timeStamp = moment(item.email_info.sent_date_time);
                    } else if (type === 'inquiry') {
                        $scope.activityArray[curIndex].timeStamp = moment(item.audit_info.created_date_time);
                    } else if (type === 'ticket') {
                        if (!!item.created_date_time) {
                            $scope.activityArray[curIndex].timeStamp = moment(item.created_date_time);
                        } else if (!!item.dispatch_date_time) {
                            $scope.activityArray[curIndex].timeStamp = moment(item.dispatch_date_time);
                        }
                    } else if (type === 'case') {
                        $scope.activityArray[curIndex].timeStamp = moment(item.requested_date_time);
                    } else if (type === 'note') {

                        // allow timezone to default to customer timezone if time is equal to midnight else default time to CST
                        if (item.note_info.create_date_time.indexOf('00:00:00') >= 0) {
                            $scope.activityArray[curIndex].timeStamp = moment(item.note_info.create_date_time + ' ' + $scope.customerClock.zone.abbreviation);
                        } else {
                            $scope.activityArray[curIndex].timeStamp = moment(item.note_info.create_date_time + ' CDT');
                        }

                        // apply offset for dates that fall outside of current DST status
                        var dstOffset = moment().format('Z').slice(0, 3) - moment(item.note_info.create_date_time).format('Z').slice(0, 3);
                        $scope.activityArray[curIndex].timeStamp.add(moment.duration(dstOffset, 'hours'));

                    } else if (type === 'service' || type === 'plan') {
                        if (item.status !== 'Planned' && item.status !== 'In Progress') {
                            $scope.activityArray[curIndex].timeStamp = moment(item.service_time);
                        } else if (item.status === 'Planned' || item.status === 'In Progress') {
                            var now = moment();
                            var updatedPlanDt = moment(item.ordered_date);

                            updatedPlanDt = updatedPlanDt.add(now.format('H'), 'h');
                            updatedPlanDt = updatedPlanDt.add(now.format('m'), 'm');
                            updatedPlanDt = updatedPlanDt.add(now.format('s'), 's');
                            $scope.activityArray[curIndex].timeStamp = updatedPlanDt;
                        }
                    }
                });

                if (type === 'eta') {
                    var item = data.eta;

                    // times from ETA API are in UTC
                    // convert data to utc date and generate customer ETA message
                    // if (!!item.eta) {
                    //     item.eta = moment.utc(item.eta).toDate();
                    //     item.from = moment.utc(item.from, 'HH:mm:ss:SSS').toDate();
                    //     item.to = moment.utc(item.to, 'HH:mm:ss:SSS').toDate();
                    // }
                    // if (!!item.serviced_date_time) {
                    //     item.serviced_date_time = moment.utc(item.serviced_date_time).toDate();
                    // }
                    item.prettyETAMsg = prettyETAMsg(data);
                }

                $scope.activityArrayLength = $scope.activityArray.length;
                $scope.setLoadMoreStatus();
            }

            function prettyETAMsg(data) {
                // Return customer ETA message based on WM.com ETA Service Code Bible Matrix
                var item = data.eta;
                var lob = $scope.lob;
                var tzone = $scope.customerClock.zone.abbreviation;
                var msg = '';

                // if (lob === 'rolloff' || lob === 'commercial') {
                //     switch (item.reason_code) {
                //         case 'ComputedETA':
                //             item.from_cust_tz = moment(item.from).tz($scope.customerClock.zone.zoneName);
                //             item.to_cust_tz = moment(item.to).tz($scope.customerClock.zone.zoneName);
                //             msg = 'Your estimated pickup time is between ' + moment(item.from_cust_tz).format('h:mma') + ' to ' +
                //                 moment(item.to_cust_tz).format('h:mma') + ' ' + tzone +
                //                 '. However, times may vary so please have your items available for pick up between midnight and 6pm.';
                //             break;
                //         case 'MissingCustLat/Long':
                //             // fallthrough
                //         case 'RouteNotSequenced':
                //             msg = 'You are scheduled for pickup today. Times may vary so please have your items available for pick up between midnight and 6pm.';
                //             break;
                //         case 'DownTimeStartedByDriver':
                //             // fallthrough
                //         case 'ConfirmStopNotFound':
                //             // fallthrough
                //         case 'RouteNotStarted':
                //             msg = 'Service in your area is expected to begin later today. Please check back in a few hours as schedules are updated on a regular basis.';
                //             break;
                //         case 'AlreadyServiced':
                //             item.serviced_date_time_cust_tz = moment(item.serviced_date_time).tz($scope.customerClock.zone.zoneName);
                //             msg = 'Your pickup was completed at - ' + moment(item.serviced_date_time_cust_tz).format('h:mma') + ' ' + tzone + '.';
                //             break;
                //         default:
                //             msg = 'Sorry, we are unable to process your request at this time.';
                //             break;
                //     }
                // } else if (lob === 'residential') {
                //     switch (item.reason_code) {
                //         case 'ComputedETA':
                //             // fallthrough
                //         case 'MissingCustLat/Long':
                //             // fallthrough
                //         case 'RouteNotSequenced':
                //             msg = 'You are scheduled for pickup today.';
                //             break;
                //         case 'DownTimeStartedByDriver':
                //             // fallthrough
                //         case 'ConfirmStopNotFound':
                //             // fallthrough
                //         case 'RouteNotStarted':
                //             msg = 'Service in your area is expected to begin later today.';
                //             break;
                //         case 'AlreadyServiced':
                //             msg = 'Your pickup was completed today.';
                //             break;
                //         default:
                //             msg = 'Sorry, we are unable to process your request at this time.';
                //             break;
                //     }
                // } else {
                //     msg = constants.whitespace; // space
                // }
                //
                // return msg;
                return $filter('humanizeServiceETA')(lob, item, $scope.customerClock.zone);
            }
        }
    ]);
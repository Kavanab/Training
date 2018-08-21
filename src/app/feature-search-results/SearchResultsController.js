// Allow 'debugger' statements
/*jshint -W087 */

angular.module('searchApp.searchResults', [])
    .controller("SearchResultsController", [
        'serverLog',
        'esFactory',
        'client',
        '$scope',
        '$rootScope',
        '$http',
        '$location',
        '$localStorage',
        '$state',
        '$stateParams',
        '$log',
        'UserLocation',
        'Weather',
        function(
            serverLog,
            esFactory,
            client,
            $scope,
            $rootScope,
            $http,
            $location,
            $localStorage,
            $state,
            $stateParams,
            $log,
            UserLocation,
            Weather) {

            $log.debug("[CONTROLLER] SearchResultsController");
            // $rootScope.viewingCustomer = false;

            $scope.ES = client.cluster.state({
                    metric: [
                        'cluster_name',
                        'nodes',
                        'master_node',
                        'version'
                    ]
                })
                .catch(function(err) {
                    $log.error(err);
                    $scope.clusterState = null;
                    $scope.error = err;
                    // if the err is a NoConnections error, then the client was not able to
                    // connect to elasticsearch. In that case, create a more detailed error
                    // message
                    if (err instanceof esFactory.errors.NoConnections) {
                        $scope.error = new Error('Unable to connect to elasticsearch. ' +
                            'Make sure that it is running and listening at http://localhost:9200');
                    }
                });
            //ex: zip:77002
            // $scope.parseSearchInput = function(input){
            //   var dividerPosition = input.indexOf(':');
            //   var endBoostTermPosition = input.indexOf(' ');
            //   var jsonVar = {};

            //   if (endBoostTermPosition === -1){
            //     endBoostTermPosition = input.length;// use length of search term if there is no space to divide
            //   }

            //   //return parsed values
            //   var parsed = {
            //     boostFields: [
            //       // {"zip": "77002"}
            //       // {"name": "kevin"}
            //       ],
            //       remainingString: input
            //     };

            //   //check for fields to boost eg:  zip:77002
            //   while(dividerPosition > 1){
            //     var boostField = input.substring(0,dividerPosition); //zip
            //     var boostValue = input.substring(dividerPosition+1,endBoostTermPosition);  //77002

            //     jsonVar[boostField] = boostValue;
            //     parsed.boostFields.push( jsonVar);   //{ [boostField], boostValue})  //this is ES6 only :/
            //     jsonVar = {}; //reset

            //     if(boostValue !== ''){  //zip:7
            //       input = input.substring(endBoostTermPosition+1, input.length);
            //       dividerPosition = input.indexOf(':');
            //     }else{ //zip:
            //       dividerPosition = -1;
            //     }
            //   }

            //   return parsed;
            // };
            // $scope.smartParse = function(input) {

            // };

            // $scope.boostFields = function(parsedInput) { //expects parsed input from $scope.parseSearchInput
            //     var i = 0;
            //     var arrBoostKeys = [];

            //     if (parsedInput.boostFields.length > 1) {
            //         Object.keys(parsedInput.boostFields);
            //     }
            //     for (i; i < parsedInput.boostFields.length; i++) {
            //         console.log(parsedInput.boostFields[i]);
            //     }

            //     //   indexOfFieldToBoost = _.indexOf(arrFields, "ServiceAddress");

            //     // $scope.jsonToPost.query.bool.should.multi_match.fields[indexOfFieldToBoost] = "ServiceAddress^3";
            //     // $scope.jsonToPost.query.bool.should.multi_match.query = $scope.inputVal.substring(dividerPosition+1, $scope.inputVal.length);
            //     // console.log("query: ",$scope.jsonToPost.query.bool.should.multi_match.query, dividerPosition, $scope.inputVal.length);
            // };

            $scope.switchESquery = function(contactType) {
                $rootScope.searchResultsReady = false;
                // $rootScope.animateSearchResults = false;
                if (contactType === 'service') {
                    $rootScope.ESqueryFields = $scope.ESqueryFieldsServiceArray;
                } else {
                    $rootScope.ESqueryFields = $scope.ESqueryFieldsBillingArray;
                }
                $localStorage.serviceBillingToggle = contactType;
                $scope.responseData = {};
                $rootScope.ESqueryType = contactType;
                $scope.doSearchRoute(true);
            };

            $scope.initSetup = function() {
                $log.debug("[FUNCTION] SearchResultsController.initSetup");
                if ($state.current.name === 'app.search') {
                    $rootScope.viewingCustomer = false;
                    if (!!$stateParams.id) {
                        // $('.input-primary-customer-search').val($stateParams.id);
                        $scope.inputSearch = $stateParams.id;
                        $rootScope.inputSearch = $stateParams.id;
                        $scope.doSearch();
                    } else {
                        // $location.path('/');
                        $scope.responseData = undefined;
                    }
                }
            };

            $scope.doSearchRoute = _.throttle(function(reload) {
                $log.debug("[FUNCTION] SearchResultsController.doSearchRoute THROTTLE");
                reload = reload ? reload : false;
                if (!!$scope.inputSearch || $scope.inputSearch === "") {
                    $log.debug('[FUNCTION] SearchResultsController.doSearchRoute  reload? ' + reload);
                    // $location.path('/search/' + $scope.inputSearch);
                    $state.go('app.search', {
                        "id": $scope.inputSearch
                    }, { /*notify:false,*/
                        reload: reload
                    });
                    // $scope.initSetup();
                } else {
                    $log.debug('DONT DO SEARCH SEARCH ROUTE');
                }
            }, 1000);

            $scope.logSearchResults = _.debounce(function(stuff) {
                if (!!$scope.inputSearch) {
                    serverLog.send({
                        'query': $scope.inputSearch,
                        'results': stuff
                    });
                }
            }, 2000);


            $scope.doSearch = function() {
                $log.debug('[FUNCTION] SearchResultsController.doSearch: ');

                $scope.ES.then(function(resp) {
                    $scope.clusterState = resp;
                    $scope.error = null;
                    var whichIndex = {
                        'active': client.transport._config.activecustomers,
                        'inactive': client.transport._config.inactivecustomers,
                        'all': client.transport._config.activecustomers+','+client.transport._config.inactivecustomers
                    };

                    var queryToUse = $scope.inputSearch ? $scope.inputSearch : '';
                    queryToUse = $scope.parseInputSearch(queryToUse);
                    queryToUse = queryToUse.replace(/[\+\-\=\&\|\>\!\(\)\{\}\[\]\^\~\?\:\\\/]/g, "\\$&");

                    //if everything is good, do the search
                    client.search({
                        index: whichIndex[$localStorage.searchDropdownSelection],
                        type: 'custdetails',
                        body: {
                            // explain: true,
                            query: {
                                query_string: {
                                    fields: $rootScope.ESqueryFields,
                                    query: queryToUse,
                                    default_operator: "AND"
                                }
                            },
                            "highlight": {
                                "fields": {
                                    "customer.serviceContact.address.street": {},
                                    "customer.serviceContact.address.street2": {},
                                    "customer.serviceContact.address.city": {},
                                    "customer.serviceContact.address.state": {},
                                    "customer.serviceContact.address.postalCode": {},
                                    "customer.billingContact.address.street": {},
                                    "customer.billingContact.address.street2": {},
                                    "customer.billingContact.address.city": {},
                                    "customer.billingContact.address.state": {},
                                    "customer.billingContact.address.postalCode": {}
                                }
                            },
                            // "from": 0,
                            "size": 12,
                        }
                    }).then(function(stuff) {

                        $log.debug('[ES QUERY] # of results: ', stuff.hits.hits.length);
                        $scope.resultsCount = stuff.hits.total;
                        $scope.responseData = stuff.hits.hits;
                        $scope.SEARCHRESULTSCONTROLLER = stuff.hits.hits;
                        $scope.logSearchResults(stuff.hits.total);
                        $rootScope.ESqueryTypeAfterQuery = $rootScope.ESqueryType;
                        setTimeout(function() {
                            $rootScope.animateSearchResults = true;
                            if($scope.resultsCount > 0 && $scope.inputSearch.length > 0){
                                $rootScope.searchResultsReady = true;
                            }else{
                                $rootScope.searchResultsReady = false;
                            }
                        }, 1);


                        // _.each($scope.responseData, function(result, index) {
                        //     if (!!result.highlight) {
                        //         var concatService = '';
                        //         var concatBilling = '';

                        //         concatService = result.highlight['customer.serviceContact.address.street']      ? concatService + result.highlight['customer.serviceContact.address.street']    : concatService;
                        //         concatService = result.highlight['customer.serviceContact.address.street2']     ? concatService + result.highlight['customer.serviceContact.address.street2']   : concatService;
                        //         concatService = result.highlight['customer.serviceContact.address.city']        ? concatService + result.highlight['customer.serviceContact.address.city']      : concatService;
                        //         concatService = result.highlight['customer.serviceContact.address.postalCode']  ? concatService + result.highlight['customer.serviceContact.address.postalCode'] : concatService;

                        //         concatBilling = result.highlight['customer.billingContact.address.street']      ? concatBilling + result.highlight['customer.billingContact.address.street']    : concatBilling;
                        //         concatBilling = result.highlight['customer.billingContact.address.street2']     ? concatBilling + result.highlight['customer.billingContact.address.street2']   : concatBilling;
                        //         concatBilling = result.highlight['customer.billingContact.address.city']        ? concatBilling + result.highlight['customer.billingContact.address.city']      : concatBilling;
                        //         concatBilling = result.highlight['customer.billingContact.address.postalCode']  ? concatBilling + result.highlight['customer.billingContact.address.postalCode'] : concatBilling;

                        //         var serviceHighlightCount = concatService.match(/<em>/g);
                        //         var billingHighlightCount = concatBilling.match(/<em>/g);



                        //         if ((serviceHighlightCount.length > 0) || (billingHighlightCount.length > 0)) {
                        //             $scope.responseData[index].highlightInfo = {
                        //                 "serviceScore": 0,
                        //                 "billingScore": 0
                        //             };

                        //             if (concatService !== '') {
                        //                 $scope.responseData[index].highlightInfo.serviceContact = concatService;
                        //                 $scope.responseData[index].highlightInfo.serviceScore = serviceHighlightCount.length;
                        //             }
                        //             if (concatBilling !== '') {
                        //                 $scope.responseData[index].highlightInfo.billingContact = concatBilling;
                        //                 $scope.responseData[index].highlightInfo.billingScore = billingHighlightCount.length;
                        //             }
                        //         }
                        //     }

                        // });
                    }, function(error) {
                        $log.error(error.message);
                    });
                });

                // var parsedSearchInput = $scope.parseSearchInput( $scope.inputVal );
                // $scope.jsonToPost.query.bool.should.multi_match.query = parsedSearchInput.remainingString;
                // $scope.boostFields(parsedSearchInput);
                // console.log(parsedSearchInput);

                // var searchPromise = $http.post(
                //     "http://10.248.62.28:9202/activecustomers/custdetails/_search",
                //     $scope.jsonToPost
                // );

                // searchPromise.success(function(stuff, status) {
                //     // console.log('cursor TWO: ' + document.activeElement.selectionStart);
                //     $scope.responseData = stuff.hits.hits;
                // });

            }; //END POPULATED FUNCTION

            $scope.parseInputSearch = function(queryToUse) {

                var testPattern = /[\+\-\=\&\|\>\!\(\)\{\}\[\]\^\~\?\:\,\.\\\/]/g;

                // remove space after (###) pattern match for effective phone search
                var queryToUsePre = queryToUse.replace(/[0-9]{3}\)\s*/g, queryToUse.match(/[0-9]{3}\)/g));


                // slower performance using following method of wildcard search
                // var queryToUseParsed = queryToUse.replace(/[\+\-\=\&\|\>\!\(\)\{\}\[\]\^\~\?\:\,\.\\\/]/g, "*");

                var queryToUseArr = queryToUsePre.split(" ");
                var queryToUseParsed = '';
                var altItemToSearch = '';


                queryToUseArr.forEach(function(item) {
                    if (!!testPattern.test(item)) {
                            altItemToSearch = item.replace(/[\+\-\=\&\|\>\!\(\)\{\}\[\]\^\~\?\:\,\.\\\/]/g, "");
                            if (altItemToSearch.length > 0) {
                                item = item + ' OR ' + altItemToSearch;
                            }
                    }
                    queryToUseParsed = queryToUseParsed + ' ' + item;
                });

                return queryToUseParsed;

            };

            // });
            // $scope.initSetup();
        }
    ]); //END CONTROLLER

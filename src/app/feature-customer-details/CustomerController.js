angular.module('searchApp.customer', [])

.controller("CustomerController", [
    '$scope',
    '$timeout',
    '$rootScope',
    'serverLog',
    '$log',
    '$http',
    '$q',
    '$location',
    '$state',
    '$stateParams',
    '$filter',
    'esFactory',
    'client',
    '$element',
    '$compile',
    'Customer',
    'billingService',
    'customerData',
    'customerContract',
    'Weather',
    'Moments',
    //'uiGmapGoogleMapApi',
    //'uiGmapIsReady',
    'UserLocation',
    '$localStorage',
    'esbServices',
    'constants',
    'accountData',
    'caseConfig',
    'MasLibraries',
    function($scope,
        $timeout,
        $rootScope,
        serverLog,
        $log,
        $http,
        $q,
        $location,
        $state,
        $stateParams,
        $filter,
        esFactory,
        client,
        $element,
        $compile,
        Customer,
        billingService,
        customerData,
        customerContract,
        Weather,
        Moments,
        //uiGmapGoogleMapApi,
        //uiGmapIsReady,
        UserLocation,
        $localStorage,
        esbServices,
        constants,
        accountData,
        caseConfig,
        MasLibraries,
        routes,
        drivers
    ) {
        //this $ code doesn't belong here, move it to a directive link or something
        $scope.bindTabs = function() {
            var i = 0;
            var selector = 'ul.header-tabs li a.tab-link';
            $(selector).each(function() {
                i++;
                $(this).data('position', i);
            });
            angular.element('body').on('click', selector, function(e) {

                var $target = $(e.target);

                e.preventDefault();
                e.stopImmediatePropagation();

                // prevents using tab if disabled
                if ($target.attr('disabled') === 'disabled') {
                    return;
                }

                // shows the tab
                $target.tab('show');
            });
        };
        $scope.bindTabs();

        //move this to a service or something
        $scope.toggleAccordian = function(e) {

            $target = $(e.target);
            if (!$target.hasClass('tab-link')) {
                e.stopPropagation();
                e.preventDefault();
            }

            if ($target.hasClass('toggle-accordian')) {

                if ($target.hasClass('shut') && $target.hasClass('service-container')) {
                    $target.toggleClass('shut');
                    return true;
                }
                if ($target.closest('li.service-container')) {
                    $target.closest('li.service-container').toggleClass('shut');
                }
            }
        };


        $log.debug('[CONTROLLER] CustomerController', {
            'current state': $state.current.name
        });

        $scope.thisScopeIs = 'CustomerController';
        $scope.custData = $rootScope.currentCustomer;
        $scope.customer = {};
        $scope.weather = {};
        $scope.customerClock = {};
        $scope.city = undefined;
        $scope.Math = window.Math;
        $scope.isListShowing = false;
        $scope.inputArrowIsFlipped = false;
        $scope.iframePdfDisplay = false;

        var dateOrders = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

        $scope.$watch(function(scope) {
            return $scope.geocodedServiceAddress;
        }, function() {
            if (!!$scope.geocodedServiceAddress) {
                Weather.fetchWeather($scope.geocodedServiceAddress.lat, $scope.geocodedServiceAddress.lng).then(function(weather) {
                    var address = $scope.geocodedServiceAddress.formattedAddress.trim();
                    // if geocoded address is in canada, default unit of measure to Celcius, else continue displaying in F
                    if (address.substr(address.length - 6) === 'Canada') {
                        $scope.weather.uom = 'C';
                    } else {
                        $scope.weather.uom = 'F';
                    }
                    $scope.weather.temperature = weather.data.currently.temperature;
                    $scope.weather.temperatureC = (weather.data.currently.temperature - 32) * (5 / 9);
                    $scope.weather.icon = weather.data.currently.icon; //clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night
                    var el = $compile("<" + $scope.weather.icon + "></" + $scope.weather.icon + ">")($scope);
                    $element.find('weather').html('').append(el);
                });
            }
        });

        $scope.weatherUoMToggle = function() {
            $scope.weather.uom = $scope.weather.uom === 'F' ? 'C' : 'F';
        };

        $scope.showServiceDetails = function(serviceID) {
            $scope.clickedServiceID = serviceID;
            $scope.$emit('reveal', {
                'id': 'overlay-services-info',
                'action': "open",
                'clickedID': serviceID
            });
        };

        // $scope.isCaseClosable = function(item) {
        // if (item.status !== "CLOSED" ) {
        // return caseConfig.hasCaseCloseTemplate(item.details.category, item.details.sub_category);
        // }
        // return false;
        // };

        // $scope.showCaseCloseInputField = function(category, subCategory, inputFieldName) {
        //     if (category === undefined || subCategory === undefined) {
        //         return false;
        //     }
        //     var inputFieldArray = caseConfig.caseCloseRequiredFields[caseConfig.caseCloseTemplateIds[category][subCategory]];
        //     if (inputFieldArray.indexOf(inputFieldName) > -1) {
        //         return true;
        //     }
        //     return false;
        // };

        $scope.caseCloseProcessSteps = {
            'Loading': false,
            'Form': true,
            'Confirm': false,
            'CompletionCodeError': false,
            'Error': false,
            'PermissionDeniedError': false
        };

        var setCaseCloseProcessSteps = function(step) {
            var propArray = Object.keys($scope.caseCloseProcessSteps);
            for (var index in propArray) {
                if ($scope.caseCloseProcessSteps.hasOwnProperty(propArray[index])) {
                    $scope.caseCloseProcessSteps[propArray[index]] = false;
                }
            }
            // $scope.caseCloseProcessSteps[step] = true;
            if (step !== "Loading") {
                $timeout(function() {
                    $scope.caseCloseProcessSteps[step] = true;
                }, 775);
            } else {
                $scope.caseCloseProcessSteps[step] = true;
            }
        };

        $scope.showCaseCloseOverlay = function(item) {

            if (typeof $localStorage.loginInfo !== 'object') {
                $scope.$emit('show-login-to-unlock-modal');
                return;
            }
            var ezPayId = $scope.getField($scope.custData, "ezPayId");
            var category = item.details.category;
            var subCategory = item.details.sub_category;
            var library = $scope.custData._source.customer.wmMetaData.library;

            setCaseCloseProcessSteps("Loading");
            initCaseCloseMutable(item);
            $scope.caseCloseForm.$setPristine();

            var getCompletionCodesPromise = null,
                getRoutesPromise = null,
                getDriversPromise = null,
                Promise_Array = [];

            var getCompletionCodes = Customer.Cases.completioncodes(ezPayId, category, subCategory).get({
                'ezPayId': ezPayId
            });
            getCompletionCodesPromise = getCompletionCodes.$promise;

            Promise_Array.push(getCompletionCodesPromise);

            // Add based on Condition ---> CPL/DID
            if ($scope.caseCloseMutalbe.operations_rqd === true) {
                var getRoutes = MasLibraries.routes(library).get({
                    'libraryId': library
                });
                var getDrivers = MasLibraries.drivers(library).get({
                    'libraryId': library
                });

                getRoutesPromise = getRoutes.$promise;
                getDriversPromise = getDrivers.$promise;

                Promise_Array.push(getRoutesPromise);
                Promise_Array.push(getDriversPromise);
            }

            $q.all(Promise_Array).then(
                function(data) {
                    // console.log('[PROMISE] Response from $q.all()');
                    // console.log(data);
                    // data[0] ----> getCompletionCodesPromise Response
                    // data[1] ----> getRoutesPromise Response --- If
                    // data[2] ----> getDriversPromise Response --- If

                    if (!!data[0] && !!data[0].status) {
                        $log.debug("[REST] loaded case completion codes successful: ", data[0]);
                        // $scope.caseCloseProcessSteps.Loading = false;
                        $scope.caseCloseMutalbe.status_reason_code_options = data[0].status;
                        if (data[0].status.length === 1) {
                            // Select it if there is only one option!
                            $scope.caseCloseMutalbe.status_reason_code.selected = data[0].status[0];
                            $scope.caseCloseMutalbe.status_reason_code_invalid = false;
                            validateCaseCloseForm();
                        } else {

                        }
                    } else {
                        // setCaseCloseProcessSteps("CompletionCodeError");
                    }

                    // Add based on Condition ---> CPL/DID
                    if ($scope.caseCloseMutalbe.operations_rqd === true) {
                        if (!!data[1] && !!data[1].routes) {
                            // $scope.routes = getCaseCloseRoutesMatchList(data[1].routes, "");
                            $scope.caseCloseMutalbe.operations_routes_base = data[1].routes; // Filled with data from callouts
                            $scope.caseCloseMutalbe.operations_routes_match = getCaseCloseRoutesMatchList($scope.caseCloseMutalbe.operations_routes_base, "");
                            $scope.caseCloseMutalbe.operations_routes_list = getCaseCloseRoutesList();

                            // $scope.caseCloseMutalbe.route = {};
                        } else {
                            // Show Error message here
                        }

                        if (!!data[2] && !!data[2].drivers) {
                            // $scope.drivers = getCaseCloseDriversMatchList(data[2].drivers, "");
                            $scope.caseCloseMutalbe.operations_drivers_base = data[2].drivers; // Filled with data from callouts
                            $scope.caseCloseMutalbe.operations_drivers_match = getCaseCloseDriversMatchList($scope.caseCloseMutalbe.operations_drivers_base, "");
                            $scope.caseCloseMutalbe.operations_drivers_list = getCaseCloseDriversList();
                            // $scope.caseCloseMutalbe.driver = {};
                        } else {
                            // Show Error message here
                        }
                    }
                    setCaseCloseProcessSteps("Form");
                    // $scope.$emit('doneWithOperationsCallouts', {});
                },
                function(error) {
                    setCaseCloseProcessSteps("CompletionCodeError");
                }
            );
            $scope.$emit('reveal', {
                'id': 'overlay-case-close',
                'action': "open",
                'clickedID': ""
            });
        };

        $scope.dateResolvedTextMaskConfig = {
            // guide: true,
            // keepCharPositions: true,
            // showMask: true,
            // placeholderChar: ' ',
            mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /[1-2]/, /[09]/, /\d/, /\d/]
                // pipe: autoCorrectedDatePipe
        };

        var initPageNation = function() {
            $scope.caseCloseMutalbe.operations_route_top_page = 0;
            $scope.caseCloseMutalbe.operations_driver_top_page = 0;
            $scope.caseCloseMutalbe.operations_route_bottom_page = 1;
            $scope.caseCloseMutalbe.operations_driver_bottom_page = 1;
        };

        var getCaseCloseRoutesMatchList = function(list, search) {
            var resultArray = [];
            if (!!search && search.length > 0) {
                var sifter = new Sifter($scope.caseCloseMutalbe.operations_routes_base); // Need replacement here
                var result = sifter.search(search, {
                    fields: ['code', 'description', 'day_of_week'],
                    sort: [{
                            field: 'description',
                            direction: 'asc'
                        }]
                        // limit: 50,
                });

                for (var i = 0; i < result.items.length; i++) {
                    var item = $scope.caseCloseMutalbe.operations_routes_base[result.items[i].id];
                    item.name = [item.code, item.description, item.day_of_week].join(' - ');
                    item.displayLabel = item.code;
                    resultArray.push(item);
                    item = null;
                }

            } else {
                for (var j = 0; j < $scope.caseCloseMutalbe.operations_routes_base.length; j++) {
                    var item1 = $scope.caseCloseMutalbe.operations_routes_base[j];
                    item1.name = [item1.code, item1.description, item1.day_of_week].join(' - ');
                    item1.displayLabel = item1.code;
                    resultArray.push(item1);
                    item1 = null;
                }
            }
            return resultArray;
        };

        var getCaseCloseDriversMatchList = function(list, search) {
            var resultArray = [];
            if (!!search && search.length > 0) {
                var sifter = new Sifter($scope.caseCloseMutalbe.operations_drivers_base); // Need replacement here
                var result = sifter.search(search, {
                    fields: ['code', 'code_description', 'id', 'status', 'status_description'],
                    sort: [{
                            field: 'code',
                            direction: 'asc'
                        }]
                        // limit: 50,
                });

                for (var k = 0; k < result.items.length; k++) {
                    var item = $scope.caseCloseMutalbe.operations_drivers_base[result.items[k].id];
                    item.name = [item.code, item.code_description, item.id, item.status, item.status_description].join(' - ');
                    item.displayLabel = [item.code, item.code_description].join(' - ');
                    resultArray.push(item);
                    item = null;
                }

            } else {
                for (var l = 0; l < $scope.caseCloseMutalbe.operations_drivers_base.length; l++) {
                    var item2 = $scope.caseCloseMutalbe.operations_drivers_base[l];
                    item2.name = [item2.code, item2.code_description, item2.id, item2.status, item2.status_description].join(' - ');
                    item2.displayLabel = [item2.code, item2.code_description].join(' - ');
                    resultArray.push(item2);
                    item2 = null;
                }
            }
            return resultArray;
        };

        var getCaseCloseRoutesList = function(pos) {
            // console.log('\n');
            // console.log('!---!---!---!---!---!---!---!---!---!---!---!---!');
            var maxPage = Math.ceil($scope.caseCloseMutalbe.operations_routes_match.length / $scope.caseCloseMutalbe.operations_page_size) + 1;
            //console.log("[ROUTE] Max page: " + maxPage);
            var fullSize = $scope.caseCloseMutalbe.operations_route_bottom_page - $scope.caseCloseMutalbe.operations_route_top_page === $scope.caseCloseMutalbe.operations_max_resi_page;

            if (fullSize) {
                if (pos === "bottom" && $scope.caseCloseMutalbe.operations_route_bottom_page < maxPage) {
                    $scope.caseCloseMutalbe.operations_route_bottom_page++;
                    $scope.caseCloseMutalbe.operations_route_top_page++;
                } else if (pos === "top" && $scope.caseCloseMutalbe.operations_route_top_page > 0) {
                    $scope.caseCloseMutalbe.operations_route_top_page--;
                    $scope.caseCloseMutalbe.operations_route_bottom_page--;
                }
            } else {
                if (pos === "bottom" && $scope.caseCloseMutalbe.operations_route_bottom_page < maxPage) {
                    $scope.caseCloseMutalbe.operations_route_bottom_page++;
                } else if (pos === "top" && $scope.caseCloseMutalbe.operations_route_top_page > 0) {
                    $scope.caseCloseMutalbe.operations_route_top_page--;
                }
            }

            var begin = $scope.caseCloseMutalbe.operations_route_top_page * $scope.caseCloseMutalbe.operations_page_size;

            var end = $scope.caseCloseMutalbe.operations_route_bottom_page * $scope.caseCloseMutalbe.operations_page_size;
            if (end > $scope.caseCloseMutalbe.operations_routes_match.length) {
                end = $scope.caseCloseMutalbe.operations_routes_match.length;
                // $scope.caseCloseMutalbe.operations_route_bottom_page --;
            }
            // console.log("[ROUTE] Top page: " + $scope.caseCloseMutalbe.operations_route_top_page);
            // console.log("[ROUTE] Bottom page: " + $scope.caseCloseMutalbe.operations_route_bottom_page);
            // console.log("[ROUTE] Array size: " + $scope.caseCloseMutalbe.operations_routes_match.length);
            return $scope.caseCloseMutalbe.operations_routes_match.slice(begin, end);
        };

        var getCaseCloseDriversList = function(pos) {
            // console.log('\n');
            // console.log('!--@--@--@--@--@--@--@--@--@--@--@--@--@--@--@--!');
            var maxPage = Math.ceil($scope.caseCloseMutalbe.operations_drivers_match.length / $scope.caseCloseMutalbe.operations_page_size) + 1;
            // console.log("[DRIVER] Max page: " + maxPage);
            var fullSize = $scope.caseCloseMutalbe.operations_driver_bottom_page - $scope.caseCloseMutalbe.operations_driver_top_page === $scope.caseCloseMutalbe.operations_max_resi_page;

            if (fullSize) {
                if (pos === "bottom" && $scope.caseCloseMutalbe.operations_driver_bottom_page < maxPage) {
                    $scope.caseCloseMutalbe.operations_driver_bottom_page++;
                    $scope.caseCloseMutalbe.operations_driver_top_page++;
                } else if (pos === "top" && $scope.caseCloseMutalbe.operations_driver_top_page > 0) {
                    $scope.caseCloseMutalbe.operations_driver_top_page--;
                    $scope.caseCloseMutalbe.operations_driver_bottom_page--;
                }
            } else {
                if (pos === "bottom" && $scope.caseCloseMutalbe.operations_driver_bottom_page < maxPage) {
                    $scope.caseCloseMutalbe.operations_driver_bottom_page++;
                } else if (pos === "top" && $scope.caseCloseMutalbe.operations_driver_top_page > 0) {
                    $scope.caseCloseMutalbe.operations_driver_top_page--;
                }
            }

            var begin = $scope.caseCloseMutalbe.operations_driver_top_page * $scope.caseCloseMutalbe.operations_page_size;

            var end = $scope.caseCloseMutalbe.operations_driver_bottom_page * $scope.caseCloseMutalbe.operations_page_size;
            if (end > $scope.caseCloseMutalbe.operations_drivers_match.length) {
                end = $scope.caseCloseMutalbe.operations_drivers_match.length;
                // $scope.caseCloseMutalbe.operations_driver_bottom_page --;
            }

            // console.log("[DRIVER] Top page: " + $scope.caseCloseMutalbe.operations_driver_top_page);
            // console.log("[DRIVER] Bottom page: " + $scope.caseCloseMutalbe.operations_driver_bottom_page);
            // console.log("[DRIVER] Array size: " + $scope.caseCloseMutalbe.operations_drivers_match.length);
            return $scope.caseCloseMutalbe.operations_drivers_match.slice(begin, end);
        };

        $scope.caseCloseAddMoreRouteItems = function($select, $event, pos) {
            // console.log("[ROUTE] Add more Route items called. Position: " + pos);
            // console.log("[ROUTE] Scroll switch: " + $scope.caseCloseMutalbe.operations_route_scroll_switch);
            if ($scope.caseCloseMutalbe.operations_route_scroll_switch === "on") {
                $scope.caseCloseMutalbe.operations_route_scroll_switch = "off";
                $scope.caseCloseMutalbe.operations_routes_list = getCaseCloseRoutesList(pos);
                //console.log("[ROUTE] User array size: " + $scope.caseCloseMutalbe.operations_routes_list.length);
                $timeout(function() {
                    $scope.caseCloseMutalbe.operations_route_scroll_switch = "on";
                }, 200);
            }
        };

        $scope.caseCloseAddMoreDriverItems = function($select, $event, pos) {
            // console.log("[DRIVER] Add more Driver items called. Position: " + pos);
            // console.log("[DRIVER] Scroll switch: " + $scope.caseCloseMutalbe.operations_driver_scroll_switch);
            if ($scope.caseCloseMutalbe.operations_driver_scroll_switch === "on") {
                $scope.caseCloseMutalbe.operations_driver_scroll_switch = "off";
                $scope.caseCloseMutalbe.operations_drivers_list = getCaseCloseDriversList(pos);
                //console.log("[DRIVER] Driver array size: " + $scope.caseCloseMutalbe.operations_drivers_list.length);
                $timeout(function() {
                    $scope.caseCloseMutalbe.operations_driver_scroll_switch = "on";
                }, 200);
            }
        };

        $scope.caseCloseRrefreshRouteResults = function($select) {
            var search = $select.search,
                list = angular.copy($select.items),
                FLAG = -1;
            //remove last user input
            list = list.filter(function(item) {
                return item.id !== FLAG;
            });

            if (!search) {
                //use the predefined list
                $select.items = list;
            } else {
                //manually add user input and set selection
                var userInputItem = {
                    id: FLAG,
                    // description: search
                    name: search,
                    displayLabel: search
                };
                $select.items = [userInputItem].concat(list);
                $select.selected = userInputItem;
                //console.log('No route found, manually create and add this route', $select.items, $select.selected);
            }
        };

        $scope.caseCloseRefreshDriverResults = function($select) {
            var search = $select.search,
                list = angular.copy($select.items),
                FLAG = -1;
            //remove last user input
            list = list.filter(function(item) {
                return item.id !== FLAG;
            });
            if (!search) {
                //use the predefined list
                $select.items = list;
            } else {
                //manually add user input and set selection
                var userInputItem = {
                    id: FLAG,
                    // description: search
                    name: search
                };
                // $select.items = [userInputItem].concat(list);
                $select.selected = userInputItem;
            }
        };

        $scope.caseCloseOnRouteChange = function($select) {
            //console.log("[ROUTE] On route change called");
            var search = $select.search;
            // console.log("[ROUTE] Search string: " + search);
            // console.log("[ROUTE] Routes Size: " + $scope.caseCloseMutalbe.operations_routes_match.length);
            var resultArray = getCaseCloseRoutesMatchList($scope.caseCloseMutalbe.operations_routes_base, search);
            $scope.caseCloseMutalbe.operations_routes_match = resultArray;
            initPageNation();
            $scope.caseCloseMutalbe.operations_routes_list = getCaseCloseRoutesList();

            // Validation Here
            if ($scope.caseCloseMutalbe.operations_route_id === undefined) {
                $scope.caseCloseMutalbe.operations_route_id_invalid = true;
            } else {
                $scope.caseCloseMutalbe.operations_route_id_invalid = false;
            }
            validateCaseCloseForm();
        };

        $scope.caseCloseOnDriverChange = function($select) {
            if (!$scope.caseCloseMutalbe.operations_driver_dropdown_touched) {
                $scope.caseCloseMutalbe.operations_driver_dropdown_touched = true;
            }
            //console.log("[DRIVER] On driver change called");
            var search = $select.search;
            // console.log("[DRIVER] Search string: " + search);
            // console.log("[DRIVER] Drivers Size: " + $scope.caseCloseMutalbe.operations_drivers_match.length);
            var resultArray = getCaseCloseDriversMatchList($scope.caseCloseMutalbe.operations_drivers_base, search);
            $scope.caseCloseMutalbe.operations_drivers_match = resultArray;
            initPageNation();
            $scope.caseCloseMutalbe.operations_drivers_list = getCaseCloseDriversList();

            // Validation Here
            if ($scope.caseCloseMutalbe.operations_driver_name === undefined) {
                $scope.caseCloseMutalbe.operations_driver_invalid = true;
            } else {
                $scope.caseCloseMutalbe.operations_driver_invalid = false;
            }
            validateCaseCloseForm();
        };

        $scope.onDriverDropdownOpenClose = function(isOpen) {
            if (isOpen) {
                $scope.caseCloseMutalbe.operations_driver_dropdown_warning = false;
            }
            if (!isOpen) {
                if ($scope.caseCloseMutalbe.operations_driver_dropdown_touched) {
                    if ($scope.caseCloseMutalbe.operations_driver_name.selected.id === -1) {
                        //console.log('Reset Driver-Dropdown here');
                        $scope.caseCloseMutalbe.operations_driver_invalid = true;
                        $scope.caseCloseMutalbe.operations_driver_dropdown_warning = true;
                        $scope.caseCloseMutalbe.operations_driver_name = {};
                        $scope.caseCloseMutalbe.operations_drivers_match = getCaseCloseDriversMatchList($scope.caseCloseMutalbe.operations_drivers_base, "");
                        initPageNation();
                        $scope.caseCloseMutalbe.operations_drivers_list = getCaseCloseDriversList();
                        validateCaseCloseForm();
                    }
                }
            }
        };

       // $scope.caseCloseMutalbe = {};
        var initCaseCloseMutable = function(item) {
            var email = $localStorage.loginInfo.mail;
            var userid = email.substring(0, email.indexOf("@")).toUpperCase();

            $scope.caseCloseMutalbe = {
                // Key references
                "case_id": item.id,
                "category_cd": item.details.category,
                "sub_category_cd": item.details.sub_category,

                // All input fields
                "status": "CLOSED",
                "status_reason_code": {}, // a space needed initialzation
                "complaint": "",
                "issue": "",
                "corrective_action": "",
                "preventive_action": "",
                "date_resolved": moment().format('MM/DD/YYYY'),
                "resolution": "",
                "operations": "dummy",
                "operations_route_id": {},
                "operations_driver_name": {},
                "container": "",
                "action_taken": "",
                "notes": "dummy",
                "notes_comment": "",
                "notes_is_internal": "Y",
                "notes_populate_customer_comment": "Y",
                "requestor": "dummy",
                "requestor_id": userid,

                // Utility fields
                "status_reason_code_options": [],
                //"operations_route_id_options": [],
                "status_reason_code_invalid": true,
                "operations_route_id_invalid": true,
                "operations_driver_invalid": true,
                "date_resolved_min": moment(item.details.requested_date_time).format('MM/DD/YYYY'),
                "date_resolved_max": moment().format('MM/DD/YYYY'),
                "notes_is_internal_dspl": "Make notes internal",
                "notes_populate_customer_comment_dspl": "Populate customer comment",
                "resolution_max_count_violation_120": false,
                "complaint_max_count_violation_120": false,
                "issue_max_count_violation_120": false,
                "corrective_action_max_count_violation_120": false,
                "preventive_action_max_count_violation_120": false,
                "container_max_count_violation_120": false,
                "action_taken_max_count_violation_120": false,
                "notes_comment_max_count_violation_255": false,
                "date_resolved_invalid": false,
                "complaint_cnt": "120",
                "issue_cnt": "120",
                "corrective_action_cnt": "120",
                "preventive_action_cnt": "120",
                "resolution_cnt": "120",
                "container_cnt": "120",
                "action_taken_cnt": "120",
                "notes_comment_cnt": "255",
                "close_button_disabled": true,

                // flags to dynamically show/hide inputs per combination of case cetegory/sub-category
                "status_rqd": false,
                "status_reason_code_rqd": false,
                "complaint_rqd": false,
                "issue_rqd": false,
                "corrective_action_rqd": false,
                "preventive_action_rqd": false,
                "date_resolved_rqd": false,
                "resolution_rqd": false,
                "operations_rqd": false,
                "container_rqd": false,
                "action_taken_rqd": false,
                "notes_rqd": false,
                "requestor_rqd": false,
                "route_rqd": false,

                // Flags for infinite Scroll - Common Params
                "operations_page_size": 50,
                "operations_route_top_page": 0,
                "operations_route_bottom_page": 1,
                "operations_driver_top_page": 0,
                "operations_driver_bottom_page": 1,
                "operations_route_scroll_switch": "on",
                "operations_driver_scroll_switch": "on",
                "operations_max_resi_page": 5,

                // Secondary Array
                "operations_routes_base": [],
                "operations_drivers_base": [],

                // Match Array - Intermediate - Temp Array
                "operations_routes_match": [],
                "operations_drivers_match": [],

                // Final Data Objects
                "operations_routes_list": [],
                "operations_drivers_list": [],

                // Driver-Dropdown Specific Flags
                "operations_driver_dropdown_touched": false,
                "operations_driver_dropdown_warning": false,

            };

            var template = caseConfig.caseCloseTemplateIds[item.details.category][item.details.sub_category];
            var requiredInputFields = caseConfig.caseCloseRequiredFields[template];
            for (var i in requiredInputFields) {
                $scope.caseCloseMutalbe[requiredInputFields[i] + "_rqd"] = true;
            }

            var createAutoCorrectedDatePipe = function(dateFormat) {
                return function(conformedValue) {
                    var indexesOfPipedChars = [];
                    var dateFormatArray = dateFormat.split(/[^dmyHMS]+/);
                    var maxValue = {
                        'dd': 31,
                        'mm': 12,
                        'yy': 99,
                        'yyyy': 9999,
                        'HH': 24,
                        'MM': 59,
                        'SS': 59
                    };
                    var minValue = {
                        'dd': 1,
                        'mm': 1,
                        'yy': 0,
                        'yyyy': 1,
                        'HH': 0,
                        'MM': 0,
                        'SS': 0
                    };
                    var conformedValueArr = conformedValue.split('');

                    // Check first digit
                    dateFormatArray.forEach(function(format) {
                        var position = dateFormat.indexOf(format);
                        var maxFirstDigit = parseInt(maxValue[format].toString().substr(0, 1), 10);

                        if (parseInt(conformedValueArr[position], 10) > maxFirstDigit) {
                            conformedValueArr[position + 1] = conformedValueArr[position];
                            conformedValueArr[position] = 0;
                            indexesOfPipedChars.push(position);
                        }
                    });

                    // Check for invalid date
                    var isInvalid = dateFormatArray.some(function(format) {
                        var position = dateFormat.indexOf(format);
                        var length = format.length;
                        var textValue = conformedValue.substr(position, length).replace(/\D/g, '');
                        var value = parseInt(textValue, 10);

                        return value > maxValue[format] || (textValue.length === length && value < minValue[format]);
                    });

                    if (isInvalid) {
                        return false;
                    }

                    return {
                        value: conformedValueArr.join(''),
                        indexesOfPipedChars: indexesOfPipedChars
                    };
                };
            };

            if ($scope.caseCloseMutalbe.date_resolved_rqd) {
                var autoCorrectedDatePipe = createAutoCorrectedDatePipe('mm/dd/yyyy');

                $scope.dateResolvedTextMaskConfig.guide = true;
                $scope.dateResolvedTextMaskConfig.keepCharPositions = true;
                $scope.dateResolvedTextMaskConfig.showMask = true;
                $scope.dateResolvedTextMaskConfig.placeholderChar = ' ';
                // $scope.dateResolvedTextMaskConfig.mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /[1-2]/, /[09]/, /\d/, /\d/];
                $scope.dateResolvedTextMaskConfig.pipe = autoCorrectedDatePipe;
            }
        };

        $scope.validateCaseClose120CharMax = function(fieldName) {

            if ($scope.caseCloseMutalbe[fieldName] === undefined) {
                $scope.caseCloseMutalbe[fieldName] = "";
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_120"] = false;
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = "120";
            }
            var count = $scope.caseCloseMutalbe[fieldName].trim().length;
            if (count > 120) {
                $scope.caseCloseMutalbe[fieldName] = $scope.caseCloseMutalbe[fieldName].trim().substring(0, 120);
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = "000";
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_120"] = true;
                $timeout(function() {
                    $scope.caseCloseMutalbe[fieldName + "_max_count_violation_120"] = false;
                }, 2000);
            } else {
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_120"] = false;
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = ("000" + (120 - count)).slice(-3);
            }
            validateCaseCloseForm();
        };

        $scope.validateCaseClose255CharMax = function(fieldName) {

            if ($scope.caseCloseMutalbe[fieldName] === undefined) {
                $scope.caseCloseMutalbe[fieldName] = "";
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_255"] = false;
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = "255";
            }
            var count = $scope.caseCloseMutalbe[fieldName].trim().length;
            if (count > 255) {
                $scope.caseCloseMutalbe[fieldName] = $scope.caseCloseMutalbe[fieldName].trim().substring(0, 255);
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = "000";
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_255"] = true;
                $timeout(function() {
                    $scope.caseCloseMutalbe[fieldName + "_max_count_violation_255"] = false;
                }, 2000);
            } else {
                $scope.caseCloseMutalbe[fieldName + "_max_count_violation_255"] = false;
                $scope.caseCloseMutalbe[fieldName + "_cnt"] = ("000" + (255 - count)).slice(-3);
            }
        };

        $scope.onCaseCloseSwitchChange = function(fieldName) {
            if (fieldName === "notes_is_internal") {
                if ($scope.caseCloseMutalbe.notes_is_internal == "Y") {
                    $scope.caseCloseMutalbe[fieldName + "_dspl"] = "Make notes internal";
                } else {
                    $scope.caseCloseMutalbe[fieldName + "_dspl"] = "Make notes public";
                }
            } else if (fieldName == "notes_populate_customer_comment") {
                if ($scope.caseCloseMutalbe.notes_populate_customer_comment == "Y") {
                    $scope.caseCloseMutalbe[fieldName + "_dspl"] = "Populate customer comment";
                } else {
                    $scope.caseCloseMutalbe[fieldName + "_dspl"] = "Omit customer comment";
                }
            }
        };

        $scope.onCaseCloseDateResolvedChanged = function() {
            if (moment($scope.caseCloseMutalbe.date_resolved, "MM/DD/YYYY", true).isValid()) {
                if (moment($scope.caseCloseMutalbe.date_resolved, "MM/DD/YYYY") > moment($scope.caseCloseMutalbe.date_resolved_max, "MM/DD/YYYY")) {
                    $scope.caseCloseMutalbe.date_resolved_invalid = true;
                } else if (moment($scope.caseCloseMutalbe.date_resolved, "MM/DD/YYYY") < moment($scope.caseCloseMutalbe.date_resolved_min, "MM/DD/YYYY")) {
                    $scope.caseCloseMutalbe.date_resolved_invalid = true;
                } else {
                    $scope.caseCloseMutalbe.date_resolved_invalid = false;
                }
            } else {
                $scope.caseCloseMutalbe.date_resolved_invalid = true;
            }
            validateCaseCloseForm();
        };

        $scope.onCaseCloseCompletionCodeChange = function($select) {
            if ($scope.caseCloseMutalbe.status_reason_code.selected === undefined) {
                $scope.caseCloseMutalbe.status_reason_code_invalid = true;
            } else {
                $scope.caseCloseMutalbe.status_reason_code_invalid = false;
            }
            validateCaseCloseForm();
        };

        var validateCaseCloseForm = function() {
            var template = caseConfig.caseCloseTemplateIds[$scope.caseCloseMutalbe.category_cd][$scope.caseCloseMutalbe.sub_category_cd];
            var requiredInputFields = caseConfig.caseCloseRequiredFields[template];
            for (var i in requiredInputFields) {
                var inputName = requiredInputFields[i];
                var requiredFlagName = inputName + "_rqd";
                if ($scope.caseCloseMutalbe[requiredFlagName]) {
                    if (inputName === "status_reason_code") {
                        if ($scope.caseCloseMutalbe.status_reason_code_invalid) {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                    } else if (inputName === "notes") {
                        // notes is an optional input field
                    } else if (inputName === "requestor") {
                        if (!$scope.caseCloseMutalbe.requestor_id || $scope.caseCloseMutalbe.requestor_id.trim().lengh < 1) {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                    } else if (inputName === "operations" || inputName === "route") {
                        if ($scope.caseCloseMutalbe.operations_route_id_invalid && template === "T2") {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                        if ($scope.caseCloseMutalbe.operations_driver_invalid) {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                    } else if (inputName === "date_resolved") {
                        if ($scope.caseCloseMutalbe.date_resolved_invalid) {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                    } else {
                        if (!$scope.caseCloseMutalbe[inputName] || $scope.caseCloseMutalbe[inputName].trim().length < 1) {
                            $scope.caseCloseMutalbe.close_button_disabled = true;
                            return;
                        }
                    }
                }
            }
            $scope.caseCloseMutalbe.close_button_disabled = false;
        };

        $scope.onCaseCloseSubmit = function() {

            //var ezPayId = $scope.getField($scope.custData, "ezPayId");
            var ezPayId = $scope.custData._source.customer.ezPayId;
            var category = $scope.caseCloseMutalbe.category_cd;
            var subCategory = $scope.caseCloseMutalbe.sub_category_cd;
            var template = caseConfig.caseCloseTemplateIds[category][subCategory];
            var requiredInputFields = caseConfig.caseCloseRequiredFields[template];
            var cases = {};

            for (var i in requiredInputFields) {
                var inputName = requiredInputFields[i];
                var requiredFlagName = inputName + "_rqd";
                if ($scope.caseCloseMutalbe[requiredFlagName]) {
                    if (inputName === "status_reason_code") {
                        cases.status_reason_code = $scope.caseCloseMutalbe.status_reason_code.selected.code;
                    } else if (inputName === "notes") {
                        if ($scope.caseCloseMutalbe.notes_comment != null && $scope.caseCloseMutalbe.notes_comment != "" && typeof $scope.caseCloseMutalbe.notes_comment != undefined) {
                            cases.notes = [{
                                comment: $scope.caseCloseMutalbe.notes_comment,
                                is_internal: $scope.caseCloseMutalbe.notes_is_internal,
                                populate_customer_comment: $scope.caseCloseMutalbe.notes_populate_customer_comment
                            }];
                        }
                    } else if (inputName === "requestor") {
                        // cases["requestor"] = {};
                        cases.requestor = {};
                        cases.requestor.id = $scope.caseCloseMutalbe.requestor_id;
                    } else if (inputName === "operations") {
                        if (template === "T2") {
                            var routeId = "";
                            if ($scope.caseCloseMutalbe.operations_route_id.selected.code) {
                                routeId = $scope.caseCloseMutalbe.operations_route_id.selected.code;
                            } else {
                                routeId = $scope.caseCloseMutalbe.operations_route_id.selected.name;
                            }
                            cases.operations = {
                                route_id: routeId,
                                driver_name: $scope.caseCloseMutalbe.operations_driver_name.selected.code
                            };
                        } else {
                            cases.operations = {
                                driver_name: $scope.caseCloseMutalbe.operations_driver_name.selected.code
                            };
                        }
                    } else if (inputName === "date_resolved") {
                        cases.date_resolved = moment($scope.caseCloseMutalbe.date_resolved, 'MM/DD/YYYY').format('YYYY-MM-DD');
                    } else {
                        cases[inputName] = $scope.caseCloseMutalbe[inputName];
                    }
                }
            }

            var data = {
                "cases": cases
            };
            $log.info("Case Close final data to PUT: " + JSON.stringify(data));
            var lob = "";
            var caseId = $scope.caseCloseMutalbe.case_id;
            var case_api = Customer.Cases.case(parseInt(ezPayId), caseId, lob).put({
                'ezPayId': parseInt(ezPayId),
                'caseId': caseId
            }, data);

            setCaseCloseProcessSteps("Loading");
            case_api.$promise.then(function(result) {
                if (result.status === "Success") {
                    setCaseCloseProcessSteps("Confirm");
                    $timeout(function() {
                        $scope.$emit('mas-case-closed-modal', {});
                        // $scope.$emit('reveal', {
                        //     'id': 'overlay-case-close',
                        //     'action': "close",
                        //     'clickedID': ""
                        // });
                    }, 3000);
                }
                // $log.debug("[REST] Close case Successful: ", result);
                serverLog.send({
                    'isCaseCloseSuccessful': true,
                    'result': '[REST] Close case Successful',
                    'data': result
                });
            }).catch(function(error) {
                // $log.debug("[REST] Close case Error ", error);

                //console.log(error);
                serverLog.send({
                    'isCaseCloseSuccessful': false,
                    'result': '[REST] Close case Error ',
                    'data': error
                });
                if (error.status === 403 || error.status === 404) {
                    setCaseCloseProcessSteps("PermissionDeniedError");
                } else {
                    setCaseCloseProcessSteps("Error");
                }
            }).finally(function() {});
        };

        $scope.showContactsEdit = function() {

            if (typeof $localStorage.loginInfo !== 'object') {
                $scope.$emit('show-login-to-unlock-modal');
            } else {
                $scope.contactEditSaveButtonClass = "active";
                //              if(typeof $scope.custDataMutable !== 'object'){
                $scope.initCustDataMutable();
                //              }

                $scope.$emit('reveal', {
                    'id': 'overlay-contacts-edit',
                    'action': "open",
                    'clickedID': ""
                });
            }
        };

        $scope.initCustDataMutable = function() {

            $scope.custDataMutable = {
                "ezPayId": $scope.getField($scope.custData, "ezPayId"),
                "loginId": $localStorage.loginInfo.mail,
                'contactDataChanged': false,
                'serviceEmailChanged': false,
                'serviceEmailInvalidFlag': false,
                'billingEmailChanged': false,
                'billingEmailInvalidFlag': false,
                'billingAddressChanged': false,
                'billingAddressValidFlag': false,
                'billingAddressOverwriteFlag': false,
                'addressCleanseFailureFlag': false,
                'showFormChangeWarning': false,
                'saveFailureFlag': false,
                "serviceContactName": $scope.getField($scope.custData, "serviceContactName") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "serviceContactName")),
                "serviceStreet": $scope.getField($scope.custData, "serviceStreet") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "serviceStreet")),
                'serviceCity': $scope.getField($scope.custData, 'serviceCity') == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, 'serviceCity')),
                'serviceState': $scope.getField($scope.custData, 'serviceState') == constants.whitespace ? "" : $scope.getField($scope.custData, 'serviceState'),
                'serviceCountry': $scope.getField($scope.custData, 'serviceCountry'),
                'serviceZip': $scope.getField($scope.custData, 'serviceZip') == constants.whitespace ? "" : $scope.getField($scope.custData, 'serviceZip'),
                'serviceMobilePhone': $scope.getField($scope.custData, 'serviceMobilePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'serviceMobilePhone')),
                'serviceOfficePhone': $scope.getField($scope.custData, 'serviceOfficePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'serviceOfficePhone')),
                'serviceOfficePhoneExt': "",
                'serviceFax': $scope.getField($scope.custData, 'serviceFax') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'serviceFax')),
                'serviceEmail': $scope.getField($scope.custData, 'serviceEmail') == constants.whitespace ? "" : $scope.getField($scope.custData, 'serviceEmail'),
                "billingName": $scope.getField($scope.custData, "billingName") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "billingName")),
                "billingContactName": $scope.getField($scope.custData, "billingContactName") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "billingContactName")),
                "billingStreetLn1": $scope.getField($scope.custData, "billingStreet") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "billingStreet")),
                "billingStreetLn2": "",
                'billingCity': $scope.getField($scope.custData, 'billingCity') == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, 'billingCity')),
                'billingState': $scope.getField($scope.custData, 'billingState') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingState'),
                'billingCountry': $scope.getField($scope.custData, 'billingCountry'),
                'billingZip': $scope.getField($scope.custData, 'billingZip') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingZip'),
                'billingMobilePhone': $scope.getField($scope.custData, 'billingMobilePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'billingMobilePhone')),
                'billingOfficePhone': $scope.getField($scope.custData, 'billingOfficePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'billingOfficePhone')),
                'billingOfficePhoneExt': "",
                'billingFax': $scope.getField($scope.custData, 'billingFax') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'billingFax')),
                'billingEmail': $scope.getField($scope.custData, 'billingEmail') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingEmail'),
                "billingStreetLn1Clnsd": "",
                "billingStreetLn2Clnsd": "",
                'billingCityClnsd': "",
                'billingStateClnsd': "",
                'billingCountryClnsd': "",
                'billingZipClnsd': "",
                'billingAddress': "",
                'billingAddressClnsd': "",
                'validComments': true,
                'choice': "",
                'changeReasons': ["", "Returned mail", "Customer Requested Change"]

            };

        };

        $scope.showNoteEdit = function() {

            if (typeof $localStorage.loginInfo !== 'object') {
                $scope.$emit('show-login-to-unlock-modal');
            } else {
                $scope.noteEditSaveButtonClass = "active";
                $scope.initNoteDataMutable();

                $scope.$emit('reveal', {
                    'id': 'overlay-note-edit',
                    'action': "open",
                    'clickedID': ""
                });

                setTimeout(function() {
                    window.document.getElementById('editComment').focus();
                });

            }
        };

        $scope.initNoteDataMutable = function() {

            $scope.noteDataMutable = {
                "ezPayId": $scope.getField($scope.custData, "ezPayId"),
                "loginId": $localStorage.loginInfo.mail,
                'showFormChangeWarning': false,
                'saveFailureFlag': false,
                'processing': false,
                'validComments': true,
                'comment': ""

            };

        };

        $scope.isNoteEditCommentValid = function() {

            $scope.noteDataMutable.processing = true;

            if (!$scope.noteDataMutable.comment || $scope.noteDataMutable.comment.length === 0) {
                $scope.noteDataMutable.validComments = false;
                $scope.noteDataMutable.processing = false;
                return false;
            } else {
                $scope.noteDataMutable.validComments = true;
                return true;
            }
        };

        $scope.resetEmailStatus = function(obj) {
            $scope.custDataMutable[obj] = false;
            $scope.custDataMutable.showFormChangeWarning = false;
            $scope.custDataMutable.saveFailureFlag = false;
            return true;
        };

        $scope.resetAddressStatus = function() {
            $scope.custDataMutable.addressCleanseFailureFlag = false;
            return true;
        };

        $scope.resetFormStatus = function() {
            $scope.custDataMutable.showFormChangeWarning = false;
            $scope.custDataMutable.saveFailureFlag = false;
            return true;
        };

        $scope.resetNoteFormStatus = function() {
            $scope.noteDataMutable.showFormChangeWarning = false;
            $scope.noteDataMutable.saveFailureFlag = false;
            return true;
        };

        //        $scope.onContactEditReset = function() {
        //          $scope.initCustDataMutable();
        //        };

        $scope.isContactEditFormChanged = function() {

            $scope.custDataMutable.contactDataChanged = false;
            $scope.custDataMutable.serviceEmailChanged = false;
            $scope.custDataMutable.billingEmailChanged = false;
            var serviceContactNameOld = $scope.getField($scope.custData, "serviceContactName") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "serviceContactName"));
            var serviceMobilePhoneOld = $scope.getField($scope.custData, 'serviceMobilePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'serviceMobilePhone'));
            var serviceOfficePhoneOld = $scope.getField($scope.custData, 'serviceOfficePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'serviceOfficePhone'));
            var serviceEmailOld = $scope.getField($scope.custData, 'serviceEmail') == constants.whitespace ? "" : $scope.getField($scope.custData, 'serviceEmail');

            var billingContactNameOld = $scope.getField($scope.custData, "billingContactName") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "billingContactName"));
            var billingStreetOld = $scope.getField($scope.custData, "billingStreet") == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, "billingStreet"));
            var billingCityOld = $scope.getField($scope.custData, 'billingCity') == constants.whitespace ? "" : $filter('capitalize')($scope.getField($scope.custData, 'billingCity'));
            var billingStateOld = $scope.getField($scope.custData, 'billingState') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingState');
            var billingCountryOld = $scope.getField($scope.custData, 'billingCountry');
            var billingZipOld = $scope.getField($scope.custData, 'billingZip') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingZip');
            var billingMobilePhoneOld = $scope.getField($scope.custData, 'billingMobilePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'billingMobilePhone'));
            var billingOfficePhoneOld = $scope.getField($scope.custData, 'billingOfficePhone') == constants.whitespace ? "" : $filter('tel')($scope.getField($scope.custData, 'billingOfficePhone'));
            var billingEmailOld = $scope.getField($scope.custData, 'billingEmail') == constants.whitespace ? "" : $scope.getField($scope.custData, 'billingEmail');

            var serviceMobilePhoneNew = $filter('tel')($scope.custDataMutable.serviceMobilePhone);
            var serviceOfficePhoneNew = $filter('tel')($scope.custDataMutable.serviceOfficePhone);
            var billingMobilePhoneNew = $filter('tel')($scope.custDataMutable.billingMobilePhone);
            var billingOfficePhoneNew = $filter('tel')($scope.custDataMutable.billingOfficePhone);
            var billingStreetNew = $scope.custDataMutable.billingStreetLn1.trim() + " " + $scope.custDataMutable.billingStreetLn2.trim();

            if ($scope.custDataMutable.serviceContactName.toLowerCase().trim() != serviceContactNameOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.serviceContactName = $filter('capitalize')($scope.custDataMutable.serviceContactName);
            }
            if (serviceMobilePhoneNew.trim() != serviceMobilePhoneOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.serviceMobilePhone = $filter('tel')($scope.custDataMutable.serviceMobilePhone);
            }
            if (serviceOfficePhoneNew != serviceOfficePhoneOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.serviceOfficePhone = $filter('tel')($scope.custDataMutable.serviceOfficePhone);
            }
            if ($scope.custDataMutable.serviceEmail.trim() != serviceEmailOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.serviceEmailChanged = true;
                //$scope.custDataMutable.serviceEmail = $filter('capitalize')($scope.custDataMutable.serviceEmail);
            }
            if (billingStreetNew.toLowerCase().trim() != billingStreetOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingAddressChanged = true;
                $scope.custDataMutable.billingStreetLn1 = $filter('capitalize')($scope.custDataMutable.billingStreetLn1);
                $scope.custDataMutable.billingStreetLn2 = $filter('capitalize')($scope.custDataMutable.billingStreetLn2);
            }
            if ($scope.custDataMutable.billingCity.toLowerCase().trim() != billingCityOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingAddressChanged = true;
                $scope.custDataMutable.billingCity = $filter('capitalize')($scope.custDataMutable.billingCity);
            }
            if ($scope.custDataMutable.billingState.toLowerCase().trim() != billingStateOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingAddressChanged = true;
                $scope.custDataMutable.billingState = $scope.custDataMutable.billingState.toUpperCase();
            }
            if ($scope.custDataMutable.billingZip.toLowerCase().trim() != billingZipOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingAddressChanged = true;
                $scope.custDataMutable.billingZip = $scope.custDataMutable.billingZip.toUpperCase();
            }
            if ($scope.custDataMutable.billingContactName.toLowerCase().trim() != billingContactNameOld.toLowerCase().trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingContactName = $filter('capitalize')($scope.custDataMutable.billingContactName);
            }
            if (billingMobilePhoneNew.trim() != billingMobilePhoneOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingMobilePhone = $filter('tel')($scope.custDataMutable.billingMobilePhone);
            }
            if (billingOfficePhoneNew.trim() != billingOfficePhoneOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingOfficePhone = $filter('tel')($scope.custDataMutable.billingOfficePhone);
            }
            if ($scope.custDataMutable.billingEmail.trim() != billingEmailOld.trim()) {
                $scope.custDataMutable.contactDataChanged = true;
                $scope.custDataMutable.billingEmailChanged = true;
                //$scope.custDataMutable.billingEmail = $filter('capitalize')($scope.custDataMutable.billingEmail);
            }

            return $scope.custDataMutable.contactDataChanged;
        };

        //      $scope.onOtherCommentChange = function() {
        //          $scope.onCommentSelect("opt4");
        //          $scope.custDataMutable.comments = $scope.custDataMutable.otherComment;
        //      };

        $scope.onContactEditNext = function() {

            var beforeGotoNext = function() {

                if ($scope.custDataMutable.billingAddressChanged) {

                    $scope.cleanseAddress().then(function(result) {
                        // populate custDataMutable object with cleansed address
                        // ESB cleanse address service populate "null" for empty
                        // return fields, need to filter them out!
                        var address = JSON.parse(JSON.stringify(result));
                        $log.debug(address);
                        $scope.custDataMutable.billingAddressValidFlag = address.cleansed == "true" ? true : false;
                        $scope.custDataMutable.billingAddressOverwriteFlag = !$scope.custDataMutable.billingAddressValidFlag;
                        $scope.custDataMutable.billingStreetLn1Clnsd = address.address.street1 == "null" ? "" : address.address.street1.trim();
                        $scope.custDataMutable.billingStreetLn2Clnsd = address.address.street2 == "null" ? "" : address.address.street2.trim();
                        $scope.custDataMutable.billingCityClnsd = address.address.city == "null" ? "" : address.address.city.trim();
                        $scope.custDataMutable.billingStateClnsd = address.address.state == "null" ? "" : address.address.state.trim();
                        $scope.custDataMutable.billingCountryClnsd = address.address.country == "null" ? "" : address.address.country.trim();
                        var zip = address.address.zip == "null" ? "" : address.address.zip.trim();
                        var zip4 = "";
                        if (address.address.zip4 !== undefined && address.address.zip4 != "null") {
                            zip4 = address.address.zip4.trim();
                        }
                        if (zip4 && zip4.trim().lengh > 0) {
                            $scope.custDataMutable.billingZipClnsd = zip + "-" + zip4;
                        } else {
                            $scope.custDataMutable.billingZipClnsd = zip;
                        }

                        if ($scope.custDataMutable.billingStreetLn2) {
                            $scope.custDataMutable.billingAddress = $scope.custDataMutable.billingStreetLn1 + "\n" +
                                $scope.custDataMutable.billingStreetLn2 + "\n" +
                                $scope.custDataMutable.billingCity + " " + $scope.custDataMutable.billingState + " " + $scope.custDataMutable.billingZip;
                        } else {
                            $scope.custDataMutable.billingAddress = $scope.custDataMutable.billingStreetLn1 + "\n" +
                                $scope.custDataMutable.billingCity + " " + $scope.custDataMutable.billingState + " " + $scope.custDataMutable.billingZip;
                        }

                        if ($scope.custDataMutable.billingStreetLn2Clnsd) {
                            $scope.custDataMutable.billingAddressClnsd = $scope.custDataMutable.billingStreetLn1Clnsd + "\n" +
                                $scope.custDataMutable.billingStreetLn2Clnsd + "\n" +
                                $scope.custDataMutable.billingCityClnsd + " " + $scope.custDataMutable.billingStateClnsd + " " + $scope.custDataMutable.billingZipClnsd;
                        } else {
                            $scope.custDataMutable.billingAddressClnsd = $scope.custDataMutable.billingStreetLn1Clnsd + "\n" +
                                $scope.custDataMutable.billingCityClnsd + " " + $scope.custDataMutable.billingStateClnsd + " " + $scope.custDataMutable.billingZipClnsd;
                        }

                        gotoNext();

                    }, function(error) {
                        $log.debug("[REST] address cleanse failed. " + error);
                        $scope.custDataMutable.addressCleanseFailureFlag = true;
                    });

                } else {
                    gotoNext();
                }

            };

            var gotoNext = function() {

                $scope.$emit('reveal', {
                    'id': 'overlay-contacts-edit',
                    'action': "close",
                    'clickedID': ""
                });

                if ($scope.custDataMutable.billingAddressChanged) {
                    $scope.$emit('reveal', {
                        'id': 'overlay-contacts-edit-confirm',
                        'action': "open",
                        'clickedID': ""
                    });
                } else {
                    $scope.$emit('reveal', {
                        'id': 'overlay-contacts-edit-reason',
                        'action': "open",
                        'clickedID': ""
                    });
                }

            };

            if ($scope.isContactEditFormChanged()) {
                if ($scope.custDataMutable.billingEmailChanged || $scope.custDataMutable.serviceEmailChanged) {
                    if ($scope.custDataMutable.billingEmailChanged && $scope.custDataMutable.serviceEmailChanged) {
                        if ($scope.custDataMutable.billingEmail.trim().length > 0 && $scope.custDataMutable.serviceEmail.trim().length > 0) {
                            $scope.cleanseEmail($scope.custDataMutable.billingEmail).then(function(result) {
                                var resultJson = JSON.stringify(result);
                                $log.debug("[REST] cleanse email returned. " + resultJson);
                                if (resultJson.indexOf("invalid") != -1) {
                                    $scope.custDataMutable.billingEmailInvalidFlag = true;
                                } else {
                                    $scope.cleanseEmail($scope.custDataMutable.serviceEmail).then(function(result) {
                                        var resultJson2 = JSON.stringify(result);
                                        $log.debug("[REST] cleanse email returned. " + resultJson2);
                                        if (resultJson2.indexOf("invalid") != -1) {
                                            $scope.custDataMutable.serviceEmailInvalidFlag = true;
                                        } else {
                                            beforeGotoNext();
                                        }
                                    }, function(error) {
                                        $log.debug("[REST] email cleanse error. For details: " + error);
                                    });
                                }
                            }, function(error) {
                                $log.debug("[REST] email cleanse error. For details: " + error);
                            });
                        } else if ($scope.custDataMutable.billingEmail.trim().length > 0) {
                            $scope.cleanseEmail($scope.custDataMutable.billingEmail).then(function(result) {
                                var resultJson = JSON.stringify(result);
                                $log.debug("[REST] cleanse email returned. " + resultJson);
                                if (resultJson.indexOf("invalid") != -1) {
                                    $scope.custDataMutable.billingEmailInvalidFlag = true;
                                } else {
                                    beforeGotoNext();
                                }
                            }, function(error) {
                                $log.debug("[REST] email cleanse error. For details: " + error);
                            });
                        } else if ($scope.custDataMutable.serviceEmail.trim().length > 0) {
                            $scope.cleanseEmail($scope.custDataMutable.serviceEmail).then(function(result) {
                                var resultJson = JSON.stringify(result);
                                $log.debug("[REST] cleanse email returned. " + resultJson);
                                if (resultJson.indexOf("invalid") != -1) {
                                    $scope.custDataMutable.serviceEmailInvalidFlag = true;
                                } else {
                                    beforeGotoNext();
                                }
                            }, function(error) {
                                $log.debug("[REST] email cleanse error. For details: " + error);
                            });
                        } else {

                            beforeGotoNext();
                        }
                    } else if ($scope.custDataMutable.billingEmailChanged && !$scope.custDataMutable.serviceEmailChanged) {
                        if ($scope.custDataMutable.billingEmail.trim().length > 0) {
                            $scope.cleanseEmail($scope.custDataMutable.billingEmail).then(function(result) {
                                var resultJson = JSON.stringify(result);
                                $log.debug("[REST] cleanse email returned. " + resultJson);
                                if (resultJson.indexOf("invalid") != -1) {
                                    $scope.custDataMutable.billingEmailInvalidFlag = true;
                                } else {
                                    beforeGotoNext();
                                }
                            }, function(error) {
                                $log.debug("[REST] email cleanse error. For details: " + error);
                            });
                        } else {
                            beforeGotoNext();
                        }
                    } else if ($scope.custDataMutable.serviceEmailChanged && !$scope.custDataMutable.billingEmailChanged) {
                        if ($scope.custDataMutable.serviceEmail.trim().length > 0) {
                            $scope.cleanseEmail($scope.custDataMutable.serviceEmail).then(function(result) {
                                var resultJson = JSON.stringify(result);
                                $log.debug("[REST] cleanse email returned. " + resultJson);
                                if (resultJson.indexOf("invalid") != -1) {
                                    $scope.custDataMutable.serviceEmailInvalidFlag = true;
                                } else {
                                    beforeGotoNext();
                                }
                            }, function(error) {
                                $log.debug("[REST] email cleanse error. For details: " + error);
                            });
                        } else {
                            beforeGotoNext();
                        }
                    } else {

                        // there is no such a case, just for safe.
                        beforeGotoNext();
                    }
                } else {
                    // the changes are only on non-email fields
                    beforeGotoNext();
                }
            } else {
                $scope.custDataMutable.showFormChangeWarning = true;
            }

            return true;
        };

        $scope.onContactEditConfirmNext = function(overwrite) {
            $scope.custDataMutable.billingAddressOverwriteFlag = overwrite;
            $scope.$emit('reveal', {
                'id': 'overlay-contacts-edit-confirm',
                'action': "close",
                'clickedID': ""
            });
            $scope.$emit('reveal', {
                'id': 'overlay-contacts-edit-reason',
                'action': "open",
                'clickedID': ""
            });
        };

        $scope.onContactEditConfirmBack = function() {
            $scope.$emit('reveal', {
                'id': 'overlay-contacts-edit-confirm',
                'action': "close",
                'clickedID': ""
            });
            $scope.$emit('reveal', {
                'id': 'overlay-contacts-edit',
                'action': "open",
                'clickedID': ""
            });
        };

        $scope.onCommentSelect = function(reason) {

            $scope.custDataMutable.validComments = true;
            if (!!reason) {
                $scope.custDataMutable.choice = reason;
            }

            //$scope.custDataMutable.comments = $scope.custDataMutable.choice;
            // if($scope.custDataMutable.choice == "Other") {
            //  $scope.custDataMutable.comments = "";
            // }

            $scope.isListShowing = !$scope.isListShowing;
            $scope.inputArrowIsFlipped = !$scope.inputArrowIsFlipped;

            return true;
        };

        $scope.onCommentSelectKeyUp = function(event) {

            $scope.custDataMutable.validComments = true;

            // show the dropdown if the user hits the down arrow key
            if (event.which === 40) {
                $scope.isListShowing = true;
                $scope.inputArrowIsFlipped = true;
            } else {

                $scope.isListShowing = false;
                $scope.inputArrowIsFlipped = false;
            }
        };

        $scope.isContactEditCommentValid = function() {
            if ($scope.custDataMutable.choice.length === 0) {
                $scope.custDataMutable.validComments = false;
                return false;
            } else {
                return true;
            }
        };

        $scope.onContactEditSubmit = function() {

            var handleResponse = function() {

                if ($scope.showSuccess) {

                    $scope.showLoading = "";
                    $scope.showLoader = "";

                    $scope.$emit('mas-notes-added-modal', {});

                    $scope.$emit('reveal', {
                        'id': 'overlay-contacts-edit-result',
                        'action': "open",
                        'clickedID': ""
                    });

                    $scope.$emit('reveal', {
                        'id': 'overlay-contacts-edit-reason',
                        'action': "close",
                        'clickedID': ""
                    });

                    setTimeout(function() {

                        $scope.$emit('reveal', {
                            'id': 'overlay-contacts-edit-result',
                            'action': "close",
                            'clickedID': ""
                        });
                    }, 5000);
                } else {
                    $scope.showLoading = "";
                    $scope.showLoader = "";
                    $scope.custDataMutable.saveFailureFlag = true;
                }
            };

            $scope.contactEditSubmitDisabled = true;
            $scope.showLoading = "loading";
            $scope.showLoader = "loader";
            $scope.MASNotesData = {
                "ezPayId": $scope.custDataMutable.ezPayId,
                "logonId": $scope.custDataMutable.loginId,
                "comments": $scope.custDataMutable.choice
            };

            if ($scope.custDataMutable.billingAddressChanged) {

                $q.all([
                    $scope.updatePartyContacts(),
                    $scope.updateBillingAddress(),
                    $scope.uploadMASNotes()
                ]).then(function(values) {
                    $scope.contactEditResultMessage = 'The update has been made in MAS immediately. It will be reflected in this application within 60 minutes.';
                    $scope.showSuccess = true;
                    $scope.showFailure = false;
                    $log.debug("[JSON/SOAP] contacts updated successful (all): ", values);
                    serverLog.send({
                        'isUpdateContactSuccessful': true,
                        'result': values,
                        'data': $scope.custDataMutable
                    });
                    $scope.contactEditSubmitDisabled = false;
                    handleResponse();
                }, function(error) {
                    $scope.contactEditResultMessage = 'Error occured. Please check back later.';
                    $scope.showSuccess = false;
                    $scope.showFailure = true;
                    $log.debug("[JSON/SOAP] contacts update failed (all): ", error);
                    serverLog.send({
                        'isUpdateContactSuccessful': false,
                        'result': error,
                        'data': $scope.custDataMutable
                    });
                    $scope.contactEditSubmitDisabled = false;
                    handleResponse();
                });

            } else {
                $q.all([
                    $scope.updatePartyContacts(),
                    $scope.uploadMASNotes()
                ]).then(function(values) {
                    $scope.contactEditResultMessage = 'The update has been made in MAS immediately. It will be reflected in this application within 60 minutes.';
                    $scope.showSuccess = true;
                    $scope.showFailure = false;
                    $log.debug("[JSON/SOAP] contacts update (all): ", values);
                    $scope.contactEditSubmitDisabled = false;
                    handleResponse();
                }, function(error) {
                    $scope.contactEditResultMessage = 'Error occured. Please check back later.';
                    $scope.showSuccess = false;
                    $scope.showFailure = true;
                    $log.debug("[JSON/SOAP] contacts update (all): ", error);
                    $scope.contactEditSubmitDisabled = false;
                    handleResponse();
                });
            }

        };

        $scope.onNoteEditSubmit = function() {

            var handleResponse = function() {

                if ($scope.showSuccess) {

                    $scope.showLoading = "";
                    $scope.showLoader = "";

                    $scope.$emit('mas-notes-added-modal', {});

                    $scope.$emit('reveal', {
                        'id': 'overlay-note-edit-result',
                        'action': "open",
                        'clickedID': ""
                    });

                    $scope.$emit('reveal', {
                        'id': 'overlay-note-edit',
                        'action': "close",
                        'clickedID': ""
                    });

                    setTimeout(function() {

                        $scope.noteDataMutable.saveFailureFlag = false;
                        $scope.noteDataMutable.processing = false;

                    }, 3000);

                    /* We should not close overlay-note-edit-result automatically.
                       Expectation is that the user should acknowledge they submitted the note.
                    setTimeout(function(){
                        $scope.$emit('reveal', {
                            'id': 'overlay-note-edit-result',
                            'action': "close",
                            'clickedID': ""
                        });
                    }, 15000);
                    */

                } else {
                    $scope.showLoading = "";
                    $scope.showLoader = "";
                    $scope.noteDataMutable.saveFailureFlag = true;
                    $scope.noteDataMutable.processing = false;
                }
            };

            $scope.noteEditSubmitDisabled = true;
            $scope.showLoading = "loading";
            $scope.showLoader = "loader";
            $scope.MASNotesData = {
                "ezPayId": $scope.noteDataMutable.ezPayId,
                "logonId": $scope.noteDataMutable.loginId,
                "comments": $scope.noteDataMutable.comment
            };

            if ($scope.noteDataMutable.validComments) {

                $q.all([
                    $scope.uploadMASNotes()
                ]).then(function(values) {
                    $scope.noteEditResultMessage = 'The update has been made in MAS immediately. It will be reflected in this application within 60 minutes.';
                    $scope.showSuccess = true;
                    $scope.showFailure = false;
                    $log.debug("[JSON/SOAP] MAS comment update successful: ", values);
                    serverLog.send({
                        'isUpdateMASCommentSuccessful': true,
                        'result': values,
                        'data': $scope.noteDataMutable
                    });
                    $scope.noteEditSubmitDisabled = false;
                    handleResponse();
                }, function(error) {
                    $scope.noteEditResultMessage = 'Error occured. Please check back later.';
                    $scope.showSuccess = false;
                    $scope.showFailure = true;
                    $log.debug("[JSON/SOAP] MAS comment update failed: ", error);
                    serverLog.send({
                        'isUpdateMASCommentSuccessful': false,
                        'result': error,
                        'data': $scope.noteDataMutable
                    });
                    $scope.noteEditSubmitDisabled = false;
                    handleResponse();
                });

            } else {
                // comment empty or not valid
                $scope.showLoading = "";
                $scope.showLoader = "";
                $scope.noteDataMutable.showFormChangeWarning = true;
                window.document.getElementById('editComment').focus();
            }

        };

        $scope.uploadMASNotes = function() {

            var ezPayId = $scope.MASNotesData.ezPayId;
            var logonId = $scope.MASNotesData.logonId;
            var userid = logonId.substr(0, logonId.indexOf('@'));

            // the following date time values do not affect the actual timestamp stored in MAS
            // var dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            var dateTime = moment().utc().format('YYYY-MM-DD HH:mm:ss');

            var notes = [];
            var comments = $scope.MASNotesData.comments;

            /* per esb, we should not split up comment when it exceeds 72 characters as API will do this automatically for us.
               If we split into an array of comments, it will not get merged back as a single comment by the API when retrieved.
            if(comments.length > 72){
                var comments_split = comments.match(/[\s\S]{1,72}/g) || [];
                comments_split.forEach(function(comment) {
                    notes.push({"comment" : comment});
                });
            } else {
                notes.push({"comment" : comments});
            }
            */

            notes.push({
                "comment": comments
            });

            var data = {
                "notes": notes,
                "wm_metadata": {
                    "created_by": userid,
                    "created_date_time": dateTime
                }

            };

            return Customer.ActivityFeed.notes_post(ezPayId).update({
                ezPayId: ezPayId
            }, data).$promise;

        };

        $scope.updatePartyContacts = function() {

            var ezPayId = $scope.custDataMutable.ezPayId;
            var billingContactName = $scope.custDataMutable.billingContactName == constants.whitespace ? "" : $scope.custDataMutable.billingContactName.trim();
            var billingOfficePhone = $scope.custDataMutable.billingOfficePhone == constants.whitespace ? "" : $scope.custDataMutable.billingOfficePhone.trim();
            var billingEmail = $scope.custDataMutable.billingEmail == constants.whitespace ? "" : $scope.custDataMutable.billingEmail.trim();
            var billingMobilePhone = $scope.custDataMutable.billingMobilePhone == constants.whitespace ? "" : $scope.custDataMutable.billingMobilePhone.trim();
            var billingFax = $scope.custDataMutable.billingFax == constants.whitespace ? "" : $scope.custDataMutable.billingFax.trim();
            var serviceContactName = $scope.custDataMutable.serviceContactName == constants.whitespace ? "" : $scope.custDataMutable.serviceContactName.trim();
            var serviceOfficePhone = $scope.custDataMutable.serviceOfficePhone == constants.whitespace ? "" : $scope.custDataMutable.serviceOfficePhone.trim();
            var serviceEmail = $scope.custDataMutable.serviceEmail == constants.whitespace ? "" : $scope.custDataMutable.serviceEmail.trim();
            var serviceMobilePhone = $scope.custDataMutable.serviceMobilePhone == constants.whitespace ? "" : $scope.custDataMutable.serviceMobilePhone.trim();
            var serviceFax = $scope.custDataMutable.serviceFax == constants.whitespace ? "" : $scope.custDataMutable.serviceFax.trim();

            var data = {
                "contacts": [{
                        "type": "billing",
                        "work_phone": billingOfficePhone,
                        "work_phone_extension": "",
                        //                      "organization_name": "",
                        "email": billingEmail,
                        "name": billingContactName,
                        "mobile_phone": billingMobilePhone,
                        "fax": billingFax
                    },
                    {
                        "type": "service",
                        "work_phone": serviceOfficePhone,
                        "work_phone_extension": "",
                        //                      "organization_name": "",
                        "email": serviceEmail,
                        "name": serviceContactName,
                        "mobile_phone": serviceMobilePhone,
                        "fax": serviceFax
                    }
                ]
            };

            var contacts = Customer.Contacts._(ezPayId).update({
                ezPayId: ezPayId
            }, data);
            return contacts.$promise;

        };

        $scope.updateBillingAddress = function() {

            var ezPayId = $scope.custDataMutable.ezPayId;
            var countryCode = "US";
            var caProvinceCodeArray = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];
            var zip = $scope.custDataMutable.billingZip == constants.whitespace ? "" : $scope.custDataMutable.billingZip;

            if ($scope.custDataMutable.billingZip.trim().length === 0) {
                if (caProvinceCodeArray.indexOf($scope.custDataMutable.billingZip.trim()) != -1) {
                    countryCode = "CA";
                }
            } else {
                if (isNaN($scope.custDataMutable.billingZip.replace("-", ""))) {
                    countryCode = "CA";
                }
            }

            var data = {
                "address": {
                    "street1": $scope.custDataMutable.billingStreetLn1 + ' ' + $scope.custDataMutable.billingStreetLn2,
                    "city": $scope.custDataMutable.billingCity,
                    "country": countryCode,
                    "state": $scope.custDataMutable.billingState,
                    "zip": zip
                },
                "wm_metadata": {
                    "login_id": $scope.custDataMutable.loginId
                }
            };

            var address = Customer.Contacts.billing.address(ezPayId, !$scope.custDataMutable.billingAddressOverwriteFlag).update({
                ezPayId: ezPayId
            }, data);

            return address.$promise;

        };

        $scope.cleanseAddress = function() {

            var street1 = encodeURIComponent($scope.custDataMutable.billingStreetLn1 + ' ' + $scope.custDataMutable.billingStreetLn2);
            var city = encodeURIComponent($scope.custDataMutable.billingCity);
            var state = encodeURIComponent($scope.custDataMutable.billingState);
            var zip = encodeURIComponent($scope.custDataMutable.billingZip);
            var country = 'US';
            var caProvinceCodeArray = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

            if ($scope.custDataMutable.billingZip.trim().length === 0) {
                if (caProvinceCodeArray.indexOf($scope.custDataMutable.billingZip.trim()) != -1) {
                    country = "CA";
                }
            } else {
                if (isNaN($scope.custDataMutable.billingZip.replace("-", ""))) {
                    country = "CA";
                }
            }

            return Customer.Address.cleanse(street1, city, state, zip, country).get().$promise;

        };

        $scope.cleanseEmail = function(emailId) {
            return Customer.Emails.cleanse(emailId).get({
                'emailId': emailId
            }).$promise;
        };

        $scope.getField = function(data, field) {
            if (!!data) {
                var customer = data._source.customer;
                return customerData.getField(customer, field);
            } else {
                return constants.whitespace;
            }
        };

        //move this to tileContactsController.js
        $scope.translateRegisteredCode = function(code) {
            if (code === 'R') {
                return "Complete";
            } else if (code === 'P') {
                return "Pending Customer Confirmation";
            } else if (code === 'C') {
                return "CSR";
            }
        };

        $scope.getCustomerData = function() {
            $log.debug("[FUNCTION] CustomerController.getCustomerData", !$scope.custData);
            var ezpayid = customerData.getEzPayId($scope.custData._source.customer).replace(/^[0]+/g, "");
            var lineOfBusiness = $scope.getField($scope.custData, 'lineOfBusiness');

            if ($scope.custData._source.customer.relationship === 'child') {
                accountData.isSubAccount = true;
                accountData.masterAccountName = $scope.custData._source.customer.billingContact.name;
                accountData.masterAccountId = $scope.custData._source.customer.billingContact.ezPayId;
            } else {
                accountData.isSubAccount = false;
            }
            console.log("CustomerController - isSubAccount - " + accountData.isSubAccount);

            // CUSTOMER ONLINE PROFILE
            var profile = Customer.Profile(ezpayid).get({
                'ezPayId': ezpayid
            });

            // CUSTOMER SERVICES
            var services = Customer.Services._(ezpayid, lineOfBusiness).get({
                'ezPayId': ezpayid
            });

            // CUSTOMER CONTACT INFO
            var contacts = Customer.Contacts._(ezpayid).get({
                'ezPayId': ezpayid
            });


            profile.$promise.then(function(data) {
                $log.debug("[REST] loaded customer profile: ", data);
                $scope.custProfile = profile.profiles[0];
                $localStorage.profile = data;
            }, function(error) {
                $log.debug("[REST] loaded customer profile ERROR: ", error);
            });

            services.$promise.then(function(data) {
                    $log.debug("[REST] loaded customer services info: ", data);
                    $scope.services = {
                        'all': [],
                        'active': {
                            'all': [],
                            'services': [],
                            'extraPickups': [],
                            'fees': []
                        },
                        'inactive': {
                            'all': [],
                            'services': [],
                            'extraPickups': [],
                            'fees': []
                        }
                    };

                    // $scope.servicesInfo = [];
                    // $scope.servicesInfoNoFees = [];

                    _.each(services.services, function(item, i) {
                        item.isFee = customerContract.isFee(item);
                        item.isActive = item.status.search(/inactive/i) < 0;

                        var equip = item.equipment.name;
                        var description = item.enterprise_catalog.description;
                        var service_code = item.wm_metadata.service_code;

                        //FEES
                        if (item.isFee) {
                            if (description.toLowerCase() !== 'null') {
                                item.prettyServiceName = description + " (" + service_code + ")";
                            } else {
                                item.prettyServiceName = service_code;
                            }
                            //ACTIVE
                            if (item.isActive) {
                                $scope.services.active.fees.push(item);
                            } else {
                                //INACTIVE
                                $scope.services.inactive.fees.push(item);
                            }
                        } else {
                            //SERVICES
                            item.prettyServiceName = customerContract.humanizeServiceName(item);
                            item.prettyEquipmentSize = customerContract.humanizeEquipmentSize(item);
                            item.serviceCssIconClass = customerContract.serviceCssIconClass(item);

                            //ACTIVE
                            if ((description.search(/xtra/i) < 0) && item.isActive) {
                                $scope.services.active.services.push(item);
                            } else if ((description.search(/xtra/i) >= 0) && item.isActive) {
                                //xtra pickups
                                $scope.services.active.extraPickups.push(item);
                            } else if ((description.search(/xtra/i) < 0) && !item.isActive) {
                                //INACTIVE
                                $scope.services.inactive.services.push(item);
                            } else if ((description.search(/xtra/i) >= 0) && !item.isActive) {
                                //xtra pickups
                                $scope.services.active.extraPickups.push(item);
                            }
                        }

                        if (item.isActive) {
                            $scope.services.active.all.push(item);
                        } else {
                            $scope.services.inactive.all.push(item);
                        }

                        // if ((item.auto_bill === 'Y') || (item.auto_bill === undefined) || (item.auto_bill === "null") || (item.occurs == "On Call")) {
                        $scope.services.all.push(item);
                        // $scope.servicesInfo.push(item);
                        // }

                    });

                    // $scope.services.all = _.sortBy($scope.services.all, function(thing) {
                    //     var equip = thing.equipment.name;
                    //     return (customerContract.isFee(thing));
                    // });

                    $scope.$broadcast('servicesLoaded');

                },
                function(error) {
                    $log.debug("[REST] loaded customer Services info ERROR ", error);
                    $scope.noServicesReturned = true;
                });

            contacts.$promise.then(function(data) {
                $log.debug("[REST] loaded customer contacts: ", data);
                $scope.custContacts = contacts.contacts;
                // $localStorage.contacts = data;
            }, function(error) {
                $log.debug("[REST] loaded customer contacts ERROR: ", error);
            });
        };


        if (!!$stateParams.custid) {
            $rootScope.viewingCustomer = true;
            if (!$rootScope.inputSearch) {
                $element.addClass('no-animation');
            }

            if (!$scope.custData) {
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
                    }).then(function(resp) {
                        $scope.clusterState = resp;
                        $scope.error = null;
                        //if everything is good, do the search
                        client.search({
                            index: client.transport._config.activecustomers+','+ client.transport._config.inactivecustomers,
                            type: 'custdetails',
                            body: {
                                query: {
                                    query_string: {
                                        fields: ["customer.ezPayId"],
                                        query: $stateParams.custid,
                                        default_operator: "AND"
                                    }
                                }
                            }
                        }).then(function(stuff) {

                            $rootScope.currentCustomer = stuff.hits.hits[0];
                            $scope.custData = stuff.hits.hits[0];
                            $scope.getCustomerData();
                            $scope.city = $scope.getField($scope.custData, 'serviceCity');
                            $scope.state = $scope.getField($scope.custData, 'serviceState');
                            $localStorage.customer = $scope.custData._source.customer;

                            UserLocation.doGeoCode($scope.getField($scope.custData, 'serviceAddressForGeocoding')).then(function(data, status) {
                                $scope.geocodedServiceAddress = data;
                                Moments.getTimeZone(data.lat, data.lng).success(function(data) {
                                    $scope.customerClock.time = Moments.updateTime(data.gmtOffset / 60);
                                    $scope.customerClock.zone = data;
                                    setInterval(function() {
                                        // $scope.$apply($scope.handleMoments);
                                        $scope.customerClock.time = Moments.updateTime($scope.customerClock.zone.gmtOffset / 60);
                                    }, 1000);
                                });
                                $scope.$broadcast('serviceAddressGeocoded', {
                                    'data': data,
                                    'status': status
                                });
                            });

                        }, function(error) {
                            $log.error("ERROR: ", error.message);
                        });
                    });
            } else {
                $scope.getCustomerData();
                $localStorage.customer = $scope.custData._source.customer;
                $scope.city = $scope.getField($scope.custData, 'serviceCity');
                $scope.state = $scope.getField($scope.custData, 'serviceState');
                UserLocation.doGeoCode($scope.getField($scope.custData, 'serviceAddressForGeocoding')).then(function(data, status) {
                    $scope.geocodedServiceAddress = data;
                    Moments.getTimeZone(data.lat, data.lng).success(function(data) {
                        $scope.customerClock.time = Moments.updateTime(data.gmtOffset / 60);
                        $scope.customerClock.zone = data;
                        setInterval(function() {
                            // $scope.$apply($scope.handleMoments);
                            $scope.customerClock.time = Moments.updateTime($scope.customerClock.zone.gmtOffset / 60);
                        }, 1000);
                    });
                    $scope.$broadcast('serviceAddressGeocoded', {
                        'data': data,
                        'status': status
                    });
                });
            }
        } else {
            // $location.path('/');
        }


        // $scope.getName = function() {

        //     if (!!$scope.custData) {
        //         return ($scope.custData._source.customer.serviceContact.name || constants.whitespace); // \000 is a space
        //     } else {
        //         return constants.whitespace;
        //     }
        // };
        $scope.getLineOfBuisiness = function() {
            if (!!$scope.custData) {
                return ($scope.custData._source.customer.lob || constants.whitespace); // \000 is a space;
            } else {
                return constants.whitespace;
            }
        };

        $scope.doBackToSearch = function() {
            var state = $state;
            var setSearchVal = $scope.inputSearch;
            setTimeout(function() {
                if (!$scope.inputSearch) {
                    setSearchVal = customerData.getEzPayId($scope.custData._source.customer);
                }
                state.go('app.search', {
                    'id': setSearchVal
                });
            }, 1);
        };


        $scope.getCaagUrl = function(data) {
            var ezPayId = this.getField(data, "ezPayId");
            var hostname = window.location.hostname;
            var getSubdomain = function(hostname) {
                var dot = hostname.indexOf('.');
                var subdomain = hostname.slice(0, dot);
                return subdomain;
            };
            var getEnvironment = function(hostname) {
                // return one of the case value strings:
                // 'dev', 'qa', 'production', 'localhost'

                // these return false or the environment
                var isDev = function(hostname) {
                    return (getSubdomain(hostname) === 'dev') ? 'dev' : false;
                };
                var isQa = function(hostname) {
                    return (getSubdomain(hostname) === 'qa' || getSubdomain(hostname) === 'staging') ? 'qa' : false;
                };
                var isProduction = function(hostname) {
                    return (getSubdomain(hostname) === 'customer') ? 'production' : false;
                };
                var isLocal = function(hostname) {
                    return (hostname === 'localhost') ? 'local' : false;
                };

                // returns the first non-falsy condition
                var environment = (isDev(hostname) || isQa(hostname) || isProduction(hostname) || isLocal(hostname));
                return environment;
            };

            var redirectHostname = null;
            var environment = getEnvironment(hostname);

            switch (environment) {
                case 'dev':
                    redirectHostname = 'https://opusdev2.wm.com';
                    break;
                case 'qa':
                    redirectHostname = 'https://opusqa.wm.com';
                    break;
                case 'production':
                    redirectHostname = 'https://opus.wm.com';
                    break;
                case 'local':
                    redirectHostname = 'http://10.242.193.142:8080';
                    break;
                default:
                    redirectHostname = 'https://opus.wm.com';
                    break;
            }

            // dev.customer.wm.com
            // qa.customer.wm.com
            // customer.wm.com
            // return ("http://10.251.251.44:8080/opus-report/report/report?reportname=Opus.Caag&USER_ID=" + ezPayId);
            // return ("https://opus.wm.com/opus-caag/?reportname=Opus.Caag&USER_ID=" + ezPayId);
            return (redirectHostname + "/opus-report/report/report?reportname=Opus.Caag&USER_ID=" + ezPayId);
        };

        $scope.showUpdates = function() {
            $scope.$emit('show-updates-overlay');
            event.stopPropagation();
        };

        $scope.caagDismissUpdatesBar = function(dismissType) {
            if (dismissType === 'perm') {
                $scope.$emit('dismiss-updates-bar-perm');
            } else {
                $scope.$emit('dismiss-updates-bar-temp');
            }

            event.stopPropagation();
        };

        $scope.$on('PDF_INVOICE_LOADED', function(event, loadedPDFInvoice) {
            $scope.loadedPDFInvoice = loadedPDFInvoice;
            if(constants.userAgent === "notChrome"){
                $scope.iframePdfDisplay = true;
            }else{
                $scope.iframePdfDisplay = false;
            }
        });

        $scope.$on('EMAIL_INVOICE_LOADED', function(event, eventArr) {
            $scope.sendEmailmodal.inputArrowIsFlipped = false;
            $scope.sendEmailmodal.isListShowing = false;
            if (eventArr.symbol === 'CAD') {
             fetchLangPreferences();
             }
            $("#invoice-template").css("display", "inherit");
            $scope.emailEvent = eventArr;
            var arrayForSenderEmail = [];
            $scope.sendderEmails = [];


            if ($localStorage.customer.serviceContact.email) {
                arrayForSenderEmail.push($localStorage.customer.serviceContact.email.toLowerCase());
            }
            if ($localStorage.customer.billingContact.email) {
                arrayForSenderEmail.push($localStorage.customer.billingContact.email.toLowerCase());
            }

            arrayForSenderEmail = _.uniq(arrayForSenderEmail);
            _.each(arrayForSenderEmail, function(anEmail) {
                $scope.sendderEmails.push({ email: anEmail });
            });

            if ($localStorage.customer.billingContact.email) {
                $scope.sendEmailmodal.toEmail = $localStorage.customer.billingContact.email.toLowerCase();
            } else {
                $scope.sendEmailmodal.toEmail = "";
            }


        });
        var fetchLangPreferences =  function() {
        setCaseCloseProcessSteps("Loading");
        var ezPayId = $localStorage.customer.ezPayId;
        var getLanguages = Customer.Communication.customerPreferences(parseInt(ezPayId)).get({
            'ezPayId': parseInt(ezPayId)
        });


        getLanguages.$promise.then(function (data) {
        $scope.caseCloseProcessSteps.Loading = false;
         console.log(data);
         billingService.setLanguageDetail(data);


        }).catch(function (error) {
        setCaseCloseProcessSteps("Error");

        });

      };

        $scope.myEmailChange = function(value) {
        if($scope.sendEmailmodal.isListShowing == true) {
            $scope.sendEmailmodal.isListShowing = false;
        }
        else {
            $scope.sendEmailmodal.isListShowing = false;
        }
             $scope.sendEmailmodal.inputArrowIsFlipped = false;

        };

        $('html').click(function(e) {
        if (e.target.id != 'multiselectDropdowns' && $(e.target).parents('#multiselectDropdowns').length == 0) {
        $scope.sendEmailmodal.isListShowing = false;
         $scope.sendEmailmodal.inputArrowIsFlipped = false;
          }
         });

        $scope.openWarningOverlay = function() {
            $scope.$emit('reveal', {
                'id': 'overlay-information-message',
                'action': "open",
                'clickedID': ""
            });
        };

    }
]);

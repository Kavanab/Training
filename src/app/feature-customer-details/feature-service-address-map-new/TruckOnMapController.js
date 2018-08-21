angular.module('searchApp.customer.overview.truckOnMap', ['ngTable'])
    .controller("TruckOnMapController", [
        '$scope',
        '$rootScope',
        '$state',
        '$stateParams',
        '$http',
        '$timeout',
        'serverLog',
        '$q',
        '$log',
        '$filter',
        '$location',
        'Moments',
        '$anchorScroll',
        'client',
        'UserLocation',
        'NgTableParams',
        'truckOnMapService',
        'Customer',
        'customerContract',
        function($scope, $rootScope, $state, $stateParams, $http, $timeout, serverLog, $q, $log, $filter, $location, Moments, $anchorScroll, client, UserLocation, NgTableParams, truckOnMapService, Customer, customerContract) {
            $body = $("body");
            $scope.checkErr = [];
            $scope.routeResp = [];
            $scope.zoomCounter = 0;
            $scope.routeMap = "";
            $scope.currentStopSelected = false;
            $scope.maxZoomLatLng = "";
            $scope.initalZoom = 1;
            $scope.currentCustomerServiceId = "";
            $scope.routeStatus = "";
            $scope.openTableCenter = "";
            $scope.closeTableCenter = "";
            $scope.displayErrorMsg = false;
            $scope.completedMarkerSelectedFlag = 0;
            $scope.pendingMarkerSelectedFlag = 0;
            $scope.previousMarkerSelectedCompleted = '';
            $scope.previousMarkerSelectedPending = '';
            $scope.ETATime = '';
            $scope.ETAstatus = '';
            var iconList = [{
                servicedSuccessfully: {
                    url: '/img/serviced.svg',
                    size: new google.maps.Size(20, 20),
                    scaledSize: new google.maps.Size(20, 20),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(12, 12)
                },
                yetToBeServiced: {
                    url: '/img/not-serviced-25.svg',
                    size: new google.maps.Size(20, 20),
                    scaledSize: new google.maps.Size(20, 20),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(12, 12)
                },
                servicedSuccessfullySelected: {
                    url: '/img/Selected-Serviced.svg',
                    size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(26, 25)
                },
                yetToBeServicedSelected: {
                    url: '/img/Selected-not-serviced.svg',
                    size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(26, 25)
                },
                servicedWithException: {
                    url: '/img/exception.svg',
                    size: new google.maps.Size(20, 20),
                    scaledSize: new google.maps.Size(20, 20),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(12, 12)
                },
                servicedWithExceptionSelected: {
                    url: '/img/excpetion-selected.svg',
                    size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(26, 25)
                },
                notServicedException: {
                    url: '/img/not-serviced_expection.svg',
                    size: new google.maps.Size(20, 20),
                    scaledSize: new google.maps.Size(20, 20),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(12, 12)
                },
                notServicedExceptionSelected: {
                    url: '/img/not-serviced-selected_exception.svg',
                    size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(26, 25)
                },
                multipleMarkerUnselected: {
                    url: '/img/multiple-marker-unselected.svg',
                    size: new google.maps.Size(30, 30),
                    scaledSize: new google.maps.Size(30, 30),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(10, 10)
                },
                multipleMarkerSelected: {
                    url: '/img/multiple-marker-selected.svg',
                    size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(26, 25)
                }
            }];
            $scope.getCustomerOverview = function(data) {
                $rootScope.currentCustomer = null;
                $state.go('app.customer.overview', {
                    "custid": data.customer_info.eZpayId // "customer": $scope.customerData
                });
                setTimeout(function() {
                    $state.reload();
                }, 1000);
            };
            // $scope.onMouseoverCustomer = function (details, name) {
            //     details.customer_info[name] = true;
            // };
            // $scope.onMouseleaveCustomer = function (details, name) {
            //     details.customer_info[name] = false;
            // };
            $scope.searchedCustomer = $stateParams.custid;
            //$scope.searchedCustomer = '000159783933005';
            // loader starts
            $body.addClass("loading");
            var customerPromise = truckOnMapService.getCustomerRoute().get({ customerId: $scope.searchedCustomer });

            customerPromise.$promise.then(function(data) {
                $log.debug("[REST] loaded plan for the customer: ", data);
                serverLog.send({ 'isCustomerPlanFetched': true, 'result': data });
                if (data.hasOwnProperty('services')) {

                    var routeId = data.services[0].operations[0].route_order_number;
                    $scope.currentRouteNumber = data.services[0].operations[0].route_id;
                    $scope.currentCustomerServiceId = data.services[0].id;
                    // var routeId = '117059899';
                    var routePromise = truckOnMapService.getRoutePlan().get({ routeId: routeId });
                    routePromise.$promise.then(function(routePayload) {
                        $log.debug("[REST] loaded route for the customer: ", data);
                        serverLog.send({ 'isCustomerRoutePlanFetched': true, 'result': data });

                        if (routePayload.hasOwnProperty('stops')) {
                            $scope.processRouteResponse(routePayload);
                        } else {
                            $log.debug("[REST] loading route  - no route data returned");
                            serverLog.send({ 'isCustomerRoutePlanFetched': false, 'result': 'No route data returned' });
                            $scope.getNextService();
                            //loader ends
                           setTimeout(function() {
                                $body.removeClass("loading");
                            }, 4000);

                        }

                    }).catch(function(error) {

                        $log.debug("[REST] loading route plan error ", error);
                        serverLog.send({ 'isCustomerRoutePlanFetched': false, 'result': error });
                        $scope.getNextService();
                        //loader ends
                        setTimeout(function() {
                            $body.removeClass("loading");
                        }, 4000);


                    }).finally(function() {});


                } else {
                    $log.debug("[REST] loading plan  - no plan data returned");
                    serverLog.send({ 'isCustomerPlanFetched': false, 'result': 'No plan returned' });
                    $scope.getNextService();
                    setTimeout(function() {
                        $body.removeClass("loading");
                    }, 4000);
                }
            }).catch(function(error) {
                $log.debug("[REST] loading customer plan  ERROR ", error);
                serverLog.send({ 'isCustomerPlanFetched': false, 'result': error });
                $scope.getNextService();
                setTimeout(function() {
                    $body.removeClass("loading");
                }, 4000);

            }).finally(function() {});


            $scope.processRouteResponse = function(data) {

                $scope.stops = {};
                $scope.ETA = {};
                $scope.customerListCompleted = [];
                $scope.customerListPending = [];
                $scope.currentCustomer = [];
                $scope.customerClockZoneName = '';

                if (data.hasOwnProperty('stops')) {
                    $scope.stops = data.stops;
                    for (var prop = 0; prop < $scope.stops.length; prop++) {
                        $scope.stops[prop].sequence = Number($scope.stops[prop].sequence); //$scope.searchedCustomer
                        if ($scope.stops[prop].customer_info.eZpayId === $scope.searchedCustomer) { //'000189922163004'
                            $scope.currentCustomer.push($scope.stops[prop]);
                        }

                    }
                    $scope.stops = $filter('orderBy')($scope.stops, 'sequence');
                    Moments.getTimeZone($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude).success(function(data1) {

                        if (data1.hasOwnProperty('zoneName')) {
                            $scope.customerClockZoneName = data1.zoneName;
                        } else {
                            $scope.customerClockZoneName = $scope.customerClock.zone.zoneName;
                        }
                        for (var prop = 0; prop < $scope.stops.length; prop++) {
                            var servicedDate = '';
                            var servicedDateTime = '';
                            //                            $scope.stops[prop].sequence = Number($scope.stops[prop].sequence);
                            var isToday = $filter("howLongAgo")($scope.stops[prop].service_time, $scope.customerClockZoneName);
                            var todayDate = $filter("prettyTimeStamp2")($scope.stops[prop].service_time, '', 'date');
                            if (isToday == 'Today') { servicedDate = 'Today'; } else { servicedDate = todayDate; }
                            var servicedTime = $filter("prettyTimeStamp")($scope.stops[prop].service_time, $scope.customerClockZoneName, 'time');
                            if ($scope.stops[prop].service_time != '--') { servicedDateTime = servicedDate + ' at ' + servicedTime; } else { servicedDateTime = '--'; }
                            $scope.stops[prop].service_time = servicedDateTime;
                            $scope.stops[prop].ServeTime = servicedTime;
                        }
                        for (var j = 0; j < $scope.stops.length; j++) {
                            if ($scope.stops[j].status == 'Confirmed Positive' || $scope.stops[j].status == 'Confirmed Negative') {
                                $scope.customerListCompleted.push($scope.stops[j]);
                            } else {
                                $scope.customerListPending.push($scope.stops[j]);
                            }

                            if ($scope.stops[j].customer_info.eZpayId === $scope.searchedCustomer) {
                                $scope.currentCustomer.push($scope.stops[j]);
                            }
                        }

                        if (($scope.customerListCompleted.length == $scope.stops.length) ||
                            ($scope.customerListCompleted.length > 0 && $scope.customerListPending.length < $scope.stops.length)) {
                            $scope.currentStop = $scope.customerListCompleted[$scope.customerListCompleted.length - 1];
                        } else if ($scope.customerListPending.length == $scope.stops.length) {
                            $scope.currentStop = $scope.customerListPending[0];
                        }
                        //loader ends
                        $body.removeClass("loading");

                        $scope.usersTable = new NgTableParams({
                            count: $scope.stops.length,
                            sorting: { sequence: "asc" }
                        }, {
                            counts: [],
                            filterDelay: 0,
                            dataset: $scope.stops
                        }, {
                            counts: [], // hide page counts control
                            total: 1, // value less than count hide pagination
                            getData: function($defer, params) {

                                $defer.resolve($scope.stops.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                                this.current = params.count();
                            }
                        });
                        //Load Address Data
                        var custdetails = $scope.findCustIds();
                        $scope.getCustomerDataDetails(custdetails);

                        $scope.createRouteMap($scope.stops);
                        $scope.newCenter = new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude);
                        $scope.openTable();

                        var lob = $scope.$parent.custData._source.customer.lob;
                        var ticketNbr = '';
                        if (lob === "ROLLOFF") {
                            ticketNbr = $scope.currentCustomer[0].ticket_number;
                        }
                        // var getETA = Customer.Services.eta($scope.searchedCustomer, $scope.currentCustomerServiceId, '', '').get({
                        var getETA = Customer.Services.eta($scope.searchedCustomer, $scope.currentCustomerServiceId, lob, ticketNbr).get({
                            'ezPayId': parseInt($scope.searchedCustomer),
                            'serviceId': $scope.currentCustomerServiceId
                        });

                        getETA.$promise.then(function(data) {
                            $log.debug("[REST] loaded customer ETA: ", data);

                            var validETA = !!data.ETA;
                            if (validETA) {


                                $scope.ETA = data;
                            } else {
                                $log.debug("[REST] loading customer ETA - no ETA data returned");
                            }

                        }).catch(function(error) {
                            $log.debug("[REST] loading customer ETA ERROR ", error);
                        }).finally(function() {});



                    });

                } else {
                    $scope.error = response;
                    $log.debug("[REST] error in fetching data for route details. For details: " + $scope.error);
                }

            };

            $scope.markTruck = function(data) {

                var content = "";
                var truckLoc = data.address; //data.data.stops[0].address;//data.coordinates[data.coordinates.length-1];

                if ($scope.routeMap != "") {
                    $scope.truckMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(truckLoc.latitude, truckLoc.longitude),
                        map: $scope.routeMap,
                        icon: {
                            url: '/img/truck-right.svg',
                            scaledSize: new google.maps.Size(100, 60),
                            //size: new google.maps.Size(90, 60),
                            //size: new google.maps.Size(90, 60),
                            origin: new google.maps.Point(0, 10),
                            anchor: new google.maps.Point(40, 30),
                            infoWindowPixelOffset: 10
                        },
                        optimized: false,
                        zIndex: 130
                    });


                    if ($scope.customerListCompleted.length == $scope.stops.length) {
                        $scope.truckStatus = '<div id="truckInfo"><b>Route completed</b></div>';
                        $scope.routeStatus = 'completed';
                        content = $scope.truckStatus;
                    } else if ($scope.customerListPending.length == $scope.stops.length) {
                        $scope.truckStatus = '<div id="truckInfo"><b>Route not started</b></div>';
                        $scope.routeStatus = 'not started';
                        content = $scope.truckStatus;
                    } else if ($scope.customerListCompleted.length > 0 && $scope.customerListPending.length > 0) {
                        $scope.truckStatus = '<div id="truckInfo"><b>In transit</b></div>';
                        $scope.routeStatus = 'in progress';
                        content = "<div>" + $scope.truckStatus + "<br> at stop " + $scope.currentStop.sequence + " of " + $scope.stops[$scope.stops.length - 1].sequence + "</div>";
                    }


                    $scope.truckMarker.addListener('mouseover', function() {
                        truckMarkerInfoWindow.open($scope.routeMap, $scope.truckMarker);
                    });


                    var truckMarkerInfoWindow = new google.maps.InfoWindow({
                        content: content
                            /*,
                                                pixelOffset: new google.maps.Size(-40,10)*/
                    });

                    $scope.truckMarker.addListener('mouseout', function() {
                        truckMarkerInfoWindow.close();
                    });
                    $scope.truckMarker.addListener('click', function() {
                        $scope.highlightRow(data.sequence);
                    });


                }
            };

            $scope.createRouteMap = function(data) {
                $scope.centerPoint = new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude);
                $scope.markers_pending = [];
                $scope.markers_completed = [];
                $scope.markerCluster_pending = [];
                $scope.markerCluster_completed = [];
                var uniqueCompleted = [],
                    uniquePending = [];
                $scope.serviceTimeInfoWindow = {};

                var bounds = new google.maps.LatLngBounds();
                $scope.routeMap = new google.maps.Map(document.getElementById('truck-on-map-id'), {
                    center: new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude),
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    },
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                        position: google.maps.ControlPosition.LEFT_TOP
                    },
                    streetViewControl: false,
                    /*streetViewControlOptions: {
                        position: google.maps.ControlPosition.LEFT_TOP
                    },*/
                    fullscreenControl: false,

                    styles: [{
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#f5f5f5"


                            }]
                        },
                        {
                            "elementType": "labels.icon",


                            "stylers": [{
                                "visibility": "off"


                            }]
                        },
                        {
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#616161"


                            }]
                        },
                        {
                            "elementType": "labels.text.stroke",


                            "stylers": [{
                                "color": "#f5f5f5"


                            }]
                        }, {
                            "featureType": "landscape.man_made",
                            "elementType": "geometry.stroke",
                            "stylers": [
                                { "color": "#bdbdbd" }
                            ]
                        },
                        {
                            "featureType": "administrative.land_parcel",
                            "elementType": "labels.text.fill",
                            "stylers": [{
                                "color": "#bdbdbd"
                            }]
                        },
                        {
                            "featureType": "administrative.land_parcel",
                            "stylers": [{
                                "color": "#e2e1e6"
                            }]
                        },

                        {
                            "featureType": "poi",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#eeeeee"


                            }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#757575"


                            }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#e5e5e5"


                            }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#9e9e9e"


                            }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#ffffff"


                            }]
                        },
                        {
                            "featureType": "road.arterial",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#757575"


                            }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#dadada"


                            }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#616161"


                            }]
                        },
                        {
                            "featureType": "road.local",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#9e9e9e"


                            }]
                        },
                        {
                            "featureType": "transit.line",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#e5e5e5"


                            }]
                        },
                        {
                            "featureType": "transit.station",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#eeeeee"


                            }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",


                            "stylers": [{
                                "color": "#c9c9c9"


                            }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels.text.fill",


                            "stylers": [{
                                "color": "#9e9e9e"


                            }]
                        }
                    ]
                });

                $scope.currentCustomerMarker = new google.maps.Marker({
                    position: new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude),
                    map: $scope.routeMap,
                    optimized: false,
                    icon: {
                        url: '/img/marker.svg',
                        scaledSize: new google.maps.Size(20, 40),
                        /*   origin: new google.maps.Size(20, 40),
                             anchor: new google.maps.Size(20, 40)*/
                    },
                    id: [$scope.currentCustomer[0].customer_info.eZpayId],
                    serviceId: [$scope.currentCustomer[0].service_info.id],
                    multipleAddress: null,
                    customerName: $scope.currentCustomer[0].customer_info.name,
                    status: $scope.currentCustomer[0].status,
                    exceptionCode: $scope.currentCustomer[0].exception_code,
                    infoWindowPixelOffset: 4
                });


                $scope.currentCustomerMarker.addListener('click', function() {
                    // console.log("currentCustomerMarker clicked");
                    if($scope.ETA.hasOwnProperty('ETA')) {
                        var etaObj = $scope.ETA.ETA[0];
                        // etaObj.from = moment.utc(etaObj.from, 'HH:mm:ss:SSS').toDate();
                        // etaObj.to = moment.utc(etaObj.to, 'HH:mm:ss:SSS').toDate();
                        var lob = $scope.$parent.custData._source.customer.lob.toLowerCase();
                        var tzone = $scope.customerClock.zone;
                        var flag = "truck-on-map";
                        if ($scope.ETA.ETA[0].reason_code == 'ComputedETA') {
                            $scope.ETAstatus = 'Service ETA';
                            // $scope.ETATime = $filter("prettyTimeStamp")($scope.ETA.ETA[0].eta, $scope.customerClockZoneName, 'time');
                            $scope.ETATime = $filter("humanizeServiceETA")(lob, etaObj, tzone, 'truck-on-map');
                        } else if ($scope.ETA.ETA[0].reason_code == 'AlreadyServiced') {
                            $scope.ETAstatus = 'Already Serviced';
                            // $scope.ETATime = $filter("prettyTimeStamp")($scope.ETA.ETA[0].serviced_date_time, $scope.customerClockZoneName, 'time');
                            $scope.ETATime = $filter("humanizeServiceETA")(lob, etaObj, tzone, 'truck-on-map');
                        } else if ($scope.ETA.ETA[0].reason_code == 'RouteNotStarted') {
                            // $scope.ETAstatus = 'Route Not Started';
                            // $scope.ETATime = $filter("prettyTimeStamp")($scope.ETA.ETA[0].serviced_date_time, $scope.customerClockZoneName, 'time');
                            $scope.ETAstatus = 'Service ETA';
                            $scope.ETATime = $filter("humanizeServiceETA")(lob, etaObj, tzone, 'truck-on-map');
                        } else {
                            // $scope.ETAstatus = 'Unable To Compute ETA';
                            // $scope.ETATime = $filter("prettyTimeStamp")($scope.ETA.ETA[0].serviced_date_time, $scope.customerClockZoneName, 'time');
                            $scope.ETAstatus = 'Service ETA';
                            $scope.ETATime = $filter("humanizeServiceETA")(lob, etaObj, tzone, 'truck-on-map');
                        }
                    }

                    $scope.currentCustomerMarker.servicedTime = $scope.ETATime;
                    $scope.currentCustomerMarker.reasonCode = $scope.ETAstatus;
                    $scope.highlightRow($scope.currentCustomer[0].sequence);
                    $scope.setInfoWindow($scope.currentCustomerMarker);
                });

                var myoverlay = new google.maps.OverlayView();
                myoverlay.draw = function() {
                    this.getPanes().markerLayer.id = 'markerLayer';
                };
                myoverlay.setMap($scope.routeMap);
                bounds.extend($scope.currentCustomerMarker.getPosition());

                if ($scope.customerListCompleted.length > 0) {
                    var infoWindowContent = '';
                    uniqueCompleted = $filter("removeDup")($scope.customerListCompleted, 'sequence');
                    var multipleAddressCompleted = $filter('getSameLatLng')(uniqueCompleted);
                    uniqueCompleted = $filter("getUniqueLatLng")(uniqueCompleted);
                    var len = uniqueCompleted.length;
                    // for (var k = 1; k < len; k++) {
                    for (var k = 0; k < len; k++) {
                        var icon;
                        var selectedIcon;
                        var reasonCode;
                        if ((uniqueCompleted[k].status == 'Confirmed Positive') && (uniqueCompleted[k].exception_code != "--")) {
                            $scope.displayExceptionWithService = "true";
                            reasonCode = 'Serviced With Exception';
                            icon = iconList[0].servicedWithException;
                            selectedIcon = iconList[0].servicedWithExceptionSelected;
                        } else if ((uniqueCompleted[k].status == 'Confirmed Negative') && (uniqueCompleted[k].exception_code != "--")) {
                            reasonCode = 'Unable to Service';
                            icon = iconList[0].notServicedException;
                            selectedIcon = iconList[0].notServicedExceptionSelected;
                        } else if ((uniqueCompleted[k].status == 'Confirmed Positive') && (uniqueCompleted[k].exception_code == "--")) {
                            reasonCode = 'Serviced Successfully';
                            icon = iconList[0].servicedSuccessfully;
                            selectedIcon = iconList[0].servicedSuccessfullySelected;
                        }

                        if (uniqueCompleted[k].customer_info.eZpayId != $scope.currentCustomer[0].customer_info.eZpayId) {

                            $scope.markers_completed.push(new google.maps.Marker({
                                position: new google.maps.LatLng(uniqueCompleted[k].address.latitude, uniqueCompleted[k].address.longitude),
                                optimized: false,
                                icon: icon,
                                id: [uniqueCompleted[k].customer_info.eZpayId],
                                address: new google.maps.LatLng(uniqueCompleted[k].address.latitude, uniqueCompleted[k].address.longitude),
                                servicedTime: uniqueCompleted[k].ServeTime,
                                sequence: uniqueCompleted[k].sequence,
                                setIconClick: selectedIcon,
                                setPreviousIcon: icon,
                                reasonCode: reasonCode,
                                exceptionCode: uniqueCompleted[k].exception_code,
                                customerName: uniqueCompleted[k].customer_info.name,
                                multipleAddress: null,
                                serviceId: [uniqueCompleted[k].service_info.id],
                                status: uniqueCompleted[k].status,
                                infoWindowPixelOffset: 10
                            }));

                        }

                    }
                    /*console.log("checking for the mutliple addres completed... ... ");
                    console.log(multipleAddressCompleted);*/
                    if (multipleAddressCompleted.length > 0) {

                        for (var s = 0; s < multipleAddressCompleted.length; s++) {
                            var reasonCodeMul;
                            if ((multipleAddressCompleted[s].status == 'Confirmed Positive') && (multipleAddressCompleted[s].exception_code != "--")) {
                                reasonCodeMul = 'Serviced With Exception';
                            } else if ((multipleAddressCompleted[s].status == 'Confirmed Negative') && (multipleAddressCompleted[s].exception_code != "--")) {
                                reasonCodeMul = 'Unable to Service';
                            } else if ((multipleAddressCompleted[s].status == 'Confirmed Positive') && (multipleAddressCompleted[s].exception_code == "--")) {
                                reasonCodeMul = 'Serviced Successfully';
                            }
                            $scope.markers_completed.push(new google.maps.Marker({
                                position: new google.maps.LatLng(multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].address.latitude, multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].address.longitude),
                                map: $scope.routeMap,
                                optimized: false,
                                icon: iconList[0].multipleMarkerUnselected,
                                id: multipleAddressCompleted[s],
                                address: new google.maps.LatLng(multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].address.latitude, multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].address.longitude),
                                servicedTime: multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].ServeTime,
                                sequence: multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].sequence,
                                setIconClick: iconList[0].multipleMarkerSelected,
                                setPreviousIcon: iconList[0].multipleMarkerUnselected,
                                customerName: multipleAddressCompleted[s][multipleAddressCompleted[s].length - 1].customer_info.name,
                                multipleAddress: multipleAddressCompleted[s],
                                reasonCode: reasonCodeMul,
                                exceptionCode: '',
                                infoWindowPixelOffset: 10
                            }));

                        }
                    }
                    $scope.markers_completed.forEach(function(element, index) {
                        bounds.extend($scope.markers_completed[index].getPosition());
                        element.addListener('click', function() {
                            // console.log("service completed marker clicked");
                            $scope.clearSelectedMarker();
                            $scope.markers_completed[index].setIcon(element.setIconClick);
                            $scope.highlightRow(element.sequence);
                            $scope.previousMarkerSelectedCompleted = $scope.markers_completed[index];
                            $scope.previousMarkerSelectedPending = '';
                            $scope.setInfoWindow(element);
                        });
                    });

                }

                $scope.firstCustomerMarker = new google.maps.Marker({
                    position: new google.maps.LatLng($scope.stops[0].address.latitude, $scope.stops[0].address.longitude),
                    map: $scope.routeMap,
                    optimized: false,
                    icon: {
                        url: '/img/start-marker.svg',
                        size: new google.maps.Size(20, 20),
                        scaledSize: new google.maps.Size(20, 20),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(12, 12)
                    },
                    id: [$scope.stops[0].customer_info.eZpayId],
                    serviceId: [$scope.stops[0].service_info.id],
                    multipleAddress: null,
                    customerName: $scope.stops[0].customer_info.name,
                    status: $scope.stops[0].status,
                    exceptionCode: $scope.stops[0].exception_code,
                    infoWindowPixelOffset: 10

                });
                $scope.firstCustomerMarker.addListener('click', function() {
                    // console.log("First customer marker clicked");
                    if (($scope.stops[0].status == '--') && ($scope.stops[0].exception_code == "--")) {
                        $scope.firstCustomerMarker.reasonCode = '';
                        $scope.firstCustomerMarker.servicedTime = '';
                    } else if (($scope.stops[0].status == 'Confirmed Positive') && ($scope.stops[0].exception_code != "--")) {
                        $scope.firstCustomerMarker.reasonCode = 'Serviced With Exception';
                        $scope.firstCustomerMarker.servicedTime = $scope.stops[0].ServeTime;
                    } else if (($scope.stops[0].status == 'Confirmed Negative') && ($scope.stops[0].exception_code != "--")) {
                        $scope.firstCustomerMarker.reasonCode = 'Unable to Service';
                        $scope.firstCustomerMarker.servicedTime = $scope.stops[0].ServeTime;
                    } else if (($scope.stops[0].status == 'Confirmed Positive') && ($scope.stops[0].exception_code == "--")) {
                        $scope.firstCustomerMarker.reasonCode = 'Serviced Successfully';
                        $scope.firstCustomerMarker.servicedTime = $scope.stops[0].ServeTime;
                    }
                    $scope.setInfoWindow($scope.firstCustomerMarker);
                    $scope.highlightRow($scope.stops[0].sequence);
                });
                $scope.lastCustomerMarker = new google.maps.Marker({
                    position: new google.maps.LatLng($scope.stops[$scope.stops.length - 1].address.latitude, $scope.stops[$scope.stops.length - 1].address.longitude),
                    map: $scope.routeMap,
                    optimized: false,
                    icon: {
                        url: '/img/end-marker.svg',
                        size: new google.maps.Size(20, 20),
                        scaledSize: new google.maps.Size(20, 20),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(12, 12)
                    },
                    id: [$scope.stops[$scope.stops.length - 1].customer_info.eZpayId],
                    serviceId: [$scope.stops[$scope.stops.length - 1].service_info.id],
                    multipleAddress: null,
                    customerName: $scope.stops[$scope.stops.length - 1].customer_info.name,
                    status: $scope.stops[$scope.stops.length - 1].status,
                    exceptionCode: $scope.stops[$scope.stops.length - 1].exception_code,
                    infoWindowPixelOffset: -1
                });
                $scope.lastCustomerMarker.addListener('click', function() {
                    // console.log("last customer marker clicked");
                    if (($scope.stops[$scope.stops.length - 1].status == '--') && ($scope.stops[$scope.stops.length - 1].exception_code == "--")) {
                        $scope.lastCustomerMarker.reasonCode = '';
                        $scope.lastCustomerMarker.servicedTime = '';
                    } else if (($scope.stops[$scope.stops.length - 1].status == 'Confirmed Positive') && ($scope.stops[$scope.stops.length - 1].exception_code != "--")) {
                        $scope.lastCustomerMarker.reasonCode = 'Serviced With Exception';
                        $scope.lastCustomerMarker.servicedTime = $scope.stops[$scope.stops.length - 1].ServeTime;
                    } else if (($scope.stops[$scope.stops.length - 1].status == 'Confirmed Negative') && ($scope.stops[$scope.stops.length - 1].exception_code != "--")) {
                        $scope.lastCustomerMarker.reasonCode = 'Unable to Service';
                        $scope.lastCustomerMarker.servicedTime = $scope.stops[$scope.stops.length - 1].ServeTime;
                    } else if (($scope.stops[$scope.stops.length - 1].status == 'Confirmed Positive') && ($scope.stops[$scope.stops.length - 1].exception_code == "--")) {
                        $scope.lastCustomerMarker.reasonCode = 'Serviced Successfully';
                        $scope.lastCustomerMarker.servicedTime = $scope.stops[$scope.stops.length - 1].ServeTime;
                    }
                    $scope.setInfoWindow($scope.lastCustomerMarker);
                    $scope.highlightRow($scope.stops[$scope.stops.length - 1].sequence);
                });

                if ($scope.customerListPending.length > 0) {

                    uniquePending = $filter("removeDup")($scope.customerListPending, 'sequence');
                    var multipleAddressPending = $filter('getSameLatLng')(uniquePending);
                    uniquePending = $filter("getUniqueLatLng")(uniquePending);

                    var length = uniquePending.length - 1;
                    for (var m = 0; m < length; m++) {
                        if (uniquePending[m].customer_info.eZpayId != $scope.currentCustomer[0].customer_info.eZpayId) {
                            $scope.markers_pending.push(new google.maps.Marker({
                                position: new google.maps.LatLng(uniquePending[m].address.latitude, uniquePending[m].address.longitude),
                                optimized: false,
                                icon: iconList[0].yetToBeServiced,
                                id: [uniquePending[m].customer_info.eZpayId],
                                address: new google.maps.LatLng(uniquePending[m].address.latitude, uniquePending[m].address.longitude),
                                sequence: uniquePending[m].sequence,
                                setIconClick: iconList[0].yetToBeServicedSelected,
                                setPreviousIcon: iconList[0].yetToBeServiced,
                                servicedTime: '',
                                reasonCode: '',
                                exceptionCode: uniquePending[m].exception_code,
                                customerName: uniquePending[m].customer_info.name,
                                multipleAddress: null,
                                serviceId: [uniquePending[m].service_info.id],
                                status: uniquePending[m].status,
                                infoWindowPixelOffset: 10
                            }));
                        }
                    }
                    /*    console.log("checking for the mutliple addres ... ");
                        console.log(multipleAddressPending);*/

                    if (multipleAddressPending.length > 0) {
                        for (var c = 0; c < multipleAddressPending.length; c++) {
                            $scope.markers_pending.push(new google.maps.Marker({
                                position: new google.maps.LatLng(multipleAddressPending[c][0].address.latitude, multipleAddressPending[c][0].address.longitude),
                                optimized: false,
                                icon: iconList[0].multipleMarkerUnselected,
                                id: multipleAddressPending[c],
                                address: new google.maps.LatLng(multipleAddressPending[c][0].address.latitude, multipleAddressPending[c][0].address.longitude),
                                sequence: multipleAddressPending[c][0].sequence,
                                setIconClick: iconList[0].multipleMarkerSelected,
                                setPreviousIcon: iconList[0].multipleMarkerUnselected,
                                servicedTime: '',
                                customerName: multipleAddressPending[c][multipleAddressPending[c].length - 1].customer_info.name,
                                multipleAddress: multipleAddressPending[c],
                                reasonCode: '',
                                exceptionCode: '',
                                infoWindowPixelOffset: 10
                            }));
                        }
                    }
                }
                $scope.markers_pending.forEach(function(element, index) {
                    bounds.extend($scope.markers_pending[index].getPosition());
                    element.addListener('click', function() {
                        // console.log("pending service customer marker clicked");
                        $scope.clearSelectedMarker();
                        $scope.markers_pending[index].setIcon(element.setIconClick);
                        $scope.highlightRow(element.sequence);
                        $scope.previousMarkerSelectedCompleted = '';
                        $scope.previousMarkerSelectedPending = $scope.markers_pending[index];
                    });
                    element.addListener('click', function() {
                        infoWindowYetToBeServedContent = $scope.setInfoWindow(element);
                    });
                });
                $scope.routeMap.fitBounds(bounds);

                $scope.markerCluster_completed = new MarkerClusterer($scope.routeMap, $scope.markers_completed, {
                    styles: [{
                        height: 30,
                        url: '/img/cluster-black.svg',
                        width: 30,
                        //textColor: "white",
                        textSize: 12,
                    }],
                    maxZoom: 16
                });

                $scope.markerCluster_pending = new MarkerClusterer($scope.routeMap, $scope.markers_pending, {
                    styles: [{
                        height: 30,
                        url: '/img/cluster-blue.svg',
                        width: 30,
                        //textColor: "white",
                        textSize: 12,
                    }],
                    maxZoom: 16
                });

                $scope.setCustomerDetailsArr();
                $scope.drawDirection();


            };

            $scope.drawDirection = function() {
                $scope.directionsService = new google.maps.DirectionsService();
                var maxlimit = 24;
                var pendingParts = [];
                var completedParts = [];
                var inprogressCompletedParts = [];
                var inprogressPendingParts = [];
                if ($scope.customerListCompleted.length > 0 && $scope.customerListPending.length > 0 && $scope.customerListPending.length < $scope.stops.length) {
                    for (var inprogressCompleteSplice = 0; inprogressCompleteSplice < $scope.customerListCompleted.length - 1; inprogressCompleteSplice = inprogressCompleteSplice + maxlimit) {
                        inprogressCompletedParts.push($scope.customerListCompleted.slice(inprogressCompleteSplice, inprogressCompleteSplice + maxlimit + 1));
                    }

                    for (var inprogressCompleteIndex = 0; inprogressCompleteIndex < inprogressCompletedParts.length; inprogressCompleteIndex++) {
                        var inprogressCompletewaypoints = [];
                        for (var inprogressCompleteIndexj = 1; inprogressCompleteIndexj < inprogressCompletedParts[inprogressCompleteIndex].length - 1; inprogressCompleteIndexj++) {
                            inprogressCompletewaypoints.push({
                                location: new google.maps.LatLng(inprogressCompletedParts[inprogressCompleteIndex][inprogressCompleteIndexj].address.latitude, inprogressCompletedParts[inprogressCompleteIndex][inprogressCompleteIndexj].address.longitude),
                                stopover: true
                            });
                        }
                        // Service options
                        var inprogressCompleteService = {
                            origin: new google.maps.LatLng(inprogressCompletedParts[inprogressCompleteIndex][0].address.latitude, inprogressCompletedParts[inprogressCompleteIndex][0].address.longitude),
                            destination: new google.maps.LatLng(inprogressCompletedParts[inprogressCompleteIndex][inprogressCompletedParts[inprogressCompleteIndex].length - 1].address.latitude, inprogressCompletedParts[inprogressCompleteIndex][inprogressCompletedParts[inprogressCompleteIndex].length - 1].address.longitude),
                            waypoints: inprogressCompletewaypoints,
                            optimizeWaypoints: true,
                            travelMode: 'DRIVING'
                        };
                        var directionsDisplay_inprogressComplete = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeColor: "#8F8F8F",
                                strokeWidth: 10
                            }
                        });

                        $scope.drawRoute(inprogressCompleteService, directionsDisplay_inprogressComplete);

                    }


                    for (var inprogressPendingSplice = 0; inprogressPendingSplice < $scope.customerListPending.length; inprogressPendingSplice = inprogressPendingSplice + maxlimit) {
                        inprogressPendingParts.push($scope.customerListPending.slice(inprogressPendingSplice, inprogressPendingSplice + maxlimit + 1));
                    }

                    for (var inprogressPendingIndex = 0; inprogressPendingIndex < inprogressPendingParts.length; inprogressPendingIndex++) {
                        var inprogressPendingwaypoints = [];
                        for (var inprogressPendingIndexj = 1; inprogressPendingIndexj < inprogressPendingParts[inprogressPendingIndex].length - 1; inprogressPendingIndexj++) {
                            inprogressPendingwaypoints.push({
                                location: new google.maps.LatLng(inprogressPendingParts[inprogressPendingIndex][inprogressPendingIndexj].address.latitude, inprogressPendingParts[inprogressPendingIndex][inprogressPendingIndexj].address.longitude),
                                stopover: true
                            });
                        }
                        // Service options
                        var inprogressPendingService = {
                            origin: new google.maps.LatLng(inprogressPendingParts[inprogressPendingIndex][0].address.latitude, inprogressPendingParts[inprogressPendingIndex][0].address.longitude),
                            destination: new google.maps.LatLng(inprogressPendingParts[inprogressPendingIndex][inprogressPendingParts[inprogressPendingIndex].length - 1].address.latitude, inprogressPendingParts[inprogressPendingIndex][inprogressPendingParts[inprogressPendingIndex].length - 1].address.longitude),
                            waypoints: inprogressPendingwaypoints,
                            optimizeWaypoints: true,
                            travelMode: 'DRIVING'
                        };
                        var directionsDisplay_inprogressPending = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeColor: "#00B3FD",
                                strokeWidth: 10
                            }
                        });

                        $scope.drawRoute(inprogressPendingService, directionsDisplay_inprogressPending);

                    }
                }

                if ($scope.customerListPending.length > 0 && $scope.customerListPending.length == $scope.stops.length) {
                    for (var pendingSplice = 0; pendingSplice < $scope.customerListPending.length; pendingSplice = pendingSplice + maxlimit) {
                        pendingParts.push($scope.customerListPending.slice(pendingSplice, pendingSplice + maxlimit + 1));
                    }

                    for (var pendingIndex = 0; pendingIndex < pendingParts.length; pendingIndex++) {
                        var waypoints = [];
                        for (var pendingIndexj = 1; pendingIndexj < pendingParts[pendingIndex].length - 1; pendingIndexj++) {
                            waypoints.push({
                                location: new google.maps.LatLng(pendingParts[pendingIndex][pendingIndexj].address.latitude, pendingParts[pendingIndex][pendingIndexj].address.longitude),
                                stopover: true
                            });

                        }
                        // Service options
                        var pendingService = {
                            origin: new google.maps.LatLng(pendingParts[pendingIndex][0].address.latitude, pendingParts[pendingIndex][0].address.longitude),
                            destination: new google.maps.LatLng(pendingParts[pendingIndex][pendingParts[pendingIndex].length - 1].address.latitude, pendingParts[pendingIndex][pendingParts[pendingIndex].length - 1].address.longitude),
                            waypoints: waypoints,
                            optimizeWaypoints: true,
                            travelMode: 'DRIVING'
                        };

                        var directionsDisplay_pending = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeColor: "#00B3FD",
                                strokeWidth: 10
                            }
                        });

                        $scope.drawRoute(pendingService, directionsDisplay_pending);

                    }
                }
                if ($scope.customerListCompleted.length > 0 && $scope.customerListCompleted.length == $scope.stops.length) {
                    for (var completedSplice = 0; completedSplice < $scope.customerListCompleted.length; completedSplice = completedSplice + maxlimit) {
                        completedParts.push($scope.customerListCompleted.slice(completedSplice, completedSplice + maxlimit + 1));
                    }

                    for (var completedIndex = 0; completedIndex < completedParts.length; completedIndex++) {
                        var wypoints = [];
                        for (var completedIndexj = 1; completedIndexj < completedParts[completedIndex].length - 1; completedIndexj++) {
                            wypoints.push({
                                location: new google.maps.LatLng(completedParts[completedIndex][completedIndexj].address.latitude, completedParts[completedIndex][completedIndexj].address.longitude),
                                stopover: true
                            });
                        }
                        // Service options
                        var completedService = {
                            origin: new google.maps.LatLng(completedParts[completedIndex][0].address.latitude, completedParts[completedIndex][0].address.longitude),
                            destination: new google.maps.LatLng(completedParts[completedIndex][completedParts[completedIndex].length - 1].address.latitude, completedParts[completedIndex][completedParts[completedIndex].length - 1].address.longitude),
                            waypoints: wypoints,
                            optimizeWaypoints: true,
                            travelMode: 'DRIVING'
                        };
                        var directionsDisplay_Completed = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeColor: "#8F8F8F",
                                strokeWidth: 10
                            }
                        });

                        $scope.drawRoute(completedService, directionsDisplay_Completed);

                    }
                }

                $scope.markTruck($scope.currentStop);

            };
            $scope.drawRoute = function(service, renderer) {

                renderer.setMap($scope.routeMap);
                $scope.directionsService.route(service, function(response, status) {
                    if (status === 'OK') {
                        renderer.setDirections(response);
                    } else {
                        console.log('Directions request failed due to ' + status);
                    }
                });

            };

            $scope.lastSelectedRow = '';
            $scope.rowClickHigh = function(rowId, customerId) {
                $scope.lastSelectedRow = rowId;
                $scope.tdClick(customerId);

            };

            $scope.openTable = function() {

                $scope.closeTableCenter = $scope.routeMap.getCenter();
                if ($scope.openTableCenter == "") { $scope.openTableCenter = $scope.newCenter; }

                $scope.newHeightClass = true;
                $scope.openNCloseTableToggle = true;
                $scope.resizeMap();

            };
            $scope.detailtableopen = 1;
            $scope.mapopen = 1;
            $scope.uparrowopen = function() {

                $scope.closeTableCenter = $scope.routeMap.getCenter();
                if ($scope.openTableCenter == "") { $scope.openTableCenter = $scope.newCenter; }
                $scope.detailtableopen++;
                $scope.mapopen--;
                // console.log("uparrow clicked - detailtableopen - " + $scope.detailtableopen + " - mapopen - " + $scope.mapopen);
                $scope.resizeMap();
            };

            $scope.downarrowopen = function() {
                $scope.openTableCenter = $scope.routeMap.getCenter();
                if ($scope.closeTableCenter == "") { $scope.closeTableCenter = $scope.newCenter; }
                $scope.detailtableopen--;
                $scope.mapopen++;
                // console.log("uparrow clicked - detailtableopen - " + $scope.detailtableopen + " - mapopen - " + $scope.mapopen);
                $scope.resizeMap();
            };


            $scope.closeTable = function() {
                $scope.openTableCenter = $scope.routeMap.getCenter();
                if ($scope.closeTableCenter == "") { $scope.closeTableCenter = $scope.newCenter; }
                $scope.uparraow = true;
                $scope.downarrow = false;
                $scope.newHeightClass = false;
                $scope.openNCloseTableToggle = false;
                $scope.resizeMap();


            };
            $scope.getNextHighestIndex = function(arr, value) {
                var y = arr.length;
                while (arr[--y] > value);
                return arr[++y];
            };
            $scope.getNextService = function() {
                var service_day;
                var serviceArr = [];
                var sortedDayArr = [];
                var whatsthenextday;
                var dayCount = {
                    "sunday": 0,
                    "monday": 1,
                    "tuesday": 2,
                    "wednesday": 3,
                    "thruday": 4,
                    "friday": 5,
                    "saturday": 6
                };
                var dayCountRev = {
                    0: "SUNDAY",
                    1: "MONDAY",
                    2: "TUESDAY",
                    3: "WEDNESDAY",
                    4: "THRUSDAY",
                    5: "FRIDAY",
                    6: "SATURDAY"
                };
                var todayDay = new Date();
                if ($scope.services !== undefined && ($scope.services.all.length > 0)) {
                    _.each($scope.services.active.services, function(item) {
                        for (var o = 0; o < item.operations.length; o++) {
                            serviceArr.push(item.operations[o].day_of_week);
                        }
                    });
                    for (var x = 0; x < serviceArr.length; x++) {
                        sortedDayArr.push(dayCount[serviceArr[x].toLowerCase()]);
                    }
                    whatsthenextday = $scope.getNextHighestIndex(sortedDayArr.sort(), todayDay.getDay());
                    if (whatsthenextday !== undefined) {
                        service_day = dayCountRev[whatsthenextday];
                    } else {
                        service_day = dayCountRev[sortedDayArr[0]];
                    }
                } else {
                    client.search({
                        index: client.transport._config.activecustomers+','+client.transport._config.inactivecustomers,
                        type: 'custdetails',
                        body: {
                            query: {
                                query_string: {
                                    fields: ["customer.ezPayId"],
                                    query: $scope.searchedCustomer,
                                    default_operator: "AND"
                                }
                            }
                        }
                    }).then(function(stuff) {
                        $scope.custData1 = stuff.hits.hits[0];
                        var lineOfBusiness = $scope.getField($scope.custData1, 'lineOfBusiness');
                        var services = Customer.Services._($scope.searchedCustomer, lineOfBusiness).get({
                            'ezPayId': $scope.searchedCustomer
                        });

                        services.$promise.then(function(data) {
                            _.each(data.services, function(item) {
                                for (var p = 0; p < item.operations.length; p++) {
                                    serviceArr.push(item.operations[p].day_of_week);
                                }
                            });
                            for (var z = 0; z < serviceArr.length; z++) {
                                sortedDayArr.push(dayCount[serviceArr[z].toLowerCase()]);
                            }
                            whatsthenextday = $scope.getNextHighestIndex(sortedDayArr.sort(), todayDay.getDay());
                            if (whatsthenextday !== undefined) {
                                service_day = dayCountRev[whatsthenextday];
                            } else {
                                service_day = dayCountRev[sortedDayArr[0]];
                            }

                        });
                    }, function(error) {
                        $log.error("ERROR: ", error.message);
                    });
                }
                setTimeout(function() {
                    if (service_day != undefined && service_day != "null" && service_day != '' && service_day != 'Invalid') {
                        $scope.nextService = $scope.calculateNextDate(service_day);
                        $scope.nextSchedule = true;

                    } else {
                        $scope.nextSchedule = false;
                        $scope.nextService = 'near future';

                    }
                    $scope.displayErrorMsg = true;
                }, 1500);


            };

            $scope.setInfoWindow = function(element) {
                var infoContent, imgSrc, custName, custId, reasonCode, servedTime, serviceId, infoWin = "";
                if (element.multipleAddress !== null) {
                    serviceId = element.multipleAddress[0].service_info.id;
                    custId = element.multipleAddress[0].customer_info.eZpayId;
                } else {
                    serviceId = element.serviceId[0];
                    custId = element.id[0];
                }

                client.search({
                    index: client.transport._config.activecustomers+','+client.transport._config.inactivecustomers,
                    type: 'custdetails',
                    body: {
                        query: {
                            query_string: {
                                fields: ["customer.ezPayId"],
                                query: custId,
                                default_operator: "AND"
                            }
                        }
                    }
                }).then(function(stuff) {
                    $scope.custData1 = stuff.hits.hits[0];
                    var lineOfBusiness = $scope.getField($scope.custData1, 'lineOfBusiness');
                    services = Customer.Services._(custId, lineOfBusiness).get({
                        'ezPayId': custId
                    });

                    services.$promise.then(function(data) {
                        $log.debug("[REST] loaded customer services info: ", data);
                        $scope.cusServices = {
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
                                    $scope.cusServices.active.fees.push(item);
                                } else {
                                    //INACTIVE
                                    $scope.cusServices.inactive.fees.push(item);
                                }
                            } else {
                                //SERVICES
                                item.prettyServiceName = customerContract.humanizeServiceName(item);
                                item.prettyEquipmentSize = customerContract.humanizeEquipmentSize(item);
                                item.serviceCssIconClass = customerContract.serviceCssIconClass(item);

                                //ACTIVE
                                if ((description.search(/xtra/i) < 0) && item.isActive) {
                                    $scope.cusServices.active.services.push(item);
                                } else if ((description.search(/xtra/i) >= 0) && item.isActive) {
                                    //xtra pickups
                                    $scope.cusServices.active.extraPickups.push(item);
                                } else if ((description.search(/xtra/i) < 0) && !item.isActive) {
                                    //INACTIVE
                                    $scope.cusServices.inactive.services.push(item);
                                } else if ((description.search(/xtra/i) >= 0) && !item.isActive) {
                                    //xtra pickups
                                    $scope.cusServices.active.extraPickups.push(item);
                                }
                            }

                            if (item.isActive) {
                                $scope.cusServices.active.all.push(item);
                            } else {
                                $scope.cusServices.inactive.all.push(item);
                            }
                            $scope.cusServices.all.push(item);
                        });

                        var matchingContract = _.find($scope.cusServices.all, function(contract, i) {
                            var finalValue = '';
                            if (parseInt(serviceId) === parseInt(contract.id)) {
                                return true;
                            }
                        });
                        var cssClassForService = matchingContract.serviceCssIconClass;
                        // console.log("checking the css class... ");
                        // console.log(matchingContract);
                        // console.log("chekcing for the elment... ");
                        // console.log(element);
                        // var cssClassForServiceStatus = $filter('humanizeServiceStatus')(element.status, 'forCSS');
                        var cssClassForServiceStatus = $filter('humanizeServiceStatus')(element.status, lineOfBusiness.toLowerCase(), element.exceptionCode, 'forCSS');
                        // console.log("chekcing for the activity status... " + cssClassForServiceStatus);
                        if (element.multipleAddress !== null) {
                            /*for (var mul = 0; mul < element.multipleAddress.length; mul++) {
                            custName = "";
                            custId = "";
                            reasonCode = "";
                            servedTime = "";
                            custName = element.multipleAddress[mul].customer_info.name;
                            custId = element.multipleAddress[mul].customer_info.eZpayId;
                            reasonCode = element.reasonCode;
                            servedTime = element.multipleAddress[mul].service_time;

                            if (reasonCode == 'Serviced With Exception' || reasonCode == 'Serviced Successfully') {
                                imgSrc = "/img/serviced-96gallon-can.svg";
                            } else {
                                imgSrc = "/img/unserviced-96gallon-can.svg";
                            }
                            if(servedTime != ''){
                             servedTimeHtml = '<hr style="border-top: dotted 1px; color : #c5c5c5;margin:0px;width:100%;" />' +
                                '<div style="text-align :left;padding-top:10px;"><div style="text-align:center;position:relative;font-size: 15pt;color:#646464;font-family:Foundry Sterling Bold;">' + reasonCode + '</div><br>' +
                                '<div style="text-align:center;position:relative;color:#646464;top:-17px;font-family:Foundry Sterling Bold;font-size: 22pt;">' + servedTime + '</div></div>' +
                                '</div>';
                            }else{
                                servedTimeHtml = '<hr style="border-top: dotted 1px; color : #c5c5c5;margin:0px;width:100%;" />' +
                                '<div style="text-align :left;padding-top:10px;"> <div style="text-align:center;position:relative;color:#646464;top:-17px;font-family:Foundry Sterling Bold;font-size: 22pt;">We\'re on our way !</div><br>' +
                                '<div style="text-align:center;position:relative;font-size: 15pt;color:#646464;font-family:Foundry Sterling Bold;"> Service will arrive soon </div></div>' +
                                '</div>';
                            }
                            infoWin = infoWin + '<div><img src="' + imgSrc + '" style="width : 36px;height:52px"/>' +
                                '<div style="float : right; padding-left :15px;text-align :left;">' +
                                '<p style="font-size : 20pt; color:#000000;font-family:Foundry Sterling Bold; ">' + $scope.toTitleCase(custName) + '</p>' +
                                '<p style="font-size : 14pt; color:#000000;font-family:Foundry Sterling Bold; ">' + $scope.toTitleCase($scope.getCustomerAddressCity(custId)) +
                                '<br>' + $scope.toTitleCase($scope.getCustomerAddressCountry(custId)) + '</p></div>' +
                                servedTimeHtml;

                        }

                        infoContent = infoWin;*/
                        } else {
                            custName = element.customerName;
                            custId = element.id[0];
                            reasonCode = element.reasonCode;
                            servedTime = element.servicedTime;
                            servedTimeHtml = '';
                            if (servedTime != '') {
                                // servedTimeHtml = '<div class="info-sectionfirst">' +
                                //     '<div class="reason-code">' + reasonCode + '</div>' +
                                //     '<div class="srvedtime">' + servedTime + '</div>' +
                                //     '</div> </div>';
                                servedTimeHtml = '<div class="reason-code">' + reasonCode + '</div>' +
                                    '<div class="srvedtime">' + servedTime + '</div>';
                            } else {
                                // servedTimeHtml = '<div class="info-sectionfirst">' +
                                //     '<div class="srvedtime">We\'re on our way!</div>' +
                                //     '<div class="reason-code">Service will arrive soon</div>' +
                                //     '</div> </div>';
                                servedTimeHtml = '<div class="srvedtime">We\'re on our way!</div>' +
                                    '<div class="reason-code">Service will arrive soon</div>';
                            }
                            // infoContent = '<div class="info-window-custom"><div class="info-header">' +
                            //     '<div class="left-img-dynamic"><div class= "' + cssClassForService + ' ' + cssClassForServiceStatus + ' service" ></div></div>' +
                            //     '<div class="right-content-infowindow">' +
                            //     '<div class="content-heading">' + $scope.toTitleCase(custName) + '</div>' +
                            //     '<div class="content-subheading">' + $scope.toTitleCase($scope.getCustomerAddressCity(custId)) + '<br>'+$scope.toTitleCase($scope.getCustomerAddressCountry(custId)) +'</div>' +
                            //     ' </div></div>' + servedTimeHtml;
                            infoContent = '<div class="info-window-custom"><div class="info-header">' +
                                '<div class="left-img-dynamic"><div class= "' + cssClassForService + ' ' + cssClassForServiceStatus + ' service" ></div></div>' +
                                '<div class="right-content-infowindow">' +
                                '<div class="content-heading">' + $scope.toTitleCase(custName) + '</div>' +
                                '<div class="content-subheading">' + $scope.toTitleCase($scope.getCustomerAddressStreet(custId)) + '<br>' + $scope.toTitleCase($scope.getCustomerAddressCity(custId)) + ", " + $scope.getCustomerAddressState(custId) +'</div>' +
                                '<div class="content-separator"></div>' +
                                servedTimeHtml + ' </div></div>';
                        }

                        if (Object.getOwnPropertyNames($scope.serviceTimeInfoWindow).length > 0) {
                            $scope.serviceTimeInfoWindow.close();
                        }
                        $scope.serviceTimeInfoWindow = new google.maps.InfoWindow({
                            content: infoContent,
                            pixelOffset: new google.maps.Size(0,element.infoWindowPixelOffset)
                        });
                        $scope.serviceTimeInfoWindow.open($scope.routeMap, element);
                    });

                }, function(error) {
                    $log.error("ERROR: ", error.message);
                });

            };

            $scope.calculateNextDate = function(service_day) {
                var day = {
                    "MONDAY": 1,
                    "TUESDAY": 2,
                    "WEDNESDAY": 3,
                    "THURSDAY": 4,
                    "FRIDAY": 5
                };
                var date = new Date();
                date.setDate(date.getDate() + (day[service_day] + 7 - date.getDay()) % 7);
                return ($filter("prettyTimeStamp")(date, '', 'datewithoutTime'));
            };

            $scope.resizeMap = function() {
                setTimeout(function() {

                    if (angular.element('#truck-on-map-id').hasClass('map-and-details-100')) {
                        google.maps.event.trigger($scope.routeMap, 'resize');
                        $scope.routeMap.setCenter($scope.openTableCenter);
                    } else {
                        google.maps.event.trigger($scope.routeMap, 'resize');
                        $scope.routeMap.setCenter($scope.closeTableCenter);
                    }
                }, 0);

            };

            $scope.highlightRow = function(rowNum) {

                $location.hash('rowclick' + rowNum);
                $anchorScroll();
                $scope.highlightRowNum = rowNum;
                $scope.lastSelectedRow = rowNum;
                $scope.currentStopSelected = true;
                // $scope.mapopen = 1;
                // $scope.detailtableopen = 1;

            };
            $scope.highlightRowZoomMap = function(rowNum, customerId) {


                $location.hash('rowclick' + rowNum);
                $anchorScroll();
                $scope.highlightRowNum = rowNum;
                $scope.lastSelectedRow = rowNum;
                $scope.currentStopSelected = true;
                $scope.tdClick(customerId);
            };

            $scope.tdClick = function(customerId) {

                $scope.maxZoomLatLng = "";
                if (customerId == $scope.currentCustomerMarker.id) {

                    $scope.routeMap.setCenter(new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude));
                    $scope.maxZoomLatLng = new google.maps.LatLng($scope.currentCustomer[0].address.latitude, $scope.currentCustomer[0].address.longitude);
                    $scope.calculateMaxZoomLevel($scope.maxZoomLatLng);


                } else if ($scope.firstCustomerMarker.id.includes(customerId)) {
                    $scope.routeMap.setCenter(new google.maps.LatLng($scope.stops[0].address.latitude, $scope.stops[0].address.longitude));
                    $scope.maxZoomLatLng = new google.maps.LatLng($scope.stops[0].address.latitude, $scope.stops[0].address.longitude);
                    $scope.calculateMaxZoomLevel($scope.maxZoomLatLng);


                } else if ($scope.lastCustomerMarker.id.includes(customerId)) {
                    $scope.routeMap.setCenter(new google.maps.LatLng($scope.stops[$scope.stops.length - 1].address.latitude, $scope.stops[$scope.stops.length - 1].address.longitude));
                    $scope.maxZoomLatLng = new google.maps.LatLng($scope.stops[$scope.stops.length - 1].address.latitude, $scope.stops[$scope.stops.length - 1].address.longitude);
                    $scope.calculateMaxZoomLevel($scope.maxZoomLatLng);


                } else {
                    for (var a = 0; a < $scope.markers_completed.length; a++) {

                        if ($scope.markers_completed[a].id.includes(customerId)) {
                            $scope.clearSelectedMarker();
                            $scope.routeMap.setCenter($scope.markers_completed[a].address);
                            $scope.markers_completed[a].setIcon($scope.markers_completed[a].setIconClick);
                            $scope.maxZoomLatLng = $scope.markers_completed[a].address;
                            $scope.calculateMaxZoomLevel($scope.maxZoomLatLng);
                            $scope.previousMarkerSelectedCompleted = $scope.markers_completed[a];
                            $scope.previousMarkerSelectedPending = '';
                        }

                    }
                    for (var b = 0; b < $scope.markers_pending.length; b++) {
                        if ($scope.markers_pending[b].id.includes(customerId)) {
                            //if (customerId == $scope.markers_pending[b].id) {
                            $scope.clearSelectedMarker();
                            $scope.routeMap.setCenter($scope.markers_pending[b].address);
                            $scope.markers_pending[b].setIcon($scope.markers_pending[b].setIconClick);
                            $scope.maxZoomLatLng = $scope.markers_pending[b].address;
                            $scope.calculateMaxZoomLevel($scope.maxZoomLatLng);
                            $scope.previousMarkerSelectedCompleted = '';
                            $scope.previousMarkerSelectedPending = $scope.markers_pending[b];
                        }
                    }
                }
                $scope.closeTableCenter = $scope.routeMap.getCenter();

            };


            $scope.usersTable = new NgTableParams({}, { dataset: $scope.stops });
            $scope.customerAddressDetails = new Map();
            $scope.customerAddressCity = new Map();
            $scope.customerAddressStreet = new Map();
            $scope.customerAddressState = new Map();
            $scope.customerAddressCountry = new Map();

            $scope.getCustomerAddress = function(custId) {
                return $scope.customerAddressDetails.get(custId);
            };

            $scope.getCustomerAddressStreet = function(custId) {
                return $scope.customerAddressStreet.get(custId);
            };

            $scope.getCustomerAddressCity = function(custId) {
                return $scope.customerAddressCity.get(custId);
            };

            $scope.getCustomerAddressState = function(custId) {
                return $scope.customerAddressState.get(custId);
            };
            $scope.getCustomerAddressCountry = function(custId) {
                return $scope.customerAddressCountry.get(custId);
            };

            $scope.calculateMaxZoomLevel = function(latLng) {
                $scope.routeMap.setZoom(18);
                /*var maxZoomService = new google.maps.MaxZoomService();
                maxZoomService.getMaxZoomAtLatLng(latLng, function(response) {
                    $scope.routeMap.setZoom(response.zoom);
                });*/


            };
            $scope.setCustomerDetailsArr = function() {
                for (var p = 0; p < $scope.markers_completed.length; p++) {
                    if ($scope.markers_completed[p].id.length > 1) {
                        var tempArr = [];
                        for (var f = 0; f < $scope.markers_completed[p].id.length; f++) {
                            tempArr.push($scope.markers_completed[p].id[f].customer_info.eZpayId);
                        }
                        $scope.markers_completed[p].id = [];
                        $scope.markers_completed[p].id = tempArr;

                    }
                }
                for (var q = 0; q < $scope.markers_pending.length; q++) {
                    if ($scope.markers_pending[q].id.length > 1) {
                        var tempArray = [];

                        for (var h = 0; h < $scope.markers_pending[q].id.length; h++) {
                            tempArray.push($scope.markers_pending[q].id[h].customer_info.eZpayId);
                        }
                        $scope.markers_pending[q].id = [];
                        $scope.markers_pending[q].id = tempArray;

                    }
                }

            };
            $scope.findCustIds = function() {
                var concatedCustIds = [];
                for (i = 0; i < $scope.stops.length; i++) {
                    var eZpayId = $scope.stops[i].customer_info.eZpayId;
                    concatedCustIds.push(eZpayId);
                }
                return concatedCustIds;
            };
            $scope.convertDate = function(strDate) {

                var date = new Date(strDate);
                var newDate = $filter('date')(date, "MM-dd-yyyy hh:mm a", "CST");

                return newDate;
            };
            $scope.evaluateChange = function() {
                $scope.usersTable.filter({ $: $scope.globalSearch });

            };
            $scope.clearGlobalSearch = function() {
                $scope.globalSearch = '';
                $scope.usersTable.filter({ $: $scope.globalSearch });
            };

            $scope.toTitleCase = function(str) {
                if(str === undefined || str === null || str === ''){
                    return '';
                }else{
                    return str.toLowerCase().replace(/\b(\w)/g, function(s) { return s.toUpperCase(); });
                }
            };
            $scope.getCustIdAndAddressMap = function(stuff) {
                var addressMap = new Map();
                $scope.addressMapStreet = new Map();
                $scope.addressMapCountry = new Map();
                $scope.addressMapCity = new Map();
                $scope.addressMapState = new Map();
                for (i = 0; i < stuff.hits.hits.length; i++) {
                    var street = stuff.hits.hits[i]._source.customer.serviceContact.address.street;
                    var city = stuff.hits.hits[i]._source.customer.serviceContact.address.city;
                    var state = stuff.hits.hits[i]._source.customer.serviceContact.address.state;
                    var postalCode = stuff.hits.hits[i]._source.customer.serviceContact.address.postalCode;
                    var country = stuff.hits.hits[i]._source.customer.serviceContact.address.country;
                    var address = street + " " + city + " , " + state + " " + postalCode + " " + country;
                    var ezPayId = stuff.hits.hits[i]._source.customer.ezPayId;
                    addressMap.set(ezPayId, address);
                    $scope.addressMapStreet.set(ezPayId, street);
                    $scope.addressMapCountry.set(ezPayId, (city + " , " + state + " " + postalCode + " " + country));
                    $scope.addressMapCity.set(ezPayId, city);
                    $scope.addressMapState.set(ezPayId, (state + " " + postalCode));
                }
                return addressMap;
            };
            $scope.getCustomerDataDetails = function(customerIds) {
                var json = {
                    "size": 10000,
                    "query": {
                        "filtered": {
                            "filter": {
                                "terms": {
                                    "customer.ezPayId": [customerIds]
                                }
                            }
                        }

                    }
                };
                client.search({
                    index: client.transport._config.activecustomers,
                    type: 'custdetails',
                    body: json
                }).then(function(stuff) {
                    $scope.customerAddressDetails = $scope.getCustIdAndAddressMap(stuff);
                    $scope.customerAddressStreet = $scope.addressMapStreet;
                    // $scope.customerAddressCity = $scope.addressMapStreet;
                    $scope.customerAddressCity = $scope.addressMapCity;
                    $scope.customerAddressState = $scope.addressMapState;
                    $scope.customerAddressCountry = $scope.addressMapCountry;
                }, function(error) {
                    $log.debug("[REST] error in fetching data for route details. For details: " + $scope.error);
                });
            };

            $scope.clearSelectedMarker = function() {

                if (($scope.previousMarkerSelectedCompleted) != '') {
                    $scope.previousMarkerSelectedCompleted.setIcon($scope.previousMarkerSelectedCompleted.setPreviousIcon);
                }
                if (($scope.previousMarkerSelectedPending) != '') {
                    $scope.previousMarkerSelectedPending.setIcon($scope.previousMarkerSelectedPending.setPreviousIcon);
                }

            };
        }
    ]);

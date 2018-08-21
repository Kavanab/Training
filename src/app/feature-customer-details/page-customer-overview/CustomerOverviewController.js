angular.module('searchApp.customer.overview', [])

.controller("CustomerOverviewController", [
    '$scope',
    '$log',
    '$http',
    '$location',
    '$rootScope',
    '$state',
    '$stateParams',
    'esFactory',
    'client',
    '$element',
    'Customer',
    'customerData',
    'uiGmapGoogleMapApi',
    // 'uiGmapIsReady',
    'UserLocation',
    function($scope,
        $log,
        $http,
        $location,
        $rootScope,
        $state,
        $stateParams,
        esFactory,
        client,
        $element,
        Customer,
        customerData,
        uiGmapGoogleMapApi,
        // uiGmapIsReady,
        UserLocation) {

        $log.debug('[CONTROLLER] CustomerOverviewController', {
            'current state': $state.current.name
        });

        $scope.currentCarouselPage = 1;
        $scope.carouselPaging = function(direction) {
            if (direction === 'left') {
                if ($scope.currentCarouselPage > 1) {
                    $scope.currentCarouselPage = $scope.currentCarouselPage - 1;
                }
            } else {
                if ($scope.currentCarouselPage < ($scope.$parent.services.active.services.length / 3)) {
                    $scope.currentCarouselPage = $scope.currentCarouselPage + 1;
                }
            }
        };

        $scope.createMap = function(maps, data) {
            // var status = data.status;
            var dat = data;

            $log.debug('[GEOLOCATE CUSTOMER]: ', dat, $scope.map, $scope.marker);
            $scope.map = {
                center: {
                    latitude: dat.lat,
                    longitude: dat.lng
                },
                zoom: 18,
                options: {
                    mapTypeId: maps.MapTypeId.HYBRID,

                    panControl: false,
                    mapTypeControl: false,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    },
                    rotateControl: false,
                    // tilt: 45,
                    zoomControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                        position: google.maps.ControlPosition.LEFT_TOP
                    },
                    scaleControl: false,
                    streetViewControl: false,
                    streetViewControlOptions: {
                        position: google.maps.ControlPosition.LEFT_TOP
                    }
                }
            };
            $scope.marker = {
                id: 0,
                coords: {
                    latitude: dat.lat,
                    longitude: dat.lng
                },
                options: {
                    draggable: false
                }
            };
        };

        uiGmapGoogleMapApi.then(function(googleMaps) {
            // var latLong = (UserLocation.getStoredLocation().latLong);
            if (!!$scope.$parent.geocodedServiceAddress) {
                $scope.createMap(googleMaps, $scope.$parent.geocodedServiceAddress);
            }
            $scope.$on('serviceAddressGeocoded', function(event, data) {
                $scope.createMap(googleMaps, data.data);
            });
        });



    }
]);

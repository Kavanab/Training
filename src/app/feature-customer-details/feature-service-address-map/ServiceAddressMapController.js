angular.module('searchApp.customer.overview.serviceAddressMap', [])
.controller("ServiceAddressMapController", ['$scope',
    '$log',
    '$rootScope',
    '$state',
    '$stateParams',
    'customerData',
    'UserLocation',
     function ($scope,
        $log,
        $rootScope,
        $state,
        $stateParams,
        customerData,
        UserLocation) {

   
    //$scope.uluru = {};  
    $scope.thisScopeIs = 'ServiceAddressMapController';
        $log.debug('[CONTROLLER] ServiceAddressMapController', {
            'current state': $state.current.name
        });
 $rootScope.viewingServiceAddressMap = true;

           
    $scope.createMap = function(dat) {
    
      var customerLocation = {lat: dat.lat, lng: dat.lng};
      var map = new google.maps.Map(document.getElementById('service-address-map'), {
        zoom: 20,
        mapTypeId : google.maps.MapTypeId.HYBRID,
        panControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        // tilt: 45,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_TOP
        },
        scaleControl: false,
        fullscreenControl: false,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        center: customerLocation
      });
     var marker = new google.maps.Marker({
        position: customerLocation,
        map: map,
        labelClass:'marker-labels',
        label : 'Service Address: '+ $scope.$parent.getField($scope.$parent.custData, 'serviceAddress')
      });
    };

        if (!!$scope.$parent.geocodedServiceAddress) {
              $scope.createMap( $scope.$parent.geocodedServiceAddress);
            }
        $scope.$on('serviceAddressGeocoded', function(event, data) {
            $scope.createMap(data.data);
        });
}]);
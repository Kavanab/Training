angular.module('searchApp')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/search/');
        $stateProvider
            .state('app', {
                url: '',
                abstract: true
            })
            .state('app.search', {
                url: '/search/:id',
                views: {
                    'search@': {
                        templateUrl: 'partial/search-results.html',
                        controller: 'SearchResultsController'
                    },
                    'customer@': {
                        templateUrl: 'partial/customer-details.html',
                        controller: 'CustomerController'
                    }
                }
            })
            .state('app.customer', {
                url: '/customer/:custid',
                controller: '',
                views: {
                    'search@': {
                        templateUrl: 'partial/search-results.html',
                        controller: 'SearchResultsController'
                    },
                    'customer@': {
                        templateUrl: 'partial/customer-details.html',
                        controller: 'CustomerController',
                        link: function () {}
                    }
                }
            })
            .state('app.customer.overview', {
                url: '/',
                views: {
                    'overview': {
                        templateUrl: 'partial/page-customer-overview.html',
                        controller: 'CustomerOverviewController'
                    }
                }
            })
            .state('app.customer.map', {
                url: '/map',
                views: {
                    'mapServiceAddress': {
                        templateUrl: 'partial/service-address-map.html',
                        controller: 'ServiceAddressMapController'
                    }
                }
            })
            .state('app.customer.mapnew', {
                url: '/route',
                views: {
                    'truckOnMap': {
                        templateUrl: 'partial/truck-on-map.html',
                        controller: 'TruckOnMapController'
                    }
                }
            })
            .state('app.customer.billing', {
                url: '/billing',
                views: {
                    'billingOverview': {
                        templateUrl: 'partial/feature-billing-overview.html',
                        controller: 'BillingOverviewController'
                    }
                }
            });
    }]);
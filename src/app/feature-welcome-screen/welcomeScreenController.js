angular.module('searchApp')
    .controller("WelcomeScreenController", [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$element',
        '$log',
        '$localStorage',
        'userLogin',
        function($scope, $routeParams, $rootScope, $element, $log, $localStorage, userLogin) {

            'use strict';

            $scope.signInUser = function(){
                $scope.signOut();
                $rootScope.showLoginOverlay = true;
            };

            $scope.signInButtonText = '';

            // sign in button text
            if ( typeof $localStorage.loginInfo !== 'object' ) {
                $scope.signInButtonText = 'SIGN IN';
            }
            else {
                $scope.signInButtonText = 'SIGN OUT';
            }

            // update sign in button when the user successfully logs in
            $scope.$on("user-logged-in", function(e, data){
                $scope.signInButtonText = 'SIGN OUT';
            });

            // update sign in button when the user successfully logs out
            $scope.$on("user-logged-out", function(e, data){
                $scope.signInButtonText = 'SIGN IN';
            });

            $scope.showUpdates = function(){
                $scope.showUpdatesOverlay();
            };
        }
    ]);

angular.module('searchApp.loginOverlay', [])
    .controller("LoginOverlayController", [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$element',
        '$log',
        '$localStorage',
        '$q',
        'userLogin',
        'serverLog',
        function(
          $scope,
          $routeParams,
          $rootScope,
          $element,
          $log,
          $localStorage,
          $q,
          userLogin,
          serverLog
          ) {

            'use strict';

            $scope.eyeballFile = 'img/eyeball-closed.svg';
            $scope.showLoginError = false;
            $scope.animateLoginError = false;

            $scope.closeLoginOverlay = function(){
              // clear out the form
              $scope.loginForm.username = '';
              $scope.loginForm.password = '';

              // remove login errors
              $scope.showLoginError = false;
              $scope.animateLoginError = false;

              $rootScope.showLoginOverlay = false;
            };

            $scope.showLoginOverlay = function(){
              $scope.signOut();
              $rootScope.showLoginOverlay = true;
            };

            $scope.$on("show-login-overlay", function(e){
              $scope.signOut();
              $rootScope.showLoginOverlay = true;
            });

            $scope.loginForm = {};

            $scope.passwordInputType = 'password';

            $scope.signOut = function(){
                if ( typeof $localStorage.loginInfo === 'object' ) {
                    delete $localStorage.loginInfo;
                    $rootScope.$broadcast("user-logged-out");
                }
            };

            $scope.eyeballClick = function(){
                $scope.togglePasswordVisibility();
                $scope.toggleEyeballFile();
            };

            $scope.toggleEyeballFile = function(){
                $scope.eyeballFile = $scope.eyeballFile === 'img/eyeball-closed.svg' ? 'img/eyeball-open.svg' : 'img/eyeball-closed.svg';
            };

            $scope.togglePasswordVisibility = function(){
                $scope.passwordInputType = $scope.passwordInputType === 'text' ? 'password' : 'text';
            };

            $scope.handleLoginForm = function() {

              var onSuccess = function( data ){
                $log.debug("[REST] login success: ", data);
                $scope.loginInfo = data;

                // log the success to the serverLogs
                serverLog.send({
                  'isUserLoginSuccessful': true,
                  'results': data
                });

                // clear out the form
                $scope.loginForm.username = '';
                $scope.loginForm.password = '';

                $scope.showLoginError = false;
                $scope.animateLoginError = false;
                $rootScope.showLoginOverlay = false;
                $localStorage.loginInfo = data;
                $rootScope.$broadcast("user-logged-in", data);
              };
              var onFail = function( error ){
                $log.debug("[REST] login fail: ", error);
                $scope.showLoginError = true;
                $scope.animateLoginError = true;

                // log the fail to the serverLogs
                serverLog.send({
                  'isUserLoginSuccessful': false,
                  'results': {
                    status: error.status,
                    statusText: error.statusText,
                    logonId: error.data.logonId,
                    result: error.data.result,
                    config: {
                      headers: error.config.headers,
                      method: error.config.method,
                      url: error.config.url
                    }
                  }
                });

                // remove animation class so we can animate again
                setTimeout(function(){
                  $scope.animateLoginError = false;
                }, 600);
              };

              userLogin
                .login( $scope.loginForm.username, $scope.loginForm.password )
                .then( onSuccess )
                .catch( onFail );
            };
        }
    ]);

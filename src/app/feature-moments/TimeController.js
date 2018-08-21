//this controller provides date/time info to the clock on the intro screen
  angular.module('searchApp.moment', [])
  .controller('TimeController', ['$localStorage', '$scope', 'Moments', 
    function($localStorage, $scope, Moments){

    $scope.loginInfo = {};

    $scope.handleMoments = function(){
      var moments = Moments.updateTime();
      $scope.timeOfDay = moments.timeOfDay;
      $scope.curTime = moments.curTime;
      $scope.curDate = moments.curDate;
      $scope.curAmPm = moments.curAmPm;
    };

    setTimeout(function(){
      $scope.$apply($scope.handleMoments);
    },1 );
    setInterval(function(){
      $scope.$apply($scope.handleMoments);
    }, 1000);

    // update user login info with localstorage if available
    if ($localStorage.loginInfo) {
      $scope.loginInfo = $localStorage.loginInfo;
    }

    // update user login info if user logs in
    $scope.$on("user-logged-in", function(e, data){
        $scope.loginInfo = data;
    });
  }]);
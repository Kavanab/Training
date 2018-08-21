describe('TimeController', function() {

    beforeEach(module('searchApp'));

    describe('Controller: searchApp.moments.TimeController', function() {
        it('should exist', inject(function($controller) {
            var $scope = {};
            var controller = $controller('TimeController', {
                $scope: $scope
            });
            expect(controller).toBeDefined();

        }));
        describe('$scope.handleMoments', function() {
            it('gets the current date and time and stores bits of it', inject(function($controller) {

                var $scope = {};
                var controller = $controller('TimeController', {
                    $scope: $scope
                });
                $scope.handleMoments();
                expect($scope.curAmPm).toEqual('am' || 'pm');

            }));
        })
    });
});

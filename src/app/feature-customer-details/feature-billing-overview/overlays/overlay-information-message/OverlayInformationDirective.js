angular.module('searchApp.customer')
    .directive("overlayInformationMessage", function () {
        return {
            restrict: 'E',
            templateUrl: "partial/overlay-information-message.html",
            replace: true,
            controller: function () {},
            link: function (scope, element, attrs) {
                scope.closeInformationMessage = function () {
                    scope.$emit('reveal', {
                        'id': 'overlay-information-message',
                        'action': "close",
                        'clickedID': ""
                    });
                };
            }
        };
    });
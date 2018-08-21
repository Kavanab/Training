angular.module('searchApp.customer.overview.activityFeed')
    .directive("activityFeed", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/activity-feed.html",
            replace: true,
            controller: 'ActivityFeedController',
            link: function(scope, element, attrs) {
            $(element).on('click', '.toggle-timestamp', function(e){
                    $('.timestamp').toggleClass('relative');
                });
            }
        };
    })
    .directive('onScrollToBottom', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw = element[0];
            var offset = attrs.onScrollToBottomOffset ? attrs.onScrollToBottomOffset : 0;

            element.bind('scroll DOMMouseScroll mousewheel onmousewheel', function () {
                // console.log('in scroll');
                // console.log(raw.scrollTop + raw.offsetHeight);
                // console.log(raw.scrollHeight);

                // the offset controls the size of the bottom area of the scroll
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight - offset) {
                    scope.$apply(attrs.onScrollToBottom);

                    // when the absolute bottom is reached while evaluating an offset, call a 2nd function if supplied
                    if (offset > 0 && !!attrs.onScrollToBottomAbsolute && raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                        scope.$apply(attrs.onScrollToBottomAbsolute);
                    }
                }
            });
        }
    };
});

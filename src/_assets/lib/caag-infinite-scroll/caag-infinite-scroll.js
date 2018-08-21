angular.module('caag-infinite-scroll', [])
    .directive('scrollToTop', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var raw = element[0];
                var offset = attrs.scrollToTopOffset ? attrs.scrollToTopOffset : 0;

                element.bind('scroll DOMMouseScroll mousewheel onmousewheel', function (event) {
                    // console.log("in scroll");
                    // console.log(raw.scrollTop + raw.offsetHeight);
                    // console.log(raw.scrollHeight);

                    // the offset controls the size of the bottom area of the scroll
                    if (raw.scrollTop <= offset) {
                        console.log('scroll to the top');
                        scope.$apply(attrs.scrollToTop);

                        // when the absolute bottom is reached while evaluating an offset, call a 2nd function if supplied
                        if (offset > 0 && !!attrs.scrollToTopAbsolute && raw.scrollTop <= 0) {
                            scope.$apply(attrs.scrollToTopAbsolute);
                        }
                    }
                });
            }
        };
    })
    .directive('scrollToBottom', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var raw = element[0];
                var offset = attrs.scrollToBottomOffset ? attrs.scrollToBottomOffset : 0;

                element.bind('scroll DOMMouseScroll mousewheel onmousewheel', function (event) {
                    // console.log("in scroll");
                    // console.log(raw.scrollTop + raw.offsetHeight);
                    // console.log(raw.scrollHeight);

                    // the offset controls the size of the bottom area of the scroll
                    if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight - offset) {
                        console.log('scroll to the bottom');
                        scope.$apply(attrs.scrollToBottom);

                        // when the absolute bottom is reached while evaluating an offset, call a 2nd function if supplied
                        if (offset > 0 && !!attrs.scrollToBottomAbsolute && raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                            scope.$apply(attrs.scrollToBottomAbsolute);
                        }
                    }
                });
            }
        };
    });
//search related directives

angular.module('searchApp.searchBar')
    .directive("searchBar", function() {
        return {
            restrict: 'E',
            templateUrl: "partial/search-bar.html",
            replace: true,
            controller: 'SearchBarController',
            link: function(scope, element, attrs) {
                $('.input-primary-customer-search').focus();
                // scope.doSearch();
                $('body').on('click', function(e){
                    if( !$('#primary-search-dropdown').hasClass('closed') ){
                        scope.searchDropdownOpen = false;
                    }
                });
            },
            require: ['^?results']
        };
    });

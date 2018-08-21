angular.module('searchApp.searchBar', [])
    .controller("SearchBarController", function($scope, $routeParams, $rootScope, $element, $log, $localStorage) {

        $scope.searchDropdownOpen = false;
        $scope.thisScopeIs = 'SearchBarController';
        var placeholderVariations = {
            'active': 'Search active customers...',
            'inactive': 'Search cancelled customers...',
            'all': 'Search all customers...'
        };
        $scope.searchFilterState = {
            'active': 'off',
            'inactive': 'off',
            'all': 'off'
        };
        $scope.placeholderText = placeholderVariations.active;

        if (!$localStorage.searchDropdownSelection) {
            $localStorage.searchDropdownSelection = 'active';
        }
        $scope.searchDropdownSelection = $localStorage.searchDropdownSelection;

        $scope.clearInput = function() {
            $scope.inputSearch = '';
            $scope.doSearchRoute();
        };
        $scope.handleKeydown = function() {
            $log.debug("[FUNCTION] searchApp.searchBar.handleKeydown");
            $scope.doSearchRoute();
        };

        $scope.speechRecognitionSupport = false;

        try {
            // $scope.recognition = new webkitSpeechRecognition();
        } catch (e) {
            $scope.recognition = false;
        }
        if (!!$scope.recognition) {
            // Supported!
            $scope.speechRecognitionSupport = true;

            $scope.recognition.continuous = false;
            $scope.recognition.interimResults = true;

            $scope.listening = false;
            $scope.speakingAnimation = false;

            var speechCount = 1;

            $scope.stopListening = _.debounce(function() {
                $scope.recognition.stop();
                $scope.listening = false;
                $scope.$apply();
            }, 2500);

            $scope.recognition.onresult = function(event) {
                var interim_transcript = '';
                var final_transcript = '';

                if (typeof(event.results) == 'undefined') {
                    $scope.recognition.onend = null;
                    $scope.listening = false;
                    $scope.$apply();
                    $scope.recognition.stop();
                    return;
                }
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }

                if (final_transcript !== '') {
                    $scope.inputSearch = final_transcript;
                    $scope.handleKeydown();
                    $scope.stopListening();
                    console.log("FINAL: ", final_transcript);
                }
                if (interim_transcript !== '') {
                    $scope.inputSearch = interim_transcript;
                    $scope.handleKeydown();
                    console.log(interim_transcript);
                    var theRing = $element.find('.mic-container .ring-' + speechCount);
                    theRing.addClass('doAnimation');
                    speechCount++;
                    if (speechCount > 9) {
                        speechCount = 1;
                    }

                    setTimeout(function() {
                        theRing.removeClass('doAnimation');
                    }, 1000);
                    // $scope.stopListening();
                }
                // $scope.speakingAnimation = true;
            };

            $scope.recognition.onend = function() {
                $scope.listening = false;
                $scope.$apply();
            };

            $scope.listenForSpeech = function() {
                console.log("LISTENINGGGGG");
                $scope.recognition.start();
                $scope.listening = true;
                setTimeout(function() {
                    $scope.placeholderTextListening = 'Speak to ' + $scope.placeholderText.toLowerCase();
                }, 400);
            };
        }




        $scope.toggleSearchDropdown = function() {
            $scope.searchDropdownOpen = !$scope.searchDropdownOpen;
            console.log($scope.searchDropdownOpen);
        };

        $scope.handleSearchDropdownChange = function(selection) {
            _.each($scope.searchFilterState, function(item, key) {
                $scope.searchFilterState[key] = 'off';
            });
            // if(selection === 'active'){
            //     $scope.placeholderText = placeholderVariations.active;
            //     // $scope.searchFilterState.active = 'on';
            // }else if(selection === 'inactive'){
            //     $scope.placeholderText = placeholderVariations.inactive;
            //     // $scope.searchFilterState.inactive = 'on';
            // }else if(selection === 'all'){
            //     $scope.placeholderText = placeholderVariations.all;
            //     // $scope.searchFilterState.all = 'on';
            // }
            $scope.placeholderText = placeholderVariations[selection];
            setTimeout(function() {
                $scope.placeholderTextListening = 'Speak to ' + $scope.placeholderText.toLowerCase();
            }, 400);
            $scope.searchFilterState[selection] = 'on';

            $localStorage.searchDropdownSelection = selection;
            $scope.searchDropdownOpen = false;
            $('.input-primary-customer-search').focus();
            $scope.doSearchRoute(true);
        };

        $scope.handleSearchDropdownChange($localStorage.searchDropdownSelection);

        $scope.$watch(function(scope) {
            return $scope.inputSearch;
        }, function() {
            if (!!$scope.inputSearch) {
                if ($scope.inputSearch.length === 0) {
                    $rootScope.searchResultsReady = false;
                }
            }
        });

        $rootScope.inputSearch = $scope.inputSearch;

        // $scope.$watch(function(scope) {
        //     return $scope.weatherIconMarkup;
        // }, function() {
        //     if ($scope.weatherIconMarkup !== '') {
        //         $element.find('weather').html('').append($scope.weatherIconMarkup);
        //     }
        // });
    });

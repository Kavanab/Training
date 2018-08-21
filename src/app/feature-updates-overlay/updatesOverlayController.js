angular.module('searchApp.updatesOverlay', [])
    .controller("UpdatesOverlayController", [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$element',
        '$log',
        '$localStorage',
        '$q',
        '$timeout',
        'caagUpdates',
        'serverLog',
        function(
            $scope,
            $routeParams,
            $rootScope,
            $element,
            $log,
            $localStorage,
            $q,
            $timeout,
            caagUpdates,
            serverLog
        ) {

            'use strict';

            $scope.caagUpdatesArray = [];
            $scope.caagUpdatesBadgeCount = 0;
            $scope.updateGraphicPath = '';
            $scope.showingUpdateGraphic = false;
            $scope.showingUpdateBar = false;
            $scope.updateBarDismissed = false;
            $scope.lastUnviewedUpdate = '';
            $scope.caagUpdateBadgeAnimate = false;
            var caagUpdateBadgeTimeout;

            caagUpdates.success(function(data) {
                $scope.caagUpdatesArray = data;
                $scope.initalizeCaagUpdatesArray();
            });

            $scope.initalizeCaagUpdatesArray = function() {

                var array = $scope.caagUpdatesArray;
                var arrayForStorage = {};
                var today = moment();
                var latestDate = moment(array[0].date);
                var latestUpdateCount = array[0].update.length;
                var daysSinceRelease = moment.duration(today.diff(latestDate)).asDays();

                // build default viewed options
                // we only want to show the most recent release updates as not viewed if there is a path available
                // if latest release is more than 30 days old, default all items to viewed
                _.each(array, function(release, index, list) {
                    if(index===0 && daysSinceRelease <= 30) {

                        arrayForStorage.date = release.date;
                        arrayForStorage.update = [];

                        _.each(release.update, function(update, index, list) {
                            if (!!update.path) {
                                update.viewed = false;
                            } else {
                                update.viewed = true;
                            }

                            arrayForStorage.update.push(update.viewed);
                        });
                    } else {
                        // default all other play buttons to viewed
                        _.each(release.update, function(update, index, list) {
                            if (!!update.path) {
                                update.viewed = true;
                            }
                        });
                    }
                });

                // check local storage for saved values
                if ( typeof $localStorage.caagUpdates === 'object' ) {

                    // check date and count
                    var storedCaagUpdates = $localStorage.caagUpdates;
                    var storedReleaseDate = storedCaagUpdates.date;
                    var storedUpdateCount = storedCaagUpdates.update.length;

                    // if date and count matches, update array with stored values
                    if (storedReleaseDate == array[0].date && storedUpdateCount == latestUpdateCount) {
                        _.each(storedCaagUpdates.update, function(update, index) {
                            array[0].update[index].viewed = update;
                        });

                    } else {
                        // date and count didn't match, delete and store new object with default values
                        if (Object.keys(arrayForStorage).length !== 0 ) {
                            arrayForStorage.dismissBarTimestamp = 0;
                            $scope.updateCaagUpdates(arrayForStorage);
                        } else {
                            delete $localStorage.caagUpdates;
                        }
                    }

                } else {
                    if (Object.keys(arrayForStorage).length !== 0 ) {
                        arrayForStorage.dismissBarTimestamp = 0;
                        $scope.updateCaagUpdates(arrayForStorage);
                    }
                }

                $scope.caagUpdatesArray = array;
                $scope.updateCaagUpdatesBadgeCount();

                if($scope.caagUpdatesBadgeCount > 0) {

                    $timeout(function() {
                        $scope.animateBadge();
                    }, 700);

                }

                if(typeof $localStorage.caagUpdates === 'object') {
                    $scope.setBarVisibility();
                }

            };

            $scope.animateBadge = function() {

                $scope.caagUpdateBadgeAnimate = true;
                caagUpdateBadgeTimeout = $timeout(function() {
                    $scope.caagUpdateBadgeAnimate = false;
                },500);

            };

            $scope.updateCaagUpdates = function(data) {
                $localStorage.caagUpdates = data;
            };

            $scope.setBarVisibility = function() {
                var today = moment();
                var dismissBarTimestamp = moment($localStorage.caagUpdates.dismissBarTimestamp);
                var hoursSinceDismiss = moment.duration(today.diff(dismissBarTimestamp)).asHours();

                // never show if hours since dismiss is some large negative number from perm dismissal
                if ($scope.caagUpdatesBadgeCount > 0 && (hoursSinceDismiss > 18 || (hoursSinceDismiss < 0.0001 && hoursSinceDismiss > -0.10))) {
                    $scope.showingUpdateBar = true;
                }

                // temp for Dev
                // if ($scope.caagUpdatesBadgeCount > 0) {
                //     $scope.showingUpdateBar = true;
                // }
            };

            $scope.updateCaagUpdatesBadgeCount = function() {
                var array = $scope.caagUpdatesArray[0].update;
                var badgeCount = 0;
                var unviewedFound = false;

                _.each(array, function(update, index) {
                    if (update.viewed === false) {
                        // store first unviewed description for display on update bar.
                        if(!unviewedFound) {
                            $scope.lastUnviewedUpdate = update.description;
                            unviewedFound = true;
                        }
                        badgeCount++;
                    }
                });

                $scope.caagUpdatesBadgeCount = badgeCount;
            };

            $scope.preloadUpdateGraphic = function(updateGraphicPath) {
                if($scope.updateGraphicPath !== updateGraphicPath) {
                    $scope.updateGraphicPath = updateGraphicPath;
                }
            };

            $scope.showUpdateGraphic = function(releaseDate,id,updateGraphicPath) {
                $scope.updateGraphicPath = updateGraphicPath;
                $scope.showingUpdateGraphic = true;
                $scope.updateCaagUpdatesViewed(releaseDate,id);
            };

            $scope.updateCaagUpdatesViewed = function(releaseDate,id) {
                var data = $localStorage.caagUpdates;
                if(!!data) {
                    var viewedLocal = data.update[id-1];
                    if (releaseDate === data.date && viewedLocal === false) {
                        $localStorage.caagUpdates.update[id-1] = true;
                        $scope.caagUpdatesArray[0].update[id-1].viewed = true;
                        $scope.updateCaagUpdatesBadgeCount();
                    }
                }
            };

            $scope.closeUpdatesOverlay = function() {
                if (!!$scope.showingUpdateGraphic) {
                    $scope.showingUpdateGraphic = false;

                    // reset the gif animation for next load after closing animation finishes
                    $timeout(function() {
                        $scope.updateGraphicPath = ' ';
                    },500);

                } else {
                    $rootScope.showUpdatesOverlay = false;
                }
            };

            $scope.showUpdatesOverlay = function() {
                $rootScope.showUpdatesOverlay = true;
            };

            $scope.saveUserDismissAction = function(persistance) {
                // if we want to persist the dismissal temporarily, we set this date to the current date
                // else if we want to persist the dismissal permanently until the next releaseDate
                // we set this date far far into the future
                if(persistance === 'temp') {
                    $localStorage.caagUpdates.dismissBarTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
                } else {
                    $localStorage.caagUpdates.dismissBarTimestamp = moment().add(99,'years').format('YYYY-MM-DD HH:mm:ss');
                }
            };

            $scope.$on("show-updates-overlay", function(e) {
                $rootScope.showUpdatesOverlay = true;
            });

            $scope.$on("dismiss-updates-bar-perm", function(e) {
                $scope.showingUpdateBar = false;

                $scope.saveUserDismissAction('perm');
            });

            $scope.$on("dismiss-updates-bar-temp", function(e) {
                $scope.showingUpdateBar = false;

                $scope.saveUserDismissAction('temp');
            });

        }
    ]);

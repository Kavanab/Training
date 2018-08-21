angular.module('searchApp.weather', []) //weather icons
.directive("clearDay", function() {
  return {
    restrict: 'E',
    template: "<span class='icon-weather-sun'></span>",
    replace: false,
  };
})
.directive("clearNight", function() {
  return {
    restrict: 'E',
    template: "<span class='icon-weather-moon'></span>",
    replace: false,
  };
})
.directive("rain", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloud'></cloud><showers class='icon-weather-showers'></showers></span>",
    replace: false,
  };
})
.directive("snow", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloud'></cloud><precipitation class='icon-weather-snowy'></precipitation></span>",
    replace: false,
  };
})
.directive("sleet", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloud'></cloud><precipitation class='icon-weather-sleet'></precipitation></span>",
    replace: false,
  };
})
.directive("wind", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloud'></cloud><windy class='icon-weather-windy'></windy></span>",
    replace: false,
  };
})
.directive("fog", function() {
  return {
    restrict: 'E',
    template: "<span><span><cloud class='no-base-icon'></cloud><foggy class='icon-weather-mist'></foggy></span>",
    replace: false,
  };
})
.directive("cloudy", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloudFull'></cloud></span>",
    replace: false,
  };
})
.directive("partlyCloudyDay", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloudFull'></cloud><sun class='icon-weather-sunny'></sun></span>",
    replace: false,
  };
})
.directive("partlyCloudyNight", function() {
  return {
    restrict: 'E',
    template: "<span><cloud class='basecloudFull'></cloud><moon class='icon-weather-night'></moon></span>",
    replace: false,
  };
});
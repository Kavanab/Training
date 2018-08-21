  //Primary module for our app
  angular.module('searchApp', [
          // 'ui.bootstrap',
          'ngRoute',
          'ngAnimate',
          'ngResource',
          'ngStorage',
          'ngSanitize',
          'ui.select',
          'ui.router',
          'geolocation',
          'elasticsearch',
          'ngFlowtype',
          'searchApp.loginOverlay',
          'searchApp.updatesOverlay',
          'searchApp.searchBar',
          'searchApp.searchResults', // container for various types of search results
          'searchApp.searchResults.customerResults', // a list of customer search results
          'searchApp.searchResults.noResults', // handle no results found
          'searchApp.moment', // provides the app with date/time related information
          'searchApp.weather',
          'searchApp.customer',
          'searchApp.customer.overview',
          'searchApp.customer.overview.activityFeed',
          'searchApp.customer.overview.overlayActivityFeedExceptionPhoto',
          'searchApp.customer.overview.tileServices',
          'searchApp.customer.overview.tileContacts',
          'searchApp.customer.overview.overlayServicesInfo',
          'searchApp.customer.overview.overlayContactsEdit',
          'searchApp.customer.overview.overlayCaseClose',
          'searchApp.customer.overview.overlayContactsEditConfirm',
          'searchApp.customer.overview.overlayContactsEditReason',
          'searchApp.customer.overview.overlayContactsEditResult',
          'searchApp.customer.overview.overlayNoteEdit',
          'searchApp.customer.overview.overlayContactEmailInvoice',
          'searchApp.customer.overview.overlayNoteEditResult',
          'searchApp.customer.overview.serviceAddressMap',
          'searchApp.customer.overview.truckOnMap',
          'angular-google-analytics',
          'uiGmapgoogle-maps',
          'searchApp.customer.overview.billingOverview',
          'searchApp.billing.overview.billingCart',
          'searchApp.billing.overview.billingDetails',
          'searchApp.billing.overview.billingSummary',
          'searchApp.billing.overview.overlayPdfInvoice',
          '720kb.datepicker',
          'text-mask',
          'caag-infinite-scroll'
      ])
      .constant('caseConfig', {
          caseCloseRequiredFields: {
              "T1": ["status", "status_reason_code", "resolution", "notes", "requestor"],
              "T2": ["status", "status_reason_code", "resolution", "operations", "notes", "requestor", "route"],
              "T3": ["status", "status_reason_code", "resolution", "container", "issue", "notes", "requestor"],
              "T4": ["status", "status_reason_code", "resolution", "notes", "requestor"],
              "T5": ["status", "status_reason_code", "complaint", "resolution", "notes", "requestor"],
              "T6": ["status", "status_reason_code", "issue", "resolution", "notes", "requestor"],
              "T7": ["status", "status_reason_code", "corrective_action", "preventive_action", "date_resolved", "notes", "requestor"],
              "T8": ["status", "status_reason_code", "notes", "requestor"],
              "T9": ["status", "status_reason_code", "resolution", "action_taken", "notes", "requestor"],
              "T10": ["status", "status_reason_code", "resolution", "operations", "notes", "requestor"]
          },
          caseCloseTemplateIds: {
              "CMP": {
                  "DCM": "T10"
              },
              "CPL": {
                  "CAD": "T1",
                  "CID": "T1",
                  "CLT": "T1",
                  "CNT": "T1",
                  "CPC": "T1",
                  "TOD": "T1",
                  "WRC": "T1",
                  "DID": "T2",
                  "GLK": "T3",
                  "LID": "T3",
                  "MPC": "T4",
                  "RPC": "T4",
                  "RPD": "T5",
                  "TIS": "T6"
              },
              "ENV": {
                  "LIT": "T7",
                  "NOI": "T7",
                  "OEI": "T7",
                  "SPL": "T7"
              },
              "OPS": {
                  "OPS": "T4",
                  "RTE": "T8"
              },
              "RED": {
                  "OPS": "T8"
              },
              "SAF": {
                  "SEQ": "T9"
              }
          },
          "hasCaseCloseTemplate": function(category, subCategory) {
              if (this.caseCloseTemplateIds[category] !== undefined) {
                  if (this.caseCloseTemplateIds[category][subCategory] !== undefined) {
                      return true;
                  }
              }
              return false;
          }
      })
      .constant('constants', (function() {
          var api_env = 'prod';
          var pdfInvoiceBaseUrl = "https://stage.wmezpay.wm.com/WMI5000_DirectInvoice.aspx?info=";
          var pdfInvoiceBaseUrlCananda = "https://stage.wmezpay.wm.com/WMI5000_DirectInvoice.aspx?info=";
          var emailServiceBaseUrl = "https://eventhubqa.wm.com:10003/v1/email";
          var eSearchBaseUrl = "https://esearch_cpv.wm.com/";
          var loginBaseUrl = "https://eventhubqa.wm.com:9909/v1/login";
          var loggerBaseUrl = "https://eventhubqa.wm.com:10007/v1/log";
          var userAgent = "chrome";
          if ('/* @echo GULP_ENV */' === 'prod') {
              api_env = 'prod';
              pdfInvoiceBaseUrl = "https://wmezpay.wm.com/WMI5000_DirectInvoice.aspx?info=";
              pdfInvoiceBaseUrlCananda = "https://wmezpay.wm.com/WMI5000_DirectInvoice.aspx?info=";
              emailServiceBaseUrl = "http://eventhub.wm.com:10004/v1/email";
              eSearchBaseUrl = "esearch.wm.com:9202";
              loginBaseUrl = "http://alvpapp007:9910/v1/login";
              loggerBaseUrl = "http://alvpapp007:10008/v1/log";
          }
          if ('/* @echo GULP_ENV */' === 'qat') {
              api_env = 'qat';
          }
          if ('/* @echo GULP_ENV */' === 'stage') {
              api_env = 'stage';
          }
          if ('/* @echo GULP_ENV */' === 'dev') {
              api_env = 'dev';
          }
          if(window.chrome === undefined){
              userAgent = "notChrome";
          }

          return {
              whitespace: '\040',
              nullval: '\000',
              api_env: api_env,
              pdfInvoiceBaseUrl: pdfInvoiceBaseUrl,
              pdfInvoiceBaseUrlCananda: pdfInvoiceBaseUrlCananda,
              emailServiceBaseUrl: emailServiceBaseUrl,
              eSearchBaseUrl: eSearchBaseUrl,
              loginBaseUrl: loginBaseUrl,
              loggerBaseUrl: loggerBaseUrl,
              userAgent : userAgent
          };

      })())
      .value('accountData', {
          isSubAccount: false,
          masterAccountId: ""
      })
      .run(['$rootScope', '$state', '$stateParams', '$log', '$location',
          function ($rootScope, $state, $stateParams, $log, $location) {
              // $log.debug("%c searchApp.run " + $state.current, 'background: #222; color: #bada55');
              // $log.debug("STATE: ", $state.current);
              $rootScope.location = $location;
              // $state.reload();
              //this solves page refresh and getting back to state


              $rootScope.isProdEnv = $location.host() === "customer.wm.com";
          }
      ])

      .config(['AnalyticsProvider', '$httpProvider', '$logProvider', '$locationProvider', function (AnalyticsProvider, $httpProvider, $logProvider, $locationProvider) {

          // setup your account
          if ('/* @echo GULP_ENV */' === 'prod') {
              AnalyticsProvider.setAccount('UA-64845902-1');
          }

          //   uiGmapGoogleMapApiProvider.configure({
          //       key: 'AIzaSyCG_e4Sfo-acD4nehZa3ivQLmlO0Won6gE',
          //       v: '3.20',
          //       libraries: 'geometry,visualization'
          //   });

          debugLogEnable = '/* @echo DEBUG */' !== 'false';
          $logProvider.debugEnabled(debugLogEnable);

          $locationProvider.html5Mode({
              enabled: true,
          });

          // automatic route tracking (default=true)
          AnalyticsProvider.trackPages(true);
          // Optional set domain (Use 'none' for testing on localhost)
          AnalyticsProvider.setDomainName('customer.wm.com');
          // Use display features plugin
          AnalyticsProvider.useDisplayFeatures(true);
          // Use analytics.js instead of ga.js
          AnalyticsProvider.useAnalytics(true);
          // Ignore first page view.
          AnalyticsProvider.ignoreFirstPageLoad(false);
          // Enable eCommerce module for analytics.js
          // AnalyticsProvider.useECommerce(true, false);
          // Enable enhanced eCommerce module for analytics.js
          // AnalyticsProvider.useECommerce(true, true);
          // Enable enhanced link attribution module for analytics.js or ga.js
          AnalyticsProvider.useEnhancedLinkAttribution(true);
          // Enable analytics.js experiments
          // AnalyticsProvider.setExperimentId('12345');
          // Set custom cookie parameters for analytics.js
          // AnalyticsProvider.setCookieConfig({
          // cookieDomain: 'foo.example.com',
          // cookieName: 'myNewName',
          // cookieExpires: 20000
          // });
          // Change the default page event name. This is useful for ui-router, which fires $stateChangeSuccess instead of $routeChangeSuccess
          // AnalyticsProvider.setPageEvent('$stateChangeSuccess');
          // Delay script tage creation...must manually call Analytics.createScriptTag() or Analytics.createAnalyticsScriptTag() to enable analytics
          // AnalyticsProvider.delayScriptTag(true);

          //Reset headers to avoid OPTIONS request (aka preflight)
          $httpProvider.defaults.useXDomain = true;
          delete $httpProvider.defaults.headers.common['X-Requested-With'];
          $httpProvider.defaults.headers.common = {};
          $httpProvider.defaults.headers.post = {};
          $httpProvider.defaults.headers.put = {};
          $httpProvider.defaults.headers.patch = {};
      }])
      .controller("SearchAppController", [
          '$scope',
          '$rootScope',
          '$resource',
          'UserLocation',
          'userLogin',
          'esFactory',
          'client',
          'Weather',
          '$compile',
          '$element',
          '$state',
          '$stateParams',
          '$localStorage',
          '$sessionStorage',
          '$log',
          'Analytics',
          //   'uiGmapIsReady',
          //   'uiGmapGoogleMapApi',
          '$http',
          'billingService',
          'customerData',
          'serverLog',
          'constants',
          // 'ngSanitize',
          // 'ui.select',
          function (
              $scope,
              $rootScope,
              $resource,
              UserLocation,
              userLogin,
              esFactory,
              client,
              Weather,
              $compile,
              $element,
              $state,
              $stateParams,
              $localStorage,
              $sessionStorage,
              $log,
              Analytics,
              //   uiGmapIsReady,
              //   uiGmapGoogleMapApi,
              $http,
              billingService,
              customerData,
              serverLog,
              constants
          ) {

              // delete localStorage["ngStorage-loginInfo"]; delete localStorage["ngStorage-searchDropdownSelection"]; delete localStorage["ngStorage-hasSeenLoginOverlay"];

              $log.debug('[CONTROLLER]: SearchAppController');
              delete $localStorage.location;
              delete $localStorage.locations;
              delete $localStorage.weather;

              //   uiGmapGoogleMapApi.then(function(maps) {
              //       uiGmapIsReady.promise().then(function(maps) {});
              //   });

              $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                  $log.debug("[STATE CHANGE] to " + toState.name + " from " + fromState.name);
                  $rootScope.currentState = $state.current.name;
              });

              $scope.env = '/* @echo GULP_ENV */' || 'dev';

              //get location and weather
              //$scope.userCity;
              //$scope.userState;
              $scope.$storage = $localStorage;
              $scope.$session = $sessionStorage;
              $scope.weatherIconMarkup = '';
              $scope.weather = {};
              $scope.userLocation = UserLocation.getStoredLocation();
              $scope.locationUnavailable = false;
              $rootScope.showLoginOverlay = false;
              $rootScope.showUpdatesOverlay = false;

              $scope.$on('error', function (event, data) {
                  // console.log("crap: ", event, data); // 'Data to send'
                  // $scope.locationUnavailabl
              });



              $scope.ESqueryFieldsServiceArray = [
                  "customer.serviceContact.name",
                  "customer.serviceContact.contactName",
                  "customer.serviceContact.phone",
                  "customer.serviceContact.email",
                  "customer.serviceContact.address.street",
                  "customer.serviceContact.address.street2",
                  "customer.serviceContact.address.city",
                  "customer.serviceContact.address.state",
                  "customer.serviceContact.address.country",
                  "customer.serviceContact.address.postalCode",
                  "customer.ezPayId",
                  "customer.wmMetaData.companyCode",
                  "customer.custNumber",
                  "customer.custNumber_copy",
                  "customer.accountNumber",
                  "customer.accountNumber_copy",
                  "customer.lob"
              ];

              $scope.ESqueryFieldsBillingArray = [
                  "customer.billingContact.name",
                  "customer.billingContact.contactName",
                  "customer.billingContact.phone",
                  "customer.billingContact.email",
                  "customer.billingContact.address.street",
                  "customer.billingContact.address.street2",
                  "customer.billingContact.address.city",
                  "customer.billingContact.address.state",
                  "customer.serviceContact.address.country",
                  "customer.billingContact.address.postalCode",
                  "customer.ezPayId",
                  "customer.wmMetaData.companyCode",
                  "customer.custNumber",
                  "customer.custNumber_copy",
                  "customer.accountNumber",
                  "customer.accountNumber_copy",
                  "customer.lob"
              ];

              if ($localStorage.serviceBillingToggle === 'billing') {
                  $rootScope.ESqueryFields = $scope.ESqueryFieldsBillingArray;
                  $rootScope.ESqueryType = 'billing';
              } else {
                  $rootScope.ESqueryFields = $scope.ESqueryFieldsServiceArray;
                  $rootScope.ESqueryType = 'service';
              }

              $rootScope.doSearchResultsTransitions = true;

              //handle overlays
              //MOVE THIS SOMEWHERE ELSE;
              $scope.$on('reveal', function (event, options) {
                  // OPTIONS
                  // action: open, close
                  // id: overlay-id
                  if (!options) {
                      $log.error('"options" was not passed to "reveal" event and is required.');
                  } else {
                      if (!options.id) {
                          $log.error('"options.id" was not passed to "reveal" event and is required.');
                      }
                      if (options.action === 'open') {
                          angular.element('#' + options.id).addClass('reveal').on('click', function (e) {
                              var instigator = angular.element(e.target);
                              if (instigator.hasClass('close-overlay') || instigator.hasClass('background') || instigator.hasClass('close-overlay-btn')) {
                                  $scope.$emit('reveal', {
                                      'id': options.id,
                                      'action': "close"
                                  });
                              }
                          });
                          //@TODO CLEANUP: THIS NEXT LINE IS SUPER GHETTO. IT DOES NOT BELONG HERE IN THE GLOBAL REVEAL EVENT
                          //   setTimeout(function(){
                          //   $('.overlay').scrollTop($('#service-'+options.clickedID).offset().top);
                          //   console.log('BOOOOOMZ');
                          // }, 2000);
                      } else if (options.action === 'close') {
                          angular.element('#' + options.id).removeClass('reveal');
                      } else {
                          $log.error('"options.action" was not passed to "reveal" event and is required.');
                      }
                  }
              });

              $scope.refreshWeather = function () {
                  $log.debug("[FUNCTION] SearchAppController.refreshWeather");

                  //if weather hasn't been cached yet
                  if (!!Weather.shouldWeatherBeFetched()) {
                      //listen for geolocation-complete if we dont have location
                      $log.debug("Fetch new weather because it's been > 30 mins");
                      Weather.fetchWeather($scope.userLocation.latLong.latitude, $scope.userLocation.latLong.longitude).then(function (weather) {
                          Weather.cacheWeather(weather.data);
                          $scope.weather.temperature = weather.data.currently.temperature;
                          $scope.weather.icon = weather.data.currently.icon; //clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night
                          var el = $compile("<" + $scope.weather.icon + "></" + $scope.weather.icon + ">")($scope);
                          $scope.weatherIconMarkup = el;
                      });
                  } else {
                      var storedWeather = Weather.getStoredWeather();
                      $scope.weather.temperature = storedWeather.currently.temperature;
                      $scope.weather.icon = storedWeather.currently.icon; //clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night
                      var el = $compile("<" + $scope.weather.icon + "></" + $scope.weather.icon + ">")($scope);
                      $scope.weatherIconMarkup = el;
                  }
              };

              $scope.doStuff = function () {
                  $log.debug("[FUNCTION] SearchAppController.doStuff");
                  $scope.city = $scope.userLocation.address.city.long_name;
                  $scope.state = $scope.userLocation.address.state.short_name;

                  // $scope.refreshWeather();
                  // setInterval($scope.refreshWeather, 60000);
              };

              // if (!$scope.userLocation) { //if location isn't cached, get it
              //     UserLocation.getLocation().then(function(location) {
              //             if (!!location) {
              //                 $scope.userLocation = location;

              //                 $log.debug('[LOCATION] cached new location', $scope.userLocation);
              //                 $scope.doStuff();
              //             } else {}
              //         },
              //         //fail
              //         function(error) {
              //             $log.error('geolocation is not working. giving up.');
              //             $scope.locationUnavailable = true;

              //         });
              // } else {
              // $scope.doStuff();
              // }

              $scope.sendPhotoModal = {
                  fromEmail: '',
                  toEmail: '',
                  emails: [
                      // { email: 'will.robles@gmail.com' }
                  ],
                  isListShowing: false,

                  // modal stuff
                  isVisible: false,
                  isPushedBack: true,

                  // tabs
                  activityInfo: null,
                  sendPhotoSection: {
                      isVisible: true
                  },
                  photoSentSection: {
                      isVisible: false
                  },

                  fromEmailRadioButtons: '',

                  // arrow
                  inputArrowIsFlipped: false
              };

              $scope.sendEmailmodal = {
                  toEmail : '',
                  fromEmail: '',
                  isListShowing: false,
                  inputArrowIsFlipped: false

              };

              // set the default selected values for the `from` field
              $scope.sendPhotoModal.fromEmail = 'wmonline@wm.com';
              $scope.sendEmailmodal.fromEmail = 'wmonline@wm.com';
              $scope.sendPhotoModal.fromEmailRadioButtons = 'wm-cust-service';

              $scope.fromEmailOnChange = function (emailType) {
                  if (emailType === 'user-email') {
                      $scope.sendPhotoModal.fromEmail = $localStorage.loginInfo.mail;
                  }
                  if (emailType === 'wm-cust-service') {
                      $scope.sendPhotoModal.fromEmail = 'wmonline@wm.com';
                  }
              };

              $scope.inputArrowClick = function () {
                  $scope.sendPhotoModal.isListShowing = !$scope.sendPhotoModal.isListShowing;
                  $scope.sendPhotoModal.inputArrowIsFlipped = !$scope.sendPhotoModal.inputArrowIsFlipped;
              };

              $scope.inputEmailArrowClick = function() {
                  $scope.sendEmailmodal.isListShowing = !$scope.sendEmailmodal.isListShowing;
                  $scope.sendEmailmodal.inputArrowIsFlipped = !$scope.sendEmailmodal.inputArrowIsFlipped;
              };


              $scope.toEmailInputOnKeyup = function (event) {
                  // show the dropdown if the user hits the down arrow key
                  if (event.which === 40) {
                      $scope.sendPhotoModal.isListShowing = true;
                      $scope.sendPhotoModal.inputArrowIsFlipped = true;
                  } else {
                      $scope.sendPhotoModal.isListShowing = false;
                      $scope.sendPhotoModal.inputArrowIsFlipped = false;
                  }
              };

              $scope.toEmailItemClick = function (email) {
                  $scope.sendPhotoModal.toEmail = email;
                  // hide the dropdown
                  $scope.sendPhotoModal.isListShowing = false;
                  $scope.sendPhotoModal.inputArrowIsFlipped = false;
              };
              $scope.toSendEmailItemClick = function(email) {
                  $scope.sendEmailmodal.toEmail = email;
                  $scope.sendEmailmodal.isListShowing = false;
                  $scope.sendEmailmodal.inputArrowIsFlipped = false;
              };

              $scope.closeSendPhotoModal = function () {
                  $scope.sendPhotoModal.isVisible = false;
                  setTimeout(function () {
                      $scope.sendPhotoModal.isPushedBack = true;
                  }, 400);
              };

              var isContaminated = function (exception_code) {
                  var FLAG = false,
                      listOfPossibleContaminationExceptionCodes = [
                          'Material Contaminated / Unacceptable',
                          // and so on..
                          // if-any
                      ];
                  _.each(listOfPossibleContaminationExceptionCodes, function (value, index) {
                      if (value === exception_code) {
                          FLAG = true;
                      }
                  });
                  return FLAG;
              };

              $scope.sendPhoto = function () {
                  // make sure the to email address is valid
                  var toEmailField = $scope.sendPhotoModal.toEmail;
                  if (toEmailField === undefined) { return; }

                  // make sure the from email address is selected
                  if ($scope.sendPhotoModal.fromEmail.length < 1) { return; }

                  // var fromEmail = $localStorage.loginInfo.mail;
                  var fromEmail = $scope.sendPhotoModal.fromEmail;
                  var activityInfo = $scope.sendPhotoModal.activityInfo;
                  // var attachementUrl = activityInfo.exceptionData.images[0].location;
                  var attachementUrl = $scope.sendPhotoModal.photoURLs;
                  var serviceAddress = $localStorage.customer.serviceContact.address.street;
                  var serviceDate = activityInfo.service_time;
                  var ezPayId = $rootScope.currentCustomer._source.customer.ezPayId;
                  var reasonCode = activityInfo.exception_reason_code.trim();
                  var serviceType = activityInfo.exception_class.trim();
                  var userEmail = $localStorage.loginInfo.mail;

                  // var data = {
                  //   "email_type": "hocv2",
                  //   "email_id_from": fromEmail,
                  //   "email_id_to": toEmailField,
                  //   // "attachment_url": attachementUrl,
                  //   "email_sent_by_application": 'CAAG',
                  //   "email_sent_by_user": userEmail,
                  //   "substitutions": {
                  //     "name": "Manual",
                  //     "photo-url": JSON.stringify(attachementUrl),
                  //     "serviceAddr1": serviceAddress,
                  //     "serviceDate": serviceDate,
                  //     "ezpayId": ezPayId,
                  //     "reasonCode": reasonCode,
                  //     "serviceType": serviceType
                  //   }
                  // };

                  var data = {};
                  // if (activityInfo.status === 'Confirmed Positive') {
                  //     data.email_type = "positivehoc";
                  // } else {
                  //     if (isContaminated(reasonCode)){
                  //         data.email_type = "caag_email_contaminated";
                  //     } else {
                  //         data.email_type = "hoc";
                  //     }
                  // }
                  if (isContaminated(reasonCode)) {
                      data.email_type = "caag_email_contaminated";
                  } else {
                      if (activityInfo.status === 'Confirmed Positive') {
                          data.email_type = "positivehoc";
                      } else {
                          data.email_type = "hoc";
                      }
                  }
                  data.email_id_from = fromEmail;
                  data.email_id_to = toEmailField;
                  data.email_sent_by_application = "CAAG";
                  data.email_sent_by_user = userEmail;
                  data.substitutions = {};
                  data.substitutions.name = "Manual";
                  data.substitutions.photo_url = attachementUrl;
                  data.substitutions.serviceAddr1 = serviceAddress;
                  data.substitutions.serviceDate = serviceDate;
                  data.substitutions.ezpayId = ezPayId;
                  data.substitutions.reasonCode = reasonCode;
                  data.substitutions.serviceType = serviceType;
                  data.substitutions.container = activityInfo.prettyEquipmentSize + " " + activityInfo.prettyServiceName;

                  // console.log("sendPhoto() - data - ", data);

                  //DO NOT SEND EMAILS TO PRODUCTION ACCOUNTS!
                  if ('/* @echo GULP_ENV */' !== 'prod') {
                      data.email_id_to = userEmail; //send email to logged in user's email address instead of the value entered
                      console.log('NOT sending email to actual user, sending email to: ' + userEmail);
                  }

                  var options = {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  };

                 var onSuccess = function (result) {
                      console.log('success! args: ', arguments);

                      // log the success to the serverLogs
                      serverLog.send({
                          'isSendPhotoSuccessful': true,
                          'emailType': data.email_type,
                          'results': result
                      });

                      // clear out the email
                      $scope.sendPhotoModal.toEmail = '';

                      // display the `Photo sent` section
                      $scope.sendPhotoModal.sendPhotoSection.isVisible = false;
                      $scope.sendPhotoModal.photoSentSection.isVisible = true;
                  };
                  var onFail = function (result) {
                      console.log('fail! args: ', arguments);

                      // log the fail to the serverLogs
                      serverLog.send({
                          'isSendPhotoSuccessful': false,
                          'emailType': data.email_type,
                          'results': result
                      });
                  };

                sendEmail(data, options, onSuccess, onFail);

              };

              $scope.emailInvoicePDF = function(emailEvent) {
                 document.getElementById("send-emailsubmit").disabled = true;
                 $scope.loadingMessage = true;
                var toEmailField = $scope.sendEmailmodal.toEmail;
                if (toEmailField === undefined) { return; }

                // make sure the from email address is selected
                if ($scope.sendEmailmodal.fromEmail.length < 1) { return; }

                // var fromEmail = $localStorage.loginInfo.mail;
                var fromEmail = $scope.sendEmailmodal.fromEmail;
                var eventArrayy = emailEvent ;
                var empIdsRemoveZeroes = $rootScope.currentCustomer._source.customer.ezPayId;
                var empPayIds = empIdsRemoveZeroes.replace(/^0+/, '');
                var ezPayId = "";
                if(empPayIds.length > 10) {
                 ezPayId = empPayIds.substring(0, empPayIds.length - 10) + '-' + empPayIds.substring(empPayIds.length - 10, empPayIds.length - 5) + '-' + empPayIds.substr(empPayIds.length - 5);
                }
                else if(empPayIds.length > 5) {
                 ezPayId =  empPayIds.substring(0, empPayIds.length - 5) + '-' + empPayIds.substr(empPayIds.length - 5);
                }
                else {
                     ezPayId =  empPayIds;
                }
                var userEmail = $localStorage.loginInfo.mail;
                var data = {};

                if (eventArrayy.symbol === 'USD') {
                    data.email_type = "invoice_pdf_us";
                } else if (eventArrayy.symbol === 'CAD') {
                     data.attachment_url =  [eventArrayy.pdfInvoiceURL+ '&' + "fileName=Invoice.pdf"];
                     var langdData =billingService.getLanguageDetail();
                       if(langdData.language == "English") {
                         data.email_type = "invoice_pdf_ca_en";
                        }
                      else {
                        data.email_type = "invoice_pdf_ca_fr";
                        }
                  }
                data.email_sent_by_application = "CAAG";
                data.email_sent_by_user = $localStorage.loginInfo.firstName;
                data.email_id_from = fromEmail;
            //  data.email_id_to = userEmail;
                data.email_id_to = toEmailField;

                data.substitutions = {};
                data.substitutions.Account_Number = ezPayId;
                data.substitutions.Invoice_Number = eventArrayy.id;
                data.substitutions.Invoice_Presentment_Date = eventArrayy.date;
                data.substitutions.Invoice_Amount = eventArrayy.amount;
                data.substitutions.Total_Due_Balance = eventArrayy.balance_amount;
                data.substitutions.Invoice_PDF_URL = eventArrayy.pdfInvoiceURL;

                if ('/* @echo GULP_ENV */' !== 'prod') {
                    data.email_id_to = userEmail; //send email to logged in user's email address instead of the value entered
                    console.log('NOT sending email to actual user, sending email invoice  to: ' + userEmail);
                }
                var options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                var onSuccess = function (result) {
                    console.log('success! args in send email: ', arguments);
                    serverLog.send({
                        'isEmailInvoicePDFSuccessful': true,
                        'emailType': data.email_type,
                        'results': result
                    });
                    $scope.successMessagebool = true;
                    $("#invoice-template").css("display", "none");
                    setTimeout(function () {
                     $scope.successMessagebool = false;
                      closeEmailPopUp();
                  }, 3000);
               };
                var onFail = function (result) {
                    console.log('fail! args in in send email: ', arguments);
                    serverLog.send({
                        'isEmailInvoicePDFSuccessful': false,
                        'emailType': data.email_type,
                        'results': result
                    });
                    $scope.errorMessagebool = true;
                    $("#invoice-template").css("display", "none");
                    setTimeout(function () {
                        $scope.errorMessagebool = false;
                        closeEmailPopUp();

                    }, 3000);
               };

               sendEmail(data, options, onSuccess, onFail);
              };

             var closeEmailPopUp = function() {
            document.getElementById("send-emailsubmit").disabled = false;
              $scope.$emit('reveal', {
                    'id': 'overlay-contact-email-invoice',
                    'action': "close",
                    'clickedID': ""
                });
             };
          //common method for sending  mail api
              var sendEmail = function (data, options, onSuccess, onFail) {
                 var email_service_url = constants.emailServiceBaseUrl;
                 var dataObject = JSON.stringify(data);
                 console.log(dataObject);
                 var request = $http.post(email_service_url, dataObject, options);
                 console.log("in send email");
                 request.success(onSuccess);
                 request.catch(onFail);
                 $scope.loadingMessage = false;
             };


              $scope.$on("show-login-to-unlock-modal", function (e, data) {
                  // if the user is not logged in, show the login modal
                  if (typeof $localStorage.loginInfo !== 'object') {
                      $scope.$broadcast('show-login-overlay');
                  }
              });

              $scope.$on("mas-notes-added-modal", function (e, data) {
                  $scope.$broadcast('mas-notes-added');
              });

              $scope.$on("mas-case-closed-modal", function(e, data) {
                  $scope.$broadcast('mas-case-closed');
              });

              $scope.$on("show-send-photo-modal", function(e, data) {

                  // if the user is not logged in, show the login modal
                  if (typeof $localStorage.loginInfo !== 'object') {
                      $scope.$broadcast('show-login-overlay');
                      return;
                  }

                  // change the modal z-index
                  $scope.sendPhotoModal.isPushedBack = false;

                  var index = data.index;
                  var senderScope = data.$scope;
                  var activityInfo = senderScope.activityArray[index];
                  // var photoUrl = activityInfo.exceptionData.image_location;
                  var email = $localStorage.loginInfo.mail;
                  var photoName = '???';
                  var photoSize = '???';

                  var photoURLs = [];

                  _.each(activityInfo.exceptionData, function (exceptionItem, index, list) {
                      _.each(exceptionItem.images, function (item, index, list) {
                          photoURLs.push(item.location);
                      });
                  });

                  // populate the sendPhotoModal object
                  $scope.sendPhotoModal.activityInfo = activityInfo;

                  // populate modal then display it
                  // $scope.sendPhotoModal.photoUrl = photoUrl;
                  $scope.sendPhotoModal.photoURLs = photoURLs;
                  $scope.sendPhotoModal.photoName = photoName;
                  $scope.sendPhotoModal.photoSize = photoSize;
                  $scope.sendPhotoModal.sendPhotoSection.isVisible = true;
                  $scope.sendPhotoModal.photoSentSection.isVisible = false;
                  $scope.sendPhotoModal.isVisible = true;
                  // populate the emails for the dropdown
                  $scope.sendPhotoModal.emails = [];
                  var dedupedEmailsArr = [];
                  // _.each($localStorage.contacts.contacts, function(contact){
                  //   if (contact.email !== '' || contacts.email !== null) {
                  //     $scope.sendPhotoModal.emails.push({ email: contact.email.toLowerCase() });
                  //   }
                  // });
                  if ($localStorage.customer.serviceContact.email) {
                      dedupedEmailsArr.push($localStorage.customer.serviceContact.email.toLowerCase());
                  }
                  if ($localStorage.customer.billingContact.email) {
                      dedupedEmailsArr.push($localStorage.customer.billingContact.email.toLowerCase());
                  }
                  if (_.has($localStorage.profile, "email")) {
                      dedupedEmailsArr.push($localStorage.profile.email.toLowerCase());
                  }


                  //{ email: $localStorage.customer.serviceContact.email.toLowerCase() }
                  dedupedEmailsArr = _.uniq(dedupedEmailsArr);

                  _.each(dedupedEmailsArr, function(anEmail) {
                      $scope.sendPhotoModal.emails.push({ email: anEmail });
                  });

                  // $localStorage.profile
              });

              // display the "Share HOC photos modal" after the user has to login before seeing
              // the modal
              // $scope.$on("user-logged-in-extra-data", function(e, data){});
          }
      ]);

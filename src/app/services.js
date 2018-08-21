angular.module('searchApp')
    .service('client', ['esFactory', 'constants', function(esFactory, constants) {
        var activecustomers = "activecustomers", inactivecustomers = "inactivecustomers";
        var  host = constants.eSearchBaseUrl;
        return esFactory({
            host: host,
            apiVersion: '1.6',
            log: 'info',
            activecustomers: activecustomers,
            inactivecustomers: inactivecustomers
        });
    }])
    .service('userLogin', ['$http', '$q','constants', function userLoginFactory($http, $q,constants) {

        // this only runs once
        var ajaxResolve = null;
        var ajaxReject = null;
        var ajaxIsComplete = false;
        var ajaxPromise = null;

        // these methods run everytime they're called
        return {

            login: function(username, password) {

                var data = {
                    "username": username,
                    "password": password
                };

                var options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                // create a new promise
                ajaxPromise = $q(function(resolve, reject) {
                    ajaxResolve = resolve;
                    ajaxReject = reject;
                });

                var request = null;
                var onSuccess = function(data) {
                    ajaxIsComplete = true;
                    ajaxResolve(data);
                };
                var onFail = function(data) {
                    ajaxReject(data);
                };

                // try to login
                //            request = $http.post("http://wmlogin.appstack.wm.com/v1/login", data, options);
                request = $http.post(constants.loginBaseUrl, data, options);
                request.success(onSuccess);
                request.catch(onFail);

                return ajaxPromise;
            },

            getLoginPromise: function(username, password) {
                return ajaxPromise;
            }
        };
    }])
    .service('esbServices', ['$http', '$q', function($http, $q) {

        this.updatePartyContact = function(ezPayId, logonId, billCntctNm, billWkPhn, billMobile,
            billFax, billEmail, svcCntctNm, svcWkPhn, svcMobile, svcFax, svcEmail) {

            //var url = 'http://esbqat.wm.com:8888/ws/wm_businessservices.customerService.webServices:publishCustomerEvents';
            var url = 'https://esbqat.wm.com:9999/ws/wm_businessservices.customerService.webServices:publishCustomerEvents';
            var requestedEnv = 'QA'; // change to 'PRD' before go live;
            var ezPayIdNoLdgZero = ezPayId.replace(/^[0]+/g, "");
            var trackingId = Math.floor((Math.random() * 999999) + 1);
            if (typeof billCntctNm === 'undefined' || billCntctNm.length < 1) {
                billCntctNm = ' ';
            }
            if (typeof billWkPhn === 'undefined' || billWkPhn.length < 1) {
                billWkPhn = ' ';
            }
            if (typeof billMobile == 'undefined' || billMobile.length < 1) {
                billMobile = ' ';
            }
            if (typeof billFax === 'undefined' || billFax.length < 1) {
                billFax = ' ';
            }
            if (typeof billEmail === 'undefined' || billEmail.length < 1) {
                billEmail = ' ';
            }
            if (typeof svcCntctNm == 'undefined' || svcCntctNm.length < 1) {
                svcCntctNm = ' ';
            }
            if (typeof svcWkPhn === 'undefined' || svcWkPhn.length < 1) {
                svcWkPhn = ' ';
            }
            if (typeof svcMobile === 'undefined' || svcMobile.length < 1) {
                svcMobile = ' ';
            }
            if (typeof svcFax == 'undefined' || svcFax.length < 1) {
                svcFax = ' ';
            }
            if (typeof svcEmail == 'undefined' || svcEmail.length < 1) {
                svcEmail = ' ';
            }

            var data = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">' +
                '  <soapenv:Body>' +
                '    <ns12:publishCustomerEvents xmlns:ns12="http://esb.wm.com/service/publishCustomerEvents" xmlns:ns11="Preference" xmlns:ns10="GblContact" xmlns:ns9="GblAddr" xmlns:ns8="GblLocation" xmlns:ns7="GblOrg" xmlns:ns6="GblLkup" xmlns:ns5="GblParty" xmlns:ns4="EsbMsgHeader" xmlns:ns3="EsbProviderError" xmlns:ns2="EsbStatus">' +
                '      <ns4:msgHeader>' +
                '        <ns4:actionCd>Update</ns4:actionCd>' +
                '        <ns4:requestTypeCd>UpdParty</ns4:requestTypeCd>' +
                '        <ns4:transactionID>' + trackingId + '</ns4:transactionID>' +
                '        <ns4:source>' +
                '          <ns4:msgSourceCd>eBiz</ns4:msgSourceCd>' +
                '          <ns4:requestedEnv>' + requestedEnv + '</ns4:requestedEnv>' +
                '        </ns4:source>' +
                '      </ns4:msgHeader>' +
                '      <ns5:party>' +
                '        <ns5:altID>' +
                '          <ns5:altIDSourceName>MAS</ns5:altIDSourceName>' +
                '          <ns5:altIDTypeCd>PKey</ns5:altIDTypeCd>' +
                '          <ns5:partyID>' + ezPayIdNoLdgZero + '|B</ns5:partyID>' +
                '        </ns5:altID>' +
                '        <ns5:altID>' +
                '          <ns5:altIDSourceName>MAS</ns5:altIDSourceName>' +
                '          <ns5:altIDTypeCd>SOR Key</ns5:altIDTypeCd>' +
                '          <ns5:partyID>' + ezPayId + '</ns5:partyID>' +
                '        </ns5:altID>' +
                '        <ns5:partyLoc>' +
                '          <ns8:altID>' +
                '            <ns8:sourceCd>MAS</ns8:sourceCd>' +
                '            <ns8:IDValue>' + ezPayIdNoLdgZero + '|B^' + ezPayIdNoLdgZero + '|B^' + ezPayIdNoLdgZero + '|B</ns8:IDValue>' +
                '          </ns8:altID>' +
                '          <ns8:locParty>' +
                '            <ns8:locPartyIDs>' +
                '              <ns8:sourceCd>MAS</ns8:sourceCd>' +
                '              <ns8:altIDTypeCd>PKey</ns8:altIDTypeCd>' +
                '              <ns8:IDValue>' + ezPayIdNoLdgZero + '|B</ns8:IDValue>' +
                '            </ns8:locPartyIDs>' +
                '          </ns8:locParty>' +
                '          <ns10:Contact>' +
                '            <ns10:contactPurposeCd>Bill</ns10:contactPurposeCd>' +
                '          <ns10:ID>' +
                '              <ns6:applSourceCd>MAS</ns6:applSourceCd>' +
                '              <ns6:IDTypeCd>PKey</ns6:IDTypeCd>' +
                '              <ns10:contactID>' + ezPayIdNoLdgZero + '|B</ns10:contactID>' +
                '            </ns10:ID>' +
                '            <ns10:contactName>' + billCntctNm + '</ns10:contactName>' +
                '            <ns10:contactMethod>' +
                '              <ns10:contactMethodTypeCd>Email</ns10:contactMethodTypeCd>' +
                '              <ns10:contactPurposeCd>Bill</ns10:contactPurposeCd>' +
                '              <ns10:contactTxt>' + billEmail + '</ns10:contactTxt>' +
                '            </ns10:contactMethod>' +
                '            <ns10:contactMethod>' +
                '              <ns10:contactMethodTypeCd>LandLine</ns10:contactMethodTypeCd>' +
                '              <ns10:contactPurposeCd>Bill</ns10:contactPurposeCd>' +
                '              <ns10:contactTxt>' + billWkPhn + '</ns10:contactTxt>' +
                '            </ns10:contactMethod>' +
                '            <ns10:contactMethod>' +
                '              <ns10:contactMethodTypeCd>CellPhone</ns10:contactMethodTypeCd>' +
                '              <ns10:contactPurposeCd>Bill</ns10:contactPurposeCd>' +
                '              <ns10:contactTxt>' + billMobile + '</ns10:contactTxt>' +
                '            </ns10:contactMethod>' +
                '            <ns10:contactMethod>' +
                '              <ns10:contactMethodTypeCd>Fax</ns10:contactMethodTypeCd>' +
                '              <ns10:contactPurposeCd>Bill</ns10:contactPurposeCd>' +
                '              <ns10:contactTxt>' + billFax + '</ns10:contactTxt>' +
                '            </ns10:contactMethod>' +
                '          </ns10:Contact>' +
                '        </ns5:partyLoc>' +
                '		<ns5:partyLoc>' +
                '		  <ns8:altID>' +
                '			<ns8:sourceCd>MAS</ns8:sourceCd>' +
                '			<ns8:IDValue>' + ezPayIdNoLdgZero + '|B^' + ezPayIdNoLdgZero + '|B^' + ezPayIdNoLdgZero + '|S</ns8:IDValue>' +
                '		  </ns8:altID>' +
                '		  <ns8:locParty>' +
                '			<ns8:locPartyIDs>' +
                '			  <ns8:sourceCd>MAS</ns8:sourceCd>' +
                '			  <ns8:altIDTypeCd>PKey</ns8:altIDTypeCd>' +
                '			  <ns8:IDValue>' + ezPayIdNoLdgZero + '|B</ns8:IDValue>' +
                '			</ns8:locPartyIDs>' +
                '		  </ns8:locParty>' +
                '		  <ns10:Contact>' +
                '			<ns10:contactPurposeCd>Svc</ns10:contactPurposeCd>' +
                '			<ns10:ID>' +
                '			  <ns6:applSourceCd>MAS</ns6:applSourceCd>' +
                '			  <ns6:IDTypeCd>PKey</ns6:IDTypeCd>' +
                '			  <ns10:contactID>' + ezPayIdNoLdgZero + '|S</ns10:contactID>' +
                '			</ns10:ID>' +
                '			<ns10:contactName>' + svcCntctNm + '</ns10:contactName>' +
                '			<ns10:contactMethod>' +
                '			  <ns10:contactMethodTypeCd>Email</ns10:contactMethodTypeCd>' +
                '			  <ns10:contactPurposeCd>Svc</ns10:contactPurposeCd>' +
                '			  <ns10:contactTxt>' + svcEmail + '</ns10:contactTxt>' +
                '			</ns10:contactMethod>' +
                '			<ns10:contactMethod>' +
                '			  <ns10:contactMethodTypeCd>LandLine</ns10:contactMethodTypeCd>' +
                '			  <ns10:contactPurposeCd>Svc</ns10:contactPurposeCd>' +
                '			  <ns10:contactTxt>' + svcWkPhn + '</ns10:contactTxt>' +
                '			</ns10:contactMethod>' +
                '			<ns10:contactMethod>' +
                '			  <ns10:contactMethodTypeCd>CellPhone</ns10:contactMethodTypeCd>' +
                '			  <ns10:contactPurposeCd>Svc</ns10:contactPurposeCd>' +
                '			  <ns10:contactTxt>' + svcMobile + '</ns10:contactTxt>' +
                '			</ns10:contactMethod>' +
                '			<ns10:contactMethod>' +
                '			  <ns10:contactMethodTypeCd>Fax</ns10:contactMethodTypeCd>' +
                '			  <ns10:contactPurposeCd>Svc</ns10:contactPurposeCd>' +
                '			  <ns10:contactTxt>' + svcFax + '</ns10:contactTxt>' +
                '			</ns10:contactMethod>' +
                '		  </ns10:Contact>' +
                '		</ns5:partyLoc>	' +
                '        <ns6:auditCol>' +
                '          <ns6:updateByUserID>' + logonId + '</ns6:updateByUserID>' +
                '        </ns6:auditCol>' +
                '      </ns5:party>' +
                '    </ns12:publishCustomerEvents>' +
                '  </soapenv:Body>' +
                '</soapenv:Envelope>';


            var options = {
                "ezPayId": ezPayId,
                "Content-Type": 'application/soap+xml;charset=UTF-8',
                "Request-Tracking-Id": trackingId,
                "Accept": 'application/soap+xml;charset=UTF-8',
                // "ProfileId": config.service.customers.contacts.billing.address.profileID[constants.api_env],
                "Authorization": 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI=',
                "Cache-Control": 'no-cache'
            };

            return $q(function(resolve, reject) {
                $http({
                        method: 'POST',
                        url: url,
                        headers: options,
                        data: data
                    })
                    .success(function(data) {
                        resolve(data);
                    }).error(function(err) {
                        reject(err);
                    });
            });
        };

    }])
    .factory('customerContract', [function customerServiceFactory() {
        return {
            humanizeEquipmentSize: function(service) {
                var abbr = {
                    'gal': 'Gallon',
                    'yd3': 'Yard',
                    'cnt': 'Count',
                    'mt': 'Metric Ton',
                    't': 'Ton',
                    'st': 'Short Ton',
                    'lbs': 'Pounds',
                    'kg': 'Kilogram',
                    '%': 'Percent',
                    'sqft': 'Square Feet',
                    'qnty': 'Quantity',
                    'other': 'Other',
                    'ld': 'Load',
                    'ea': 'Each',
                    'b': 'Barrel',
                    'qt': 'Quart',
                    'm3': 'Cubic Meter',
                    'l': 'Liter',
                    'lbs/yd3': 'Lbs/Yds',
                    'lbs/gal': 'Lbs/Gal',
                    'ft': 'Feet',
                    'km': 'Kilometer',
                    'mo': 'Month',
                    'wk': 'Week',
                    'dy': 'Day',
                    'hr': 'Hour'
                };

                try {
                    if ((service.equipment.volume !== "null") && (service.equipment.uom !== "null")) {
                        return service.equipment.volume + " " + abbr[service.equipment.uom.toLowerCase()];
                    }
                } catch (e) {}

                return "";

            },
            getEquipmentCount: function(service) {
                try {
                    return service.equipment.count;
                } catch (e) {
                    return null;
                }
            },
            getPrettyServiceName: function(servicesArray, serviceCode) {
                //assumes that humanizeServiceName has already been run on all services
                try {
                    var prettyServiceName = "";
                    _.each(servicesArray, function(item, index, list) {
                        if (item.wm_metadata.service_code === serviceCode) {
                            prettyServiceName = item.prettyEquipmentSize + " " + item.prettyServiceName;
                        }
                    });
                    return prettyServiceName;
                } catch (e) {
                    $log.error(e);
                    //console.log("ERROR: ", e);
                }
            },

            humanizeServiceName: function(service) {
                var serviceName = [];
                var equipment = service.equipment;
                var catalog = service.enterprise_catalog;

                if (!!equipment) {
                    try {
                        var isRecycling = false;

                        if (catalog.line_of_business.search(/COLL_RES/i) >= 0) {
                            //RESI - yard waste hauling, yard waste cart, trash cart, recycle cart, recycle bin, customer can
                            if (catalog.description.search(/Recycle/i) >= 0) {
                                serviceName.unshift("Recycling");
                                isRecycling = true;
                            } else if ((catalog.description.search(/Green Waste/i) >= 0) || (catalog.description.search(/Yard Waste/i) >= 0)) {
                                serviceName.unshift("Yard Waste");
                                if (equipment.uom.search(/null/i) >= 0) {
                                    serviceName.push("Hauling");
                                }
                            } else if ((catalog.description.search(/hand pick/i) >= 0) || (catalog.sub_category.search(/hand pick/i) >= 0)) {
                                serviceName.unshift("Hand Pickup");
                            } else {
                                serviceName.unshift("Trash");
                            }

                            if ((equipment.uom.search(/GAL/i) >= 0) || (catalog.description.search(/Curb Service/i) >= 0)) {
                                serviceName.push('Toter');
                            } else if (equipment.uom.search(/YD3/i) >= 0) {
                                serviceName.push('Bin');
                            } else if ((equipment.name.search(/can/i) >= 0) || (equipment.id.search(/can/i) >= 0)) {
                                if (equipment.uom.search(/null/i) >= 0) {
                                    serviceName.unshift('Customer');
                                }
                                serviceName.push('Can');
                            }
                        } else if (catalog.line_of_business.search(/COLL_COM/i) >= 0) {
                            // COMMERCIAL


                            if (catalog.description.search(/Recycle/i) >= 0) {
                                serviceName.unshift("Recycling");
                                isRecycling = false;
                            } else if ((catalog.description.search(/Green Waste/i) >= 0) || (catalog.description.search(/Yard Waste/i) >= 0)) {
                                serviceName.unshift("Yard Waste");
                                if (equipment.uom.search(/null/i) >= 0) {
                                    serviceName.push("Hauling");
                                }
                            } else if ((catalog.description.search(/hand pick/i) >= 0) || (catalog.sub_category.search(/hand pick/i) >= 0)) {
                                serviceName.unshift("Hand Pickup");
                            }



                            if ((equipment.uom.search(/GAL/i) >= 0) || (catalog.description.search(/Curb Service/i) >= 0)) {
                                serviceName.push('Toter');
                            } else if (equipment.uom.search(/YD3/i) >= 0) {
                                if ((equipment.id.search(/bin/i) >= 0) || (equipment.name.search(/bin/i) >= 0)) {
                                    serviceName.push('Bin');
                                } else {
                                    serviceName.push('Dumpster');
                                }
                            } else if ((equipment.name.search(/can/i) >= 0) || (equipment.id.search(/can/i) >= 0)) {
                                if (equipment.uom.search(/null/i) >= 0) {
                                    serviceName.unshift('Customer');
                                }
                                serviceName.push('Can');
                            } else {

                            }






                        } else if (catalog.line_of_business.search(/COLL_RO/i) >= 0) {
                            //ROLLOFF
                            if ((equipment.name.search(/open top/i) >= 0) || (catalog.description.search(/open-top/i) >= 0)) {
                                serviceName.unshift("Open Top");
                            }
                            if ((equipment.name.search(/compactor/i) >= 0)) {
                                serviceName.unshift("Compactor");
                            }

                            if (catalog.description.search(/Recycle/i) >= 0) {
                                serviceName.push("Recycling");
                                isRecycling = false;
                            }

                            serviceName.push("Dumpster");

                        }

                        if (serviceName.length === 0) {
                            serviceName.push(catalog.description);
                        }

                        return serviceName.join(" ");
                    } catch (e) {

                    }
                    //trash toter
                    //recycle toter
                    //recycle bin
                    //yard waste

                    //COMMERCIAL
                    //dumpster

                    //ROLLOFF
                    //open top dumpster

                }

                return "i dunno";
            },
            serviceCssIconClass: function(service) {
                return this.humanizeServiceName(service).replace(/\s+/g, '-').toLowerCase();
            },
            isFee: function(service) {

                try {
                    var catalog = service.enterprise_catalog;
                    var equipment = service.equipment;

                    if (catalog.sub_category.search(/haul/i) >= 0) {
                        return false;
                    } else if ((catalog.sub_category.search(/null/i) >= 0) && (equipment.id.search(/null/i) >= 0)) {
                        return true;
                    } else if ((catalog.description.search(/fee/i) >= 0)) { //(catalog.description.search(/service/i) >= 0) ||
                        return true;
                    } else if (catalog.category.search(/DISP/i) >= 0) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (e) {
                    $log.error(e);
                    //console.log("ooops", e, service);
                }
            }
        };
    }])
    .factory('customerData', ['constants', function customerDataFactory(constants) {
        return {
            getField: function(customer, field) {
                var lookedUp = '';

                switch (field) {

                    case 'lineOfBusiness':
                        lookedUp = this.getLineOfBusiness(customer);
                        break;
                    case 'status':
                        lookedUp = this.getStatus(customer);
                        break;
                    case 'statusHuman':
                        lookedUp = this.getStatusHuman(customer);
                        break;
                    case 'ezPayId':
                        lookedUp = this.getEzPayId(customer);
                        break;
                    case 'companyCode':
                        lookedUp = this.getCompanyCode(customer);
                        break;
                    case 'customerNumber':
                        lookedUp = this.getCustomerNumber(customer);
                        break;
                    case 'MASaccountNumber':
                        lookedUp = this.getMASaccountNumber(customer);
                        break;

                    case 'serviceName':
                        lookedUp = this.getServiceName(customer);
                        break;
                    case 'serviceContactName':
                        lookedUp = this.getServiceContactName(customer);
                        break;
                    case 'serviceAddress':
                        lookedUp = this.getServiceAddress(customer);
                        break;
                    case 'serviceAddressForGeocoding':
                        lookedUp = this.getServiceAddressForGeocoding(customer);
                        break;
                    case 'serviceStreet':
                        lookedUp = this.getServiceStreet(customer);
                        break;
                    case 'serviceCity':
                        lookedUp = this.getServiceCity(customer);
                        break;
                    case 'serviceState':
                        lookedUp = this.getServiceState(customer);
                        break;
                    case 'serviceCountry':
                        lookedUp = this.getServiceCountry(customer);
                        break;
                    case 'serviceZip':
                        lookedUp = this.getServiceZip(customer);
                        break;
                    case 'serviceMobilePhone':
                        lookedUp = this.getServiceMobilePhone(customer);
                        break;
                    case 'serviceOfficePhone':
                        lookedUp = this.getServiceOfficePhone(customer);
                        if (lookedUp === undefined) {
                            lookedUp = constants.whitespace;
                        }
                        break;
                    case 'serviceFax':
                        lookedUp = this.getServiceFax(customer);
                        break;
                    case 'serviceEmail':
                        lookedUp = this.getServiceEmail(customer);
                        if (lookedUp === undefined) {
                            lookedUp = constants.whitespace;
                        }
                        break;

                    case 'billingName':
                        lookedUp = this.getBillingName(customer);
                        break;
                    case 'billingContactName':
                        lookedUp = this.getBillingContactName(customer);
                        break;
                    case 'billingAddress':
                        lookedUp = this.getBillingAddress(customer);
                        break;
                    case 'billingStreet':
                        lookedUp = this.getBillingStreet(customer);
                        break;
                    case 'billingCity':
                        lookedUp = this.getBillingCity(customer);
                        break;
                    case 'billingState':
                        lookedUp = this.getBillingState(customer);
                        break;
                    case 'billingCountry':
                        lookedUp = this.getBillingCountry(customer);
                        break;
                    case 'billingZip':
                        lookedUp = this.getBillingZip(customer);
                        break;
                    case 'billingMobilePhone':
                        lookedUp = this.getBillingMobilePhone(customer);
                        break;
                    case 'billingOfficePhone':
                        lookedUp = this.getBillingOfficePhone(customer);
                        if (lookedUp === undefined) {
                            lookedUp = constants.whitespace;
                        }
                        break;
                    case 'billingFax':
                        lookedUp = this.getBillingFax(customer);
                        break;
                    case 'billingEmail':
                        lookedUp = this.getBillingEmail(customer);
                        if (lookedUp === undefined) {
                            lookedUp = constants.whitespace;
                        }
                        break;
                    default:
                        lookedUp = constants.whitespace; //space
                        break;
                }
                return lookedUp;

            },
            getServiceName: function(customer) {
                return (customer.serviceContact.name || constants.whitespace); // \000 is a space
            },
            getServiceContactName: function(customer) {
                return (customer.serviceContact.contactName || constants.whitespace); // \000 is a space
            },
            getLineOfBusiness: function(customer) {
                return (customer.lob || constants.whitespace); // \000 is a space
            },
            getStatus: function(customer) {
                return customer.status; // \000 is a space
            },
            getStatusHuman: function(customer) {
                var humanStatus = constants.whitespace;
                switch (customer.status.toLowerCase()) {
                    case 'bnkpcyactv':
                        humanStatus = 'bankruptcy Active';
                        break;
                    case 'inactvhld':
                        humanStatus = 'Inactive Hold';
                        break;
                    case 'pndnginhld':
                        humanStatus = 'Pending Hold';
                        break;
                    case 'wrtoffactv':
                        humanStatus = 'Writeoff Active';
                        break;
                    case 'cutoff':
                        humanStatus = 'Cut Off';
                        break;
                    default:
                        humanStatus = customer.status;
                        break;
                }
                return humanStatus; // \000 is a space
            },
            getEzPayId: function(customer) {
                return (customer.ezPayId || constants.whitespace); // \000 is a space
            },
            getCompanyCode: function(customer) {
                return (customer.wmMetaData.companyCode || constants.whitespace); // \000 is a space
            },
            getCustomerNumber: function(customer) {
                return (customer.custNumber || constants.whitespace); // \000 is a space
            },
            getCompanyCodePadded: function(customer) {
                return (customer.wmMetaData.companyCode_copy || constants.whitespace); // \000 is a space
            },
            getCustomerNumberPadded: function(customer) {
                return (customer.custNumber_copy || constants.whitespace); // \000 is a space
            },
            getMASaccountNumber: function(customer) {
                var custNumber = this.getCustomerNumberPadded(customer);
                var compCode = this.getCompanyCode(customer);
                if ((custNumber !== constants.whitespace) && (compCode !== constants.whitespace)) {
                    return compCode + '-' + custNumber;
                } else {
                    return constants.whitespace; // \000 is a space
                }
            },
            getServiceAddress: function(customer) {
                var address = customer.serviceContact.address;
                if (address.street2 === undefined) {
                    address.street2 = "";
                }
                return address.street + ' ' + address.street2 + ', ' + address.city + ', ' + address.state + ", " + address.country + " " + address.postalCode;
            },
            getServiceAddressForGeocoding: function(customer) {
                var address = customer.serviceContact.address;
                if (address.street2 === undefined) {
                    address.street2 = "";
                }
                return address.street + " " + address.city + " " + address.state + " " + address.postalCode;
            },
            getServiceStreet: function(customer) {
                var address = customer.serviceContact.address;
                if (address.street2 === undefined) {
                    address.street2 = "";
                }
                return address.street + ' ' + address.street2;
            },
            getServiceCity: function(customer) {
                var address = customer.serviceContact.address;
                return address.city;
            },
            getServiceState: function(customer) {
                var address = customer.serviceContact.address;
                return address.state;
            },
            getServiceCountry: function(customer) {
                var address = customer.serviceContact.address;
                return address.country;
            },
            getServiceZip: function(customer) {
                var address = customer.serviceContact.address;
                return address.postalCode;
            },
            getServiceMobilePhone: function(customer) {
                return customer.serviceContact.mobile;
            },
            getServiceOfficePhone: function(customer) {
                return customer.serviceContact.phone;
            },
            getServiceFax: function(customer) {
                return customer.serviceContact.fax;
            },
            getServiceEmail: function(customer) {
                return (customer.serviceContact.email || constants.whitespace);
            },
            getBillingName: function(customer) {
                return (customer.billingContact.name || constants.whitespace); // \000 is a space
            },
            getBillingContactName: function(customer) {
                return (customer.billingContact.contactName || constants.whitespace); // \000 is a space
            },
            getBillingAddress: function(customer) {
                var address = customer.billingContact.address;
                if (address.street2 === undefined) {
                    address.street2 = "";
                }
                return address.street + ' ' + address.street2 + ', ' + address.city + ', ' + address.state + ", " + address.country + " " + address.postalCode;
            },
            getBillingStreet: function(customer) {
                var address = customer.billingContact.address;
                if (address.street2 === undefined) {
                    address.street2 = "";
                }
                return address.street + ' ' + address.street2;
            },
            getBillingCity: function(customer) {
                var address = customer.billingContact.address;
                return address.city;
            },
            getBillingState: function(customer) {
                var address = customer.billingContact.address;
                return address.state;
            },
            getBillingCountry: function(customer) {
                var address = customer.billingContact.address;
                return address.country;
            },
            getBillingZip: function(customer) {
                var address = customer.billingContact.address;
                return address.postalCode;
            },
            getBillingMobilePhone: function(customer) {
                return customer.billingContact.mobile;
            },
            getBillingOfficePhone: function(customer) {
                return customer.billingContact.phone;
            },
            getBillingFax: function(customer) {
                return customer.billingContact.fax;
            },
            getBillingEmail: function(customer) {
                return (customer.billingContact.email || constants.whitespace);
            }
        };
    }])
    .factory('Customer', ['$resource', 'constants', function CustomerFactory($resource, constants) {
        var config = {
            service: {
                'emails': {
                    'path': 'emails/:emailId',
                    'profileID': {
                        'dev': 'eBiz_999',
                        'stage': 'eBiz_999',
                        'qat': 'eBiz_999',
                        'prod': 'eBiz_999'
                    },
                    'cleanse': {
                        'path': 'emails/:emailId/cleanse',
                        'profileID': {
                            'dev': 'CAAG_105',
                            'stage': 'CAAG_205',
                            'qat': 'CAAG_305',
                            'prod': 'CAAG_705'
                        },
                        'Authorization': {
                            'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    }
                },
                'address': {
                    'path': 'address',
                    'profileID': {
                        'dev': 'eBiz_999',
                        'stage': 'eBiz_999',
                        'qat': 'eBiz_999',
                        'prod': 'eBiz_999'
                    },
                    'cleanse': {
                        'path': 'address/cleanse',
                        'profileID': {
                            'dev': 'CAAG_103',
                            'stage': 'CAAG_203',
                            'qat': 'CAAG_303',
                            'prod': 'CAAG_703'
                        },
                        'Authorization': {
                            'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    }
                },
                'customers': {
                    'profiles': {
                        'path': 'customers/:ezPayId/profiles',
                        'profileID': {
                            'dev': 'CAAG_106',
                            'stage': 'CAAG_206',
                            'qat': 'CAAG_306',
                            'prod': 'CAAG_706'
                        }
                    },
                    'tickets': {
                        'path': 'customers/:ezPayId/tickets',
                        'profileID': {
                            'landfill': {
                                'dev': 'CAAG_107',
                                'stage': 'CAAG_207',
                                'qat': 'CAAG_307',
                                'prod': 'CAAG_707'
                            },
                            'MAS': {
                                'dev': 'CAAG_108',
                                'stage': 'CAAG_208',
                                'qat': 'CAAG_308',
                                'prod': 'CAAG_708'
                            }

                        },
                        'ticket': {
                            'path': 'customers/:ezPayId/tickets/:ticketId',
                            'profileID': {
                                'landfill': {
                                    'dev': 'CAAG_107',
                                    'stage': 'CAAG_207',
                                    'qat': 'CAAG_307',
                                    'prod': 'CAAG_707'
                                },
                                'MAS': {
                                    'dev': 'CAAG_108',
                                    'stage': 'CAAG_208',
                                    'qat': 'CAAG_308',
                                    'prod': 'CAAG_708'
                                }
                            }
                        }
                    },
                    'cases': {
                        'path': 'customers/:ezPayId/cases',
                        'profileID': {
                            'dev': 'CAAG_114',
                            'stage': 'CAAG_214',
                            'qat': 'CAAG_314',
                            'prod': 'CAAG_714'
                        },
                        'case': {
                            'path': 'customers/:ezPayId/cases/:caseId',
                            'profileID': {
                                'dev': 'CAAG_114',
                                'stage': 'CAAG_214',
                                'qat': 'CAAG_314',
                                'prod': 'CAAG_714'
                            },
                            'Authorization': {
                                'dev':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'stage':'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'qat':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                            }
                        },
                        'completioncodes': {
                            'path': 'cases/completioncodes',
                            'profileID': {
                                'dev': 'CAAG_114',
                                'stage': 'CAAG_214',
                                'qat': 'CAAG_314',
                                'prod': 'CAAG_714'
                            },
                            'Authorization': {
                                'dev':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'stage':'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'qat':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                            }
                        }
                    },
                    'services': {
                        'path': 'customers/:ezPayId/services',
                        'profileID': {
                            'dev': 'CAAG_109',
                            'stage': 'CAAG_209',
                            'qat': 'CAAG_309',
                            'prod': 'CAAG_709'
                        },
                        'stats': {
                            'path': 'customers/:ezPayId/services/stats',
                            'profileID': {
                                'dev': 'CAAG_110',
                                'stage': 'CAAG_210',
                                'qat': 'CAAG_310',
                                'prod': 'CAAG_710'
                            }

                        },
                        'plan': {
                            'path': 'customers/:ezPayId/services/plan',
                            'profileID': {
                                'dev': 'CAAG_110',
                                'stage': 'CAAG_210',
                                'qat': 'CAAG_310',
                                'prod': 'CAAG_710'
                            }

                        },
                        'exceptions': {
                            'path': 'customers/:ezPayId/services/exceptions',
                            'profileID': {
                                'dev': 'CAAG_110',
                                'stage': 'CAAG_210',
                                'qat': 'CAAG_310',
                                'prod': 'CAAG_710'
                            }

                        },
                        'eta': {
                            'path': 'customers/:ezPayId/services/:serviceId/ETA',
                            'profileID': {
                                'dev': 'CAAG_111',
                                'stage': 'CAAG_211',
                                'qat': 'CAAG_311',
                                'prod': 'CAAG_711'
                            }

                        },
                    },
                    'contacts': {
                        'path': 'customers/:ezPayId/contacts',
                        'profileID': {
                            'dev': 'CAAG_106',
                            'stage': 'CAAG_206',
                            'qat': 'CAAG_306',
                            'prod': 'CAAG_706'
                        },
                        'billing': {
                            'path': 'customers/:ezPayId/contacts/billing',
                            'profileID': {
                                'dev': 'eBiz_999',
                                'stage': 'eBiz_999',
                                'qat': 'eBiz_999',
                                'prod': 'eBiz_999'
                            },
                            'address': {
                                'path': 'customers/:ezPayId/contacts/billing/address',
                                'profileID': {
                                    'dev': 'CAAG_104',
                                    'stage': 'CAAG_204',
                                    'qat': 'CAAG_304',
                                    'prod': 'CAAG_704'
                                },
                                'Authorization': {
                                    'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                    'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                    'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                    'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                                }
                            }
                        }

                    },
                    'contacts_post': {
                        'path': 'customers/:ezPayId/contacts',
                        'profileID': {
                            'dev': 'CAAG_102',
                            'stage': 'CAAG_202',
                            'qat': 'CAAG_302',
                            'prod': 'CAAG_702'
                        },
                        'Authorization': {
                            'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    },
                    'activities': {
                        'email': {
                            'path': 'customers/:ezPayId/activities/email',
                            'profileID': {
                                'dev': 'CAAG_112',
                                'stage': 'CAAG_212',
                                'qat': 'CAAG_312',
                                'prod': 'CAAG_712'
                            }
                        },
                        'inquiries': { //wm.com report a problem
                            'path': 'customers/:ezPayId/activities/issues',
                            'profileID': {
                                'dev': 'CAAG_112',
                                'stage': 'CAAG_212',
                                'qat': 'CAAG_312',
                                'prod': 'CAAG_712'
                            }
                        },
                        'notes': {
                            'path': 'customers/:ezPayId/activities/notes',
                            'profileID': {
                                'dev': 'CAAG_113',
                                'stage': 'CAAG_213',
                                'qat': 'CAAG_313',
                                'prod': 'CAAG_713'
                            }
                        },
                        'notes_post': {
                            'path': 'customers/:ezPayId/activities/notes',
                            'profileID': {
                                'dev': 'CAAG_101',
                                'stage': 'CAAG_201',
                                'qat': 'CAAG_301',
                                'prod': 'CAAG_701'
                            },
                            'Authorization': {
                                'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                                'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                            }
                        }
                    },
                    'invoices':{
                        'path': 'customers/:ezPayId/invoices',
                        'profileID': {
                            'dev': 'CAAG_113',
                            'stage': 'CAAG_213',
                            'qat': 'CAAG_313',
                            'prod': 'CAAG_713'
                        },
                        'Authorization': {
                            'dev':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage':'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    },
                    'invoiceDetails':{
                        'path': 'customers/:ezPayId/invoices/:invoiceId',
                        'profileID': {
                            'dev': 'CAAG_',
                            'stage': 'CAAG_',
                            'qat': 'CAAG_308',
                            'prod': 'CAAG_'
                        },
                        'Authorization': {
                            'dev':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage':'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    },
                    'communicationPreferences':{
                        'path': 'customers/:ezPayId/communication-preferences',
                        'profileID': {
                            'stage': 'CAAG_221',
                            'qat': 'CAAG_321'

                        },
                        'Authorization': {
                            'dev':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'stage':'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'qat':  'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
                            'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
                        }
                    }
                }
            },
            prod: {
                'auth': 'caaguser;c$$gu$er',
                'domain': 'http://esb.wm.com',
                'port': ':8897',
                'baseURL': '/api/v1/',
                'baseURLV2': '/api/v2/',
                'baseURLV3': '/api/v3/'
            },
            qat: {
                'auth': 'caaguser;caaguser',
                'domain': 'https://esbqat.wm.com',
                'port': ':9999',
                'baseURL': '/api/v1/',
                'baseURLV2': '/api/v2/',
                'baseURLV3': '/api/v3/'
            },
            stage: {
                'auth': 'caaguser;caaguser',
                'domain': 'https://esbtst.wm.com',
                'port': ':9999',
                'baseURL': '/api/v1/',
                'baseURLV2': '/api/v2/',
                'baseURLV3': '/api/v3/'
            },
            dev: {
                'auth': 'caaguser;caaguser',
                'domain': 'https://esbdev.wm.com',
                'port': ':9999',
                'baseURL': '/api/v1/',
                'baseURLV2': '/api/v2/',
                'baseURLV3': '/api/v3/'
            }
        };

        return {
            Emails: {
                _: function(emailId) {
                	return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.emails.path, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.emails.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                'cleanse': function(emailId) {
                	return $resource( config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.emails.cleanse.path, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.emails.cleanse.profileID[constants.api_env],
                                'Authorization': config.service.emails.cleanse.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                }
            },
            Address: {
                _: function() {
                	return $resource( config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.address.path, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.address.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                'cleanse': function(street1, city, state, zip, country) {
                	return $resource( config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.address.cleanse.path +
                			"?street1=" + street1 + "&city=" + city + "&state=" + state + "&zip=" + zip + "&Country=" + country, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.address.cleanse.profileID[constants.api_env],
                                'Authorization': config.service.address.cleanse.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                }
            },
            Profile: function(ezPayId) {

                return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.profiles.path, {}, {
                    get: {
                        method: 'GET',
                        headers: {
                            'ezPayId': ezPayId,
                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                            'Accept': 'application/json',
                            'ProfileId': config.service.customers.profiles.profileID[constants.api_env],
                            'Cache-Control': 'no-cache'
                        }
                        // withCredentials: false
                    }
                });
            },
            Tickets: {
                _: function(ezPayId, lob, fromDate, toDate) {
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(4, 'months').format('YYYY-MM-DD');

                    var profileID = '';
                    var disposalParam = '';
                    switch (lob) {
                        case 'landfill':
                            profileID = config.service.customers.tickets.ticket.profileID.landfill[constants.api_env];
                            disposalParam = '&ticket_type=disposal';
                            break;
                        default:
                            profileID = config.service.customers.tickets.ticket.profileID.MAS[constants.api_env];
                            break;
                    }
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.tickets.path + "?fromDate=" + fromDate + "&toDate=" + toDate + disposalParam, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': profileID,
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                ticket: function(ezPayId, ticketId, lob) {
                    var profileID = '';
                    var disposalParam = '';
                    switch (lob) {
                        case 'landfill':
                            profileID = config.service.customers.tickets.ticket.profileID.landfill[constants.api_env];
                            disposalParam = '?ticket_type=disposal';
                            break;
                        default:
                            profileID = config.service.customers.tickets.ticket.profileID.MAS[constants.api_env];
                            break;
                    }
                    return $resource( config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.tickets.ticket.path + disposalParam, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                // 'ticketId': ticketId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': profileID,
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                }
            },
            Cases: {
                _: function(ezPayId, lob, fromDate, toDate) {
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(4, 'months').format('YYYY-MM-DD');

                    // var profileID = '';
                    // switch (lob) {
                    //     case 'landfill':
                    //         profileID = config.service.customers.cases.ticket.profileID.landfill[constants.api_env];
                    //         break;
                    //     default:
                    //         profileID = config.service.customers.cases.ticket.profileID.MAS[constants.api_env];
                    //         break;
                    // }
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.cases.path + "?fromDate=" + fromDate + "&toDate=" + toDate, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.cases.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                },
                case: function(ezPayId, caseId, lob) {
                    // var profileID = '';
                    // switch (lob) {
                    //     case 'landfill':
                    //         profileID = config.service.customers.cases.case.profileID.landfill[constants.api_env];
                    //         break;
                    //     default:
                    //         profileID = config.service.customers.cases.case.profileID.MAS[constants.api_env];
                    //         break;
                    // }
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.cases.case.path, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.cases.case.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        },
                        put: {
                            method: 'PUT',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Content-Type': 'application/json',
                                'ProfileId': config.service.customers.cases.case.profileID[constants.api_env],
                                'Authorization': config.service.customers.cases.case.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                },
                completioncodes: function(ezPayId, categoryCd, subCategoryCd) {
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.cases.completioncodes.path + "?category=" + categoryCd + "&sub_category=" + subCategoryCd, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.cases.completioncodes.profileID[constants.api_env],
                                'Authorization': config.service.customers.cases.completioncodes.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                }
            },
            Services: {
                _: function(ezPayId, lob) {
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.services.path + "?line_of_business=" + lob, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.services.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                stats: function(ezPayId, numberOfDays, summary, includeToday) {
                    numberOfDays = numberOfDays ? numberOfDays : 120;
                    summary = summary ? summary : 'Y';
                    includeToday = includeToday ? includeToday : 'Y'; // include service stats for current day
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.services.stats.path + "?numberOfDays=" + numberOfDays + "&summary=" + summary + "&includeToday=" + includeToday, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.services.stats.profileID[constants.api_env],
                                'Cache-Control': 'no-cache',

                            }
                            // withCredentials: false
                        }
                    });
                },
                plan: function(ezPayId) {
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.services.plan.path, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.services.plan.profileID[constants.api_env],
                                'Cache-Control': 'no-cache',

                            }
                            // withCredentials: false
                        }
                    });
                },
                exceptions2: function(ezPayId, custorderNbr, custSvcNbr) {
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.services.exceptions.path + "?customer_order_number=" + custorderNbr + "&customer_service_number=" + custSvcNbr, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.services.exceptions.profileID[constants.api_env],
                                'Cache-Control': 'no-cache',

                            }
                        }
                    });
                },
                eta: function(ezPayId, serviceId, lob, ticketNbr, requestDate) {
                    requestDate = requestDate ? requestDate : moment().format('YYYY-MM-DD');

                    // only supply ticketNumber parameter if LOB === ROLLOFF
                    switch (lob) {
                        case 'ROLLOFF':
                            ticketNbrParam = '&ticketNumber=' + ticketNbr;
                            break;
                        default:
                            ticketNbrParam = '';
                            break;
                    }
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.services.eta.path + "?requestDate=" + requestDate + ticketNbrParam, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.services.eta.profileID[constants.api_env],
                                'Cache-Control': 'no-cache',

                            }
                        }
                    });
                }
            },
            Contacts: {
            	_: function(ezPayId) {
            		return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.contacts.path, {}, {
	                    get: {
	                        method: 'GET',
	                        headers: {
	                            'ezPayId': ezPayId,
	                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
	                            'Accept': 'application/json',
	                            'ProfileId': config.service.customers.contacts.profileID[constants.api_env],
	                            'Cache-Control': 'no-cache'
	                        }
	                        // withCredentials: false
	                    },
	                    update: {
	                        method: 'POST',
	                        headers: {
	                            'ezPayId': ezPayId,
	                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
	                            'Accept': 'application/json',
	                            'Content-Type': 'application/json',
	                            'ProfileId': config.service.customers.contacts_post.profileID[constants.api_env],
	                            'Authorization': config.service.customers.contacts_post.Authorization[constants.api_env],
	                            'Cache-Control': 'no-cache'
	                        }
	                        // withCredentials: false
	                    }
	                });
	            },
	            billing: {
	            	_: function(ezPayId) {
	            		return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.contacts.billing.path, {}, {
	            			get: {
		                        method: 'GET',
		                        headers: {
		                            'ezPayId': ezPayId,
		                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
		                            'Accept': 'application/json',
		                            'ProfileId': config.service.customers.contacts.billing.profileID[constants.api_env],
		                            'Cache-Control': 'no-cache'
		                        }
		                        // withCredentials: false
		                    }
	            		});
	            	},
	            	address: function(ezPayId, cleanseAddress) {
	            		return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.contacts.billing.address.path + "?cleanse_address=" + cleanseAddress, {}, {
	            			get: {
		                        method: 'GET',
		                        headers: {
		                            'ezPayId': ezPayId,
		                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
		                            'Accept': 'application/json',
		                            'ProfileId': config.service.customers.contacts.billing.address.profileID[constants.api_env],
		                            'Cache-Control': 'no-cache'
		                        }
		                        // withCredentials: false
		                    },
		                    update: {
		                        method: 'POST',
		                        headers: {
		                            'ezPayId': ezPayId,
		                            'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
		                            'Accept': 'application/json',
		                            'Content-Type': 'application/json',
		                            'ProfileId': config.service.customers.contacts.billing.address.profileID[constants.api_env],
		                            'Authorization': config.service.customers.contacts.billing.address.Authorization[constants.api_env],
		                            'Cache-Control': 'no-cache'

		                        }
		                        // withCredentials: false
		                    }
	            		});
	            	}
	            }
            },
            ActivityFeed: {
                emails: function(ezPayId, fromDate, toDate) {
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(4, 'months').format('YYYY-MM-DD');
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.activities.email.path + "?fromDate=" + fromDate + "&toDate=" + toDate, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.activities.email.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                inquiries: function(ezPayId, fromDate, toDate) {
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(4, 'months').format('YYYY-MM-DD');
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.activities.inquiries.path + "?fromDate=" + fromDate + "&toDate=" + toDate, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.activities.inquiries.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                notes: function(ezPayId, fromDate, toDate) {
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(4, 'months').format('YYYY-MM-DD');
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.activities.notes.path + "?fromDate=" + fromDate + "&toDate=" + toDate, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.activities.notes.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                },
                notes_post: function(ezPayId) {
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.customers.activities.notes_post.path, {}, {
                        update: {
                            method: 'POST',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'ProfileId': config.service.customers.activities.notes_post.profileID[constants.api_env],
                                'Authorization': config.service.customers.activities.notes_post.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                            // withCredentials: false
                        }
                    });
                }

            },
            Invoices: {
                invoiceHistory:function(ezPayId, fromDate, toDate){
                    // toDate = "2018-04-01";
                    // fromDate = "2016-11-01";
                    toDate = toDate ? toDate : moment().format('YYYY-MM-DD');
                    fromDate = fromDate ? fromDate : moment().subtract(6, 'months').format('YYYY-MM-DD');
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURLV2 +
                     config.service.customers.invoices.path + "?fromDate=" + fromDate + "&toDate=" + toDate, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.invoices.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                }
            },
            InvoiceDetails: {
                lineItems: function(){
                    var CONST_URL = [
                        config[constants.api_env].domain,
                        config[constants.api_env].port,
                        config[constants.api_env].baseURLV2,
                        config.service.customers.invoiceDetails.path
                    ].join('');
                    return $resource(CONST_URL , {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'Authorization': config.service.customers.invoiceDetails.Authorization[constants.api_env],
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId': config.service.customers.invoiceDetails.profileID[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                }
            },
            Communication: {
                customerPreferences:function(ezPayId){
                   var language = "language";
                    return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL +
                     config.service.customers.communicationPreferences.path + "?fields=" + language, {}, {
                        get: {
                            method: 'GET',
                            headers: {
                                'ezPayId': ezPayId,
                                'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
                                'Accept': 'application/json',
                                'ProfileId':  'CAAG_308',
                                'Authorization': config.service.customers.communicationPreferences.Authorization[constants.api_env],
                                'Cache-Control': 'no-cache'
                            }
                        }
                    });
                }

            },

        };
    }])
    .factory('serverLog', ['$http', '$location', '$log', '$localStorage','constants',
    function ServerLogFactory($http, $location, $log, $localStorage,constants) {
        return {
            // var dataObj = {
            //     name: $scope.name,
            //     employees: $scope.employees,
            //     headoffice: $scope.headoffice
            // };
            send: function(logThis) {
                var json = this.prepare(logThis);
                //var postLog = $http.post('http://logger.appstack.wm.com/v1/log', json);
                var postLog = $http.post(constants.loggerBaseUrl, json);
                postLog.success(function(data, status, headers, config) {
                    $log.debug('[SERVICE] serverLog', data, status, headers, config);
                    return true;
                });
                postLog.error(function(data, status, headers, config) {
                    $log.error(data, status, headers, config);
                    return false;
                });
            },
            prepare: function(logThis) {
                var logJSON = {
                    'app': 'customer-search',
                    'env': {
                        'domain': $location.host(),
                        'port': $location.port(),
                        'path': $location.path(),
                        'url': $location.absUrl()
                    },
                    'timestamp': moment(),
                    'log': logThis,
                    'user': !!$localStorage.loginInfo ? $localStorage.loginInfo : 'unauthenticated'
                };
                return logJSON;
            }
        };
    }])
    .factory('Moments', ['$http', function MomentsFactory($http) {
        return {
            updateTime: function(utcOffsetInMins) {
                var time = utcOffsetInMins ? moment().utcOffset(utcOffsetInMins) : moment();
                return {
                    now: time,
                    curTime: time.format('h:mm').toString(),
                    curAmPm: time.format('a').toString(),
                    curDate: time.format('dddd MMMM D').toString(),
                    timeOfDay: this.getGreetingTime(time)
                };
            },
            getTimeZone: function(lat, lng) {
                return $http.get('https://vip.timezonedb.com/?lat=' + lat + '&lng=' + lng + '&key=AL8D1ED4EVJR&format=json');
            },
            getHowLongAgo: function(timestamp, timezone) {
                // return moment.duration(moment().diff(timestamp));//.humanize();
                var theTime = moment(timestamp);

                if (!!timezone) {
                    theTime = moment(timestamp, timezone);
                }
                return theTime.fromNow().replace(" ago", "").replace(/a /g, "1 "); //.replace(/ years| year/g, 'y').replace(/ months| month/g, "m").replace(/ days| day/g, "d").replace(/ minutes| minute| mins | min/g, "min").replace(/ seconds| second/g, "sec").replace(/a/g, "1");

            },
            getGreetingTime: function(m) {
                //THIS FUNCTION RETURNS MORNING, AFTERNOON, OR EVENING BASED ON A moment() object
                var g = null; //return g

                if (!m || !m.isValid()) {
                    return;
                } //if we can't find a valid or filled moment, we return.

                var split_afternoon = 12; //24hr time to split the afternoon
                var split_evening = 17; //24hr time to split the evening
                var currentHour = parseFloat(m.format("HH"));

                if (currentHour >= split_afternoon && currentHour <= split_evening) {
                    g = "afternoon";
                } else if (currentHour >= split_evening) {
                    g = "evening";
                } else {
                    g = "morning";
                }

                return g;
            }
        };
    }])
//----------------------------------
 .factory('truckOnMapService', ['$http', '$q', '$resource', 'constants', function($http, $q, $resource, constants) {

        var config = {
              'customerService' : {
                  'url' : {
                    'dev' : 'https://esbdev.wm.com:9999/api/v1/customers/:customerId/services/plan',
                    'stage' : 'https://esbtst.wm.com:9999/api/v1/customers/:customerId/services/plan',
                    'qat' : 'https://esbqat.wm.com:9999/api/v1/customers/:customerId/services/plan',
                    'prod' : 'http://esb.wm.com:8888/api/v1/customers/:customerId/services/plan'
                  },
                  'header' : {
                        'dev' : {
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_117'
                         },
                         'stage' : {
                             'Request-Tracking-Id': '12345',
                              'Accept': 'application/json',
                              'ProfileId' : 'CAAG_217'
                          },
                         'qat':{
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_317',
                             'Authorization' : 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI='
                         },
                         'prod':{
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_710'
                         }
                  }
              },
              /*'vehicleCoordinatedService' : {
                'url' : {
                    'dev_part1' : 'http://esbdev.wm.com:8888/api/v1/vehicles/',
                    'dev_part2': '/coordinates',
                    'qa_part1' : 'http://esbqat.wm.com:8888/api/v1/vehicles/',
                    'qa_part2':  '/coordinates'
                   //'dev' : 'http://adcvdijva022:8888/api/v1/route/'
                  },
                  'header' : {
                        'dev' : {
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'eBiz_117'
                         },
                         'qa':{
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'eBiz_317',
                             'Authorization' : 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI='
                         }
                  }
            },*/
            'routePlan' : {
                'url' : {
                    'dev' : 'https://esbdev.wm.com:9999/api/v1/routes/:routeId/stops',
                    'stage' : 'https://esbtst.wm.com:9999/api/v1/routes/:routeId/stops',
                    'qat' : 'https://esbqat.wm.com:9999/api/v1/routes/:routeId/stops',
                    'prod' : 'http://esb.wm.com:8888/api/v1/routes/:routeId/stops'
                  },
                  'header' : {
                        'dev' : {
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_117'
                         },
                         'stage' : {
                             'Request-Tracking-Id': '12345',
                              'Accept': 'application/json',
                              'ProfileId' : 'CAAG_217'
                          },
                         'qat':{
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_317',
                             'Authorization' : 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI='
                         },
                         'prod':{
                            'Request-Tracking-Id': '12345',
                             'Accept': 'application/json',
                             'ProfileId' : 'CAAG_715'
                         }
                  }
            }
        };

        return {
        getCustomerRoute : function(){

            return  $resource(config.customerService.url[constants.api_env], {
                            customerId : '@customerId'
                        }, {
                        get: {
                            method: 'GET',
                            headers: config.customerService.header[constants.api_env]
                       }
                    });

        },

        getRoutePlan : function(){

            return  $resource(config.routePlan.url[constants.api_env], {
                            routeId : '@routeId'
                        }, {
                        get: {
                            method: 'GET',
                            headers: config.routePlan.header[constants.api_env]
                       }
                    });
        },
        /*,
         getVehicleCoordinates : function(vehicleId){
         var deff = $q.defer();
            return $http({
                method: 'GET',
                url: config.vehicleCoordinatedService.url.dev_part1+vehicleId+config.vehicleCoordinatedService.url.dev_part2,
                headers: config.vehicleCoordinatedService.header.dev
            })
            .success(function(data) {
                return deff.resolve(data);
            }).error(function(err) {

                return deff.reject(err);
            });
        }*/

    };


}])
//---------------------------------------------
    .factory('Weather', ['UserLocation', '$http', '$localStorage', 'Moments', function WeatherFactory(UserLocation, $http, $localStorage, Moments) {
        return {
            getStoredWeather: function() {
                if (!!$localStorage.weather) {
                    return JSON.parse($localStorage.weather);
                } else {
                    return undefined;
                }
            },
            shouldWeatherBeFetched: function() {
                //if it's been 30 mins since we updated it, then yes, otherwise no
                var self = this;
                var weather = this.getStoredWeather();
                var lastUpdated = new moment();
                var now = new moment();
                var minutes = 0;
                if (!!weather) {
                    lastUpdated = moment.utc(weather.currently.time, 'X');
                    minutes = now.diff(lastUpdated, 'minutes');
                    if (minutes >= 30) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }

            },
            cacheWeather: function(weather) {
                $localStorage.weather = JSON.stringify(weather);
                return true;
            },
            fetchWeather: function(latitude, longitude) {

                var weatherPromise = $http.jsonp('https://api.forecast.io/forecast/1b777890904c974d7b2b33080e912eb7/' + latitude + ',' + longitude + '?callback=JSON_CALLBACK');

                return weatherPromise;

            },
        };
    }])

    .factory('UserLocation', function UserLocationFactory(geolocation, $localStorage, $q, $log, $timeout, $rootScope) {

        var userLocation = {
            'latLong': {
                'latitude': '',
                'longitude': ''
            },
            'address': {
                'street_number': {
                    'long_name': '',
                    'short_name': '',
                },
                'street_name': {
                    'long_name': '',
                    'short_name': '',
                },
                'neighborhood': {
                    'long_name': '',
                    'short_name': '',
                },
                'city': {
                    'long_name': '',
                    'short_name': '',
                },
                'county': {
                    'long_name': '',
                    'short_name': '',
                },
                'state': {
                    'long_name': '',
                    'short_name': '',
                },
                'country': {
                    'long_name': '',
                    'short_name': '',
                },
                'postal_code': {
                    'long_name': '',
                    'short_name': '',
                },
                'formatted': ''
            },
        };

        var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

        var queue = [];

        // Amount of time (in milliseconds) to pause between each trip to the
        // Geocoding API, which places limits on frequency.
        var QUERY_PAUSE = 250;

        /**
         * executeNext() - execute the next function in the queue.
         *                  If a result is returned, fulfill the promise.
         *                  If we get an error, reject the promise (with message).
         *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
         */
        var executeNext = function() {
            var task = queue[0],
                geocoder = new google.maps.Geocoder();

            geocoder.geocode({
                address: task.address
            }, function(result, status) {

                if (status === google.maps.GeocoderStatus.OK) {

                    var parsedResult = {
                        lat: result[0].geometry.location.lat(),
                        lng: result[0].geometry.location.lng(),
                        formattedAddress: result[0].formatted_address
                    };
                    locations[task.address] = parsedResult;

                    $localStorage.locations = JSON.stringify(locations);

                    queue.shift();
                    task.d.resolve(parsedResult);

                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    queue.shift();
                    task.d.reject({
                        type: 'zero',
                        message: 'Zero results for geocoding address ' + task.address
                    });
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    if (task.executedAfterPause) {
                        queue.shift();
                        task.d.reject({
                            type: 'busy',
                            message: 'Geocoding server is busy can not process address ' + task.address
                        });
                    }
                } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
                    queue.shift();
                    task.d.reject({
                        type: 'denied',
                        message: 'Request denied for geocoding address ' + task.address
                    });
                } else {
                    queue.shift();
                    task.d.reject({
                        type: 'invalid',
                        message: 'Invalid request for geocoding: status=' + status + ', address=' + task.address
                    });
                }

                if (queue.length) {
                    if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        var nextTask = queue[0];
                        nextTask.executedAfterPause = true;
                        $timeout(executeNext, QUERY_PAUSE);
                    } else {
                        $timeout(executeNext, 0);
                    }
                }

                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            });
        };

        return {

            getStoredLocation: function() {
                if (!!$localStorage.location) {
                    return JSON.parse($localStorage.location);
                } else {
                    return undefined;
                }
            },

            getLocation: function() {
                // uiGmapIsReady.promise().then(function(maps) {
                // console.log("MAPS R READYZZZZZZZ (from getLocation service)");

                return geolocation.getLocation().then(null, this.geolocationFail).then(this.doReverseGeoCode).then(this.handleGeocodedLocation).then(this.cacheClientLocation); //.then(function(data){
                // });
                //   return data.address.city.long_name;
                // });
            },

            geolocationFail: function(error) {
                $log.error(error);
                return $q.reject(error);
            },

            cacheClientLocation: function(userLocation) {
                $localStorage.location = JSON.stringify(userLocation);
                return JSON.parse($localStorage.location);
            },

            handleGeocodedLocation: function(data) {


                var result = data[0];
                for (var i = 0, len = result.address_components.length; i < len; i++) {
                    var addressComponent = result.address_components[i];

                    if (addressComponent.types.indexOf("street_number") >= 0) {
                        userLocation.address.street_number.short_name = addressComponent.short_name;
                        userLocation.address.street_number.long_name = addressComponent.long_name;
                    }

                    if (addressComponent.types.indexOf("route") >= 0) {
                        userLocation.address.street_name.short_name = addressComponent.short_name;
                        userLocation.address.street_name.long_name = addressComponent.long_name;
                    }

                    if (addressComponent.types.indexOf("neighborhood") >= 0) {
                        userLocation.address.neighborhood.short_name = addressComponent.short_name;
                        userLocation.address.neighborhood.long_name = addressComponent.long_name;
                    }

                    if (addressComponent.types.indexOf("locality") >= 0) {
                        userLocation.address.city.short_name = addressComponent.short_name;
                        userLocation.address.city.long_name = addressComponent.long_name;
                    }

                    if (addressComponent.types.indexOf("administrative_area_level_2") >= 0) {
                        userLocation.address.county.short_name = addressComponent.short_name;
                        userLocation.address.county.long_name = addressComponent.long_name;
                    }
                    if (addressComponent.types.indexOf("administrative_area_level_1") >= 0) {
                        userLocation.address.state.short_name = addressComponent.short_name; //TX
                        userLocation.address.state.long_name = addressComponent.long_name; //Texas
                    }

                    if (addressComponent.types.indexOf("country") >= 0) {
                        userLocation.address.country.short_name = addressComponent.short_name;
                        userLocation.address.country.long_name = addressComponent.long_name;
                    }

                    if (addressComponent.types.indexOf("postal_code") >= 0) {
                        userLocation.address.postal_code.short_name = addressComponent.short_name;
                        userLocation.address.postal_code.long_name = addressComponent.long_name;
                    }
                }
                return userLocation;
            },

            doGeoCode: function(address) {
                $log.debug('[FUNCTION] doGeoCode.  trying to geocode this address: ' + address);
                var d = $q.defer();

                if (_.has(locations, address)) {
                    d.resolve(locations[address]);
                } else {
                    queue.push({
                        address: address,
                        d: d
                    });

                    if (queue.length === 1) {
                        executeNext();
                    }
                }

                return d.promise;
            },

            doReverseGeoCode: function(data) {

                //laglong should be a json object containing latitute and longitude
                //  {
                //    'latLong':
                //     {
                //      'latitude': '25.98385',
                //      'longitude': '80.19539'
                //     }
                //  }

                var latLong = {
                    'latitude': data.coords.latitude,
                    'longitude': data.coords.longitude
                };

                userLocation.latLong = latLong;

                var latlng = new google.maps.LatLng(latLong.latitude, latLong.longitude);
                var geocoder = new google.maps.Geocoder();
                var promise = new Promise(function(resolve, reject) {
                    geocoder.geocode({
                        'latLng': latlng
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            resolve(results);
                        } else {
                            reject(status);
                        }
                    });
                });

                return promise;
            }

        };
    })
    .factory('MasLibraries', ['$resource', 'constants', function CustomerFactory($resource, constants) {
      var config={
    		prod: {
    			'auth': 'caaguser;c$$gu$er',
    			'domain': 'http://esb.wm.com',
    			'port': ':8897',
    			'baseURL': '/api/v1/'
    		},
    		qat: {
    			'auth': 'caaguser;caaguser',
    			'domain': 'https://esbqat.wm.com',
    			'port': ':9999',
    			'baseURL': '/api/v1/'
    		},
    		stage: {
    			'auth': 'caaguser;caaguser',
    			'domain': 'https://esbtst.wm.com',
    			'port': ':9999',
    			'baseURL': '/api/v1/'
    		},
    		dev: {
    			'auth': 'caaguser;caaguser',
    			'domain': 'https://esbdev.wm.com',
    			'port': ':9999',
    			'baseURL': '/api/v1/'
    		},
    		service: {
    			'routes': {
    				'path': 'libraries/:libraryId/routes',
    				'profileID': {
    					'dev': '',
    					'stage': '',
    					'qat': 'CAAG_319',
    					'prod': ''
    				},
    				'Authorization': {
    					'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
    				}
    			},
                'drivers': {
                    'path': 'libraries/:libraryId/drivers',
    				'profileID': {
    					'dev': '',
    					'stage': '',
    					'qat': 'CAAG_319',
    					'prod': ''
    				},
    				'Authorization': {
    					'dev': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'stage': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'qat': 'Basic Y2FhZ3VzZXI6Y2FhZ3VzZXI=',
    					'prod': 'Basic Y2FhZ3VzZXI6YyQkZ3UkZXI='
    				}
                }
    		}
    	};
    	return{
    		drivers: function(libraryId) {
    			return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.drivers.path , {}, {
    				get: {
    					method: 'GET',
    					headers: {
    						'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
    						'Accept': 'application/json',
    						'ProfileId': config.service.drivers.profileID[constants.api_env],
    						'Authorization': config.service.drivers.Authorization[constants.api_env],
    						'Cache-Control': 'no-cache'
    					}
    				}
    			});
    		},
            routes: function(libraryId) {
    			return $resource(config[constants.api_env].domain + config[constants.api_env].port + config[constants.api_env].baseURL + config.service.routes.path , {}, {
    				get: {
    					method: 'GET',
    					headers: {
    						'Request-Tracking-Id': Math.floor((Math.random() * 999999) + 1),
    						'Accept': 'application/json',
    						'ProfileId': config.service.routes.profileID[constants.api_env],
    						'Authorization': config.service.routes.Authorization[constants.api_env],
    						'Cache-Control': 'no-cache'
    					}
    				}
    			});
    		}
    	};
    }])
    .factory('caagUpdates', function ($http) {
        return $http.get('/data/updates/caag-update-hist.json');
    });



/*
 * An AngularJS Service for intelligently geocoding addresses using Google's API. Makes use of
 * localStorage (via the ngStorage package) to avoid unnecessary trips to the server. Queries
 * Google's API synchronously to avoid `google.maps.GeocoderStatus.OVER_QUERY_LIMIT`.
 *
 * @author: benmj
 * @author: amir.valiani
 *
 * Original source: https://gist.github.com/benmj/6380466
 */

/*global angular: true, google: true, _ : true */



// angular.module('geocoder', ['ngStorage'])

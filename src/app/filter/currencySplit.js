angular.module('searchApp')
    .filter('currencySplit', ['$filter', function ($filter) {
        return function (amount, symbol, location, maxAmount) {

            /*
                Example of `currencySplit` filter 

                $filter('currencySplit')(amount, symbol, location, maxAmount)
                {{ amount | currencySplit : symbol : location : maxAmount }}

                Where,

                amount - REQUIRED - [TYPE]: Numeric

                symbol - REQUIRED - [TYPE]: String
                possible values are 'dollar' or 'cents', default is 'dollar'
            
                location - OPTIONAL - [TYPE]: String
                possible values are 'timeline' or 'summary', default is 'timeline'
            
                maxAmount - OPTIONAL - [TYPE]: Numeric
                maximum amount in the range to check and drop cents in account summary pane
            */

            try {

                symbol = (symbol === undefined || symbol === '') ? 'dollar' : symbol;
                location = (location === undefined || location === '') ? 'timeline' : location;
                amount = parseFloat(amount).toFixed(2);

                if (isFinite(Number(amount)) && (symbol === 'dollar' || symbol === 'cents')) {
                    var dollar = Number(amount.split('.')[0]);
                    if (symbol === 'dollar') {
                        return $filter('currency')(dollar, '', 0).replace("(", "-").replace(")", "");
                    } else if (symbol === 'cents') {
                        if (location === 'timeline') {
                            // DO not drop cents here, no matter what
                            return amount.split('.')[1];
                        } else {
                            // In Account Summary Pane - ignore cents if $ amount exceeds 6 digits
                            if (maxAmount < 100000) {
                                return amount.split('.')[1];
                            } else {
                                return '';
                            }
                        }
                    }
                } else {
                    return '';
                }
            } catch (err) {
                return '';
            }
        };
    }]);
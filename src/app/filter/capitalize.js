  // Format A String Like This By Capitalizing The First Letter Of Each Word

angular.module('searchApp')
  .filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
  })
  .filter('customCurrency', ["$filter", function ($filter) {
      return function(amount, currencySymbol){
		var currency = $filter('currency');
		if(amount.charAt(0) === "-"){
		  return currency(amount, currencySymbol).replace("(", "-").replace(")", "");
		}
		return currency(amount, currencySymbol);
	 };
  }]);

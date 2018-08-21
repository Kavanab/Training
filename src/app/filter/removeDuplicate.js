angular.module('searchApp')
  .filter('removeDup', function() {
    return function(originalArray, objKey) {

    	var trimmedArray = [];
	  	var values = [];
		  var value;

		  for(var i = 0; i < originalArray.length; i++) {
		    value = originalArray[i][objKey];

		    if(values.indexOf(value) === -1) {
		      trimmedArray.push(originalArray[i]);
		      values.push(value);
		    }
		  }

		  return trimmedArray;
      };
  });

  angular.module('searchApp')
  .filter('getSameLatLng', function() {
    return function(originalArray) {
      	var dupArr = [];
    	var trimmedArray = [];
	  	var values = [];
		var value;

		for(var i = 0; i < originalArray.length; i++) {
            // value = originalArray[i].address.latitude;
            //
            // if(values.indexOf(value) === -1) {
            //   trimmedArray.push(originalArray[i]);
            //   values.push(value);
            // }else{
            // 	dupArr.push(originalArray[i]);
            // }

            var dup = false;
            for (var k=0; k<values.length; k++) {
                if ((parseFloat(values[k].address.latitude).toFixed(5) === parseFloat(originalArray[i].address.latitude).toFixed(5)) && (parseFloat(values[k].address.longitude).toFixed(5) === parseFloat(originalArray[i].address.longitude).toFixed(5))) {
                    dup = true;
                    break;
                }
            }
            if (dup) {
                dupArr.push(originalArray[i]);
            } else {
                trimmedArray.push(originalArray[i]);
                values.push(originalArray[i]);
            }
		}
        values = null;
		 var dupArr1 =[];

		function groupBy( array , f )
		{
		  var groups = {};
		  array.forEach( function( o )
		  {
		    var group = JSON.stringify( f(o) );
		    groups[group] = groups[group] || [];
		    groups[group].push( o );
		  });
		  return Object.keys(groups).map( function( group )
		  {
		    return groups[group];
		  });
		}

		var result = groupBy(dupArr, function(item)
		{
		  return [item.address.latitude, item.address.longitude];
		});

		for(var j = 0 ;  j < trimmedArray.length ; j++){
			for(var m =0 ; m < result.length ; m ++){
				if((trimmedArray[j].address.latitude == result[m][0].address.latitude)&&(trimmedArray[j].address.longitude == result[m][0].address.longitude) ){
						dupArr.push(trimmedArray[j]);
				}
			}
		}

		var finalResult = groupBy(dupArr, function(item)
		{
		  return [item.address.latitude, item.address.longitude];
		});

    	return finalResult;
      };
  });

angular.module('searchApp')
  .filter('getUniqueLatLng', function() {
    return function(originalArray) {
      	var dupArr = [];
    	var trimmedArray = [];
	  	var values = [];
		var value;

		for(var i = 0; i < originalArray.length; i++) {
		    // value = originalArray[i].address.latitude;
		    // if(values.indexOf(value) === -1 ) {
		    //   trimmedArray.push(originalArray[i]);
		    //   values.push(value);
		    // }else{
			// 	dupArr.push(originalArray[i]);
			// }

            var dup = false;
            for (var k=0; k<values.length; k++) {
                if ((parseFloat(values[k].address.latitude).toFixed(5) === parseFloat(originalArray[i].address.latitude).toFixed(5)) && (parseFloat(values[k].address.longitude).toFixed(5) === parseFloat(originalArray[i].address.longitude).toFixed(5))) {
                    dup = true;
                    break;
                }
            }
            if (dup) {
                dupArr.push(originalArray[i]);
            } else {
                trimmedArray.push(originalArray[i]);
                values.push(originalArray[i]);
            }
		}
        values = null;
		 var dupArr1 =[];

		function groupBy( array , f )
		{
		  var groups = {};
		  array.forEach( function( o )
		  {
		    var group = JSON.stringify( f(o) );
		    groups[group] = groups[group] || [];
		    groups[group].push( o );
		  });
		  return Object.keys(groups).map( function( group )
		  {
		    return groups[group];
		  });
		}

		var result = groupBy(dupArr, function(item)
		{
		  return [item.address.latitude, item.address.longitude];
		});


			for(var m =0 ; m < result.length ; m ++){
				for(var j = 0 ;  j < trimmedArray.length ; j++){
				if((trimmedArray[j].address.latitude == result[m][0].address.latitude)&&(trimmedArray[j].address.longitude == result[m][0].address.longitude) ){
						trimmedArray.splice( j , 1);
				}
			}
		}
		return trimmedArray;
      };
  });

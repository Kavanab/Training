angular.module('searchApp')
  .filter('nameLastFirstCorrection', function() {
      return function(name) {
          if(name.indexOf(',') > 0){
             name = name.substring(name.indexOf(',')+1, name.length) + name.substring(0, name.indexOf(','));
          }
          return name;
      };
  }); 
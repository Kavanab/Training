angular.module('searchApp')
    .filter('humanizeServiceType', function() {
        return function(equipment, forCSS) {
            var serviceCategory = "";
            if (!!equipment) { 
                if ( (equipment.search(/Toter/i) > 0) || (equipment.search(/Cart/i)) > 0){
                    serviceCategory = "Curbside Trash";
                }
                if ( (equipment.search(/Recycling Toter/i) > 0) || (equipment.search(/Recycling Cart/i) > 0) ) {
                    serviceCategory = "Curbside Recycling";
                }
                if (equipment.search(/Yard/i) > 0 || equipment.search(/Dumpster/i)) {
                    if (equipment.search(/Open Top/i) < 0 && equipment.search(/Compactor/i) < 0) {
                        serviceCategory = "Dumpster";
                        if (equipment.search(/Recycling/i) > 0) {
                            serviceCategory = "Recycling Dumpster";
                        }
                    }else{
                       serviceCategory = "Rolloff Dumpster";
                        if (equipment.search(/Recycling/i) > 0) {
                            serviceCategory = "Rolloff Recycling Dumpster";
                        }
                    }
                }
            }
            if (!!forCSS) {
                serviceCategory = serviceCategory.replace(" ", "-").toLowerCase();
            }
            return serviceCategory;
        };
    });

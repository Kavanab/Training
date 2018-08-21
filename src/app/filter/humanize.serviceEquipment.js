angular.module('searchApp')
    .filter('humanizeServiceEquipment', function() {
        return function(service) {
            var equipmentName = service.equipment.name.toLowerCase();
            var finalVal ='';
            
            // things to identify curbside
            if(service.equipment.uom.toLowerCase() === 'gal'){
                finalVal = 'Curbside';
            }else if(service.enterprise_catalog.line_of_business.toLowerCase() === 'gal'){
                finalVal = 'Curbside';
            }

            // if()


            if (!!equipmentName) {
                // if (equipmentName.indexOf('recycling toter') > 0) {
                //     equipmentName = equipmentName.replace('recycle toter', 'recycle bin');
                // } else if ((equipmentName.indexOf('toter') > 0) || (equipmentName.indexOf('cart') > 0)) {
                //     equipmentName = equipmentName.replace('toter', 'trash bin');
                //     equipmentName = equipmentName.replace('cart', 'trash bin');
                // }
                // if()


                if (equipmentName.indexOf('yard') > 0) {
                    if (equipmentName.indexOf('yard waste') === -1) {
                        equipmentName = equipmentName.concat(" Dumpster");
                    }
                }

                if (equipmentName.indexOf('rel') > 0) {
                    equipmentName = equipmentName.replace("rel", "");
                    // equipmentName = equipmentName.concat(" (Rear Loaded)");
                }
                if (equipmentName.indexOf('fel') > 0) {
                    equipmentName = equipmentName.replace("fel", "");
                    // equipmentName = equipmentName.concat(" (Front Loaded)");
                }
                if (equipmentName.indexOf('s/l') > 0) {
                    equipmentName = equipmentName.replace("s/l", "");
                    // humanized = humanized.concat(" (Side Loaded)");
                }
            }
            return humanized;
        };
    })

.filter('humanizeServiceEquipment_sizeOnly', function() {
    return function(equipment) {
        // var humanized = equipment;
        // if (!!equipment) {
        //     if (equipment.indexOf('Recycling Toter') > 0) {
        //         humanized = equipment.replace('Recycling Toter', '');
        //     } else if (equipment.indexOf('Toter') > 0) {
        //         humanized = equipment.replace('Toter', '');
        //     }


        //     if (equipment.indexOf('Yard') > 0) {
        //         humanized = humanized.concat("");
        //     }

        //     if (equipment.indexOf('Recycling') > 0) {
        //         humanized = humanized.replace("Recycling", "");
        //     }
        //     if (equipment.indexOf('recycling') > 0) {
        //         humanized = humanized.replace("recycling", "");
        //     }

        //     if (equipment.indexOf('REL') > 0) {
        //         humanized = humanized.replace("REL", "");
        //         // humanized = humanized.concat(" (Rear Loaded)");
        //     } else if (equipment.indexOf('FEL') > 0) {
        //         humanized = humanized.replace("FEL", "");
        //         // humanized = humanized.concat(" (Front Loaded)");
        //     } else if (equipment.indexOf('S/L') > 0) {
        //         humanized = humanized.replace("S/L", "");
        //         // humanized = humanized.concat(" (Side Loaded)");
        //     }
        // }
        // return humanized;

    };
})

.filter('humanizeServiceEquipment_nameOnly', function() {
    return function(equipment) {
        equipment = equipment.toLowerCase();
        var humanized = equipment;
        if (!!humanized) {
            if (humanized.indexOf('recycling toter') > 0) {
                humanized = humanized.replace('recycling toter', '');
            } else if ((humanized.indexOf('toter') > 0) || (humanized.indexOf('cart') > 0)) {
                humanized = humanized.replace('toter', '');
                humanized = humanized.replace('cart', '');
            }


            if (humanized.indexOf('yard') > 0) {
                humanized = humanized.concat("");
            }

            if (humanized.indexOf('recycling') > 0) {
                humanized = humanized.replace("recycling", "");
            }
            if (humanized.indexOf('recycling') > 0) {
                humanized = humanized.replace("recycling", "");
            }

            if (humanized.indexOf('rel') > 0) {
                humanized = humanized.replace("rel", "");
                // humanized = humanized.concat(" (Rear Loaded)");
            } else if (humanized.indexOf('fel') > 0) {
                humanized = humanized.replace("fel", "");
                // humanized = humanized.concat(" (Front Loaded)");
            } else if (humanized.indexOf('s/l') > 0) {
                humanized = humanized.replace("s/l", "");
                // humanized = humanized.concat(" (Side Loaded)");
            }
        }
        return humanized;
    };
});

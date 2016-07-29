"use strict";

let toExport = {

    // Filter user data according to presence of authorization
    getUser: function(fullData, auth){
        if( auth ) return fullData;

        let toReturn = [];
        fullData.forEach((curr) => {
            let json = {
                name: curr.name
            };
            toReturn.push(json);
        });
        return toReturn;
    }

};

module.exports = toExport;
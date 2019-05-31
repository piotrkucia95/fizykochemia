const everpolate = require('everpolate');

interpolate = function(tempList, sHeatList) {
    var temps = [];
    for(var i=tempList[0]; i<tempList[tempList.length-1]; i++) {
        temps.push(i);
    }
    var heats = everpolate.linear(temps, tempList, sHeatList);
    var result = {
        tempList: temps,
        sHeatList: heats
    }
    return result;
}

calculate = function(tempList, sHeatList) {
    enthalpyList = [];
    enthalpyList[0] = tempList[0] * sHeatList[0];
    for(var i=1; i<tempList.length; i++) {
         enthalpyList[i] = enthalpyList[i-1] + ((tempList[i+1] - tempList[i]) * sHeatList[i]);
    }
    var result = {
        tempList: tempList,
        sHeatList: sHeatList,
        enthalpyList: enthalpyList
    }
    return result;
}

module.exports = {
    interpolate: interpolate,
    calculate: calculate
}
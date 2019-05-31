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
    enthalpyList[0] = (tempList[1]-tempList[0]) * ((sHeatList[0]+sHeatList[1])/2);
    for(var i=1; i<tempList.length-2; i++) {
        enthalpyList[i] = enthalpyList[i-1] + ((tempList[i+1] - tempList[i]) * ((sHeatList[i] + sHeatList[i+1])/2));
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
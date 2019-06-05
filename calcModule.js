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

countHeat = function(data, tempStart, tempFinish, heatValue, selectedFunction) {
    if(selectedFunction == 'point') {
        for(var i=0; i<data.sHeatList.length; i++) {
            if(data.tempList[i] == tempStart) 
                data.sHeatList[i] += heatValue;
        }
    } else if(selectedFunction == 'f-1') {
        var calculateFunction = linearFunction;
		var a = 0;
        var b = 5;
        var ref_diff = b - a;
        var act_diff = tempFinish - tempStart;
        var P_ref = integration(calculateFunction, a, b);
        for(var i=0; i<data.tempList.length; i++) {
            if(data.tempList[i] > tempStart && data.tempList[i] <= tempFinish) {
                var t_ref_1 = (data.tempList[i-1] - tempStart) / act_diff * ref_diff + a;
                var t_ref_2 = (data.tempList[i]-tempStart) / act_diff * ref_diff + a;
    
                var P_act = ((calculateFunction(t_ref_1) + calculateFunction(t_ref_2)) / 2) * (t_ref_2 - t_ref_1);
    
                data.sHeatList[i] = (P_act / P_ref) * heatValue;
            }
        }
    } else if(selectedFunction == 'f-2') {
        var calculateFunction = gaussFunction;
		var a = -2;
        var b = 2;
        var ref_diff = b - a;
        var act_diff = tempFinish - tempStart;
        var P_ref = integration(calculateFunction, a, b);
        for(var i=0; i<data.tempList.length; i++) {
            if(data.tempList[i] > tempStart && data.tempList[i] <= tempFinish) {
                var t_ref_1 = (data.tempList[i-1] - tempStart) / act_diff * ref_diff +a;
                var t_ref_2 = (data.tempList[i]- tempStart) / act_diff * ref_diff +a;
    
                var P_act = ((calculateFunction(t_ref_1) + calculateFunction(t_ref_2)) / 2) * (t_ref_2 - t_ref_1);
    
                data.sHeatList[i] = (P_act / P_ref) * heatValue;
            }
        }
    }
    return data;
}

integration = function(f, a, b) {
    var N = 100;
    var s,dx,i,t;

    s = 0;
    dx = (b - a) / N;
    for(i = 1; i < N; i++) 
        s += f(a + i * dx);
    
    s = (s + (f(a) + f(b)) / 2) * dx;
    return s;
}

linearFunction = function(x) {
    return x;
}

triangleFunction = function(x) {
	return -x + 10;
}

gaussFunction = function(x) {
	return Math.exp(-(x*x));
}

module.exports = {
    interpolate: interpolate,
    calculate: calculate,
    countHeat: countHeat
}
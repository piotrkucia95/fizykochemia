let target = document.documentElement;
let body = document.body;
let fileInput = $('#file')[0];

var results;
var mainChart;
var smallChart;
var addedEffects = [];

target.addEventListener('dragover', (e) => {
  e.preventDefault();
  body.classList.add('dragging');
});

target.addEventListener('dragleave', () => {
  body.classList.remove('dragging');
});

target.addEventListener('drop', (e) => {
  e.preventDefault();
  body.classList.remove('dragging');
  fileInput.files = e.dataTransfer.files;
});

sendFile = function() {
    var formData = new FormData();
    var file = $('#file')[0].files[0]
    if(!file) {
        showToast('Wczytaj plik z danymi.');
        return;
    }
    formData.append('file', file);

    $.ajax({
        type: 'POST',
        url: '/upload',
        data: formData,
        processData: false,
        contentType: false,
        success : function(data) {
            results = data;
            $('#file-upload').addClass('d-none');
            $('#page-title').addClass('d-none');
            $("#results").removeClass('d-none');
            buildLineChart("mainChartContainer", data.tempList, data.enthalpyList);
            buildLineChart("smallChartContainer",  [1, 1, 2, 3, 4, 5], [1, 0, 0, 0, 0, 0]);
        }
    });
}

buildLineChart = function(chartDivId, xValues, yValues) {
    var dataPoints = [];
    for(var i=0; i<xValues.length; i++) {
        dataPoints.push({
            x: xValues[i],
            y: yValues[i]
        });
    }
    var chart = new CanvasJS.Chart(chartDivId, {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: ''
        },
        axisY: {
            title: chartDivId == 'mainChartContainer' ? 'Entalpia [J/g]' : '',
            includeZero: false
        },
        axisX: {
            title: chartDivId == 'mainChartContainer' ? 'Temperatura [\xBAC]' : '',
        },
        data: [{        
            type: "spline",       
            dataPoints: dataPoints,
            xValueType: "number"
        }]
    });
    if(chartDivId == 'mainChartContainer') {
        mainChart = chart;
        mainChart.render();
    } else {
        smallChart = chart;
        smallChart.render();
    }
}

changeFunction = function() {
    var selectedType = document.getElementById('function-type').value;
    var xs, ys;
    var dataPoints = [];

    if(selectedType == "point") {
        xs = [0, 1, 1, 1, 2, 3, 4, 5];
        ys = [0, 0, 1, 0, 0, 0, 0, 0];
        for(var i=0; i<xs.length; i++) {
            dataPoints.push({
                x: xs[i],
                y: ys[i]
            });
        }
    } else if(selectedType == "f-1") {
        xs = [0, 1, 2, 3, 4, 5];
        for(var i=0; i<xs.length; i++) {
            dataPoints.push({
                x: xs[i],
                y: xs[i]
            });
        }
    } else if(selectedType == "f-2") {
        xs = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        for(var i=0; i<xs.length; i++) {
            dataPoints.push({
                x: xs[i],
                y: Math.exp(-(xs[i]*xs[i]))
            });
        }
    }
    smallChart.options.data[0].dataPoints = dataPoints;
    smallChart.render();
}

addHeatEffect = function() {
    var tempStart = parseFloat(document.getElementById('temp-start').value);
    var tempFinish = parseFloat(document.getElementById('temp-end').value);
    var heatValue = parseFloat(document.getElementById('heat-value').value);
    var selectedFunction = document.getElementById('function-type').value;

    if(validateHeatEffect(tempStart, tempFinish, heatValue)) return;

    addedEffects.push({
        tempStart: tempStart,
        tempFinish: tempFinish,
        heatValue: heatValue,
        chosenFunction: selectedFunction == 'point' ? 'Punktowy wzrost' : (selectedFunction == 'f-1' ? 'Funkcja 1' : 'Funkcja 2')
    });

    getCalculatedEnthalpies(results, tempStart, tempFinish, heatValue, selectedFunction);
    generateTable(addedEffects);
    clearInputs();
}

getCalculatedEnthalpies = function(data, tempStart, tempFinish, heatValue, selectedFunction) {
    $.ajax({
        type: 'POST',
        url: '/calculate',
        data: {
            'data': JSON.stringify(data),
            'tempStart': tempStart,
            'tempFinish': tempFinish,
            'heatValue': heatValue,
            'selectedFunction': selectedFunction
        },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success : function(data) {
            results = data;
            var dataPoints = [];
            for(var i=0; i<data.tempList.length; i++) {
                dataPoints.push({
                    x: data.tempList[i],
                    y: data.enthalpyList[i]
                });
            }
            mainChart.options.data.push({        
                type: "spline",       
                dataPoints: dataPoints,
                xValueType: "number"
            });
            mainChart.render();
        }
    });
}

generateTable = function(effects) {
    if($('#added-effects').hasClass('d-none')) $('#added-effects').removeClass('d-none');
    var row;
    var tableHtml = 
        '<table class="table">' +
        '<thead>' +
            '<tr>' +
            '<td scope="col">#</td>' +
            '<td scope="col">Temp. pocz. [&deg;C]</td>' +
            '<td scope="col">Temp. końc. [&deg;C]</td>' +
            '<td scope="col">Ciepło [J/g]</td>' +
            '<td scope="col">Typ funkcji</td>' +
            '</tr>' +
        '</thead>' +
        '<tbody>';
    for(var i=0; i<effects.length; i++) {
        row = 
        '<tr>' +
            '<td scope="row">' + (i+1) + '</td>' +
            '<td>' + effects[i].tempStart + '</td>' +
            '<td>' + effects[i].tempFinish + '</td>' +
            '<td>' + effects[i].heatValue + '</td>' +
            '<td>' + effects[i].chosenFunction + '</td>' +
        '</tr>';
        tableHtml += row;
    }
    tableHtml += '</tbody></table>';
    $('#effects-table').html(tableHtml);
}

validateHeatEffect = function(tStart, tFinish, heatValue) {
    var returnFlag = false;

    if(!tStart || !tFinish || !heatValue) {
        showToast('Wprowadź wszystkie parametry efektu cieplnego.');
        returnFlag = true;
    } else if(tStart > tFinish) {
        showToast('Temperatura początkowa nie może być wyższa niż temperatura końcowa.');
        returnFlag = true;
    } else if(tStart < results.tempList[0]) {
        showToast('Wprowadzona temperatura początkowa jest zbyt niska');
        returnFlag = true;
    } else if(tStart > results.tempList[results.tempList.length-1]) {
        showToast('Wprowadzona temperatura początkowa jest zbyt wysoka.');
        returnFlag = true;
    } else if(tFinish < results.tempList[0]) {
        showToast('Wprowadzona temperatura końcowa jest zbyt niska.');
        returnFlag = true;
    } else if(tFinish > results.tempList[results.tempList.length-1]) {
        showToast('Wprowadzona temperatura końcowa jest zbyt wysoka.');
        returnFlag = true;
    }

    if(!returnFlag) {
        for(var effect of addedEffects) {
            if((tStart >= effect.tempStart && tStart <= effect.tempFinish) ||
                (tFinish <= effect.tempFinish && tFinish >= effect.tempStart)) {
                    showToast('Wprowadzony przedział pokrywa się z jednym z wcześniej dodanych efektów.');
                    returnFlag = true;
            } 
        }
    }
    return returnFlag;
}

clearInputs = function() {
    document.getElementById('temp-start').value = '';
    document.getElementById('temp-end').value = '';
    document.getElementById('heat-value').value = '';
    document.getElementById('function-type').value = 'point';
    changeFunction();
}

showToast = function(toastMessage) {
    $("#snackbar").html(toastMessage).addClass('show');;
    setTimeout(function() {  
        $("#snackbar").removeClass('show');
    }, 2000);
}
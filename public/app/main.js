let target = document.documentElement;
let body = document.body;
let fileInput = $('#file')[0];

var results;

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
    formData.append('file', $('#file')[0].files[0]);

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
    console.log(xValues);
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
        axisY:{
            includeZero: false
        },
        data: [{        
            type: "spline",       
            dataPoints: dataPoints,
            xValueType: "number"
        }]
    });
    chart.render();
}

changeFunction = function() {
    var selectedType = document.getElementById('function-type').value;
    if(selectedType != 'custom') {
        $('#custom-function-input').addClass('d-none');
        $('#smallChartContainer').removeClass('d-none');
    }

    if(selectedType == "point") 
        buildLineChart("smallChartContainer",  [1, 1, 2, 3, 4, 5], [1, 0, 0, 0, 0, 0]);
    else if (selectedType == "custom") {
        $('#smallChartContainer').addClass('d-none');
        $('#custom-function-input').removeClass('d-none');
    }
}

addHeatEffect = function() {
    var tempStart = parseFloat(document.getElementById('temp-start').value);
    var tempFinish = parseFloat(document.getElementById('temp-end').value);
    var heatValue = parseFloat(document.getElementById('heat-value').value);
    var selectedFunction = document.getElementById('function-type').value;

    var heatEffect = {
        tempList: results.tempList,
        sHeatList: results.sHeatList,
        enthalpyList: []
    };

    if(selectedFunction == 'point') {
        for(var i=0; i<results.enthalpyList.length; i++) {
            if(results.enthalpyList[i] < tempStart) heatEffect.enthalpyList.push(results.enthalpyList[i]);
            else heatEffect.enthalpyList.push(results.enthalpyList[i] + heatValue);
        }
    }

    buildLineChart('mainChartContainer', heatEffect.tempList, heatEffect.enthalpyList);
}
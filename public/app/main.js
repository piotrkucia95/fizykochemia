let target = document.documentElement;
let body = document.body;
let fileInput = $('#file')[0];

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
            $('#file-upload').addClass('d-none');
            $('#page-title').addClass('d-none');
            $("#results").removeClass('d-none');
            buildLineChart(data.tempList, data.enthalpyList);
        }
    });
}

buildLineChart = function(xValues, yValues) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: 'Entalpia',
                data: yValues
            }]
        },
        options: {
            responsive: true
        }
    });
}

toggleCustomFunction = function() {
    if(document.getElementById('custom-function').checked) 
        $('#custom-function-input').removeAttr('disabled');
    else 
        $('#custom-function-input').attr('disabled', 'disabled');
}
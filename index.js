const express = require('express');
const upload = require('express-fileupload');
var fs = require('fs');

const app = express();

var resultList = {
    "temps": [],
    "heats": [],
    "entalpia": []
};

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(upload());

app.post('/upload', (req, res) => {
    if(req.files) {
        var file = req.files.file;
        var txtString = file.data.toString('utf8');
        var tempHeatPairs = txtString.split('\r\n');
        var resultList = {
            "temps": [],
            "heats": [],
            "entalpia": []
        };
        for(var i=5; i<tempHeatPairs.length-1; i++) {
            var tempHeatPairArray = tempHeatPairs[i].split(' ');
            resultList.temps.push(parseFloat(tempHeatPairArray[0]));
            resultList.heats.push(parseFloat(tempHeatPairArray[1]));
        }
        resultList.entalpia[0] = resultList.temps[0] * resultList.heats[0];
        for(var i=1; i<resultList.temps.length; i++) {
            resultList.entalpia[i] = resultList.entalpia[i-1] + resultList.heats[i] * (resultList.temps[i] - resultList.temps[i-1]);
        }
        res.send(resultList);
    }
});

app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
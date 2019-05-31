const express = require('express');
const upload = require('express-fileupload');
const calcModule = require('./calcModule.js');
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
        var temps = [];
        var heats = [];
        for(var i=5; i<tempHeatPairs.length-1; i++) {
            var tempHeatPairArray = tempHeatPairs[i].split(' ');
            temps.push(parseFloat(tempHeatPairArray[0]));
            heats.push(parseFloat(tempHeatPairArray[1]));
        }
        var interpolatedValues = calcModule.interpolate(temps, heats);
        var data = calcModule.calculate(interpolatedValues.tempList, interpolatedValues.sHeatList);
        res.send(data);
    }
});

app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
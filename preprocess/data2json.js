const fs = require('fs-sync');
const csv2json = require('csvtojson');

let gdpFile = '../data/csv/gpd_data.csv';
let co2File = '../data/csv/co2_data.csv';

// Helper function
let convertCSV2JSON = function (inputFileName, outputFileName, idIdentifier, callback) {
    if (fs.exists(inputFileName)) {

        var jsondata = {data: [], ids: {}};
        
        csv2json().fromFile(inputFileName)
        .on('json', (jsonRowObj)=>{
            jsondata.data.push(jsonRowObj);
            jsondata.ids[jsonRowObj[idIdentifier]] = jsondata.data.length - 1;
        }).on('done', ()=>{
            if (outputFileName) {
                fs.write(outputFileName, JSON.stringify(jsondata));
            }
        })
    }
}

// Convert to JSON and save
let gdpData;
let co2Data;
convertCSV2JSON(gdpFile, '../data/json/gdp_data.json', "Country Code");
convertCSV2JSON(co2File, '../data/json/co2_data.json', "Country Code");
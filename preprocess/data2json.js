const fs = require('fs-sync');
const csv2json = require('csvtojson');

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

// Input file locations
let gdpFile = '../data/csv/gpd_data.csv';
let co2File = '../data/csv/co2_data.csv';
let popFile = '../data/csv/population_data.csv';
let climateFile = '../data/csv/climate_change_data.csv';

// Output file locations
let gdpFileOut = '../data/json/gdp_data.json';
let co2FileOut = '../data/json/co2_data.json';
let popFileOut = '../data/json/population_data.json';
let climateFileOut = '../data/json/climate_change_data.json';

// Convert to JSON and save
convertCSV2JSON(gdpFile, gdpFileOut, "Country Code");
convertCSV2JSON(co2File, co2FileOut, "Country Code");
convertCSV2JSON(popFile, popFileOut, "Country Code");
convertCSV2JSON(climateFile, climateFileOut, "Country Code");

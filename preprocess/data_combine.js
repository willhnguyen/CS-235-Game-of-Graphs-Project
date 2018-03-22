let fs = require("fs-sync");

// Read in json files
let gdpData = JSON.parse(fs.read('../data/json/gdp_data.json').toString());
let co2Data = JSON.parse(fs.read('../data/json/co2_data.json').toString());

// Combine data
let combinedData = {data: [], ids: {}};
for (let id in gdpData.ids) {
    let gdpID = gdpData.ids[id];
    let co2ID = co2Data.ids[id];
    let gdpRow = gdpData.data[gdpID];
    let co2Row = co2Data.data[gdpID];

    let rowObject = {
        'Country Name': gdpRow['Country Name'],
        'Country Code': gdpRow['Country Code'],
        'GDP Data': {},
        'CO2 Data': {}
    };

    for (let i = 1960; i < 2017; ++i) {
        if (i in gdpRow) {
            if (gdpRow[i]) {
                rowObject['GDP Data'][i] = parseFloat(gdpRow[i]);
            }
        }
        if (i in co2Row) {
            if (co2Row[i]) {
                rowObject['CO2 Data'][i] = parseFloat(co2Row[i]);
            }
        }
    }

    combinedData.data.push(rowObject);
    combinedData.ids[id] = combinedData.data.length - 1;
}

fs.write('../data/json/gdp_co2_combined_data.json', JSON.stringify(combinedData));
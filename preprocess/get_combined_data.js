let fs = require('fs-sync');

// Read in JSON files
let countriesList = JSON.parse(fs.read('../data/json/countries.json').toString());
let gdpData = JSON.parse(fs.read('../data/json/gdp.json').toString());
let co2Data = JSON.parse(fs.read('../data/json/co2.json').toString());
let popData = JSON.parse(fs.read('../data/json/population.json').toString());
let climateList = JSON.parse(fs.read('../data/json/climate_change_list.json').toString());
let climateData = [];
for (let indicator of climateList.data) {
    let indicatorData = JSON.parse(fs.read('../data/json/climate-' + indicator.id + '.json'));
    indicatorData["id"] = indicator.id;
    indicatorData["name"] = indicator.name;
    climateData.push(indicatorData);
}

// Combine Data
let combinedData = {data: [], ids: {}};
for (let id in countriesList.data) {
    // Create a row object for each country
    // Fill it with the data
    let rowObject = {
        'Country Name': countriesList.data[id],
        'Country Code': id,
        'GDP Data': {},
        'CO2 Data': {},
        'Population Data': {}
    }

    // Initialize the row object with the climate data
    for (let indicator of climateList.data) {
        rowObject[indicator.name] = {}
    }

    // Populate data objects with data
    for (let i = 1960; i < 2017; ++i) {
        // GDP Data
        if (gdpData.data[id] && i in gdpData.data[id]["GDP"]) {
            rowObject['GDP Data'][i] = parseFloat(gdpData.data[id]["GDP"][i]);
        }
        // CO2 Data
        if (co2Data.data[id] && i in co2Data.data[id]["CO2"]) {
            rowObject['CO2 Data'][i] = parseFloat(co2Data.data[id]["CO2"][i]);
        }
        // Population Data
        if (popData.data[id] &&i in popData.data[id]["Population"]) {
            rowObject['Population Data'][i] = parseFloat(popData.data[id]["Population"][i]);
        }
        // Climate Change Data
        for (let indicatorData of climateData) {
            let indicatorName = indicatorData["name"];
            if (indicatorData.data[id] && indicatorData.data[id][indicatorName] && i in indicatorData.data[id][indicatorName]) {
                rowObject[indicatorName][i] = indicatorData.data[id][indicatorName][i];
            }
        }
    }

    // Add row to combinedData object
    combinedData.data.push(rowObject);
    combinedData.ids[id] = combinedData.data.length - 1;
}

fs.write('../data/json/combined_data.json', JSON.stringify(combinedData));
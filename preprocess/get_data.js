/**
 * Fetches all the data desired from the World Bank REST API.
 * 
 * @author William Nguyen
 * @date Mar 22, 2018
 */
const http = require("http");
const fs = require("fs");

/*************************************************************************
 * HELPER FUNCTIONS
 *************************************************************************/
function APIget(path, callback) {
    http.get(path, (res) => {
        let body = "";
        res.on("data", (data) => {
            body += data;
        });
        res.on("end", () => {
            callback(body);
        });
    })
}

function saveToFile(data, fileName) {
    if (fs.exists(fileName)) {
        console.log("Error: " + fileName + " exists. Please delete to save new data instance.");
    } else {
        fs.writeFile(fileName, data, (err) => {
            if (err) {
                console.log("Error: fs error " + err);
            } else {
                console.log("The file, " + fileName + ", was saved successfully.");
            }
        });
    }
}

function APISave(path, fileName, callback) {

    // Check that file exists
    let flag_fileExists = fs.existsSync(fileName);

    // Check whether file is outdated
    let fileOutdated = false;
    if (flag_fileExists) {
        let filedata = JSON.parse(fs.readFileSync(fileName));
        let fileLastUpdated = new Date(filedata.lastupdated);
        let dateNow = new Date(Date.now());

        if (fileLastUpdated.getMonth() < dateNow.getMonth()) {
            fileOutdated = true;
        }
    }

    // If the file doesn't exist or is outdated, then do the API call and save a new file
    if (!flag_fileExists || fileOutdated) {
        APIget(path, (data) => {
            let currentDate = new Date(Date.now());

            let outputData = callback(data);
            let outputJSON = {
                lastupdated: currentDate.toUTCString(),
                // dataName: dataName,
                data: outputData
            }

            saveToFile(JSON.stringify(outputJSON), fileName);
        });
    } else {
        console.log("The file " + fileName + " already exists.");
        return JSON.parse(fs.readFileSync(fileName));
    }
    return true;
}

function getIndicator(indicatorAbbr, indicatorName, fileName) {
    let apiPath = "http://api.worldbank.org/v2/countries/all/indicators/" + indicatorAbbr + "?per_page=20000&format=json";

    APISave(apiPath, fileName, (data) => {
        let dataAsJSON = JSON.parse(data);
        let outputJSON = {};

        // Add data to outputJSON
        dataAsJSON[1].forEach(element => {
            let country = element.countryiso3code;
            let name = element.country.value;
            let year = element.date;
            let value = element.value;

            // Ignore country groups which have no iso3code value
            if (country == "" || value == null || value == undefined || value == "") {
                return;
            }

            // Create a new key for each country
            if (!(country in outputJSON)) {
                outputJSON[country] = {
                    name: name
                };
                outputJSON[country][indicatorName] = {};
            }
            outputJSON[country][indicatorName][year] = value;
        });

        return outputJSON;
    })
}

// Fetch indicator data as suggested from the topicData list
function fetchTopicIndicators(topicData, topicName, filePath) {

    let i = 0;
    let timeout_multiplier = 1000; // 1 second

    for (let d of topicData) {

        let fileName = filePath + topicName + "-" + d.id + ".json";

        // Check if file exists
        let flag_fileExists = fs.existsSync(fileName);

        // Check whether file is outdated
        let fileOutdated = false;
        if (flag_fileExists) {
            let filedata = JSON.parse(fs.readFileSync(fileName));
            let fileLastUpdated = new Date(filedata.lastupdated);
            let dateNow = new Date(Date.now());

            if (fileLastUpdated.getMonth() < dateNow.getMonth()) {
                fileOutdated = true;
            }
        }

        // If the file doesn't exist or is outdated, then do the API call and save a new file
        if (!flag_fileExists || fileOutdated) {
            // Space out API call to prevent spamming the server
            setTimeout(function () {
                let indicator = d;
                let indicatorFileName = fileName;
                return function () {
                    // console.log("Saving..." + indicatorFileName)
                    getIndicator(indicator.id, indicator.name, indicatorFileName);
                };
            }(), i * timeout_multiplier);
            ++i;
        } else {
            console.log("The file " + fileName + " already exists.");
        }


    }
}

/*************************************************************************
 * API Calls
 *************************************************************************/
// Save Countries List
APISave("http://api.worldbank.org/v2/countries/all?per_page=500&page=1&format=json", "../data/json/countries.json", (data) => {
    let dataAsJSON = JSON.parse(data);
    let outputJSON = {};

    for (let country of dataAsJSON[1]) {
        let name = country.name;
        let id = country.id;
        outputJSON[id] = name;
    }

    return outputJSON;
});

// Save Population Data
getIndicator("SP.POP.TOTL", "Population", "../data/json/population.json");

// Save CO2 Data
getIndicator("EN.ATM.CO2E.KT", "CO2", "../data/json/co2.json");

// Save GDP Data
// NY.GDP.PCAP.KD.ZG
getIndicator("NY.GDP.PCAP.CD", "GDP", "../data/json/gdp.json");

// Save Climate Change Data
let climate_change_topic_path = "http://api.worldbank.org/v2/topics/19/indicators?per_page=100&format=json";
let save_return = APISave(climate_change_topic_path, "../data/json/climate_change_list.json", (data) => {
    let dataAsJSON = JSON.parse(data);
    let outputList = [];

    // Fetch all indicators in the climate change list
    fetchTopicIndicators(dataAsJSON[1], "climate", "../data/json/");

    // Create list of data obtained
    for (let d of dataAsJSON[1]) {
        outputList.push({
            id: d.id,
            name: d.name
        });
    }

    return outputList;
});

// If the file already exists, the file's contents are returned as a JSON object
if (typeof (save_return) == "object") {
    fetchTopicIndicators(save_return.data, "climate", "../data/json/");
}
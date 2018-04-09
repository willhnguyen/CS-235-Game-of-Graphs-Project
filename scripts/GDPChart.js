/**
 * GDPChart class for chart generation and updating.
 *
 * This GDPChart.js file provides the class and methods necessary
 * to visualize the GDP vs. CO2 dataset provided by World Bank.
 *
 * @link   http://github.com/willhnguyen/CS-235-Game-of-Graphs-Project/
 *
 * @author Jisha Pillai (JP), Raksha Sunil (RS), William Nguyen (WN)
 */

/**
 * Set the desired data location and the id of the chart element to update.
 */
let /** !String */ dataFilePath = './data/json/combined_data.json';
let chartElementID = 'gdp-chart';
let chartElement = document.getElementById(chartElementID);


/**
 * Mouse events to detect mouse drags.
 * 
 * Needed to fix a bug in zooming where the bubbles are deselected upon mouseup.
 * @author William Nguyen
 * @date April 7, 2018
 */
let mouseFlags = {
    mouseDownFlag: false,
    dragFlag: false
}
let _ = function (mouseFlags) {
    document.addEventListener('mousedown', function (mouseFlags) {
        return function () {
            mouseFlags.mouseDownFlag = true;
            document.onmousemove = function () {
                if (mouseFlags.mouseDownFlag)
                    mouseFlags.dragFlag = true;
            }
        };
    }(mouseFlags));
    document.addEventListener('mouseup', function (mouseFlags) {
        return function (event) {
            let mouseX = event.clientX;
            let mouseY = event.clientY;

            let rect = chartElement.getBoundingClientRect();

            // Check if in rect
            let inRect = (mouseY < rect.top + rect.height && mouseY > rect.top) && (mouseX < rect.left + rect.width && mouseX > rect.left);
            if (!inRect) {
                document.onmousemove = null;
                mouseFlags.dragFlag = false;
                mouseFlags.mouseDownFlag = false;
            }
        };
    }(mouseFlags));
}(mouseFlags);

/**
 * The main class to fetch data and update the bubble chart visualization.
 */
class GDPChart {
    /**
     * GDPChart constructor.
     *
     * Initializes the chart object state variables.
     *
     * @author  William Nguyen
     * @date March 30, 2018
     */
    constructor(chartElementID) {
        //        this.population;
        this.data = {};
        //        this.populationData = {};
        this.chartElement = document.getElementById(chartElementID);
        this.chartjsObj = new Chart(this.chartElement, {});

        this.yearToDisplay = 2014;
        this.countrySelectedID = undefined;
        document.getElementById('chart-info').innerHTML = "<p>Please select a country's bubble to the left to see relevant data.</p>";
        this.changeColorMode("ygb");
    }

    /**
     * Fetch visualization data.
     *
     * Obtain the data necessary for visualization by using a HTTP GET request.
     *
     * @author  William Nguyen
     * @date March 30, 2018
     */
    getData() {
        // Create AJAX request object to fetch JSON data
        let httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
            alert('There was a problem fetching the data to populate the graph.');
            return false;
        }

        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    // Store data for the object
                    this.data = JSON.parse(httpRequest.responseText);
                    this.generateChart();
                } else {
                    alert('The request did not return success code 200.');
                }
            }
        };
        httpRequest.open('GET', dataFilePath);
        httpRequest.send();
    }
    // /**
    //  * Fetch population data.
    //  *
    //  * Obtain the data necessary for visualization by using a HTTP GET request.
    //  *
    //  * @author  Jisha Pillai (editor)
    //  * @date April 3, 2018
    //  */
    // getPopulationData() {
    //     // Create AJAX request object to fetch JSON data
    //     let httpRequest = new XMLHttpRequest();
    //     if (!httpRequest) {
    //         alert ('There was a problem fetching the data to populate the graph.');
    //         return false;
    //     }

    //     httpRequest.onreadystatechange = ()=>{
    //         if (httpRequest.readyState === XMLHttpRequest.DONE) {
    //             if (httpRequest.status === 200) {
    //                 // Store data for the object
    //                 this.populationData = JSON.parse(httpRequest.responseText);
    //             } else {
    //                 alert ('The request did not return success code 200.');
    //             }
    //         }
    //     };
    //     httpRequest.open('GET', dataFilePath1);
    //     httpRequest.send();
    // }

    /**
     * Generate chart with obtained data.
     *
     * Creates a new chart object and provides it data to visualize. This should only be called once.
     *
     * @author  Jisha Pillai
     * @date March 25, 2018
     * @author  William Nguyen (editor)
     * @date March 30, 2018
     * @author  Raksha Sunil (editor)
     * @date April 4, 2018
     */
    generateChart() {
        // Set up the dataset to be passed to chartjs
        let chartData = this.data.data.map((val, idx, arr) => {
            return {
                label: val["Country Name"],
                backgroundColor: this.getCountryColor(val["Country Code"], this.yearToDisplay),
                borderColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 0,
                data: [{
                    x: val["GDP Data"][this.yearToDisplay],
                    y: val["CO2 Data"][this.yearToDisplay],
                    r: Math.log(this.getCountryPopulation(val["Country Code"], this.yearToDisplay)) / 2,
                    "Country Code": val["Country Code"]
                }]
            }

        });

        let chartOptions = {
            title: {
                text: 'Climate Change Data Visualization',
                display: 'true'
            },
            // onHover: this.onHoverEvent(this),
            onClick: this.onClickEvent(this),
            tooltips: {
                position: 'nearest',
                intersect: true,
                //backgroundColor: 'rgba(0, 0, 255, 0)',
                titleFontColor: 'white',
                bodyFontColor: 'white',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 1.2,
                callbacks: {
                    beforeLabel: this.getChartInfo(),
                    label: this.updateTooltipLabel()
                }
            },
            elements: {
                point: {
                    //hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'rgba(125,200,220, 1)',
                    hoverBorderWidth: 3
                }
            },
            legend: {
                display: false,
            },
            scaleBeginAtZero: 'false',
            responsive: 'true',
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    position: 'bottom',
                    gridLines: {
                        zeroLineColor: 'rgba(0,0,0,1)'
                    },
                    scaleLabel: {
                        display: 'true',
                        labelString: 'GDP (USD per Capita)'
                    },
                    ticks: {
                        autoSkip: false,
                        min: 50,
                        max: 2e5,
                        callback: this.defineLogTickLabels
                    },
                    afterBuildTicks: this.defineLogTicks(50, 2e5),
                    type: 'logarithmic'
                }],
                yAxes: [{
                    position: 'left',
                    gridLines: {
                        zeroLineColor: 'rgba(0,0,0,1)'
                    },
                    scaleLabel: {
                        display: 'true',
                        labelString: 'CO2 Emissions (Kt)'
                    },
                    ticks: {
                        autoSkip: false,
                        min: 5,
                        max: 2e7,
                        callback: this.defineLogTickLabels
                    },
                    afterBuildTicks: this.defineLogTicks(5, 2e7),
                    type: 'logarithmic'
                }]
            },
            pan: {
                // Boolean to enable panning
                enabled: true,

                // Panning directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow panning in the y direction
                mode: 'xy',
                limits: {
                    xmin: 1e-4,
                    ymin: -50,
                    ymax: 10
                },
                xScale0: {
                    max: 1e4
                }
            },
            // Container for zoom options
            zoom: {
                // Boolean to enable zooming
                enabled: true,
                drag: true,

                // Zooming directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'xy',
                sensitivity: 10,
                limits: {
                    max: 10,
                    min: 0.5
                }
            }
        }

        document.onkeydown = function (evt) {
            evt = evt || window.event;
            gdpChart.checkKeyInput(evt);
        };

        delete this['chartjsObj'];
        this.chartjsObj = new Chart(this.chartElement, {
            type: 'bubble',
            data: {
                datasets: chartData
            },
            options: chartOptions,
        })
    }

    /**
     * Check for keyboard input
     *
     *ESC Key - Reloads the chart
     *
     * @author Jisha Pillai
     * @date April 8, 2018
     */
    checkKeyInput(event) {
        switch (event.keyCode) {
            case 27:
                //                this.chartjsObj.resetZoom();
                this.resetZoom();
                break;
            case 37: // Left Arrow Key
            case 65:
                this.getNextClosestElement("left");
                break;
            case 38: // Up Arrow Key
            case 87:
                this.getNextClosestElement("up");
                break;
            case 39: // Right Arrow Key
            case 68:
                this.getNextClosestElement("right");
                break;
            case 40: // Down Arrow Key
            case 83:
                this.getNextClosestElement("down");
                break;
        }
    }

    /**
     * Outputs a filtered list of tick values for logarithmic scale.
     *
     * This custom function filters out unnecessary tick labels for the logarithmic scale. The
     * labels left are the staring tick label, ending tick label, and all tick labels beginning
     * with either a '5' or a '1'.
     *
     * @param {number} tick The value of the current tick
     * @param {number} index The index of the current tick in the [number] parameter named ticks
     * @param {[number]} ticks The list of tick values shown
     * @author William Nguyen
     * @date April 4, 2018
     */
    defineLogTickLabels(tick, index, ticks) {
        // Get Most Significant digit
        const mostSigDigit = tick.toLocaleString()[0];

        // Keep tick label if the tick is for value 0
        if (tick.toLocaleString() === "0") {
            return "0";
        }
        // Keep tick label if the tick is the beginning or last tick value
        else if (index === ticks.length - 1 || index === 0) {
            return tick.toLocaleString();
        }
        // Remove labels for ticks beginning with 1 or 5
        else if (mostSigDigit !== "5" && mostSigDigit !== "1") {
            return "";
        }

        return tick.toLocaleString();
    }

    /**
     * Returns a closure that calculates the ticks marks to show on the chart.
     *
     * Although Chart.js already determines tick marks, the tick marks moves when the chart updates.
     * This custom closure sets the tick marks to a defined set of ticks and the ticks don't move anymore.
     *
     * @param {number} minTick The value of the maxTick to use
     * @param {number} maxTick The value of the minTick to use
     * @author William Nguyen
     * @date April 4, 2018
     */
    defineLogTicks(minTick, maxTick) {
        return (scale) => {
            let newTicks = [];

            for (let i = minTick, scale = Math.pow(10, Math.floor(Math.log10(minTick))); i <= maxTick;) {
                if (i.toString()[0] === '5' || i.toString()[0] === '1') {
                    newTicks.push(i);
                }
                i += scale;
                if (i === 10 * scale) {
                    scale *= 10;
                }
            }
            if (maxTick !== newTicks[newTicks.length - 1]) {
                newTicks.push(maxTick);
            }

            scale.ticks = newTicks;

            return;
        }
    }


    /**
     * Update the visualization chart
     *
     * After the data has been updated, this method will tell the chart to update the visualization.
     * This method does not alter the data itself. Data changes must be made outside this function.
     *
     * @author  William Nguyen
     * @date March 30, 2018
     */
    updateChart() {
        this.chartjsObj.update();
    }

    /**
     * Update the visualization chart by a selected year.
     *
     * @param {number} year An integer value denoting the desired year to visualize.
     * @author  William Nguyen
     * @date March 30, 2018
     * @author  Jisha Pillai (editor)
     * @date April 3, 2018
     */
    updateChartByYear(year) {
        // Make sure that year is an integer value, not a float.
        year = parseInt(year);

        // Update old data with new data
        this.chartjsObj.data.datasets.forEach((val, idx, arr) => {
            val.data[0].x = this.data.data[idx]["GDP Data"][year];
            val.data[0].y = this.data.data[idx]["CO2 Data"][year];
            val.data[0].r = Math.log(this.getCountryPopulation(this.data.data[idx]["Country Code"], year)) / 2;
            val.backgroundColor = this.getCountryColor(this.data.data[idx]["Country Code"], year);
            //console.log(this.data.data[idx]["Country Code"]);
            //val.data[0].r = 10;
        })
        this.yearToDisplay = year;

        this.updateChart();
    }

    /**
     * Populate the sidebar information panel with country info.
     *
     * @param {string} countryID The 3-letter id of a country
     * @author Jisha Pillai
     * @date April 4, 2018
     * @author Raksha Sunil (edited)
     * @date April 4, 2018
     * @author William Nguyen (edited)
     * @date April 8, 2018
     */
    showCountryInfo(countryID) {
        // Don't need to update if the country is already shown
        if (countryID === this.countryInfoShown) {
            return;
        }
        this.countryInfoShown = countryID;
        let chartInfoDiv = document.getElementById('chart-info');

        // If there is no countryID given, then set the view to a default help text
        if (countryID === undefined) {
            // Update information to be displayed
            chartInfoDiv.innerHTML = "<p>Please select a country's bubble to the left to see relevant data.</p>";
        }

        // Define data to display
        const dataToDisplay = [{
            label: 'GDP',
            key: 'GDP Data'
        }, {
            label: 'CO<sub>2</sub> (Kt)',
            key: 'CO2 Data'
        }, {
            label: 'Population',
            key: 'Population Data'
        }, {
            label: 'Agricultural land (sq. km)',
            key: 'Agricultural land (sq. km)'
        }, {
            label: 'Energy use (kg of oil per capita)',
            key: 'Energy use (kg of oil equivalent per capita)'
        }, {
            label: 'Forest area (sq. km)',
            key: 'Forest area (sq. km)'
        }, {
            label: 'Cereal yield (kg per hectare)',
            key: 'Cereal yield (kg per hectare)'
        }, {
            label: 'Water Accessibility (% of population)',
            key: 'Improved water source (% of population with access)'
        }];

        // Defined helper function to make adding new elements easier
        function addNewLi(label, info) {
            return `<li> ${label}: <span>${info.toLocaleString()}</li></span>`;
        }

        // Generate the HTML to display
        let HTMLarray = [];
        if (this.data.data[this.data.ids[countryID]] !== undefined) {
            HTMLarray.push('<h1>' + this.data.data[this.data.ids[countryID]]["Country Name"] + '</h1>');
        } else {
            return;
        }

        for (let dataInfo of dataToDisplay) {
            let foundInfo = this.getCountryInfo(countryID, this.yearToDisplay, dataInfo.key);
            if (foundInfo !== undefined) {
                HTMLarray.push(addNewLi(dataInfo.label, foundInfo));
            }
        }

        // Update information to be displayed
        chartInfoDiv.innerHTML = HTMLarray.join("");
    }

    /**
     * Bubble-hover tooltip callback to populate its text.
     *
     * @param {object} t A single data point in the chart object's dataset
     * @param {object} d The entire dataset stored in the chart object
     * @author  Jisha Pillai
     * @date March 25, 2018
     * @author  Raksha Sunil (editor)
     * @date April 7, 2018
     */
    updateTooltipLabel() {
        let that = this;

        /**
         * Closure to encapsulate this with variable that.
         */
        return function (t, d) {
            // Show the information of identified country
            let countryCode = that.chartjsObj.data.datasets[t.datasetIndex].data[0]["Country Code"];
            let GDPVal = that.getCountryGDP(countryCode, that.yearToDisplay);
            let CO2Val = that.getCountryCO2(countryCode, that.yearToDisplay);
            let PopVal = that.getCountryPopulation(countryCode, that.yearToDisplay);

            let info = [
                d.datasets[t.datasetIndex].label,
                '    GDP: ' + GDPVal.toFixed(5) + ',',
                '    CO2: ' + CO2Val.toFixed(5) + ',',
                '    Population: ' + PopVal
            ];
            return info;
        }

    };

    // /**
    //  * Callback for when the chart registers a hover event.
    //  * 
    //  * @author William Nguyen
    //  * @date March 31, 2018
    //  */
    // onHoverEvent(context) {
    //     let that = context;

    //     /**
    //      * Closure to provide context to GDPChart object as variable 'that'
    //      * @param {Object} _ Mouse click information
    //      * @param {Object} chartEl A list of objects clicked with respect to Chartjs
    //      */
    //     return (_, chartEl)=>{
    //         if (chartEl.length > 0) {
    //             // An element has been clicked.
    //             let elementID = chartEl[0]._datasetIndex;

    //             // // Example of using it to extract dataset information
    //             // console.log("HOVER!", chartEl);
    //             // console.log(that.chartjsObj.data.datasets[elementID]);
    //         } else {
    //             // Chart background hovered
    //             that.showCountryInfo(that.countrySelectedID);
    //         }
    //     }
    // }

    /**
     * Callback for when the chart registers a click event.
     * 
     * Implemented code: If a click event registers in a bubble, then update
     * chart info box with country data.
     * 
     * @author William Nguyen
     * @date March 31, 2018
     */
    onClickEvent(context) {
        let that = context;
        let aMouseFlagsObj = mouseFlags;

        /**
         * Closure to provide context to GDPChart object as variable 'that'
         * @param {Object} _ Mouse click information
         * @param {Object} chartEl A list of objects clicked with respect to Chartjs
         */
        return (_, chartEl) => {
            if (!(aMouseFlagsObj.dragFlag)) {
                if (chartEl.length > 0) {
                    // An element has been clicked.
                    let elementID = chartEl[0]._datasetIndex;

                    // Set the selected element
                    that.countryDeselected();
                    that.countrySelected(that.chartjsObj.data.datasets[elementID].data[0]["Country Code"], elementID);
                } else {
                    // Selected chart background
                    that.countryDeselected();
                }
            }

            // Reset drag flag
            aMouseFlagsObj.dragFlag = false;
            aMouseFlagsObj.mouseDownFlag = false;
            chartElement.onmousemove = null;

        };
    }

    /**
     * Callback for when a bubble has been selected.
     *
     * @param {string} countryID The 3-letter id of a country
     *
     * @author William Nguyen
     * @date April 8, 2018
     */
    countrySelected(countryID, datasetID) {


        // Save selection state and update information displayed in the sidebar
        this.countrySelectedID = countryID;
        this.showCountryInfo(countryID);

        // Change bubble's stroke size
        if (datasetID !== undefined) {
            let countryID = this.chartjsObj.data.datasets[datasetID].data[0]["Country Code"];
            let bubble = this.chartjsObj.data.datasets[datasetID];

            // Save the selected ID
            this.countrySelectedDatasetID = datasetID;

            // Update bubble style
            // this.chartjsObj.data.datasets[datasetID].borderColor = 'rgba(0, 0, 0, 1)';
            // this.chartjsObj.data.datasets[datasetID].borderWidth = 3;
            this.chartjsObj.data.datasets[datasetID].backgroundColor = 'rgba(255, 0, 0, 0.75)';

            // Reflect changes to chart
            this.updateChart();
        }
    }

    /**
     * Callback for when a bubble has been deselected.
     *
     * @author William Nguyen
     * @date April 8, 2018
     */
    countryDeselected() {
        // Reset countrySelected state and show general chart info
        this.countrySelectedID = undefined;
        this.showCountryInfo(undefined);

        // Change bubble's stroke size
        if (this.countrySelectedDatasetID !== undefined) {
            let datasetID = this.countrySelectedDatasetID;
            let countryID = this.chartjsObj.data.datasets[datasetID].data[0]["Country Code"];
            let bubble = this.chartjsObj.data.datasets[datasetID];

            // Reset the selected ID
            this.countrySelectedDatasetID = undefined;

            // Update bubble style
            // bubble.borderColor = 'rgba(0, 0, 0, 0)';
            // bubble.borderWidth = 0;
            bubble.backgroundColor = this.getCountryColor(countryID, this.yearToDisplay);

            // Reflect changes to chart
            this.updateChart();
        }

    }

    //    /**
    //     * Callback for when a bubble is hovered-over
    //     *
    //     * @param {string} countryID The 3-letter id of a country
    //     */
    //    countryHovered(countryID) {
    //        // Update information displayed in the sidebar
    //        //showCountryInfo(countryID);
    //    }

    /**
     * Provides data on a particular data unit of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @param {string} key The name of the data desired
     * @author William Nguyen
     * @date April 8, 2018
     */
    getCountryInfo(countryID, year, key) {
        let countryIndex = this.data.ids[countryID];
        if (this.data.data[countryIndex] !== undefined) {
            return this.data.data[countryIndex][key][year];
        }
        return false;
    }

    /**
     * Provides population data of a country.
     *
     * @param {string} countryID
     * @param {number} year An integer value denoting the desired year to visualize
     * @author  Jisha Pillai
     * @date April 3, 2018
     */
    getCountryPopulation(countryID, year) {
        let countryIndex = this.data.ids[countryID];
        if (this.data.data[countryIndex] !== undefined) {
            return this.data.data[countryIndex]['Population Data'][year];
        }
        return false;
    }

    /**
     * Provides GDP data of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @author William Nguyen
     * @date April 8, 2018
     */
    getCountryGDP(countryID, year) {
        return this.getCountryInfo(countryID, year, 'GDP Data');
    }

    /**
     * Provides CO2 data of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @author William Nguyen
     * @date April 8, 2018
     */
    getCountryCO2(countryID, year) {
        return this.getCountryInfo(countryID, year, 'CO2 Data');
    }

    /**
     * Updates the visulization to a desired color mode.
     *
     * Color modes change the visualization color schemes to provide more
     * customizability and accessibility for the colorblind.
     *
     * @param {string} mode Name of color mode desired
     * @author William Nguyen
     * @date April 3, 2018
     */
    changeColorMode(mode) {
        // Only change the gradient if the desired color mode is different than the one currently applied
        if (mode === this.colorMode) {
            return;
        }
        this.colorMode = mode;

        // Update graph with new colors
        this.chartjsObj.data.datasets.forEach((val, idx, arr) => {
            val.backgroundColor = this.getCountryColor(this.data.data[idx]["Country Code"], this.yearToDisplay);
        })
        this.updateChart()
    }

    /**
     * Provides a color to visualize the country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @author William Nguyen
     * @date April 3, 2018
     */
    getCountryColor(countryID, year, key = 'Forest area (sq. km)') {
        // Get a country value
        const countryIndex = this.data.ids[countryID];
        let value = false;
        if (this.data.data[countryIndex][key] !== undefined) {
            value = this.data.data[countryIndex][key][year];
        }

        // If the country is selected, then the color is just red
        if (this.countrySelectedID === countryID) {
            return 'rgba(255, 0, 0, 1)';
        }

        // Interpolate color value based on the data value
        const data_min = 0;
        const data_max = Math.log(1e7);
        if (value !== false && value !== undefined) {
            return this.interpolateColor(value, data_min, data_max);
        } else {
            return 'rgba(85, 85, 85, 0.5)';
        }
    }

    /**
     * Interpolate the color of a given value.
     *
     * Based on the min and max values of the dataset, the value should be interpolated accordingly.
     *
     * @param {number} value The value with which to dtermine an interpolated color value.
     * @param {number} data_min The minimum to use to calculate the interpolation.
     * @param {number} data_max The maximum to use to calculate the interpolation.
     * @author William Nguyen
     * @date April 3, 2018
     */
    interpolateColor(value, data_min, data_max) {
        let gradientColors = this.colorGradient;
        let gradientColorType = gradientColors[0];
        let gradient = [];

        const gamma = 2.2; // Standard for sRGB displays
        const gamma_complement = 1 / gamma;

        // Define a default gradient in case fallback is required
        gradient = [
            [0, 85, 85, 85],
            [1, 85, 85, 85]
        ];
        if (gradientColorType === 'hsl') {
            gradient = [
                [0, 0, 0, 50],
                [1, 0, 0, 50]
            ];
        }

        // Default color is a gray color (will stay this color if data is undefined for datapoint)
        let color = [85, 85, 85];
        let a = 0.5;
        if (gradientColorType === 'hsl') {
            color = [0, 0, 50];
        }

        // Interpolate color value based on the data value
        if (value !== false && value !== undefined) {
            value = Math.log(value);
            let value_percentage = (value - data_min) / (data_max - data_min);

            // Get the colors to interpolate between
            for (let i = 2; i < gradientColors.length; ++i) {
                if (value_percentage >= gradientColors[i - 1][0] && value_percentage < gradientColors[i][0]) {
                    gradient = [gradientColors[i - 1], gradientColors[i]];
                    break;
                }
            }

            // Normalize value_percentage based on gradient color range
            value_percentage = (value_percentage - gradient[0][0]) / (gradient[1][0] - gradient[0][0]);
            let value_percentage_complement = 1.0 - value_percentage;

            // Calculate color by interpolation
            if (gradientColors[0] === "hsl") {
                color = color.map((_, colorId) => {
                    return value_percentage * gradient[1][colorId + 1] + value_percentage_complement * gradient[0][colorId + 1];
                });
            } else if (gradientColors[0] === "rgb") {
                // For RGB, values are sqrt values of actual light intensities
                // Need to square then square-root to provide more consistent light intensity gradients
                color = color.map((_, colorId) => {
                    return Math.pow(
                        value_percentage * Math.pow(gradient[1][colorId + 1], gamma) + value_percentage_complement * Math.pow(gradient[0][colorId + 1], gamma),
                        gamma_complement
                    );
                });
            }

            // Clip to proper ranges and round to int value
            color = color.map((val) => Math.max(val, 0));
            if (gradientColors[0] == "rgb") {
                color = color.map((val) => {
                    return Math.min(val, 255);
                })
            } else if (gradientColors[0] == "hsl") {
                color[0] = Math.min(color[0], 360);
                color[1] = Math.min(color[1], 100);
                color[2] = Math.min(color[2], 100);
            }
            color = color.map((val) => Math.round(val));
        }


        // Return the color as a string
        if (gradientColors[0] === "rgb") {
            return 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ',' + a.toString() + ')';
        } else if (gradientColors[0] === "hsl") {
            return 'hsla(' + color[0].toString() + ',' + color[1].toString() + '%,' + color[2].toString() + '%,' + a.toString() + ')';
        }
    }

    /**
     * Gets the color gradient for visualization;
     * 
     * @author William Nguyen
     * @date April 3, 2018
     */
    get colorGradient() {
        // Gradients are listed as an array of colors defined as [percentage, r, g, b[, a]] where a is optional.
        const allGradients = {
            default: ["rgb", [0, 255, 0, 0],
                [1, 0, 0, 255]
            ],
            white2red: ["rgb", [0, 255, 255, 255],
                [1, 255, 0, 0]
            ],
            white2blue: ["rgb", [0, 255, 255, 255],
                [1, 0, 0, 255]
            ],
            primaries: ["rgb", [0, 255, 0, 0],
                [0.5, 255, 255, 0],
                [1, 0, 0, 255]
            ],
            primariesHSL: ["hsl", [0, 0, 100, 50],
                [1, 240, 100, 50]
            ],
            ygb: ["hsl", [0, 59, 81, 69],
                [1, 207, 28, 19]
            ],
            heat: ["hsl", [0, 60, 100, 85],
                [0.83, 0, 100, 77],
                [0.83, 360, 100, 77],
                [1, 348, 100, 37]
            ],
            bw: ["rgb", [0, 0, 0, 0],
                [1, 255, 255, 255]
            ]
        }


        // Check that colorMode is defined and is a valid colorMode
        if (this.colorMode === undefined || !(this.colorMode in allGradients)) {
            this.colorMode = "default";
        }

        // Return the color gradient
        return allGradients[this.colorMode];
    }
    /**
     * Populate Country info on the right side of the chart on bubble mouse-hover.
     *
     * @param {object} t A single data point in the chart object's dataset
     * @param {object} d The entire dataset stored in the chart object
     * @author  Jisha Pillai
     * @date April 4, 2018
     * @author  Raksha Sunil (edited)
     * @date April 7, 2018
     * @author  William Nguyen (edited) Moved majority of code into this.showCountryInfo(countryID) method
     * @date April 8, 2018
     */
    getChartInfo() {
        let that = this;

        // Closure to encapuslate reference to class object
        return function (t, d) {
            let pointIndex = t.datasetIndex;
            let countryCode = d.datasets[pointIndex].data[0]["Country Code"];

            that.showCountryInfo(countryCode);
        }
    }

    // /**
    //  * Updates the visualization's axis scales.
    //  *
    //  * Axis scales can either be 'category', 'linear', 'logarithmic', or 'time'.
    //  * Certain axis scales can better visualize a dataset or clear away
    //  * visualization clutter.
    //  *
    //  * @param {string} axis Either "x" or "y" for the axis chosen
    //  * @param {string} mode Name of the axis range type
    //  * @author William Nguyen
    //  * @date April 7, 2018
    //  */
    // axisMode(axis, mode) {
    //     // Check mode
    //     mode = mode.toLowerCase();
    //     if (mode !== "logarithmic" && mode !== "linear")  {
    //         console.log('Error: The axis modes can only either be "linear" or "logarithmic".');
    //         return;
    //     }

    //     let chartOptions = this.chartjsObj.options.scales;
    //     let axisDesired = undefined;

    //     // Get the desired axis' properties
    //     if (axisDesired === "x") {
    //         axis = chartOptions.xAxes[0];
    //     } else if (axis === "y") {
    //         axisDesired = chartOptions.yAxes[0];
    //     }

    //     // Update desired axis' properties
    //     if (axisDesired !== undefined) {
    //         axisDesired.type = mode;
    //         this.updateChart();
    //     }
    // }

    /**
     * If an element is selected, then allow the user to move to nearby bubbles using
     * the arrow keys.
     *
     * @param {string} mode The direction to move
     * @author William Nguyen
     * @date April 8, 2018
     */
    getNextClosestElement(mode) {
        // If no element selected, then can't switch.
        if (this.countrySelectedID === undefined) {
            return;
        }

        // Get the current country's info
        let currBubble = this.chartjsObj.data.datasets[this.countrySelectedDatasetID];
        let currX = Math.log(currBubble.data[0].x);
        let currY = Math.log(currBubble.data[0].y);
        let currCode = currBubble.data[0]['Country Code'];

        // Helper functions
        function distance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function normalize(x, y) {
            let dist = distance(0, 0, x, y);
            return [x / dist, y / dist];
        }

        function getAngle(x1, y1, x2, y2) {
            let point = [x2 - x1, y2 - y1];
            point = normalize(point[0], point[1]);
            let angleRad = Math.atan2(point[1], point[0]);

            return angleRad;
        }

        // Process all points to get distance and angle from point of interest
        let distances = this.chartjsObj.data.datasets.map((el, index) => {
            let elX = Math.log(el.data[0].x);
            let elY = Math.log(el.data[0].y);
            let elCode = el.data[0]['Country Code'];

            let dist = distance(currX, currY, elX, elY);
            let angle = getAngle(currX, currY, elX, elY) * 180 / Math.PI;

            return {
                dist: dist,
                angle: angle,
                "Country Code": elCode,
                id: index,
                points: [currX, currY, elX, elY],
                orig: [el.data[0].x, el.data[0].y],
                norm: normalize(elX - currX, elY - currY)
            }
        });

        // Filter the points of interests by direction
        distances = distances.filter((el, index) => {
            // Ignore if the bubble represents the current country
            if (el.id === currCode) {
                return false;
            }

            // Filter by direction
            if (mode === "up") {
                return ((el.angle > 45) && (el.angle <= 135));
            } else if (mode === "down") {
                return ((el.angle <= -45) && (el.angle > -135));
            } else if (mode === "left") {
                return (((el.angle > 135) && (el.angle <= 180)) ||
                    ((el.angle <= -135) && (el.angle >= -180)));
            } else if (mode === "right") {
                return ((el.angle <= 45) && (el.angle > -45));
            }
        });

        // If there are no elements available, then don't do anything
        if (distances.length === 0) {
            return;
        }

        let angleOfInterest = 0;
        if (mode === "up") {
            angleOfInterest = 90;
        } else if (mode === "down") {
            angleOfInterest = -90;
        } else if (mode === "right") {
            angleOfInterest = 0;
        } else if (mode === "left") {
            angleOfInterest = 180;
        }

        // Get the shortest distance point closest to angle of interest
        let closestPoint = distances.reduce((a, b) => {
            //            // Determine best angle value to use
            //            let aAngle = a.angle;
            //            let bAngle = b.angle;
            //            if (mode === "left") {
            //                // Make entirely positive
            //                if (a.angle < 0) {
            //                    aAngle += 360;
            //                }
            //                if (b.angle < 0) {
            //                    bAngle += 360;
            //                }
            //            }
            //            
            //            // close-near, close-far, nonclose-near, nonclose-far
            //            let aIsCloserAngle = Math.abs(aAngle - angleOfInterest) < Math.abs(bAngle - angleOfInterest);
            //            let aIsNearer = Math.abs(a.dist) < Math.abs(b.dist);
            //            
            //            if (aIsNearer && aIsCloserAngle) {
            //                return a;
            //            } else if (aIsNearer) {
            //                return a;
            //            } else if (aIsCloserAngle) {
            //                return a;
            //            }
            //            return b;

            if (a.dist < b.dist) {
                return a;
            }
            return b;
        });

        // Select the shortest distance point
        this.countryDeselected();
        this.countrySelected(closestPoint["Country Code"], closestPoint.id);
    }

    // /**
    //  * Draws chart legends to better understand data.
    //  *
    //  * For bubble charts, the data can be up to 4-dimensional (i.e. x-axis, y-axis,
    //  * radius, and color). At the very least, radius and color legends should be
    //  * displayed.
    //  */
    // drawLegends() {
    // }

    /**
     * Resets the zoom back to the original zoom values desired.
     * 
     * @author William Nguyen
     * @date April 8, 2018
     */
    resetZoom() {
        //        this.chartjsObj.options.scales.xAxes[0].ticks.min = 100000;
        this.chartjsObj.options.scales.xAxes = [{
            position: 'bottom',
            gridLines: {
                zeroLineColor: 'rgba(0,0,0,1)'
            },
            scaleLabel: {
                display: 'true',
                labelString: 'GDP (USD per Capita)'
            },
            ticks: {
                autoSkip: false,
                min: 50,
                max: 2e5,
                callback: this.defineLogTickLabels
            },
            afterBuildTicks: this.defineLogTicks(50, 2e5),
            type: 'logarithmic'
        }];

        this.updateChart();
    }

}
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
//let dataFilePath = '../data/json/gdp_co2_combined_data.json';
let /** !String */ dataFilePath = 'https://raw.githubusercontent.com/willhnguyen/CS-235-Game-of-Graphs-Project/master/data/json/gdp_co2_combined_data.json';
let /** !String */ dataFilePath1 = 'https://raw.githubusercontent.com/willhnguyen/CS-235-Game-of-Graphs-Project/master/data/json/population_data.json';
let chartElementID = 'gdp-chart';


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
     */
    constructor(chartElementID) {
        this.population;
        this.data = {};
        this.populationData = {};
        this.chartElement = document.getElementById(chartElementID);
        this.chartjsObj = new Chart(this.chartElement, {});

        this.yearToDisplay = 2014;
        this.countrySelected = 0;
    }

    /**
     * Fetch visualization data.
     *
     * Obtain the data necessary for visualization by using a HTTP GET request.
     *
     * @author  William Nguyen
     */
    getData() {
        // Create AJAX request object to fetch JSON data
        let httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
            alert ('There was a problem fetching the data to populate the graph.');
            return false;
        }

        httpRequest.onreadystatechange = ()=>{
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    // Store data for the object
                    this.data = JSON.parse(httpRequest.responseText);
                    this.generateChart();
                } else {
                    alert ('The request did not return success code 200.');
                }
            }
        };
        httpRequest.open('GET', dataFilePath);
        httpRequest.send();
    }
    /**
     * Fetch population data.
     *
     * Obtain the data necessary for visualization by using a HTTP GET request.
     *
     * @author  William Nguyen
     * @author  Jisha Pillai (editor)
     */
    getPopulationData() {
        // Create AJAX request object to fetch JSON data
        let httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
            alert ('There was a problem fetching the data to populate the graph.');
            return false;
        }

        httpRequest.onreadystatechange = ()=>{
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    // Store data for the object
                    this.populationData = JSON.parse(httpRequest.responseText);
                } else {
                    alert ('The request did not return success code 200.');
                }
            }
        };
        httpRequest.open('GET', dataFilePath1);
        httpRequest.send();
    }

    /**
     * Generate chart with obtained data.
     *
     * Creates a new chart object and provides it data to visualize. This should only be called once.
     *
     * @author  Jisha Pillai
     * @author  William Nguyen (editor)
     * @author  Raksha Sunil (editor)
     */
    generateChart() {
        // Set up the dataset to be passed to chartjs
        let chartData = this.data.data.map((val, idx, arr)=>{
            return {
                label: val["Country Name"],
                backgroundColor: this.getCountryColor(val["Country Code"], this.yearToDisplay),
                data: [
                    {
                        x: val["GDP Data"][this.yearToDisplay],
                        y: val["CO2 Data"][this.yearToDisplay],
                        r: Math.log(this.getCountryPopulation(val["Country Code"], this.yearToDisplay))/2,
                        population: this.getCountryPopulation(val["Country Code"], this.yearToDisplay),
                        agriculturalLand: val["Agricultural land (sq. km)"][this.yearToDisplay],
                        methaneEmmisions: val["Methane emissions (kt of CO2 equivalent)"][this.yearToDisplay],
                        otherGasEmmissions: val["Other greenhouse gas emissions (% change from 1990)"][this.yearToDisplay],
                        oilUsage: val["Energy use (kg of oil equivalent per capita)"][this.yearToDisplay],
                        powerConsumption: val["Electric power consumption (kWh per capita)"][this.yearToDisplay],
                        forestArea: val["Forest area (sq. km)"][this.yearToDisplay],
                        cerealYield: val["Cereal yield (kg per hectare)"][this.yearToDisplay],
                        waterAccess: val["Improved water source (% of population with access)"][this.yearToDisplay]
                    }
                 ]
             }

        });


        let chartOptions = {
            title: {
                text: 'Climate Change Data Visualization',
                display: 'true'
            },
            onHover: this.onHoverEvent(),
            onClick: this.onClickEvent(),
            tooltips: {
                       position: 'nearest',
                       intersect: true,
                       //backgroundColor: 'rgba(0, 0, 255, 0)',
						           titleFontColor: 'white',
						           bodyFontColor: 'white',
						           borderColor: 'rgba(0,0,0,1)',
						           borderWidth: 1.2,
                       callbacks: {
                                  beforeLabel : this.getChartInfo,
                                  label: this.updateTooltipLabel
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
                xAxes: [
                    {
                        position: 'bottom',
                        gridLines: {
                            zeroLineColor: 'rgba(0,0,0,1)'
                        },
                        scaleLabel: {
                            display: 'true',
                            labelString: 'GDP'
                        },
                        ticks: {
                            autoSkip: false,
//                            beginAtZero: true,
                            min: 50,
                            max: 2e5,
                            // maxRotation: 90,
                            // minRotation: 90,
                            callback: this.defineLogTickLabels
                        },
                        afterBuildTicks: this.defineLogTicks(50, 2e5),
                        type: 'logarithmic'
                    }
                ],
                yAxes: [
                    {
                        position: 'left',
                        gridLines: {
                            zeroLineColor: 'rgba(0,0,0,1)'
                        },
                        scaleLabel: {
                            display: 'true',
                            labelString: 'CO2 Emissions'
                        },
                        ticks: {
                            autoSkip: false,
//                            beginAtZero: true,
                            min: 5,
                            max: 2e7,
                            callback: this.defineLogTickLabels
                        },
                        afterBuildTicks: this.defineLogTicks(5, 2e7),
                        type: 'logarithmic'
                    }
                ]
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





        this.chartjsObj = new Chart(this.chartElement, {
            type: 'bubble',
            data: {
                datasets: chartData
            },
            options: chartOptions,
        })
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
     */
    defineLogTicks(minTick, maxTick) {
        return (scale)=>{
            let newTicks = [];

            for (let i = minTick, scale = Math.pow(10, Math.floor(Math.log10(minTick))); i <= maxTick; ) {
                if (i.toString()[0] === '5' || i.toString()[0] === '1') {
                    newTicks.push(i);
                }
                i += scale;
                if (i === 10 * scale) {
                    scale *= 10;
                }
            }
            if (maxTick !== newTicks[newTicks.length-1]) {
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
     */
    updateChart() {
        this.chartjsObj.update();
    }



    /**
     * Update the visualization chart by a selected year.
     *
     * @param {number} year An integer value denoting the desired year to visualize.
     * @author  William Nguyen
     * @author  Jisha Pillai (editor)
     */
    updateChartByYear(year) {
        // Make sure that year is an integer value, not a float.
        year = parseInt(year);

        // Update old data with new data
        this.chartjsObj.data.datasets.forEach((val, idx, arr)=> {
            val.data[0].x = this.data.data[idx]["GDP Data"][year];
            val.data[0].y = this.data.data[idx]["CO2 Data"][year];
            val.data[0].r = Math.log(this.getCountryPopulation(this.data.data[idx]["Country Code"], year))/2;
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
     */
//    showCountryInfo(countryID) {
//        let chartInfoDiv = document.getElementById('chart-info');
//
//        // Update information to be displayed
//        chartInfoDiv.innerHTML = chartInfoDiv.innerHTML;
//    }

    /**
     * Bubble-hover tooltip callback to populate its text.
     *
     * @param {object} t A single data point in the chart object's dataset
     * @param {object} d The entire dataset stored in the chart object
     * @author  Jisha Pillai
     * @author  Raksha Sunil (editor)
     */
    updateTooltipLabel(t, d){
        // Show the information of identified country
        //console.log(d.datasets[t.datasetIndex]);

        var population = d.datasets[t.datasetIndex].data[0].population;

        return (d.datasets[t.datasetIndex].label  +' /n GDP: ' + t.xLabel.toFixed(5) + ', /n CO2: ' + t.yLabel.toFixed(5) + ', /n Population: ' + population).split("/n");

    };

    /**
     * Callback for when the chart registers a hover event.
     */
    onHoverEvent() {
        //let that = this;

        /**
         * Closure to provide context to GDPChart object as variable 'that'
         * @param {Object} _ Mouse click information
         * @param {Object} chartEl A list of objects clicked with respect to Chartjs
         */
        return (_, chartEl)=>{
            if (chartEl.length > 0) {
                // An element has been clicked.
                let elementID = chartEl[0]._datasetIndex;

                // // Example of using it to extract dataset information
                // console.log("HOVER!", chartEl);
                // console.log(that.chartjsObj.data.datasets[elementID]);
            } else {
                // Chart background hovered
            }
        }
    }

    /**
     * Callback for when the chart registers a click event.
     */
    onClickEvent() {
        let that = this;

        /**
         * Closure to provide context to GDPChart object as variable 'that'
         * @param {Object} _ Mouse click information
         * @param {Object} chartEl A list of objects clicked with respect to Chartjs
         */
        return (_, chartEl)=>{

            if (chartEl.length > 0) {
                // An element has been clicked.
                let elementID = chartEl[0]._datasetIndex;

                // // Example of using it to extract dataset information
                // console.log("CLICK!", chartEl);
                // console.log(that.chartjsObj.data.datasets[elementID]);
            } else {
                // Selected chart background
            }
        };
    }

    /**
     * Callback for when a bubble has been selected.
     *
     * @param {string} countryID The 3-letter id of a country
     */
    countrySelected(countryID) {
        // Save selection state and update information displayed in the sidebar
        console.log(countryID);
        this.countrySelected = countryID;
        //showCountryInfo(countryID);
    }

    /**
     * Callback for when a bubble has been deselected.
     */
    countryDeselected() {
        // Reset countrySelected state and show general chart info
        this.countrySelected = -1;
        showDefaultInfo();
    }

    /**
     * Callback for when a bubble is hovered-over
     *
     * @param {string} countryID The 3-letter id of a country
     */
    countryHovered(countryID) {
        // Update information displayed in the sidebar
        //showCountryInfo(countryID);
    }

    /**
     * Provides a color to visualize the country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @author William Nguyen
     */
    getCountryColor(countryID, year, key='GDP Data') {
        // Get a country value
        const countryIndex = this.data.ids[countryID];
        let value = false;
        if (this.data.data[countryIndex][key] !== undefined) {
            value = this.data.data[countryIndex][key][year];
        }

        // Interpolate color value based on the data value
        const data_min = 0;
        const data_max = Math.log(2e5);
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
     */
    interpolateColor(value, data_min, data_max) {
        let gradientColors = this.colorGradient;
        let gradientColorType = gradientColors[0];
        let gradient = [];
        
        const gamma = 2.2; // Standard for sRGB displays
        const gamma_complement = 1 / gamma;
        
        // Define a default gradient in case fallback is required
        gradient = [[0, 85, 85, 85], [1, 85, 85, 85]];
        if (gradientColorType === 'hsl') {
            gradient = [[0, 0, 0, 50], [1, 0, 0, 50]];
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
                if (value_percentage >= gradientColors[i-1][0] && value_percentage < gradientColors[i][0]) {
                    gradient = [gradientColors[i-1], gradientColors[i]];
                    break;
                }
            }

            // Normalize value_percentage based on gradient color range
            value_percentage = (value_percentage - gradient[0][0]) / (gradient[1][0] - gradient[0][0]);
            let value_percentage_complement = 1.0 - value_percentage;

            // Calculate color by interpolation
            if (gradientColors[0] === "hsl") {
                color = color.map((_, colorId)=>{
                    return value_percentage * gradient[1][colorId+1] + value_percentage_complement * gradient[0][colorId+1];
                });
            } else if (gradientColors[0] === "rgb") {
                // For RGB, values are sqrt values of actual light intensities
                // Need to square then square-root to provide more consistent light intensity gradients
                color = color.map((_, colorId)=>{
                    return Math.pow(
                        value_percentage * Math.pow(gradient[1][colorId+1], gamma) + value_percentage_complement * Math.pow(gradient[0][colorId+1], gamma),
                        gamma_complement
                    );
                });
            }

            // Clip to proper ranges and round to int value
            color = color.map((val)=>Math.max(val, 0));
            if (gradientColors[0] == "rgb") {
                color = color.map((val)=>{
                    return Math.min(val, 255);
                })
            } else if (gradientColors[0] == "hsl") {
                color[0] = Math.min(color[0], 360);
                color[1] = Math.min(color[1], 100);
                color[2] = Math.min(color[2], 100);
            }
            color = color.map((val)=>Math.round(val));
        }


        // Return the color as a string
        if (gradientColors[0] === "rgb") {
            return 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ',' + a.toString() + ')';
        } else if (gradientColors[0] === "hsl") {
            return 'hsla(' + color[0].toString() + ',' + color[1].toString() + '%,' + color[2].toString() + '%,' + a.toString() + ')';
        }
    }

    /**
     * Provides population data of a country.
     *
     * @param {string} countryID
     * @param {number} year An integer value denoting the desired year to visualize
     * @author  Jisha Pillai
     */
    getCountryPopulation(countryID, year) {
        let countryIndex = this.populationData.ids[countryID];
        if (this.populationData.data[countryIndex] !== undefined) {
            return this.populationData.data[countryIndex][year];
        }
        return false;
    }

    /**
     * Provides GDP data of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     */
    getCountryGDP(countryID, year) {
    }

    /**
     * Provides CO2 data of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     */
    getCountryCO2(countryID, year) {
    }

    /**
     * Provides data on a particular data unit of a country.
     *
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     * @param {string} key The name of the data desired
     */
    getCountryInfo(countryID, year, key) {
    }

    /**
     * Updates the visulization to a desired color mode.
     *
     * Color modes change the visualization color schemes to provide more
     * customizability and accessibility for the colorblind.
     *
     * @param {string} mode Name of color mode desired
     */
    changeColorMode(mode) {
        // Only change the gradient if the desired color mode is different than the one currently applied
        if (mode === this.colorMode) {
            return;
        }
        this.colorMode = mode;

        // Update graph with new colors
        this.chartjsObj.data.datasets.forEach((val, idx, arr)=> {
            val.backgroundColor = this.getCountryColor(this.data.data[idx]["Country Code"], this.yearToDisplay);
        })
        this.updateChart()
    }

    /**
     * Gets the color gradient for visualization;
     */
    get colorGradient() {
        // Gradients are listed as an array of colors defined as [percentage, r, g, b[, a]] where a is optional.
        const allGradients = {
            default: ["rgb", [0, 255, 0, 0], [1, 0, 0, 255]],
            white2red: ["rgb", [0, 255, 255, 255], [1, 255, 0, 0]],
            white2blue: ["rgb", [0, 255, 255, 255], [1, 0, 0, 255]],
            primaries: ["rgb", [0, 255, 0, 0], [0.5, 255, 255, 0], [1, 0, 0, 255]],
            primariesHSL: ["hsl", [0, 0, 100, 50], [1, 240, 100, 50]],
            ygb: ["hsl", [0, 59, 81, 69], [1, 207, 28, 19]],
            heat: ["hsl", [0, 60, 100, 85], [0.83, 0, 100, 77], [0.83, 360, 100, 77], [1, 348, 100, 37]],
            bw: ["rgb", [0, 0, 0, 0], [1, 255, 255, 255]]
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
     * @author  Raksha Sunil (editor)
     */
    getChartInfo(t, d){
        var text = [];
        var population = d.datasets[t.datasetIndex].data[0].population;
        var agriculturalLand = d.datasets[t.datasetIndex].data[0].agriculturalLand;
        var methaneEmmisions = (d.datasets[t.datasetIndex].data[0].methaneEmmisions);
        var otherGasEmmissions = (d.datasets[t.datasetIndex].data[0].otherGasEmmissions);
        var oilUsage = (d.datasets[t.datasetIndex].data[0].oilUsage);
        var powerConsumption = (d.datasets[t.datasetIndex].data[0].powerConsumption);
        var forestArea = (d.datasets[t.datasetIndex].data[0].forestArea);
        var cerealYield = (d.datasets[t.datasetIndex].data[0].cerealYield);
        var waterAccess = (d.datasets[t.datasetIndex].data[0].waterAccess);
        text.push('<h1>'+d.datasets[t.datasetIndex].label+'</h1>');
        text.push('<li>'+'GDP: <span>' + t.xLabel.toFixed(2) + '</span></li>');
        text.push('<li>'+'CO2(kt): <span>' + t.yLabel.toFixed(2) +'</span></li>');
        text.push('<li>'+'Population: <span>' + population +'</span></li>');
        if(agriculturalLand!= undefined){
          text.push('<li>'+'Agricultural land(sq. km): <span>' + agriculturalLand.toFixed(2) +'</span></li>');
        }
        if(methaneEmmisions!= undefined){
            text.push('<li>'+'Methane emissions: <span>' + methaneEmmisions.toFixed(2) +'</span></li>');
        }
        if(otherGasEmmissions!= undefined){
            text.push('<li>'+'Other greenhouse gas emissions: <span>' + otherGasEmmissions.toFixed(2) +'</span></li>');
        }
        if(oilUsage!= undefined){
            text.push('<li>'+'Energy use(kg oil per capita): <span>' + oilUsage.toFixed(2) +'</span></li>');
        }
        if(forestArea!= undefined){
          text.push('<li>'+'Forest Area(sq. km): <span>' + forestArea.toFixed(2) +'</span></li>');
        }
        if(cerealYield!= undefined){
          text.push('<li>'+'Cereal Yield(kg per hectare): <span>' + cerealYield.toFixed(2) +'</span></li>');
        }
        if(waterAccess!= undefined){
          text.push('<li>'+'Water Accessibility(%): <span>' + waterAccess.toFixed(2) +'</span></li>');
        }

        document.getElementById('chart-info').innerHTML = text.join("");

    }





    /**
     * Updates the visualization's axis scales.
     *
     * Axis scales can either be 'category', 'linear', 'logarithmic', or 'time'.
     * Certain axis scales can better visualize a dataset or clear away
     * visualization clutter.
     *
     * @param {string} mode Name of the axis range type
     */
    axisMode(mode) {
    }

    /**
     * Draws chart legends to better understand data.
     *
     * For bubble charts, the data can be up to 4-dimensional (i.e. x-axis, y-axis,
     * radius, and color). At the very least, radius and color legends should be
     * displayed.
     */
    drawLegends() {
    }

    /**
     * EXTRA: Filter the data to be visualized.
     *
     * Filter the data by some desired value. This should mainly be used for categorization.
     * Filtering by value range can also be possible but may require additional parameters.
     *
     * @param {string} key The key that should be used to filter the data
     * @param {*} filterValue The value that should be used to filter the data. Can
     *                        be an array of values.
     */
    filterData(key, filterValue) {
    }

    /**
     * EXTRA: Zooms the chart based on a user's axis range selection.
     *
     * The user can select a range on the chart. On mouse press up, the visualization
     * should update by zooming into the selected axes. This can also be used for
     * mouse scroll events.
     *
     * @param {string} axis The axis to zoom. Either 'x' or 'y'
     * @param {Array} range The range zoom into provided as a 2-tuple. (e.g. [0, 100])
     */
    zoomSelection(axis, range) {
    }

    /**
     * EXTRA: Export the chart as an image for the user to save.
     */
    exportChartAsImage() {
    }





}

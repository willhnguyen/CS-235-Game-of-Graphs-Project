/**
 * GDPChart class for chart generation and updating.
 * 
 * This GDPChart.js file provides the class and methods necessary
 * to visualize the GDP vs. CO2 dataset provided by World Bank.
 * 
 * @link   http://github.com/willhnguyen/CS-235-Game-of-Graphs-Project/
 * 
 * @author JP, RS, William Nguyen (WN)
 */

/**
 * Set the desired data location and the id of the chart element to update.
 */
// let dataFilePath = '../data/json/combined_data.json';
let /** !String */ dataFilePath = 'https://raw.githubusercontent.com/willhnguyen/CS-235-Game-of-Graphs-Project/master/data/json/combined_data.json';
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
        this.data = {};
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
     * Generate chart with obtained data.
     * 
     * Creates a new chart object and provides it data to visualize. This should only be called once.
     * 
     * @author  Jisha Pillai
     * @author  William Nguyen (editor)
     */
    generateChart() {
        // Set up the dataset to be passed to chartjs
        let chartData = this.data.data.map((val, idx, arr)=>{
            return {
                label: val["Country Name"],
                backgroundColor: "rgb(255, 0, 0)",
                data: [
                    {
                        x: val["GDP Data"][this.yearToDisplay],
                        y: val["CO2 Data"][this.yearToDisplay],
                        r: 10
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
                mode: 'point',
                callbacks: {
                    label: this.updateTooltipLabel
                }
            },
            legend: {
                display: false
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
                        }
                    }
                ]
            }
        }


        this.chartjsObj = new Chart(this.chartElement, {
            type: 'bubble',
            data: {
                datasets: chartData
            },
            options: chartOptions
        })
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
     */
    updateChartByYear(year) {
        // Make sure that year is an integer value, not a float.
        year = parseInt(year);

        // Update old data with new data
        this.chartjsObj.data.datasets.forEach((val, idx, arr)=> {
            val.data[0].x = this.data.data[idx]["GDP Data"][year];
            val.data[0].y = this.data.data[idx]["CO2 Data"][year];
            val.data[0].r = 10;
        })

        this.updateChart();
    }

    /**
     * Populate the sidebar information panel with country info.
     * 
     * @param {string} countryID The 3-letter id of a country
     */
    showCountryInfo(countryID) {
        let chartInfoDiv = document.getElementById('chart-info');

        // Update information to be displayed
        chartInfoDiv.innerHTML = chartInfoDiv.innerHTML;
    }

    /**
     * Bubble-hover tooltip callback to populate its text.
     * 
     * @param {object} t A single data point in the chart object's dataset
     * @param {object} d The entire dataset stored in the chart object
     * @author  Jisha Pillai
     */
    updateTooltipLabel(t, d) {
        // Show the information of identified country
        // showCountryInfo(0);

        return d.datasets[t.datasetIndex].label + ': (GDP: ' + t.xLabel.toFixed(5) + ', CO2: ' + t.yLabel.toFixed(5) + ')';
    }

    /**
     * Callback for when the chart registers a hover event.
     */
    onHoverEvent() {
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
        this.countrySelected = countryID;
        showCountryInfo(countryID);
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
        showCountryInfo(countryID);
    }

    /**
     * Provides a color to visualize the country.
     * 
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     */
    getCountryColor(countryID, year) {
        return 'rgb(255,0,0)';
    }

    /**
     * Provides population data of a country.
     * 
     * @param {string} countryID The 3-letter id of a country
     * @param {number} year An integer value denoting the desired year to visualize
     */
    getCountryPopulation(countryID, year) {
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
    colorMode(mode) {
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
// let dataFilePath = '../data/json/gdp_co2_combined_data.json';
let dataFilePath = 'https://raw.githubusercontent.com/willhnguyen/CS-235-Game-of-Graphs-Project/master/data/json/gdp_co2_combined_data.json';
let chartElementID = 'gdp-chart';

class GDPChart {
    constructor() {
        this.data = {};
        this.chartElement = document.getElementById(chartElementID);
        this.yearToDisplay = 2014;
        this.chartjsObj = new Chart(this.chartElement, {});
    }

    // Fetch the JSON DATA
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

    // Create the chart
    generateChart() {
        // Set up the dataset to be passed to chartjs
        // 
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

    // Update the chart
    updateChart() {
        this.chartjsObj.update();
    }

    // Updates the chart by year (for year slider)
    updateChartByYear(year) {
        // Update old data with new data
        this.chartjsObj.data.datasets.forEach((val, idx, arr)=> {
            val.data[0].x = this.data.data[idx]["GDP Data"][year];
            val.data[0].y = this.data.data[idx]["CO2 Data"][year];
            val.data[0].r = 10;
        })

        this.updateChart();
    }
    // Updates the side bar information 
    showCountryInfo(countryID) {

    }

    // Callback to update the tooltip label
    // This function is used in this.updateChart()
    updateTooltipLabel(t, d) {
        return d.datasets[t.datasetIndex].label + ': (GDP: ' + t.xLabel + ', CO2: ' + t.yLabel + ')';
    }
}

let gdpChart = new GDPChart();
gdpChart.getData();

// Populate select dropdown based on years available
let yearPicker = document.getElementById('year-picker');
for (let i = 1990; i <= 2014; ++i) {
    yearPicker.innerHTML = yearPicker.innerHTML + "<option value='" + i.toString() + "'>" + i.toString() + "</option>";
}
yearPicker.selectedIndex = yearPicker.length - 1;

// Function to update the visualization by year
function yearPickerUpdated(selectEl) {
    let year = selectEl.options[selectEl.selectedIndex].value;
    gdpChart.updateChartByYear(year);
}

// Update slider range based on years available
let yearSlider = document.getElementById('year-slider');
yearSlider.min = 1990;
yearSlider.max = 2014;
yearSlider.value = 2014;

// Function to update the visualization by year
function yearSliderUpdated(sliderEl) {
    let year = parseInt(sliderEl.value);

    if (gdpChart.yearToDisplay !== year) {
        gdpChart.updateChartByYear(year);
        gdpChart.yearToDisplay = year;
    }
}
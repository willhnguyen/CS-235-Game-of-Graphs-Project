/**
 * GDP vs. CO2 chart visualization.
 *
 * This main.js file provides the class and method class necessary
 * to visualize the GDP vs. CO2 dataset provided by World Bank.
 *
 * @link   http://github.com/willhnguyen/CS-235-Game-of-Graphs-Project/
 *
 * @author JP, Raksha Sunil (RS), William Nguyen (WN)
 */

 /**********************************************************************
 * Helper Functions
 **********************************************************************/

/**
 * Callback for when the year select dropdown experience an onchange event.
 *
 * @param {Object} selectEl The DOM element for year-picker
 * @author  William Nguyen
 */
function yearPickerUpdated(selectEl) {
    let year = selectEl.options[selectEl.selectedIndex].value;
    gdpChart.updateChartByYear(year);
}

/**
 * Callback for when the year slider experiences an onchange event.
 *
 * @param {Object} sliderEl The DOM element for year-slider
 * @author  William Nguyen
 */
function yearSliderUpdated(sliderEl) {
    let year = parseInt(sliderEl.value);

    if (gdpChart.yearToDisplay !== year) {
        gdpChart.updateChartByYear(year);
        gdpChart.yearToDisplay = year;
    }
}

/**********************************************************************
 * Start Main Code
 **********************************************************************/

/**
 * The main GDPChart object used to update the visualization.
 */
const gdpChart = new GDPChart('gdp-chart');
gdpChart.getData();
gdpChart.getPopulationData();

// Populate the year select dropdown list based on years available.
let yearPicker = document.getElementById('year-picker');
for (let i = 1990; i <= 2014; ++i) {
    yearPicker.innerHTML = yearPicker.innerHTML + "<option value='" + i.toString() + "'>" + i.toString() + "</option>";
}

// Select the most recent year
yearPicker.selectedIndex = yearPicker.length - 1;

// Create custom year slider 
let yearSlider = new Slider('year-slider', 1990, 2014, 1, [1990, 1995, 2000, 2005, 2010, 2014], function(i) {return gdpChart.updateChartByYear(i);});
yearSlider.selectedVal(2014);
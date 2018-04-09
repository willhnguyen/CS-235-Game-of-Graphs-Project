/**
 * GDP vs. CO2 chart visualization.
 *
 * This main.js file provides the class and method class necessary
 * to visualize the GDP vs. CO2 dataset provided by World Bank.
 *
 * @link   http://github.com/willhnguyen/CS-235-Game-of-Graphs-Project/
 *
 * @author William Nguyen (WN)
 * @date March 31, 2018
 */

/**********************************************************************
 * Helper Functions
 **********************************************************************/

/**
 * Callback for when the year select dropdown experience an onchange event.
 *
 * @param {Object} selectEl The DOM element for year-picker
 * @author  William Nguyen
 * @date March 31, 2018
 */
function yearPickerUpdated(selectEl) {
    let year = selectEl.options[selectEl.selectedIndex].value;
    gdpChart.updateChartByYear(year);
}

// /**
//  * Callback for when the year slider experiences an onchange event.
//  *
//  * @param {Object} sliderEl The DOM element for year-slider
//  * @author  William Nguyen
//  * @date March 31, 2018
//  */
// function yearSliderUpdated(sliderEl) {
//     let year = parseInt(sliderEl.value);

//     if (gdpChart.yearToDisplay !== year) {
//         gdpChart.updateChartByYear(year);
//         gdpChart.yearToDisplay = year;
//     }
// }

/**********************************************************************
 * Start Main Code
 **********************************************************************/

/**
 * The main GDPChart object used to update the visualization.
 * 
 * @author William Nguyen
 * @date March 31, 2018
 */
const gdpChart = new GDPChart('gdp-chart');
gdpChart.getData();
//gdpChart.getPopulationData(); // @author Jisha Pillai @date April 3, 2018

/**
 * Create custom year slider.
 * 
 * @author William Nguyen
 * @date April 4, 2018
 */
let yearSlider = new Slider('year-slider', 1990, 2014, 1, [1990, 1995, 2000, 2005, 2010, 2014], function (i) {
    return gdpChart.updateChartByYear(i);
});
yearSlider.selectedVal(2014);
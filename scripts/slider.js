/**
 * Slider class for creating a simple slider.
 *
 * This slider.js file provides the class and methods necessary
 * to display a slider with an custom callback function on a marker
 * position change.
 * 
 * @link   http://github.com/willhnguyen/CS-235-Game-of-Graphs-Project/
 *
 * @author William Nguyen (WN)
 * @date April 4, 2018
 */

/**
 * Slider class to generate a HTML slider.
 * 
 * @author William Nguyen
 * @date April 4, 2018
 */
class Slider {

    /**
     * Creates a slider with the following properties.
     * 
     * @param {string} elementId The name of the element to append slider to
     * @param {number} minVal Min value of the slider
     * @param {number} maxVal Max value of the slider
     * @param {number} stepVal The increment amount for each tick from min to <= max value
     * @param {[number]} labels The number labels which should show on the slider
     * @param {function (number)} callback Function to invoke when marker has been changed
     */
    constructor(elementId, minVal, maxVal, stepVal, labels, callback) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.stepVal = stepVal;
        this.labels = labels;
        this.markerDragFlag = false;

        // Build Slider
        this.element.innerHTML +=
            `<div class="slider" id="${this.elementId}-slide">
                <div class="slider-marker" id="${this.elementId}-marker" style="left:${0 - 15/2}px"></div>
                <div class="slider-ticks" id="${this.elementId}-ticks"></div>
            </div>`;

        // Populate Slider with Ticks
        this.drawTicks();

        // Add event listener to marker
        this.marker = document.getElementById(`${this.elementId}-marker`);
        this.marker.addEventListener('mousedown', this.mouseDownListener());
        document.addEventListener('mousemove', this.mouseMoveListener(callback));
        document.addEventListener('mouseup', this.mouseUpListener());
    }

    /**
     * Draws the tick marks of the slider.
     */
    drawTicks() {
        // Populate Slider with Ticks at Calculated Distances
        this.slide = document.getElementById(`${this.elementId}-slide`);
        this.ticks = document.getElementById(`${this.elementId}-ticks`);
        let numTicks = (this.maxVal - this.minVal) / this.stepVal;
        let parentWidth = parseInt(this.getStyle(this.slide, 'width'));

        this.tickDist = parentWidth / numTicks;

        for (let i = this.minVal, j = 0; i <= this.maxVal; i += this.stepVal, j += 1) {
            let updated = false;
            for (let tickLabel of this.labels) {
                if (i === parseInt(tickLabel)) {
                    this.ticks.innerHTML += `<div class="slider-tick" style="left: ${this.tickDist * j}px"><label>${i}</label></div>`;
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                this.ticks.innerHTML += `<div class="slider-tick" style="left: ${this.tickDist * j}px"></div>`;
            }
        }
    }

    /**
     * Listener for a mouse down event.
     * 
     * On mouse down, the listener begins registering a drag event (via a flag). In particular,
     * the mouse down changes to show marker is being dragged.
     */
    mouseDownListener() {
        const that = this;
        return function (event) {
            that.markerDragFlag = true;
            that.marker.classList.add('active');
        };
    }

    /**
     * Listener for a mouse up event.
     * 
     * On mouse up, the listener stops registering mouse drags (via a flag). In particular,
     * the mouse up changes to show marker has stopped being dragged.
     */
    mouseUpListener() {
        const that = this;
        return function (event) {
            that.markerDragFlag = false;
            that.marker.classList.remove('active');
        };
    }
    /**
     * Listener for mouse drag event.
     * 
     * When mouse drag is registered, a callback is invoked to notify change in slider value.
     * @param {function (int)} callback A function that uses the slider value
     */
    mouseMoveListener(callback) {
        const that = this;
        return function (event) {
            if (that.markerDragFlag) {
                let offset = that.slide.getBoundingClientRect().left;
                let widthHalf = parseInt(that.getStyle(that.marker, 'width')) / 2;
                let slideWidth = parseInt(that.getStyle(that.slide, 'width'));

                let left_position = event.clientX - offset - widthHalf;

                // Snap to ticks
                let left_i = Math.round(left_position / that.tickDist);
                left_position = left_i * that.tickDist;
                left_i = Math.min(Math.max(left_i, 0), Math.round((that.maxVal - that.minVal) / that.stepVal));

                left_position = Math.min(Math.max(left_position, 0), slideWidth) - widthHalf;

                that.setStyle(that.marker, "left", `${left_position}px`);

                if (that.i !== left_i) {
                    that.i = left_i;
                    callback(left_i * that.stepVal + that.minVal);
                }
            }
        };
    }

    /**
     * Obtain the desired style attribute value of an element.
     * 
     * Source: https://stackoverflow.com/questions/14275304/
     * 
     * @param {object} e The DOM element which we want to obtain the style attribute value from
     * @param {string} styleName The name of the style attribute we want to obtain
     * @return {*} The value of the desired style attribute
     */
    getStyle(e, styleName) {
        var styleValue = "";
        if (document.defaultView && document.defaultView.getComputedStyle) {
            styleValue = document.defaultView.getComputedStyle(e, "").getPropertyValue(styleName);
        } else if (e.currentStyle) {
            styleName = styleName.replace(/\-(\w)/g, function (strMatch, p1) {
                return p1.toUpperCase();
            });
            styleValue = e.currentStyle[styleName];
        }
        return styleValue;
    }

    /**
     * Sets the selected value and updates the slider marker's position.
     * 
     * Note: The value will be forced within the bounds of the slider's min and max values.
     * 
     * @param {number} val The desired value to set the slider to
     */
    selectedVal(val) {
        // Calculate index i
        let i = Math.round(val - this.minVal / this.stepVal);
        i = Math.min(Math.max(i, 0), this.maxVal - this.minVal);
        this.i = i;

        // Get DOM element parameters for calculations
        let widthHalf = parseInt(this.getStyle(this.marker, 'width')) / 2;

        // Snap to ticks
        let left_position = i * this.tickDist - widthHalf;
        this.setStyle(this.marker, "left", `${left_position}px`);
    }

    /**
     * Sets a style attribute of an element.
     * 
     * @param {object} e The DOM element whose style should be updated
     * @param {string} styleName The style attribute to update
     * @param {*} value The value to change the style attribute to
     */
    setStyle(e, styleName, value) {
        e.style[styleName] = value;
    }
}
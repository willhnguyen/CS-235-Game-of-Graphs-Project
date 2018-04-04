class Slider {
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
    
    drawTicks() {
        // Populate Slider with Ticks at Calculated Distances
        this.slide = document.getElementById(`${this.elementId}-slide`);
        this.ticks = document.getElementById(`${this.elementId}-ticks`);
        let numTicks = (this.maxVal - this.minVal) / this.stepVal;
        let parentWidth = parseInt(this.getStyle(this.slide, 'width'));
        
        this.tickDist = parentWidth / numTicks;
        
        for (let i = this.minVal, j = 0; i <= this.maxVal; i += this.stepVal, j+= 1) {
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
    
    mouseDownListener() {
        const that = this;
        return function(event) {
            that.markerDragFlag = true;
        };
    }
    mouseUpListener() {
        const that = this;
        return function(event) {
            that.markerDragFlag = false;
        };
    }
    mouseMoveListener(callback) {
        const that = this;
        return function(event) {
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
    
    // Source: https://stackoverflow.com/questions/14275304/
    getStyle(e, styleName) {
        var styleValue = "";
        if(document.defaultView && document.defaultView.getComputedStyle) {
            styleValue = document.defaultView.getComputedStyle(e, "").getPropertyValue(styleName);
        }
        else if(e.currentStyle) {
            styleName = styleName.replace(/\-(\w)/g, function (strMatch, p1) {
                return p1.toUpperCase();
            });
            styleValue = e.currentStyle[styleName];
        }
        return styleValue;
    }
    
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
    
    setStyle(e, styleName, value) {
        e.style[styleName] = value;
    }
}


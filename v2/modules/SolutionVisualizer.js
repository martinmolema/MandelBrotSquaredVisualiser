import {ComplexNumber} from "./ComplexNumber.js";
import {ComplexCanvasCalculator} from "./ComplexCanvasCalculator.js";
import {SVGSupport} from "./SVGSupport.js";

/**
 * Class to visualize aspects of the Mandelbrot Set, displaying a Mandelbrot Fractal + optional Julia set
 */
export class SolutionVisualizer {

    constructor(doc, constants) {
        this.document       = doc;
        this.constants      = constants;
        this.drawDots       = false;
        this.drawLines      = false;
        this.drawJulia      = false;
        this.drawMandelbrot = false;
        this.paletStart = 0;

        this.complex_constant = new ComplexNumber(0,0);
        this.complex_start    = new ComplexNumber(0,0);

        this.complexCanvasCalculator = new ComplexCanvasCalculator( this.constants.SVG_WIDTH, this.constants.SVG_HEIGHT, this.constants.SVG_ONE_UNIT );

        // search the elements in the HTML
        this.elmOuterSVGContainer  = this.document.getElementById("canvas");
        this.elmBackdropContainer  = this.document.getElementById("backdrop");
        this.elmConstantCircle     = this.document.getElementById("constant");
        this.elmDots               = this.document.getElementById("dots");
        this.elmVisualiser         = this.document.getElementById("visualiser");
        this.elmTextConstant       = this.document.getElementById("complexConstant");
        this.elmTextStartNumber    = this.document.getElementById("complexStart");
        this.elmTextConverged      = this.document.getElementById("Converged");
        this.elmTextIterations     = this.document.getElementById("Iterations");
        this.elmFractalM           = this.document.getElementById("fractalM");
        this.elmFractalJ           = this.document.getElementById("fractalJ");

        // if SVG drawing is needed, then create a SVGSupport class to that element
        this.svgOuterContainer = new SVGSupport(this.elmOuterSVGContainer);
        this.svgBackdrop       = new SVGSupport(this.elmBackdropContainer);
        this.svgVisualiser     = new SVGSupport(this.elmVisualiser);
        this.svgDots           = new SVGSupport(this.elmDots);

        this.svgOuterContainer.setSize(this.constants.SVG_WIDTH, this.constants.SVG_HEIGHT);

        this.placeSVGCircleFromComplexNumber(this.elmConstantCircle, this.complex_constant);

        // add eventhanlders and make sure the 'THIS' value points to this classes OBJECT-reference, instead of the element handled
        this.elmConstantCircle.addEventListener("mousedown", (evt) => this.handleConstantDrag(evt), {capture:false});
        this.elmOuterSVGContainer.addEventListener("click", (evt) => this.handleMouseClick(evt), {capture: false});

        this.drawBackdrop();
    }// constructor

    /**
     * Starts the visualisation by calling CalculateResults.
     */
    start(){
        this.calculateAndVisualiseIterations();
    }// start

    setConstant(real, imaginary, redraw){
        this.complex_constant.set(real,imaginary);
        if (redraw) this.calculateAndVisualiseIterations();
    }

    setStart(real, imaginary, redraw){
        this.complex_start.set(real,imaginary);
        if (redraw) this.calculateAndVisualiseIterations();
    }

    /**
     * Draws the backdrop (circles and axis)
     */
    drawBackdrop(){
        this.svgBackdrop.drawSVGCircle(this.constants.X0, this.constants.Y0, this.constants.SVG_CIRCLE_ONE * 2,"yellow",1,"none");
        this.svgBackdrop.drawSVGCircle(this.constants.X0, this.constants.Y0, this.constants.SVG_CIRCLE_ONE,"yellow",1,"none");
        this.drawUnitLineHorizontal( 0, this.constants.SVG_WIDTH, this.constants.Y0, this.constants.SVG_ONE_UNIT / 8);
        this.drawUnitLineVertical  (0, this.constants.SVG_HEIGHT, this.constants.X0, this.constants.SVG_ONE_UNIT / 8);
    }// drawBackdrop

    /**
     * Support function for the drawing the X-axis
     * @param x1
     * @param x2
     * @param y
     * @param unit
     */
    drawUnitLineHorizontal(x1, x2, y, unit){
        this.svgBackdrop.drawSVGLine(x1,y,x2,y,"yellow",2);
        for (var x = x1; x <= x2; x += unit){
            this.svgBackdrop.drawSVGLine(x, y-this.constants.SVG_LINE_MARKER_LENGTH/2, x, y+this.constants.SVG_LINE_MARKER_LENGTH/2, "yellow",1);
        }
    }// drawUnitLineHorizontal

    /**
     * Support function for the drawing the Y-axis
     * @param y1
     * @param y2
     * @param x
     * @param unit
     */
     drawUnitLineVertical(y1, y2, x, unit){
         this.svgBackdrop.drawSVGLine(x,y1,x,y2,"yellow",2);
        for (var y = y1; y <= y2; y += unit){
            this.svgBackdrop.drawSVGLine(x-this.constants.SVG_LINE_MARKER_LENGTH/2, y, x+this.constants.SVG_LINE_MARKER_LENGTH/2, y, "black",1);
        }
    }// drawUnitLineVertical

    /**
     * Draws one circle for a complex number that is reached for one step of the iteration
     * @param complexNr
     */
     drawCircleForComplexCoordinate(complexNr) {
        var cx = this.complexCanvasCalculator.translateXtoCanvas(complexNr.real);
        var cy = this.complexCanvasCalculator.translateYtoCanvas(complexNr.imaginary);

        this.svgVisualiser.drawSVGCircle(cx, cy, 4, "red", 1,"yellow");
    }

    /**
     * Draws a connecting line between two complex numbers that follow each other in two iterations
     * @param complexNr1
     * @param complexNr2
     */
     drawConnectingLine(complexNr1, complexNr2) {

        var x1 = this.complexCanvasCalculator.translateXtoCanvas(complexNr1.real);
        var y1 = this.complexCanvasCalculator.translateYtoCanvas(complexNr1.imaginary);
        var x2 = this.complexCanvasCalculator.translateXtoCanvas(complexNr2.real);
        var y2 = this.complexCanvasCalculator.translateYtoCanvas(complexNr2.imaginary);

        this.svgVisualiser.drawSVGLine(x1,y1,x2, y2,"blue", 1);
    }

    /**
     * calculateAndVisualiseIterations
     * @param drawLines
     * @param drawDots
     */
    calculateAndVisualiseIterations() {
        while (this.elmVisualiser.firstChild) this.elmVisualiser.removeChild(this.elmVisualiser.firstChild);

        this.elmTextConstant.textContent    = this.complex_constant.toString();
        this.elmTextStartNumber.textContent = this.complex_start.toString();

        var prev = this.complex_start.clone();
        var m1   = this.complex_start.clone();
        var zero = new ComplexNumber(0,0);

        let iterations = 0;
        var distance;
        var isDeterministic = true;
        var hasConverged = false;
        var hasDiverged = false;
        var needsMoreIterations = false;

        do {
            if (this.drawLines) this.drawCircleForComplexCoordinate(m1);

            // square m1 and add some other constant
            m1.sqr();
            m1.add(this.complex_constant);

            if (this.drawLines) this.drawConnectingLine(m1, prev);

            // increase iterations
            iterations++;

            // calculate distance to previous point
            distance = m1.distance(prev);

            // reset the previous place to the current place
            prev.copy(m1);

            // check if the distance has shrunk below a certain point ==> convergence
            hasConverged = (distance < this.constants.EPSILON);

            // if m1 lies outside the circle at (0,0) and radius 2, it is definitely NOT deterministic and will never converge.
            isDeterministic = m1.distance(zero) < 2;

            // we stop at 200 iterations
            needsMoreIterations = (iterations < this.constants.MAX_ITERATIONS);
        } while (isDeterministic && needsMoreIterations && !hasConverged);

        let colorcode = this.getColorcode(iterations);
        let color = isDeterministic ? "rgba(0,0,0,0.9)" : colorcode;

        let cx = this.complexCanvasCalculator.translateXtoCanvas(this.complex_constant.real);
        let cy = this.complexCanvasCalculator.translateYtoCanvas(this.complex_constant.imaginary);

        if (this.drawDots) this.svgDots.drawSVGCircle(cx, cy, 1, color,1,color);

        this.elmTextConverged.textContent  = isDeterministic ? "Yes" : "No";
        this.elmTextIterations.textContent = iterations.toString();
    }// calculateResults

    /**
     * Draws the MandelbrotFractal at an HTML-canvas.
     */
    drawMandelbrotFractal() {

        if (!this.drawMandelbrot) return;

        const context2d = this.elmFractalM.getContext('2d');
        context2d.fillStyle = "white";
        context2d.strokeStyle="none";
        context2d.clearRect(0, 0, canvas.width, canvas.height);

        var zero = new ComplexNumber(0,0);

        var realBegin =  2;
        var imagBegin =  2;
        var realEnd   = -2;
        var imagEnd   = -2;
        var step=0.005;

        const prev      = new ComplexNumber(0,0);
        const iterator  = new ComplexNumber(0,0);
        const constant  = new ComplexNumber(0,0);

        for (var real=realBegin;real> realEnd;real -= step){
            for(var imag=imagBegin;imag>imagEnd;imag -= step){
                // The Iterator represents the CONSTANT in het plane of the canvas
                // The calculations are done using ZERO (0,0) as the starting point of the iterations

                iterator.set(0,0);
                prev.set(0,0);
                constant.set(imag, real)

                // check if the iterator is in the circle with radius(2)
                if (constant.distance(zero) < 2)  {
                    let iterations = 0;
                    var distance2;
                    var isDeterministic = true;
                    var hasConverged = false;
                    var hasDiverged = false;
                    var needsMoreIterations = false;

                    do {
                        // increase iterations
                        iterations++;

                        // square m1 and add some other constant
                        iterator.sqr().add(constant);

                        // calculate distance to previous point
                        distance2 = prev.distance(iterator);

                        // reset the previous place to the current place
                        prev.copy(iterator);

                        // check if the distance has shrunk below a certain point ==> convergence
                        hasConverged = (distance2 < this.constants.EPSILON);

                        // if m1 lies outside the circle at (0,0) and radius 2, it is definitely NOT deterministic and will never converge.
                        isDeterministic = iterator.distance(zero) < 2;

                        // we stop at 200 iterations
                        needsMoreIterations = (iterations < this.constants.MAX_ITERATIONS);
                    } while (isDeterministic && needsMoreIterations && !hasConverged);

                    let colorcode = this.getColorcode(iterations);

                    let color = isDeterministic ? "rgba(0,0,0,0.9)" : colorcode;

                    let cx = this.complexCanvasCalculator.translateXtoCanvas(constant.real);
                    let cy = this.complexCanvasCalculator.translateYtoCanvas(constant.imaginary);

                    context2d.fillStyle = color;
                    context2d.strokeStyle="none";
                    context2d.fillRect(cx, cy, 1,1);
                }
            }
        }

    }// drawMandelbrotFractal

    drawJuliaFractal() {

        if (!this.drawJulia) return;

        const context2d = this.elmFractalJ.getContext('2d');
        context2d.fillStyle = "white";
        context2d.strokeStyle="none";
        context2d.clearRect(0, 0, canvas.width, canvas.height);

        var zero = new ComplexNumber(0,0);

        var realBegin =  2;
        var imagBegin =  2;
        var realEnd   = -2;
        var imagEnd   = -2;
        var step=0.005;

        const prev      = new ComplexNumber(0,0);
        const iterator  = new ComplexNumber(0,0);
        const constant  = this.complex_start.clone();
        const start     = new ComplexNumber(0,0);

        for (var real=realBegin;real> realEnd;real -= step){
            for(var imag=imagBegin;imag>imagEnd;imag -= step){
                // The Iterator represents the CONSTANT in het plane of the canvas
                // The calculations are done using ZERO (0,0) as the starting point of the iterations

                prev.set(0,0);
                start.set(imag, real)
                iterator.copy(start);

                // check if the iterator is in the circle with radius(2)
                if (iterator.distance(zero) < 2)  {
                    let iterations = 0;
                    var distance2;
                    var isDeterministic = true;
                    var hasConverged = false;
                    var hasDiverged = false;
                    var needsMoreIterations = false;

                    do {
                        // increase iterations
                        iterations++;

                        // square m1 and add some other constant
                        iterator.sqr().add(constant);

                        // calculate distance to previous point
                        distance2 = prev.distance(iterator);

                        // reset the previous place to the current place
                        prev.copy(iterator);

                        // check if the distance has shrunk below a certain point ==> convergence
                        hasConverged = (distance2 < this.constants.EPSILON);

                        // if m1 lies outside the circle at (0,0) and radius 2, it is definitely NOT deterministic and will never converge.
                        isDeterministic = iterator.distance(zero) < 2;

                        // we stop at 200 iterations
                        needsMoreIterations = (iterations < this.constants.MAX_ITERATIONS);
                    } while (isDeterministic && needsMoreIterations && !hasConverged);

                    let colorcode = this.getColorcode(iterations);

                    let color = isDeterministic ? "black" : colorcode;

                    let cx = this.complexCanvasCalculator.translateXtoCanvas(start.real);
                    let cy = this.complexCanvasCalculator.translateYtoCanvas(start.imaginary);

                    context2d.fillStyle = color;
                    context2d.strokeStyle="none";
                    context2d.fillRect(cx, cy, 1,1);
                }
            }
        }

    }// drawJuliaFractal

    /**
     * Calculates an HTML colorcode based on the number of iterations
     * @param iterations
     * @returns {string}
     */
    getColorcode(iterations){
        const offset    = this.paletStart;
        const maxRange  = 255*255*255; /* 3 bytes colorcode */
        const ratio     = iterations /  this.constants.MAX_ITERATIONS;
        let ratedRatio  = Math.ceil( ratio * maxRange ); // integer needed!
        ratedRatio     += offset;
        ratedRatio      = ratedRatio % maxRange;

        let hexValue = ("00000" + ratedRatio.toString(16)).slice(-6)

        return "#"+ hexValue;
    }

    /**
     * Handles the clicking of the left mouse button so the starting point can be changed
     * @param evt
     */
     handleMouseClick(evt) {
        if (evt.target === this.elmConstantCircle) return;

        evt.stopPropagation();
        evt.preventDefault();

        const x = evt.offsetX;
        const y = evt.offsetY;

        // Translate the complex parts to the canvas
        let real      = this.complexCanvasCalculator.translateXfromCanvas(x);
        let imaginary = this.complexCanvasCalculator.translateYfromCanvas(y);

        // change the starting complex number
        this.complex_start.set(real, imaginary);

        // recalculate and redraw
        this.calculateAndVisualiseIterations();
        if (this.drawJulia) this.drawJuliaFractal(real,imaginary);
    }// handleMouseClick

     handleConstantDrag(evt) {
         console.log(evt.currentTarget);
         const that = this;

         var dragging = true;

         evt.stopPropagation();
         evt.preventDefault();

        var endDrag = function (evtEndDrag) {
            dragging = false;

            evtEndDrag.preventDefault();
            evtEndDrag.stopPropagation();

            window.removeEventListener("mouseup", endDrag);
            that.elmVisualiser.removeEventListener("blur", endDrag);
            window.removeEventListener("mousemove", moveHandler);
        };

        var moveHandler = function (evtMove) {
            if (dragging) {
                evtMove.preventDefault();
                evtMove.stopPropagation();

                let cx = evtMove.offsetX;
                let cy = evtMove.offsetY;
                that.elmConstantCircle.setAttribute("cx", cx);
                that.elmConstantCircle.setAttribute("cy", cy);

                var real      = that.complexCanvasCalculator.translateXfromCanvas(cx);
                var imaginary = that.complexCanvasCalculator.translateYfromCanvas(cy);

                that.complex_constant.set(real, imaginary);

                that.calculateAndVisualiseIterations();
            }
        };

        window.addEventListener("mousemove", moveHandler);
        this.elmVisualiser.addEventListener("blur", endDrag);
        window.addEventListener("mouseup", endDrag);

    }//handleConstantDrag

     placeSVGCircleFromComplexNumber(svg, complexNr){
        var cx = this.complexCanvasCalculator.translateXtoCanvas(complexNr.real);
        var cy = this.complexCanvasCalculator.translateYtoCanvas(complexNr.imaginary);

        svg.setAttribute("cx", cx);
        svg.setAttribute("cy", cy);
    }//placeSVGCircleFromComplexNumber

}// class SolutionVisualizer

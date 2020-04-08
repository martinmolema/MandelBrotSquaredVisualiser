import {ComplexNumber} from "./ComplexNumber.js";
import {ComplexCanvasCalculator} from "./ComplexCanvasCalculator.js";
import {SVGSupport} from "./SVGSupport.js";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1000;
const X0 = SVG_WIDTH / 2;
const Y0 = SVG_HEIGHT / 2;
const SVG_CIRCLE_ONE = 250;
const SVG_ONE_UNIT = SVG_CIRCLE_ONE;

const SVG_LINE_MARKER_LENGTH =10;

export class SolutionVisualizer {

    constructor(doc) {
        this.document = doc;

        this.complex_constant = new ComplexNumber(0,0);
        this.complex_start    = new ComplexNumber(0,0);

        this.complexCanvasCalculator = new ComplexCanvasCalculator( SVG_WIDTH, SVG_HEIGHT, SVG_ONE_UNIT );

        // search the elements in the HTML
        this.elmOuterSVGContainer  = this.document.getElementById("canvas");
        this.elmBackdropContainer  = this.document.getElementById("backdrop");
        this.elmConstantCircle     = this.document.getElementById("constant");
        this.elmVisualiser         = this.document.getElementById("visualiser");
        this.elmTextConstant       = this.document.getElementById("complexConstant");
        this.elmTextStartNumber    = this.document.getElementById("complexStart");
        this.elmTextConverged      = this.document.getElementById("Converged");
        this.elmTextIterations     = this.document.getElementById("Iterations");

        // if SVG drawing is needed, then create a SVGSupport class to that element
        this.svgOuterContainer = new SVGSupport(this.elmOuterSVGContainer);
        this.svgBackdrop       = new SVGSupport(this.elmBackdropContainer);
        this.svgVisualiser     = new SVGSupport(this.elmVisualiser);

        this.svgOuterContainer.setSize(SVG_WIDTH, SVG_HEIGHT);

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

    /**
     * Draws the backdrop (circles and axis)
     */
    drawBackdrop(){
        this.svgBackdrop.drawSVGCircle(X0, Y0, SVG_CIRCLE_ONE * 2,"black",1,"rgb(250,250,250)");
        this.svgBackdrop.drawSVGCircle(X0, Y0, SVG_CIRCLE_ONE,"black",1,"lightgreen");
        this.drawUnitLineHorizontal( 0, SVG_WIDTH, Y0, SVG_ONE_UNIT / 8);
        this.drawUnitLineVertical  (0, SVG_HEIGHT, X0, SVG_ONE_UNIT / 8);
    }// drawBackdrop

    /**
     * Support function for the drawing the X-axis
     * @param x1
     * @param x2
     * @param y
     * @param unit
     */
    drawUnitLineHorizontal(x1, x2, y, unit){
        this.svgBackdrop.drawSVGLine(x1,y,x2,y,"black",2);
        for (var x = x1; x <= x2; x += unit){
            this.svgBackdrop.drawSVGLine(x, y-SVG_LINE_MARKER_LENGTH/2, x, y+SVG_LINE_MARKER_LENGTH/2, "black",1);
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
         this.svgBackdrop.drawSVGLine(x,y1,x,y2,"black",2);
        for (var y = y1; y <= y2; y += unit){
            this.svgBackdrop.drawSVGLine(x-SVG_LINE_MARKER_LENGTH/2, y, x+SVG_LINE_MARKER_LENGTH/2, y, "black",1);
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

    calculateAndVisualiseIterations() {
        while (this.elmVisualiser.firstChild) this.elmVisualiser.removeChild(this.elmVisualiser.firstChild);

        this.elmTextConstant.textContent    = this.complex_constant.toString();
        this.elmTextStartNumber.textContent = this.complex_start.toString();

        var prev = this.complex_start.clone();
        var m1   = this.complex_start.clone();
        var zero = new ComplexNumber(0,0);

        const epsilon = 0.0000003;
        let iterations = 0;
        var distance;
        var isDeterministic = true;
        var hasConverged = false;
        var needsMoreIterations = false;

        do {
            this.drawCircleForComplexCoordinate(m1);

            // square m1 and add some other constant
            m1.sqr();
            m1.add(this.complex_constant);

            this.drawConnectingLine(m1, prev);

            // increase iterations
            iterations++;

            // calculate distance to previous point
            distance = m1.distance(prev);

            // reset the previous place to the current place
            prev.copy(m1);

            // check if the distance has shrunk below a certain point ==> convergence
            hasConverged = (distance < epsilon);

            // if m1 lies outside the circle at (0,0) and radius 2, it is definitely NOT deterministic and will never converge.
            isDeterministic = m1.distance(zero) < 2;

            // we stop at 200 iterations
            needsMoreIterations = (iterations < 200);


        } while (isDeterministic && needsMoreIterations && !hasConverged);

        this.elmTextConverged.textContent  = hasConverged ? "Yes" : "No";
        this.elmTextIterations.textContent = iterations.toString();
    }// calculateResults

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
        let imagimary = this.complexCanvasCalculator.translateYfromCanvas(y);

        // change the starting complex number
        this.complex_start.set(real, imagimary);

        // recalculate and redraw
        this.calculateAndVisualiseIterations();
    }// handleMouseClick

     handleConstantDrag(evt) {
         console.log(evt.currentTarget);
         const that = this;
         const elementBeingDragged = evt.currentTarget;

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

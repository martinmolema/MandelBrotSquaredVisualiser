import {EPSILONSQRD} from "./FractalDrawer.js";
import {Rectangle,Dimensions} from "./Dimensions.js";
import {SVGSupport} from "./SVGSupport.js";

export class IterationLines {

    constructor(svgElement) {
        this.svgElement = svgElement;
        this.drawer     = new SVGSupport(svgElement);

        this.x = 0;
        this.y = 0;
        this.maxIterations = 200;

        this.svgPlane     = new Dimensions(0,0);
        this.fractalplane = new Rectangle(0,0,0,0);
    }

    /**
     * Set the coordinates in the fractal-plane where the drawing should start
     * @param x
     * @param y
     */
    setCoordinates (x, y){
        this.x=x;
        this.y=y;
    }

    updateSVGSize(svgElement){
        var w = svgElement.parentElement.clientWidth;
        var h = svgElement.parentElement.clientHeight;

        this.svgPlane.w = w;
        this.svgPlane.h = h;
    }

    updateFractalPlane(rect){
        this.fractalplane.updateFromRect(rect);
    }//updateFractalPlane

    draw(){
        this.clearCanvas();

        let w = this.svgPlane.w;
        let h = this.svgPlane.h;

        let fractal_w = this.fractalplane.dimensions.w;
        let fractal_h = this.fractalplane.dimensions.h;

        let op_x  = fractal_w / w;
        let op_y  = fractal_h / h;

        let x1 = this.fractalplane.x1;
        let y1 = this.fractalplane.y1;
        let x2 = this.fractalplane.x2;
        let y2 = this.fractalplane.y2;

        let cx = x1 + (this.x / this.svgPlane.w) * fractal_w;
        let cy = y1 - (this.y / this.svgPlane.h) * fractal_h;

        // the following four variables are within the fractal-plane
        let startx = 0;
        let starty = 0;
        let prevx = 0;
        let prevy = 0;

        let iterations = 0;
        let needsMoreIterations = false;
        let isStable = false;
        let hasConverged = false;

        do {
            var px,py, ppx, ppy;

            // first square (startx, starty)
            let xy = this.multiply(startx, starty, startx, starty);
            startx = xy.newx;
            starty = xy.newy;

            // add constant
            startx += cx;
            starty += cy;

            px  = ((startx - x1) / fractal_w) * w;
            py  = ((y1 - starty) / fractal_h) * h;
            ppx = ((prevx - x1) / fractal_w) * w;
            ppy = ((y1 - prevy) / fractal_h) * h;

            hasConverged        = this.calculateDistanceSquared(startx, starty, prevx, prevy) < (EPSILONSQRD);
            isStable            = this.calculateDistanceSquared(0, 0, startx, starty)  < (2 * 2);
            needsMoreIterations = (++iterations) < this.maxIterations;

            this.drawer.drawSVGLine( px, py, ppx, ppy, "yellow",2);
            this.drawer.drawSVGCircle( px, py, 4, "red", 1,"yellow");

            prevx = startx;
            prevy = starty;
        } while (needsMoreIterations && isStable && !hasConverged) ;
    }
    calculateDistanceSquared(x1, y1, x2, y2) {
        const p1 = x1 - x2;
        const p2 = y1 - y2;

        return (p1 * p1 + p2 * p2);
    }//calculateDistance

    clearCanvas(){
        while (this.svgElement.firstChild) this.svgElement.removeChild(this.svgElement.firstChild);
    }

    /**
     * Multiply two points in space.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {{newy: number, newx: number}}
     */
    multiply(x1, y1, x2, y2) {
        x1 *= 1.0;
        x2 *= 1.0;
        y1 *= 1.0;
        y2 *= 1.0;
        const newReal = (x1 * x2 - y1 * y2);
        const newImaginary = (x1 * y2 + y1 * x2);

        return {newx: newReal, newy: newImaginary};
    }// multiply

}

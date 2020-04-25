"use strict";

import {FractalDrawer, EPSILON} from "./FractalDrawer.js";

export class MandelbrotFractalDrawer extends FractalDrawer {
    constructor(constants, palettes, maxIterations, name) {
        super(constants, palettes, maxIterations, name);
    }

    draw() {
        super.draw();
        const pixels = this.constants.pixels;

        let x1 = this.constants.boundingbox.x1;
        let y1 = this.constants.boundingbox.y1;
        let x2 = this.constants.boundingbox.x2;
        let y2 = this.constants.boundingbox.y2;

        let op_x  = this.constants.one_pixel_x;
        let op_y  = this.constants.one_pixel_y;
        let can_w = this.constants.canvas_dimensions.w;

        // FIXME: loop through the (x,y) plane of the canvas and calculate the value for the fractalplane instead
        for (var cx = x1; cx < x2; cx +=  op_x) {
            for (var cy = y1; cy > y2; cy -= op_y) {
                if (this.calculateDistanceSquared(0, 0, cx, cy) < (2 * 2)) {
                    let startx = 0;
                    let starty = 0;
                    let prevx = 0;
                    let prevy = 0;

                    let iterations = 0;
                    let needsMoreIterations = false;
                    let isStable = false;
                    let hasConverged = false;

                    let px = Math.round(Math.abs(cx - x1) / op_x);
                    let py = Math.round(Math.abs(y1 - cy) / op_y);
                    let pixelpos = py * can_w + px;

                    do {
                        // first square (startx, starty)
                        let xy = this.multiply(startx, starty, startx, starty);
                        startx = xy.newx;
                        starty = xy.newy;

                        // add constant
                        startx += cx;
                        starty += cy;

                        hasConverged        = this.calculateDistanceSquared(startx, starty, prevx, prevy) < (EPSILON * EPSILON);
                        isStable            = (this.calculateDistanceSquared(0, 0, startx, starty) < (2 * 2));
                        needsMoreIterations = (++iterations) < this.maxIterations;

                        prevx = startx;
                        prevy = starty;

                    } while (needsMoreIterations && isStable && !hasConverged) ;

                    if (isStable) {
                        iterations = -1;
                    }
                    pixels[pixelpos] = iterations;
                } // if distance OK
            } // for CY
        }// for CX

        this.redrawUsingPalette();
    }
}

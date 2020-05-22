"use strict";

export const EPSILON     = 0.00003;
export const EPSILONSQRD = EPSILON * EPSILON ;


export class FractalDrawer {
    constructor(constants, palettes, maxIterations, name) {
        this.palettes  = palettes;
        this.constants = constants;
        this.maxIterations = maxIterations;
        this.name = name;
    }// constructor

    draw(){
        let pixels = this.constants.pixels;
        let n = pixels.length;
        let i = 0;
        while (i<n) pixels[i++]=-1;

    }

    /**
     * This will actually draw the image on the Canvas (supplied in the localConstants Object) using the already
     * available calculations in the pixels-array (also in the localConstants object). The colors are drawn from a palette.
     * This way the image can be redrawn very fast using an different palette, which can yield some nice results when
     * quickly drawing them with a small difference in palette start (creating animated vortexes!)
     */
    redrawUsingPalette() {

        var pixels  = this.constants.pixels;
        var canvas  = this.constants.canvas;
        var palette = this.palettes.getActive();

        // now put the image that is in memory only, on the canvas
        var context = canvas.getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, this.constants.canvas_dimensions.w, this.constants.canvas_dimensions.h);

        var completeImage = context.createImageData(this.constants.canvas_dimensions.w, this.constants.canvas_dimensions.h);
        var imageRGBValues = completeImage.data;

        const COLOR_BLACK = {RGB_R: 0, RGB_G: 0, RGB_B: 0};

        for (var x = 0; x < this.constants.canvas_dimensions.w; x++) {
            for (var y = 0; y < this.constants.canvas_dimensions.h; y++) {
                let pixel = pixels[y * this.constants.canvas_dimensions.w + x];

                if (pixel) {
                    let array_index = (y * this.constants.canvas_dimensions.w * 4 + x * 4);
                    let color;

                    if (pixel == -1) {
                        color = COLOR_BLACK;
                    } else {
                        color = palette.getColor(pixel);
                    }
                    imageRGBValues[array_index + 0] = color.r;
                    imageRGBValues[array_index + 1] = color.g;
                    imageRGBValues[array_index + 2] = color.b;
                    imageRGBValues[array_index + 3] = 255; // 255 = full opacity
                }

            }// for Y
        }// for X
        context.putImageData(
            completeImage,
            0, 0,
            0, 0,
            this.constants.canvas_dimensions.w, this.constants.canvas_dimensions.h
        );
    }

    /**
     * Calculate the distance using Pyhtagoras
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {number}
     */
    calculateDistance(x1, y1, x2, y2) {
        const p1 = x1 - x2;
        const p2 = y1 - y2;

        return Math.sqrt(p1 * p1 + p2 * p2);
    }//calculateDistance

    calculateDistanceSquared(x1, y1, x2, y2) {
        const p1 = x1 - x2;
        const p2 = y1 - y2;

        return (p1 * p1 + p2 * p2);
    }//calculateDistance

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
}// class FractalDrawer


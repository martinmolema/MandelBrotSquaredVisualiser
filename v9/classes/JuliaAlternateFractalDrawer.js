import {FractalDrawer ,EPSILONSQRD} from "./FractalDrawer.js";

export class JuliaAlternateFractalDrawer extends FractalDrawer {
    constructor(constants, palettes, maxIterations, name) {
        super(constants, palettes, maxIterations, name);
    }

    /**
     * https://en.wikipedia.org/wiki/Julia_set
     */
    draw() {
        super.draw();

        const pixels = this.constants.pixels;

        let cx = this.constants.boundingbox.x1 + this.constants.boundingbox.dimensions.w / 2;
        let cy = this.constants.boundingbox.y1 - this.constants.boundingbox.dimensions.h / 2;

        //this.constants.update(new Rectangle( -2,2,2,-2));

        let w = this.constants.canvas_dimensions.w;
        let h = this.constants.canvas_dimensions.h;

        let op_x  = this.constants.one_pixel_x;
        let op_y  = this.constants.one_pixel_y;

        let x1 = this.constants.boundingbox.x1;
        let y1 = this.constants.boundingbox.y1;

        let zx = x1;
        for (var x = 0; x < w; x++) {
            let zy = y1;
            for (var y = 0; y< h;y++) {
                let qx = zx*zx;
                let qy = zy*zy;

                // simplification of (x1-x2)^2 + (y1-y2)^2 < 2^2
                // x1 = x, y1 = y, x2 = 0, y2 = 0; we compare the distance to the central point (0,0) to (zx,zy)
                if (qx+qy < 4) {

                    let iterations = 0;
                    let needsMoreIterations = false;
                    let isStable = false;
                    let xtemp;
                    let czx, czy, pzx, pzy,hasConverged;

                    czx = zx; pzx = zx;
                    czy = zy; pzy = zy;

                    let pixelpos = y * w + x;

                    do {
                        qx = czx*czx;
                        qy = czy*czy;

                        // same simplification of (x1-x2)^2 + (y1-y2)^2 < 2^2
                        // x1 = zx, y1 = zy, x2 = 0, y2 = 0; we compare the distance to the central point (0,0) to (zx,zy)
                        isStable = (qx+qy < 4);

                        xtemp = qx - qy;
                        czy = 2 * czx * czy + cy;
                        czx = xtemp + cx;

                        iterations++;

                        hasConverged        = this.calculateDistanceSquared(czx, czy, pzx, pzy) < (EPSILONSQRD);
                        needsMoreIterations = (iterations < this.maxIterations);
                        pzx = czx;
                        pzy = czy;
                    } while (isStable && needsMoreIterations && !hasConverged) ;

                    if (iterations == this.maxIterations) {
                        iterations = -1;
                    }
                    pixels[pixelpos] = iterations;
                }// if distance OK
                zy -= op_y;
            } // for CY
            zx += op_x;
        }// for CX

        this.redrawUsingPalette();
    }
}

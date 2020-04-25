import {FractalDrawer ,EPSILONSQRD} from "./FractalDrawer.js";

export class JuliaFractalDrawer extends FractalDrawer {
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

        let x1 = this.constants.boundingbox.x1;
        let y1 = this.constants.boundingbox.y1;
        let x2 = this.constants.boundingbox.x2;
        let y2 = this.constants.boundingbox.y2;

        let op_x  = this.constants.one_pixel_x;
        let op_y  = this.constants.one_pixel_y;
        let can_w = this.constants.canvas_dimensions.w;

        for (var x = x1; x < x2; x +=  op_x) {
            for (var y = y1; y > y2; y -= op_y) {
                let qx = x*x;
                let qy = y*y;

                // simplification of (x1-x2)^2 + (y1-y2)^2 < 2^2
                // x1 = x, y1 = y, x2 = 0, y2 = 0; we compare the distance to the central point (0,0) to (zx,zy)
                if (qx+qy < 4) {

                    let iterations = 0;
                    let needsMoreIterations = false;
                    let isStable = false;
                    let xtemp;
                    let zx = x;
                    let zy = y;
                    let pzx, pzy,hasConverged;
                    pzx = zx;pzy = zy;

                    let px = Math.round(Math.abs(x - x1) / op_x);
                    let py = Math.round(Math.abs(y1 - y) / op_y);
                    let pixelpos = py * can_w + px;

                    do {
                        qx = zx*zx;
                        qy = zy*zy;

                        // same simplification of (x1-x2)^2 + (y1-y2)^2 < 2^2
                        // x1 = zx, y1 = zy, x2 = 0, y2 = 0; we compare the distance to the central point (0,0) to (zx,zy)
                        isStable = (qx+qy < 4);

                        xtemp = qx - qy;
                        zy = 2 * zx * zy + cy;
                        zx = xtemp + cx;

                        iterations++;

                        hasConverged        = this.calculateDistanceSquared(zx, zy, pzx, pzy) < (EPSILONSQRD);
                        needsMoreIterations = (iterations < this.maxIterations);
                        pzx = zx;
                        pzy = zy;
                    } while (isStable && needsMoreIterations && !hasConverged) ;

                    if (iterations == this.maxIterations) {
                        iterations = -1;
                    }
                    pixels[pixelpos] = iterations;
                }
            } // for CY
        }// for CX

        this.redrawUsingPalette();
    }
}

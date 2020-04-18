import {Constants} from "./Constants.js";

export class ConstantsWithPixels extends Constants {
    constructor(cnvs, x1, y1, x2, y2) {
        super(cnvs, x1, y1, x2, y2);
        this.pixels = new Array(this.canvas_dimensions.w * this.canvas_dimensions.h);
    }
}// ConstantsWithPixels

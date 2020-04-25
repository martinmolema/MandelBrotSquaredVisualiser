import {Constants} from "./Constants.js";

export class ConstantsWithPixels extends Constants {
    constructor(cnvs, x1, y1, x2, y2, name) {
        super(cnvs, x1, y1, x2, y2, name);
        this.pixels = new Array(this.canvas_dimensions.w * this.canvas_dimensions.h);
    }
}// ConstantsWithPixels

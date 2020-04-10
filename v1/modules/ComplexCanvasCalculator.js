export class ComplexCanvasCalculator {

    /**
     * Creates an object to perform scaling calculations
     * @param width
     * @param height
     * @param one_unit
     */
    constructor(width, height, one_unit) {
        this.width = width;
        this.height = height;
        this.one_unit = one_unit;
        this.X0 = width / 2;
        this.Y0 = height / 2;
    }

    translateXtoCanvas(x) {
        return this.X0 + x * this.one_unit;
    }

    translateYtoCanvas(y) {
        return this.Y0 - y * this.one_unit;
    }

    translateXfromCanvas(x) {
        return (x - this.X0) / this.one_unit;
    }

    translateYfromCanvas(y) {
        return (this.Y0 - y) /this.one_unit;
    }

}

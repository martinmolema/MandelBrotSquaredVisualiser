export class CanvasConstants {
    constructor() {
        this.SVG_CIRCLE_ONE = 0;
        this.MAX_ITERATIONS = 0;
        this.SVG_WIDTH = 0;
        this.SVG_HEIGHT = 0;
        this.EPSILON = 0;
        this.SVG_LINE_MARKER_LENGTH = 0;
        this.X0 = 0;
        this.Y0 = 0;
        this.SVG_ONE_UNIT = 0;
    }

    AutoAdjust(){
        this.X0 = this.SVG_WIDTH / 2;
        this.Y0 = this.SVG_HEIGHT / 2;
        this.SVG_CIRCLE_ONE =this.SVG_ONE_UNIT;

        this.MINX = 0;
        this.MAXX = this.SVG_WIDTH;

        this.MINY = 0;
        this.MAXY = this.SVG_HEIGHT;
    }
}

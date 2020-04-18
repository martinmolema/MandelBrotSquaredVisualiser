import {Dimensions, Rectangle} from "./Dimensions.js";

/**
 * A class to hold a lot of constants so they can be easily moved around and manipulated for two kinds of fractals
 */
export class Constants {
    /**
     * Creates the Constants based on the parameters the x1,y1,x2,y2 form the bounding box of the fractal plane (x1,y1) => (x2,y2)
     * @constructor
     * @param {HTMLCanvasElement} cnvs
     * @param {float} x1 left side of the bounding box
     * @param {float} y1 top of the bounding box
     * @param {float} x2 right side of the bounding box
     * @param {float} y2 bottom of the bounding box
     */
    constructor(cnvs, x1, y1, x2, y2) {

        this.boundingbox = new Rectangle(x1, y1, x2, y2);

        this.updateCanvas(cnvs);

        this.maxIterations = 200;
    }// constructor

    /**
     * updates the information in the object from the given canvas
     * mainly handles the new size of the canvas and doing some calculations to update the bounding box
     * @param {HTMLCanvasElement} canvas the canvas-element to use for updating the information
     */
    updateCanvas(canvas) {
        this.canvas = canvas;
        this.canvas_dimensions = new Dimensions(this.canvas.clientWidth, this.canvas.clientHeight);
        this.update(this.boundingbox);
    }

    /**
     * Updates the boundingbox in the fractal plane to the given rectangle
     * @param rectangle
     */
    update(rectangle) {
        this.boundingbox.update(
            rectangle.x1,
            rectangle.y1,
            rectangle.x2,
            rectangle.y2
        );

        this.one_pixel_x = this.boundingbox.dimensions.w / this.canvas_dimensions.w;
        this.one_pixel_y = this.boundingbox.dimensions.h / this.canvas_dimensions.h;
    }// update()

    createHistoryObject() {
        var newObject = new Constants(this.canvas,
            this.boundingbox.x1,
            this.boundingbox.y1,
            this.boundingbox.x2,
            this.boundingbox.y2
        );

        return newObject;
    }

    restoreFromHistoryObject(otherObject) {
        this.update(otherObject.boundingbox);
    }


}// class Constants

import {Dimensions, Rectangle} from "./Dimensions.js";

export class Zoombox {
    constructor(constants, zoom_width, zoom_height, domElement) {

        this.boundingbox        = new Rectangle(-1,-1,-1,-1);
        this.canvas_dimensions  = new Dimensions(constants.canvas_dimensions.w, constants.canvas_dimensions.h);
        this.box_dimensions     = new Dimensions(0,0);
        this.zoom_factor        = new Dimensions(0,0);

        this.elmZoombox = domElement;

        this.updateZoom(zoom_width, zoom_height);

        this.elmZoomX1 = document.getElementById('zoomx1');
        this.elmZoomX2 = document.getElementById('zoomx2');
        this.elmZoomY1 = document.getElementById('zoomy1');
        this.elmZoomY2 = document.getElementById('zoomy2');

    }

    updateCanvas(constants) {
        this.canvas_dimensions  = new Dimensions(constants.canvas_dimensions.w, constants.canvas_dimensions.h);
        this.redraw();
    }

    redraw() {
        this.box_dimensions.update(
            this.canvas_dimensions.w * (this.zoom_factor.w / 100),
            this.canvas_dimensions.h * (this.zoom_factor.h / 100));

        this.elmZoombox.setAttribute("width",  this.box_dimensions.w);
        this.elmZoombox.setAttribute("height", this.box_dimensions.h);

    }
    updateZoom(zoomx, zoomy){
        if (zoomx > 0 && zoomy > 0){
            this.zoom_factor.update(zoomx, zoomy);
            this.redraw();
        }
    }// updateZoom

    /**
     * Updates the fractal-plane information by supplying the (cx,cy) coordinates in the fractal plane.
     * the constants parameter supplies more information on the fractal plane
     * @param constants
     * @param cx
     * @param cy
     */
    update(constants, cx, cy) {

        this.boundingbox.update(
            cx - (this.zoom_factor.w / 100) * constants.boundingbox.dimensions.w / 2,
            cy + (this.zoom_factor.h / 100) * constants.boundingbox.dimensions.h / 2,
            cx + (this.zoom_factor.w / 100) * constants.boundingbox.dimensions.w / 2,
            cy - (this.zoom_factor.h / 100) * constants.boundingbox.dimensions.h / 2,
        );

        // make a box 12% x 8% of the bounding box.

        this.elmZoomX1.textContent = (this.boundingbox.x1.toString()).substr(0, 6);
        this.elmZoomX2.textContent = (this.boundingbox.x2.toString()).substr(0, 6);
        this.elmZoomY1.textContent = (this.boundingbox.y1.toString()).substr(0, 6);
        this.elmZoomY2.textContent = (this.boundingbox.y2.toString()).substr(0, 6);
    }
    updateLocation(mousex, mousey){
        let x = mousex - this.box_dimensions.w / 2;
        let y = mousey - this.box_dimensions.h / 2;

        this.elmZoombox.setAttribute("x", x.toString());
        this.elmZoombox.setAttribute("y", y.toString());

    }
}// class Zoombox

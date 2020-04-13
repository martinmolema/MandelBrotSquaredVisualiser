"use strict";
window.onload = init;

class Dimensions {
    constructor(w,h) {
        this.update(w,h);
    }
    update(w,h){
        this.w = w;
        this.h = h;
    }
}

class Rectangle {
    constructor(x1, y1, x2, y2) {
        this.dimensions = new Dimensions(0,0);
        this.update(x1, y1, x2, y2);
    }

    update(x1, y1, x2, y2){
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        this.dimensions.w = Math.abs(x2 - x1);
        this.dimensions.h = Math.abs(y2 - y1);
    }
}// Rectangle


class Constants {
    constructor(cnvs, x1, y1, x2, y2) {
        this.canvas = cnvs;

        this.boundingbox        = new Rectangle(x1, y1, x2, y2);
        this.canvas_dimensions  = new Dimensions(this.canvas.clientWidth, this.canvas.clientHeight);

        this.update(this.boundingbox);
        this.palette = [];

        this.setPalette(0);
    }// constructor

    setPalette(offset){
        let RGB_FILTER_R = (255 << 16);
        let RGB_FILTER_G = (255 << 8);
        let RGB_FILTER_B = (255);
        const maxRange = 255 * 255 * 255; /* 3 bytes colorcode */

        for (var c = 0; c <= 200; c++) {
            const ratio = c / MAX_ITERATIONS;
            let ratedRatio = Math.ceil(ratio * maxRange); // integer needed!
            ratedRatio += offset;
            ratedRatio = ratedRatio % maxRange;

            let RGB_R = (ratedRatio & RGB_FILTER_R) >> 16;
            let RGB_G = (ratedRatio & RGB_FILTER_G) >> 8;
            let RGB_B = ratedRatio & RGB_FILTER_B;

            this.palette[c] = {RGB_R, RGB_G, RGB_B};
        }
    }// setPalette()

    update(rectangle){
        this.boundingbox.update(
            rectangle.x1,
            rectangle.y1,
            rectangle.x2,
            rectangle.y2
        );

        this.one_pixel_x = this.boundingbox.dimensions.w / this.canvas_dimensions.w;
        this.one_pixel_y = this.boundingbox.dimensions.h / this.canvas_dimensions.h;
    }// update()

    createHistoryObject(){
        var newObject = new Constants(this.canvas,
            this.boundingbox.x1,
            this.boundingbox.y1,
            this.boundingbox.x2,
            this.boundingbox.y2
        );

        //copy the palette
        newObject.palette = [... this.palette];
        return newObject;
    }

    restoreFromHistoryObject(otherObject){
        this.update(otherObject.boundingbox);
        this.palette = [...otherObject.palette];
    }

}// class Constants

class ConstantsWithPixels extends Constants {
    constructor(cnvs, x1, y1, x2, y2) {
        super(cnvs, x1, y1, x2, y2);
        this.pixels = new Array(this.canvas_dimensions.w * this.canvas_dimensions.h);
    }
}// ConstantsWithPixels

class Zoombox {
    constructor(constants, zoom_width, zoom_height) {

        this.boundingbox        = new Rectangle(-1,-1,-1,-1);
        this.canvas_dimensions  = new Dimensions(constants.canvas_dimensions.w, constants.canvas_dimensions.h);
        this.box_dimensions     = new Dimensions(0,0);
        this.zoom_factor        = new Dimensions(0,0);

        this.elmZoombox = document.getElementById('zoombox');

        this.updateZoom(zoom_width, zoom_height);

        this.elmZoomX1 = document.getElementById('zoomx1');
        this.elmZoomX2 = document.getElementById('zoomx2');
        this.elmZoomY1 = document.getElementById('zoomy1');
        this.elmZoomY2 = document.getElementById('zoomy2');

    }
    updateZoom(zoomx, zoomy){
        this.zoom_factor.update(zoomx, zoomy);

        this.box_dimensions.update(
            this.canvas_dimensions.w * (this.zoom_factor.w / 100),
            this.canvas_dimensions.h * (this.zoom_factor.h / 100));

        this.elmZoombox.setAttribute("width",  this.box_dimensions.w);
        this.elmZoombox.setAttribute("height", this.box_dimensions.h);
    }// updateZoom

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
        let y = mousey - this.box_dimensions.h / 2

        this.elmZoombox.setAttribute("x", x);
        this.elmZoombox.setAttribute("y", y);

    }
}// class Zoombox

const MAX_ITERATIONS = 200;
const EPSILON = 0.00003;
var ZOOMBOX_WIDTH_PERCENTAGE = 5; //5% of the horizontal plane
var ZOOMBOX_HEIGHT_PERCENTAGE = 5; //5% of the vertical plane

var elmX1, elmX2, elmY1, elmY2;
var elmCursorX, elmCursorY;
var elmDrawtime, elmLivePreview, elmZoomHistoryInfo;

var zoomhistory;

/**
 * Start the preparations and draw the fractal
 * - calculate constants
 * - setup eventhandlers
 *
 */
function init() {
    const canvas        = document.getElementById('fractal');
    const canvasPreview = document.getElementById('zoompreview');

    var constants     = new ConstantsWithPixels(canvas, -2.0, 2.0, 2.0, -2.0);
    var prevConstants = new ConstantsWithPixels(canvasPreview, -2.0, 2.0, 2.0, -2.0);


    zoomhistory = [];

    /*
    Get references to important elements in the DOM
     */
    // Bounding box info
    elmX1 = document.getElementById('bbx1');
    elmY1 = document.getElementById('bby1');
    elmX2 = document.getElementById('bbx2');
    elmY2 = document.getElementById('bby2');

    // cursor location
    elmCursorX = document.getElementById('cursorX');
    elmCursorY = document.getElementById('cursorY');

    // zoombox information

    elmLivePreview     = document.getElementById("livepreview");
    elmDrawtime        = document.getElementById("drawtime");
    elmZoomHistoryInfo = document.getElementById("zoomhistoryinfo");

    // palet slider
    var paletStart = document.getElementById("rngPalet");

    var eventcatcher = document.getElementById("eventcatcher");

    var zoombox = new Zoombox(constants, ZOOMBOX_WIDTH_PERCENTAGE, ZOOMBOX_HEIGHT_PERCENTAGE);

    AddToHistory(constants);

    elmDrawtime.textContent = draw(constants).toString();
    draw(prevConstants);

    showBoundingBoxInfo(constants);

    eventcatcher.addEventListener("mousemove", (evt) => {

        const mouseX = evt.offsetX;
        const mouseY = evt.offsetY;

        // evt.offsetX and evt.offsetY contain the point clicked on the canvas. these need to be translated to the given bounding box
        const cx = constants.boundingbox.x1 + (mouseX / constants.canvas_dimensions.w) * constants.boundingbox.dimensions.w;
        const cy = constants.boundingbox.y1 - (mouseY / constants.canvas_dimensions.h) * constants.boundingbox.dimensions.h;

        elmCursorX.textContent = cx.toString().substr(0, 6);
        elmCursorY.textContent = cy.toString().substr(0, 6);

        zoombox.update(constants, cx, cy);
        zoombox.updateLocation(mouseX, mouseY);

        if (elmLivePreview.checked) {

            prevConstants.update(zoombox.boundingbox);
            prevConstants.setPalette(parseInt(paletStart.value));
            draw(prevConstants);
        }
    });

    eventcatcher.addEventListener("wheel", (evt) => {
        if (evt.wheelDelta > 0) {
            ZOOMBOX_WIDTH_PERCENTAGE++;
            ZOOMBOX_HEIGHT_PERCENTAGE++;
        } else if (evt.wheelDelta < 0) {
            ZOOMBOX_WIDTH_PERCENTAGE--;
            ZOOMBOX_HEIGHT_PERCENTAGE--;
        }
        zoombox.updateZoom(ZOOMBOX_WIDTH_PERCENTAGE, ZOOMBOX_HEIGHT_PERCENTAGE);
    });

    window.addEventListener("keypress", (evt) => {
        switch (evt.code) {
            case "+":
            case "NumpadAdd":
                ZOOMBOX_WIDTH_PERCENTAGE++;
                ZOOMBOX_HEIGHT_PERCENTAGE++;
                zoombox.updateZoom(constants, ZOOMBOX_WIDTH_PERCENTAGE, ZOOMBOX_HEIGHT_PERCENTAGE);
                break;
            case "-":
            case "NumpadSubtract":
                ZOOMBOX_WIDTH_PERCENTAGE--;
                ZOOMBOX_HEIGHT_PERCENTAGE--;
                zoombox.updateZoom(constants, ZOOMBOX_WIDTH_PERCENTAGE, ZOOMBOX_HEIGHT_PERCENTAGE);
                break;
        }

    });

    eventcatcher.addEventListener("dblclick", (evt) => {

        evt.preventDefault();
        evt.stopPropagation();

        AddToHistory(constants);

        constants.update(zoombox.boundingbox);

        elmDrawtime.textContent = draw(constants);
        showBoundingBoxInfo(constants);

        return false;
    });

    eventcatcher.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();

        // left mouse
        prevConstants.update(zoombox.boundingbox);
        draw(prevConstants);

        return false;
    });

    eventcatcher.addEventListener("contextmenu", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        // right mouse
        if (zoomhistory.length > 0) {
            constants.restoreFromHistoryObject( GetFromHistory() );
            showBoundingBoxInfo(constants);
            draw(constants);
        }
        return false;
    });


    document.getElementById("redraw").addEventListener("click", (evt) => {
        AddToHistory(constants);
        if (prevConstants) {
            constants = prepareconstants(canvas,
                prevConstants.boundingbox.x1,
                prevConstants.boundingbox.y1,
                prevConstants.boundingbox.x2,
                prevConstants.boundingbox.y2,
            );
            constants.colorpalette = palette;
            elmDrawtime.textContent = draw( constants);
        }
    });

    paletStart.addEventListener("input", (evt) => {
        constants.setPalette(parseInt(paletStart.value));
        redrawUsingPalette(constants);

        if (prevConstants) {
            prevConstants.setPalette(parseInt(paletStart.value));
            redrawUsingPalette(prevConstants);
        }
    }, false);
}

function AddToHistory(constants) {

    zoomhistory.push(constants.createHistoryObject());
    elmZoomHistoryInfo.textContent = zoomhistory.length;

    return zoomhistory.length;
}

function GetFromHistory() {
    if (zoomhistory.length == 0) return NULL;
    var result = zoomhistory.pop();
    elmZoomHistoryInfo.textContent = zoomhistory.length;
    return result;
}

function showBoundingBoxInfo(constants) {
    elmX1.textContent = constants.boundingbox.x1.toString().substr(0, 6);
    elmX2.textContent = constants.boundingbox.x2.toString().substr(0, 6);
    elmY1.textContent = constants.boundingbox.y1.toString().substr(0, 6);
    elmY2.textContent = constants.boundingbox.y2.toString().substr(0, 6);
}

/**
 * Calculates and draws the Mandelbrot fractal based on the supplied constants. First all the pixels are calculated storing
 * only the iterations. The colors are drawn from the palette and pushed into a ImageData in a separate function.
 * This way the palette can be cycled using the calculations stored in another array! This saves a lot of time when
 * changing the palette and can yield some very nice animations when using a slider!
 * @param localConst
 * @returns {number}
 */
function draw(localConst) {
    var time_start = Date.now();

    const pixels      = localConst.pixels;
    const localCanvas = localConst.canvas;

    // (CX, CY) represents the constant (as a complex number) used in the Mandelbrot calculations
    for (var cx = localConst.boundingbox.x1; cx < localConst.boundingbox.x2; cx += localConst.one_pixel_x) {
        for (var cy = localConst.boundingbox.y1; cy > localConst.boundingbox.y2; cy -= localConst.one_pixel_y) {

            let px = Math.round((Math.abs(cx - localConst.boundingbox.x1) / localConst.boundingbox.dimensions.w) * localConst.canvas_dimensions.w);
            let py = Math.round((Math.abs(localConst.boundingbox.y1 - cy) / localConst.boundingbox.dimensions.h) * localConst.canvas_dimensions.h);
            let pixelpos = py * localConst.canvas_dimensions.w + px;

            pixels[pixelpos] = -1;

            if (calculateDistance(0, 0, cx, cy) < 2) {
                let startx = 0;
                let starty = 0;
                let prevx = 0;
                let prevy = 0;

                let iterations = 0;
                let needsMoreIterations = false;
                let isStable = false;
                let hasConverged = false;

                do {
                    // first square (startx, starty)
                    let xy = multiply(startx, starty, startx, starty);
                    startx = xy.newx;
                    starty = xy.newy;

                    // add constant
                    startx += cx;
                    starty += cy;

                    let distance = calculateDistance(startx, starty, prevx, prevy);

                    prevx = startx;
                    prevy = starty;

                    isStable = (calculateDistance(0, 0, startx, starty) < 2);
                    hasConverged = (distance < EPSILON);

                    needsMoreIterations = (++iterations) < MAX_ITERATIONS;
                } while (needsMoreIterations && isStable && !hasConverged) ;
                let color;


                if (isStable) {
                    iterations = -1;
                }
                pixels[pixelpos] = iterations;
            } // if distance OK

        } // for CY
    }// for CX

    redrawUsingPalette(localConst);

    var time_end = Date.now();

    return time_end - time_start;
} // draw()

/**
 * This function will actually draw the image on the Canvas (supplied in the localConstants Object) using the already
 * available calculations in the pixels-array (also in the localConstants object). The colors are drawn from a palette.
 * This way the image can be redrawn very fast using an different palette, which can yield some nice results when
 * quickly drawing them with a small difference in palette start (creating animated vortexes!)
 * @param localConstants
 */
function redrawUsingPalette(localConstants) {

    var pixels = localConstants.pixels;
    var canvas = localConstants.canvas;

    // now put the image that is in memory only, on the canvas
    var context = canvas.getContext('2d');
    context.fillStyle="black";
    context.fillRect(0,0,localConstants.canvas_dimensions.w, localConstants.canvas_dimensions.h);
    var completeImage = context.createImageData(localConstants.canvas_dimensions.w, localConstants.canvas_dimensions.h);
    var imageRGBValues = completeImage.data;

    const COLOR_BLACK = {RGB_R: 0, RGB_G: 0, RGB_B: 0};

    for (var x = 0; x < localConstants.canvas_dimensions.w; x++) {
        for (var y = 0; y < localConstants.canvas_dimensions.h; y++) {
            let pixel = pixels[y * localConstants.canvas_dimensions.w + x];

            if (pixel) {
                let array_index = (y * localConstants.canvas_dimensions.w * 4 + x * 4);
                let color;

                if (pixel == -1) {
                    color = COLOR_BLACK;
                } else {
                    color = localConstants.palette[pixel];
                }
                imageRGBValues[array_index + 0] = color.RGB_R;
                imageRGBValues[array_index + 1] = color.RGB_G;
                imageRGBValues[array_index + 2] = color.RGB_B;
                imageRGBValues[array_index + 3] = 255; // 255 = full opacity
            }

        }// for Y
    }// for X
    context.putImageData(
        completeImage,
        0, 0,
        0, 0,
        localConstants.canvas_dimensions.w, localConstants.canvas_dimensions.h
    );
} // redrawUsingPalette

/**
 * Calculate the distance using Pyhtagoras
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
function calculateDistance(x1, y1, x2, y2) {
    const p1 = x1 - x2;
    const p2 = y1 - y2;

    return Math.sqrt(p1 * p1 + p2 * p2);
}

/**
 * Multiply two points in space.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {{newy: number, newx: number}}
 */
function multiply(x1, y1, x2, y2) {
    x1 *= 1.0;
    x2 *= 1.0;
    y1 *= 1.0;
    y2 *= 1.0;
    const newReal = (x1 * x2 - y1 * y2);
    const newImaginary = (x1 * y2 + y1 * x2);

    return {newx: newReal, newy: newImaginary};
}

window.onload = init;

const MAX_ITERATIONS = 200;
const EPSILON = 0.00003;
var ZOOMBOX_WIDTH_PERCENTAGE = 5; //5% of the horizontal plane
var ZOOMBOX_HEIGHT_PERCENTAGE = 5; //5% of the vertical plane
var zbox_h, zbox_w;

var elmX1, elmX2, elmY1, elmY2;
var elmCursorX, elmCursorY;
var zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2;
var elmZoombox, elmDrawtime, elmLivePreview, elmZoomHistoryInfo;

var mouseX, mouseY;

var zoomhistory;

/**
 * Start the preparations and draw the fractal
 * - calculate constants
 * - setup eventhandlers
 *
 */
function init() {
    canvas = document.getElementById('fractal');
    canvasPreview = document.getElementById('zoompreview');
    paletStart = document.getElementById("rngPalet");

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
    elmZoomX1 = document.getElementById('zoomx1');
    elmZoomX2 = document.getElementById('zoomx2');
    elmZoomY1 = document.getElementById('zoomy1');
    elmZoomY2 = document.getElementById('zoomy2');

    elmZoombox         = document.getElementById('zoombox');
    elmLivePreview     = document.getElementById("livepreview");
    elmDrawtime        = document.getElementById("drawtime");
    elmZoomHistoryInfo = document.getElementById("zoomhistoryinfo");

    var eventcatcher = document.getElementById("eventcatcher");

    var palette = setupPalette(0);

    var constants = prepareconstants(canvas, -2.0, 2.0, 2.0, -2.0);
    constants.colorpalette = palette;
    setupZoombox(constants);

    AddToHistory(constants);

    elmDrawtime.textContent = draw(canvas, constants);
    showBoundingBoxInfo(constants);

    eventcatcher.addEventListener("mousemove", (evt) => {

        mouseX = evt.offsetX;
        mouseY = evt.offsetY;

        // evt.offsetX and evt.offsetY contain the point clicked on the canvas. these need to be translated to the given bounding box
        const cx = constants.boundingBoxX1 + (mouseX / constants.canvas_width ) * constants.boundingBoxWidth;
        const cy = constants.boundingBoxY1 - (mouseY / constants.canvas_height) * constants.boundingBoxHeight;

        elmCursorX.textContent = cx.toString().substr(0,6);
        elmCursorY.textContent = cy.toString().substr(0,6);

        // make a box 12% x 8% of the bounding box.
        zoombox_x1 = cx - (ZOOMBOX_WIDTH_PERCENTAGE  / 100) * constants.boundingBoxWidth  / 2;
        zoombox_x2 = cx + (ZOOMBOX_WIDTH_PERCENTAGE  / 100) * constants.boundingBoxWidth  / 2;
        zoombox_y1 = cy + (ZOOMBOX_HEIGHT_PERCENTAGE / 100) * constants.boundingBoxHeight / 2;
        zoombox_y2 = cy - (ZOOMBOX_HEIGHT_PERCENTAGE / 100) * constants.boundingBoxHeight / 2;

        elmZoomX1.textContent = (zoombox_x1.toString()).substr(0,6);
        elmZoomX2.textContent = (zoombox_x2.toString()).substr(0,6);
        elmZoomY1.textContent = (zoombox_y1.toString()).substr(0,6);
        elmZoomY2.textContent = (zoombox_y2.toString()).substr(0,6);

        let x = mouseX - zbox_w / 2;
        let y = mouseY - zbox_h / 2

        elmZoombox.setAttribute("x", x);
        elmZoombox.setAttribute("y", y);

        if (elmLivePreview.checked){

            let tempConstants = prepareconstants(canvasPreview, zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2);
            lastclick         = prepareconstants(canvasPreview, zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2);
            tempConstants.colorpalette = setupPalette(parseInt(paletStart.value));
            draw(canvasPreview, tempConstants);
        }
    });

    eventcatcher.addEventListener("wheel", (evt) => {
        if (evt.wheelDelta > 0) {
            ZOOMBOX_WIDTH_PERCENTAGE++;
            ZOOMBOX_HEIGHT_PERCENTAGE++;
        }
        else if (evt.wheelDelta <0) {
            ZOOMBOX_WIDTH_PERCENTAGE--;
            ZOOMBOX_HEIGHT_PERCENTAGE--;
        }
        setupZoombox(constants);
    });

    window.addEventListener("keypress", (evt) => {
        switch(evt.code){
            case "+":
            case "NumpadAdd":
                ZOOMBOX_WIDTH_PERCENTAGE++;
                ZOOMBOX_HEIGHT_PERCENTAGE++;
                break;
            case "-":
            case "NumpadSubtract":
                ZOOMBOX_WIDTH_PERCENTAGE--;
                ZOOMBOX_HEIGHT_PERCENTAGE--;
                break;
        }
        setupZoombox(constants);
    });

    eventcatcher.addEventListener("dblclick", (evt) => {

        evt.preventDefault();
        evt.stopPropagation();

        AddToHistory(constants);

        constants = prepareconstants(canvas, zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2);
        constants.colorpalette = palette;

        elmDrawtime.textContent = draw(canvas, constants);
        showBoundingBoxInfo(constants);

        return false;
    });

    var lastclick = null;

    eventcatcher.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();

        // left mouse
        let tempConstants = prepareconstants(canvasPreview, zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2);
        lastclick = prepareconstants(canvasPreview, zoombox_x1, zoombox_y1, zoombox_x2, zoombox_y2);
        tempConstants.colorpalette = palette;
        draw(canvasPreview, tempConstants);

        return false;
    });

    eventcatcher.addEventListener("contextmenu", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        // right mouse
        if (zoomhistory.length > 0) {
            constants = GetFromHistory();
            showBoundingBoxInfo(constants);
            draw(canvas, constants);
        }
        return false;
    });


    document.getElementById("redraw").addEventListener("click", (evt) => {
        AddToHistory(constants);
        if (lastclick) {
            constants = prepareconstants(canvas,
                lastclick.boundingBoxX1,
                lastclick.boundingBoxY1,
                lastclick.boundingBoxX2,
                lastclick.boundingBoxY2,
                );
            constants.colorpalette = palette;
            elmDrawtime.textContent = draw(canvas, constants);

        }
    });

    paletStart.addEventListener("change", (evt) => {
        palette = setupPalette(parseInt(paletStart.value));

        if (lastclick) {
            lastclick.colorpalette = palette;
            draw(canvasPreview, lastclick);
        }
    }, false);
}

function AddToHistory(constants){
    zoomhistory.push(constants);
    elmZoomHistoryInfo.textContent = zoomhistory.length;
}

function GetFromHistory(){
    if (zoomhistory.length == 0) return NULL;
    var result = zoomhistory.pop();
    elmZoomHistoryInfo.textContent = zoomhistory.length;
    return result;
}

function showBoundingBoxInfo(constants){
    elmX1.textContent = constants.boundingBoxX1.toString().substr(0,6);
    elmX2.textContent = constants.boundingBoxX2.toString().substr(0,6);
    elmY1.textContent = constants.boundingBoxY1.toString().substr(0,6);
    elmY2.textContent = constants.boundingBoxY2.toString().substr(0,6);

}

function setupPalette(color_offset){
    var palette = [];
    let RGB_FILTER_R = (255 << 16);
    let RGB_FILTER_G = (255 << 8);
    let RGB_FILTER_B = (255);
    const maxRange = 255 * 255 * 255; /* 3 bytes colorcode */

    for (var c = 0; c <= 200; c++) {
        const ratio = c / MAX_ITERATIONS;
        let ratedRatio = Math.ceil(ratio * maxRange); // integer needed!
        ratedRatio += color_offset;
        ratedRatio = ratedRatio % maxRange;

        let RGB_R = (ratedRatio & RGB_FILTER_R)>>16;
        let RGB_G = (ratedRatio & RGB_FILTER_G)>>8;
        let RGB_B = ratedRatio & RGB_FILTER_B;

        palette[c] = {RGB_R,RGB_G,RGB_B};
    }
    return palette;
}// setupPalette

function setupZoombox(constants){
    zbox_h = constants.canvas_height * (ZOOMBOX_HEIGHT_PERCENTAGE / 100);
    zbox_w = constants.canvas_height * (ZOOMBOX_WIDTH_PERCENTAGE / 100);

    elmZoombox.setAttribute("width", zbox_w);
    elmZoombox.setAttribute("height", zbox_h);
}

/**
 * Create an object to collect some constants for later calculations
 * @param cnvs
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {{boundingBoxX2: *, boundingBoxX1: *, boundingBoxY2: *, canvas_width: number, canvas_height: number, palet_start: number, boundingBoxY1: *}}
 */
function prepareconstants(cnvs, x1, y1, x2, y2) {
    var lc = {
        boundingBoxX1: x1,
        boundingBoxY1: y1,
        boundingBoxX2: x2,
        boundingBoxY2: y2,
        canvas_width: cnvs.clientWidth,
        canvas_height: cnvs.clientHeight,
        palet_start: 0,
    };

    lc.boundingBoxWidth = Math.abs(lc.boundingBoxX1 - lc.boundingBoxX2);
    lc.boundingBoxHeight = Math.abs(lc.boundingBoxY1 - lc.boundingBoxY2);

    lc.one_pixel_x = lc.boundingBoxWidth / lc.canvas_width;
    lc.one_pixel_y = lc.boundingBoxHeight / lc.canvas_height;

    return lc;
}


function draw(canvas, constants) {
    var time_start = Date.now();

    var context        = canvas.getContext('2d');
    var completeImage  = context.createImageData(constants.canvas_width, constants.canvas_height);
    var imageRGBValues = completeImage.data;

    COLOR_BLACK = { RGB_R:0, RGB_G:0, RGB_B:0};

    // (CX, CY) represents the constant (as a complex number) used in the Mandelbrot calculations
    for (var cx = constants.boundingBoxX1; cx < constants.boundingBoxX2; cx += constants.one_pixel_x) {
        for (var cy = constants.boundingBoxY1; cy > constants.boundingBoxY2; cy -= constants.one_pixel_y) {
            if (calcDistance(0, 0, cx, cy) < 2) {
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

                    let distance = calcDistance(startx, starty, prevx, prevy);

                    prevx = startx;
                    prevy = starty;

                    isStable = (calcDistance(0, 0, startx, starty) < 2);
                    hasConverged = (distance < EPSILON);

                    needsMoreIterations = (++iterations) < MAX_ITERATIONS;
                } while (needsMoreIterations && isStable && !hasConverged) ;
                let color;

                let px = Math.round((Math.abs(cx - constants.boundingBoxX1) / constants.boundingBoxWidth) * constants.canvas_width);
                let py = Math.round((Math.abs(constants.boundingBoxY1 - cy) / constants.boundingBoxHeight) * constants.canvas_height);

                if (isStable) {
                    color = COLOR_BLACK;
                } else {
                    color = constants.colorpalette[iterations];
                }
                let array_index =  (py * constants.canvas_width * 4 + px * 4);

                imageRGBValues[array_index + 0] = color.RGB_R;
                imageRGBValues[array_index + 1] = color.RGB_G;
                imageRGBValues[array_index + 2] = color.RGB_B;
                imageRGBValues[array_index + 3] = 255; // 255 = full opacity
            } // if distance OK
        } // for CY
    }// for CX
    // now put the image that is in memory only, on the canvas
    context.putImageData(completeImage,0,0, 0, 0, constants.canvas_width, constants.canvas_height);

    var time_end = Date.now();

    return time_end - time_start;
}

function calcDistance(x1, y1, x2, y2) {
    const p1 = x1 - x2;
    const p2 = y1 - y2;

    return Math.sqrt(p1 * p1 + p2 * p2);
}

function multiply(x1, y1, x2, y2) {
    x1 *= 1.0;
    x2 *= 1.0;
    y1 *= 1.0;
    y2 *= 1.0;
    const newReal = (x1 * x2 - y1 * y2);
    const newImaginary = (x1 * y2 + y1 * x2);

    return {newx: newReal, newy: newImaginary};
}

/**
 * Calculates an HTML colorcode based on the number of iterations
 * @param iterations
 * @returns {string}
 */
function getColorcode(iterations, color_offset) {
    const offset = color_offset;
    const maxRange = 255 * 255 * 255; /* 3 bytes colorcode */
    const ratio = iterations / MAX_ITERATIONS;
    let ratedRatio = Math.ceil(ratio * maxRange); // integer needed!
    ratedRatio += offset;
    ratedRatio = ratedRatio % maxRange;

    let hexValue = ("00000" + ratedRatio.toString(16)).slice(-6);

    return "#" + hexValue;
}

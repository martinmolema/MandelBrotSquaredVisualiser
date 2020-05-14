import { PaletteCollection } from "./Palette.js";
import {ConstantsWithPixels} from "./ConstantsWithPixels.js";
import {HistoryList} from "./HistoryList.js";
import {Zoombox} from "./Zoombox.js";
import {Rectangle} from "./Dimensions.js";

const EPSILON = 0.00003;

export class GUIDriver {

    constructor(maxIterations) {
        this.maxIterations = maxIterations;
        this.zoombox_width_percentage = 5;
        this.zoombox_height_percentage = 5;

        this.setupGUIElements();
        this.setupCanvas();
        this.setupPalette();
        this.initConstants();
        this.setupEventhandlers();

        this.redrawBoth();

    }// constructor

    /**
     * Creates Objects for palette and after initialisation will inform the GUI of the current values.
     */
    setupPalette(){
        this.palettes = new PaletteCollection();
        this.palettes.addPalette("RGB",this.maxIterations);
        this.palettes.addPalette("HSL",this.maxIterations);

        this.palettes.setActive("RGB");

        this.elmPaletteHSLSaturation.value = this.palettes.get("HSL").saturation().toString();
        this.elmPaletteHSLLightness.value  = this.palettes.get("HSL").lightness().toString();
    }

    setupCanvas(){
        /**
         * checks if the current canvas size is stored in the browser's storage
         */
        const lsCanvasW = localStorage.getItem("CANVAS_WIDTH");
        const lsCanvasH = localStorage.getItem("CANVAS_HEIGHT");

        if (lsCanvasH && lsCanvasW) {
            this.elmCanvasWidthSlider.value  = lsCanvasW.toString();
            this.elmCanvasHeightSlider.value = lsCanvasH.toString();
        }

        let w = parseInt(this.elmCanvasWidthSlider.value);
        let h = parseInt(this.elmCanvasHeightSlider.value);

        this.canvasLargeMandelbrot.width  = w;
        this.canvasLargeMandelbrot.height = h;

        localStorage.setItem("CANVAS_WIDTH",  this.canvasLargeMandelbrot.width);
        localStorage.setItem("CANVAS_HEIGHT", this.canvasLargeMandelbrot.height);

    }// setupCanvas()

    initConstants(){
        this.constants        = new ConstantsWithPixels(this.canvasLargeMandelbrot, 0, 0, 0, 0);
        this.constantsPreview = new ConstantsWithPixels(this.canvasPreview, 0, 0, 0, 0);
        this.constantsExport  = new ConstantsWithPixels(this.canvasExportM, 0,0,0,0);

        this.constantsExportM.setFeedbackElement(document.getElementById("progressbar"));

        this.adjustCanvasDimensions(4);

        this.startBoundingBox = this.constants.boundingbox.clone();

        this.historyZoom    = new HistoryList("zoom");
        this.historyPalette = new HistoryList("palette");

        // FIXME: start from history if possible

        let historyStart = this.historyZoom.peek();
        let paletteStart = this.historyPalette.peek();
        if (historyStart !== null && paletteStart !== null) {

            this.constants.restoreFromHistoryObject(historyStart);
            this.constantsPreview.restoreFromHistoryObject(historyStart);
            this.palettes.restoreFromHistoryObject(paletteStart);

            this.redrawBoth();
        }

        this.zoombox = new Zoombox(this.constants, this.zoombox_width_percentage, this.zoombox_height_percentage, this.elmZoombox);

        this.mouseX = 0; this.mouseY = 0;

    }// initConstants()

    /**
     * Start the preparations and draw the fractal
     * - calculate constants
     * - setup eventhandlers
     *
     */
    setupGUIElements() {
        /*
        Get references to important elements in the DOM
         */
        this.canvas        = document.getElementById('fractal');
        this.canvasPreview = document.getElementById('zoompreview');
        this.canvasExport  = document.getElementById("export");
        this.svgOverlay    = document.getElementById('overlay');

        this.elmCanvasWidthSlider = document.getElementById("canvas_width");
        this.elmCanvasHeightSlider = document.getElementById("canvas_height");
        this.elmCanvasWidthText = document.getElementById("canvas_width_text");
        this.elmCanvasHeightText = document.getElementById("canvas_height_text");

        this.elmPaletteHSLLightness = document.getElementById("hslLightness");
        this.elmPaletteHSLSaturation = document.getElementById("hslSaturation");
        this.elmHSLInfo = document.getElementById("hslinfo");

        // Bounding box info
        this.elmX1 = document.getElementById('bbx1');
        this.elmY1 = document.getElementById('bby1');
        this.elmX2 = document.getElementById('bbx2');
        this.elmY2 = document.getElementById('bby2');

        // cursor location
        this.elmCursorX = document.getElementById('cursorX');
        this.elmCursorY = document.getElementById('cursorY');

        // other information
        this.elmLivePreview     = document.getElementById("livepreview");
        this.elmDrawtime        = document.getElementById("drawtime");
        this.elmZoomHistoryInfo = document.getElementById("zoomhistoryinfo");

        this.eventcatcher   = document.getElementById("eventcatcher");
        this.elmPaletslider = document.getElementById("rngPalet");
        this.elmZoombox     = document.getElementById('zoombox');
        this.elmZoomfactor  = document.getElementById("zoomfactor");

        this.elmSetPaletteRGB = document.getElementById("paletteRGB");
        this.elmSetPaletteHSL = document.getElementById("paletteHSL");

        this.elmHelptext = document.getElementById("helptext");
        this.elmSliderExportWidth = document.getElementById("sliderExportWidth");
        this.elmExportWidthText = document.getElementById("exportWidthValue");
        this.elmExportWidthText.textContent = this.elmSliderExportWidth.value;
    }

    redrawMainFractal(){
        let value = this.draw(this.constants);

        this.elmDrawtime.textContent = value;
        this.showBoundingBoxInfo(this.constants);
    }

    redrawZoomwindow(){
        let value = this.draw(this.constantsPreview);
        //value.next();
    }

    redrawBoth(){
        this.redrawMainFractal();
        this.redrawZoomwindow();
    }

    setupEventhandlers(){
        this.elmCanvasWidthSlider.addEventListener("change", () => {
            let w = parseInt(this.elmCanvasWidthSlider.value);

            this.canvasLargeMandelbrot.width = w;
            localStorage.setItem("CANVAS_WIDTH", w);

            this.clearHistory();

            this.adjustCanvasDimensions(4);
            this.zoombox.updateCanvas(this.constants);
            this.redrawBoth();

        }); // eventListener change (slider width)

        this.elmCanvasHeightSlider.addEventListener("change", () => {
            let h = parseInt(this.elmCanvasHeightSlider.value);
            this.canvasLargeMandelbrot.height = h;
            localStorage.setItem("CANVAS_HEIGHT", h);

            this.clearHistory();

            this.adjustCanvasDimensions(4);
            this.zoombox.updateCanvas(this.constants);
            this.redrawBoth();
        }); // eventListener change (slider height)

        /**
         * React to mouse moves to put the zoombox in the right position. if LivePreview is enabled, also show the preview immediately
         */
        this.eventcatcher.addEventListener("mousemove", (evt) => {

            // save mouse positions ; usefull if the zoombox is later changed in size
            this.mouseX = evt.offsetX;
            this.mouseY = evt.offsetY;

            this.recalculateZoombox();

        }); // eventListener  mousemove (eventcatcher)

        /**
         * Listen to MouseWheel events. this will resize the zoombox.
         */
        this.eventcatcher.addEventListener("wheel", (evt) => {
            if (evt.wheelDelta > 0) {
                this.zoombox_width_percentage++;
                this.zoombox_height_percentage++;
            } else if (evt.wheelDelta < 0) {
                this.zoombox_width_percentage--;
                this.zoombox_height_percentage--;
            }
            this.zoombox.updateZoom(this.zoombox_width_percentage, this.zoombox_height_percentage);
            this.zoombox.updateLocation(this.mouseX, this.mouseY);
        }); // eventListener wheel (eventcatcher)

        window.addEventListener("keydown", (evt) => {
            switch (evt.key) {
                case "+":
                case "=":
                    this.zoombox_width_percentage++;
                    this.zoombox_height_percentage++;
                    this.zoombox.updateZoom(this.zoombox_width_percentage, this.zoombox_height_percentage);
                    this.zoombox.updateLocation(this.mouseX, this.mouseY);
                    break;
                case "-":
                    this.zoombox_width_percentage--;
                    this.zoombox_height_percentage--;
                    this.zoombox.updateZoom(this.zoombox_width_percentage, this.zoombox_height_percentage);
                    this.zoombox.updateLocation(this.mouseX, this.mouseY);
                    break;
                case ".":
                case ">":
                    let newPaletValueUp = parseInt(this.elmPaletslider.value) + 1;
                    this.elmPaletslider.value = newPaletValueUp;
                    this.palettes.getActive().setOffset(newPaletValueUp);

                    this.paletteChangedForceRedraw();
                    break;
                case ",":
                case "<":
                    let newPaletValueDown = parseInt(this.elmPaletslider.value) - 1;
                    this.elmPaletslider.value = newPaletValueDown;
                    this.palettes.getActive().setOffset(newPaletValueDown);
                    this.paletteChangedForceRedraw();
                    break;
                case "Enter":
                    this.addToHistoryAndRedraw();
                    break;
                case "Backspace":
                    this.historyGoBack();
                    break;
                case "r":
                    this.setActivePalette("RGB");
                    break;
                case "h":
                    this.setActivePalette("HSL");
                    break;
                case "z":
                    this.elmZoombox.classList.toggle("invisible");
                    break;
                case "/":
                case "?":
                    this.elmHelptext.style.display="block";
                    break;
            }// switch key

        });// eventListener KeyPress (window)

        this.eventcatcher.addEventListener("dblclick", (evt) => {

            evt.preventDefault();
            evt.stopPropagation();

            this.addToHistoryAndRedraw();

            return false;
        });

        this.eventcatcher.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            // left mouse
            this.constantsPreview.update(this.zoombox.boundingbox);
            this.redrawZoomwindow();

            return false;
        });// eventListener click (eventcatcher)

        this.eventcatcher.addEventListener("contextmenu", evt => {
            evt.preventDefault();
            evt.stopPropagation();
            // right mouse
            this.historyGoBack();
            return false;
        });// eventListener contextmenu

        this.elmPaletslider.addEventListener("input", () => {
                this.palettes.getActive().setOffset(parseInt(this.elmPaletslider.value));
                this.paletteChangedForceRedraw();
            }, false
        );// eventListener input (paletslider)

        document.getElementById("btnReset").addEventListener("click", () => {
            this.constants.update(this.startBoundingBox);
            this.constantsPreview.update(this.startBoundingBox);

            this.clearHistory();

            this.redrawBoth();
        });

        document.getElementById("paletteRGB").addEventListener("click", () => {
            this.setActivePalette("RGB");
        });
        document.getElementById("paletteHSL").addEventListener("click", () => {
            this.setActivePalette("HSL");
        });

        this.elmPaletteHSLLightness.addEventListener("click", () => {
            this.palettes.get("HSL").setLightness(parseInt(this.elmPaletteHSLLightness.value));
            this.paletteChangedForceRedraw();
        });

        this.elmPaletteHSLSaturation.addEventListener("click", () => {
            this.palettes.get("HSL").setSaturation(parseInt(this.elmPaletteHSLSaturation.value));
            this.paletteChangedForceRedraw();
        });

        document.getElementById("btnShowHelp").addEventListener("click", () => {
            this.elmHelptext.style.display="block";
        });

        document.getElementById("btnCloseHelp").addEventListener("click", () => {
            this.elmHelptext.style.display="none";
        });

        this.elmSliderExportWidth.addEventListener("change", (evt) => {
            this.elmExportWidthText.textContent = this.elmSliderExportWidth.value;
            this.canvasExportM.width = parseInt(this.elmSliderExportWidth.value);
        });

        document.getElementById("btnExport").addEventListener("click", () => {
            // get the bounding box to be drawn using the main fractal boundingbox
            var rect = this.constants.boundingbox;

            // update the off-screen canvas to reflect the current fractal size and bounding box
            this.constantsExportM.update(rect);

            this.canvasExportM.height = this.canvasExportM.width * rect.ratioHW;
            this.constantsExportM.updateCanvas(this.canvasExportM);

            let msg = 'Will export this fractal in a new tab page using resolution of ' +
                this.constantsExportM.canvas_dimensions.w +
                "x" + this.constantsExportM.canvas_dimensions.h +" pixels. This may take a while. Please be patient.";
            alert(msg);

            // do the actual drawing
            this.draw(this.constantsExportM);

            // open the result in new tab
            var win = window.open();
            if (!win) {
                alert("Browser will not allow new tab to be opened. Please give permission!");
            }else {
                // convert te contents of the canvas to a BLOB. This BLOB can be used to convert to and
                // ObjectURL containing an image that can be used as an image-source, or as we do here:
                // set the URL of the new window to the image.
                this.canvasExportM.toBlob(function (blob) {
                    var url = URL.createObjectURL(blob);
                    win.document.location = url;
                });
            }//if/then window opened
        });
    }// setupEventhandlers()

    /**
     * Sets the current palette to the one named in de parameter name. the GUI is adapted as necessary
     * @param {string} name
     */
    setActivePalette(name){

        this.guiSyncPalette(name);

        this.palettes.setActive(name);
        this.paletteChangedForceRedraw();

    }//setActivePalette()

    /**
     * This will ensure palette information to be reflected in the GUI
     * @param {string} name
     */
    guiSyncPalette(name){
        if (name == "HSL"){
            this.elmHSLInfo.classList.remove("invisible");
            this.elmSetPaletteHSL.checked = true;  // the browser will take care of unchecking the other radio buttons
        }
        else{
            this.elmHSLInfo.classList.add("invisible");
            this.elmSetPaletteRGB.checked = true; // the browser will take care of unchecking the other radio buttons
        }
    }

    /**
     * Force redraw with a new palette, based on the new palet start value.
     */
    paletteChangedForceRedraw() {
        this.redrawUsingPalette(this.constants);
        this.redrawUsingPalette(this.constantsPreview);
    }// paletteChangedForceRedraw

    /**
     * Recalculates the zoombox position and boundingbox in the fractal plane. the global (x,y) mouse position is used.
     */
    recalculateZoombox(){
        // evt.offsetX and evt.offsetY contain the point clicked on the canvas. these need to be translated to the given bounding box (in the Fractal plane)
        const cx = this.constants.boundingbox.x1 + (this.mouseX / this.constants.canvas_dimensions.w) * this.constants.boundingbox.dimensions.w;
        const cy = this.constants.boundingbox.y1 - (this.mouseY / this.constants.canvas_dimensions.h) * this.constants.boundingbox.dimensions.h;

        // Update GUI information on current cursor position in the Fractal plane
        this.elmCursorX.textContent = cx.toString().substr(0, 6);
        this.elmCursorY.textContent = cy.toString().substr(0, 6);

        // Adjust the zoombox : position in fractal plane and (x,y) location on screen
        this.zoombox.update(this.constants, cx, cy);
        this.zoombox.updateLocation(this.mouseX, this.mouseY);

        // If live preview is enabled use the zoombox to draw the preview.
        if (this.elmLivePreview.checked) {
            this.constantsPreview.update(this.zoombox.boundingbox);
            this.redrawZoomwindow();
        }

    }

    /**
     * Puts the bounding box information on the GUI by filling the right elements with information about the
     * bounding box of the main fractal window
     */
    showBoundingBoxInfo() {
        this.elmX1.textContent = this.constants.boundingbox.x1.toString().substr(0, 6);
        this.elmX2.textContent = this.constants.boundingbox.x2.toString().substr(0, 6);
        this.elmY1.textContent = this.constants.boundingbox.y1.toString().substr(0, 6);
        this.elmY2.textContent = this.constants.boundingbox.y2.toString().substr(0, 6);

        this.elmZoomfactor.textContent = Math.ceil(1 / this.constants.boundingbox.dimensions.w).toLocaleString();
    }// showBoundingBoxInfo()

    /**
     * Calculates and draws the Mandelbrot fractal based on the supplied constants. First all the pixels are calculated storing
     * only the iterations. The colors are drawn from the palette and pushed into a ImageData in a separate function.
     * This way the palette can be cycled using the calculations stored in another array! This saves a lot of time when
     * changing the palette and can yield some very nice animations when using a slider!
     * @param {ConstantsWithPixels} localConst
     * @returns {number}
     */
    draw(localConst) {
        var time_start = Date.now();

        const pixels = localConst.pixels;
        const hasFeedback = localConst.hasFeedbackElement();
        // (CX, CY) represents the constant (as a complex number) used in the Mandelbrot calculations
        for (var cx = localConst.boundingbox.x1; cx < localConst.boundingbox.x2; cx += localConst.one_pixel_x) {
            for (var cy = localConst.boundingbox.y1; cy > localConst.boundingbox.y2; cy -= localConst.one_pixel_y) {

                let px = Math.round((Math.abs(cx - localConst.boundingbox.x1) / localConst.boundingbox.dimensions.w) * localConst.canvas_dimensions.w);
                let py = Math.round((Math.abs(localConst.boundingbox.y1 - cy) / localConst.boundingbox.dimensions.h) * localConst.canvas_dimensions.h);

                let pixelpos = py * localConst.canvas_dimensions.w + px;

                pixels[pixelpos] = -1;

                if (this.calculateDistance(0, 0, cx, cy) < 2) {
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
                        let xy = this.multiply(startx, starty, startx, starty);
                        startx = xy.newx;
                        starty = xy.newy;

                        // add constant
                        startx += cx;
                        starty += cy;

                        let distance = this.calculateDistance(startx, starty, prevx, prevy);

                        prevx = startx;
                        prevy = starty;

                        isStable = (this.calculateDistance(0, 0, startx, starty) < 2);
                        hasConverged = (distance < EPSILON);

                        needsMoreIterations = (++iterations) < this.maxIterations;
                    } while (needsMoreIterations && isStable && !hasConverged) ;

                    if (isStable) {
                        iterations = -1;
                    }
                    pixels[pixelpos] = iterations;
                } // if distance OK



            } // for CY
        }// for CX

        this.redrawUsingPalette(localConst);

        var time_end = Date.now();

        return time_end - time_start;
    } // draw()

    /**
     * This will actually draw the image on the Canvas (supplied in the localConstants Object) using the already
     * available calculations in the pixels-array (also in the localConstants object). The colors are drawn from a palette.
     * This way the image can be redrawn very fast using an different palette, which can yield some nice results when
     * quickly drawing them with a small difference in palette start (creating animated vortexes!)
     * @param localConstants
     */
    redrawUsingPalette(localConstants) {

        var pixels = localConstants.pixels;
        var canvas = localConstants.canvas;
        var palette = this.palettes.getActive();

        // now put the image that is in memory only, on the canvas
        var context = canvas.getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, localConstants.canvas_dimensions.w, localConstants.canvas_dimensions.h);
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
                        color = palette.colors[pixel];
                    }
                    imageRGBValues[array_index + 0] = color.r;
                    imageRGBValues[array_index + 1] = color.g;
                    imageRGBValues[array_index + 2] = color.b;
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
     * Clears the history for both the zoom- and palette history
     */
    clearHistory(){
        this.historyZoom.Clear();
        this.historyPalette.Clear();

        this.elmZoomHistoryInfo.textContent = "0";
    }// clearHistory


    /**
     * Adds the current state to the history and redraws based on the zoomed preview bounding box.
     */
    addToHistoryAndRedraw(){
        this.historyZoom.push(this.constants.createHistoryObject());
        this.historyPalette.push(this.palettes.createHistoryObject());

        this.constants.update(this.constantsPreview.boundingbox);

        this.redrawMainFractal();

        this.elmZoomHistoryInfo.textContent = this.historyZoom.length();

        // Now recalculate the zoombox position in the new situation for immediate zoom possibility
        this.recalculateZoombox();

        this.constantsPreview.update( this.zoombox.boundingbox );
        this.draw(this.constantsPreview);
    }// addToHistoryAndRedraw()

    /**
     * Goes back one step in the history for both the zoom and palette
     */
    historyGoBack(){
        if (this.historyZoom.length() > 0) {

            let historyItem = this.historyZoom.pop();
            this.elmZoomHistoryInfo.textContent = this.historyZoom.length();

            this.constants.restoreFromHistoryObject(historyItem);
            this.constantsPreview.restoreFromHistoryObject(historyItem);

            let historyPalette = this.historyPalette.pop();
            this.palettes.restoreFromHistoryObject(historyPalette);

            let curPalet = this.palettes.getActive();
            let hslPalet = this.palettes.get("HSL");

            this.elmPaletslider.value = curPalet.offset.toString();
            this.elmPaletteHSLLightness.value = hslPalet.lightness().toString();
            this.elmPaletteHSLSaturation.value = hslPalet.saturation().toString();

            this.guiSyncPalette(this.palettes.currentName);

            this.redrawBoth();
        }
    }

    /**
     * Recalculate the dimensions of the canvas and scale the boundingbox based on the height given of drawing fractal-plane
     * @param fractal_plane_height
     */
    adjustCanvasDimensions(fractal_plane_height) {
        var ratio = this.canvasLargeMandelbrot.clientWidth / this.canvasLargeMandelbrot.clientHeight;

        const width = fractal_plane_height * ratio;
        let x1, x2, y1, y2, centerx, centery;

        centerx = 0;
        centery = 0;
        x1 = centerx - (width / 2);
        x2 = centerx + (width / 2);
        y1 = centery + (fractal_plane_height / 2);
        y2 = centery - (fractal_plane_height / 2);

        let rect = new Rectangle(x1, y1, x2, y2);

        this.constants.update(rect);
        this.constants.updateCanvas(this.canvasLargeMandelbrot);

        this.canvasPreview.height = this.canvasPreview.width / ratio;
        this.canvasExportM.height  = this.canvasExportM.width / ratio;

        this.constantsPreview.update(rect);
        this.constantsPreview.updateCanvas(this.canvasPreview);

        this.constantsExportM.update(rect);
        this.constantsExportM.updateCanvas(this.canvasExportM);

        this.svgOverlay.setAttribute("width",  this.canvasLargeMandelbrot.width);
        this.svgOverlay.setAttribute("height", this.canvasLargeMandelbrot.height);

        this.elmCanvasWidthText.textContent  = this.canvasLargeMandelbrot.width.toString();
        this.elmCanvasHeightText.textContent = this.canvasLargeMandelbrot.height.toString();

    } // adjustCanvasDimensions

    /**
     * Calculate the distance using Pyhtagoras
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {number}
     */
    calculateDistance(x1, y1, x2, y2) {
        const p1 = x1 - x2;
        const p2 = y1 - y2;

        return Math.sqrt(p1 * p1 + p2 * p2);
    }//calculateDistance

    /**
     * Multiply two points in space.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {{newy: number, newx: number}}
     */
    multiply(x1, y1, x2, y2) {
        x1 *= 1.0;
        x2 *= 1.0;
        y1 *= 1.0;
        y2 *= 1.0;
        const newReal = (x1 * x2 - y1 * y2);
        const newImaginary = (x1 * y2 + y1 * x2);

        return {newx: newReal, newy: newImaginary};
    }// multiply


}

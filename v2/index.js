/**
 * Calculating Mandelbrot-like formulas using Scalable Vector Graphics for displaying the iterations
 * Author: Martin Molema
 * Date: 8 april 2020
 * Version: 1
 *
 */

import {SolutionVisualizer} from "./modules/SolutionVisualizer.js";
import {CanvasConstants} from "./modules/CanvasConstants.js";
import {ComplexNumber} from "./modules/ComplexNumber.js";

const constants = new CanvasConstants();
constants.SVG_HEIGHT             = 800;
constants.SVG_WIDTH              = 800;
constants.SVG_ONE_UNIT           = constants.SVG_WIDTH / 4;

constants.SVG_LINE_MARKER_LENGTH = 10;

constants.EPSILON                = 0.000003;
constants.MAX_ITERATIONS         = 200;
constants.AutoAdjust();

// Create the visualiser object
const visualizer     = new SolutionVisualizer(document, constants);
visualizer.drawDots  = false;
visualizer.drawLines = true;
visualizer.start();

// install form event handlers
var cbxMandelbrot = document.getElementById("cbxMandelbrot");
cbxMandelbrot.addEventListener("change", () => {
    visualizer.drawMandelbrot = (cbxMandelbrot.checked == true) ? true : false;
});

var cbxJulia = document.getElementById("cbxJulia");
cbxJulia.addEventListener("change", () => {
    visualizer.drawJulia = (cbxJulia.checked == true) ? true : false;
});

var paletStart = document.getElementById("rngPalet");
var btnRedraw = document.getElementById("btnRedraw");
btnRedraw.addEventListener("click",() => {
    visualizer.paletStart = parseInt(paletStart.value);
    visualizer.drawMandelbrotFractal();
    visualizer.drawJuliaFractal();
});
